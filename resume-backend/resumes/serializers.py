import re
from rest_framework import serializers
from .models import Project, Resume, PersonalDetails, Education, WorkExperience, Skill, Award 
from django.contrib.auth import get_user_model
from .enums import PrivacySettings, ResumeStatus

User = get_user_model()
class PersonalDetailsSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    class Meta:
        model = PersonalDetails
        fields = '__all__'
        extra_kwargs = {'resume': {'required': False}}

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'
        extra_kwargs = {'resume': {'required': False}}

class WorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        fields = '__all__'
        extra_kwargs = {'resume': {'required': False}}

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
        extra_kwargs = {'resume': {'required': False}}


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'
        extra_kwargs = {'resume': {'required': False}}

class AwardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Award
        fields = '__all__'
        extra_kwargs = {'resume': {'required': False}}
    
class ResumeSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    personal_details = PersonalDetailsSerializer()
    education = EducationSerializer(many=True)
    work_experience = WorkExperienceSerializer(many=True)
    projects = ProjectSerializer(many=True, required=False)
    skills = SkillSerializer(many=True)
    awards = AwardSerializer(many=True, required=False)
    favorite_count = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    views_count = serializers.SerializerMethodField()
    downloads_count = serializers.SerializerMethodField()
    is_anonymized = serializers.BooleanField(required=False, default=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        data = self.initial_data if hasattr(self, 'initial_data') else {}
        if data.get("resume_status") == ResumeStatus.DRAFT:
            self.fields 

    class Meta:
        model = Resume
        fields = [
            "id", 
            "title", 
            "resume_status",
            "privacy_setting", 
            "template",
            "is_anonymized",
            "created_at",
            "updated_at",
            "user", 
            "personal_details", 
            "education", 
            "work_experience", 
            "projects",
            "skills", 
            "awards",
            "favorite_count",
            "is_favorited",
            "views_count",
            "downloads_count",
        ]

    def get_user(self, obj):
        if obj.is_anonymized and obj.privacy_setting == PrivacySettings.PUBLIC:
            return {
                "id": None,
                "username": "Anonymous"
            }
        return {
            "id": obj.user.id,
            "username": obj.user.username
        }

    def get_personal_details(self, obj):
        if obj.is_anonymized and obj.privacy_setting == PrivacySettings.PUBLIC:
            return {
                "first_name": "XXX",
                "last_name": "XXX",
                "email": "xxx@email.com",
                "phone": "xxx-xxx-xxxx",
                "website": None,
                "github": None,
                "linkedin": None
            }
        try:
            pd = obj.personal_details
            return {
                "first_name": pd.first_name,
                "last_name": pd.last_name,
                "email": pd.email,
                "phone": pd.phone,
                "website": pd.website,
                "github": pd.github,
                "linkedin": pd.linkedin
            }
        except PersonalDetails.DoesNotExist:
            return {}

    def get_education(self, obj):
        return [
            {
                "institution": edu.institution,
                "major": edu.major,
                "start_date": edu.start_date,
                "end_date": edu.end_date,
                "cgpa": edu.cgpa
            }
            for edu in obj.education.all()
        ]

    def get_work_experience(self, obj):
        return [
            {
                "employer": work.employer,
                "role": work.role,
                "start_date": work.start_date,
                "end_date": work.end_date,
                "description": work.description
            }
            for work in obj.work_experience.all()
        ]
    
    def get_projects(self, obj):
        return [
            {
                "title": project.title,
                "description": project.description,
                "technologies": project.technologies,
                "start_date": project.start_date,
                "end_date": project.end_date,
            }
            for project in obj.projects.all()
        ]

    def get_skills(self, obj):
        return [
            {
                "skill_name": skill.skill_name,
                "skill_type": skill.skill_type
            }
            for skill in obj.skills.all()
        ]

    def get_awards(self, obj):
        return [
            {
                "name": award.name,
                "description": award.description,
                "year": award.year
            }
            for award in obj.awards.all()
        ]
    
    def get_is_favorited(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False
    
    def get_favorite_count(self, obj):
        request = self.context.get("request")
        if obj.resume_status == ResumeStatus.PUBLISHED and (request and request.user == obj.user):
            return obj.favorited_by.count()
        return None
    
    def get_views_count(self, obj):
        request = self.context.get("request")
        if obj.resume_status == ResumeStatus.PUBLISHED and (request and request.user == obj.user):
            return obj.analytics.views if hasattr(obj, 'analytics') else 0
        return None

    def get_downloads_count(self, obj):
        request = self.context.get("request")
        if obj.resume_status == ResumeStatus.PUBLISHED and (request and request.user == obj.user):
            return obj.analytics.downloads if hasattr(obj, 'analytics') else 0
        return None
    
    # In serializers.py - Update the validate method
    def validate(self, data):
        resume_status = data.get('resume_status', getattr(self.instance, 'resume_status', ResumeStatus.DRAFT))
    
        # For drafts, only validate that title exists
        if resume_status == ResumeStatus.DRAFT:
            if not data.get('title') and (not self.instance or not self.instance.title):
                raise serializers.ValidationError({'title': 'Title is required even for drafts'})
            return data
    
        # Only validate when publishing or updating a published resume
        if resume_status == ResumeStatus.PUBLISHED:
            errors = {}
    
            # Check personal details
            if 'personal_details' in data:
                personal_details = data.get('personal_details', {})
                if not personal_details or not personal_details.get('first_name') or not personal_details.get('last_name') or not personal_details.get('email') or not personal_details.get('phone'):
                    errors['personal_details'] = "Complete personal details are required for published resumes"
                elif not re.match(r'^\S+@\S+\.\S+$', personal_details.get('email', '')):
                    errors['personal_details'] = "A valid email address is required"
                elif not re.match(r'^\+?\d{7,15}$', personal_details.get('phone', '')):
                    errors['personal_details'] = "A valid phone number is required"
            elif not self.instance or not hasattr(self.instance, 'personal_details'):
                errors['personal_details'] = "Required for published resumes"
    
            # Check education
            if 'education' in data and not data.get('education'):
                errors['education'] = "At least one education entry is required"
            elif not self.instance or not self.instance.education.exists():
                errors['education'] = "At least one education entry is required"
    
            # Check if there's at least one work experience or project
            has_work_experience = False
            has_projects = False
            
            if 'work_experience' in data:
                has_work_experience = bool(data.get('work_experience'))
            elif self.instance and self.instance.work_experience.exists():
                has_work_experience = True
                
            if 'projects' in data:
                has_projects = bool(data.get('projects'))
            elif self.instance and self.instance.projects.exists():
                has_projects = True
                
            if not has_work_experience and not has_projects:
                errors['experience'] = "At least one work experience or project entry is required"
    
            # Check skills
            if 'skills' in data and not data.get('skills'):
                errors['skills'] = "At least one skill is required"
            elif not self.instance or not self.instance.skills.exists():
                errors['skills'] = "At least one skill is required"
    
            if errors:
                raise serializers.ValidationError(errors)
    
        return data

    def to_internal_value(self, data):
        internal = super().to_internal_value(data)

        # Force is_anonymized into validated_data
        if "is_anonymized" in self.initial_data:
            internal["is_anonymized"] = self.initial_data["is_anonymized"]

        return internal

    
    def create(self, validated_data):
        # Mandatory fields
        personal_details_data = validated_data.pop('personal_details')
        education_data = validated_data.pop('education', [])
        work_experience_data = validated_data.pop('work_experience', [])
        skills_data = validated_data.pop('skills', [])
                
        # Optional fields
        awards_data = validated_data.pop('awards', [])
        projects_data = validated_data.pop('projects', [])

        resume = Resume.objects.create(**validated_data)
        
        # Create required relationships
        PersonalDetails.objects.create(resume=resume, **personal_details_data)
        Education.objects.bulk_create([Education(resume=resume, **edu) for edu in education_data])
        WorkExperience.objects.bulk_create([WorkExperience(resume=resume, **work) for work in work_experience_data])
        Skill.objects.bulk_create([Skill(resume=resume, **skill) for skill in skills_data])

        if projects_data:
            Project.objects.bulk_create([Project(resume=resume, **project) for project in projects_data])

        if awards_data:
            Award.objects.bulk_create([Award(resume=resume, **award) for award in awards_data])
        return resume

    def update(self, instance, validated_data):
        # Update simple fields
        instance.title = validated_data.get('title', instance.title)
        instance.resume_status = validated_data.get('resume_status', instance.resume_status)
        instance.privacy_setting = validated_data.get('privacy_setting', instance.privacy_setting)
        instance.template = validated_data.get('template', instance.template)
        instance.is_anonymized = validated_data.get('is_anonymized', instance.is_anonymized)
        instance.save()

        # Update personal details
        personal_details_data = validated_data.get('personal_details', {})
        if personal_details_data:
            personal_details = instance.personal_details
            for attr, value in personal_details_data.items():
                setattr(personal_details, attr, value)
            personal_details.save()

        # Handle nested updates (education, work_experience, etc)
        if 'education' in validated_data:
            self.update_related_objects(instance, 'education', Education, validated_data.get('education', []))
        if 'work_experience' in validated_data:
            self.update_related_objects(instance, 'work_experience', WorkExperience, validated_data.get('work_experience', []))
        if 'projects' in validated_data:
            self.update_related_objects(instance, 'projects', Project, validated_data.get('projects', []))
        if 'skills' in validated_data:
            self.update_related_objects(instance, 'skills', Skill, validated_data.get('skills', []))
        if 'awards' in validated_data:
            self.update_related_objects(instance, 'awards', Award, validated_data.get('awards', []))

        return instance

    def update_related_objects(self, resume, field_name, model_class, items_data):
        # Delete existing items
        getattr(resume, field_name).all().delete()
        # Create new items
        if items_data:
            objects = [model_class(resume=resume, **item_data) for item_data in items_data]
            model_class.objects.bulk_create(objects)

def sanitize_resume_data(resume, is_anonymized=False):
    return {
        "title": resume.title,
        "template": resume.template,
        "resume_status": resume.resume_status,
        "privacy_setting": resume.privacy_setting,
        "is_anonymized": is_anonymized,
        "personal_details": {
            "first_name": "Anonymous" if is_anonymized else resume.personal_details.first_name,
            "last_name": "" if is_anonymized else resume.personal_details.last_name,
            "email": "xxx@example.com" if is_anonymized else resume.personal_details.email,
            "phone": "xxx-xxx-xxxx" if is_anonymized else resume.personal_details.phone,
            "website": "hidden.com" if is_anonymized else resume.personal_details.website,
            "github": None if is_anonymized else resume.personal_details.github,
            "linkedin": None if is_anonymized else resume.personal_details.linkedin,
        },
        "education": [edu.to_dict() for edu in resume.education.all()],
        "work_experience": [exp.to_dict() for exp in resume.work_experience.all()],
        "projects": [project.to_dict() for project in resume.projects.all()],
        "skills": [skill.to_dict() for skill in resume.skills.all()],
        "awards": [award.to_dict() for award in resume.awards.all()],
    }
