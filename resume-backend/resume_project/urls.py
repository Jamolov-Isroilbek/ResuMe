from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from health.views import health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('resumes.urls')),
    path('api/nlp/', include('nlp.urls')),
    path('api/health/', health_check, name='health-check'), 
] 

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
