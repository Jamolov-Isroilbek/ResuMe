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
    personal_details = PersonalDetailsSerializer()
    education = EducationSerializer(many=True)
    work_experience = WorkExperienceSerializer(many=True)
    skills = SkillSerializer(many=True)
    awards = AwardSerializer(many=True, required=False)
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
            "template",
            "created_at",
            "updated_at",
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
    
    def validate(self, data):
        resume_status = data.get('resume_status')
        existing_status = self.instance.resume_status if self.instance else None
        
        # Only validate when publishing or updating a published resume
        if resume_status == ResumeStatus.PUBLISHED:
            errors = {}
            
            # Check if fields are being modified
            if 'personal_details' in data and not data.get('personal_details'):
                errors['personal_details'] = "Required for published resumes"
                
            if 'education' in data and not data.get('education'):
                errors['education'] = "At least one entry required"
                
            if 'work_experience' in data and not data.get('work_experience'):
                errors['work_experience'] = "At least one entry required"
                
            if 'skills' in data and not data.get('skills'):
                errors['skills'] = "At least one skill required"
                
            # For existing published resumes, check existing data if fields not in update
            if not data.get('personal_details') and not self.instance.personal_details:
                errors['personal_details'] = "Required for published resumes"
                
            if not data.get('education') and not self.instance.education.exists():
                errors['education'] = "At least one entry required"
                
            if not data.get('work_experience') and not self.instance.work_experience.exists():
                errors['work_experience'] = "At least one entry required"
                
            if not data.get('skills') and not self.instance.skills.exists():
                errors['skills'] = "At least one skill required"
    
            if errors:
                raise serializers.ValidationError(errors)
                
        return data
    
    def create(self, validated_data):
        # Mandatory fields
        personal_details_data = validated_data.pop('personal_details')
        education_data = validated_data.pop('education', [])
        work_experience_data = validated_data.pop('work_experience', [])
        skills_data = validated_data.pop('skills', [])
                
        # Optional fields
        awards_data = validated_data.pop('awards', [])

        resume = Resume.objects.create(**validated_data)
        
        # Create required relationships
        PersonalDetails.objects.create(resume=resume, **personal_details_data)
        Education.objects.bulk_create([Education(resume=resume, **edu) for edu in education_data])
        WorkExperience.objects.bulk_create([WorkExperience(resume=resume, **work) for work in work_experience_data])

        # Handle optional awards
        if awards_data:
            Award.objects.bulk_create([Award(resume=resume, **award) for award in awards_data])
        return resume

    def update(self, instance, validated_data):
        # Update simple fields
        instance.title = validated_data.get('title', instance.title)
        instance.resume_status = validated_data.get('resume_status', instance.resume_status)
        instance.privacy_setting = validated_data.get('privacy_setting', instance.privacy_setting)
        instance.template = validated_data.get('template', instance.template)
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