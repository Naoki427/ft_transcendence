all:
	docker compose  up --build

up: 
	docker compose  up
build:
	docker compose  build

down:
	docker compose  down

stop:
	docker compose  stop

clean:
	rm -rf ./srcs/RootCA/certs