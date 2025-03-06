FROM python:3.12

RUN apt-get update && apt-get install -y

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r ./requirements.txt

ENV SSL_CERT_FILE=/etc/ssl/certs/rootCA/custom-ca-bundle.crt
ENV REQUESTS_CA_BUNDLE=/etc/ssl/certs/rootCA/custom-ca-bundle.crt

COPY	./entrypoint.sh /entrypoint.sh
RUN	chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]