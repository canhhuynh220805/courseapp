from rest_framework import serializers

from courses.models import Course, User, Enrollment, Lesson, Payment, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ImageSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)

        data['image'] = instance.image.url

        return data


class CoursesSerializer(ImageSerializer):
    class Meta:
        model = Course
        fields = ['id', 'subject', 'description', 'image', 'price', 'category']

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


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'password', 'avatar', 'email']
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
        data['avatar'] = instance.avatar.url if instance.avatar else ''
        return data

class EnrollmentSerializer(serializers.ModelSerializer):
    course = CoursesSerializer()
    class Meta:
        model = Enrollment
        fields = ['id', 'user', 'course', 'status', 'progress', 'created_date']

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'subject', 'content', 'course', 'tags', 'image']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'payment_method', 'transaction_id', 'created_date']

class CourseRevenueSerializer(ImageSerializer):
    student_count = serializers.IntegerField(read_only=True)
    total_revenue = serializers.DecimalField(max_digits=20, decimal_places=0, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'subject', 'image', 'student_count', 'total_revenue ']