import os
import django
from rest_framework.renderers import JSONRenderer

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from courses.models import Course, CourseSchedule
from courses.serializers import CourseSerializer
from users.models import User

# Check if any schedules exist
print(f"Total Schedules in DB: {CourseSchedule.objects.count()}")

# Create a test course and schedule if none exist
if CourseSchedule.objects.count() == 0:
    print("Creating dummy data...")
    admin = User.objects.filter(role='ADMIN').first()
    if not admin:
        admin = User.objects.create_superuser('admin', 'admin@example.com', 'pass')
    
    course = Course.objects.create(name="Test Course", code="TEST101", professor=admin, latitude=0, longitude=0, allowed_radius=50)
    CourseSchedule.objects.create(course=course, day_of_week=0, start_time="09:00", end_time="10:30")
    print("Created Test Course and Schedule.")

# Serialize
courses = Course.objects.all()
serializer = CourseSerializer(courses, many=True)
import json
print(json.dumps(serializer.data, indent=2))
