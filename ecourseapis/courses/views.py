from django.db.models import DecimalField, Count, Q, Sum
from django.db.models.functions import Coalesce, TruncYear, TruncMonth, TruncQuarter
from django.http import HttpResponse
import json, hmac, hashlib, uuid, requests
from django.template import loader
from rest_framework import viewsets, permissions, generics, parsers, status
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response
from ecourseapis.settings import MOMO_CONFIG, ZALO_CONFIG
from courses import perms, serializers, paginators
from courses.models import Course, User, Enrollment, Lesson, LessonComplete, Category, Payment, Comment, Like
from courses.serializers import CoursesSerializer, UserSerializer, EnrollmentSerializer, LessonSerializer, \
    CategorySerializer, CourseRevenueSerializer, StudentEnrollmentSerializer, CommentSerializer
import time
from datetime import datetime, timedelta


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

    def get_queryset(self):
        queries = self.queryset
        user = self.request.user
        if user.is_authenticated and user.role == User.Role.LECTURER:
            queries = Course.objects.filter(lecturer=user)
        else:
            queries = Course.objects.filter(active=True)
        q = self.request.query_params.get("q")
        if q:
            queries = queries.filter(Q(subject__icontains=q) | Q(lecturer__username__icontains=q))

        category_id = self.request.query_params.get("category_id")
        if category_id:
            queries = queries.filter(category_id=category_id)

        min_price = self.request.query_params.get("min_price")
        if min_price:
            queries = queries.filter(price__gte=min_price)

        max_price = self.request.query_params.get("max_price")
        if max_price:
            queries = queries.filter(price__lte=max_price)

        ordering = self.request.query_params.get("ordering")
        if ordering in ['subject', 'price', '-subject', '-price']:
            queries = queries.order_by(ordering)
        else:
            queries = queries.order_by('-id')
        return queries

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'get_lessons']:
            return [permissions.AllowAny()]
        if self.action == 'create':
            return [permissions.IsAuthenticated(), perms.IsLecturerVerified()]
        if self.action in ['update', 'partial_update', 'destroy', 'get_students']:
            return [permissions.IsAuthenticated(), perms.IsCourseOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    @action(methods=['get'], detail=False, url_path='compare')
    def compare(self, request):
        ids = request.query_params.get('ids')
        if not ids:
            return Response({"error": "Vui lòng cung cấp danh sách ID"}, status=status.HTTP_400_BAD_REQUEST)

        course_ids = [int(pk) for pk in ids.split(',')]
        courses = Course.objects.filter(id__in=course_ids, active=True)
        return Response(serializers.CourseCompareSerializer(courses, many=True).data)

    @action(methods=['post'], detail=True, url_path='enroll', permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        enrollment, created = Enrollment.objects.get_or_create(user=request.user, course=course)
        if not created:
            return Response({"message": "Đã đăng ký rồi."}, status=status.HTTP_409_CONFLICT)

        enrollment.status = Enrollment.Status.ACTIVE if not course.price or course.price == 0 else Enrollment.Status.PENDING
        enrollment.save()
        return Response(serializers.EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED)

    @action(methods=['get'], url_path='my-course', detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_my_course(self, request):
        user = request.user
        enrollments = Enrollment.objects.filter(user=user, status=Enrollment.Status.ACTIVE)
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

    @action(methods=['get'], url_path='students', detail=True)
    def get_students(self, request, pk=None):
        course = self.get_object()

        enrollments = Enrollment.objects.filter(course=course)

        username = request.query_params.get('q')
        if username:
            enrollments = enrollments.filter(user__username__icontains=username)

        serializer = StudentEnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['get'], url_path='lessons', detail=True)
    def get_lessons(self, request, pk):
        course = self.get_object()
        lessons = course.lesson_set.filter(active=True)
        is_enrolled = False
        if request.user.is_authenticated:
            is_enrolled = Enrollment.objects.filter(user=request.user, course=course,
                                                    status=Enrollment.Status.ACTIVE).exists()

        if course.price == 0 or is_enrolled:
            serializer = serializers.LessonDetailsSerializer(lessons, many=True, context={'request': request})
        else:
            serializer = serializers.LessonSerializer(lessons, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        serializer.save(lecturer=self.request.user)


class UserView(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    # parser_classes = [parsers.MultiPartParser]
    pagination_class = paginators.UserPaginator

    def get_queryset(self):
        queries = self.queryset

        role = self.request.query_params.get('role')
        if role:
            queries = queries.filter(role=role)

        q = self.request.query_params.get('q')
        if q:
            queries = queries.filter(Q(username__icontains=q) | Q(first_name__icontains=q) | Q(last_name__icontains=q))
        return queries

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False,
            permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        u = request.user
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                if k in ['first_name', 'last_name', 'email']:
                    setattr(u, k, v)
            u.save()

        return Response(serializers.UserSerializer(u).data, status=status.HTTP_200_OK)

    @action(methods=['patch'], url_path='grant-lecturer', detail=True, permission_classes=[permissions.IsAdminUser])
    def grant_lecturer(self, request, pk):
        user = self.get_object()
        user.role = User.Role.LECTURER
        user.is_lecturer_verified = True
        user.save()
        return Response({"message": f"Đã nâng cấp {user.username} thành Giảng viên."})

    @action(methods=['get'], url_path='chat-contacts', detail=False, permission_classes=[permissions.IsAuthenticated])
    def chat_contacts(self, request):
        user = request.user
        if user.role == User.Role.STUDENT:
            lecturers = User.objects.filter(courses__enrollments__user=user,
                                            courses__enrollments__status=Enrollment.Status.ACTIVE).distinct()
            return Response(serializers.UserSerializer(lecturers, many=True).data)

        elif user.role == User.Role.LECTURER:
            students = User.objects.filter(enrollments__course__lecturer=user,
                                           enrollments__status=Enrollment.Status.ACTIVE).distinct()
            return Response(serializers.UserSerializer(students, many=True).data)

        elif user.role == User.Role.ADMIN:
            lecturers = User.objects.filter(role=User.Role.LECTURER, is_active=True)
            return Response(serializers.UserSerializer(lecturers, many=True).data)

        return Response([])


class LessonView(viewsets.ViewSet, generics.CreateAPIView, generics.RetrieveAPIView, generics.DestroyAPIView,
                 generics.UpdateAPIView):
    queryset = Lesson.objects.filter(active=True)
    serializer_class = serializers.LessonDetailsSerializer

    def get_permissions(self):
        if self.action in ['retrieve', 'get_comments']:
            return [permissions.AllowAny()]
        if self.action == 'create':
            return [permissions.IsAuthenticated(), perms.IsLecturerVerified()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), perms.IsCourseOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    @action(methods=['post'], detail=True, url_path='complete', permission_classes=[permissions.IsAuthenticated])
    def mark_complete(self, request, pk):
        lesson = self.get_object()
        user = request.user

        enrollment = Enrollment.objects.filter(user=user, course=lesson.course, status=Enrollment.Status.ACTIVE).first()
        if enrollment is None:
            return Response({"error": "Bạn chưa đăng ký khóa học này."}, status=status.HTTP_403_FORBIDDEN)

        LessonComplete.objects.get_or_create(user=user, lesson=lesson, enrollment=enrollment)
        total_lessons = Lesson.objects.filter(course=lesson.course, active=True).count()
        completed_lessons = LessonComplete.objects.filter(enrollment=enrollment).count()

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

    @action(methods=['get'], detail=True, url_path='comments')
    def get_comments(self, request, pk=None):
        comments = self.get_object().comment_set.select_related('user').filter(active=True).order_by('-created_date')
        return Response(serializers.CommentSerializer(comments, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='add-comment')
    def add_comment(self, request, pk=None):
        content = request.data.get('content')
        if not content:
            return Response({"error": "Nội dung không được để trống"}, status=status.HTTP_400_BAD_REQUEST)

        c = Comment.objects.create(user=request.user, lesson=self.get_object(), content=content)
        return Response(serializers.CommentSerializer(c).data, status=status.HTTP_201_CREATED)

    @action(methods=['post'], detail=True, url_path='like')
    def like(self, request, pk=None):
        like, created = Like.objects.get_or_create(user=request.user, lesson=self.get_object())
        if not created:
            like.active = not like.active
            like.save()

        return Response(serializers.LessonDetailsSerializer(self.get_object(), context={'request': request}).data)


class PaymentViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = serializers.PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        payment = serializer.save()
        enrollment = payment.enrollment
        enrollment.status = Enrollment.Status.ACTIVE
        enrollment.save()

    @action(methods=['post'], detail=False, url_path='momo-pay')
    def create_momo_payment(self, request):
        try:
            # 1. Lấy thông tin từ Client
            enrollment_id = request.data.get('enrollment_id')
            if not enrollment_id:
                return Response({"error": "Thiếu enrollment_id"}, status=status.HTTP_400_BAD_REQUEST)

            enrollment = Enrollment.objects.get(id=enrollment_id)
            amount = int(enrollment.course.price)

            # 2. Tạo mã đơn hàng (orderId) duy nhất
            orderId = str(uuid.uuid4())
            requestId = str(uuid.uuid4())
            orderInfo = f"Thanh toan khoa hoc {enrollment.course.subject}"

            # 3. Tạo chữ ký HMAC SHA256 (Theo quy chuẩn MoMo)
            # Chuỗi cần hash phải sắp xếp đúng thứ tự a-z
            raw_signature = (
                f"accessKey={MOMO_CONFIG['access_key']}"
                f"&amount={amount}"
                f"&extraData="
                f"&ipnUrl={MOMO_CONFIG['ipn_url']}"
                f"&orderId={orderId}"
                f"&orderInfo={orderInfo}"
                f"&partnerCode={MOMO_CONFIG['partner_code']}"
                f"&redirectUrl={MOMO_CONFIG['redirect_url']}"
                f"&requestId={requestId}"
                f"&requestType=captureWallet"
            )

            h = hmac.new(
                bytes(MOMO_CONFIG['secret_key'], 'ascii'),
                bytes(raw_signature, 'utf-8'),
                hashlib.sha256
            )
            signature = h.hexdigest()

            # 4. Chuẩn bị dữ liệu gửi sang MoMo
            data = {
                'partnerCode': MOMO_CONFIG['partner_code'],
                'partnerName': "E-Course App",
                'storeId': "MomoTestStore",
                'requestId': requestId,
                'amount': str(amount),
                'orderId': orderId,
                'orderInfo': orderInfo,
                'redirectUrl': MOMO_CONFIG['redirect_url'],
                'ipnUrl': MOMO_CONFIG['ipn_url'],
                'lang': 'vi',
                'extraData': "",  # Bạn có thể lưu enrollment_id vào đây để xử lý IPN dễ hơn
                'requestType': "captureWallet",
                'signature': signature
            }

            # 5. Gọi API MoMo
            res = requests.post(MOMO_CONFIG['endpoint'], json=data)
            json_res = res.json()
            print("MOMO RESPONSE:", json_res)
            # 6. Xử lý kết quả
            if str(json_res.get('resultCode')) == '0':
                # Lưu thông tin Payment tạm vào DB (status mặc định là PENDING hoặc bạn có thể set là chờ)
                Payment.objects.create(
                    enrollment=enrollment,
                    payment_method=Payment.Method.MOMO,
                    transaction_id=orderId,  # Lưu orderId để đối soát
                    amount=amount,
                    status=Payment.Status.PENDING,
                )

                # Trả về link thanh toán cho App
                return Response({'payUrl': json_res['payUrl']})
            else:
                return Response({'error': json_res.get('localMessage'), 'momo_code': json_res.get('errorCode')},
                                status=status.HTTP_400_BAD_REQUEST)

        except Enrollment.DoesNotExist:
            return Response({"error": "Không tìm thấy đăng ký"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['post'], detail=False, url_path='ipn', permission_classes=[permissions.AllowAny],
            authentication_classes=[])
    def process_momo_ipn(self, request):
        data = request.data
        print("LOG IPN: Đã nhận được request!", data)
        # 1. Lấy dữ liệu quan trọng
        resultCode = data.get('resultCode')  # 0 là thành công, khác 0 là thất bại
        orderId = data.get('orderId')  # Chính là transaction_id mình lưu lúc tạo link

        # 2. Kiểm tra chữ ký (Signature) - BƯỚC BẢO MẬT QUAN TRỌNG
        # Nếu làm thật (Production) bạn PHẢI hash lại dữ liệu nhận được và so sánh với data['signature']
        # để chắc chắn đây là MoMo gửi chứ không phải Hacker giả mạo.
        # Nhưng ở môi trường Test, tạm thời ta bỏ qua để code chạy được đã.
        check = (str(resultCode) == '0')
        print(check)
        # 3. Xử lý Logic
        if check:
            # Tìm lại cái Payment đang chờ (PENDING) dựa vào orderId
            try:
                payment = Payment.objects.get(transaction_id=orderId)
                # Nếu Payment này chưa xử lý thì mới xử lý (tránh lặp)
                check2 = payment.status == Payment.Status.PENDING
                print(check2)
                if check2:  # Hoặc check status
                    # Kích hoạt khóa học
                    enrollment = payment.enrollment
                    enrollment.status = Enrollment.Status.ACTIVE  # MỞ KHÓA HỌC
                    enrollment.save()

                    # Cập nhật trạng thái thanh toán
                    payment.status = Payment.Status.COMPLETED
                    payment.save()

                    print(f"Đã kích hoạt khóa học cho đơn hàng {orderId}")
                else:
                    print("Lỗi ............................")

            except Payment.DoesNotExist:
                print("Không tìm thấy đơn hàng")
            except Exception as e:
                print("Lỗi xử lý:", e)

        # MoMo yêu cầu trả về status 204 No Content để xác nhận đã nhận tin
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['post'], detail=False, url_path="zalo-pay")
    def create_zalo_payment(self, request):
        try:
            enrollment_id = request.data.get('enrollment_id')
            if not enrollment_id:
                return Response({"error": "Thiếu enrollment_id"}, status=status.HTTP_400_BAD_REQUEST)

            enrollment = Enrollment.objects.get(id=enrollment_id)
            transID = int(round(time.time() * 1000))
            app_trans_id = f"{datetime.now().strftime('%y%m%d')}_{transID}"
            payment = Payment.objects.create(
                enrollment=enrollment,
                amount=enrollment.course.price,
                payment_method= Payment.Method.ZALOPAY,
                status=Payment.Status.PENDING,  # Đang chờ thanh toán
                transaction_id=app_trans_id  # <--- QUAN TRỌNG: Lưu mã này lại
            )

            embed_data = json.dumps(
                {"redirecturl": "exp://oid5eyu-anonymous-8081.exp.direct",
                 "enrollment_id": enrollment.id,
                 "payment_id": payment.id})  # Redirect về app sau khi thanh toán
            amount = int(enrollment.course.price)
            enrollment_data = [{
                "id": enrollment.course.id,
                "name": enrollment.course.subject,
                "price": int(enrollment.course.price)
            }]
            enrollment_json_string = json.dumps(enrollment_data)
            order = {
                "app_id": ZALO_CONFIG["app_id"],
                "app_trans_id": app_trans_id,
                "app_user": "user_test",
                "app_time": int(round(time.time() * 1000)),
                "embed_data": embed_data,
                "item": enrollment_json_string,
                "amount": amount,
                "description": f"Thanh toan khoa hoc {enrollment.course.subject}",
                "bank_code": "",
                "callback_url": ZALO_CONFIG["callback_url"]  # URL để Zalo gọi lại báo kết quả
            }

            data = "{}|{}|{}|{}|{}|{}|{}".format(
                order["app_id"], order["app_trans_id"], order["app_user"],
                order["amount"], order["app_time"], order["embed_data"], order["item"]
            )

            order["mac"] = hmac.new(
                ZALO_CONFIG["key1"].encode(), data.encode(), hashlib.sha256
            ).hexdigest()

            # 3. Gửi sang ZaloPay
            response = requests.post(ZALO_CONFIG["endpoint"], json=order)
            return Response(response.json())
        except Exception as e:
            print(f"Lỗi tạo đơn Zalo: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], detail=False, url_path='ipn', permission_classes=[permissions.AllowAny],
            authentication_classes=[])
    def process_zalo_ipn(self, request):
        result = {}
        try:
            data = request.data.get("data")
            req_mac = request.data.get("mac")
            key2 = ZALO_CONFIG["key2"]  # Dùng Key2

            # 2. Tính toán lại MAC để kiểm tra
            mac = hmac.new(
                key2.encode(), data.encode(), hashlib.sha256
            ).hexdigest()

            # 3. So sánh
            if req_mac != mac:
                # Chữ ký không khớp -> Giả mạo
                result["return_code"] = -1
                result["return_message"] = "Mac not equal"
            else:
                # Chữ ký khớp -> Thanh toán thành công -> Update DB
                data_json = json.loads(data)
                app_trans_id = data_json['app_trans_id']
                print(f"Thanh toán thành công đơn: {app_trans_id}")
                embed_data_json = json.loads(data_json["embed_data"])
                orderId = embed_data_json.get("enrollment_id")
                # TODO: Update trạng thái đơn hàng trong Database của tại đây
                payment = Payment.objects.get(transaction_id=app_trans_id)
                if payment.status == Payment.Status.PENDING:  # Hoặc check status
                    # Kích hoạt khóa học
                    enrollment = payment.enrollment
                    enrollment.status = Enrollment.Status.ACTIVE  # MỞ KHÓA HỌC
                    enrollment.save()
                    # Cập nhật trạng thái thanh toán
                    payment.status = Payment.Status.COMPLETED
                    payment.save()
                    print(f"Đã kích hoạt khóa học cho đơn hàng {orderId}")
                else:
                    print("Lỗi ............................")

                result["return_code"] = 1
                result["return_message"] = "success"

        except Exception as e:
            result["return_code"] = 0
            result["return_message"] = str(e)

        return Response(result)

class StatView(viewsets.ViewSet):
    permission_classes = [perms.IsAdminOrLecturer]

    @action(methods=['get'], detail=False, url_path='course-stats')
    def course_stats(self, request):
        user = request.user
        if user.role == User.Role.ADMIN:
            queryset = Course.objects.all()
        else:
            queryset = Course.objects.filter(lecturer=user)

        q = request.query_params.get('q')
        if q:
            queryset = queryset.filter(subject__icontains=q)

        queryset = queryset.annotate(
            student_count=Count('enrollments', filter=Q(enrollments__status=Enrollment.Status.ACTIVE)),
            total_revenue=Coalesce(Sum('enrollments__payments__amount'), 0, output_field=DecimalField())
        ).order_by('-total_revenue')

        paginator = paginators.CoursePaginator()
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = CourseRevenueSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)

        serializer = CourseRevenueSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['get'], detail=False, url_path='revenue-stats')
    def revenue_stats(self, request):
        user = request.user
        period = request.query_params.get('period', 'month')

        payments = Payment.objects.filter(enrollment__course__active=True)

        if user.role == User.Role.LECTURER:
            payments = payments.filter(enrollment__course__lecturer=user)

        if period == 'year':
            trunc_func = TruncYear('created_date')
        elif period == 'quarter':
            trunc_func = TruncQuarter('created_date')
        else:
            trunc_func = TruncMonth('created_date')

        stats = payments.annotate(period_date=trunc_func).values('period_date').annotate(
            total_revenue=Sum('amount')).order_by('period_date')

        data = []
        for s in stats:
            p_date = s['period_date']
            if period == 'year':
                label = p_date.strftime('%Y')
            elif period == 'quarter':
                quarter = (p_date.month - 1) // 3 + 1
                label = f"Q{quarter}-{p_date.year}"
            else:
                label = p_date.strftime('%m-%Y')

            data.append({
                'period': label,
                'total_revenue': s['total_revenue']
            })
        return Response(data, status=status.HTTP_200_OK)

    @action(methods=['get'], detail=False, url_path='general-stats')
    def general_stats(self, request):
        user = request.user

        course_qs = Course.objects.filter(active=True)
        enrollment_qs = Enrollment.objects.filter(status=Enrollment.Status.ACTIVE)
        payment_qs = Payment.objects.all()

        total_students = 0
        total_revenue = 0
        total_lecturers = 0

        if user.role == User.Role.LECTURER:
            course_qs = course_qs.filter(lecturer=user)
            total_students = enrollment_qs.filter(course__lecturer=user).values('user').distinct().count()
            total_revenue = payment_qs.filter(enrollment__course__lecturer=user).aggregate(sum=Sum('amount'))[
                                'sum'] or 0

        elif user.role == User.Role.ADMIN:
            total_students = User.objects.filter(role=User.Role.STUDENT, is_active=True).count()
            total_lecturers = User.objects.filter(role=User.Role.LECTURER, is_active=True).count()
            total_revenue = payment_qs.aggregate(sum=Sum('amount'))['sum'] or 0

        total_courses = course_qs.count()

        return Response({
            "total_courses": total_courses,
            "total_students": total_students,
            "total_lecturers": total_lecturers,
            "total_revenue": total_revenue
        }, status=status.HTTP_200_OK)


class CommentView(viewsets.ViewSet, generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = Comment.objects.filter(active=True)
    permission_classes = [perms.CommentOwner]
    serializer_class = serializers.CommentSerializer
    pagination_class = paginators.CommentPaginator
