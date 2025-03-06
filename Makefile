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