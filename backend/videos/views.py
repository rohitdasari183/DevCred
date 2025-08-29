from rest_framework import generics, permissions
from .models import MentoringVideo
from .serializers import MentoringVideoSerializer
from django.http import FileResponse, StreamingHttpResponse, Http404
from django.conf import settings
from wsgiref.util import FileWrapper
import os


class MentoringVideoUploadView(generics.ListCreateAPIView):
    # Supports both:
    # - GET → list all mentoring videos
    # - POST → upload a new mentoring videos
    queryset = MentoringVideo.objects.all().order_by("-uploaded_at")
    serializer_class = MentoringVideoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Always assign the logged-in user as the video owner
        serializer.save(user=self.request.user)
