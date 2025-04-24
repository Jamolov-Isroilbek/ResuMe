"""
resumes/tests.py
API and utility tests for the resumes app: CRUD endpoints, privacy/anonymization, favorites, sanitize, PDF util, detailed view, HTML/PDF rendering, stats.
"""
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.core.files.base import ContentFile
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch, MagicMock
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Resume, PersonalDetails, Education, WorkExperience, Skill, Award, Favorite, ResumeAnalytics
from .serializers import sanitize_resume_data
from .utils import generate_resume_pdf

User = get_user_model()

class ResumeAPITests(APITestCase):
    def setUp(self):
        # Create two users
        self.user1 = User.objects.create_user(username='user1', email='u1@example.com', password='Pass1234', is_active=True)
        self.user2 = User.objects.create_user(username='user2', email='u2@example.com', password='Pass1234', is_active=True)
        # Authenticate user1
        refresh = RefreshToken.for_user(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')
        # URLs
        self.list_url = reverse('resume-list')

    def create_minimal_resume(self, status='DRAFT', privacy='PRIVATE'):
        resume = Resume.objects.create(user=self.user1, title='Test', resume_status=status, privacy_setting=privacy)
        PersonalDetails.objects.create(resume=resume, first_name='John', last_name='Doe', email='john@example.com', phone='+1234567890')
        Education.objects.create(resume=resume, institution='Uni', start_date='2020-01-01')
        WorkExperience.objects.create(resume=resume, employer='Corp', role='Dev', start_date='2021-01-01')
        Skill.objects.create(resume=resume, skill_name='Python')
        return resume

    # List & Create
    def test_list_own_resumes(self):
        self.create_minimal_resume()
        Resume.objects.create(user=self.user2, title='Other', resume_status='DRAFT')
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        results = resp.data.get('results', [])
        self.assertEqual(len(results), 1)

    def test_create_resume_draft_success(self):
        payload = {
            'title': 'New Resume', 'resume_status': 'DRAFT', 'privacy_setting': 'PRIVATE', 'template': 'template_classic',
            'personal_details': {'first_name': 'A', 'last_name': 'B', 'email': 'a@b.com', 'phone': '+1000000000'},
            'education': [{'institution': 'Uni', 'start_date': '2020-01-01'}],
            'work_experience': [{'employer': 'Co', 'role': 'Role', 'start_date': '2021-01-01'}],
            'skills': [{'skill_name': 'TestSkill'}]
        }
        resp = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_create_resume_publish_missing_fields(self):
        payload = {'title': 'Pub', 'resume_status': 'PUBLISHED'}
        resp = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('personal_details', resp.data)
        self.assertIn('education', resp.data)
        self.assertIn('skills', resp.data)

    # Detail / Update / Delete
    def test_retrieve_update_delete_resume(self):
        resume = self.create_minimal_resume()
        detail_url = reverse('resume-detail', args=[resume.id])
        # GET as owner
        resp_get = self.client.get(detail_url)
        self.assertEqual(resp_get.status_code, status.HTTP_200_OK)
        # PUT update title
        resp_put = self.client.put(detail_url, {'title': 'Updated', 'resume_status': 'DRAFT'}, format='json')
        self.assertEqual(resp_put.status_code, status.HTTP_200_OK)
        resume.refresh_from_db()
        self.assertEqual(resume.title, 'Updated')
        # DELETE
        resp_del = self.client.delete(detail_url)
        self.assertEqual(resp_del.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Resume.objects.filter(id=resume.id).exists())

    # Public list excludes owner
    def test_public_resumes_excludes_own(self):
        r1 = self.create_minimal_resume(status='PUBLISHED', privacy='PUBLIC')
        Resume.objects.create(user=self.user1, title='MyDraft', resume_status='DRAFT', privacy_setting='PUBLIC')
        url = reverse('public-resumes')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for r in resp.data.get('results', []):
            self.assertNotEqual(r['user']['id'], self.user1.id)

    # Favorites
    def test_toggle_favorite(self):
        resume = self.create_minimal_resume(status='PUBLISHED', privacy='PUBLIC')
        fav_url = reverse('resume-favorite', args=[resume.id])
        # self-favorite
        resp1 = self.client.post(fav_url)
        self.assertEqual(resp1.status_code, status.HTTP_400_BAD_REQUEST)
        # other user favorites
        refresh2 = RefreshToken.for_user(self.user2)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh2.access_token)}')
        resp2 = self.client.post(fav_url)
        self.assertTrue(resp2.data['is_favorited'])
        # analytics count
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh2.access_token)}')
        resp3 = self.client.post(fav_url)
        self.assertFalse(resp3.data['is_favorited'])

    # HTML View & Analytics
    def test_html_view_owner_and_analytics(self):
        resume = self.create_minimal_resume(status='PUBLISHED', privacy='PUBLIC')
        view_url = reverse('resume-view', args=[resume.id])
        # as owner
        resp_owner = self.client.get(view_url)
        self.assertEqual(resp_owner.status_code, status.HTTP_200_OK)
        # as non-owner
        refresh2 = RefreshToken.for_user(self.user2)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh2.access_token)}')
        resp_non = self.client.get(view_url)
        self.assertEqual(resp_non.status_code, status.HTTP_200_OK)
        analytics = ResumeAnalytics.objects.get(resume=resume)
        self.assertEqual(analytics.views, 1)

    def test_html_view_private_forbidden(self):
        resume = self.create_minimal_resume(status='PUBLISHED', privacy='PRIVATE')
        view_url = reverse('resume-view', args=[resume.id])
        refresh2 = RefreshToken.for_user(self.user2)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh2.access_token)}')
        resp = self.client.get(view_url)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    # PDF Download & Analytics
    @patch('resumes.views.HTML')
    @patch('resumes.views.render_to_string', return_value='<html></html>')
    @patch('resumes.views.find_static', return_value=__file__)
    def test_pdf_download_and_analytics(self, mock_find, mock_render, mock_html):
        mocked = MagicMock()
        mocked.write_pdf.return_value = b'%PDF'
        mock_html.return_value = mocked
        resume = self.create_minimal_resume(status='PUBLISHED', privacy='PUBLIC')
        download_url = reverse('resume-download', args=[resume.id])
        # as non-owner
        refresh2 = RefreshToken.for_user(self.user2)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh2.access_token)}')
        resp = self.client.get(download_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        analytics = ResumeAnalytics.objects.get(resume=resume)
        self.assertEqual(analytics.downloads, 1)
        # private forbidden
        resume.privacy_setting = 'PRIVATE'; resume.save()
        resp2 = self.client.get(download_url)
        self.assertEqual(resp2.status_code, status.HTTP_403_FORBIDDEN)

    # Stats Endpoints
    def test_user_stats(self):
        # create analytics entries
        r = self.create_minimal_resume(status='PUBLISHED', privacy='PUBLIC')
        Analytics = ResumeAnalytics
        Analytics.objects.filter(resume=r).update(views=5, downloads=3)
        # favorite by user2
        refresh2 = RefreshToken.for_user(self.user2)
        Favorite.objects.create(user=self.user2, resume=r)
        url = reverse('user-stats')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.data
        self.assertEqual(data['views'], 5)
        self.assertEqual(data['downloads'], 3)
        self.assertEqual(data['favorites'], 1)

    def test_resume_stats_owner_and_forbidden(self):
        r = self.create_minimal_resume(status='PUBLISHED', privacy='PUBLIC')
        Analytics = ResumeAnalytics
        Analytics.objects.filter(resume=r).update(views=2, downloads=4)
        stats_url = reverse('resume-stats', args=[r.id])
        # owner
        resp_owner = self.client.get(stats_url)
        self.assertEqual(resp_owner.status_code, status.HTTP_200_OK)
        # non-owner
        refresh2 = RefreshToken.for_user(self.user2)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh2.access_token)}')
        resp_non = self.client.get(stats_url)
        self.assertEqual(resp_non.status_code, status.HTTP_403_FORBIDDEN)

class UtilsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='u', email='u@example.com', password='p')
        self.resume = Resume.objects.create(user=self.user, title='X', resume_status='PUBLISHED', privacy_setting='PUBLIC')
        PersonalDetails.objects.create(resume=self.resume, first_name='F', last_name='L', email='e@e.com', phone='+1')
        Education.objects.create(resume=self.resume, institution='I', start_date='2020-01-01')
        WorkExperience.objects.create(resume=self.resume, employer='E', role='R', start_date='2021-01-01')
        Skill.objects.create(resume=self.resume, skill_name='S')

    def test_sanitize_resume_data_anonymized(self):
        data = sanitize_resume_data(self.resume, is_anonymized=True)
        self.assertEqual(data['personal_details']['first_name'], 'Anonymous')
        self.assertNotEqual(data['personal_details']['email'], self.resume.personal_details.email)

    @patch('resumes.utils.render_to_string', return_value='<html></html>')
    @patch('resumes.utils.HTML')
    def test_generate_resume_pdf_success(self, mock_html, mock_render):
        mocked = MagicMock()
        mocked.write_pdf.return_value = b'%PDF-1.4...'
        mock_html.return_value = mocked
        pdf = generate_resume_pdf(self.resume)
        self.assertIsInstance(pdf, bytes)

    @patch('resumes.utils.render_to_string', side_effect=Exception('fail'))
    def test_generate_resume_pdf_failure(self, mock_render):
        pdf = generate_resume_pdf(self.resume)
        self.assertIsNone(pdf)
