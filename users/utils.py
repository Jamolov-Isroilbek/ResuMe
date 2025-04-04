from datetime import timedelta, datetime, timezone
from django.contrib.auth.tokens import PasswordResetTokenGenerator

class TimedTokenGenerator(PasswordResetTokenGenerator):
    def check_token_with_expiry(self, user, token, max_age_minutes=15):
        if not super().check_token(user, token):
            return False
        try:
            ts_b36 = token.split("-")[1] if "-" in token else None
            if not ts_b36:
                return False
            ts = self._parse_timestamp(ts_b36)
            ts_datetime = datetime.fromtimestamp(self._num_seconds(ts), tz=timezone.utc)
            age = datetime.now(tz=timezone.utc) - ts_datetime
            return age <= timedelta(minutes=max_age_minutes)
        except Exception:
            return False
