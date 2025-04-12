import { pongGame } from "/static/js/utils/game.js";
import { translations_format } from "/static/js/utils/translations.js";

const domain = window.location.origin;
const lang = parseInt(localStorage.getItem("language"), 10) || 0;
const translations = translations_format[lang];

document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.querySelector('form');

    applyTranslations();

    form.addEventListener('submit', function(event) {
        event.preventDefault();

    const userAlias = document.getElementById('userAlias').value || "no name";
    const errorMessage = document.getElementById('error-message');
    if (userAlias.length > 10) {
            errorMessage.style.display = 'block';
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        } else {
            const successMsg = document.createElement('div');
            successMsg.className = 'alert alert-success';
            successMsg.textContent = 'トーナメントに参加しました！';
            successMsg.style.backgroundColor = '#4CAF50';
            document.body.appendChild(successMsg);
            startTournament()
            setTimeout(() => {
            document.body.removeChild(successMsg);
            }, 3000);
        
        }});
});

function applyTranslations() {
    // トーナメントページの翻訳を適用
    document.getElementById("tournament-title").textContent = translations.tournament_title;
    document.getElementById("tournament-size-label").textContent = translations.tournament_size;
    document.getElementById("tournament-alias-label").textContent = translations.tournament_alias;
    document.getElementById("tournament-join-btn").textContent = translations.tournament_join;
}

async function startTournament() {
    const data = await getUserInfo();
    const userid = data.userid;
    const userImage = data.profile_image_url;
    const tournamentSize = parseInt(document.getElementById('tournamentSize').value, 10) || 4;
    const userAlias = document.getElementById('userAlias').value || "no name";
    const url = "wss://" + window.location.host + "/ws/tournament/";
    const scoreContainerElement = document.getElementById('score-container');
    const tournamentSocket = new WebSocket(url);
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
            const tournamentTableEight = document.getElementById('tournamentTableEight');
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