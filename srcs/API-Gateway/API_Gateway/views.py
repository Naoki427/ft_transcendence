from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
import requests
import os
from .UserService.views import CheckUserInfo, RegisterUserInfo, InitialDeleteUserInfo, getUserIDbyEmail, GetUserInfo
from .AuthService.views import CheckPassword, RegisterAuthInfo, AuthPassword, GetToken, checkJwt, refresh, GetIdByToken
from .twoFAService.views import Register2FAInfo, get2FAstatus, AuthOtp

def error_response(message, status=400):
    return JsonResponse({"success": False, "message": message}, status=status)

def error_response_from_other_service(message, ret_status):
    if ret_status is None:
        return error_response(message, status=500)
    return error_response(message, status=400)
    

def success_response(message, data={}):
    return JsonResponse({"success": True, "message": message, **data}, status=200)

def set_cookie(response, key, value, httponly=True, secure=True, samesite="Lax"):
    response.set_cookie(
        key=key,
        value=value,
        httponly=httponly,
        secure=secure,
        samesite=samesite
    )
    return response

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

    status, message = CheckPassword(password)
    if status != 200:
        return error_response_from_other_service(message, status)

    status, message, userid = RegisterUserInfo(username, email, language)
    if status != 200:
        return error_response_from_other_service(message, status)
    
    status, message = RegisterAuthInfo(userid, password)
    if status != 200:
        InitialDeleteUserInfo(userid, username, email, settings.INITDELAUTHINFOPASS)
        return error_response_from_other_service(message, status)
    
    status = Register2FAInfo(userid, username, is_2fa_enabled)
    is_2fa_success = True
    if status != 200:
        is_2fa_success = False

    return success_response("User registered successfully", {
        "userid": userid,
        "is_2fa_enabled": is_2fa_enabled,
        "is_2fa_success": is_2fa_success,
    })

@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get("email")
    password = request.data.get("password")
    device_name = request.data.get("device_name")

    if not email or not password:
        return error_response("All fields are required")

    status, userid, username, message = getUserIDbyEmail(email)
    if status != 200 or not userid:
        return error_response_from_other_service(message, status)

    status, message = AuthPassword(userid, password)
    if status != 200:
        return error_response_from_other_service(message, status)

    ip_address = request.META.get("HTTP_X_FORWARDED_FOR")
    if ip_address:
        ip_address = ip_address.split(",")[0]
    else:
        ip_address = request.META.get("REMOTE_ADDR") 

    status, message, is_2fa_needed, img_url = get2FAstatus(userid, device_name, ip_address)
    if status != 200 or is_2fa_needed is None:
        return error_response_from_other_service(message, status)

    if not is_2fa_needed:
        status, message, refresh_token, access_token = GetToken(userid,username,password)
        if status != 200 or not refresh_token or not access_token:
            return error_response("Something went wrong")
        response = JsonResponse({"message": "Login successful", "is_2fa_needed": False }) 
        response = set_cookie(response, "access_token", access_token)
        response = set_cookie(response, "refresh_token", refresh_token)
        return response

    return success_response("2FA auth is needed", data={"userid": userid, "is_2fa_needed": is_2fa_needed,"img_url": img_url})

@api_view(["POST"])
@permission_classes([AllowAny])
def login2fa_view(request):
    try:
        userid = request.data.get("userid")
        token = request.data.get("token")

        status, message = AuthOtp(userid, token)
        if status != 200:
            return error_response(message)
        status, message, refresh_token, access_token = GetToken(userid)
        if status != 200 or not refresh_token or not access_token:
            return error_response(message)
        response = JsonResponse({"message": "Login successful"}) 
        response = set_cookie(response, "access_token", access_token)
        response = set_cookie(response, "refresh_token", refresh_token)
        return response
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=500)

@api_view(["GET"])
@permission_classes([AllowAny])
def check_auth_view(request):
    access_token = request.COOKIES.get("access_token")
    if not access_token:
        return error_response("Access token not found")
    status, message = checkJwt(access_token)
    if status == 200:
        return success_response("The access token was authenticated", data={"access_token": access_token})
    refresh_token = request.COOKIES.get("refresh_token")
    if not refresh_token:
        return error_response("Refresh token not found")
    status, message, new_refresh_token, new_access_token = refresh(refresh_token)
    if status == 200:
        response = JsonResponse({"message": "The new access token was authenticated", "access_token": new_access_token})
        response = set_cookie(response, "access_token", new_access_token)
        response = set_cookie(response, "refresh_token", new_refresh_token)
        return response
    return error_response("Something went wrong")

@api_view(["GET"])
@permission_classes([AllowAny])
def get_user_info_view(request):
    access_token = request.COOKIES.get("access_token")
    if not access_token:
        return error_response("Access token not found")
    status, message, user_id = GetIdByToken(access_token)
    print("user_id in view = ",user_id)
    return GetUserInfo(user_id)