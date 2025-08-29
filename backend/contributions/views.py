from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Contribution, ContributionRequest
from .serializers import ContributionSerializer, ContributionRequestSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def allowed_request_view(request):
    """
    Return whether current user can log a contribution.
    Rule:
      - Allowed if user has at least one accepted request (accepted=True, used=False).
      - Locked if all accepted requests are already used.
    """
    has_valid_request = ContributionRequest.objects.filter(
        recipient=request.user, accepted=True, used=False
    ).exists()
    return Response({"allowed": has_valid_request})


class ContributionListCreateView(generics.ListCreateAPIView):
    """
    List and create contributions for the logged-in user.
    - GET → return only the current user's contributions.
    - POST → create a new contribution and consume an unused request.
    """

    serializer_class = ContributionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only view their own contributions
        return Contribution.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Save contribution with current user as the owner
        serializer.save(user=self.request.user)

        # Consume the oldest accepted request (mark it as used)
        req = (
            ContributionRequest.objects.filter(
                recipient=self.request.user, accepted=True, used=False
            )
            .order_by("created_at")
            .first()
        )
        if req:
            req.used = True
            req.save()


class SendContributionRequestView(APIView):
    """
    Allows a user to send a contribution request to another user.
    Rules:
      - Cannot send a request to yourself.
      - Prevent duplicate requests to the same recipient.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, recipient_id):
        recipient = get_object_or_404(self.request.user.__class__, pk=recipient_id)

        if recipient == request.user:
            return Response(
                {"detail": "You cannot send a request to yourself."}, status=400
            )

        # Prevent duplicate requests from the same sender to the same recipient
        existing = ContributionRequest.objects.filter(
            sender=request.user, recipient=recipient
        ).first()
        if existing:
            return Response({"detail": "Request already sent."}, status=400)

        # Create request
        cr = ContributionRequest.objects.create(
            sender=request.user,
            recipient=recipient,
            message=request.data.get("message", ""),
        )
        return Response(ContributionRequestSerializer(cr).data, status=201)


class RespondContributionRequestView(APIView):
    """
    Recipient can respond to a request:
      - Accept → mark as accepted.
      - Reject → delete the request.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, request_id):
        cr = get_object_or_404(
            ContributionRequest, id=request_id, recipient=request.user
        )

        action = request.data.get("action")
        if action == "accept":
            cr.accepted = True
            cr.save()
            return Response({"detail": "Request accepted."})
        elif action == "reject":
            cr.delete()
            return Response({"detail": "Request rejected."})
        return Response({"detail": "Invalid action."}, status=400)


class HasAcceptedRequestView(APIView):
    """
    Checks if the current user has at least one accepted request.
    Useful for gating contribution creation.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        has_request = ContributionRequest.objects.filter(
            recipient=request.user, accepted=True
        ).exists()
        return Response({"allowed": has_request})


class ContributionRequestListView(generics.ListAPIView):
    """
    List all incoming requests for the logged-in user.
    """

    serializer_class = ContributionRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ContributionRequest.objects.filter(recipient=self.request.user).order_by(
            "-created_at"
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def incoming_requests(request):
    """
    Returns all requests where the logged-in user is the recipient.
    """
    qs = ContributionRequest.objects.filter(recipient=request.user).order_by(
        "-created_at"
    )
    return Response(ContributionRequestSerializer(qs, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def outgoing_requests(request):
    """
    Returns all requests sent by the logged-in user.
    """
    qs = ContributionRequest.objects.filter(sender=request.user).order_by("-created_at")
    return Response(ContributionRequestSerializer(qs, many=True).data)


class ContributionRequestAcceptedCheck(APIView):
    """
    GET /api/contribution-requests/accepted/
    Returns whether the current user has at least one accepted request.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        has_request = ContributionRequest.objects.filter(
            recipient=request.user, accepted=True
        ).exists()
        return Response({"allowed": has_request})


class ContributionRequestRejectView(APIView):
    """
    Explicit reject action → set accepted=False.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            req = ContributionRequest.objects.get(pk=pk, recipient=request.user)
        except ContributionRequest.DoesNotExist:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        req.accepted = False
        req.save()
        return Response({"status": "rejected"})


class ContributionRequestAcceptView(APIView):
    """
    Explicit accept action → set accepted=True.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            req = ContributionRequest.objects.get(pk=pk, recipient=request.user)
        except ContributionRequest.DoesNotExist:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        req.accepted = True
        req.save()
        return Response({"status": "accepted"})


class ContributionRequestListCreateView(generics.ListCreateAPIView):
    """
    GET → List requests where the user is sender or recipient.
    POST → Create a new request (requires `recipient_id` in payload).
    """

    serializer_class = ContributionRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ContributionRequest.objects.filter(
            Q(sender=user) | Q(recipient=user)
        ).order_by("-created_at")

    def perform_create(self, serializer):
        recipient_id = self.request.data.get("recipient_id")
        if not recipient_id:
            raise ValueError("recipient_id is required")
        serializer.save(sender=self.request.user, recipient_id=recipient_id)


class ContributionRequestCheckView(APIView):
    """
    Checks if the user is allowed to add contributions.
    Allowed only if there is an accepted ContributionRequest created via messaging.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        allowed = ContributionRequest.objects.filter(
            recipient=request.user,
            accepted=True,
            via_message=True,
        ).exists()
        return Response({"allowed": allowed})


class ContributionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a single contribution.
    Only accessible to the contribution owner.
    """

    serializer_class = ContributionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Contribution.objects.filter(user=self.request.user)
