FROM	ubuntu:22.04


COPY	apt-package.txt /tmp/apt-package.txt

RUN	apt-get update && \
	xargs -a /tmp/apt-package.txt apt-get install -y && \
	mkdir -p /etc/nginx/ssl && \
	openssl req -x509 -nodes -out /etc/nginx/ssl/trascen.crt -keyout /etc/nginx/ssl/trascen.key -subj "/C=JP/ST=Tokyo/L=Shinjuku/O=42Tokyo/OU=42Student/CN=nyoshimi.42.fr/UID=nyoshimi" &&\
	rm -rf /var/lib/apt/lists/*	 
#不要なAPTキャッシュを消去しイメージを軽く

COPY	./conf/nginx.conf etc/nginx/nginx.conf


CMD ["nginx", "-g", "daemon off;"]

EXPOSE	443