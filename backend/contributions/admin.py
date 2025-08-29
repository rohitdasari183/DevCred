from django.contrib import admin
from .models import Contribution

@admin.register(Contribution)
class ContributionAdmin(admin.ModelAdmin):
    list_display = ("user", "contribution_type", "title", "created_at")
    list_filter = ("contribution_type", "created_at")
    search_fields = ("title", "description", "user__username")
