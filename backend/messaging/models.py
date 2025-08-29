from django.db import models
from django.conf import settings


class Conversation(models.Model):
    """
    Represents a conversation between two or more users.
    A conversation can have multiple participants.
    """

    participants = models.ManyToManyField(settings.AUTH_USER_MODEL)
    created_at = models.DateTimeField(auto_now_add=True)


class Message(models.Model):
    """
    Represents a single message sent from one user to another.
    Can include text, optional file/image, and a status (pending/accepted/rejected).
    """

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    ]

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="sent_messages"  # Reverse lookup: user.sent_messages.all()
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_messages", # Reverse lookup: user.received_messages.all()
    )
    text = models.TextField()
    file = models.FileField(upload_to="messages/files/", null=True, blank=True)
    image = models.ImageField(upload_to="messages/images/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")

    def __str__(self):
        return f"Message from {self.sender} to {self.recipient} ({self.status})"
