from django.urls import path
from .views import GitHubProfileView
from .views import GitHubRepoView


urlpatterns = [
    path('github/', GitHubProfileView.as_view(), name='github-profile'),
    path("github-repos/", GitHubRepoView.as_view(), name="github-repos"),

]
