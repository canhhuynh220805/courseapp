


from django.contrib import admin
from django.db import router
from django.urls import path, include
from rest_framework import routers
from courses import views

router = routers.DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='category')
router.register('courses', views.CourseViewSet, basename='course')
router.register('lessons', views.LessonViewSet, basename='lesson')
router.register('users', views.UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls))
]