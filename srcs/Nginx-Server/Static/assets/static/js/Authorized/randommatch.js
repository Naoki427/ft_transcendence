import { pongGame } from "/static/js/utils/game.js";
import { translations_format } from "/static/js/utils/translations.js";

const lang = parseInt(localStorage.getItem("language"), 10) || 0;
const translations = translations_format[lang];

document.addEventListener('DOMContentLoaded', (event) => {
    const matchButton = document.getElementById('matchButton');
    const statusDiv = document.getElementById('status');
    let matchSocket = null;
    
    // 翻訳を適用
    applyTranslations();

function applyTranslations() {
    // ステータステキストと対戦ボタンの翻訳を適用
    document.getElementById('status').textContent = translations.match_status;
    document.getElementById('matchButton').textContent = translations.match_button;
    
    // プレイヤーラベルの翻訳を適用
    document.getElementById('player1-label').textContent = translations.player1;
    document.getElementById('player2-label').textContent = translations.player2;
}

    matchButton.addEventListener('click', () => {
        if (matchButton.textContent === translations.match_button) {
            statusDiv.textContent = translations.match_searching;
            matchButton.textContent = translations.match_cancel;
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
        } else if (matchButton.textContent === translations.match_cancel) {
            statusDiv.textContent = translations.match_canceled;
            matchButton.textContent = translations.match_button;
            matchButton.classList.remove('cancel');
            if (matchSocket) {
                matchSocket.close();
            }
        }
    });
});