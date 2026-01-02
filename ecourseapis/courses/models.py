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

    avatar = models.CharField(max_length=255, null=True, blank=True)
    role = models.CharField(choices=Role.choices, max_length=20, default=Role.STUDENT)
    is_lecturer_verified = models.BooleanField(default=False)

class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Course(BaseModel):
    subject = models.CharField(max_length=255)
    description = models.TextField(null=False)
    # image = CloudinaryField('image', null=True)
    image = models.CharField(max_length=255, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=0, default=0)
    lecturer = models.ForeignKey(User, on_delete=models.CASCADE, null=True, related_name='courses')
    tags = models.ManyToManyField('Tag')
    duration = models.IntegerField(default=0)

    def __str__(self):
        return self.subject

class Lesson(BaseModel):
    subject = models.CharField(max_length=255)
    content = RichTextField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    tags = models.ManyToManyField('Tag', blank = True)
    # video = CloudinaryField('video', resource_type='video', null=True, blank=True)
    duration = models.IntegerField(default=0, help_text="Thời lượng bài học")
    image = models.CharField(max_length=255, null=True, blank=True)
    video = models.CharField(max_length=255, null=True, blank=True)
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
        return f"{self.user.username} - {self.course.subject}"

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
        MOMO = 'MOMO', 'MoMo'
        ZALOPAY = 'ZALOPAY', 'ZaloPay'
        PAYPAL = 'PAYPAL', 'PayPal'

    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(choices=Method.choices, max_length=20, default=Method.MOMO)
    transaction_id = models.CharField(max_length=100, null=True, blank=True)#mã giao dịch để đối soát

    def __str__(self):
        return f"Bill: {self.amount} VND - {self.enrollment.user.username}"

class Interaction(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null= False)
    lesson = models.ForeignKey(Lesson, on_delete= models.CASCADE, null = False)

    class Meta:
        abstract = True

class Comment(Interaction):
    content = models.CharField(max_length=255, null=False)

class Like(Interaction):
    active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('user', 'lesson')

class Rating(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='ratings')
    rate = models.IntegerField(default=5)
    content = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        unique_together = ('user', 'course')