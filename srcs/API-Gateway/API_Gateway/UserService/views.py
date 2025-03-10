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
        return response.status_code, response.json().get("userid"), response.json().get("message", "something went wrong")
    except requests.RequestException as e:
        return None, None, str(e)

