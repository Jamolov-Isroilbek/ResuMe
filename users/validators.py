from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
import re

class StrongPasswordValidator:
    def validate(self, password, user=None):
        errors = []

        if len(password) < 8:
            errors.append(_("Password must be at least 8 characters."))

        if not re.search(r"[A-Z]", password):
            errors.append(_("Include at least one uppercase letter."))

        if not re.search(r"[a-z]", password):
            errors.append(_("Include at least one lowercase letter."))

        if not re.search(r"\d", password):
            errors.append(_("Include at least one digit."))

        if not re.search(r"[!@#$%^&*()_+=\[\]{};:'\"\\|,.<>/?~-]", password):
            errors.append(_("Include at least one special character (e.g. ! @ # $ % ^ & * ( ) _ + = { } [ ] : ; \" ' < > ? / \\ | ~ -)."))

        if errors:
            raise ValidationError(errors)

    def get_help_text(self):
        return _(
            "Must be at least 8 characters long and include an uppercase letter, "
            "lowercase letter, digit, and special character."
        )
