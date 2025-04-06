document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.querySelector('form');
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
        console.log("send data ",initMessage);
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

            if(tournamentSize == 4)
                tournamentTableFour.style.display = 'block';
            if(tournamentSize == 8)
                tournamentTableEight.style.display = 'block';
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
        console.log('recieved data:',data)
        return data; 
    } catch (error) {
        console.error("Error: ", error);
        return null;
    }
}