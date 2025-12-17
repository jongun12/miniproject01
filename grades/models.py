from django.db import models
from django.conf import settings
from courses.models import Course

class Grade(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='grades',
        limit_choices_to={'role': 'STUDENT'}
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='grades')
    
    # JSONB field for flexible criteria (Quiz, Midterm, etc.)
    # Example: {"quiz1": 10, "midterm": 80, "final": 90}
    details = models.JSONField(default=dict)
    
    final_score = models.FloatField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"Grade: {self.student} - {self.course}"
