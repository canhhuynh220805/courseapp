from cloudinary.models import CloudinaryField
import requests
import isodate
from django.db import models
from django.contrib.auth.models import AbstractUser
from ckeditor.fields import RichTextField
from django.conf import settings
from django.db.models import Sum
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
import firebase_admin
from firebase_admin import credentials, firestore
import os
import time

# Create your models here.

def get_yt_info(url):
    if not url:
        return 0
    try:
        video_id = None
        if "v=" in url:
            video_id = url.split("v=")[1].split("&")[0]
        elif "youtu.be/" in url:
            video_id = url.split("youtu.be/")[1].split("?")[0]
        if not video_id:
            return 0
        api_key = getattr(settings, 'YOUTUBE_API_KEY', "AIzaSyDK0qVKb_otHQzUkz7IZ4K3FpS42IZSaM8")
        url = f"https://www.googleapis.com/youtube/v3/videos?id={video_id}&part=contentDetails&key={api_key}"
        res = requests.get(url).json()

        if "items" in res and len(res["items"]) > 0:
            iso_duration = res["items"][0]["contentDetails"]["duration"]
            duration_delta = isodate.parse_duration(iso_duration)
            return int(duration_delta.total_seconds() / 60)

    except Exception as e:
        print(f"Error fetching YT duration: {e}")
    return 0

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Quản trị viên"
        LECTURER = "LECTURER", "Giảng viên"
        STUDENT = "STUDENT", "Sinh viên"

    avatar = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=13, null=True, blank=True)
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
    duration = models.IntegerField(default=0, help_text="Tổng thời lượng khóa học")

    def save(self, *args, **kwargs):
        if self.id:
            total_video_mins = Lesson.objects.filter(course=self, active=True).aggregate(models.Sum('duration'))['duration__sum'] or 0
            total_workload_mins = total_video_mins * 1.5
            self.duration = int(total_workload_mins // 60)
        super().save(*args, **kwargs)

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

    def save(self, *args, **kwargs):
        if self.video:
            self.duration = get_yt_info(self.video)
        super().save(*args,**kwargs)

    class Meta:
        unique_together = ('subject', 'course')

@receiver([post_save, post_delete], sender=Lesson)
def update_course_duration(sender, instance, **kwargs):
    course = instance.course
    total_video_mins = Lesson.objects.filter(course=course, active=True).aggregate(Sum('duration'))['duration__sum'] or 0

    total_hours = int((total_video_mins * 1.5) // 60)
    if course.duration != total_hours:
        course.duration = total_hours
        course.save(update_fields=['duration'])

@receiver([post_save, post_delete], sender=Lesson)
def update_enrollment_progress_on_lesson_change(sender, instance, **kwargs):
    course = instance.course
    total_lessons = Lesson.objects.filter(course=course, active=True).count()
    enrollments = Enrollment.objects.filter(course=course)

    for enrollment in enrollments:
        completed_count = LessonComplete.objects.filter(enrollment=enrollment).count()
        new_progress = int((completed_count / total_lessons) * 100) if total_lessons > 0 else 0

        if enrollment.progress != new_progress:
            enrollment.progress = new_progress
            enrollment.save(update_fields=['progress'])

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
        VNPAY = 'VNPAY', 'VNPay'

    class Status(models.TextChoices):
        PENDING = "1"
        COMPLETED = "2"
        FAILED = "3"

    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(choices=Method.choices, max_length=20, default=Method.MOMO)
    status = models.CharField(choices=Status.choices, max_length=20, default=Status.PENDING)
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

if not firebase_admin._apps:
    cred_path = os.path.join(settings.BASE_DIR, 'serviceAccountKey.json')
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()


@receiver(post_save, sender=Lesson)
def notify_students_new_lesson(sender, instance, created, **kwargs):
    if created and db is not None:
        course = instance.course
        lecturer = course.lecturer

        if not lecturer or not course.active:
            return

        active_enrollments = Enrollment.objects.filter(course=course, status=Enrollment.Status.ACTIVE).select_related('user')

        if not active_enrollments.exists():
            return

        message_text = f"Bài học mới: '{instance.subject}' vừa được thêm vào khóa học {course.subject}."
        created_at = int(time.time() * 1000)

        batch = db.batch()
        count = 0
        doc_count = 0

        for enrollment in active_enrollments:
            student = enrollment.user

            if student.id == lecturer.id:
                continue

            if lecturer.id < student.id:
                room_id = f"{lecturer.id}-{student.id}"
            else:
                room_id = f"{student.id}-{lecturer.id}"

            doc_ref = db.collection('messages').document()

            message_data = {
                "text": message_text,
                "createdAt": created_at,
                "senderId": lecturer.id,
                "receiverId": student.id,
                "roomId": room_id,
                "isRead": False,
                "user": {
                    "_id": lecturer.id,
                    "name": f"{lecturer.last_name} {lecturer.first_name}".strip() or lecturer.username,
                    "avatar": lecturer.avatar if lecturer.avatar else "https://res.cloudinary.com/dpl8syyb9/image/upload/v1766808871/geqv2zfnn6cqmrsgmrye.webp"
                }
            }

            batch.set(doc_ref, message_data)
            count += 1
            doc_count += 1

            if doc_count >= 400:
                batch.commit()
                batch = db.batch()
                doc_count = 0

        if doc_count > 0:
            batch.commit()
