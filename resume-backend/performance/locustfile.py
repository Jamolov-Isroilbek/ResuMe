import os
import random
from locust import HttpUser, task, between
from requests.exceptions import JSONDecodeError

# Credentials for a test user in your system
USERNAME = os.getenv("LOCUST_USERNAME", "Agent")
PASSWORD = os.getenv("LOCUST_PASSWORD", "Agent1234!")

def make_minimal_resume():
    """Return a minimal valid draft payload."""
    return {
        "title": f"LoadTest Resume {random.randint(1,100000)}",
        "resume_status": "DRAFT",
        "privacy_setting": "PRIVATE",
        "template": "template_classic",
        "is_anonymized": False,
        "personal_details": {
            "first_name": "Test",
            "last_name": "User",
            "email": "test.user@example.com",
            "phone": "+1234567890",
        },
        "education": [
            {
                "institution": "University X",
                "major": "Testing",
                "start_date": "2020-01-01",
                "currently_studying": True
            }
        ],
        "work_experience": [
            {
                "employer": "TestCorp",
                "role": "Load Tester",
                "start_date": "2021-01-01",
                "currently_working": True,
                "description": "This is only for load-testing purposes."
            }
        ],
        "projects": [],  
        "skills": [{"skill_name": "Python", "skill_type": "TECHNICAL", "proficiency": "Expert"}],
        "awards": []
    }

class ResumeUser(HttpUser):
    wait_time = between(1, 3)
    host = os.getenv("TARGET_HOST", "http://127.0.0.1:8000")
    
    # Store resume IDs for later use
    resume_ids = []
    pdf_download_url = None

    def on_start(self):
        # Check if we need to login (might be using content-type application/json or form data)
        try:
            # Try JSON first
            resp = self.client.post("/api/auth/login/", 
                                   json={"username": USERNAME, "password": PASSWORD})
            if resp.status_code == 400 or resp.status_code == 415:
                # If that fails, try form data
                resp = self.client.post("/api/auth/login/", 
                                      data={"username": USERNAME, "password": PASSWORD})
            
            print(f"LOGIN: {resp.status_code} {resp.text}")
            resp.raise_for_status()
            
            # Handle token in response or cookie
            try:
                data = resp.json()
                token = data.get("access")
                if token:
                    self.client.headers.update({"Authorization": f"Bearer {token}"})
            except JSONDecodeError:
                # Assume token is in cookie if no JSON
                print("Response was not JSON, assuming token is in cookie")
                
            # Pre-fetch resume IDs for later use
            self._load_resume_ids()
        except Exception as e:
            print(f"Login failed: {e}")
            raise
    
    def _load_resume_ids(self):
        """Helper method to load resume IDs after login"""
        try:
            resp = self.client.get("/api/resumes/", name="Load Resume IDs")
            if resp.status_code == 200:
                data = resp.json()
                
                # Handle both paginated and non-paginated responses
                if isinstance(data, list):
                    results = data
                elif "results" in data:
                    results = data["results"]
                else:
                    results = []
                    
                self.resume_ids = [r["id"] for r in results]
                print(f"Loaded {len(self.resume_ids)} resume IDs: {self.resume_ids}")
        except Exception as e:
            print(f"Error loading resume IDs: {e}")
    
    @task(3)
    def list_resumes(self):
        self.client.get("/api/resumes/", name="List My Resumes")

    @task(2)
    def create_and_update_resume(self):
        try:
            payload = make_minimal_resume()
            create = self.client.post("/api/resumes/", 
                                     json=payload, 
                                     name="Create Resume")
            
            if create.status_code == 201:
                resume_data = create.json()
                resume_id = resume_data.get("id")
                
                # Store the ID for later use
                if resume_id and resume_id not in self.resume_ids:
                    self.resume_ids.append(resume_id)
                    
                self.client.patch(f"/api/resumes/{resume_id}/",
                                json={"title": payload["title"] + " (edited)"},
                                name="Update Resume")
            else:
                print(f"Create resume failed: {create.status_code} {create.text}")
        except Exception as e:
            print(f"Error in create_and_update_resume: {e}")

    @task(1)
    def retrieve_public_resumes(self):

        resp = self.client.get("/api/public-resumes/", name="List Public Resumes")



    @task(1)
    def ai_suggestions(self):
        try:
            self.client.post("/api/nlp/ai-suggestions/",
                           json={
                               "resume": make_minimal_resume(),
                               "job_description": "Looking for backend Python developer with Django experience."
                           },
                           name="AI Suggestions")
        except Exception as e:
            print(f"Error in ai_suggestions: {e}")

    @task(1)
    def download_pdf(self):
        """Try multiple different URL patterns for PDF download"""
        
        # Skip if no resume IDs available
        if not self.resume_ids:
            print("No resume IDs available for PDF download")
            self._load_resume_ids()  # Try to load resume IDs again
            if not self.resume_ids:
                print("Still no resume IDs available after reload.")
                return
        
        resume_id = random.choice(self.resume_ids)

        url = f"/api/resumes/{resume_id}/download/"

        try:
            resp = self.client.get(url, name="Download PDF")
            resp.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
            print(f"Successfully downloaded PDF for resume ID {resume_id}")
        except Exception as e:
            print(f"Error downloading PDF for resume ID {resume_id} from {url}: {e}")