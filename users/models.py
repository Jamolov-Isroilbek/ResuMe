from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import uuid

class User(AbstractUser):
    """
    Custom user model that extends Django's default User model
    """
    is_public = models.BooleanField(default=True) # Defines if user profiles are public
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True, default='profile_pics/default.png')
    # Fix reverse accessor conflicts
    groups = models.ManyToManyField(
        "auth.Group",
        related_name="custom_user_groups",
        blank=True
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="custom_user_permissions",
        blank=True
    )

    def __str__(self):
        return self.username 

class GuestUser(models.Model):
    id = models.AutoField(primary_key=True)
    guest_uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    token = models.CharField(max_length=255, unique=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() > self.expires_at
