from django.db.models import Sum
from django.http import HttpResponse
from django.conf import settings
import os
from django.shortcuts import get_object_or_404, render
from django.template.loader import render_to_string
from rest_framework import generics, permissions, status, filters, serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from weasyprint import HTML, CSS

from .models import Resume, Education, ResumeAnalytics, WorkExperience, Skill, PersonalDetails, Award, Favorite
from .serializers import ResumeSerializer, PersonalDetailsSerializer, sanitize_resume_data
from .enums import PrivacySettings, ResumeStatus
from users.authentication import CookieJWTAuthentication

class ResumeStatsView(generics.RetrieveAPIView):
    """
    API endpoint to retrieve detailed stats for a resume.
    Only the owner may view stats for a resume if its status is PUBLISHED.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ResumeSerializer

    def get_object(self):
        resume = get_object_or_404(Resume, pk=self.kwargs['pk'])
        # Only allow access if the resume is published and the user is the owner.
        if resume.resume_status == ResumeStatus.PUBLISHED and resume.user != self.request.user:
            self.permission_denied(self.request, message="Not authorized to view these stats.")
        return resume

class PublicResumesView(generics.ListAPIView):
    """
    API to list public resumes only.
    """

    serializer_class = ResumeSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'updated_at', 'title', 'user__username']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Resume.objects.filter(
            privacy_setting=PrivacySettings.PUBLIC
        ).select_related('analytics')

        # If user is authenticated, exclude their own resumes
        if self.request.user.is_authenticated:
            queryset = queryset.exclude(user=self.request.user)

        return queryset

    def get_serializer_context(self):
        return {'request': self.request}

class ResumeHTMLView(generics.GenericAPIView):
    """View resume in browser as HTML"""
    permission_classes = [permissions.AllowAny]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request, pk):
        resume = get_object_or_404(Resume, pk=pk)

        # print("Authenticated user:", request.user)
        # print("Resume owner:", resume.user)

        if request.user != resume.user:
            analytics, _ = ResumeAnalytics.objects.get_or_create(resume=resume)
            analytics.views += 1
            analytics.save()

        # Privacy check
        if resume.privacy_setting == PrivacySettings.PRIVATE and resume.user != request.user:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

        is_owner = request.user == resume.user
        should_anonymize = resume.is_anonymized and not is_owner
        data = sanitize_resume_data(resume, is_anonymized=should_anonymize)

        return render(request, f"resumes/{resume.template}.html", {
            "resume": data
        })


class ResumePDFDownloadView(generics.GenericAPIView):
    """Generate and return resume as downloadable PDF"""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        resume = get_object_or_404(Resume, pk=pk)

        if request.user != resume.user:
            analytics, _ = ResumeAnalytics.objects.get_or_create(resume=resume)
            analytics.downloads += 1
            analytics.save()

        # Authorization
        if resume.privacy_setting == PrivacySettings.PRIVATE and resume.user != request.user:
            return Response({"error": "Not authorized"}, status=403)

        is_owner = request.user == resume.user
        data = sanitize_resume_data(resume, is_anonymized=not is_owner)

        template_html = render_to_string(f"resumes/{resume.template}.html", {"resume": data})

        css_path = os.path.join(settings.BASE_DIR, "resumes", "static", "resumes", "css", f"{resume.template}.css")

        if not os.path.exists(css_path):
            return Response({"error": f"CSS file not found: {css_path}"}, status=500)

        pdf_file = HTML(string=template_html).write_pdf(stylesheets=[CSS(css_path)])

        response = HttpResponse(pdf_file, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{resume.title}.pdf"'
        return response
class ResumeListCreateView(generics.ListCreateAPIView):
    """
    API to list all resumes and create a new resume.
    """
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'updated_at', 'title', 'user__username']
    ordering = ['-created_at']

    def create(self, request, *args, **kwargs):
        print("Incoming data:", request.data)  # Add this line
        return super().create(request, *args, **kwargs)

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

    def handle_exception(self, exc):
        if isinstance(exc, serializers.ValidationError):
            print("Validation errors:", exc.detail)
        return super().handle_exception(exc)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_permissions(self):
        return [AllowAny()]

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

        serializer = ResumeSerializer(
            instance,
            data=data,
            partial=True,
            context={"request": request}
        )

        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as exc:
            print("❌ Resume Update Validation Error:", exc.detail)
            raise

        serializer.save()

        return Response(ResumeSerializer(instance, context={"request": request}).data)

    def destroy(self, request, *args, **kwargs):
        """
        Handles deleting a resume along with its related sections.
        """
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Resume deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class ToggleFavoriteResumeView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def post(self, request, pk):
        resume = get_object_or_404(Resume, pk=pk)
        if resume.user == request.user:
            return Response({"error": "Cannot favorite your own resume."}, status=status.HTTP_400_BAD_REQUEST)
        was_favorited = resume.favorited_by.filter(user=request.user).exists()
        
        if was_favorited:
            Favorite.objects.filter(user=request.user, resume=resume).delete()
        else:
            Favorite.objects.create(user=request.user, resume=resume)
        
        # Force refresh from database
        resume.refresh_from_db()
        
        serializer = ResumeSerializer(resume, context={
            'request': request  # Crucial for is_favorited calculation
        })
        
        return Response({
            "is_favorited": not was_favorited,
            "resume": serializer.data
        })

class UserStatsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    
    def get(self, request):
        user = request.user
        total_views = ResumeAnalytics.objects.filter(
            resume__user=user
        ).aggregate(total=Sum('views'))['total'] or 0
        
        total_downloads = ResumeAnalytics.objects.filter(
            resume__user=user
        ).aggregate(total=Sum('downloads'))['total'] or 0
        
        total_favorites = Favorite.objects.filter(
            resume__user=user
        ).exclude(user=user).count()

        return Response({
            'views': total_views,
            'downloads': total_downloads,
            'favorites': total_favorites
        })