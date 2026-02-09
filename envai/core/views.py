from django.shortcuts import render
from django.contrib.auth.decorators import login_required

# Create your views here.
def landing(request):
    return render(request, "landing.html")

@login_required
def dashboard_view(request):
    return render(request, "user/dashboard/dashboard.html")
        