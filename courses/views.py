from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer
from core.permissions import IsProfessor, IsStudent, IsOwnerOrReadOnly, IsAdmin, IsCourseOwner

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAdmin()]
        if self.action in ['update', 'partial_update']:
            return [IsAdmin() | (IsProfessor() & IsCourseOwner())]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        # Admin creates the course. Assign Admin as professor by default to satisfy DB constraint.
        # Future improvement: Allow Admin to select a professor from a list.
        serializer.save(professor=self.request.user)

    def perform_update(self, serializer):
        user = self.request.user
        if user.is_professor() and not user.is_admin():
            # Professors cannot change location/radius
            if any(field in self.request.data for field in ['latitude', 'longitude', 'allowed_radius']):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("교수는 강의실 위치나 반경을 변경할 수 없습니다. 관리자에게 문의하세요.")
        serializer.save()

    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            return Course.objects.all()
        if user.is_professor():
            return Course.objects.filter(professor=user)
        if user.is_student():
            return Course.objects.filter(enrollments__student=user)
        return Course.objects.none()

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.filter(is_active=True)
    serializer_class = EnrollmentSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user, is_active=True)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
