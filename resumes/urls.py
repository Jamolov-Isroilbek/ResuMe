from django.urls import path
from .views import ResumeListCreateView, ResumeDetailView, ResumePDFDownloadView

urlpatterns = [
    path('resumes/', ResumeListCreateView.as_view(), name='resume-list'),
    path('resumes/<int:pk>/', ResumeDetailView.as_view(), name='resume-detail'),
    path('resumes/<int:pk>/download/', ResumePDFDownloadView.as_view(), name='resume-download'),
]