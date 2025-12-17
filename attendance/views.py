from rest_framework import viewsets, views, status, permissions
from rest_framework.response import Response
from .models import Attendance
from .serializers import AttendanceSerializer, AttendanceCheckInSerializer
from .services import verify_attendance, generate_qr_token
from courses.models import Course
from core.permissions import IsStudent, IsProfessor

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
