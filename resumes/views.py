from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, JsonResponse
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
        return Resume.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        """Returns the resume with all sections."""
        instance = self.get_object()
        data = ResumeSerializer(instance).data
        return JsonResponse(data, safe=False)

    def update(self, request, *args, **kwargs):
        """Handles updating a resume and its sections without deleting old data."""
        instance = self.get_object()
        sections_data = request.data.pop("sections", [])

        # Update resume details
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Update existing sections instead of deleting them
        existing_sections = {section.id: section for section in instance.sections.all()}
        for section_data in sections_data:
            section_id = section_data.get("id", None)

            if section_id and section_id in existing_sections:
                # Update existing section
                existing_section = existing_sections[section_id]
                existing_section.title = section_data["title"]
                existing_section.content = section_data["content"]
                existing_section.save()
            else:
                # Create new section
                Section.objects.create(resume=instance, **section_data)

        return JsonResponse(serializer.data, safe=False)

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
    
