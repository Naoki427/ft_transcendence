from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
import requests
import os

def normal_request(url, data):
    try:
        response = requests.post(url, json=data)
        message = response.json().get("message", "Something went wrong")
        return response.status_code, message
    except requests.RequestException as e:
        return None, str(e)



def CheckUserInfo(username, email):
    url = "https://innerproxy/user/check-user-info/"
    data = {"username": username, "email": email}
    return normal_request(url, data)

def RegisterUserInfo(username, email, language):
    url = "https://innerproxy/user/register-user-info/"
    data = {"username": username, "email": email, "language": language}
    try:
        response = requests.post(url, json=data)
        return response.status_code, response.json().get("message", "Something went wrong"), response.json().get("userid")
    except requests.RequestException as e:
        return None, str(e), -1

def InitialDeleteUserInfo(userid, username, email, password):
    url = "https://innerproxy/user/inital-delete-user-info/"
    data = {"userid": userid, "usename": username, "email": email,"password": password}
    return normal_request(url, data)

def getUserIDbyEmail(email):
    url = "https://innerproxy/user/get-id-by-email/"
    data = {"email": email}
    try:
        response = requests.post(url, json=data)
        return response.status_code, response.json().get("userid"), response.json().get("username"),response.json().get("message", "something went wrong")
    except requests.RequestException as e:
        return None, None, str(e)

import requests
from django.http import JsonResponse

def GetUserInfo(user_id):
    url = "https://innerproxy/user/get-user-info/"
    data = {"user_id": user_id}
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        json_data = response.json()
        
        user_info = {
            'userid': user_id,
            'status_code': response.status_code,
            'username': json_data.get('username'),
            'email': json_data.get('email'),
            'language': json_data.get('language'),
            'color': json_data.get('color'),
            'profile_image_url': json_data.get('profile_image_url')
        }
        
        return JsonResponse(user_info, safe=False)
    except requests.RequestException as e:
        return JsonResponse({'error': str(e)}, status=500)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
        
def UpdateUserInfo(user_id, username=None, email=None, language=None, profile_image_url=None):
    url = "https://innerproxy/user/update-user-info/"
    data = {
        "user_id": user_id
    }
    
    # 更新するフィールドのみデータに追加
    if username is not None:
        data["username"] = username
    if email is not None:
        data["email"] = email
    if language is not None:
        data["language"] = language
    if profile_image_url is not None:
        data["profile_image_url"] = profile_image_url
        
    try:
        response = requests.post(url, json=data)
        return response.status_code, response.json().get("message", "Something went wrong")
    except requests.RequestException as e:
        return None, str(e)

