from django.db import models
from django.conf import settings

class ResumeEntry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resumes')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Resume by {self.user.username} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"
