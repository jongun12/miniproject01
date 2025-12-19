from rest_framework import serializers
from .models import Course, Enrollment, CourseSchedule

class CourseScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseSchedule
        fields = ['day_of_week', 'start_time', 'end_time']

class CourseSerializer(serializers.ModelSerializer):
    schedules = CourseScheduleSerializer(many=True, required=False)
    professor_name = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'name', 'code', 'professor', 'professor_name', 'latitude', 'longitude', 'allowed_radius', 'schedules', 'created_at']
        read_only_fields = ('professor', 'created_at')

    def get_professor_name(self, obj):
        try:
            return obj.professor.username if obj.professor else "Unknown"
        except Exception:
            return "Unknown"

    def create(self, validated_data):
        schedules_data = validated_data.pop('schedules', [])
        course = Course.objects.create(**validated_data)
        for schedule_data in schedules_data:
            CourseSchedule.objects.create(course=course, **schedule_data)
        return course

class EnrollmentSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ('student', 'enrolled_at')
