import requests

def fetch_github_repos(username: str):
    url = f"https://api.github.com/users/{username}/repos"
    response = requests.get(url)

    if response.status_code != 200:
        raise Exception("Failed to fetch GitHub repositories")

    repos = response.json()

    # Filter: only original project repos
    project_repos = [
        {
            "name": repo["name"],
            "html_url": repo["html_url"],
            "description": repo.get("description"),
            "created_at": repo["created_at"],
        }
        for repo in repos
        if not repo["fork"] and not repo["archived"]
    ]

    return {
        "total_repos": len(project_repos),
        "projects": project_repos,
    }
