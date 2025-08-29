from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    # Email is required and must be unique for each user
    email = models.EmailField(unique=True, max_length=255, verbose_name="Email")

    # A short personal description (optional)
    bio = models.TextField(verbose_name="About Me", blank=True, default="")

    # Optional user photo; stored in /media/profile_images
    profile_image = models.ImageField(
        upload_to="profile_images/",
        verbose_name="Profile Picture",
        blank=True,
        null=True,
    )
    github_username = models.CharField(
        max_length=50, blank=True, null=True, verbose_name="GitHub Username"
    )

    # Required when creating a superuser through CLI
    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return f"{self.username}'s Profile"
