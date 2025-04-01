# nlp/urls.py
from django.urls import path
from .views import AISuggestionsView

urlpatterns = [
    path('ai-suggestions/', AISuggestionsView.as_view(), name='ai-suggestions'),
]
