


from django.contrib import admin
from django.db import router
from django.urls import path, include
from rest_framework import routers
from courses import views

router = routers.DefaultRouter()
router.register('courses', views.CourseView)
router.register('users', views.UserView)
router.register('lessons', views.LessonView)
router.register('categories', views.CategoryView)
router.register('payments', views.PaymentViewSet)
router.register('stats', views.StatView, basename='stats')
# router.register('comments', views.CommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('payment-return/', views.PaymentViewSet.payment_return_vnpay, name='payment_return_vnpay'),
]