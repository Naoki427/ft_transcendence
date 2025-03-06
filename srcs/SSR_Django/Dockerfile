FROM python:3.12

WORKDIR /app

COPY . /app

RUN apt-get update && apt-get install -y openssl && apt-get clean

RUN pip install --no-cache-dir -r ./requirements.txt

COPY ./entrypoint.sh /entrypoint.sh
RUN	chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]