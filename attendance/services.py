import pyotp
import redis
from haversine import haversine, Unit
from django.conf import settings
from datetime import datetime
from .models import Attendance

# Redis connection
r = redis.Redis.from_url(settings.CELERY_BROKER_URL)

def generate_qr_token(course_id):
    """
    Generates a generic TOTP secret for the course or retrieves existing.
    In a real app, this might be dynamic. 
    Here we use a secret derived from course_id + date.
    """
    secret_key = f"COURSE_{course_id}_{datetime.now().strftime('%Y%m%d')}"
    # Ensure key is base32 compatible or just use a stable secret mapping
    # For simplicity, we create a random secret if not exists in Redis for this session
    
    # Store/Get a robust secret for this course session
    key = f"attendance_secret:{course_id}"
    secret = r.get(key)
    if not secret:
        secret = pyotp.random_base32()
        r.setex(key, 3600 * 4, secret) # Valid for 4 hours
    else:
        secret = secret.decode('utf-8')
        
    totp = pyotp.TOTP(secret, interval=30)
    return totp.now(), secret

def verify_attendance(student, course, code, lat, lon, course_lat, course_lon):
    """
    Verifies attendance based on TOTP code and Geofencing (50m radius).
    """
    # 1. Verify TOTP
    key = f"attendance_secret:{course.id}"
    secret = r.get(key)
    if not secret:
        return False, "Attendance session not active."
    
    secret = secret.decode('utf-8')
    totp = pyotp.TOTP(secret, interval=30)
    
    if not totp.verify(code):
        return False, "Invalid or expired QR code."

    # 2. Verify Location (Geofencing)
    student_loc = (float(lat), float(lon))
    course_loc = (float(course_lat), float(course_lon))
    
    distance = haversine(student_loc, course_loc, unit=Unit.METERS)
    
    if distance > 50:
        return False, f"Location verification failed. Distance: {distance:.2f}m"

    # 3. Mark Attendance
    Attendance.objects.create(
        student=student,
        course=course,
        date=datetime.now().date(),
        status=Attendance.Status.PRESENT
    )
    
    return True, "Attendance valid."
