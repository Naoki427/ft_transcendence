#!/bin/bash
set -e

echo "Generating init.sql..."
cat <<EOF > /docker-entrypoint-initdb.d/init.sql
DO \$\$ 
BEGIN 
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$POSTGRES_USER') THEN
        CREATE USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';
    END IF;
END \$\$;

CREATE DATABASE $POSTGRES_DB;
ALTER DATABASE $POSTGRES_DB OWNER TO $POSTGRES_USER;
GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
GRANT USAGE, CREATE ON SCHEMA public TO $POSTGRES_USER;
EOF

echo "Generated init.sql:"

exec docker-entrypoint.sh postgres