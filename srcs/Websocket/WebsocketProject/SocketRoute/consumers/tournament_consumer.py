import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import uuid
import asyncio

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
		if data['type'] == 'score'
			

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
			waiting_users[i]['index'] = i
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

	async def send_roomname(self, aliveusers, size):
		for i in range(0, size, 2):
			uuid1 = aliveusers[i]['channel_id']
			name1 = aliveusers[i]['channel_name']
			uuid2 = aliveusers[i + 1]['channel_id']
			name2 = aliveusers[i + 1]['channel_name']
			group_name = f'match_{uuid1}_{uuid2}'
			userid1 = aliveusers[i]['userid']
			userid2 = aliveusers[i + 1]['userid']
			image1 = aliveusers[i]['image']
			image2 = aliveusers[i + 1]['image']
			alias1 = aliveusers[i]['alias']
			alias2 = aliveusers[i + 1]['alias']
			index1 = aliveusers[i]['index']
			index2 = aliveusers[i + 1]['index']

			await self.channel_layer.group_add(group_name, name1)
			await self.channel_layer.group_add(group_name, name2)
			
			await self.channel_layer.group_send(
				group_name,
				{
					'type': 'room_message',
					'room_name': f'{uuid1}_{uuid2}',
					'pair': {
						'user1': {
							'userid': userid1,
							'image': image1,
							'alias': alias1,
							'index': index1
						},
						'user2': {
							'userid': userid2,
							'image': image2,
							'alias': alias2,
							'index': index2
						}
					}
				}
			)
		
	async def room_message(self, event):
		room_name = event['room_name']
		pair = event['pair']
		await self.send(text_data=json.dumps({
			'room_name': room_name,
			'pair': pair
		}))
		