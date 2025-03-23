#!/bin/bash

set -e

echo "✅ Starting redis ..."

certfile="/etc/ssl/certs/redis/redis.crt"
keyfile="/etc/ssl/certs/redis/redis.key"

until [ -f "$certfile" ] && [ -f "$keyfile" ]; do
  echo "Waiting for $certfile and $keyfile to be created..."
  sleep 1
done
REDIS_PASSWORD=${REDIS_PASSWORD:-defaultpassword}

sed -i "s/^requirepass .*/requirepass $REDIS_PASSWORD/" /etc/redis/redis.conf

exec redis-server /etc/redis/redis.conf