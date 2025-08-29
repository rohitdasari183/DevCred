from django.urls import path
from .views import EndorsementListCreateView

urlpatterns = [
    # Endpoint for listing all endorsements and creating a new one
    path("", EndorsementListCreateView.as_view(), name="endorsement-list-create"),
]
