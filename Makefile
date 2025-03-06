all: up

up: 
	docker compose -f up --build

build:
	docker compose -f build

down:
	docker compose -f down

stop:
	docker compose -f stop