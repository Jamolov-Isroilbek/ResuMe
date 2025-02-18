from django.db import models

class ResumeStatus(models.TextChoices):
    """
    Enumeration for resume status.
    """
    DRAFT = "DRAFT", "Draft"
    PUBLISHED = "PUBLISHED", "Published"
    ARCHIVED = "ARCHIVED", "Archived"

class PrivacySettings(models.TextChoices):
    """
    Enumeration for resume privacy settings.
    """
    PUBLIC = "PUBLIC", "Public"
    PRIVATE = "PRIVATE", "Private"


