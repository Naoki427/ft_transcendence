document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.querySelector('form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const tournamentSize = document.getElementById('tournamentSize').value;
        const tournamentSocket = new WebSocket('ws://localhost:8000/ws/custom/');

        tournamentSocket.onopen = function(e) {
            const initMessage = { type: 'join_tournament', size: tournamentSize };
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