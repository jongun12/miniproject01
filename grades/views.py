from rest_framework import viewsets, decorators, status
from rest_framework.response import Response
from rest_framework import permissions
from .models import Grade
from .serializers import GradeSerializer
from .services import calculate_course_statistics
from core.permissions import IsProfessor, IsStudent
from courses.models import Course

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsProfessor()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_student():
            return Grade.objects.filter(student=user)
        elif user.is_professor():
            return Grade.objects.filter(course__professor=user)
        return Grade.objects.none()

    @decorators.action(detail=False, methods=['get'], url_path='course-stats/(?P<course_id>\d+)')
    def course_stats(self, request, course_id=None):
        # Verify permission
        if not Course.objects.filter(id=course_id, professor=request.user).exists():
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
            
        stats = calculate_course_statistics(course_id)
        if stats:
            return Response(stats)
        return Response({"error": "No data found"}, status=status.HTTP_404_NOT_FOUND)
