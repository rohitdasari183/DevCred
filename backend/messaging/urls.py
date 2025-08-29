from django.urls import path
from .views import (
    MessageListCreateView,
    MessageDetailView,
    MarkMessageReadView,
    UnreadCountView,
    ConversationListView,
    AcceptRejectMessageView,
)

urlpatterns = [
    # List all messages for the user / send a new one
    path("messages/", MessageListCreateView.as_view(), name="message-list-create"),
    # Retrieve, update, or delete a specific message by ID
    path("messages/<int:pk>/", MessageDetailView.as_view(), name="message-detail"),
    # Mark a specific message as read
    path("messages/<int:pk>/read/", MarkMessageReadView.as_view(), name="mark-read"),
    # Get count of unread messages
    path("unread-count/", UnreadCountView.as_view(), name="unread-count"),
    # List all conversations for the user
    path("conversations/", ConversationListView.as_view(), name="conversation-list"),
    # Accept or reject a specific message (e.g., requests)
    path(
        "messages/<int:pk>/action/",
        AcceptRejectMessageView.as_view(),
        name="message-action",
    ),
    # Duplicate endpoint for unread count (possibly redundant)
    path(
        "messages/unread_count/", UnreadCountView.as_view(), name="message-unread-count"
    ),
]
