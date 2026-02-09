from django.contrib.auth.models import User
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, logout, login
from django.http import JsonResponse
from .services import create_user
import json
import re

# Create your views here.
def auth_view(request):
    if request.user.is_authenticated: 
        return JsonResponse({"redirect": "/dashboard/"}, status=200)
    

    if request.method == "POST":
        data = json.loads(request.body)
        action = data.get("action")
        
        if action == "signin":
            email = data.get("email")
            password = data.get("password")
            if is_correct_password(email, password, request):
                return JsonResponse({"redirect": "/dashboard/"}, status=200)
            else:
                return JsonResponse({"error": "Either password or email are incorrect"}, status=400)
            
        if action == "signup":
            error_msg = ""
            valid_account = True

            ### check if email is valid, see restrictions in function
            email = data.get("email")
            valid_email, msg = is_valid_email(email)
            if not valid_email:
                valid_account = False
                error_msg = msg

            ### check if name is valid, name has to be longer than 3 characters only
            ### consist of letters numbers (special charecrers allowed .-_) no spaces and must be unique
            ### is valid username returns a tuple yes or no is it valid and a error message if it applies
            name = data.get("name")
            valid_username, msg = is_valid_username(name)
            if not valid_username:
                error_msg = msg
                valid_account = False
            else:
                name = name.strip()

            ### check if passwords are valid password1 and password2 the retype must match, both can only contain letters and special characters
            ### no spaces allowed, must be lognger than 5 letters, contain atleast one number and one uppercaseæetter
            password1 = data.get("password1")
            password2 = data.get("password2")
            valid_password, msg = is_valid_password(password1, password2)
            if not valid_password:
                valid_account = False
                error_msg = msg
            else:
                password1 = password1.strip()

            if valid_account:
                user = create_user(name, email, password1)
                login(request, user)
                return JsonResponse({"redirect": "/dashboard/"}, status=200)
            else:
                return JsonResponse({"error": error_msg}, status=400)

            
    return render(request, "user/login_signup.html")

        

def is_correct_password(email, password, request):
    user = User.objects.filter(email=email).first()
    if user:
        username = user.username
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return True
    return False


def is_valid_email(email):
    if not isinstance(email, str):
        return (False, "Error email address invalid")

    user = User.objects.filter(email=email).first()
    if user:
        return (False, "Email address already exists")
    
    pattern = "^[A-Za-z0-9]+([._+-][A-Za-z0-9]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$"
    if not re.search(pattern, email):
        return (False, "Invalid email address format")

    return (True, '')

def is_valid_username(username):
    if not isinstance(username, str):
        return (False, "Error username invalid")

    pattern = "^[A-Za-z0-9_-]+$"
    if not re.search(pattern, username):
        return (False, "Username may only contain letters, numbers, and underscores")

    if len(username) < 4:
        return( False, "Username must be at least 4 characters long")

    if User.objects.filter(username=username).exists():
        return False, "Username already exists"

    return (True, "")


def is_valid_password(pswrd1, pswrd2):
    if not isinstance(pswrd1, str) or not isinstance(pswrd2, str):
        return( False, "Error password incorrect")

    pswrd1 = pswrd1.strip()
    pswrd2 = pswrd2.strip()

    if not pswrd1:
        return( False, "Password cannot be empty")

    if len(pswrd1) < 4:
        return( False, "Password must be at least 4 characters long")
    if len(pswrd1) > 64:
        return( False, "Password must be at most 64 characters long")

    uppercase_found = False
    lowercase_found = False
    digits_found = False

    for char in pswrd1:
        if char.isupper():
            uppercase_found = True
        elif char.islower():
            lowercase_found = True
        elif char.isdigit():
            digits_found = True

    if not uppercase_found or not lowercase_found or not digits_found:
        return( False, "Password must contain a uppercase, lowercaseletter and a digit")

    if pswrd1 != pswrd2:
        return(False, "Passwords do not match")

    return (True, "")


