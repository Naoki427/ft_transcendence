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

def generate_qr_code(auth_url):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(auth_url)
    qr.make(fit=True)

    img = qr.make_image(fill='black', back_color='white')
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return img_str

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

@csrf_exempt
@api_view(["POST"])
def Get2FAStatus(request):
    try:
        data = json.loads(request.body)
        userid = data.get("userid")

        print(f"Debug: Received Get2FAStatus request for userid={userid}")  # ✅ デバッグログ

        if userid is None:
            return error_response("Missing userid")

        twoFA = TwoFactorAuth.objects.filter(userid=userid).first()

        if not twoFA:
            return error_response("User not found")

        if not twoFA.is_2fa_enabled:
            return success_response("This User did'nt activate 2FA", data={"is_2fa_needed": False, "img_url": None})
        
        device_name = data.get("device_name")
        ip_address = data.get("ip_address")
        device = Device.objects.filter(userid=userid, device_name=device_name, ip_address=ip_address)
        if device:
            return success_response("This device is reliable", data={"is_2fa_needed": False, "img_url": None})

        if not twoFA.first_login:
            return success_response("Unknown device detected", data={"is_2fa_needed": True,"img_url": None})

        qr_url = twoFA.get_qr_code_url()
        img_url = generate_qr_code(qr_url)
        return success_response("This is the first time to log in for this user", data={"is_2fa_needed": True, "img_url": img_url})

    except json.JSONDecodeError:
        return error_response("Invalid JSON format")
    except Exception as e:
        print(f"Error in Get2FAStatus: {e}")  # ✅ エラーログ
        return error_response(str(e))