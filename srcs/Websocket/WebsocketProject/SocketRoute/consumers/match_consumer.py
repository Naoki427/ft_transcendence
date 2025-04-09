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