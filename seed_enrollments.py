import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from courses.models import Course, Enrollment

def seed_enrollments():
    print("Seeding enrollments...")
    
    # Get or Create Students
    students = []
    for i in range(1, 6):
        username = f'student{i}'
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': f'{username}@example.com',
                'role': 'STUDENT'
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            print(f"Created student: {username}")
        students.append(user)

    # Get Courses
    courses = Course.objects.all()
    if not courses.exists():
        print("No courses found. Creating a test course.")
        professor = User.objects.filter(role='PROFESSOR').first()
        if not professor:
             # Create a professor if none exists
             professor = User.objects.create_user(username='professor1', password='password123', role='PROFESSOR')
        
        course = Course.objects.create(
            name='Introduction to AI',
            code='CS101',
            professor=professor,
            description='AI Fundamentals'
        )
        courses = [course]

    # Enroll Students
    count = 0
    for course in courses:
        for student in students:
            # Randomly skip some enrollments to vary data
            obj, created = Enrollment.objects.get_or_create(
                student=student, 
                course=course
            )
            if created:
                count += 1
                print(f"Enrolled {student.username} in {course.name}")
    
    print(f"Successfully created {count} new enrollments.")

if __name__ == '__main__':
    seed_enrollments()
