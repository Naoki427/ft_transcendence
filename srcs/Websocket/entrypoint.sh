#!/bin/bash

set -e

export PYTHONPATH="/app"


echo "✅ Starting Websocket ..."

certfile="/etc/ssl/certs/websocket/websocket.crt"
keyfile="/etc/ssl/certs/websocket/websocket.key"

until [ -f "$certfile" ] && [ -f "$keyfile" ]; do
  echo "Waiting for $certfile and $keyfile to be created..."
  sleep 1
done

echo "starting Websocket with Daphne..."
exec daphne -e ssl:443:/etc/ssl/certs/websocket/websocket.key:certKey=/etc/ssl/certs/websocket/websocket.crt -b 0.0.0.0 WebsocketProject.asgi:application