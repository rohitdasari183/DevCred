from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import requests


class GitHubProfileView(APIView):
    """
    Fetches a GitHub user's public profile information.
    Requires the 'username' field in the POST body.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.data.get("username")
        if not username:
            return Response({"error": "GitHub username is required"}, status=400)

        url = f"https://api.github.com/users/{username}"
        response = requests.get(url)

        if response.status_code != 200:
            return Response({"error": "Unable to fetch GitHub profile"}, status=response.status_code)

        profile_data = response.json()

        return Response({
            "login": profile_data.get("login"),
            "name": profile_data.get("name"),
            "bio": profile_data.get("bio"),
            "avatar_url": profile_data.get("avatar_url"),
            "public_repos": profile_data.get("public_repos"),
            "followers": profile_data.get("followers"),
            "following": profile_data.get("following"),
            "html_url": profile_data.get("html_url"),
        })


class GitHubRepoView(APIView):
    """
    Fetches all public repositories for a given GitHub username.
    Requires the 'username' field in the POST body.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.data.get("username")
        if not username:
            return Response({"error": "GitHub username is required"}, status=400)

        url = f"https://api.github.com/users/{username}/repos"
        response = requests.get(url)

        if response.status_code != 200:
            return Response({"error": "Unable to fetch repositories"}, status=response.status_code)

        repos = response.json()

        repo_list = [
            {
                "name": repo.get("name"),
                "html_url": repo.get("html_url"),
                "description": repo.get("description"),
                "language": repo.get("language"),
                "stargazers_count": repo.get("stargazers_count"),
            }
            for repo in repos
        ]

        return Response({
            "total_repos": len(repo_list),
            "repositories": repo_list
        })
