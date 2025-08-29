from rest_framework import serializers
from .models import Contribution, ContributionRequest


class ContributionSerializer(serializers.ModelSerializer):
    """
    Serializer for the Contribution model.
    Ensures safe representation of user data and handles automatic
    assignment of the logged-in user during creation.
    """

    # Instead of exposing full user details, we safely show only the string representation (username)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Contribution
        fields = [
            "id",
            "user",
            "title",
            "description",
            "contribution_type",
            "proof_url",
            "is_public",
            "created_at",
            "updated_at",
        ]
        # These fields should never be directly set by client input
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    def create(self, validated_data):
        """
        Override the default create method to ensure that the user field
        is always set from the request (authenticated user) rather than
        trusting client-provided input.
        """
        request = self.context.get(
            "request"
        )  # DRF automatically passes request context
        validated_data["user"] = request.user
        return super().create(validated_data)


class ContributionRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for the ContributionRequest model.
    Read-only by design to prevent tampering with sender/recipient fields
    from the client side.
    """

    # Show user-friendly string instead of raw user ID
    sender = serializers.StringRelatedField(read_only=True)
    recipient = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ContributionRequest
        fields = [
            "id",
            "sender",
            "recipient",
            "accepted",
            "via_message",
        ]
        # All fields are read-only in this serializer to ensure requests
        # are only created/updated via controlled logic (e.g., viewsets/services)
        read_only_fields = ["id", "sender", "recipient", "accepted", "via_message"]
