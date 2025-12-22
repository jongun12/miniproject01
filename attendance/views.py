from rest_framework import viewsets, views, status, permissions
from rest_framework.response import Response
from .models import Attendance
from .serializers import AttendanceSerializer, AttendanceCheckInSerializer
from .services import verify_attendance, generate_qr_token
from courses.models import Course
from core.permissions import IsStudent, IsProfessor
from users.models import User
from rest_framework.decorators import action
from datetime import date as date_obj

class AttendanceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_student():
            return Attendance.objects.filter(student=user)
        elif user.is_professor():
            return Attendance.objects.filter(course__professor=user)
        return Attendance.objects.none()

    @action(detail=False, methods=['get'])
    def sheet(self, request):
        # /api/attendance/sheet/?course_id=1&date=2023-10-27
        course_id = request.query_params.get('course_id')
        date_str = request.query_params.get('date', str(date_obj.today()))
        
        if not course_id:
            return Response({"error": "course_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            course = Course.objects.get(id=course_id)
            if request.user.is_professor() and course.professor != request.user:
                 return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        except Course.DoesNotExist:
             return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        # 1. Get all enrolled students
        from courses.models import Enrollment
        enrollments = Enrollment.objects.filter(course=course, is_active=True).select_related('student')
        
        # 2. Get existing attendance records for this date
        attendances = Attendance.objects.filter(course=course, date=date_str)
        attendance_map = {a.student_id: a for a in attendances}
        
        # 3. Merge data
        data = []
        for enrollment in enrollments:
            student = enrollment.student
            record = attendance_map.get(student.id)
            data.append({
                "student_id": student.id,
                "student_name": student.username, # Should use full name if available
                "status": record.status if record else "NONE",
                "attendance_id": record.id if record else None
            })
            
        return Response(data)

    @action(detail=False, methods=['post'])
    def update_status(self, request):
        # { "student_id": 1, "course_id": 1, "date": "2023-10-27", "status": "PRESENT" }
        student_id = request.data.get('student_id')
        course_id = request.data.get('course_id')
        date_str = request.data.get('date', str(date_obj.today()))
        new_status = request.data.get('status')
        
        if not all([student_id, course_id, new_status]):
             return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
             
        # Permission check
        course = Course.objects.get(id=course_id)
        if request.user.is_professor() and course.professor != request.user:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
            
        student = User.objects.get(id=student_id)
        
        attendance, created = Attendance.objects.update_or_create(
            student=student, 
            course=course, 
            date=date_str,
            defaults={'status': new_status}
        )
        
        return Response({"message": "Status updated", "status": attendance.status})

    @action(detail=False, methods=['post'])
    def batch_absent(self, request):
        # Mark all students without a record as ABSENT
        course_id = request.data.get('course_id')
        date_str = request.data.get('date', str(date_obj.today()))
        
        course = Course.objects.get(id=course_id)
        if request.user.is_professor() and course.professor != request.user:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
            
        from courses.models import Enrollment
        enrollments = Enrollment.objects.filter(course=course, is_active=True)
        
        count = 0
        for enrollment in enrollments:
            student = enrollment.student
            # Use get_or_create to avoid overwriting existing PRESENT/LATE
            obj, created = Attendance.objects.get_or_create(
                student=student,
                course=course,
                date=date_str,
                defaults={'status': Attendance.Status.ABSENT}
            )
            if created:
                count += 1
                
        return Response({"message": f"{count} students marked as absent"})

class CheckInView(views.APIView):
    permission_classes = [IsStudent]
    serializer_class = AttendanceCheckInSerializer

    def post(self, request):
        serializer = AttendanceCheckInSerializer(data=request.data)
        if serializer.is_valid():
            course_id = serializer.validated_data['course_id']
            code = serializer.validated_data['code']
            lat = serializer.validated_data['lat']
            lon = serializer.validated_data['lon']
            
            try:
                course = Course.objects.get(id=course_id)
            except Course.DoesNotExist:
                return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Retrieve Course (DB lookup is needed for FK relation in Attendance)
            # Optimization: Course location is fetched via Redis inside verify_attendance
            try:
                course = Course.objects.get(id=course_id)
            except Course.DoesNotExist:
                return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Dynamic Verification
            success, message = verify_attendance(request.user, course, code, lat, lon)
            
            if success:
                return Response({"message": message}, status=status.HTTP_200_OK)
            else:
                return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GenerateQRView(views.APIView):
    permission_classes = [IsProfessor]
    
    def get(self, request, course_id):
        # Check ownership
        try:
            course = Course.objects.get(id=course_id, professor=request.user)
        except Course.DoesNotExist:
             return Response({"error": "Course not found or permission denied"}, status=status.HTTP_404_NOT_FOUND)
             
        # Generate Code
        code, secret = generate_qr_token(course_id)
        
        # Cache Course Location for O(1) Access during class
        from .services import cache_course_location
        cache_course_location(course_id)
        
        return Response({"code": code, "secret": secret, "valid_for": "30s"})

class AttendanceStatsView(views.APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        user = request.user
        # Total attendances (total classes held that expected this student)
        # Note: This logic assumes an Attendance record is created for every class.
        # If records are only created on check-in, we need a different approach (e.g. counting CourseSchedules vs Enrollment date).
        # For simplicity in this beta, we count total records vs present records.
        
        total_records = Attendance.objects.filter(student=user).count()
        present_count = Attendance.objects.filter(student=user, status=Attendance.Status.PRESENT).count()
        
        rate = 0.0
        if total_records > 0:
            rate = (present_count / total_records) * 100
            
        return Response({
            "total_classes": total_records,
            "present_classes": present_count,
            "attendance_rate": round(rate, 1)
        })
