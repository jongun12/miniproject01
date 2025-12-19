from rest_framework import permissions

class IsProfessor(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_professor())

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin())

class IsCourseOwner(permissions.BasePermission):
    """
    Custom permission to only allow professors to edit their own courses.
    """
    def has_object_permission(self, request, view, obj):
        # Admin has full access
        if request.user.is_admin():
            return True
        # Professor must match the course professor
        return obj.professor == request.user

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_student())

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model instance has an `owner` attribute or `student` attribute.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Check for 'student' or 'professor' or 'user' field
        user_field = getattr(obj, 'student', getattr(obj, 'professor', getattr(obj, 'user', None)))
        return user_field == request.user
