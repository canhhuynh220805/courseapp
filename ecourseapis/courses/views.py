from django.http import HttpResponse
from django.shortcuts import render
from django.template import loader
from rest_framework import viewsets, generics, permissions, status, parsers
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response

from courses import serializers, paginators
from courses.models import Category, Course, Lesson, User, Comment


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

    pagination_class = paginators.CoursePaginator

    def get_queryset(self):
        query = self.queryset

        q = self.request.query_params.get('q')

        if q:
            query = query.filter(subject__icontains=q)

        cate_id = self.request.query_params.get('category_id')

        if cate_id:
            query = query.filter(category_id=cate_id)

        return query

    @action(methods=['get'], url_path='lessons', detail=True)
    def get_lessons(self, request, pk):
        lessons = self.get_object().lesson_set.filter(active=True)
        return Response(serializers.LessonSerializer(lessons, many=True).data, status=status.HTTP_200_OK)




class LessonViewSet(viewsets.ViewSet, generics.RetrieveAPIView):
    queryset = Lesson.objects.prefetch_related('tags').filter(active=True)
    serializer_class = serializers.LessonDetailsSerializer

    def get_permissions(self):
        if self.action.__eq__('get_comments') and self.request.method.__eq__("POST"):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(methods=['get', 'post'], url_path='comments', detail=True)
    def get_comments(self, request, pk):
        if request.method.__eq__('POST'):
            c = Comment.objects.create(content=request.data.get('content'), user=request.user, lesson=self.get_object())
            return Response(serializers.CommentSerializer(c).data, status=status.HTTP_201_CREATED)
        comments = self.get_object().comment_set.select_related('user').filter(active=True)
        return Response(serializers.CommentSerializer(comments, many=True).data, status=status.HTTP_200_OK)

class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=['get', 'patch'], url_path="current-user", detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        u = request.user
        if request.method.__eq__('PATCH'):

            for k, v in request.data.items():
                if k in ['first_name','last_name','email']:
                    setattr(u, k, v)

            u.save()

        return Response(serializers.UserSerializer(u).data, status=status.HTTP_200_OK)

class CommentViewSet(viewsets.ViewSet, generics.UpdateAPIView):
    queryset = Comment.objects.all()
    serializer_class = serializers.CommentSerializer

