from django.db import models
import pyotp
import qrcode
from io import BytesIO
from django.http import HttpResponse


class TwoFactorAuth(models.Model):
    userid = models.IntegerField(unique=True)  # UserManagement から受け取る
    is_2fa_enabled = models.BooleanField(default=False)  # 2FA の有効・無効
    secret_key = models.CharField(max_length=255, null=True, blank=True)  # 2FA の秘密鍵
    first_login = models.BooleanField(default=True)

    def __str__(self):
        return f"2FA: {self.userid} - {'Enabled' if self.is_2fa_enabled else 'Disabled'}"

    def set_2fa_state(self, state):
        self.is_2fa_enabled = state

    def generate_secret_key(self):
        self.secret_key = pyotp.random_base32()
        self.save()

    def get_qr_code_url(self, issuer_name="FT_TRANSCENDENCE"):
        if not self.secret_key:
            self.generate_secret_key()
        return pyotp.totp.TOTP(self.secret_key).provisioning_uri(name=str(self.userid), issuer_name=issuer_name)

class Device(models.Model):
    userid = models.IntegerField()
    device_name = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField()
    last_login = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Device: {self.device_name} - {self.ip_address} (User: {self.userid})"
