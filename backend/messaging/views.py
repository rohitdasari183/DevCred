from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Message
from .serializers import MessageSerializer
from contributions.models import ContributionRequest  # <-- add import


User = get_user_model()


class MessageListCreateView(generics.ListCreateAPIView):
    """
    GET -> List all messages (sent or received by the user).
    POST -> Send a new message (sender is always current user).
    """

    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(
            recipient=self.request.user
        ) | Message.objects.filter(sender=self.request.user)

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)


class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific message (only if user is sender/recipient).
    """

    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(
            recipient=self.request.user
        ) | Message.objects.filter(sender=self.request.user)


class MarkMessageReadView(APIView):
    """
    Mark a message as read (only recipient can do this).
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        msg = get_object_or_404(Message, id=pk)
        if msg.recipient != request.user:
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        msg.read = True
        msg.save()
        return Response({"status": "marked as read"})


class UnreadCountView(APIView):
    """
    Return the number of unread messages for the current user.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Message.objects.filter(recipient=request.user, read=False).count()
        return Response({"unread_count": count})


class ConversationListView(APIView):
    """
    Return a list of all conversation participants for the current user.
    Shows usernames of people the user has exchanged messages with.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        messages = Message.objects.filter(Q(sender=user) | Q(recipient=user))
        participants = set()
        for m in messages:
            participants.add(m.sender)
            participants.add(m.recipient)
        participants.discard(user)
        data = [{"id": u.id, "username": u.username} for u in participants]
        return Response(data)


class AcceptRejectMessageView(APIView):
    """
    Allows recipient to accept/reject a message.
    On accept -> creates/updates a ContributionRequest (via_message=True).
    On reject -> disables that ContributionRequest.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        action = request.data.get("action")
        msg = get_object_or_404(Message, id=pk)

        if msg.recipient != request.user:
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        if action == "accept":
            msg.status = "accepted"
            msg.save()

            ContributionRequest.objects.update_or_create(
                sender=msg.sender,
                recipient=msg.recipient,
                defaults={"accepted": True, "via_message": True},
            )

        elif action == "reject":
            msg.status = "rejected"
            msg.save()

            ContributionRequest.objects.filter(
                sender=msg.sender, recipient=msg.recipient, via_message=True
            ).update(accepted=False)

        else:
            return Response(
                {"detail": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST
            )

        return Response({"status": msg.status})
