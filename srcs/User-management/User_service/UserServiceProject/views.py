from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
from .models import CustomUser
import requests
import os
from django.conf import settings
import json
from django.utils.timezone import now
from datetime import timedelta
from django.contrib.auth import login



def error_response(message, status=400):
    return JsonResponse({"success": False, "message": message}, status=status)

def success_response(message, data={}):
    return JsonResponse({"success": True, "message": message, **data}, status=200)

#TODO
def is_email_valid(email):
    return True


@csrf_exempt
@api_view(["POST"])
def CheckUserInfo(request):
    try:
        data = json.loads(request.body)
        username = data.get("username")
        email = data.get("email")

        if not username or not email:
            return error_response("username or email is missing")
        if len(username) > 10:
            return error_response("username too long")
        if not is_email_valid(email):
            return error_response("Invalid email")

        # username, email の重複チェック
        if CustomUser.objects.filter(username=username).exists():
            return error_response("Username already exists")
        if CustomUser.objects.filter(email=email).exists():
            return error_response("Email already exists")
        return success_response("username and email are valid. You can sign up with them")
    except Exception as e:
        return error_response(str(e))

@csrf_exempt
@api_view(["POST"])
def RegisterUserInfo(request):
    try:
        data = json.loads(request.body)
        username = data.get("username")
        email = data.get("email")
        language = data.get("language")

        if not username or not email or not language:
            return error_response("username or email is missing")
        if len(username) > 10:
            return error_response("username too long")
        if not is_email_valid(email):
            return error_response("Invalid email")
        if CustomUser.objects.filter(username=username).exists():
            return error_response("Username already exists")
        if CustomUser.objects.filter(email=email).exists():
            return error_response("Email already exists")

        user = CustomUser.objects.create(username=username, email=email, language=language, color=0)
        user.save()
        return success_response("the user is registered successfully", data={"userid": user.id})
    except Exception as e:
        return error_response(str(e))

@csrf_exempt
@api_view(["POST"])
def InitialDeleteUserInfo(request):
    try:
        data = json.loads(request.body)
        username = data.get("username")
        email = data.get("email")
        userid = data.get("userid")
        password = data.get("password")

        if password != settings.INITDELAUTHINFOPASS:
            return error_response("Unauthorized request", status=403)
        if (now() - user.date_joined) > timedelta(minutes=3):
            return error_response("Deletion time window expired.", status=403)
        user = CustomUser.objects.filter(id=userid, username=username, email=email).first()
        if not user:
            return error_response("User not found. Who are you?", status=404)
        user.delete()
        return success_response("user deleted successfully")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@api_view(["POST"])
def GetUserIDbyEmail(request):
    try:
        data = json.loads(request.body)
        email = data.get("email")

        if not email or not is_email_valid(email):
            return error_response("Invalid email")
        user = CustomUser.objects.filter(email=email).first()

        if not user:
            return error_response("User not found")

        return success_response("User found", data={"userid": user.id, "username": user.username})
    except json.JSONDecodeError:
        return error_response("Invalid JSON format")
    except Exception as e:
        print(f"Error: {e}")  # ✅ エラーログを追加
        return error_response(str(e))


@csrf_exempt
@api_view(["POST"])
def GetUserInfo(request):
    try:
        data = json.loads(request.body)
        user_id = data.get("user_id")
        user = CustomUser.objects.filter(id=user_id).first()
        user_info = {
            'username': user.username,
            'email': user.email,
            'language': user.language,
            'color': user.color,
            'profile_image_url': user.profile_image_url,
            'groups': [group.name for group in user.groups.all()],
            'user_permissions': [perm.codename for perm in user.user_permissions.all()]
        }
        return JsonResponse(user_info, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@api_view(["POST"])
def UpdateUserInfo(request):
    try:
        data = json.loads(request.body)
        user_id = data.get("user_id")
        username = data.get("username")
        email = data.get("email")
        language = data.get("language")
        profile_image_url = data.get("profile_image_url")
        
        if not user_id:
            return error_response("user_id is required")
            
        user = CustomUser.objects.filter(id=user_id).first()
        if not user:
            return error_response("User not found", status=404)
            
        # ユーザー名の更新（重複チェック）
        if username and username != user.username:
            if len(username) > 10:
                return error_response("username too long")
            if CustomUser.objects.filter(username=username).exists():
                return error_response("Username already exists")
            user.username = username
            
        # メールアドレスの更新（重複チェック）
        if email and email != user.email:
            if not is_email_valid(email):
                return error_response("Invalid email")
            if CustomUser.objects.filter(email=email).exists():
                return error_response("Email already exists")
            user.email = email
            
        # 言語設定の更新
        if language is not None:
            user.language = language
            
        # プロフィール画像の更新
        if profile_image_url:
            user.profile_image_url = profile_image_url
            
        user.save()
        return success_response("User updated successfully")
    except Exception as e:
        return error_response(str(e))
