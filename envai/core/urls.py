from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing, name='landing_page'),
    path("dashboard/", views.dashboard_view, name="dashboard")
]
