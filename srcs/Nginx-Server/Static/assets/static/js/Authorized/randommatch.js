import { pongGame } from "/static/js/utils/game.js";

document.addEventListener('DOMContentLoaded', (event) => {
    const matchButton = document.getElementById('matchButton');
    const statusDiv = document.getElementById('status');
    let matchSocket = null;

    matchButton.addEventListener('click', () => {
        if (matchButton.textContent === '対戦') {
            statusDiv.textContent = '対戦相手を探しています...';
            matchButton.textContent = 'キャンセル';
            matchButton.classList.add('cancel');

            const url = "wss://" + window.location.host + "/ws/match/";
            matchSocket = new WebSocket(url);

            matchSocket.onopen = function(event) {
                console.log('WebSocket connection established');
                matchSocket.send(JSON.stringify({
                    'action': 'join'
                }));
            };

            matchSocket.onmessage = function(e) {
                const data = JSON.parse(e.data);
                console.log("reieve data",data);
                statusDiv.innerText = data.message;
                if(data.room_name) {
                    document.getElementById('matchmakingContainer').classList.add('hidden');
                    document.getElementById('gameContainer').classList.remove('hidden');
                    pongGame(data.room_name);
                }
            };

            matchSocket.onclose = function(e) {
                console.error('Match socket closed');
            };
        } else if (matchButton.textContent === 'キャンセル') {
            statusDiv.textContent = '対戦相手の検索をキャンセルしました。';
            matchButton.textContent = '対戦';
            matchButton.classList.remove('cancel');
            if (matchSocket) {
                matchSocket.close();
            }
        }
    });
});