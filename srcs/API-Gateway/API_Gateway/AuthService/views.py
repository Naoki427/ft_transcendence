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


def CheckPassword(password):
    url = "https://innerproxy/auth/password-check/"
    data = {"password": password}
    return normal_request(url, data)


def RegisterAuthInfo(userid, password):
    url = "https://innerproxy/auth/register-auth-info/"
    data = {"userid": userid, "password": password}
    return normal_request(url, data)

def AuthPassword(userid, password):
    url = "https://innerproxy/auth/auth-password/"
    data = {"password": password, "userid": userid}
    return normal_request(url, data)

def GetToken(userid):
    url = "https://innerproxy/auth/get-token/"
    data = {"userid": userid}
    try:
        response = requests.post(url, json=data)
        message = response.json().get("message")
        refresh_token = response.json().get("refresh_token")
        access_token = response.json().get("access_token")
        return response.status_code, message, refresh_token, access_token
    except requests.RequestException as e:
        return None, "something went wrong", None, None