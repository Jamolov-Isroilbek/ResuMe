from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.settings import api_settings

class CookieTokenObtainPairView(TokenObtainPairView):
    """
    Custom view that sets JWT tokens in HttpOnly cookies.
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
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

class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication class that checks for the JWT in cookies if not found in headers.
    """
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            raw_token = request.COOKIES.get("access")
        else:
            raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None
        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
