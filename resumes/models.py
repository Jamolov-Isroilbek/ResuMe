from django.db import models
from users.models import User
from .enums import ResumeStatus, PrivacySettings

class Resume(models.Model):
    """
    Represents a Resume linked to a User
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE) # User-Resume relationship (1-to many)
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True) # Auto-set when resume is created
    updated_at = models.DateTimeField(auto_now=True) # Auto-update when modified
    resume_status = models.CharField(max_length=20, choices=ResumeStatus.choices, default=ResumeStatus.DRAFT)
    privacy_settings = models.CharField(max_length=10, choices=PrivacySettings.choices, default=PrivacySettings.PRIVATE)

    def __str__(self):
        return self.title
    
class Section(models.Model):
    """
    Represents a section in a resume (e.g., Work Experience, Skills)
    """
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=255)
    content = models.TextField()

    def __str__(self):
        return f"{self.title} - {self.resume.title}"