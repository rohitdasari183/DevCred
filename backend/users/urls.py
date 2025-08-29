from django.urls import path
from .views import SignupView, UserProfileView, DashboardView, UserListView, UserDetailView, public_profile, private_profile, github_login, github_callback
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    # User authentication
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", TokenObtainPairView.as_view(), name="login"),

    # User profile endpoints
    path("me/", UserProfileView.as_view(), name="me"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("", UserListView.as_view(), name="user-list"),
    path("<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    
    # Public / private profile views
    path("public/<str:username>/",public_profile, name="public-profile"),
    path("private/<int:pk>/", private_profile, name="private-profile"), 

    # GitHub OAuth integration
    path("github/login/", github_login, name="github-login"),
    path("github/callback/", github_callback, name="github-callback"),
    
]
