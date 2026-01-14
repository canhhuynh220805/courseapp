from django.db.models import DecimalField, Count, Q, Sum, OuterRef, Exists, Subquery
from django.db.models.functions import Coalesce, TruncYear, TruncMonth, TruncQuarter
from django.http import HttpResponse
import json, hmac, hashlib, uuid, requests
import urllib.parse
from django.template import loader
from rest_framework.views import APIView
from rest_framework import viewsets, permissions, generics, parsers, status
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response
from ecourseapis.settings import MOMO_CONFIG, ZALO_CONFIG, VNPAY_CONFIG
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
        user = self.request.user
        if user.is_authenticated and user.role == User.Role.LECTURER:
            queries = Course.objects.filter(lecturer=user)
        else:
            queries = Course.objects.filter(active=True)

        if user.is_authenticated:
            enrollment_subquery = Enrollment.objects.filter(course=OuterRef('pk'), user=user)
            queries = queries.annotate(is_registered=Exists(enrollment_subquery),
                                       user_progress=Subquery(enrollment_subquery.values('progress')[:1]))

        queries = queries.annotate(
            student_count=Count('enrollments', filter=Q(enrollments__status=Enrollment.Status.ACTIVE)))

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
        if ordering == 'popular':
            queries = queries.order_by('-student_count', '-id')
        elif ordering == 'name_asc':
            queries = queries.order_by('subject')
        elif ordering == 'name_desc':
            queries = queries.order_by('-subject')
        elif ordering == 'price_asc':
            queries = queries.order_by('price')
        elif ordering == 'price_desc':
            queries = queries.order_by('-price')
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

        q = request.query_params.get("q")
        if q:
            enrollments = enrollments.filter(course__subject__icontains=q)

        page = self.paginate_queryset(enrollments)
        if page is not None:
            serializer = EnrollmentSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

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
            students_query = Q(enrollments__course__lecturer=user, enrollments__status=Enrollment.Status.ACTIVE)
            admins_query = Q(role=User.Role.ADMIN, is_active=True)

            contacts = User.objects.filter(students_query | admins_query).distinct()
            return Response(serializers.UserSerializer(contacts, many=True).data)

        elif user.role == User.Role.ADMIN:
            lecturers = User.objects.filter(role=User.Role.LECTURER, is_active=True)
            return Response(serializers.UserSerializer(lecturers, many=True).data)

        return Response([])


class LessonView(viewsets.ModelViewSet):
    queryset = Lesson.objects.filter(active=True)
    serializer_class = serializers.LessonDetailsSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'get_comments']:
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
        paginator = paginators.CommentPaginator()

        page = paginator.paginate_queryset(comments, request)

        if page is not None:
            serializer = serializers.CommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.CommentSerializer(comments, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='add-comment')
    def add_comment(self, request, pk=None):
        content = request.data.get('content')
        if not content:
            return Response({"error": "Nội dung không được để trống"}, status=status.HTTP_400_BAD_REQUEST)

        c = Comment.objects.create(user=request.user, lesson=self.get_object(), content=content)
        return Response(serializers.CommentSerializer(c).data, status=status.HTTP_201_CREATED)

    @action(methods=['post'], detail=True, url_path='like', permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        like, created = Like.objects.get_or_create(user=request.user, lesson=self.get_object())
        if not created:
            like.active = not like.active
            like.save()

        return Response(serializers.LessonDetailsSerializer(self.get_object(), context={'request': request}).data)


class PaymentViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
    queryset = Payment.objects.all()
    serializer_class = serializers.PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        payment = serializer.save()
        enrollment = payment.enrollment
        enrollment.status = Enrollment.Status.ACTIVE
        enrollment.save()

    def get_queryset(self):
        queryset = Payment.objects.select_related('enrollment', 'enrollment__course')
        if not self.request.user.is_staff:
            queryset = queryset.filter(enrollment__user=self.request.user)

        return queryset.order_by('-created_date')

    @action(methods=['post'], detail=False, url_path='momo-pay')
    def create_momo_payment(self, request):
        try:
            enrollment_id = request.data.get('enrollment_id')
            if not enrollment_id:
                return Response({"error": "Thiếu enrollment_id"}, status=status.HTTP_400_BAD_REQUEST)

            enrollment = Enrollment.objects.get(id=enrollment_id)
            if enrollment.status == Enrollment.Status.ACTIVE:
                return Response({"error": "Bạn đã sở hữu khóa học này rồi"}, status=400)
            amount = int(enrollment.course.price)

            orderId = str(uuid.uuid4())
            requestId = str(uuid.uuid4())
            orderInfo = f"Thanh toan khoa hoc {enrollment.course.subject}"

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
            payment, created = Payment.objects.update_or_create(
                enrollment=enrollment,
                defaults={
                    'transaction_id': orderId,
                    'payment_method': Payment.Method.MOMO,
                    'amount': amount,
                    'status': Payment.Status.PENDING
                }
            )

            h = hmac.new(
                bytes(MOMO_CONFIG['secret_key'], 'ascii'),
                bytes(raw_signature, 'utf-8'),
                hashlib.sha256
            )
            signature = h.hexdigest()

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
                'extraData': "",
                'requestType': "captureWallet",
                'signature': signature
            }

            res = requests.post(MOMO_CONFIG['endpoint'], json=data)
            json_res = res.json()
            print("MOMO RESPONSE:", json_res)
            if str(json_res.get('resultCode')) == '0':
                return Response({'payUrl': json_res['payUrl']})
            else:
                payment.status = Payment.Status.FAILED
                payment.save()
                return Response({'error': json_res.get('localMessage'), 'momo_code': json_res.get('errorCode')},
                                status=status.HTTP_400_BAD_REQUEST)

        except Enrollment.DoesNotExist:
            return Response({"error": "Không tìm thấy đăng ký"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            if 'payment' in locals():
                payment.status = Payment.Status.FAILED
                payment.save()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['post'], detail=False, url_path='ipn', permission_classes=[permissions.AllowAny],
            authentication_classes=[])
    def process_momo_ipn(self, request):
        data = request.data
        resultCode = data.get('resultCode')
        orderId = data.get('orderId')
        try:
            payment = Payment.objects.get(transaction_id=orderId)
            enrollment = payment.enrollment
            if str(resultCode) == '0' and payment.status == Payment.Status.PENDING:
                enrollment.status = Enrollment.Status.ACTIVE
                payment.status = Payment.Status.COMPLETED
                print(f"Đã kích hoạt khóa học cho đơn hàng {orderId}")
            else:
                payment.status = Payment.Status.FAILED
                if enrollment.status == Enrollment.Status.PENDING:
                    enrollment.status = Enrollment.Status.CANCELED
            enrollment.save()
            payment.save()
        except Payment.DoesNotExist:
            print("Không tìm thấy đơn hàng")
        except Exception as e:
            print("Lỗi ipn momo:", e)
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
                payment_method=Payment.Method.ZALOPAY,
                status=Payment.Status.PENDING,
                transaction_id=app_trans_id
            )

            embed_data = json.dumps(
                {"redirecturl": "exp://oid5eyu-anonymous-8081.exp.direct",
                 "enrollment_id": enrollment.id,
                 "payment_id": payment.id})
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
                "callback_url": ZALO_CONFIG["callback_url"]
            }

            data = "{}|{}|{}|{}|{}|{}|{}".format(
                order["app_id"], order["app_trans_id"], order["app_user"],
                order["amount"], order["app_time"], order["embed_data"], order["item"]
            )

            order["mac"] = hmac.new(
                ZALO_CONFIG["key1"].encode(), data.encode(), hashlib.sha256
            ).hexdigest()

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
            key2 = ZALO_CONFIG["key2"]

            mac = hmac.new(
                key2.encode(), data.encode(), hashlib.sha256
            ).hexdigest()

            if req_mac != mac:
                result["return_code"] = -1
                result["return_message"] = "Mac not equal"
            else:
                data_json = json.loads(data)
                app_trans_id = data_json['app_trans_id']
                print(f"Thanh toán thành công đơn: {app_trans_id}")
                embed_data_json = json.loads(data_json["embed_data"])
                orderId = embed_data_json.get("enrollment_id")
                payment = Payment.objects.get(transaction_id=app_trans_id)
                if payment.status == Payment.Status.PENDING:
                    enrollment = payment.enrollment
                    enrollment.status = Enrollment.Status.ACTIVE
                    enrollment.save()
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

    @action(methods=['post'], detail=False, url_path='zalo-confirm', permission_classes=[permissions.AllowAny],
            authentication_classes=[])
    def zalo_confirm(self, request):
        enrollment_id = request.data.get('enrollment_id')

        zp_trans_id = request.data.get('zp_trans_id')
        if not enrollment_id:
            return Response({"error": "Thiếu enrollment_id"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            enrollment = Enrollment.objects.get(pk=enrollment_id)
            status_from_local = request.data.get('status', 'PAID')
            p = Payment(
                enrollment=enrollment,
                amount=enrollment.course.price,
                payment_method=Payment.Method.ZALOPAY,
                transaction_id=zp_trans_id
            )
            if status_from_local == "PAID":
                enrollment.status = Enrollment.Status.ACTIVE
                p.status = Payment.Status.COMPLETED
            else:
                enrollment.status = Enrollment.Status.CANCELED
                p.status = Payment.Status.CANCELED
            enrollment.save()
            p.save()
            return Response({"message": "Update thành công"}, status=status.HTTP_200_OK)

        except Enrollment.DoesNotExist:
            return Response({"error": "Không tìm thấy Enrollment"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['post'], detail=False, url_path="vnpay-payment")
    def create_vnpay_payment(self, request):
        try:
            enrollment_id = request.data.get('enrollment_id')
            enrollment = Enrollment.objects.get(id=enrollment_id)
            amount = int(enrollment.course.price)

            transID = int(round(time.time() * 1000))
            orderId = f"{datetime.now().strftime('%y%m%d')}_{transID}"

            Payment.objects.create(
                enrollment=enrollment,
                amount=amount,
                payment_method=Payment.Method.VNPAY,
                status=Payment.Status.PENDING,
                transaction_id=orderId
            )

            ip_addr = request.META.get('REMOTE_ADDR', '127.0.0.1')

            vnp_Params = {
                "vnp_Version": "2.1.0",
                "vnp_Command": "pay",
                "vnp_TmnCode": "FRJ8RVSE",
                "vnp_Amount": amount * 100,
                "vnp_CurrCode": "VND",
                "vnp_TxnRef": orderId,
                "vnp_OrderInfo": f"Thanh toan khoa hoc {enrollment.course.subject}",
                "vnp_OrderType": "other",
                "vnp_Locale": "vn",
                "vnp_IpnUrl": "https://courseapp.pythonanywhere.com/payments/ipn/",
                "vnp_ReturnUrl": VNPAY_CONFIG["vnp_ReturnUrl"],
                "vnp_IpAddr": ip_addr,
                "vnp_CreateDate": datetime.now().strftime('%Y%m%d%H%M%S'),
            }

            inputData = sorted(vnp_Params.items())
            queryString = ""
            seq = 0
            for key, val in inputData:
                if seq == 1:
                    queryString = queryString + "&" + key + "=" + urllib.parse.quote_plus(str(val))
                else:
                    seq = 1
                    queryString = key + "=" + urllib.parse.quote_plus(str(val))

            vnp_HashSecret = VNPAY_CONFIG["vnpHashSecret"]
            hashValue = hmac.new(
                vnp_HashSecret.encode('utf-8'),
                queryString.encode('utf-8'),
                hashlib.sha512
            ).hexdigest()

            payment_url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html" + "?" + queryString + "&vnp_SecureHash=" + hashValue

            return Response({"payment_url": payment_url})

        except Exception as e:
            print(f"Lỗi tạo VNPay: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get'], detail=False, url_path='ipn', permission_classes=[permissions.AllowAny],
            authentication_classes=[])
    def process_vnpay_ipn(self, request):
        inputData = request.GET.dict()

        if not inputData:
            return Response({"RspCode": "99", "Message": "Invalid request"})

        vnp_SecureHash = inputData.get('vnp_SecureHash')

        if 'vnp_SecureHash' in inputData:
            inputData.pop('vnp_SecureHash')
        if 'vnp_SecureHashType' in inputData:
            inputData.pop('vnp_SecureHashType')

        sorted_inputData = sorted(inputData.items())
        queryString = ""
        seq = 0
        for key, val in sorted_inputData:
            if seq == 1:
                queryString = queryString + "&" + key + "=" + urllib.parse.quote_plus(str(val))
            else:
                seq = 1
                queryString = key + "=" + urllib.parse.quote_plus(str(val))

        vnp_HashSecret = VNPAY_CONFIG["vnpHashSecret"]
        hashValue = hmac.new(
            vnp_HashSecret.encode('utf-8'),
            queryString.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()

        if hashValue == vnp_SecureHash:
            if inputData.get('vnp_ResponseCode') == "00":
                txnRef = inputData.get('vnp_TxnRef')

                print(f"VNPay Success: {txnRef}")

                try:
                    payment = Payment.objects.get(transaction_id=txnRef)
                    enrollment = payment.enrollment
                    if payment.status == Payment.Status.PENDING:
                        payment.status = Payment.Status.COMPLETED
                        enrollment.status = Enrollment.Status.ACTIVE
                    else:
                        payment.status = Payment.Status.FAILED
                        if enrollment.status == Enrollment.Status.PENDING:
                            enrollment.status = Enrollment.Status.CANCELED
                    payment.save()
                    enrollment.save()
                    return Response({"RspCode": "00", "Message": "Confirm Success"})
                except Payment.DoesNotExist:
                    return Response({"RspCode": "01", "Message": "Order not found"})
            else:
                return Response({"RspCode": "00", "Message": "Payment failed/Cancelled"})
        else:
            return Response({"RspCode": "97", "Message": "Invalid Checksum"})


def payment_return_vnpay(request):
    vnp_ResponseCode = request.GET.get('vnp_ResponseCode')

    base_app_scheme = "exp://oid5eyu-anonymous-8081.exp.direct"

    if vnp_ResponseCode == '00':
        status = "success"
        message = "Giao dịch thành công!"
        color = "#4CAF50"
        icon = "✅"
    else:
        status = "failed"
        message = "Giao dịch thất bại hoặc đã bị hủy."
        color = "#F44336"
        icon = "❌"

    app_link = f"{base_app_scheme}?status={status}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Kết quả thanh toán</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body {{ font-family: sans-serif; text-align: center; padding-top: 50px; color: #333; }}
            .icon {{ font-size: 60px; margin-bottom: 20px; display: block; }}
            .msg {{ font-size: 18px; font-weight: bold; color: {color}; }}
            .btn {{
                display: inline-block; margin-top: 20px; padding: 10px 20px;
                background-color: {color}; color: white; text-decoration: none;
                border-radius: 5px; font-weight: bold;
            }}
        </style>
    </head>
    <body>
        <span class="icon">{icon}</span>
        <h3 class="msg">{message}</h3>
        <p>Đang quay trở lại ứng dụng...</p>

        <script type="text/javascript">
            // Tự động mở App sau 1.5 giây
            setTimeout(function() {{
                window.location.href = "{app_link}";
            }}, 1500);
        </script>

        <a href="{app_link}" class="btn">Quay lại ứng dụng ngay</a>
    </body>
    </html>
    """
    return HttpResponse(html_content)


class LocalZaloPaymentView(APIView):
    def post(self, request):
        try:
            enrollment_id = request.data.get('enrollment_id')
            amount = request.data.get('amount')

            if not enrollment_id or not amount:
                return Response({"error": "Thiếu enrollment_id hoặc amount"}, status=400)

            transID = int(round(time.time() * 1000))
            app_trans_id = f"{datetime.now().strftime('%y%m%d')}_{transID}"

            embed_data = json.dumps({
                "enrollment_id": enrollment_id,
                "redirecturl": "exp://oid5eyu-anonymous-8081.exp.direct"
            })

            items = json.dumps([{"id": enrollment_id, "price": amount}])

            order = {
                "app_id": ZALO_CONFIG["app_id"],
                "app_trans_id": app_trans_id,
                "app_user": "user_test",
                "app_time": int(round(time.time() * 1000)),
                "embed_data": embed_data,
                "item": items,
                "amount": int(amount),
                "description": f"Thanh toan khoa hoc ID {enrollment_id}",
                "bank_code": "",
                "callback_url": ZALO_CONFIG["callback_url2"]
            }

            data = "{}|{}|{}|{}|{}|{}|{}".format(
                order["app_id"], order["app_trans_id"], order["app_user"],
                order["amount"], order["app_time"], order["embed_data"], order["item"]
            )
            order["mac"] = hmac.new(
                ZALO_CONFIG["key1"].encode(), data.encode(), hashlib.sha256
            ).hexdigest()

            response = requests.post(ZALO_CONFIG["endpoint"], json=order)
            return Response(response.json())

        except Exception as e:
            print(f"Lỗi Local: {str(e)}")
            return Response({"error": str(e)}, status=400)


class LocalZaloIPNView(APIView):
    def post(self, request):
        result = {}
        try:
            data = request.data.get("data")
            req_mac = request.data.get("mac")
            key2 = ZALO_CONFIG["key2"]

            mac = hmac.new(key2.encode(), data.encode(), hashlib.sha256).hexdigest()
            PA_URL = "https://courseapp.pythonanywhere.com/payments/zalo-confirm/"
            data_json = json.loads(data)
            app_trans_id = data_json.get("app_trans_id")
            zp_trans_id = data_json.get("zp_trans_id")
            if "embed_data" in data_json:
                embed_data_json = json.loads(data_json["embed_data"])
                enrollment_id = embed_data_json.get("enrollment_id")
            else:
                enrollment_id = None

            payload = {
                "enrollment_id": enrollment_id,
                "app_trans_id": app_trans_id,
                "zp_trans_id": zp_trans_id,
            }
            if req_mac != mac:
                payload["status"] = "FAILED"
                result["return_code"] = -1
                result["return_message"] = "Mac not equal"
            else:
                print(f"✅ Thanh toán thành công cho Enrollment ID: {enrollment_id}")
                payload["status"] = "PAID"
                result["return_code"] = 1
                result["return_message"] = "success"
            if enrollment_id:
                try:
                    res = requests.post(PA_URL, json=payload)
                    print("Server chính phản hồi:", res.status_code, res.text)
                except Exception as err:
                    print("Lỗi gọi Server chính:", err)
            return Response(result)
        except Exception as e:
            print("Lỗi ipn: ", str(e))


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
        payment_qs = Payment.objects.filter(status=Payment.Status.COMPLETED)

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
