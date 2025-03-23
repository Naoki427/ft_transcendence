FROM ubuntu:latest

RUN apt-get update && apt-get install -y redis-server

RUN mkdir -p /etc/redis

COPY ./redis.conf /etc/redis/redis.conf
COPY ./entrypoint.sh /entrypoint.sh
RUN	chmod +x /entrypoint.sh


EXPOSE 6379

# Redisサーバーを起動
ENTRYPOINT ["/entrypoint.sh"]