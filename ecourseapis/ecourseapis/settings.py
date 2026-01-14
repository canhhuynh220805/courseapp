from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
MEDIA_ROOT = '%s/courses/static/' % BASE_DIR

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-8ye3$t#ae5*#28wv!179d4+7@dv*hfvamp501hh+4d2r)=ez*!'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['canhdeptrai22.pythonanywhere.com', '127.0.0.1', 'localhost', '10.0.2.2', '*',
                 'courseapp.pythonanywhere.com']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'courses.apps.CoursesConfig',
    'ckeditor',
    'ckeditor_uploader',
    'rest_framework',
    'drf_yasg',
    'oauth2_provider',
]

AUTH_USER_MODEL = 'courses.User'

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ecourseapis.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ecourseapis.wsgi.application'

# Database Setup
import pymysql

pymysql.install_as_MySQLdb()

AUTH_USER_MODEL = 'courses.User'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'courseapp$coursedb',
        'USER': 'courseapp',
        'PASSWORD': 'admin@123',
        'HOST': 'courseapp.mysql.pythonanywhere-services.com'
    }
}

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'coursedb',
#         'USER': 'root',
#         'PASSWORD': '123456',
#         'HOST': ''  # mặc định localhost
#     }
# }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CKEditor
CKEDITOR_UPLOAD_PATH = "images/ckeditors/"

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    )
}

YOUTUBE_API_KEY = 'AIzaSyDK0qVKb_otHQzUkz7IZ4K3FpS42IZSaM8'

# OAuth2 Provider Keys
CLIENT_ID = "XNmumHqNiJeZgL1nK9wV9JjLOQhP4mOQQCkwlA26"
CLIENT_SECRET = "h5ywYK6zytwayHxLoxOPgHzvWuJlxptGXbNYxIreYYcVNaQ9UjZPsI2RoPVpBe5Q5468HTJ4pve5cr0Yl6UsXCRtRb6R6e2TG6tUIOFKXFEL3mTtXjFVG14326kY5Anm"

# Cloudinary
import cloudinary
import cloudinary.uploader
import cloudinary.api

cloudinary.config(
    cloud_name="dpl8syyb9",
    api_key="423338349327346",
    api_secret="zfwveRcXlclSOKM7mqSU2j0421c",
    api_proxy="http://proxy.server:3128"
)

MOMO_CONFIG = {
    'endpoint': 'https://test-payment.momo.vn/v2/gateway/api/create',
    'partner_code': 'MOMO',
    'access_key': 'F8BBA842ECF85',
    'secret_key': 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    'redirect_url': 'exp://oid5eyu-anonymous-8081.exp.direct/--/payment-result',
    'ipn_url': 'https://courseapp.pythonanywhere.com/payments/ipn/'
}

ZALO_CONFIG = {
    "app_id": 2553,
    "key1": "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
    "key2": "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
    "endpoint": "https://sb-openapi.zalopay.vn/v2/create",
    "callback_url": "https://courseapp.pythonanywhere.com/payments/zalo-pay",
    "callback_url2": "https://nonreparable-torpidly-eufemia.ngrok-free.dev/zalo-pay/ipn/"
}

VNPAY_CONFIG = {
    "vnp_TmnCode": "FRJ8RVSE",
    "vnp_ReturnUrl": "https://courseapp.pythonanywhere.com/payments/payment-return/",
    "vnpHashSecret": "1NWO2X8ITPSC7AY3OAVZ789EOHEXL1HK"
}
