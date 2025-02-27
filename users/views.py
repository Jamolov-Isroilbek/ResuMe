from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from .serializers import RegisterSerializer, UserProfileSerializer, ChangePasswordSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    """
    API View for user registration
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """
    API for user login, Returns access & refresh tokens.
    """
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    print(f"Trying to authenticate: {username} with {password}")

    user = authenticate(username=username, password=password)

    print(f"Authentication result: {user}")

    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })
    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
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
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user
        
    def update(self, request, *args, **kwargs):
        user = self.request.user
        serializer = self.get_serializer(user, data=request.data, partial=True, context={'request': request})

        print(f"🔍 Authenticated user: {request.user}")  # ✅ Log user
        print(f"🖼 Profile Picture Path: {request.user.profile_picture}")  # ✅ Log profile picture 
        
        if serializer.is_valid():
            if "profile_picture" in request.FILES:
                user.profile_picture = request.FILES["profile_picture"]
            if "username" in request.data:
                user.username = request.data["username"]
            if "email" in request.data:
                user.email = request.data["email"]
            
            user.save()
            return Response(self.get_serializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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