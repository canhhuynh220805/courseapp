


from django.contrib import admin
from django.db import router
from django.urls import path, include
from rest_framework import routers
from courses import views

router = routers.DefaultRouter()
router.register('courses', views.CourseView)
router.register('users', views.UserView)

urlpatterns = [
    path('', include(router.urls))
]