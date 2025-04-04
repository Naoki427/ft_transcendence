from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import AuthUser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
import re
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
import jwt
from django.conf import settings

def error_response(message, status=400):
    return JsonResponse({"success": False, "message": message}, status=status)

def success_response(message, data={}):
    return JsonResponse({"success": True, "message": message, **data}, status=200)

PASSWORD_REGEX = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,200}$"

def validate_password(password):
    print("checking password...")
    return bool(re.match(PASSWORD_REGEX, password))

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def password_check(request):
    password = request.data.get("password")
    if not password or not validate_password(password):
        return error_response("Invalid Password")
    return success_response("Valid Password")


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    try:
        data = json.loads(request.body)
        userid = data.get("userid")
        password = data.get("password")

        if not password or not validate_password(password):
            return error_response("Invalid password")
        if not userid:
            return error_response("Couldn't assign user id for some reasons")

        auth_user = AuthUser(userid=userid)
        auth_user.set_password(password)
        auth_user.save()

        print(f"Debug: User registered successfully with userid={userid}")

        return success_response("User Registered successfully")

    except json.JSONDecodeError:
        return error_response("Invalid JSON format")
    except Exception as e:
        print(f"Error in register: {e}")
        return error_response(str(e))


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def AuthPassword(request):
    try:
        data = json.loads(request.body)
        userid = data.get("userid")
        password = data.get("password")

        if not userid or not password:
            return error_response("userid and password are required")

        auth_user = AuthUser.objects.filter(userid=userid).first()
        
        if not auth_user:
            return error_response("User not found")

        if not auth_user.check_password(password):
            return error_response("Invalid password")

        print(f"Debug: Authentication successful for userid={userid}")

        return success_response("Authentication successful")

    except json.JSONDecodeError:
        return error_response("Invalid JSON format")
    except Exception as e:
        print(f"Error: {e}")
        return error_response(str(e))


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def GetToken(request):
    try:
        data = request.data
        userid = data.get("userid")
        if not userid:
            return error_response("Userid Missing")
        user = AuthUser.objects.get(userid=userid)
        if not user:
            return error_response("User is Missing")
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        return success_response("Token created successfully", data={"access_token": access_token, "refresh_token": refresh_token})
    except Exception as e:
        return error_response(str(e))

@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def CheckJWT(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return JsonResponse({"message": "Authorization header missing"}, status=401)
    
    token = auth_header.split(" ")[1]
    secret_key = settings.SECRET_KEY
    try:    
        decoded_token = jwt.decode(token, secret_key, algorithms=["HS256"])
        print(decoded_token)
        return JsonResponse({"message": "Token is valid"}, status=200)
    except jwt.ExpiredSignatureError:
        return JsonResponse({"message": "Token has expired"}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({"message": "Token is invalid"}, status=401)

@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def Refresh(request):
    refresh_token = request.data.get("refresh_token")
    if not refresh_token:
        return JsonResponse({"message": "Refresh token is missing"}, status=400)
    try:
        # リフレッシュトークンをデコードして検証
        token = RefreshToken(refresh_token)
        # 新しいアクセストークンを生成
        new_access_token = str(token.access_token)
        new_refresh_token = str(token)
        return JsonResponse({"access_token": new_access_token, "refresh_token": new_refresh_token}, status=200)
    except TokenError as e:
        return JsonResponse({"message": "Invalid refresh token"}, status=401)

@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def GetIdByToken(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return JsonResponse({"message": "Authorization header missing"}, status=401)
    
    token = auth_header.split(" ")[1]
    secret_key = settings.SECRET_KEY
    decoded_token = jwt.decode(token, secret_key, algorithms=["HS256"])
    user_id = decoded_token.get('user_id')
    print("userid in api = ",user_id)
    if user_id:
        return success_response("ID acquisition successful", data={"user_id": user_id})
    else:
        return error_response("Failed to get ID")