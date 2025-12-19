from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceViewSet, CheckInView, GenerateQRView

router = DefaultRouter()
router.register(r'attendance', AttendanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('attendance/check-in/', CheckInView.as_view(), name='check-in'),
    path('attendance/generate-qr/<int:course_id>/', GenerateQRView.as_view(), name='generate-qr'),
]
