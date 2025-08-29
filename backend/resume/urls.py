from django.urls import path
from .views import ResumeGenerateView,ResumePDFDownloadView

urlpatterns = [
    path('generate/', ResumeGenerateView.as_view(), name='generate-resume'),
    path('download/', ResumePDFDownloadView.as_view(), name='download-resume'),

]
