from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', 'Student'
        PROFESSOR = 'PROFESSOR', 'Professor'
        ADMIN = 'ADMIN', 'Admin'
    
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)

    def is_professor(self):
        return self.role == self.Role.PROFESSOR

    def is_student(self):
        return self.role == self.Role.STUDENT

    def is_admin(self):
        return self.role == self.Role.ADMIN
