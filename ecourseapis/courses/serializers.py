import re

from rest_framework import serializers

from courses.models import Course, User, Enrollment, Lesson, Payment, Category, Comment, Like


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ImageSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)

        # data['image'] = instance.image.url
        image = getattr(instance, 'image', None)
        if image:
            if isinstance(image, str):
                data['image'] = image
            elif hasattr(image, 'url'):
                data['image'] = image.url
        return data

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.CharField(required=False, allow_null=True)
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'password', 'avatar', 'email', 'role', 'is_lecturer_verified']
        extra_kwargs = {
            'password': {
                'write_only': True,
            }
        }

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.role = User.Role.STUDENT
        user.save()
        return user

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar:
            data['avatar'] = instance.avatar
        else:
            data['avatar'] = ''
        return data

class CoursesSerializer(ImageSerializer):
    image = serializers.CharField(required=False, allow_null=True)
    is_free = serializers.SerializerMethodField()
    lecturer = UserSerializer(read_only=True)
    class Meta:
        model = Course
        fields = ['id', 'subject', 'description', 'image' ,'price', 'category', 'is_free', 'lecturer', 'duration']

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Học phí không được là số âm.")
        return value

    def is_registered(self, course):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Enrollment.objects.filter(user=request.user, course=course).exists()
        return False

    def get_progress(self, course):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(user=request.user, course=course).first()
            if enrollment:
                return enrollment.progress
        return None

    def get_is_free(self, obj):
        return obj.price == 0 or obj.price is None


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CoursesSerializer()
    class Meta:
        model = Enrollment
        fields = ['id', 'user', 'course', 'status', 'progress', 'created_date']

class LessonSerializer(serializers.ModelSerializer):
    image = serializers.CharField(required=False, allow_null=True)
    video = serializers.CharField(required=False, allow_null=True)
    class Meta:
        model = Lesson
        fields = ['id', 'subject', 'content', 'course', 'tags', 'image', 'video', 'duration']
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            if isinstance(instance.image, str):
                data['image'] = instance.image
            elif hasattr(instance.image, 'url'):
                data['image'] = instance.image.url
        return data

    def validate_video(self, value):
        if value:
            youtube_regex = r'^(https?://)?(www\.)?(youtube\.com|youtu\.?be)/.+$'
            if not re.match(youtube_regex, value):
                raise serializers.ValidationError("Link video không đúng định dạng YouTube.")
        return value

class PaymentSerializer(serializers.ModelSerializer):
    enrollment = EnrollmentSerializer()
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'payment_method', 'transaction_id', 'created_date', "enrollment"]

class CourseRevenueSerializer(ImageSerializer):
    student_count = serializers.IntegerField(read_only=True)
    total_revenue = serializers.DecimalField(max_digits=20, decimal_places=0, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'subject', 'image', 'student_count', 'total_revenue']

class CourseCompareSerializer(CoursesSerializer):
    lecturer_name = serializers.CharField(source='lecturer.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'subject', 'image', 'price', 'duration', 'lecturer_name', 'category_name']

class StudentEnrollmentSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Enrollment
        fields = ['id', 'user', 'progress', 'status', 'created_date']

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'content', 'created_date', 'updated_date', 'user']

class LessonDetailsSerializer(LessonSerializer):
    liked = serializers.SerializerMethodField()
    video = serializers.CharField(required=False, allow_null=True)
    def get_liked(self, lesson):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(lesson=lesson, user=request.user, active=True).exists()
        return False
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.video:
            if isinstance(instance.video, str):
                data['video'] = instance.video
            elif hasattr(instance.video, 'url'):
                data['video'] = instance.video.url
        return data
    class Meta:
        model = Lesson
        fields = LessonSerializer.Meta.fields + ['content', 'video', 'liked']

