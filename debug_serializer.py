import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from courses.models import Course, CourseSchedule
from courses.serializers import CourseSerializer

print("--- Starting ViewSet Debug ---")

try:
    from courses.views import CourseViewSet
    from rest_framework.test import APIRequestFactory, force_authenticate
    
    factory = APIRequestFactory()
    view = CourseViewSet.as_view({'get': 'list'})
    
    # 1. Test as Admin
    print("\n[Test] Calling list() as Admin...")
    # Ensure admin exists
    admin_user, _ = User.objects.get_or_create(username='debug_admin', role='ADMIN')
    
    request = factory.get('/api/courses/')
    force_authenticate(request, user=admin_user)
    
    try:
        response = view(request)
        print(f"Response Status: {response.status_code}")
        if response.status_code != 200:
             print(f"Response Body: {response.data}")
        else:
             print("Success (Admin)")
    except Exception as e:
        print(f"CRASH (Admin): {e}")
        import traceback
        traceback.print_exc()

    # 2. Test as Professor
    print("\n[Test] Calling list() as Professor...")
    prof_user, _ = User.objects.get_or_create(username='debug_prof', role='PROFESSOR')
    request = factory.get('/api/courses/')
    force_authenticate(request, user=prof_user)
    
    try:
        response = view(request)
        print(f"Response Status: {response.status_code}")
    except Exception as e:
        print(f"CRASH (Professor): {e}")
        import traceback
        traceback.print_exc()

    print("\n--- ViewSet Debug Complete ---")

except Exception as e:
    print(f"--- FATAL ERROR: {e} ---")
    import traceback
    traceback.print_exc()
