from django.http import HttpResponse

from django.template import loader
from rest_framework import viewsets, permissions, generics, parsers, status
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response

from courses import perms, serializers
from courses.models import Course, User, Enrollment, Lesson, LessonComplete
from courses.serializers import CoursesSerializer, UserSerializer, EnrollmentSerializer, LessonSerializer


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

    @action(methods=['post'], url_path='enroll', detail=True, permission_classes= [permissions.IsAuthenticated])
    def enroll(self, request, pk = None):
        course = self.get_object()
        user = request.user

        enrollment, created = Enrollment.objects.get_or_create(user=user, course=course)

        if not created:
            return Response({
                "message": "Bạn đã đăng ký khóa học này rồi.",
                "status": enrollment.status,
                "enrollment_id": enrollment.id
            }, status=status.HTTP_409_CONFLICT)

        if course.price and course.price > 0:
            enrollment.status = Enrollment.Status.PENDING
        else:
            enrollment.status = Enrollment.Status.ACTIVE

        enrollment.save()
        return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED)

    @action(methods=['get'], url_path='my-course', detail= False, permission_classes = [permissions.IsAuthenticated])
    def get_my_course(self, request):
        user = request.user
        enrollments = Enrollment.objects.filter(user = user)
        return Response(EnrollmentSerializer(enrollments, many=True).data)

    @action(methods=['get'], url_path='progress', detail=True, permission_classes=[permissions.IsAuthenticated])
    def get_course_progress(self, request, pk=None):
        user = request.user
        course = self.get_object()

        enrollment = Enrollment.objects.filter(user=user, course=course).first()

        if enrollment:
            return Response({
                "course_id": course.id,
                "progress": enrollment.progress,
                "status": enrollment.status,
                "message": "Lấy tiến độ thành công"
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Bạn chưa đăng ký khóa học này."}, status=status.HTTP_404_NOT_FOUND)

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

# class EnrollmentView(viewsets.ViewSet, generics.CreateAPIView):
#     serializer_class = EnrollmentSerializer
#     permission_classes = [permissions.IsAuthenticated]
#
#     def get_queryset(self):
#         return Enrollment.objects.filter(user = self.request.user)
#
#     @action(methods=['patch'], url_path='progress', detail=True)
#     def update_progress(self, request, pk):
#         enrollment = self.get_object()

class LessonView(viewsets.ViewSet, generics.CreateAPIView):
    queryset = Lesson.objects.filter(active = True)
    serializer_class = LessonSerializer

    @action(methods=['post'], detail=True, url_path='complete', permission_classes = [permissions.IsAuthenticated])
    def mark_complete(self, request, pk):
        lesson = self.get_object()
        user = request.user

        enrollment = Enrollment.objects.filter(user=user, course=lesson.course, status=Enrollment.Status.ACTIVE).first()
        if enrollment is None:
            return Response({"error": "Bạn chưa đăng ký khóa học này."}, status=status.HTTP_403_FORBIDDEN)

        LessonComplete.objects.get_or_create(user = user, lesson = lesson, enrollment = enrollment)
        total_lessons = Lesson.objects.filter(course = lesson.course, active = True).count()
        completed_lessons = LessonComplete.objects.filter(enrollment = enrollment).count()

        if total_lessons > 0:
            new_progress = int((completed_lessons / total_lessons) * 100)
            enrollment.progress = new_progress
            enrollment.save()

        return Response({
            "message": "Đã hoàn thành bài học.",
            "progress": enrollment.progress,
            "completed_lessons_count": completed_lessons,
            "total_lessons": total_lessons
        }, status=status.HTTP_200_OK)

