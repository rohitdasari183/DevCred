from django.db import models
from django.conf import settings
from contributions.models import Contribution


class Endorsement(models.Model):
    """
    Represents an endorsement given by one user to another.
    Optionally tied to a specific contribution.
    """

    # The user who is being endorsed (recipient of the endorsement)
    endorsed_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="endorsements_received",
    )

    # The user giving the endorsement
    endorsed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="endorsements_given",
    )

    # Optional link to a contribution (e.g., "I endorse your code contribution")
    contribution = models.ForeignKey(
        Contribution,
        on_delete=models.CASCADE,
        related_name="endorsements",
        null=True,
        blank=True,
    )

    # Optional message included with the endorsement
    message = models.TextField(blank=True)
    
    # Timestamp for when the endorsement was created
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Prevent duplicate endorsements: same endorser cannot endorse same user
        # for the same contribution more than once
        unique_together = ("endorsed_user", "endorsed_by", "contribution")

    def __str__(self):
        # Example: "alice -> bob (Contribution object)"
        return f"{self.endorsed_by} -> {self.endorsed_user} ({self.contribution})"
