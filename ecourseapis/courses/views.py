from django.http import HttpResponse
from django.shortcuts import render
from django.template import loader


# Create your views here.

def index(request):
    index = loader.get_template('index.html')
    return HttpResponse(index.render())