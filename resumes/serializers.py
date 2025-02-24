from rest_framework import serializers
from .models import Resume

class ResumeSerializer(serializers.ModelSerializer):
    """
    Serializer for Resume model.
    """
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Resume
        fields = ['id', 'user', 'title', 'resume_status', 'privacy_setting', 'created_at', 'updated_at']
        read_only_fileds = ['user'] # User should be assigned automatically

    def get_sections(self, obj):
        """
        Fetch sections related to this resume
        """
        return None