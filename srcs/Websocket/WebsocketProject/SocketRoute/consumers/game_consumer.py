import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import uuid
import asyncio
import random 

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

		if self.x <= 20 or self.x >= screen_width:
			if self.x <= 20:
				self.x = 20
			if self.x >= screen_width:
				self.x = screen_width
			self.vx = -self.vx
		
		if self.y < -50 or self.y > 850:
			self.point = False
			self.vx = random.choice([-20, 20])
			self.vy = random.choice([-20, 20])
			self.x = random.randint(100, 500)
			self.y = 400


	def ball_collision(self):
		if (self.y <= 45 and self.vy < 0) or (self.y >=755 and self.vy > 0):
			self.vy = -self.vy
			self.y += self.vy
			self.x += self.vx

class GameConsumer(AsyncWebsocketConsumer):
	rooms = {}
	lock = asyncio.Lock()
	ball_update_tasks = {} 
	async def connect(self):
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		self.room_group_name = f'game_{self.room_name}'
		self.running = True

		if self.room_group_name not in self.rooms:
			self.rooms[self.room_group_name] = {
				'score': {'player1': 0, 'player2': 0},
				'ball': Ball(300, 400, 20, 20),
				'players': {}
			}

		if self.room_group_name not in self.__class__.ball_update_tasks:
			self.__class__.ball_update_tasks[self.room_group_name] = asyncio.create_task(self.update_ball_position())

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

		
	async def disconnect(self, close_code):
		self.running = False 
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)
		if self.room_group_name in self.rooms:
			players = self.rooms[self.room_group_name]['players']
			if self.player in players:
				del players[self.player]
		
			if not players:
				del self.rooms[self.room_group_name]

				task = self.__class__.ball_update_tasks.get(self.room_group_name)
				if task:
					task.cancel()
					del self.__class__.ball_update_tasks[self.room_group_name]

	async def update_ball_position(self):
		while self.running:
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