"""
Django settings for DevCred backend.

This configuration file sets up PostgreSQL, JWT authentication,
media handling, and environment-based security for the project.
"""

from pathlib import Path
from decouple import config
from datetime import timedelta
import os

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")

# Root path of the project
BASE_DIR = Path(__file__).resolve().parent.parent




# Secret key for encryption, pulled from .env for safety
SECRET_KEY = config("SECRET_KEY")
GITHUB_CLIENT_ID=config("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET=config("GITHUB_CLIENT_SECRET")

# DEBUG mode for development — set to False in production!
DEBUG = True

# Allow all domains during dev; restrict in production
ALLOWED_HOSTS = ["*"]




INSTALLED_APPS = [
    # Core Django apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # 3rd-party apps
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',

    # Custom project apps
    'users',
    'contributions',
    'endorsements',
    'resume',
    'videos',
    'integrations',
    'corsheaders',
    'messaging',
]



MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]



ROOT_URLCONF = 'devcred.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],  # Add your frontend template paths here if needed
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

WSGI_APPLICATION = 'devcred.wsgi.application'




DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config("DB_NAME"),
        'USER': config("DB_USER"),
        'PASSWORD': config("DB_PASSWORD"),
        'HOST': config("DB_HOST"),
        'PORT': config("DB_PORT"),
    }
}
CORS_ALLOWED_ORIGINS=[
    'http://localhost:3000',

]
CORS_ALLOW_ALL_HEADERS = True
CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]
CORS_ALLOW_CREDENTIALS = True





# AUTH_PASSWORD_VALIDATORS = [
#     {
#         'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
#     },
# ]




LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'  # Adjust based on your region
USE_I18N = True
USE_TZ = True




# Static files (CSS, JS)
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# Media files (profile pics, video uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')




AUTH_USER_MODEL = 'users.CustomUser'



REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

OPENAI_API_KEY = config("OPENAI_API_KEY")
