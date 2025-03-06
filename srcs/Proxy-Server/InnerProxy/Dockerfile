FROM ubuntu:22.04

# 必要なパッケージをインストール
COPY apt-package.txt /tmp/apt-package.txt
RUN apt-get update && \
    xargs -a /tmp/apt-package.txt apt-get install -y && \
    rm -rf /var/lib/apt/lists/*  # 不要なキャッシュを削除して軽量化

# Nginx の設定ファイルをコピー
COPY ./conf/nginx.conf /etc/nginx/nginx.conf

# `entrypoint.sh` をコピーして実行権限を付与
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# コンテナ起動時に `entrypoint.sh` を実行
ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 443

