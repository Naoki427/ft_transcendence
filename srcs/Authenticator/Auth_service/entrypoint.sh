#!/bin/bash

set -e

export PYTHONPATH="/app"

exec "$@"

#データベースの起動を待つ
echo "Waiting for PSQL_AUTH to be established..."
until PGPASSWORD="$POSTGRES_AUTH_PASSWORD" psql -h "$POSTGRES_AUTH_HOST" -U "$POSTGRES_AUTH_USER" -d "$POSTGRES_AUTH_DB" -c "\q" 2>&1; do
	echo "📌 PostgreSQL が起動していません。再試行中..."
	# echo "🔍 for debugging: PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c"
	sleep 2
done

echo "✅connection between Auth-DB established"
echo "Migrating..."

python manage.py makemigrations AuthServiceProject --noinput
python manage.py migrate --noinput

certfile="/etc/ssl/certs/auth-service/auth-service.crt"
keyfile="/etc/ssl/certs/auth-service/auth-service.key"

# 証明書ファイルとキーが存在するまで待機
until [ -f "$certfile" ] && [ -f "$keyfile" ]; do
  echo "Waiting for $certfile and $keyfile to be created..."
  sleep 1
done

echo "✅ Starting Auth-service with HTTPS..."
exec gunicorn \
    --certfile=/etc/ssl/certs/auth-service/auth-service.crt \
    --keyfile=/etc/ssl/certs/auth-service/auth-service.key \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --access-logfile - \
    --error-logfile - \
    --timeout 120 \
    AuthServiceProject.wsgi:application --chdir /app
