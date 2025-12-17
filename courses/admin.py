from django.contrib import admin
from .models import Course, Enrollment

class ActiveOnlyManager:
    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_active=True)

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'professor', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'code')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'is_active', 'enrolled_at')
    list_filter = ('is_active',)
