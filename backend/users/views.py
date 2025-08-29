import requests
from users.models import CustomUser
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import redirect


from django.conf import settings
import re

from django.contrib.auth import get_user_model
from messaging.models import Message
from .serializers import SignupSerializer, UserSerializer
from videos.models import MentoringVideo
from resume.models import ResumeEntry
from endorsements.models import Endorsement
from contributions.models import Contribution
from videos.models import MentoringVideo
from urllib.parse import urlencode

# GitHub OAuth config
GITHUB_CLIENT_ID = settings.GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET = settings.GITHUB_CLIENT_SECRET
FRONTEND_URL = "http://localhost:3000/signup"
BACKEND_BASE_URL = "http://127.0.0.1:8000"
GITHUB_REDIRECT_URI = f"{BACKEND_BASE_URL}/api/users/github/callback/"


User = get_user_model()


class SignupView(generics.CreateAPIView):
    """
    Create a new user.
    """

    queryset = User.objects.all()
    serializer_class = SignupSerializer
    permission_classes = [AllowAny]


class UserProfileView(APIView):
    """
    Return basic authenticated user profile.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


def get_github_repo_count(username: str) -> int:
    """
    Fallback method to scrape GitHub repo count if API calls fail.
    Used for contribution stats in Dashboard.
    """
    try:
        url = f"https://github.com/{username}?tab=repositories"
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            match = re.search(r"(\d+)\s+repositories", res.text)
            if match:
                return int(match.group(1))
    except Exception as e:
        print(f"GitHub scrape failed for {username}: {e}")
    return 0


class DashboardView(APIView):
    """
    Dashboard combining counts and flags used by frontend.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        video_count = MentoringVideo.objects.filter(user=user).count()
        resume_generated = ResumeEntry.objects.filter(user=user).exists()
        endorsement_count = Endorsement.objects.filter(endorsed_user=user).count()
        contribution_count = Contribution.objects.filter(user=user).count()

        github_repo_count = 0
        github_username = getattr(user, "github_username", None)
        if github_username:
            github_repo_count = get_github_repo_count(github_username)

        unread_count = Message.objects.filter(recipient=user, read=False).count()

        data = {
            "username": user.username,
            "github_username": github_username,
            "email": user.email,
            "contribution_score": contribution_count,
            "endorsement_score": endorsement_count,
            "video_contributions": video_count,
            "resume_generated": resume_generated,
            "github_repo_count": github_repo_count,
            "unread_count": unread_count,
        }
        return Response(data, status=status.HTTP_200_OK)


class UserListView(generics.ListAPIView):
    """List all users (requires authentication)"""

    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all()


class UserDetailView(generics.RetrieveAPIView):
    """Retrieve details of a specific user (requires authentication)"""

    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all()


@api_view(["GET"])
@permission_classes([AllowAny])
def public_profile(request, username):
    try:
        user = CustomUser.objects.get(username=username)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    data = {
        "id": user.id,
        "username": user.username,
        "bio": user.bio,
        "github_username": user.github_username,
        "profile_image": (
            request.build_absolute_uri(user.profile_image.url)
            if user.profile_image
            else None
        ),
        "endorsement_score": Endorsement.objects.filter(endorsed_user=user).count(),
        "contribution_score": Contribution.objects.filter(user=user).count(),
        "videos": [
            {
                "id": v.id,
                "title": v.title,
                "description": v.description,
                "video_file": request.build_absolute_uri(v.video_file.url),
                "uploaded_at": v.uploaded_at,
            }
            for v in MentoringVideo.objects.filter(user=user)
        ],
    }
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def private_profile(request, pk):
    """
    Same shape as public_profile, but fetched by user ID and requires auth.
    """
    try:
        user = CustomUser.objects.get(pk=pk)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    data = {
        "id": user.id,
        "username": user.username,
        "bio": user.bio,
        "github_username": user.github_username,
        "profile_image": (
            request.build_absolute_uri(user.profile_image.url)
            if user.profile_image
            else None
        ),
        "endorsement_score": Endorsement.objects.filter(endorsed_user=user).count(),
        "contribution_score": Contribution.objects.filter(user=user).count(),
        "videos": [
            {
                "id": v.id,
                "title": v.title,
                "description": v.description,
                "video_file": request.build_absolute_uri(v.video_file.url),
                "uploaded_at": v.uploaded_at,
            }
            for v in MentoringVideo.objects.filter(user=user)
        ],
    }
    return Response(data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AllowAny])
def github_login(request):
    """Redirects user to GitHub OAuth page"""

    params = {
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": GITHUB_REDIRECT_URI,  # EXACTLY matches GitHub App
        "scope": "read:user",
    }
    return redirect("https://github.com/login/oauth/authorize?" + urlencode(params))


@api_view(["GET"])
@permission_classes([AllowAny])
def github_callback(request):
    """Handles GitHub OAuth callback, fetches user info"""

    code = request.query_params.get("code")
    if not code:
        return redirect(f"{FRONTEND_URL}?error=missing_code")

    # Exchange code for access token
    token_res = requests.post(
        "https://github.com/login/oauth/access_token",
        headers={"Accept": "application/json"},
        data={
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code,
        },
    )
    token_data = token_res.json()
    access_token = token_data.get("access_token")

    if not access_token:
        return redirect(f"{FRONTEND_URL}?error=token_failed")

    # Fetch GitHub user info
    user_res = requests.get(
        "https://api.github.com/user",
        headers={"Authorization": f"token {access_token}"},
    )
    user_data = user_res.json()
    github_username = user_data.get("login")

    if not github_username:
        return redirect(f"{FRONTEND_URL}?error=user_fetch_failed")

    # Redirect back to frontend signup with username
    return redirect(f"{FRONTEND_URL}?github_username={github_username}")
