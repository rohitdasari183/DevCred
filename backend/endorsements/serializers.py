from rest_framework import serializers
from .models import Endorsement


class EndorsementSerializer(serializers.ModelSerializer):
    """
    Serializer for the Endorsement model.
    Handles both read-only username fields and validation to prevent self-endorsement.
    """

    # Display human-readable usernames instead of raw user IDs
    endorsed_by_username = serializers.ReadOnlyField(source="endorsed_by.username")
    endorsed_user_username = serializers.ReadOnlyField(source="endorsed_user.username")

    # Contribution should be handled as a PrimaryKey (id), not a CharField
    contribution = serializers.CharField(required=False, allow_blank=True)
    message = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Endorsement
        fields = [
            "id",
            "endorsed_user",
            "endorsed_user_username",
            "endorsed_by",
            "endorsed_by_username",
            "contribution",
            "message",
            "created_at",
        ]
        read_only_fields = ["id", "endorsed_by", "created_at"]
