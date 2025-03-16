from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.settings import api_settings
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from .serializers import RegisterSerializer, UserProfileSerializer, ChangePasswordSerializer

User = get_user_model()

class CookieTokenObtainPairView(TokenObtainPairView):
    """
    Custom view that sets JWT tokens in HttpOnly cookies.
    """

    def post(self, request, *args, **kwargs):
        # Get the underlying Django HttpRequest if the request is a DRF Request
        django_request = request._request if hasattr(request, '_request') else request
        
        # Call the original TokenObtainPairView with the underlying request
        token_view = TokenObtainPairView.as_view()
        response = token_view(django_request, *args, **kwargs)
        
        if response.status_code == 200:
            data = response.data
            # Set access token in secure HttpOnly cookie.
            response.set_cookie(
                key="access",
                value=data["access"],
                httponly=True,
                secure=False,  # Change to True with HTTPS in production.
                samesite="Lax",
                max_age=int(api_settings.ACCESS_TOKEN_LIFETIME.total_seconds()),
            )
            # Set refresh token similarly.
            response.set_cookie(
                key="refresh",
                value=data["refresh"],
                httponly=True,
                secure=False,
                samesite="Lax",
                max_age=int(api_settings.REFRESH_TOKEN_LIFETIME.total_seconds()),
            )
        return response

class RegisterView(generics.CreateAPIView):
    """
    API View for user registration
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    API for user logout (Blacklist JWT token)
    """
    try:
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response({"error": "No refresh token provided"}, status=status.HTTP_400_BAD_REQUEST)

        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
    
class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API for retrieving and updating user profile details.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user
        
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)

        serializer.is_valid(raise_exception=True)
        serializer.save()  
        return Response(serializer.data)

class ChangePasswordView(generics.UpdateAPIView):
    """
    API for changing user password.
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        user = request.user
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            old_password = serializer.validated_data["old_password"]
            new_password = serializer.validated_data["new_password"]

            if not user.check_password(old_password):
                print("❌ Incorrect old password")
                return Response({"old_password": "Incorrect password"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                validate_password(new_password, user)
            except ValidationError as e:
                print("❌ Password validation failed:", e.messages)
                return Response({"new_password": e.messages}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            print("✅ Password updated successfully")
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        
        print("❌ Serializer validation failed:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)