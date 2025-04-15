import { pongGame } from "/static/js/utils/game.js";
import { translations_format } from "/static/js/utils/translations.js";
import { checkAuthorization } from "/static/js/utils/authJWT.js";

document.addEventListener('DOMContentLoaded', checkAuthorization);

const domain = window.location.origin;
const lang = parseInt(localStorage.getItem("language"), 10) || 0;
const translations = translations_format[lang];
const spinner = document.getElementById('searchingContainer');
const form = document.getElementById('tournamentForm');
const errorMessage = document.getElementById('error-message');
let tournamentSocket = null;

document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.querySelector('form');

    applyTranslations();

    //トーナメントに参加ボタン
    form.addEventListener('submit', function(event) {
        event.preventDefault();

    const userAlias = document.getElementById('userAlias').value || "no name";
    if (userAlias.length > 10) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = translations.tournament_alias_err;
            spinner.style.display = 'none';
            form.style.display = 'block';
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        } else {
            form.style.display = 'none';
            spinner.style.display = 'block';
            errorMessage.style.display = 'none';
            //トーナメントにエントリー
            startTournament()
        }});
});

//参加をキャンセル
document.getElementById('cancelSearchBtn').addEventListener('click', function () {
    if (tournamentSocket && tournamentSocket.readyState === WebSocket.OPEN) {
        tournamentSocket.close();
        console.log('WebSocket connection closed by user.');
    }

    document.getElementById('searchingContainer').style.display = 'none';
    document.getElementById('tournamentForm').style.display = 'block';
});

document.getElementById('homeButton').addEventListener('click', function () {
    window.location.href = "/pages/home/";
})

function applyTranslations() {
    // トーナメントページの翻訳を適用
    document.getElementById("tournament-title").textContent = translations.tournament_title;
    document.getElementById("tournament-alias-label").textContent = translations.tournament_alias;
    document.getElementById("tournament-join-btn").textContent = translations.tournament_join;
    document.getElementById("search-message").textContent = translations.tournament_search;
    document.getElementById("cancelSearchBtn").textContent = translations.tournament_cancel;
    document.getElementById("homeButton").textContent = translations.tournament_back_home;
    
}

async function startTournament() {
    //トークンからユーザーデータを取得
    const data = await getUserInfo();
    const userid = data.userid;
    const userImage = data.profile_image_url;
    const tournamentSize =  4;
    const userAlias = document.getElementById('userAlias').value || "no name";
    //トーナメント用のwebsocketに接続
    const url = "wss://" + window.location.host + "/ws/tournament/";
    const scoreContainerElement = document.getElementById('score-container');
    tournamentSocket = new WebSocket(url);
    let otherMatchies = [];

    tournamentSocket.onopen = function(e) {
        const initMessage = { type: 'join_tournament', size: tournamentSize ,alias: userAlias, userid: userid, image: userImage};
        tournamentSocket.send(JSON.stringify(initMessage));
        console.log('WebSocket connection established and tournament size sent');
    };

    tournamentSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        console.log('Received:', data);

        if(data.participants_info) {
            document.getElementById('formContainer').style.display = 'none';
            document.getElementById('backcolor').style.backgroundColor = 'black'
            const tournamentTableFour = document.getElementById('tournamentTableFour');
            if(tournamentSize == 4) {
                tournamentTableFour.style.display = 'block';
            }
            const userNameComponents = ['usernameLeft4-1','usernameLeft4-2','usernameRight4-1','usernameRight4-2'];
            const imageConponents = ['userimageLeft4-1', 'userimageLeft4-2', 'userimageRight4-1', 'userimageRight4-2']
            const players = [];
            const numParticipants = data.participants_info.length;
            for (let i = 0; i < numParticipants; i++)  {
                players[i] = {
                    index: data.participants_info[i].index,
                    userid: data.participants_info[i].userid,
                    alias: data.participants_info[i].alias,
                    image: data.participants_info[i].image
                };
                setUserimage(domain,imageConponents[i],players[i].image);
                document.getElementById(userNameComponents[i]).textContent = players[i].alias;
                if(players[i].userid == userid) {
                    document.getElementById(userNameComponents[i]).style.backgroundColor = '#0f0';
                    document.getElementById(userNameComponents[i]).style.color = '#111';
                }
            }
        }

        if(data.dupmessage) {
            form.style.display = 'block';
            spinner.style.display = 'none';
            const successMsg = document.createElement('div');
            successMsg.className = 'alert alert-success';
            successMsg.textContent = translations.tournament_dup;
            successMsg.style.backgroundColor = '#f44336';
            document.body.appendChild(successMsg);
            setTimeout(() => {
            document.body.removeChild(successMsg);
            }, 1000);
        }
        
        if(data.room_name && data.pair) {
            gameStart(data.room_name,userid,data.pair,tournamentSocket);
        }

        if(data.score) {
            if(!otherMatchies.includes(data.score.room_name)) {
                otherMatchies.push(data.score.room_name);
                let newScoreElement = document.createElement('div');
                newScoreElement.id = data.score.room_name;
                newScoreElement.className = 'other-matcheis';
                scoreContainerElement.appendChild(newScoreElement);
                newScoreElement.textContent = `${data.score.player1_alias} : ${data.score.player1_score} - ${data.score.player2_score} : ${data.score.player2_alias}`;
            } else {
                document.getElementById(data.score.room_name).textContent = `${data.score.player1_alias} : ${data.score.player1_score} - ${data.score.player2_score} : ${data.score.player2_alias}`;
            }
        }

        if(data.finalist1 && data.finalist2) {
            let elements = document.querySelectorAll('.other-matcheis');
            document.getElementById('player1score').textContent = '0';
            document.getElementById('player2score').textContent = '0';

            elements.forEach(element => {
                element.remove();
            });
            
            document.getElementById('message').textContent = '';
            document.getElementById('gameContainer').style.display = 'none';
            document.getElementById('tournamentTableFour').style.display  = 'block'
            const tournamentImage = ["/static/images/Left-1.png","/static/images/Left-2.png","/static/images/Right-1.png","/static/images/Right-2.png"]
            document.getElementById('LeftBrokcImage').src = tournamentImage[data.finalist1 - 1];
            document.getElementById('RightBrokcImage').src = tournamentImage[data.finalist2 - 1];
        }

        if (data.winner_name && data.winner_image) {
            tournamentSocket.close();
            document.getElementById('winnerContainer').style.display = 'flex';
            
            const winnerImageElement = document.getElementById('winnerImage');
            winnerImageElement.innerHTML = '';
            const imgElement = document.createElement('img');
            imgElement.src = `${window.location.origin}/${data.winner_image}`;
            imgElement.alt = 'Winner Image';
            imgElement.className = 'winner-src';
            winnerImageElement.appendChild(imgElement);
            
            document.getElementById('winnerName').textContent = data.winner_name;
        }
        
    };

    tournamentSocket.onclose = function(e) {
        console.log('WebSocket connection closed');
    };

    tournamentSocket.onerror = function(e) {
        console.error('WebSocket error:', e);
    };
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

function setUserimage(domain,conponentName,image) {
    const imageConponent = document.createElement('img');
    imageConponent.src = `${domain}/${image}`;
    imageConponent.alt = 'userimage';
    imageConponent.className = 'userimage';
    const conponent = document.getElementById(conponentName);
    conponent.appendChild(imageConponent);
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function countdown(seconds) {
    const countdownElement = document.getElementById('match_countdown');
    countdownElement.style.display = 'block';
    for (let i = seconds; i >= 0; i--) {
      countdownElement.textContent = `試合開始まで...${i}`;
      await sleep(1000);
    }
    countdownElement.style.display = 'none';
}

async function gameStart(room_name,pair,userid,tournamentSocket) {
    await countdown(5);
    document.getElementById('tournamentTableFour').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    pongGame(room_name,pair,userid,tournamentSocket);
}