import { pongGame } from "/static/js/utils/game.js";
const domain = window.location.origin;

document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.querySelector('form');

    setUserimage(domain);

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        startTournament()
    });
});

async function startTournament() {
    const data = await getUserInfo();
    const userid = data.userid;
    const userImage = data.profile_image_url;
    const tournamentSize = parseInt(document.getElementById('tournamentSize').value, 10) || 4;
    const userAlias = document.getElementById('userAlias').value || "no name";
    const url = "wss://" + window.location.host + "/ws/tournament/";
    const tournamentSocket = new WebSocket(url);

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
            const players = [];
            const numParticipants = data.participants_info.length;
            for (let i = 0; i < numParticipants; i++)  {
                players[i] = {
                    index: data.participants_info[i].index,
                    userid: data.participants_info[i].userid,
                    alias: data.participants_info[i].alias,
                    image: data.participants_info[i].image
                };
                document.getElementById(userNameComponents[i]).textContent = players[i].alias;
                if(players[i].userid == userid)
                    document.getElementById(userNameComponents[i]).style.backgroundColor = '#00B7CE';
            }
    }
        if(data.room_name) {
            gameStart(data.room_name);
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

function setUserimage(domain) {
    const userimgLeft1 = document.createElement('img');
    userimgLeft1.src = `${domain}/media/profile_images/default.png`;
    userimgLeft1.alt = 'userimage';
    userimgLeft1.className = 'userimage';
    userimgLeft1.id = 'userimageLeft1'
    const left1 = document.getElementById('userimageLeft4-1');
    left1.appendChild(userimgLeft1);

    const userimgLeft2 = document.createElement('img');
    userimgLeft2.src = `${domain}/media/profile_images/default.png`;
    userimgLeft2.alt = 'userimage';
    userimgLeft2.className = 'userimage';
    userimgLeft2.id = 'userimageLeft2'
    const left2 = document.getElementById('userimageLeft4-2');
    left2.appendChild(userimgLeft2);

    const userimgRight1 = document.createElement('img');
    userimgRight1.src = `${domain}/media/profile_images/default.png`;
    userimgRight1.alt = 'userimage';
    userimgRight1.className = 'userimage';
    userimgRight1.id = 'userimageRight1'
    const right1 = document.getElementById('userimageRight4-1');
    right1.appendChild(userimgRight1);

    const userimgRight2 = document.createElement('img');
    userimgRight2.src = `${domain}/media/profile_images/default.png`;
    userimgRight2.alt = 'userimage';
    userimgRight2.className = 'userimage';
    userimgRight2.id = 'userimageRight2'
    const right2 = document.getElementById('userimageRight4-2');
    right2.appendChild(userimgRight2);
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

async function gameStart(room_name) {
    await countdown(5);
    document.getElementById('tournamentTableFour').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    pongGame(room_name);
}