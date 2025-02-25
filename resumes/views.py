import traceback

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.db import transaction
from .models import Resume, Education, WorkExperience, Skill, PersonalDetails, Award
from .serializers import ResumeSerializer, EducationSerializer, WorkExperienceSerializer, SkillSerializer, PersonalDetailsSerializer
from .utils import generate_resume_pdf

class ResumeListCreateView(generics.ListCreateAPIView):
    """
    API to list all resumes and create a new resume.
    """
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

class ResumeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API to retrieve, update, or delete a single resume.
    """
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        """
        Returns the resume along with all related sections.
        """
        instance = self.get_object()
        return Response(ResumeSerializer(instance).data)

    def update(self, request, *args, **kwargs):
        """
        Handles updating a resume along with its related sections.
        """
        instance = self.get_object()
        data = request.data
        sections_data = data.pop("sections", {})

        # ✅ Update Resume details
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # ✅ Update Personal Details
        if "personal_details" in sections_data:
            personal_details, _ = PersonalDetails.objects.get_or_create(resume=instance)
            for key, value in sections_data["personal_details"].items():
                setattr(personal_details, key, value)
            personal_details.save()

        # ✅ Update Education
        if "education" in sections_data:
            Education.objects.filter(resume=instance).delete()  # Remove old
            education_objects = [Education(resume=instance, **edu) for edu in sections_data["education"]]
            Education.objects.bulk_create(education_objects)

        # ✅ Update Work Experience
        if "work_experience" in sections_data:
            WorkExperience.objects.filter(resume=instance).delete()  # Remove old
            work_experience_objects = [WorkExperience(resume=instance, **work) for work in sections_data["work_experience"]]
            WorkExperience.objects.bulk_create(work_experience_objects)

        # ✅ Update Skills
        if "skills" in sections_data:
            Skill.objects.filter(resume=instance).delete()  # Remove old
            skill_objects = [Skill(resume=instance, **skill) for skill in sections_data["skills"]]
            Skill.objects.bulk_create(skill_objects)

        return Response(ResumeSerializer(instance).data)

    def destroy(self, request, *args, **kwargs):
        """
        Handles deleting a resume along with its related sections.
        """
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Resume deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


class ResumePDFDownloadView(generics.GenericAPIView):
    """
    API to generate and download a resume as a PDF.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        """
        Generates and returns a PDF for the given resume.
        """
        resume = get_object_or_404(Resume, pk=pk, user=request.user)
        pdf_file = generate_resume_pdf(resume)

        response = HttpResponse(pdf_file, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{resume.title}.pdf"'
        return response
