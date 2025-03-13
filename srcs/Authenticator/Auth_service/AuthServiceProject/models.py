from django.db import models
from django.contrib.auth.hashers import make_password, check_password

class AuthUser(models.Model):
    userid = models.IntegerField(unique=True, primary_key=True )
    password_hash = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)  # ✅ 認証に必要
    is_staff = models.BooleanField(default=False)  # ✅ Django 管理者用 

    USERNAME_FIELD = "userid"  # ✅ これを追加！ (`USERNAME_FIELD` は必須)
    REQUIRED_FIELDS = []  # ✅ Django に必要な `REQUIRED_FIELDS` を追加

    def set_password(self, password):
        """passwordをハッシュ化して保存"""
        self.password_hash = make_password(password)

    def check_password(self, password):
        """passwordをcheck"""
        return check_password(password, self.password_hash)

    def __str__(self):
        return f"AuthUser {self.userid}"

    @property
    def is_anonymous(self):
        """Django の `is_anonymous` をサポート"""
        return False  # ✅ 認証ユーザーは `False`

    @property
    def is_authenticated(self):
        """Django の `is_authenticated` をサポート"""
        return True  # ✅ 認証済みユーザーは `True`

