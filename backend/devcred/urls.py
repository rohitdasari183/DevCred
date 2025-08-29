from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Users & Auth
    path('api/users/', include('users.urls')),        # signup, me, dashboard
    path('api/auth/', include('users.auth_urls')),    # login/refresh/verify

    # Core Apps
    path('api/contributions/', include('contributions.urls')),  # contributions + requests
    path('api/endorsements/', include('endorsements.urls')),    # endorsements
    path('api/videos/', include('videos.urls')),                # mentoring videos
    path('api/integrations/', include('integrations.urls')),    # GitHub API integrations
    path('api/resume/', include('resume.urls')),                # resume generator
    path('api/messaging/', include('messaging.urls')),          # chat/messages

    # For media streaming
    path('', include('videos.urls')),  # so /media-stream works
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
