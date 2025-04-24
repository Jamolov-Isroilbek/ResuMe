"""
users/tests.py
Comprehensive authentication test suite for user-related endpoints.
Covers registration, login, profile access, logout, token refresh, password change, account deletion, and password resets.
"""
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class AuthenticationTests(APITestCase):
    """Test suite covering all auth endpoints."""

    def setUp(self):
        # Endpoints
        self.register_url = reverse('register')
        self.login_url = reverse('token_obtain_pair')
        self.profile_url = reverse('user-profile')
        self.logout_url = reverse('logout')
        self.token_refresh_url = reverse('token_refresh')
        self.change_password_url = reverse('change-password')
        self.delete_account_url = reverse('delete-account')
        self.forgot_password_url = reverse('forgot-password')
        self.reset_password_url = reverse('reset-password')

        # Common credentials
        self.username = 'testuser'
        self.email = 'test@example.com'
        self.password = 'StrongP@ss1'

    # 1. Registration
    def test_register_success(self):
        """Valid signup returns 201 and creates user."""
        data = {'username': self.username, 'email': self.email, 'password': self.password, 'is_public': True}
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)

    def test_register_duplicate_username(self):
        """Signing up with existing username returns 400 username error."""
        User.objects.create_user(username=self.username, email='other@example.com', password='irrelevant')
        data = {'username': self.username, 'email': 'new@example.com', 'password': self.password}
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_register_duplicate_email(self):
        """Signing up with existing email returns 400 email error."""
        User.objects.create_user(username='user1', email=self.email, password='irrelevant')
        data = {'username': 'user2', 'email': self.email, 'password': self.password}
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    # 2. Login
    def test_login_success(self):
        """Valid credentials return access & refresh tokens."""
        User.objects.create_user(username=self.username, email=self.email, password=self.password, is_active=True)
        data = {'username': self.username, 'password': self.password}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_invalid(self):
        """Invalid credentials return 401 Unauthorized."""
        data = {'username': 'wrong', 'password': 'bad'}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # 3. Profile Access
    def test_profile_unauthenticated(self):
        """GET /me/ without token returns 401."""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_authenticated(self):
        """GET /me/ with valid token returns user data."""
        User.objects.create_user(username=self.username, email=self.email, password=self.password, is_active=True)
        tokens = self.client.post(self.login_url, {'username': self.username, 'password': self.password}, format='json').data
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.username)

    # 4. Logout
    def test_logout_success(self):
        """POST /auth/logout/ with refresh token returns 200."""
        User.objects.create_user(username='logouter', email='logout@example.com', password=self.password, is_active=True)
        tokens = self.client.post(self.login_url, {'username': 'logouter', 'password': self.password}, format='json').data
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = self.client.post(self.logout_url, {'refresh': tokens['refresh']}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_no_refresh(self):
        """POST /auth/logout/ without refresh token returns 400."""
        User.objects.create_user(username='logouter2', email='logout2@example.com', password=self.password, is_active=True)
        tokens = self.client.post(self.login_url, {'username': 'logouter2', 'password': self.password}, format='json').data
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = self.client.post(self.logout_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # 5. Token Refresh
    def test_refresh_success(self):
        """Valid refresh token returns new access token."""
        user = User.objects.create_user(username='refresher', email='refresh@example.com', password=self.password, is_active=True)
        refresh = str(RefreshToken.for_user(user))
        response = self.client.post(self.token_refresh_url, {'refresh': refresh}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_refresh_invalid(self):
        """Invalid refresh token returns 401."""
        response = self.client.post(self.token_refresh_url, {'refresh': 'bad'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # 6. Change Password
    def test_change_password_success(self):
        """PUT /change-password/ updates password with correct old."""
        User.objects.create_user(username='changer', email='change@example.com', password=self.password, is_active=True)
        tokens = self.client.post(self.login_url, {'username': 'changer', 'password': self.password}, format='json').data
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = self.client.put(self.change_password_url, {'old_password': self.password, 'new_password': 'NewP@ss2'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user = User.objects.get(username='changer')
        self.assertTrue(user.check_password('NewP@ss2'))

    def test_change_password_wrong_old(self):
        """PUT /change-password/ with wrong old returns 400."""
        User.objects.create_user(username='changer2', email='change2@example.com', password=self.password, is_active=True)
        tokens = self.client.post(self.login_url, {'username': 'changer2', 'password': self.password}, format='json').data
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = self.client.put(self.change_password_url, {'old_password': 'WrongOld', 'new_password': 'NewP@ss2'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('old_password', response.data)

    # 7. Delete Account
    def test_delete_account_success(self):
        """DELETE /users/me/delete/ removes user when authenticated."""
        User.objects.create_user(username='deluser', email='del@example.com', password=self.password, is_active=True)
        tokens = self.client.post(self.login_url, {'username': 'deluser', 'password': self.password}, format='json').data
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = self.client.delete(self.delete_account_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(User.objects.filter(username='deluser').exists())

    def test_delete_account_unauthenticated(self):
        """DELETE /users/me/delete/ without token returns 401."""
        response = self.client.delete(self.delete_account_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # 8. Forgot Password (mocking email)
    @patch('users.views.resend.Emails.send')
    def test_forgot_password(self, mock_send):
        """POST /auth/forgot-password/ always returns 200 with message."""
        mock_send.return_value = {'id': 'dummy'}
        User.objects.create_user(username='fpuser', email='fp@example.com', password=self.password, is_active=True)
        response = self.client.post(self.forgot_password_url, {'email': 'fp@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    # 9. Reset Password
    def test_reset_password_mismatch(self):
        """POST /auth/reset-password/ with mismatched passwords returns 400."""
        user = User.objects.create_user(username='rpuser', email='rp@example.com', password=self.password, is_active=True)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        response = self.client.post(self.reset_password_url, {'uid': uid, 'token': token, 'password': 'New1', 'confirm': 'New2'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_success(self):
        """POST /auth/reset-password/ with valid token updates password."""
        user = User.objects.create_user(username='rpuser2', email='rp2@example.com', password=self.password, is_active=True)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        response = self.client.post(self.reset_password_url, {'uid': uid, 'token': token, 'password': 'NewP@ss2', 'confirm': 'NewP@ss2'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password('NewP@ss2'))

    def test_reset_password_invalid_token(self):
        """POST /auth/reset-password/ with invalid token returns 400."""
        user = User.objects.create_user(username='rpuser3', email='rp3@example.com', password=self.password, is_active=True)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        response = self.client.post(self.reset_password_url, {'uid': uid, 'token': 'bad', 'password': 'X@ss1', 'confirm': 'X@ss1'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
