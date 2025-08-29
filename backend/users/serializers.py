from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from endorsements.models import Endorsement
from videos.models import MentoringVideo
from videos.serializers import MentoringVideoSerializer

User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    """
    Handles user signup and ensures password validation + hashing.
    """

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "bio",
            "github_username",
            "profile_image",
        ]
        extra_kwargs = {"email": {"required": True}}

    def validate_password(self, value):
        # Use Django's built-in password validators (length, complexity, etc.)
        try:
            validate_password(value)
        except serializers.ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def create(self, validated_data):
        # Hash password before saving
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user profiles.
    Adds contribution score, endorsement score, and mentoring videos.
    """

    contribution_score = serializers.SerializerMethodField()
    endorsement_score = serializers.SerializerMethodField()
    videos = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "bio",
            "github_username",
            "profile_image",
            "contribution_score",
            "endorsement_score",
            "videos",
        ]
        read_only_fields = ["id", "username", "email"]

    def get_contribution_score(self, obj):
        # Contribution score could be annotated in queryset; default fallback is 0
        return getattr(obj, "contribution_score", 0)

    def get_endorsement_score(self, obj):
        # Count endorsements the user has received
        return Endorsement.objects.filter(endorsed_user=obj).count()

    def get_videos(self, obj):
        # Return latest mentoring videos uploaded by the user
        qs = MentoringVideo.objects.filter(user=obj).order_by("-uploaded_at")
        return MentoringVideoSerializer(qs, many=True).data
