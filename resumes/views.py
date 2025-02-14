from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Resume, Section
from .serializers import ResumeSerializer, SectionSerializer

class ResumeListCreateView(generics.ListCreateAPIView):
    """
    API to list all resumes and create a new resume.
    """
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Ensures users can only see their own resumes.
        """
        return Resume.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """
        Ensures the user is assigned to the resume when creating it.
        """
        serializer.save(user=self.request.user)

class ResumeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API to retrieve, update, or delete a single resume.
    """
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Ensures users can only modify their own resumes.
        """
        return Resume.objects.filter(user=self.request.user)

class SectionListCreateView(generics.ListCreateAPIView):
    """
    API to list all sections and create a new section for a resume.
    """
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Ensures users can only see sections from resumes they own.
        """
        return Section.objects.filter(resume__user=self.request.user)
    
class SectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API to retrieve, update, or delete a single section.
    """
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Ensures users can only modify sections from resumes they own.
        """
        return Section.objects.filter(resume__user=self.request.user)

