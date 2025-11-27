from django.http import HttpResponse

from django.template import loader
from rest_framework import viewsets, permissions, generics, parsers, status
from rest_framework.decorators import action
from rest_framework.response import Response

from courses import perms, serializers
from courses.models import Course, User
from courses.serializers import CoursesSerializer, UserSerializer

# POST http://domain/o/token/
# POST http://domain/o/revoke_token/

# Create your views here.

def index(request):
    index = loader.get_template('index.html')
    return HttpResponse(index.render())

class CourseView(viewsets.ModelViewSet):
    queryset = Course.objects.filter(active=True)
    serializer_class = CoursesSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'create':
            return [permissions.IsAuthenticated(), perms.IsLecturerVerified()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), perms.IsCourseOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]


class UserView(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        u = request.user
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                if k in ['first_name', 'last_name', 'email']:
                    setattr(u, k, v)
            u.save()

        return Response(serializers.UserSerializer(u).data, status= status.HTTP_200_OK)

    @action(methods=['patch'], url_path='grant-lecturer' ,detail=True, permission_classes=[permissions.IsAdminUser])
    def grant_lecturer(self, request, pk):
        user = self.get_object()
        user.role = User.Role.LECTURER
        user.is_lecturer_verified = True
        user.save()
        return Response ({"message": f"Đã nâng cấp {user.username} thành Giảng viên."})

