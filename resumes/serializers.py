from rest_framework import serializers
from .models import Resume, Section

class ResumeSerializer(serializers.ModelSerializer):
    """
    Serializer for Resume model.
    """
    class Meta:
        model = Resume
        fields = ['id', 'user', 'title', 'resume_status', 'privacy_setting', 'created_at', 'updated_at']
        read_only_fileds = ['user'] # User should be assigned automatically

class SectionSerializer(serializers.ModelSerializer):
    """
    Serializer for Resume Sections.
    """
    class Meta:
        model = Section
        fields = ['id', 'resume', 'title', 'content']

        