from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.settings import api_settings
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.utils.timezone import now
from datetime import datetime, timedelta, timezone
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from django.conf import settings
from django.shortcuts import redirect
import resend
from threading import Timer
from jwt import decode as jwt_decode

from users.utils import TimedTokenGenerator

from .serializers import RegisterSerializer, UserProfileSerializer, ChangePasswordSerializer, CustomTokenObtainPairSerializer

User = get_user_model()

class CookieTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    """
    Custom login view that blocks unverified users and sets JWT tokens in HttpOnly cookies.
    """
    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(request, username=username, password=password)

        if user is None:
            raise AuthenticationFailed("Invalid username or password.")

        if not user.is_active:
            raise AuthenticationFailed("Please verify your email before logging in.")

        # Proceed with original token generation
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            data = response.data
            response.set_cookie(
                key="access",
                value=data["access"],
                httponly=True,
                secure=False,  # Set to True in production
                samesite="Lax",
                max_age=int(api_settings.ACCESS_TOKEN_LIFETIME.total_seconds()),
            )
            response.set_cookie(
                key="refresh",
                value=data["refresh"],
                httponly=True,
                secure=False,  # Set to True in production
                samesite="Lax",
                max_age=int(api_settings.REFRESH_TOKEN_LIFETIME.total_seconds()),
            )

        return response

resend.api_key = settings.RESEND_API_KEY

class RegisterView(generics.CreateAPIView):
    """
    API View for user registration
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):

        user = serializer.save(is_active=True)

        token = RefreshToken.for_user(user).access_token
        current_site = get_current_site(self.request).domain
        verification_link = f"http://{current_site}{reverse('email-verify')}?token={token}"
        
        try:
            # Send email only for your demo email
            response = resend.Emails.send({
                "from": "ResuMe <onboarding@resend.dev>",
                "to": [user.email],
                "subject": "Verify your email",
                "html": f"""
                    <p>Click <a href='{verification_link}'>here</a> to verify your email.</p>
                    <p><strong>This link will expire in 15 minutes.</strong></p>
                """
            })
            print(f"Email sent successfully: {response}")
        except Exception as e:
            print(f"Error sending email: {str(e)}")
        
        # def delete_if_unverified():
        #     user.refresh_from_db()
        #     if not user.is_active:
        #         user.delete()
        #         print(f"Deleted unverified user: {user.username}")
        
        # Timer(900, delete_if_unverified).start()

        return Response({
            "email": user.email,
            "message": "Registration successful! "
        }, status=status.HTTP_201_CREATED)

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

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        token = request.query_params.get('token')

        if not token:
            return redirect(f"{settings.FRONTEND_URL}/verification-error?error=invalid_token")

        try:
            payload = AccessToken(token)
            user_id = payload['user_id']
            user = User.objects.get(id=user_id)

            token_age = datetime.now(timezone.utc) - datetime.fromtimestamp(payload['exp'], tz=timezone.utc)
            if token_age > timedelta(minutes=15):
                return redirect(f"{settings.FRONTEND_URL}/verification-error?error=expired")
            
            user.is_active = True
            user.save()

            return redirect(f"{settings.FRONTEND_URL}/verification-success")

        except Exception as e:
            return redirect(f"{settings.FRONTEND_URL}/verification-error?error=verification_failed")
        
class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        user = User.objects.filter(email=email).first()
        
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = PasswordResetTokenGenerator().make_token(user)
            reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

            resend.Emails.send({
                "from": "ResuMe <onboarding@resend.dev>",
                "to": [user.email],
                "subject": "Reset Your Password",
                "html": f"""
                    <p>Click <a href='{reset_link}'>here</a> to reset your password.</p>
                    <p><strong>This link will expire in 15 minutes.</strong></p>
                """
            })


        return Response({"message": "If this email exists, a reset link was sent."})

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        password = request.data.get("password")
        confirm = request.data.get("confirm")

        if not password or password != confirm:
            return Response({"error": "Passwords do not match"}, status=400)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid token"}, status=400)

        if not TimedTokenGenerator().check_token_with_expiry(user, token, max_age_minutes=15):
            return Response({"error": "Invalid or expired token"}, status=400)

        user.set_password(password)
        user.save()
        return Response({"message": "Password has been reset successfully."})

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

class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        username = user.username
        user.delete()
        return Response({"message": f"Account '{username}' and all associated data deleted."}, status=status.HTTP_200_OK)