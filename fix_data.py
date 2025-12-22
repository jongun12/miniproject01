import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from users.models import User
from courses.models import Course, Enrollment

student = User.objects.filter(role='STUDENT').first()
professor = User.objects.filter(role='PROFESSOR').first()
admin = User.objects.filter(is_superuser=True).first()

if not student:
    print("No student found. Creating one.")
    student = User.objects.create_user(username='student1', password='password123', role='STUDENT')

if not professor:
    print("No professor found. Creating one.")
    professor = User.objects.create_user(username='professor1', password='password123', role='PROFESSOR')

courses = Course.objects.all()
if courses.count() == 0:
    print("No courses found. Run debug_schedule.py first.")
else:
    print(f"Found {courses.count()} courses.")
    
    # 1. Assign some courses to the professor
    for course in courses[:2]:
        course.professor = professor
        course.save()
        print(f"Assigned '{course.name}' to {professor.username}")

    # 2. Enroll student in all courses
    for course in courses:
        Enrollment.objects.get_or_create(student=student, course=course)
        print(f"Enrolled {student.username} in {course.name}")
