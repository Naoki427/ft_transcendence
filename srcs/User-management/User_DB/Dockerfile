FROM postgres:16.4

# entrypoint.sh をコンテナにコピー
COPY ./entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# エントリポイントを設定
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]