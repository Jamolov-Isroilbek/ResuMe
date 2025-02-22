from django.template.loader import render_to_string
from django.http import HttpResponse
from weasyprint import HTML
from .models import Resume, Section

def generate_resume_pdf(resume):
    """
    Generates a PDF file from the resume data.
    """
    # sections = resume.sections.all() # Fetch related actions
    # html_string = render_to_string('resume_pdf_template.html', {'resume': resume, 'sections': sections})
    # pdf_file = HTML(string=html_string).write_pdf() 
    # return pdf_file
    html_content = render_to_string("resume_template.html", {"resume": resume})
    return HTML(string=html_content).write_pdf()