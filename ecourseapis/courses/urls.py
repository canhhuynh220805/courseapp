


from django.contrib import admin
from django.db import router
from django.urls import path, include
from rest_framework import routers
from courses import views

router = routers.DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls))
]