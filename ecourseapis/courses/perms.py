from rest_framework import permissions
from rest_framework.permissions import BasePermission

from courses.models import User


class IsLecturerVerified(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.LECTURER
            and request.user.is_lecturer_verified
        )

class IsCourseOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == User.Role.ADMIN:
            return True
        return obj.lecturer == request.user

class IsAdminOrLecturer(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == User.Role.ADMIN:
            return True
        if request.user.role == User.Role.LECTURER and getattr(request.user, 'is_lecturer_verified', False):
            return True

        return False

class IsOwnerAuthenticated(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view) and request.user == obj.user