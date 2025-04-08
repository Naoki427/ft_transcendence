import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import uuid
import asyncio

class MatchConsumer(AsyncWebsocketConsumer):
    waiting_users = []
    user_info = {}

    async def connect(self):
        await self.accept()
        self.user_id = self.scope['user'].id
        self.channel_id = str(uuid.uuid4())
        self.user_info[self.channel_id] = {
            'channel_name': self.channel_name,
            'user_id': self.user_id
        }

    async def disconnect(self, close_code):
        if self.channel_id in self.waiting_users:
            self.waiting_users.remove(self.channel_id)
        if self.channel_id in self.user_info:
            del self.user_info[self.channel_id]

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json['action']

        if action == 'join':
            self.waiting_users.append(self.channel_id)
            await self.match_users()

    async def match_users(self):
        if len(self.waiting_users) >= 2:
            uuid1 = self.waiting_users.pop(0)
            uuid2 = self.waiting_users.pop(0)
            user1_info = self.user_info[uuid1]
            user2_info = self.user_info[uuid2]
            group_name = f'match_{uuid1}_{uuid2}'

            await self.channel_layer.group_add(group_name, user1_info['channel_name'])
            await self.channel_layer.group_add(group_name, user2_info['channel_name'])

            await self.channel_layer.group_send(
                group_name,
                {
                    'type': 'match_message',
                    'message': f'User {uuid1} matched with User {uuid2}',
                    'room_name' : f'{uuid1}_{uuid2}'
                }
            )

    async def match_message(self, event):
        message = event['message']
        room_name = event['room_name']
        await self.send(text_data=json.dumps({
            'message': message,
            'room_name': room_name
        }))
        await self.close()

# ボールクラス
screen_width = 580
screen_height = 800
class Ball:
    def __init__(self, x, y, vx, vy):
        self.x = x
        self.y = y
        self.vx = vx
        self.vy = vy
        self.point = False

    def update_position(self):
        if self.y + self.vy < 45 and self.point == False:
            self.x += abs(self.y - 45) * (self.vx / abs(self.vy))
            self.y = 45
        elif self.y + self.vy > 755 and self.point == False:
            self.x += abs(755 - self.y) * (self.vx / abs(self.vy))
            self.y = 755
        else:
            self.x += self.vx * 1.05
            self.y += self.vy * 1.05

        # 壁との衝突判定
        if self.x <= 20 or self.x >= screen_width:
            if self.x <= 20:
                self.x = 20
            if self.x >= screen_width:
                self.x = screen_width
            self.vx = -self.vx
        
        if self.y < -50 or self.y > 850:
            self.point = False
            self.vx = 10
            self.vy = 10
            self.x = 300
            self.y = 400


    def ball_collision(self):
        if (self.y <= 45 and self.vy < 0) or (self.y >=755 and self.vy > 0):
            self.vy = -self.vy
            self.y += self.vy
            self.x += self.vx

class GameConsumer(AsyncWebsocketConsumer):
    rooms = {}
    running = True
    lock = asyncio.Lock()
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'game_{self.room_name}'

        if self.room_group_name not in self.rooms:
            self.rooms[self.room_group_name] = {
                'score': {'player1': 0, 'player2': 0},
                'ball': Ball(300, 400, 10, 10),
                'players': {}
            }
        if 'player1' not in self.rooms[self.room_group_name]['players']:
            self.rooms[self.room_group_name]['players']['player1'] = self.channel_name
            self.player = 'player1'
        elif 'player2' not in self.rooms[self.room_group_name]['players']:
            self.rooms[self.room_group_name]['players']['player2'] = self.channel_name
            self.player = 'player2'
        else:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        await self.send(text_data=json.dumps({
            'message': f'You are {self.player}'
        }))

        await self.update_score()

        asyncio.create_task(self.update_ball_position())
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    #ボールの位置を逐次送信
    async def update_ball_position(self):
        while self.running:
            # async with self.lock:
            ball = self.rooms[self.room_group_name]['ball']
            ball.update_position()
            ball_position = {'x': ball.x, 'y': ball.y}
            await self.send_ball_position(ball_position)
            await asyncio.sleep(0.1)

    async def send_ball_position(self, ball_position):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'ball_position_update',
                'ball_position': ball_position
            }
        )

    async def ball_position_update(self, event):
        ball_position = event['ball_position']

        await self.send(text_data=json.dumps({
            'ball_position': ball_position
        }))

    async def update_score(self):
        ball = self.rooms[self.room_group_name]['ball']
        score = self.rooms[self.room_group_name]['score']
        if ball.y <= 45:
            score['player2'] += 1
        if ball.y >= 755:
            score['player1'] += 1
        await self.send_score(ball)


    async def send_score(self,ball):
        score = self.rooms[self.room_group_name]['score']
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'score_update',
                'score': score
            }
        )

    async def score_update(self, event):
        score = event['score']
        await self.send(text_data=json.dumps({
            'score': score
        }))
        

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data['type'] == 'paddle_position':
            paddle_position = data['paddle_position']

            for player, channel_name in self.rooms[self.room_group_name]['players'].items():
                if channel_name != self.channel_name:
                    await self.channel_layer.send(
                        channel_name,
                        {
                            'type': 'paddle_position_update',
                            'paddle_position': paddle_position
                        }
                    )
        if data['type'] == 'collision':
            # async with self.lock:
            ball = self.rooms[self.room_group_name]['ball']
            ball.ball_collision()
            ball_position = {'x': ball.x, 'y': ball.y}
            await self.send_ball_position(ball_position)
        if data['type'] == 'goal':
            ball = self.rooms[self.room_group_name]['ball']
            if ball.point == False:
                await self.update_score()
            ball.point = True

    async def paddle_position_update(self, event):
        paddle_position = event['paddle_position']

        await self.send(text_data=json.dumps({
            'paddle_position': paddle_position
        }))

class TournamentConsumer(AsyncWebsocketConsumer):
    waiting_users_4 = []
    user_info = {}
    tournaments = {}
    aliveusers = {}

    async def connect(self):
        await self.accept()
        self.channel_id = str(uuid.uuid4())
        self.user_info[self.channel_id] = {
            'channel_name': self.channel_name,
            'channel_id': self.channel_id,
        }
    
    async def disconnect(self, close_code):
        if self.channel_id in self.waiting_users_4:
            self.waiting_users_4.remove(self.channel_id)
        if self.channel_id in self.user_info:
            del self.user_info[self.channel_id]
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        if data['alias']:
            self.user_info[self.channel_id]['alias'] = data['alias']
        if data['userid']:
            self.user_info[self.channel_id]['userid'] = data['userid']
        if data['image']:
            self.user_info[self.channel_id]['image'] = data['image']
        if data['type'] == 'join_tournament':
            await self.handle_join_tournament(data['size'])

    async def handle_join_tournament(self, size):
        if size == 4:
            self.waiting_users_4.append(self.user_info[self.channel_id] )
            if len(self.waiting_users_4) == 4:
                await self.start_tournament(self.waiting_users_4,size)
                self.waiting_users_4 = []
        else:
            await self.send(text_data=json.dumps({"message": "Invalid tournament size"}))

    
    async def start_tournament(self,waiting_users,size):
        await self.send_participants_info(waiting_users,size)
        self.set_aliveusers(waiting_users,size)
        await self.send_roomname(self.aliveusers[self.tournaments[self.channel_id]],size)


    async def send_participants_info(self,waiting_users,size):
        group_name = 'participants'
        participants_info = []
        for i in range(0, 4):
            user = {
                'index': i,
                'userid': waiting_users[i]['userid'],
                'alias': waiting_users[i]['alias'],
                'image': waiting_users[i]['image'],
            }
            participants_info.append(user)
            await self.channel_layer.group_add(group_name, waiting_users[i]['channel_name'])


        await self.channel_layer.group_send(
            group_name,
            {
                'type': 'participants_message',
                'participants_info' : participants_info
            }
        )

    async def participants_message(self, event):
        participants_info = event['participants_info']
        await self.send(text_data=json.dumps({
            'participants_info': participants_info
        }))

    def set_aliveusers(self,waiting_users,size):
        tournaments_name = ""
        for i in range(0, size):
            tournaments_name += f"{waiting_users[i]['channel_id']}_"
        self.aliveusers[tournaments_name] = []
        for i in range(0, size):
            self.tournaments[waiting_users[0]['channel_id']] = tournaments_name
            self.aliveusers[tournaments_name].append(waiting_users[0])
            waiting_users.pop(0)

    async def send_roomname(self,aliveusers,size):
        for i in range(0, size, 2):
            uuid1 = aliveusers[i]['channel_id']
            name1 = aliveusers[i]['channel_name']
            uuid2 = aliveusers[i + 1]['channel_id']
            name2 = aliveusers[i + 1]['channel_name']
            group_name = f'match_{uuid1}_{uuid2}'
            await self.channel_layer.group_add(group_name, name1)
            await self.channel_layer.group_add(group_name, name2)
            await self.channel_layer.group_send(
                group_name,
                {
                    'type': 'room_message',
                    'room_name' : f'{uuid1}_{uuid2}'
                }
            )

    async def room_message(self, event):
        room_name = event['room_name']
        await self.send(text_data=json.dumps({
            'room_name': room_name
        }))