from django.urls import re_path
from . import consumers
from .consumers.match_consumer import MatchConsumer
from .consumers.game_consumer import GameConsumer
from .consumers.tournament_consumer import TournamentConsumer

websocket_urlpatterns = [
    re_path(r'^ws/match/$', MatchConsumer.as_asgi()),
    re_path(r'^ws/game/(?P<room_name>[\w-]+)/$', GameConsumer.as_asgi()),
    re_path(r'^ws/tournament/$', TournamentConsumer.as_asgi()),
]
