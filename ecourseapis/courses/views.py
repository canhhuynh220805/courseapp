from django.http import HttpResponse
from django.shortcuts import render
from django.template import loader
from rest_framework import viewsets
from courses import serializers
from courses.models import Category


# Create your views here.

def index(request):
    index = loader.get_template('index.html')
    return HttpResponse(index.render())

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer