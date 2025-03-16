from rest_framework import serializers
from .models import Resume, PersonalDetails, Education, WorkExperience, Skill, Award 
from django.contrib.auth import get_user_model
from .enums import ResumeStatus

User = get_user_model()
class PersonalDetailsSerializer(serializers.ModelSerializer):
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
    personal_details = PersonalDetailsSerializer(read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    work_experience = WorkExperienceSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    awards = AwardSerializer(many=True, read_only=True)
    favorite_count = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    views_count = serializers.SerializerMethodField()
    downloads_count = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = [
            "id", 
            "title", 
            "resume_status",
            "privacy_setting", 
            "user", 
            "personal_details", 
            "education", 
            "work_experience", 
            "skills", 
            "awards",
            "favorite_count",
            "is_favorited",
            "views_count",
            "downloads_count",
        ]

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "username": obj.user.username
        }

    def get_personal_details(self, obj):
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