from rest_framework import serializers

from courses.models import Course, User, Enrollment, Lesson


class ImageSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)

        data['image'] = instance.image.url

        return data


class CoursesSerializer(ImageSerializer):
    class Meta:
        model = Course
        fields = ['id', 'subject', 'description', 'image', 'price', 'category']


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
    courses = CoursesSerializer()
    class Meta:
        model = Enrollment
        fields = ['id', 'user', 'course', 'status', 'progress', 'created_date']

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'subject', 'content', 'course', 'tags', 'image']

