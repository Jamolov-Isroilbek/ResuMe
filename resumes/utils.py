from django.template.loader import render_to_string
from django.http import HttpResponse
from weasyprint import HTML
from .models import Resume

def generate_resume_pdf(resume):
    """
    Generates a PDF file from the resume data.
    """
    try:
        html_string = render_to_string("resumes/resume_template.html", {"resume": resume})
        pdf_file = HTML(string=html_string).write_pdf()
        return pdf_file
    except Exception as e:
        print(f"❌ PDF Generation Error: {e}")
        return None  # Return None to handle errors gracefully
