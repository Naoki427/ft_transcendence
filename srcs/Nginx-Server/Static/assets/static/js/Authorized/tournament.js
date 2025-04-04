document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.querySelector('form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        getUserInfo();
        const tournamentSize = parseInt(document.getElementById('tournamentSize').value, 10);
        const userAlias = document.getElementById('userAlias').value;
        const url = "wss://" + window.location.host + "/ws/tournament/";
        const tournamentSocket = new WebSocket(url);

        tournamentSocket.onopen = function(e) {
            const initMessage = { type: 'join_tournament', size: tournamentSize ,alias: userAlias};
            tournamentSocket.send(JSON.stringify(initMessage));
            console.log('WebSocket connection established and tournament size sent');
        };

        tournamentSocket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            console.log('Received:', data);
            // 必要に応じて受信したデータを処理
        };

        tournamentSocket.onclose = function(e) {
            console.log('WebSocket connection closed');
        };

        tournamentSocket.onerror = function(e) {
            console.error('WebSocket error:', e);
        };
    });
});

async function getUserInfo() {
    try {
        const response = await fetch(`${window.location.origin}/api/get_user_info/`, {
            method: "GET",
        });

        const data = await response.json()
        console.log('recieved data:',data)
    } catch (error) {
        console.error("Error: ", error);
    }
}