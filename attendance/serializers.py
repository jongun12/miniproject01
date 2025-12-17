from rest_framework import serializers
from .models import Attendance

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    
    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ('student', 'date', 'status')

class AttendanceCheckInSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    code = serializers.CharField(max_length=6)
    lat = serializers.FloatField()
    lon = serializers.FloatField()
