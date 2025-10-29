from django.http import HttpResponse
from django.shortcuts import render
from django.template import loader
from rest_framework import viewsets, generics, permissions
from courses import serializers
from courses.models import Category, Course, Lesson


# Create your views here.

def index(request):
    index = loader.get_template('index.html')
    return HttpResponse(index.render())

class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class CourseViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Course.objects.filter(active=True)
    serializer_class = serializers.CourseSerializer

class LessonViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Lesson.objects.all()
    serializer_class = serializers.LessonSerializer
