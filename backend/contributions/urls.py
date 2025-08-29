from django.urls import path
from . import views

urlpatterns = [    
    # Contributions CRUD
    path("", views.ContributionListCreateView.as_view(), name="contribution-list-create"),

    # Requests - list all requests involving the user (incoming/outgoing)
    path("requests/", views.ContributionRequestListCreateView.as_view(), name="contribution-requests"),

    # Check if user has accepted requests (original)
    path("requests/accepted/", views.ContributionRequestAcceptedCheck.as_view(), name="contribution-request-accepted"),
    path("requests/allowed/", views.HasAcceptedRequestView.as_view(), name="contribution-request-allowed"),

    # Incoming/outgoing helpers
    path("requests/incoming/", views.incoming_requests, name="incoming-requests"),
    path("requests/outgoing/", views.outgoing_requests, name="outgoing-requests"),

    # Accept / Reject specific request
    path("requests/<int:pk>/accept/", views.ContributionRequestAcceptView.as_view(), name="accept-request"),
    path("requests/<int:pk>/reject/", views.ContributionRequestRejectView.as_view(), name="reject-request"),

    # Alternate responder view (action=accept|reject)
    path("requests/<int:request_id>/respond/", views.RespondContributionRequestView.as_view(), name="respond-request"),

    # Send new request (by recipient_id)
    path("requests/send/<int:recipient_id>/", views.SendContributionRequestView.as_view(), name="send-request"),
    path("requests/allowed/", views.ContributionRequestCheckView.as_view(), name="contribution-request-check"),
    path("requests/allowed/", views.allowed_request_view, name="allowed-request"),
]
