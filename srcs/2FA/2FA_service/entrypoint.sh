#!/bin/bash

set -e

export PYTHONPATH="/app"
exec "$@"

#データベースの起動を待つ
echo "Waiting for PSQL_2FA to be established..."
until PGPASSWORD="$POSTGRES_2FA_PASSWORD" psql -h "$POSTGRES_2FA_HOST" -U "$POSTGRES_2FA_USER" -d "$POSTGRES_2FA_DB" -c "\q" 2>&1; do
	echo "📌 PostgreSQL が起動していません。再試行中..."
	# echo "🔍 for debugging: PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c"
	sleep 2
done

echo "✅connection between 2FA-DB established"
echo "Migrating..."

python manage.py makemigrations TwoFAServiceProject --noinput
python manage.py migrate --noinput

certfile="/etc/ssl/certs/2fa-service/2fa-service.crt"
keyfile="/etc/ssl/certs/2fa-service/2fa-service.key"

# 証明書ファイルとキーが存在するまで待機
until [ -f "$certfile" ] && [ -f "$keyfile" ]; do
  echo "Waiting for $certfile and $keyfile to be created..."
  sleep 1
done

echo "✅ Starting 2FA-service with HTTPS..."
exec gunicorn \
    --certfile=/etc/ssl/certs/2fa-service/2fa-service.crt \
    --keyfile=/etc/ssl/certs/2fa-service/2fa-service.key \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --access-logfile - \
    --error-logfile - \
    --timeout 120 \
    TwoFAServiceProject.wsgi:application --chdir /app