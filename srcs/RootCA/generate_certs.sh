#!/bin/bash

CERTS_DIR="/certs"
ROOT_CA_DIR="$CERTS_DIR/rootCA"

# Root CA の作成
if [ ! -f "$ROOT_CA_DIR/rootCA.crt" ]; then
    echo "🔹 Root CA を作成します..."
    mkdir -p $ROOT_CA_DIR
    openssl genrsa -out $ROOT_CA_DIR/rootCA.key 2048
    openssl req -x509 -new -nodes -key $ROOT_CA_DIR/rootCA.key -sha256 -days 3650 \
        -out $ROOT_CA_DIR/rootCA.crt \
        -subj "/C=JP/ST=Tokyo/L=Shinjuku/O=42Tokyo/OU=42Student/CN=Transcendence-Root-CA"

    echo "✅ Root CA 作成完了！"
else
    echo "✅ 既存の Root CA が見つかりました。作成をスキップします。"
fi

# 各サービスの証明書を作成する関数
generate_service_cert() {
    SERVICE_NAME=$1
    SERVICE_CERT_DIR="$CERTS_DIR/$SERVICE_NAME"

    if [ ! -f "$SERVICE_CERT_DIR/$SERVICE_NAME.crt" ]; then
        echo "🔹 $SERVICE_NAME の証明書を作成..."
        mkdir -p $SERVICE_CERT_DIR
        openssl genrsa -out $SERVICE_CERT_DIR/$SERVICE_NAME.key 2048
        openssl req -new -key $SERVICE_CERT_DIR/$SERVICE_NAME.key \
            -out $SERVICE_CERT_DIR/$SERVICE_NAME.csr \
            -subj "/C=JP/ST=Tokyo/L=Shinjuku/O=42Tokyo/OU=42Student/CN=$SERVICE_NAME"

        openssl x509 -req -in $SERVICE_CERT_DIR/$SERVICE_NAME.csr \
            -CA $ROOT_CA_DIR/rootCA.crt -CAkey $ROOT_CA_DIR/rootCA.key \
            -CAcreateserial -out $SERVICE_CERT_DIR/$SERVICE_NAME.crt -days 365 -sha256 \
            -extfile <(echo "subjectAltName=DNS:$SERVICE_NAME")

        echo "✅ $SERVICE_NAME の証明書作成完了！"
    else
        echo "✅ 既存の $SERVICE_NAME の証明書が見つかりました。作成をスキップします。"
    fi
}

# 各サービスの証明書を作成
generate_service_cert "user-service"
generate_service_cert "auth-service"
generate_service_cert "innerproxy"
generate_service_cert "2fa-service"
generate_service_cert "api-gateway"
generate_service_cert "ssr-django"
generate_service_cert "websocket"
generate_service_cert "redis"

echo "🔹 CA バンドルを作成..."
cat $ROOT_CA_DIR/rootCA.crt \
    $CERTS_DIR/innerproxy/innerproxy.crt \
    $CERTS_DIR/api-gateway/api-gateway.crt \
    $CERTS_DIR/ssr-django/ssr-django.crt \ > $ROOT_CA_DIR/custom-ca-bundle.crt
echo "✅ CA バンドル作成完了！"


echo "🚀 すべての証明書の作成が完了しました！"
