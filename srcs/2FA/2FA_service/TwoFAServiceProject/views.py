from django.http import JsonResponse
from .models import TwoFactorAuth, Device
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
import json
import qrcode
import base64
from io import BytesIO

def error_response(message, status=400):
    return JsonResponse({"success": False, "message": message}, status=status)

def success_response(message, data={}):
    return JsonResponse({"success": True, "message": message, **data}, status=200)

@csrf_exempt
@api_view(["POST"])
def register(request):
    try:
        data = json.loads(request.body)
        userid = data.get("userid")
        is_2fa_enabled = data.get("is_2fa_enabled")

        if userid is None or is_2fa_enabled is None:
            return error_response("Missing userid or 2FA setting")
        
        print(f"DEBUG: IS_2FA_ENABLED: {is_2fa_enabled}")

        twoFA = TwoFactorAuth(userid=userid, is_2fa_enabled=is_2fa_enabled)
        twoFA.save()

        return success_response("2FA registered successfully")

    except json.JSONDecodeError:
        return error_response("Invalid JSON format")
    except Exception as e:
        print(f"Error in 2FA register: {e}")  # ✅ エラーログ
        return error_response(str(e))

