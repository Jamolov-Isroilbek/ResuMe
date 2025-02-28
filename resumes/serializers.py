from rest_framework import serializers
from .models import Resume, PersonalDetails, Education, WorkExperience, Skill, Award 

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
    user = serializers.StringRelatedField()  # ✅ Prevents infinite recursion
    personal_details = serializers.SerializerMethodField()
    education = serializers.SerializerMethodField()
    work_experience = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()
    awards = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = ["id", "title", "privacy_setting", "user", "personal_details", "education", "work_experience", "skills", "awards"]

    def get_personal_details(self, obj):
        try:
            pd = obj.personal_details  # Get the single related object
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
