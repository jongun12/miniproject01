from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer
from core.permissions import IsProfessor, IsStudent, IsOwnerOrReadOnly

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsProfessor()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(professor=self.request.user)

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.filter(is_active=True)
    serializer_class = EnrollmentSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user, is_active=True)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
