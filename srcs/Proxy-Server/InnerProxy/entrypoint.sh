#!/bin/bash

mkdir -p /etc/nginx/ssl

certfile="/etc/ssl/certs/innerproxy/innerproxy.crt"
keyfile="/etc/ssl/certs/innerproxy/innerproxy.key"

until [ -f "$certfile" ] && [ -f "$keyfile" ]; do
  echo "Waiting for $certfile and $keyfile to be created..."
  sleep 1
done

nginx -g "daemon off;"
