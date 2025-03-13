FROM python:3.12

RUN apt-get update && apt-get install -y postgresql-client

#ワーキングディレクトリの設定
WORKDIR /app

#カレントディレクトリをコンテナにコピー
COPY . /app


RUN pip install --no-cache-dir -r ./requirements.txt

COPY	./entrypoint.sh /entrypoint.sh
RUN	chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]