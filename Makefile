all:
	@if [ ! -f .env ]; then cp .env.example .env; fi
	docker compose  up --build

up:
	@if [ ! -f .env ]; then cp .env.example .env; fi
	docker compose  up
	
build:
	docker compose  build

down:
	docker compose  down

stop:
	docker compose  stop

clean:
	rm -rf ./srcs/RootCA/certs

fclean:
	sudo rm -rf ./srcs/2FA/2FA_DB/data ./srcs/Authenticator/Auth_DB/data ./srcs/User-management/User_DB/data ./srcs/RootCA/certs