FROM	ubuntu:22.04


COPY	apt-package.txt /tmp/apt-package.txt

RUN	apt-get update && \
	xargs -a /tmp/apt-package.txt apt-get install -y && \
	mkdir -p /etc/nginx/ssl && \
	openssl req -x509 -nodes -out /etc/nginx/ssl/trascen.crt -keyout /etc/nginx/ssl/trascen.key -subj "/C=JP/ST=Tokyo/L=Shinjuku/O=42Tokyo/OU=42Student/CN=nyoshimi.42.fr/UID=nyoshimi" &&\
	rm -rf /var/lib/apt/lists/*	 
#不要なAPTキャッシュを消去しイメージを軽く

# ディレクトリ構造を作成
RUN mkdir -p /usr/share/nginx/html/media/profile_images

# デフォルト画像をコピー
COPY	./assets/media/profile_images/default.png /usr/share/nginx/html/media/profile_images/

# ファイル権限を設定
RUN chmod 644 /usr/share/nginx/html/media/profile_images/default.png

COPY	./conf/nginx.conf etc/nginx/nginx.conf


CMD ["nginx", "-g", "daemon off;"]

EXPOSE	443