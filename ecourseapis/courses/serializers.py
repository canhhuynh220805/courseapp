from rest_framework import serializers

from courses.models import Category, Course, Lesson


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    lessons = 'LessonSerializer(many=True)'
    class Meta:
        model = Course
        fields = ['id', 'subject', 'created_date', 'category', 'lessons']

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'subject', 'content' ,'image', 'course']