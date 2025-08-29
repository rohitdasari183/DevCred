# backend/videos/urls.py
from django.urls import path
from .views import MentoringVideoUploadView

urlpatterns = [
    # Endpoint for uploading mentoring videos
    path('', MentoringVideoUploadView.as_view(), name='mentoring-video-upload'),
]
