# resumes/templatetags/tech_filters.py
from django import template
import re

register = template.Library()

@register.filter
def split_technologies(value):
    parts = re.split(r'[,\.;\-\|/\n]+', value or '')
    return [p.strip() for p in parts if p.strip()]

@register.filter
def split_lines(value):
    return [line.strip() for line in (value or "").splitlines() if line.strip()]