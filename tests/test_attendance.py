import pytest
import pyotp
from django.contrib.auth import get_user_model
from courses.models import Course, Enrollment
from attendance.models import Attendance
from attendance.services import verify_attendance, generate_qr_token
from unittest.mock import patch, MagicMock

User = get_user_model()

@pytest.mark.django_db
def test_attendance_logic():
    # Setup
    prof = User.objects.create_user(username='prof', role=User.Role.PROFESSOR)
    student = User.objects.create_user(username='student', role=User.Role.STUDENT)
    
    course = Course.objects.create(name="Math", code="MATH101", professor=prof)
    Enrollment.objects.create(student=student, course=course)
    
    # Generate Token
    # Mock Redis to avoid calling real Redis in unit tests if possible, 
    # but we will just mock the 'r.get' and 'r.setex' in services.
    # For now, let's assume Redis is not available and mock the service dependencies 
    # OR we use the real redis if running in environment where redis is up (GitHub Actions does).
    # Here, for stability, I will mock redis calls.
    
    with patch('attendance.services.r') as mock_redis:
        mock_redis.get.return_value = None # First call returns None
        
        # Verify Token Generation
        # We need to mock setex to do nothing
        mock_redis.setex = MagicMock()
        
        code, secret = generate_qr_token(course.id)
        assert code is not None
        assert secret is not None
        
        # Mock Redis get to return the secret now
        mock_redis.get.return_value = secret.encode('utf-8')
        
        # Verify Attendance (Successful)
        # Assuming course location (0,0) and student location (0,0) -> 0 distance
        success, msg = verify_attendance(student, course, code, 0, 0, 0, 0)
        assert success is True
        assert Attendance.objects.filter(student=student, course=course).exists()

        # Verify Attendance (Geo Fail)
        # Distance > 50m (approx 0.001 deg lat is ~111m)
        success, msg = verify_attendance(student, course, code, 0.001, 0, 0, 0)
        assert success is False
        assert "Location verification failed" in msg
