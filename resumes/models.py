from django.db import models, migrations
from django.core.validators import URLValidator
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from users.models import User
from .enums import ResumeStatus, PrivacySettings, SkillType

User = get_user_model()

class Resume(models.Model):
    """
    Represents a Resume linked to a User
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes', null=True)
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resume_status = models.CharField(max_length=20, choices=ResumeStatus.choices, default=ResumeStatus.DRAFT)
    privacy_setting = models.CharField(max_length=10, choices=PrivacySettings.choices, default=PrivacySettings.PRIVATE)
    template = models.CharField(max_length=50, default="template_classic")
    is_anonymized = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return self.title

class PersonalDetails(models.Model):
    resume = models.OneToOneField(Resume, on_delete=models.CASCADE, related_name="personal_details", primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=100)
    website = models.URLField(blank=True, null=True, validators=[URLValidator()])
    github = models.URLField(blank=True, null=True, validators=[URLValidator()])
    linkedin = models.URLField(blank=True, null=True, validators=[URLValidator()])

class Education(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="education")
    institution = models.CharField(max_length=255)
    major = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    currently_studying = models.BooleanField(default=False)
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)

    def to_dict(self):
        return {
            "institution": self.institution,
            "major": self.major,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "currently_studying": self.currently_studying,
            "cgpa": self.cgpa,
        }

class WorkExperience(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="work_experience")
    employer = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    currently_working = models.BooleanField(default=False)
    description = models.TextField(blank=True, null=True)

    def to_dict(self):
        return {
            "employer": self.employer,
            "role": self.role,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "currently_working": self.currently_working,
            "location": self.location,
            "description": self.description,
        }

class Skill(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="skills")
    skill_name = models.CharField(max_length=255)
    skill_type = models.CharField(max_length=50, choices=SkillType.choices, default=SkillType.OTHER)
    proficiency = models.CharField(max_length=50, blank=True, null=True)

    def to_dict(self):
        return {
            "skill_name": self.skill_name,
            "skill_type": self.skill_type,
            "proficiency": self.proficiency,
        }


class Award(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="awards")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    year = models.IntegerField()

    def to_dict(self):
        return {
            "name": self.name,
            "description": self.description,
            "year": self.year,
        }

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="favorited_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "resume")
        verbose_name = "Favorite"
        verbose_name_plural = "Favorites"

    def __str__(self):
        return f"{self.user.username} favorited {self.resume.title}"
    
class ResumeAnalytics(models.Model):
    resume = models.OneToOneField(
        Resume, 
        on_delete=models.CASCADE, 
        related_name='analytics'
    )
    views = models.PositiveIntegerField(default=0)
    downloads = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Analytics for {self.resume.title}"
        

# Add signals to auto-create analytics
@receiver(post_save, sender=Resume)
def create_resume_analytics(sender, instance, **kwargs):
    ResumeAnalytics.objects.get_or_create(resume=instance)

def create_missing_analytics(apps, schema_editor):
    Resume = apps.get_model('resumes', 'Resume')
    ResumeAnalytics = apps.get_model('resumes', 'ResumeAnalytics')
    
    for resume in Resume.objects.all():
        ResumeAnalytics.objects.get_or_create(resume=resume)

class Migration(migrations.Migration):
    dependencies = [
        ('resumes', 'previous_migration'),
    ]

    operations = [
        migrations.RunPython(create_missing_analytics),
    ]