from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom user model that extends Django's default User model
    """
    is_public = models.BooleanField(default=True) # Defines if user profiles are public

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