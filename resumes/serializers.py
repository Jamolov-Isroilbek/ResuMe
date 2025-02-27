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
    user = serializers.SerializerMethodField()
    education = EducationSerializer(many=True)
    work_experience = WorkExperienceSerializer(many=True)
    skills = SkillSerializer(many=True)
    personal_details = PersonalDetailsSerializer()
    awards = AwardSerializer(many=True)

    class Meta:
        model = Resume
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True}
        }

    def get_user(self, obj):
        return obj.user.username

    def create(self, validated_data):
        """Handle nested creation properly"""
        education_data = validated_data.pop('education', [])
        work_experience_data = validated_data.pop('work_experience', [])
        skills_data = validated_data.pop('skills', [])
        personal_details_data = validated_data.pop('personal_details', {})
        awards_data = validated_data.pop('awards', [])

        # Create the Resume first
        resume = Resume.objects.create(**validated_data)

        # Create related models
        PersonalDetails.objects.create(resume=resume, **personal_details_data)
        
        for edu in education_data:
            edu['resume'] = resume
            Education.objects.create(**edu)
        for work in work_experience_data:
            work['resume'] = resume
            WorkExperience.objects.create(**work)
        for skill in skills_data:
            skill['resume'] = resume
            Skill.objects.create(**skill)
        for award in awards_data:
            award['resume'] = resume
            Award.objects.create(**award)

        return resume

    def update(self, instance, validated_data):
        """Handle nested updating"""
        instance.title = validated_data.get('title', instance.title)        
        instance.resume_status = validated_data.get('resume_status', instance.resume_status)
        instance.privacy_setting = validated_data.get('privacy_setting', instance.privacy_setting)
        instance.save()

        # Update Personal Details
        personal_details_data = validated_data.pop('personal_details', None)
        if personal_details_data:
            PersonalDetails.objects.update_or_create(resume=instance, defaults=personal_details_data)

        # Update related models (Education, WorkExperience, Skills, Awards)
        education_data = validated_data.pop('education', [])
        instance.education.all().delete()  # Remove old data
        for edu in education_data:
            Education.objects.create(resume=instance, **edu)

        work_experience_data = validated_data.pop('work_experience', [])
        instance.work_experience.all().delete()
        for work in work_experience_data:
            WorkExperience.objects.create(resume=instance, **work)

        skills_data = validated_data.pop('skills', [])
        instance.skills.all().delete()
        for skill in skills_data:
            Skill.objects.create(resume=instance, **skill)

        awards_data = validated_data.pop('awards', [])
        instance.awards.all().delete()
        for award in awards_data:
            Award.objects.create(resume=instance, **award)
            
        return instance
    