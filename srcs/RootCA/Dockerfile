FROM ubuntu:22.04

RUN apt-get update && apt-get install -y openssl

WORKDIR /scripts
COPY generate_certs.sh /scripts/generate_certs.sh
RUN chmod +x /scripts/generate_certs.sh

ENTRYPOINT ["/scripts/generate_certs.sh"]