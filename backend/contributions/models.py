from django.conf import settings
from django.db import models


# Predefined types of contributions to maintain consistency
class Contribution(models.Model):
    TYPE_CHOICES = [
        ("code", "Code"),
        ("bugfix", "Bug Fix"),
        ("docs", "Documentation"),
        ("mentorship", "Mentorship"),
        ("resume", "Resume Generator"),
        ("community", "Community Help"),
        ("codereview", "Code Review"),
    ]

    # The user who made the contribution (linked to the main User model)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,  # If user is deleted, their contributions are also deleted
        related_name="contributions",
    )

    # Basic details about the contribution
    title = models.CharField(max_length=255)  # Short title of contribution
    description = models.TextField(blank=True)  # Optional detailed explanation
    contribution_type = models.CharField(
        max_length=32, choices=TYPE_CHOICES
    )  # Must match one of the predefined choices
    proof_url = models.URLField(
        blank=True, null=True
    )  # Optional link to proof (e.g., GitHub PR, issue link)
    # Visibility control
    is_public = models.BooleanField(default=True)  # If False, contribution is private
    # Auto-managed timestamps
    created_at = models.DateTimeField(
        auto_now_add=True
    )  # When the contribution was created
    updated_at = models.DateTimeField(auto_now=True)  # Updated whenever saved

    def __str__(self):
        # Returns a readable string like: "username - Fix Login Bug"
        return f"{self.user.username} - {self.title}"


class ContributionRequest(models.Model):
    # Users involved in the request
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_requests"
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_requests",
    )
    # Request status fields
    accepted = models.BooleanField(
        default=False
    )  # True if recipient has accepted the request
    via_message = models.BooleanField(
        default=False
    )  # True if request originated via a message
    used = models.BooleanField(
        default=False
    )  # True if the request has been fulfilled/consumed

    # Auto-managed timestamps
    created_at = models.DateTimeField(auto_now_add=True)  # When request was created
    updated_at = models.DateTimeField(auto_now=True)  # Last updated time

    def __str__(self):
        # Shows: "sender → recipient (accepted/pending)"
        return f"{self.sender} → {self.recipient} ({'accepted' if self.accepted else 'pending'})"
