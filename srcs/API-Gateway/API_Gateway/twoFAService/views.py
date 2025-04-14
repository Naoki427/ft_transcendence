from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
import requests
import os
import base64
import json
from django.http import JsonResponse


def normal_request(url, data, headers=None):
    try:
        response = requests.post(url, json=data, headers=headers)
        message = response.json().get("message", "Something went wrong")
        return response.status_code, message
    except requests.RequestException as e:
        return None, str(e)

def Register2FAInfo(userid,username, is_2fa_enabled):
    url = "https://innerproxy/2fa/register-2fa-info/"
    data = {"userid": userid,  "username": username, "is_2fa_enabled": is_2fa_enabled}
    return normal_request(url, data)


def get2FAstatus(userid, device_name, ip_address):
    url = "https://innerproxy/2fa/get-2fa-status/"
    data = {"userid": userid, "device_name": device_name, "ip_address": ip_address}
    try:
        response = requests.post(url, json=data)
        return response.status_code, response.json().get("message"), response.json().get("is_2fa_needed"), response.json().get("img_url")
    except requests.RequestException as e:
        return None, str(e), None, None

def AuthOtp(userid,token,headers):
    url = "https://innerproxy/2fa/auth-otp/"
    data = {"userid": userid, "token": token}
    return normal_request(url, data, headers)

def Toggle2FA(userid, enable):
    url = "https://innerproxy/2fa/toggle-2fa/"
    data = {"userid": userid, "enable": enable}
    return normal_request(url, data)