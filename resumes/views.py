from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from weasyprint import HTML
from .models import Resume, Education, WorkExperience, Skill, PersonalDetails, Award, Favorite
from .serializers import ResumeSerializer, PersonalDetailsSerializer
from django.template.loader import render_to_string
from .enums import PrivacySettings
from users.authentication import CookieJWTAuthentication

class PublicResumesView(generics.ListAPIView):
    """
    API to list public resumes only.
    """
    queryset = Resume.objects.filter(privacy_setting=PrivacySettings.PUBLIC)
    serializer_class = ResumeSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'updated_at', 'title', 'user__username']
    ordering = ['-created_at']

    def get_serializer_context(self):
        return {'request': self.request}

class ResumeHTMLView(generics.GenericAPIView):
    """Renders resume as HTML template"""
    permission_classes = [permissions.AllowAny]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request, pk):
        resume = get_object_or_404(Resume, pk=pk)
        
        if resume.privacy_setting == PrivacySettings.PRIVATE and resume.user != request.user:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        
        return render(request, "resumes/resume_template.html", {"resume": resume})

class ResumeListCreateView(generics.ListCreateAPIView):
    """
    API to list all resumes and create a new resume.
    """
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'updated_at', 'title', 'user__username']
    ordering = ['-created_at']

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        resume = serializer.save(user=user)

        personal_details_data = self.request.data.get('personal_details', {})
        PersonalDetails.objects.create(resume=resume, **personal_details_data)

        Education.objects.bulk_create([
            Education(resume=resume, **edu) 
            for edu in self.request.data.get('education', [])
        ])

        WorkExperience.objects.bulk_create([
            WorkExperience(resume=resume, **work_exp)
            for work_exp in self.request.data.get('work_experience', [])
        ])

        Skill.objects.bulk_create([
            Skill(resume=resume, **skill)
            for skill in self.request.data.get('skills', [])
        ])

        Award.objects.bulk_create([
            Award(resume=resume, **award)
            for award in self.request.data.get('awards', [])
        ])

        print("✅ All Sections Saved for Resume ID:", resume.id)
  
    
    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

class ResumeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API to retrieve, update, or delete a single resume.
    """
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer

    def get_permissions(self):
        obj = get_object_or_404(Resume, pk=self.kwargs['pk'])
        if obj.privacy_setting == PrivacySettings.PUBLIC and self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)
    
    def check_object_permissions(self, request, obj):
        if obj.privacy_setting == PrivacySettings.PRIVATE and obj.user != request.user:
            self.permission_denied(request)
        super().check_object_permissions(request, obj)

    def retrieve(self, request, *args, **kwargs):
        """
        Returns the resume along with all related sections.
        """
        instance = self.get_object()
        return Response(ResumeSerializer(instance).data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data.copy() 

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        if "personal_details" in data:
            personal_details, _ = PersonalDetails.objects.get_or_create(resume=instance)
            personal_details_serializer = PersonalDetailsSerializer(personal_details, data=data["personal_details"], partial=True)
            personal_details_serializer.is_valid(raise_exception=True)
            personal_details_serializer.save()

        if "education" in data:
            Education.objects.filter(resume=instance).delete()
            education_objects = [Education(resume=instance, **edu) for edu in data["education"]]
            Education.objects.bulk_create(education_objects)

        if "work_experience" in data:
            WorkExperience.objects.filter(resume=instance).delete()
            work_experience_objects = [WorkExperience(resume=instance, **work) for work in data["work_experience"]]
            WorkExperience.objects.bulk_create(work_experience_objects)

        if "skills" in data:
            Skill.objects.filter(resume=instance).delete()
            skill_objects = [Skill(resume=instance, **skill) for skill in data["skills"]]
            Skill.objects.bulk_create(skill_objects)

        if "awards" in data:
            Award.objects.filter(resume=instance).delete()
            award_objects = [Award(resume=instance, **award) for award in data["awards"]]
            Award.objects.bulk_create(award_objects)

        return Response(ResumeSerializer(instance).data)

    def destroy(self, request, *args, **kwargs):
        """
        Handles deleting a resume along with its related sections.
        """
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Resume deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class ToggleFavoriteResumeView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request, pk):
        resume = get_object_or_404(Resume, pk=pk)
        # Prevent users from favoriting their own resume
        if resume.user == request.user:
            return Response({"error": "Cannot favorite your own resume."}, status=status.HTTP_400_BAD_REQUEST)
        favorite, created = Favorite.objects.get_or_create(user=request.user, resume=resume)
        if not created:
            # Already favorited; remove favorite
            favorite.delete()
            return Response({"is_favorited": False})
        return Response({"is_favorited": True})

class ResumePDFDownloadView(generics.GenericAPIView):
    """
    API to generate and download a resume as a PDF.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        """
        Generates and returns a PDF for the given resume.
        """
        resume = get_object_or_404(Resume, pk=pk, user=request.user)

         # Authorization check
        if resume.privacy_setting != PrivacySettings.PUBLIC and not request.user.is_authenticated:
            return Response({"error": "Not authorized"}, status=403)
        if resume.privacy_setting == PrivacySettings.PRIVATE and resume.user != request.user:
            return Response({"error": "Not authorized"}, status=403)

        html_string = render_to_string("resumes/resume_template.html", {"resume": resume})
        pdf_file = HTML(string=html_string).write_pdf()


        if not pdf_file:
            return Response({"error": "Failed to generate PDF"}, status=500)

        response = HttpResponse(pdf_file, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{resume.title}.pdf"'
        return response
