import { translations_format } from "/static/js/utils/translations.js";

const lang = parseInt(localStorage.getItem("language"), 10) || 0;
const translations = translations_format[lang];
export function pongGame(roomName, userid, pair , tournamentSocket = null) {
	const url = `wss://${window.location.host}/ws/game/${roomName}/`;
    console.log(`WebSocket URL: ${url}`);
    let playerRole = null;
    const countdownElement = document.getElementById('countdown');
    const scoreContainer = document.getElementById('score-container');
    const scorePlayer1Element = document.getElementById('player1score');
    const scorePlayer2Element = document.getElementById('player2score');
    const namePlayer1Element = document.getElementById('player1name');
    const namePlayer2Element = document.getElementById('player2name');
    const GAME_IN_PROGRESS = 'in_progress';
    const PLAYER1_WINS = 'player1_wins';
    const PLAYER2_WINS = 'player2_wins';
    let gameState = GAME_IN_PROGRESS;
    let myIndex = null;
    let enemyIndex = null;
    let myAlias = null;
    let enemyAlias = null;
    let player1ID = null;
    let player2ID = null;
    let player1image = null;
    let player2image = null;

    function gameStart() {
        let countdown = 3;
        countdownElement.style.display = 'block';
        countdownElement.innerHTML = 'READY';

        const countdownInterval = setInterval(() => {
            countdown -= 1;
            if (countdown == 0) {
                clearInterval(countdownInterval);
                countdownElement.style.display = 'none';
                scoreContainer.style.display = "block";
                startWebSocketConnection();
            }
        }, 1000);
    }

    function setPairInfo() {
        if (pair.user1.userid === userid) {
            myIndex = pair.user1.index;
            myAlias = pair.user1.alias;
            enemyIndex = pair.user2.index;
            enemyAlias = pair.user2.alias;
            if (playerRole === 'player1') {
                player1ID = userid;
                player2ID = pair.user2.userid;
                player1image = pair.user1.image;
                player2image = pair.user2.image;
                namePlayer1Element.textContent = myAlias + '(You)';
                namePlayer2Element.textContent = enemyAlias;
                setPlayerImage('player1image',pair.user1.image);
                setPlayerImage('player2image',pair.user2.image);
            } else {
                player1ID = pair.user2.userid;
                player2ID = userid;
                player1image = pair.user2.image;
                player2image = pair.user1.image;
                namePlayer1Element.textContent = enemyAlias;
                namePlayer2Element.textContent = myAlias + '(You)';
                setPlayerImage('player1image',pair.user2.image);
                setPlayerImage('player2image',pair.user1.image);
            }
        } else {
            myIndex = pair.user2.index;
            myAlias = pair.user2.alias;
            enemyIndex = pair.user1.index;
            enemyAlias = pair.user1.alias;
            if (playerRole === 'player1') {
                player1ID = userid;
                player2ID = pair.user1.userid;
                player1image = pair.user2.image;
                player2image = pair.user1.image;
                namePlayer1Element.textContent = myAlias + '(You)';
                namePlayer2Element.textContent = enemyAlias;
                setPlayerImage('player1image',pair.user2.image);
                setPlayerImage('player2image',pair.user1.image);
            } else {
                player1ID = pair.user1.userid;
                player2ID = userid;
                player1image = pair.user1.image;
                player2image = pair.user2.image;
                namePlayer1Element.textContent = enemyAlias;
                namePlayer2Element.textContent = myAlias + '(You)';
                setPlayerImage('player1image',pair.user1.image);
                setPlayerImage('player2image',pair.user2.image);
            }
        }
    }

    function setPlayerImage(conponentName, image) {
        const conponent = document.getElementById(conponentName);
        
        const existingImage = conponent.querySelector('.userimage');
        if (existingImage) {
            existingImage.remove();
        }
        
        const imageConponent = document.createElement('img');
        imageConponent.src = `${window.location.origin}/${image}`;
        imageConponent.alt = 'userimage';
        imageConponent.className = 'userimage';
        conponent.appendChild(imageConponent);
    }
    

    function addHomeButton() {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
    
        const homeWrapper = document.createElement('div');
        homeWrapper.className = 'home-button-wrapper';
    
        const homeButton = document.createElement('button');
        homeButton.className = 'home-button';
        homeButton.textContent = translations.tournament_back_home;
    
        homeButton.addEventListener('click', () => {
            if (tournamentSocket instanceof WebSocket) {
                tournamentSocket.close();
            }
            window.location.href = '/pages/home/';
        });
    
        homeWrapper.appendChild(homeButton);
        overlay.appendChild(homeWrapper);
        document.body.appendChild(overlay);
    }
    

    function startWebSocketConnection() {
        const socket = new WebSocket(url);

        //socetの設定はここから
        socket.onopen = function(e) {
            console.log('WebSocket connection established');
        };
        
        socket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            if (data.message) {
                console.log(data.message);
                if (data.message.startsWith('You are')) {
                    const playerInfo = data.message.split(' ');
                    playerRole = playerInfo[2];
                    setPairInfo();
                    console.log(`You are assigned as ${playerRole}`);
                    if (playerRole === 'player1') {
                        camera.position.set(300, 0, 400);
                        camera.rotation.x = Math.PI / 6;
                    } else if (playerRole === 'player2') {
                        camera.position.set(300, 800, 400);
                        camera.rotation.x = -Math.PI / 6;
                        camera.rotation.z = Math.PI;
                    }
                }
            }
            if (data.ball_position) {
                const ballPosition = data.ball_position;
                cylinder.position.set(ballPosition.x, ballPosition.y, 0);
                cylinderEdge.position.copy(cylinder.position);
                if (ballPosition.y === 45 && playerRole === 'player1') {
                    if (checkCollision(paddle1, ballPosition)) {
                        sendCollisionEvent();
                    } else {
                        sendNoCollision();
                    }
                } else if (ballPosition.y === 755 && playerRole === 'player2') {
                    if (checkCollision(paddle2, ballPosition)) {
                        sendCollisionEvent();
                    } else {
                        sendNoCollision();
                    }
                }
                if(ballPosition.y <= 0 && gameState === PLAYER2_WINS) {
                    const messageElement = document.getElementById('message');
                    if(playerRole === 'player1') {
                        addHomeButton()
                        messageElement.textContent = `${enemyAlias}\nWins!`;
                        if (tournamentSocket instanceof WebSocket) {
                            tournamentSocket.send(JSON.stringify({
                                'type': 'lose',
                                'loser-id': `${player1ID}`
                            }));
                            tournamentSocket.close();
                        }
                    }
                    else {
                        if (!tournamentSocket) {
                            document.getElementById('winnerContainer').style.display = 'flex';
            
                            const winnerImageElement = document.getElementById('winnerImage');
                            winnerImageElement.innerHTML = '';
                            const imgElement = document.createElement('img');
                            imgElement.src = `${window.location.origin}/${player2image}`;
                            imgElement.alt = 'Winner Image';
                            imgElement.className = 'winner-src';
                            winnerImageElement.appendChild(imgElement);
                            if(playerRole === 'player1')
                                document.getElementById('winnerName').textContent = enemyAlias;
                            else
                                document.getElementById('winnerName').textContent = myAlias;
                        }
                        messageElement.textContent = `${myAlias}\nWins!`;
                    }
                    messageElement.classList.remove('hidden');
                    socket.close();
                } else if ((ballPosition.y >= 800 && gameState === PLAYER1_WINS)) {
                    const messageElement = document.getElementById('message');
                    if(playerRole === 'player2') {
                        addHomeButton()
                        messageElement.textContent = `${enemyAlias}\nWins!`;
                        if (tournamentSocket instanceof WebSocket) {
                            tournamentSocket.send(JSON.stringify({
                                'type': 'lose',
                                'loser-id': `${player2ID}`
                            }));
                            tournamentSocket.close();
                        }
                    }
                    else {
                        if (!tournamentSocket) {
                            document.getElementById('winnerContainer').style.display = 'flex';
            
                            const winnerImageElement = document.getElementById('winnerImage');
                            winnerImageElement.innerHTML = '';
                            const imgElement = document.createElement('img');
                            imgElement.src = `${window.location.origin}/${player1image}`;
                            imgElement.alt = 'Winner Image';
                            imgElement.className = 'winner-src';
                            winnerImageElement.appendChild(imgElement);
                            
                            if(playerRole === 'player2')
                                document.getElementById('winnerName').textContent = enemyAlias;
                            else
                                document.getElementById('winnerName').textContent = myAlias;
                        }
                        messageElement.textContent = `${myAlias}\nWins!`;
                    }
                    messageElement.classList.remove('hidden');
                    socket.close();
                }
            }

            if (data.paddle_position) {
                const paddlePosition = data.paddle_position;
                if (playerRole === 'player1') {
                    paddle2.position.x = paddlePosition;
                    paddleEdge2.position.copy(paddle2.position);
                } else if (playerRole === 'player2') {
                    paddle1.position.x = paddlePosition;
                    paddleEdge1.position.copy(paddle1.position);
                }
            }
        
            if (data.score) {
                const data = JSON.parse(e.data);
                scorePlayer1Element.textContent = data.score.player1;
                scorePlayer2Element.textContent = data.score.player2;
                if(tournamentSocket instanceof WebSocket && playerRole === 'player1') {
                    tournamentSocket.send(JSON.stringify({
                        'type': 'score',
                        'score': {
                            'player1_score': data.score.player1,
                            'player2_score': data.score.player2,
                            'player1_alias': myAlias,
                            'player2_alias': enemyAlias,
                            'player1_index': myIndex,
                            'player2_index': enemyIndex,
                            "room_name": roomName
                        }
                    }));
                }
                if (data.score.player1 === 5) {
                    gameState = PLAYER1_WINS;
                }
                else if (data.score.player2 === 5) {
                    gameState = PLAYER2_WINS;
                }
            }
    };
        
        socket.onclose = function(e) {
            console.log('WebSocket connection closed');
        };

        function sendCollisionEvent() {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    'type': 'collision',
                    'message': 'Paddle collided with ball'
                }));
            }
        }

        function sendNoCollision() {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    'type': 'goal',
                    'message': 'Paddle didn\'t collid with ball'
                }));
            }
        }

        function checkCollision(paddle, ball) {

            const paddleBounds = {
                left: paddle.position.x - 60,
                right: paddle.position.x + 60,
                top: paddle.position.y + 5,
                bottom: paddle.position.y - 5
            };
        
            const ballBounds = {
                left: ball.x - 20,
                right: ball.x + 20,
                top: ball.y + 20,
                bottom: ball.y - 20
            };    
            return !(paddleBounds.left > ballBounds.right ||
                    paddleBounds.right < ballBounds.left ||
                    paddleBounds.top < ballBounds.bottom ||
                    paddleBounds.bottom > ballBounds.top);
        }

        let paddleSpeed = 5;
        let keysPressed = {
            ArrowLeft: false,
            ArrowRight: false
        };
        let animationFrameId;

        // キーの押下・離上を監視
        document.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                keysPressed[event.key] = true;
                if (!animationFrameId) {
                    animationFrameId = requestAnimationFrame(updatePaddle);
                }
            }
        });

        document.addEventListener('keyup', (event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                keysPressed[event.key] = false;
            }
        });

        // パドルの位置を更新する関数
        function updatePaddle() {
            if (playerRole === 'player1') {
                if (keysPressed.ArrowLeft) {
                    paddle1.position.x -= paddleSpeed;
                }
                if (keysPressed.ArrowRight) {
                    paddle1.position.x += paddleSpeed;
                }
                // 範囲制限
                paddle1.position.x = Math.max(60, Math.min(540, paddle1.position.x));
                paddleEdge1.position.copy(paddle1.position);
            } else if (playerRole === 'player2') {
                if (keysPressed.ArrowLeft) {
                    paddle2.position.x += paddleSpeed;
                }
                if (keysPressed.ArrowRight) {
                    paddle2.position.x -= paddleSpeed;
                }
                paddle2.position.x = Math.max(60, Math.min(540, paddle2.position.x));
                paddleEdge2.position.copy(paddle2.position);
            }

            // 再描画が必要な場合はここで送信
            sendPaddlePosition();

            // どちらかのキーが押されていれば次のフレームへ
            if (keysPressed.ArrowLeft || keysPressed.ArrowRight) {
                animationFrameId = requestAnimationFrame(updatePaddle);
            } else {
                animationFrameId = null;
            }
        }


        function sendPaddlePosition() {
            if (socket.readyState === WebSocket.OPEN) {
                const paddlePosition = playerRole === 'player1' ? paddle1.position.x : paddle2.position.x;
                socket.send(JSON.stringify({
                    'type': 'paddle_position',
                    'paddle_position': paddlePosition
                }));
            }
            animationFrameId = null;
        }
    }

    const canvas = document.getElementById('gameCanvas');
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();

    // カメラ
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(300, 0, 400);
    camera.rotation.x = Math.PI / 6;

    // ライト
    const light = new THREE.PointLight(0xffffff, 3, 10000);
    light.position.set(300, 400, 1000);
    scene.add(light);

    // 台
    const boadGeometry = new THREE.BoxGeometry(600, 800, 0);
    const boadMaterial = new THREE.MeshBasicMaterial({ color: 0x1E1E1E }); // ダークグレー
    const boad = new THREE.Mesh(boadGeometry, boadMaterial);
    boad.position.x = 300;
    boad.position.y = 400;
    boad.position.z = -5;
    scene.add(boad);

    // 横の壁
    const sideGeometry = new THREE.BoxGeometry(10, 800, 10);
    const sideMaterial = new THREE.MeshStandardMaterial({ color: 0x00FFFF }); // シアン
    const side1 = new THREE.Mesh(sideGeometry, sideMaterial);
    side1.position.x = 605;
    side1.position.y = 400;
    side1.position.z = 0;
    scene.add(side1);
    const side2 = new THREE.Mesh(sideGeometry, sideMaterial);
    side2.position.x = -5;
    side2.position.y = 400;
    side2.position.z = 0;
    scene.add(side2);

    // 中央の点線
    const dotGeometry = new THREE.BoxGeometry(20, 10, 1);
    const dotMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 }); // ゴールド
    for (let i = 0; i < 20; i++) {
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.x = 15 + i * 30;
        dot.position.y = 400;
        dot.position.z = -5;
        scene.add(dot);
    }

    // ボール
    const radiusTop = 20; // 上面の半径
    const radiusBottom = 20; // 底面の半径
    const height = 10; // 高さ
    const radialSegments = 32; // 円周の分割数
    const cylinderGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0xFF4500 }); // オレンジレッド
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.rotation.x = Math.PI / 2;
    cylinder.position.x = 300;
    cylinder.position.y = 400;
    scene.add(cylinder);

    // ボールのエッジ
    const cylinderEdgeGeometory = new THREE.EdgesGeometry(cylinderGeometry);
    const cylinderEdgesMaterial = new THREE.LineBasicMaterial({ color: 0x00008B }); // ダークブルー
    const cylinderEdge = new THREE.LineSegments(cylinderEdgeGeometory, cylinderEdgesMaterial);
    cylinderEdge.position.copy(cylinder.position);
    cylinderEdge.rotation.copy(cylinder.rotation);
    scene.add(cylinderEdge);

    // パドル
    const paddleGeometry = new THREE.BoxGeometry(120, 10, 10);
    const paddleMaterial = new THREE.MeshStandardMaterial({ color: 0x32CD32 }); // ライムグリーン
    const paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    const paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddle1.position.y = 20;
    paddle1.position.x = 300;
    scene.add(paddle1);
    paddle2.position.y = 780;
    paddle2.position.x = 300;
    scene.add(paddle2);

    // パドルのエッジ
    const paddleEdgeGeometory = new THREE.EdgesGeometry(paddleGeometry);
    const paddleEdgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // ブラック
    const paddleEdge1 = new THREE.LineSegments(paddleEdgeGeometory, paddleEdgesMaterial);
    const paddleEdge2 = new THREE.LineSegments(paddleEdgeGeometory, paddleEdgesMaterial);
    paddleEdge1.position.copy(paddle1.position);
    paddleEdge1.rotation.copy(paddle1.rotation);
    paddleEdge2.position.copy(paddle2.position);
    paddleEdge2.rotation.copy(paddle2.rotation);
    scene.add(paddleEdge1);
    scene.add(paddleEdge2);
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
    gameStart();
}