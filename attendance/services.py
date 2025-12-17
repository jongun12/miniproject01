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

def verify_attendance(student, course, code, lat, lon):
    """
    Verifies attendance based on TOTP code and Geofencing (50m radius).
    """
    # Retrieve secret
    key = f"attendance_secret:{course.id}"
    secret = r.get(key)
    if not secret:
        return False, "Attendance session not active."
    
    secret = secret.decode('utf-8')
    totp = pyotp.TOTP(secret, interval=30)
    
    if not totp.verify(code):
        return False, "Invalid or expired QR code."

    # 2. Verify Location (Geofencing)
    # Optimization: Helper to get location from Redis or DB
    target_lat, target_lon, allowed_radius = get_course_location(course.id)
    
    if target_lat is None or target_lon is None:
         # Fallback if course has no location set (Optional: allow or fail)
         # For strict attendance, we might fail.
         # For now, if no location, maybe skip verify? Or fail.
         return False, "Course location not configured."

    student_loc = (float(lat), float(lon))
    course_loc = (float(target_lat), float(target_lon))
    
    distance = haversine(student_loc, course_loc, unit=Unit.METERS)
    
    if distance > allowed_radius:
        return False, f"Location verification failed. Distance: {distance:.2f}m (Allowed: {allowed_radius}m)"

    # 3. Mark Attendance
    Attendance.objects.create(
        student=student,
        course=course,
        date=datetime.now().date(),
        status=Attendance.Status.PRESENT
    )
    
    return True, "Attendance valid."

def cache_course_location(course_id):
    """
    Caches course location in Redis for 1 hour.
    O(1) access during attendance burst.
    """
    from courses.models import Course
    try:
        course = Course.objects.get(id=course_id)
        if course.latitude and course.longitude:
            # Store as hash or simple string. JSON is easy.
            import json
            data = {
                'lat': course.latitude,
                'lon': course.longitude,
                'radius': course.allowed_radius
            }
            r.setex(f"course_loc:{course_id}", 3600, json.dumps(data))
    except Course.DoesNotExist:
        pass

def get_course_location(course_id):
    """
    Returns (lat, lon, radius).
    Tries Redis first, then DB.
    """
    import json
    # 1. Try Redis
    data = r.get(f"course_loc:{course_id}")
    if data:
        d = json.loads(data)
        return d['lat'], d['lon'], d['radius']
    
    # 2. Fallback to DB
    from courses.models import Course
    try:
        course = Course.objects.get(id=course_id)
        if course.latitude and course.longitude:
            # Cache it now for future
            cache_course_location(course_id)
            return course.latitude, course.longitude, course.allowed_radius
    except Course.DoesNotExist:
        pass
        
    return None, None, 50
