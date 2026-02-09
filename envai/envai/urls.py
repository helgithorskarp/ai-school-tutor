from django.contrib import admin
from django.urls import path
from environments.api import api   # import from the app

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api.urls),
]