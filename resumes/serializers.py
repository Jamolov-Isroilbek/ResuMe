from rest_framework import serializers
from .models import Resume, Section

class ResumeSerializer(serializers.ModelSerializer):
    """
    Serializer for Resume model.
    """
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Resume
        fields = ['id', 'user', 'title', 'resume_status', 'privacy_setting', 'created_at', 'updated_at']
        read_only_fileds = ['user'] # User should be assigned automatically

class SectionSerializer(serializers.ModelSerializer):
    """
    Serializer for Resume Sections.
    """
    resume_id = serializers.PrimaryKeyRelatedField(source='resume', queryset=Resume.objects.all(), write_only=True) # Allows linking section to resume
    resume_title = serializers.CharField(source='resume.title', read_only=True) # Readable Resume title
    class Meta:
        model = Section
        fields = ['id', 'resume_id', 'resume_title', 'title', 'content']

        