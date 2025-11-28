from cloudinary.models import CloudinaryField
from django.db import models
from django.contrib.auth.models import AbstractUser
from ckeditor.fields import RichTextField


# Create your models here.

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Quản trị viên"
        LECTURER = "LECTURER", "Giảng viên"
        STUDENT = "STUDENT", "Sinh viên"

    avatar = CloudinaryField(null=True)
    role = models.CharField(choices=Role.choices, max_length=20, default=Role.STUDENT)
    is_lecturer_verified = models.BooleanField(default=False)


class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Course(BaseModel):
    subject = models.CharField(max_length=255)
    description = models.TextField(null=False)
    image = CloudinaryField('image', null=True)
    video = CloudinaryField('video', resource_type='video',null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=0, default=0)
    lecturer = models.ForeignKey(User, on_delete=models.CASCADE, null=True, related_name='courses')

    def __str__(self):
        return self.subject

class Lesson(BaseModel):
    subject = models.CharField(max_length=255)
    content = RichTextField()
    course = models.ForeignKey(Course, on_delete=models.RESTRICT)
    tags = models.ManyToManyField('tag')
    image = CloudinaryField('image', null=True)
    def __str__(self):
        return self.subject

    class Meta:
        unique_together = ('subject', 'course')


class Tag(BaseModel):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Enrollment(BaseModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Chờ thanh toán'
        ACTIVE = 'ACTIVE', 'Đã kích hoạt'
        CANCELED = 'CANCELED', 'Đã hủy'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    status = models.CharField(choices=Status.choices, max_length=20, default=Status.PENDING)
    progress = models.IntegerField(default=0, help_text="Tiến độ %")

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.name} - {self.course.subject}"

class LessonComplete(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'lesson')

    def __str__(self):
        return f"{self.user.username} - {self.lesson.subject}"

class Payment(BaseModel):
    class Method(models.TextChoices):
        PAYPAL = 'PAYPAL', 'PayPal'
        MOMO = 'MOMO', 'MoMo'
        ZALOPAY = 'ZALOPAY', 'ZaloPay'
        CASH = 'CASH', 'Tiền mặt'

    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(choices=Method.choices, max_length=20, default=Method.CASH)
    transaction_id = models.CharField(max_length=100, null=True, blank=True)#mã giao dịch để đối soát

    def __str__(self):
        return f"Bill: {self.amount} VND - {self.enrollment.user.username}"
