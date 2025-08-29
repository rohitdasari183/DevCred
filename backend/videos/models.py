import os
from django.db import models
from users.models import CustomUser

def mentoring_video_upload_path(instance, filename):
    """ Store videos in 'mentoring_videos/' using the original filename """
    return os.path.join('mentoring_videos', filename)

class MentoringVideo(models.Model):
    # Links each video to the user who uploaded it
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="videos")

    # Basic metadata for the video
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    # Uploaded video file (keeps original filename)
    video_file = models.FileField(upload_to=mentoring_video_upload_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"
