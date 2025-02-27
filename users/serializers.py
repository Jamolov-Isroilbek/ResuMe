from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """

    password = serializers.CharField(write_only=True) # Ensure password is write-only
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'is_public']
        
    def create(self, validated_data):
        """
        Create and return a new user with hashed password.
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_public=validated_data.get('is_public', True) # Default to True
        )
        return user
    
class UserProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "date_joined", "profile_picture"]
        # extra_kwargs = {"email": {"required": False}}

    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.profile_picture:
            return request.build_absolute_uri(obj.profile_picture.url) if request else obj.profile_picture.url
        return request.build_absolute_uri("/media/profile_pics/default.png")

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)