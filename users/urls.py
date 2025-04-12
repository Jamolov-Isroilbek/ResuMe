from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    DeleteAccountView,
    RegisterView, 
    logout_view, 
    UserProfileView, 
    ChangePasswordView,
    VerifyEmailView,
    ForgotPasswordView,
    ResetPasswordView,
    CookieTokenObtainPairView,
    UserStatsView,
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('me/stats/', UserStatsView.as_view(), name='user-stats'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('auth/verify-email/', VerifyEmailView.as_view(), name='email-verify'),
    path("auth/forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("auth/reset-password/", ResetPasswordView.as_view(), name="reset-password"),
    path("users/me/delete/", DeleteAccountView.as_view(), name="delete-account"),
]
