# This file contains the AI Suggestions backend logic, prepared for modular updates.
# It uses OpenAI's GPT to generate explanations and modified resume sections, optionally based on job descriptions.
# It is structured around prompts.json configuration and can be reused for multiple AI tasks (e.g. one-click resume generation).

import traceback
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from users.authentication import CookieJWTAuthentication
from .utils import generate_resume_suggestions

class AISuggestionsView(generics.GenericAPIView):
    """
    POST /api/nlp/ai-suggestions/

    Required:
      - Full resume content as JSON (including personal_details, education, work_experience, skills, awards)
    Optional:
      - job_description: string

    Example Payload:
    {
        "resume": {
            "title": "Backend Developer Resume",
            "resume_status": "DRAFT",
            "privacy_setting": "PRIVATE",
            "personal_details": {...},
            "education": [...],
            "work_experience": [...],
            "skills": [...],
            "awards": [...]
        },
        "job_description": "We are hiring a Backend Developer with experience in AWS, PostgreSQL..."
    }
    """
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def post(self, request):
        try:
            data = request.data.copy()
            job_description = data.pop("job_description", "")
            resume_data = data.get("resume", data)

            if not resume_data:
                return Response({"error": "Resume data is required"}, status=status.HTTP_400_BAD_REQUEST)

            suggestions = generate_resume_suggestions(resume_data, job_description)

            if "error" in suggestions:
                return Response({"error": suggestions["error"]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({"suggestions": suggestions}, status=200)

        except Exception as e:
            print("❌ ERROR OCCURRED:")
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)
