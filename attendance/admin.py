from django.contrib import admin
from .models import Attendance

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'date', 'status', 'created_at')
    list_filter = ('status', 'date', 'course')
    search_fields = ('student__username', 'course__name')
