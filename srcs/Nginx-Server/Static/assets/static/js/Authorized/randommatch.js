import { pongGame } from "/static/js/utils/game.js";
import { translations_format } from "/static/js/utils/translations.js";
import { checkAuthorization } from "/static/js/utils/authJWT.js";

document.addEventListener('DOMContentLoaded', checkAuthorization);

const lang = parseInt(localStorage.getItem("language"), 10) || 0;
const translations = translations_format[lang];
const errorMessage = document.getElementById('error-message');
let userAlias = "no name";
let matchSocket = null;
const statusDiv = document.getElementById('status');

document.addEventListener('DOMContentLoaded', (event) => {
    const matchButton = document.getElementById('matchButton');
    
    // 翻訳を適用
    applyTranslations();

function applyTranslations() {
    // ステータステキストと対戦ボタンの翻訳を適用
    document.getElementById('status').textContent = translations.match_status;
    document.getElementById('matchButton').textContent = translations.match_button;
    
}

    matchButton.addEventListener('click', () => {
        userAlias = document.getElementById('userAlias').value || "no name";
        if (userAlias.length > 10) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = translations.tournament_alias_err;
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        } else {
            errorMessage.style.display = 'none';
            startMatching();
        }
    });


    document.getElementById('homeButton').addEventListener('click', function () {
        window.location.href = "/pages/home/";
    })
});

async function startMatching() {
    //トークンからユーザーデータを取得
    const data = await getUserInfo();
    const userid = data.userid;
    const userImage = data.profile_image_url;

    if (matchButton.textContent === translations.match_button) {
        statusDiv.textContent = translations.match_searching;
        matchButton.textContent = translations.match_cancel;
        matchButton.classList.add('cancel');

        const url = "wss://" + window.location.host + "/ws/match/";
        matchSocket = new WebSocket(url);

        matchSocket.onopen = function(event) {
            console.log('WebSocket connection established');
            const initMessage = { type: 'join', alias: userAlias, userid: userid, image: userImage};
            matchSocket.send(JSON.stringify(initMessage));
        };

        matchSocket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            console.log("reieve data",data);
            statusDiv.innerText = data.message;
            if(data.room_name && data.pair) {
                document.getElementById('matchmakingContainer').style.display = 'none';
                document.getElementById('gameContainer').style.display = 'block';
                matchSocket.close();
                pongGame(data.room_name,userid,data.pair);
            }
        };

        matchSocket.onclose = function(e) {
            console.log('Match socket closed');
        };
    } else if (matchButton.textContent === translations.match_cancel) {
        statusDiv.textContent = translations.match_canceled;
        matchButton.textContent = translations.match_button;
        matchButton.classList.remove('cancel');
        if (matchSocket) {
            matchSocket.close();
        }
    }
}

async function getUserInfo() {
    try {
        const response = await fetch(`${window.location.origin}/api/get_user_info/`, {
            method: "GET",
        });

        const data = await response.json()
        return data; 
    } catch (error) {
        console.error("Error: ", error);
        return null;
    }
}
