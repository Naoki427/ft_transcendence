from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
import requests
import os
from .UserService.views import CheckUserInfo, RegisterUserInfo, InitialDeleteUserInfo, getUserIDbyEmail
from .twoFAService.views import Register2FAInfo

def error_response(message, status=400):
    return JsonResponse({"success": False, "message": message}, status=status)

def error_response_from_other_service(message, ret_status):
    if ret_status is None:
        return error_response(message, status=500)
    return error_response(message, status=400)
    

def success_response(message, data={}):
    return JsonResponse({"success": True, "message": message, **data}, status=200)

@api_view(["POST"])
@permission_classes([AllowAny])
def signup_view(request):
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")
    language = request.data.get("language")
    is_2fa_enabled = request.data.get("is_2fa_enabled", "false").lower() == "true"
    
    if not username or not email or not password or language is None:
        return error_response("All fields are required")

    status, message = CheckUserInfo(username, email)
    if status != 200:
        return error_response_from_other_service(message, status)

    status, message, userid = RegisterUserInfo(username, email, language)
    if status != 200:
        return error_response_from_other_service(message, status)
    
    status = Register2FAInfo(userid, is_2fa_enabled)
    is_2fa_success = True
    if status != 200:
        is_2fa_success = False

    return success_response("User registered successfully", {
        "userid": userid,
        "is_2fa_enabled": is_2fa_enabled,
        "is_2fa_success": is_2fa_success,
    })