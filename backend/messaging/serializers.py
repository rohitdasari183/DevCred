from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, Message

User = get_user_model()


class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for the Message model.
    Handles conversion between IDs/usernames and enforces that the sender is
    always the logged-in user.
    """

    sender_username = serializers.ReadOnlyField(source="sender.username")
    recipient_username = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "sender",
            "sender_username",
            "recipient",
            "recipient_username",
            "text",
            "file",
            "image",
            "created_at",
            "read",
            "status",
        ]
        read_only_fields = ["id", "sender", "recipient", "created_at", "status"]

    def create(self, validated_data):
        """
        Override create to:
        - Set sender from request.user (cannot be faked by client).
        - Look up recipient by username.
        - Mark the message as unread by default.
        """
        request = self.context.get("request")
        sender = request.user
        recipient_username = validated_data.pop("recipient_username")

        recipient = User.objects.filter(username=recipient_username).first()
        if not recipient:
            raise serializers.ValidationError({"recipient_username": "User not found."})

        validated_data["recipient"] = recipient
        validated_data["sender"] = sender
        validated_data["read"] = False

        return super().create(validated_data)


class ConversationSerializer(serializers.ModelSerializer):
    """
    Serializer for the Conversation model.
    Expands participants into usernames and nests related messages.
    """

    participants_usernames = serializers.SerializerMethodField()
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = [
            "id",
            "participants",
            "participants_usernames",
            "created_at",
            "messages",
        ]

    def get_participants_usernames(self, obj):
        # Convert participants into a list of usernames
        return [u.username for u in obj.participants.all()]
