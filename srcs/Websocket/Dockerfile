FROM python:3.12

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r ./requirements.txt

COPY ./entrypoint.sh /entrypoint.sh
RUN	chmod +x /entrypoint.sh

EXPOSE 443

ENTRYPOINT ["/entrypoint.sh"]