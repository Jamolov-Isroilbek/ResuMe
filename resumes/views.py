from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from .models import Resume, Section
from .serializers import ResumeSerializer, SectionSerializer
from .utils import generate_resume_pdf

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
        """Creates a resume and its sections."""
        sections_data = self.request.data.get("sections", [])
        print("Received sections:", sections_data)  # Debug log

        resume = serializer.save(user=self.request.user)  # Create resume

        # Validate sections format before saving
        if isinstance(sections_data, list):  
            for section_data in sections_data:
                Section.objects.create(resume=resume, **section_data)
        else:
            print("Invalid sections format:", sections_data)  # Log error

        return Response(ResumeSerializer(resume).data, status=status.HTTP_201_CREATED)


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

class ResumePDFDownloadView(generics.GenericAPIView):
    """API to generate and download a resume as a PDF."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        """Generates and returns a PDF for the given resume."""
        resume = get_object_or_404(Resume, pk=pk, user=request.user)
        pdf_file = generate_resume_pdf(resume)

        response = HttpResponse(pdf_file, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{resume.title}.pdf"'
        return response
    
