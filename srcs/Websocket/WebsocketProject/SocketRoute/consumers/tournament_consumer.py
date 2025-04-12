import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import uuid
import asyncio
import re

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
		if data['type'] == 'join_tournament':
			self.user_info[self.channel_id]['alias'] = data['alias']
			self.user_info[self.channel_id]['userid'] = data['userid']
			self.user_info[self.channel_id]['image'] = data['image']
			await self.handle_join_tournament(data['size'])
		if data['type'] == 'score':
			await self.send_score(data['score'])
		if data['type'] == 'lose':
			tournament_now = self.tournaments[self.channel_id]
			for user in self.aliveusers[tournament_now]:
				if user['userid'] == int(data['loser-id']):
					self.aliveusers[tournament_now].remove(user)
					break
			alive_num = len(self.aliveusers[tournament_now])
			if alive_num == 2:
				await self.send_players_to_final(self.aliveusers[tournament_now])
				self.reset_index(self.aliveusers[tournament_now])
				await self.send_roomname(self.aliveusers[tournament_now],2)
			if alive_num == 1:
				await self.send_winner(self.aliveusers[tournament_now])

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
		group_name = ''
		for i in range(0, 4):
			group_name += f"{waiting_users[i]['userid']}_"
		participants_info = []
		for i in range(0, 4):
			user = {
				'index': i+1,
				'userid': waiting_users[i]['userid'],
				'alias': waiting_users[i]['alias'],
				'image': waiting_users[i]['image'],
			}
			waiting_users[i]['index'] = i+1
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
		
	async def send_score(self,score):
		tournament_now = self.tournaments[self.channel_id]
		user_num = len(self.aliveusers[tournament_now])
		group_name = f'score_{score['room_name']}'
		sender_index1 = score['player1_index']
		sender_index2 = score['player2_index']
		for i in range(0, user_num):
			if(i + 1 != sender_index1 and i + 1 != sender_index2):
				await self.channel_layer.group_add(group_name, self.aliveusers[tournament_now][i]['channel_name'])
		await self.channel_layer.group_send(
			group_name,
			{
				'type': 'score_update',
				'score': {
					'player1_score': score['player1_score'],
					'player2_score': score['player2_score'],
					'player1_alias': score['player1_alias'],
					'player2_alias': score['player2_alias'],
					"room_name": score['room_name']
				}
			}
		)
	async def score_update(self, event):
		score = event['score']
		await self.send(text_data=json.dumps({
			'score': score
		}))
	
	async def send_players_to_final(self,aliveusers):
		group_name = f"{aliveusers[0]['userid']}_{aliveusers[1]['userid']}"
		await self.channel_layer.group_add(group_name, aliveusers[0]['channel_name'])
		await self.channel_layer.group_add(group_name, aliveusers[1]['channel_name'])
		await self.channel_layer.group_send(
			group_name,
			{
				'type': 'final_match',
				'finalist1': aliveusers[0]['index'],
				'finalist2': aliveusers[1]['index']
			}
		)

	async def final_match(self,event):
		player1_id = event['finalist1']
		player2_id = event['finalist2']
		await self.send(text_data=json.dumps({
			'finalist1': player1_id,
			'finalist2': player2_id
		}))

	def reset_index(self, aliveusers):
		for i in range(0, len(aliveusers)):
			aliveusers[i]['index'] = i + 1

	async def send_winner(self,aliveusers):
		group_name = f"winner_{aliveusers[0]['userid']}"
		await self.channel_layer.group_add(group_name, aliveusers[0]['channel_name'])
		await self.channel_layer.group_send(
			group_name,
			{
				'type': 'winner_info',
				'winner_name': aliveusers[0]['alias'],
				'winner_image': aliveusers[0]['image'],
			}
		)

	async def winner_info(self,event):
		winner_name = event['winner_name']
		winner_image = event['winner_image']
		await self.send(text_data=json.dumps({
			'winner_name': winner_name,
			'winner_image': winner_image
		}))

def sanitize_group_name(name):
	return re.sub(r'[^a-zA-Z0-9\-\._]', '', name)