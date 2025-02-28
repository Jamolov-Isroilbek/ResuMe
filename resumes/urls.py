from django.urls import path
from .views import PublicResumesView, ResumeHTMLView, ResumeListCreateView, ResumeDetailView, ResumePDFDownloadView

urlpatterns = [
    path('resumes/', ResumeListCreateView.as_view(), name='resume-list'),
    path('resumes/<int:pk>/', ResumeDetailView.as_view(), name='resume-detail'),
    path('resumes/<int:pk>/download/', ResumePDFDownloadView.as_view(), name='resume-download'),
    path('public-resumes/', PublicResumesView.as_view(), name="public-resumes"),
    path('public-resumes/<int:pk>', ResumeDetailView.as_view(), name="public-resumes-detail"),
    path('resumes/<int:pk>/view/', ResumeHTMLView.as_view(), name='resume-view'),
]