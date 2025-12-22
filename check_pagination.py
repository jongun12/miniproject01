import os
import django
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from courses.views import CourseViewSet
from users.models import User

# Get admin user
user = User.objects.filter(role='ADMIN').first()
factory = APIRequestFactory()
view = CourseViewSet.as_view({'get': 'list'})

request = factory.get('/api/courses/')
force_authenticate(request, user=user)
response = view(request)

print("Status Code:", response.status_code)
print("Data Type:", type(response.data))
if isinstance(response.data, dict) and 'results' in response.data:
    print("Pagination DETECTED!")
    print("Keys:", response.data.keys())
    print("First Item:", response.data['results'][0] if response.data['results'] else "Empty")
else:
    print("No Pagination - Direct List")
    print("First Item:", response.data[0] if response.data else "Empty")
