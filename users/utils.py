# from datetime import date, datetime, timedelta, timezone
# from django.contrib.auth.tokens import PasswordResetTokenGenerator

# class TimedTokenGenerator(PasswordResetTokenGenerator):
#     def check_token_with_expiry(self, user, token, max_age_minutes=15):
#         # first do the usual hash + one‑time‐use check
#         if not super().check_token(user, token):
#             return False
#         try:
#             # split off the base36 timestamp
#             ts_b36 = token.split("-", 1)[0]
#             # parse back to an integer = days since Jan 1, 2001
#             days_since_epoch = self._parse_timestamp(ts_b36)
#             # rebuild the token’s datetime
#             epoch = date(2001, 1, 1)
#             token_date = epoch + timedelta(days=days_since_epoch)
#             token_datetime = datetime.combine(
#                 token_date, datetime.min.time(), tzinfo=timezone.utc
#             )
#             # only valid if not older than max_age_minutes
#             age = datetime.now(timezone.utc) - token_datetime
#             return age <= timedelta(minutes=max_age_minutes)
#         except Exception:
#             return False
