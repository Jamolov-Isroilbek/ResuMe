from rest_framework import serializers
from .models import Resume, Section

class SectionSerializer(serializers.ModelSerializer):
    """
    Serializer for Resume Sections.
    """
    resume_id = serializers.PrimaryKeyRelatedField(source='resume', queryset=Resume.objects.all(), write_only=True) # Allows linking section to resume
    resume_title = serializers.CharField(source='resume.title', read_only=True) # Readable Resume title
    class Meta:
        model = Section
        fields = ['id', 'resume_id', 'resume_title', 'title', 'content']

class ResumeSerializer(serializers.ModelSerializer):
    """
    Serializer for Resume model.
    """
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    sections = SectionSerializer(many=True, read_only=True)

    class Meta:
        model = Resume
        fields = ['id', 'user', 'title', 'resume_status', 'privacy_setting', 'sections', 'created_at', 'updated_at']
        read_only_fileds = ['user'] # User should be assigned automatically

    def get_sections(self, obj):
        """
        Fetch sections related to this resume
        """
        return SectionSerializer(obj.sections.all(), many=True).data
      