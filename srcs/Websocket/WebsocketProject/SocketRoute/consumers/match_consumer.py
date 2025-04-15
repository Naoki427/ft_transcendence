import json
from channels.generic.websocket import AsyncWebsocketConsumer
import uuid

class MatchConsumer(AsyncWebsocketConsumer):
    waiting_users = []
    user_info = {}
    aliveusers = {}

    async def connect(self):
        await self.accept()
        self.channel_id = str(uuid.uuid4())
        self.user_info[self.channel_id] = {
            'channel_name': self.channel_name,
            'channel_id': self.channel_id,
        }

    async def disconnect(self, close_code):
        if self.channel_id in self.waiting_users:
            self.waiting_users.remove(self.channel_id)
        if self.channel_id in self.user_info:
            del self.user_info[self.channel_id]

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data['type'] == 'join':
            user = self.user_info[self.channel_id]
            user['alias'] = data['alias']
            user['userid'] = data['userid']
            user['image'] = data['image']

            # 重複参加防止
            if any(u['userid'] == user['userid'] for u in [self.user_info[cid] for cid in self.waiting_users]):
                await self.send(text_data=json.dumps({'error': 'Already in waiting list'}))
                return

            self.waiting_users.append(self.channel_id)

            if len(self.waiting_users) >= 2:
                match_users = [self.user_info[self.waiting_users[0]], self.user_info[self.waiting_users[1]]]
                group_name = f"match_{match_users[0]['channel_id']}_{match_users[1]['channel_id']}"
                self.aliveusers[group_name] = match_users
                await self.send_roomname(match_users, group_name)

                self.waiting_users.pop(0)
                self.waiting_users.pop(0)

    async def send_roomname(self, aliveusers, group_name):
        for user in aliveusers:
            await self.channel_layer.group_add(group_name, user['channel_name'])

        await self.channel_layer.group_send(
            group_name,
            {
                'type': 'room_message',
                'room_name': group_name,
                'pair': {
                    'user1': {
                        'userid': aliveusers[0]['userid'],
                        'alias': aliveusers[0]['alias'],
                        'image': aliveusers[0]['image']
                    },
                    'user2': {
                        'userid': aliveusers[1]['userid'],
                        'alias': aliveusers[1]['alias'],
                        'image': aliveusers[1]['image']
                    }
                }
            }
        )

    async def room_message(self, event):
        await self.send(text_data=json.dumps({
            'room_name': event['room_name'],
            'pair': event['pair']
        }))
        await self.close()
