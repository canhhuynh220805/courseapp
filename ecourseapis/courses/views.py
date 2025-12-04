from django.db.models import Count, Q, Sum
from django.db.models.functions import Coalesce, TruncYear, TruncMonth
from django.http import HttpResponse

from django.template import loader
from rest_framework import viewsets, permissions, generics, parsers, status
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response

from courses import perms, serializers, paginators
from courses.models import Course, User, Enrollment, Lesson, LessonComplete, Category, Payment
from courses.serializers import CoursesSerializer, UserSerializer, EnrollmentSerializer, LessonSerializer, \
    CategorySerializer, CourseRevenueSerializer


# POST http://domain/o/token/
# POST http://domain/o/revoke_token/

# Create your views here.

def index(request):
    index = loader.get_template('index.html')
    return HttpResponse(index.render())

class CategoryView(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    # permission_classes = [permissions.IsAuthenticated]

class CourseView(viewsets.ModelViewSet):
    queryset = Course.objects.filter(active=True)
    serializer_class = CoursesSerializer
    pagination_class = paginators.CoursePaginator
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


class StatView(viewsets.ViewSet):
    permission_classes = [perms.IsAdminOrLecturer]

    @action(methods=['get'], detail=False, url_path='course-stats')
    def course_stats(self, request):
        user = request.user
        if user.role == User.Role.ADMIN:
            queryset = Course.objects.all()
        else:
            queryset = Course.objects.filter(lecturer=user)

        queryset = queryset.annotate(
            student_count=Count('enrollments', filter=Q(enrollments__status=Enrollment.Status.ACTIVE)),
            total_revenue=Coalesce(Sum('enrollments__payments__amount'),0)).order_by('-total_revenue')

        serializer = CourseRevenueSerializer(queryset, many=True, context={'request': request})

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['get'], detail=False, url_path='revenue-stats')
    def revenue_stats(self, request):
        user = request.user
        period = request.query_params.get('period', 'month')

        payments = Payment.objects.filter(enrollment__course__active=True)

        if user.role == User.Role.LECTURER:
            payments = payments.filter(enrollment__course__lecturer=user)
        trunc_func = TruncYear('created_date') if period == 'year' else TruncMonth('created_date')

        stats = payments.annotate(period_date=trunc_func).values('period_date').annotate(total_revenue=Sum('amount')).order_by('period_date')

        data = [{
            'period': s['period_date'].strftime('%Y' if period == 'year' else '%m-%Y'),
            'total_revenue': s['total_revenue']
        } for s in stats]
        return Response(data, status=status.HTTP_200_OK)

    @action(methods=['get'], detail=False, url_path='general-stats')
    def general_stats(self, request):
        user = request.user

        course_qs = Course.objects.filter(active=True)
        enrollment_qs = Enrollment.objects.filter(status=Enrollment.Status.ACTIVE)
        payment_qs = Payment.objects.all()

        total_students = 0
        total_revenue = 0

        if user.role == User.Role.LECTURER:
            course_qs = course_qs.filter(lecturer=user)
            total_students = enrollment_qs.filter(course__lecturer=user).values('user').distinct().count()
            total_revenue = payment_qs.filter(enrollment__course__lecturer=user).aggregate(sum=Sum('amount'))['sum'] or 0

        elif user.role == User.Role.ADMIN:
            total_students = User.objects.filter(role=User.Role.STUDENT, is_active=True).count()
            total_revenue = payment_qs.aggregate(sum=Sum('amount'))['sum'] or 0

        total_courses = course_qs.count()

        return Response({
            "total_courses": total_courses,
            "total_students": total_students,
            "total_revenue": total_revenue
        }, status=status.HTTP_200_OK)

