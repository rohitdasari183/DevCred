from rest_framework import generics, permissions, serializers
from django.db import models
from .models import Endorsement
from .serializers import EndorsementSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class EndorsementListCreateView(generics.ListCreateAPIView):
    """
    List endorsements for the logged-in user (either given or received).
    Allow creating a new endorsement, but prevent self-endorsement.
    Automatically updates endorsement_score of the endorsed user.
    """

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EndorsementSerializer

    def get_queryset(self):
        user = self.request.user
        return Endorsement.objects.filter(
            models.Q(endorsed_user=user) | models.Q(endorsed_by=user)
        ).order_by("-created_at")

    def perform_create(self, serializer):
        endorsed_user = serializer.validated_data.get("endorsed_user")

        # Prevent endorsing yourself
        if self.request.user == endorsed_user:
            raise serializers.ValidationError("You cannot endorse yourself.")

        # Save endorsement with current user as endorser
        endorsement = serializer.save(endorsed_by=self.request.user)

        # Update endorsement score for the endorsed user
        endorsed_user.endorsement_score = Endorsement.objects.filter(
            endorsed_user=endorsed_user
        ).count()
        endorsed_user.save()
