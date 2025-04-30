# users/management/commands/create_locust_user.py

import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = "Creates (or updates) the dedicated Locust load-test user."

    def handle(self, *args, **options):
        username = os.getenv("LOCUST_USERNAME", "Agent")
        email    = os.getenv("LOCUST_EMAIL", "agent@example.com")
        password = os.getenv("LOCUST_PASSWORD", "Agent1234!")

        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": email, "is_active": True},
        )
        if created:
            self.stdout.write(f"✔ Created new load-test user “{username}”")
        else:
            self.stdout.write(f"↻ User “{username}” already exists, resetting password")

        user.set_password(password)
        user.save()
        self.stdout.write(self.style.SUCCESS(f"🔑 Password set for “{username}”"))
