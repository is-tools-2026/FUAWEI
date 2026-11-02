import * as vscode from 'vscode';

export function openGamePanel(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'fuaweiGame',
        'FUAWEI Arcade (Snake & Tetris)',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    panel.webview.html = getGameHtml();
}

function getGameHtml(): string {
    return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>FUAWEI Arcade</title>
    <style>
        body {
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            font-family: var(--vscode-font-family);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
        }
        .screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        .hidden { display: none !important; }
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            border-radius: 4px;
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        select {
            background-color: var(--vscode-dropdown-background);
            color: var(--vscode-dropdown-foreground);
            border: 1px solid var(--vscode-dropdown-border);
            padding: 8px;
            font-size: 16px;
            border-radius: 4px;
        }
        .game-layout {
            display: flex;
            gap: 20px;
            align-items: flex-start;
        }
        .canvas-container {
            position: relative;
        }
        canvas {
            border: 2px solid var(--vscode-editor-foreground);
            background-color: #1e1e1e;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            display: block;
        }
        .hud {
            font-size: 16px;
            font-weight: bold;
            display: flex;
            gap: 20px;
            align-items: center;
            width: 100%;
            justify-content: space-between;
        }
        .progress-container {
            width: 100%;
            margin-bottom: 5px;
        }
        .progress-bar-container {
            width: 100%;
            height: 8px;
            background-color: #333;
            border-radius: 4px;
            overflow: hidden;
            border: 1px solid var(--vscode-editor-foreground);
        }
        .progress-bar-fill {
            height: 100%;
            width: 0%;
            background-color: #4CAF50;
            transition: width 0.1s;
        }
        .leaderboard {
            background-color: var(--vscode-editorWidget-background, #252526);
            border: 1px solid var(--vscode-editorWidget-border, #454545);
            padding: 12px 15px;
            border-radius: 6px;
            min-width: 180px;
        }
        .leaderboard h3 {
            margin: 0 0 8px 0;
            font-size: 13px;
            border-bottom: 1px solid #555;
            padding-bottom: 5px;
            text-align: center;
        }
        .leaderboard ol {
            margin: 0;
            padding-left: 20px;
            font-size: 13px;
            line-height: 1.6;
        }
        .overlay-screen {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.75);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 15px;
            z-index: 10;
        }
        .overlay-screen h2 {
            margin: 0;
            color: #fff;
            font-size: 24px;
        }
    </style>
</head>
<body>

    <!-- Меню -->
    <div id="menu-screen" class="screen">
        <h1>FUAWEI Arcade</h1>
        <label>Размер поля (для Змейки):
            <select id="field-size">
                <option value="15">Маленькое (15x15)</option>
                <option value="20" selected>Среднее (20x20)</option>
                <option value="30">Большое (30x30)</option>
            </select>
        </label>
        <button id="btn-snake">Играть в Змейку</button>
        <button id="btn-tetris">Классический Тетрис (Скины Змейки)</button>
    </div>

    <!-- Игровой экран -->
    <div id="game-screen" class="screen hidden">
        <div class="hud">
            <span id="score-label">Счет: 0</span>
            <span id="status-label" style="color: #ffd700; font-size: 14px;"></span>
        </div>
        
        <!-- Прогресс-бар (только для Змейки) -->
        <div id="progress-wrapper" class="progress-container">
            <div style="font-size: 11px; margin-bottom: 2px;">Прогресс победы (50% поля):</div>
            <div class="progress-bar-container">
                <div id="progress-fill" class="progress-bar-fill"></div>
            </div>
        </div>

        <div class="game-layout">
            <div class="canvas-container">
                <canvas id="game-canvas"></canvas>
                <!-- Оверлей смерти -->
                <div id="game-over-overlay" class="overlay-screen hidden">
                    <h2 id="overlay-title">ИГРА ОКОНЧЕНА</h2>
                    <p id="overlay-score" style="color: #ccc; margin: 0;"></p>
                    <button id="btn-restart">Рестарт (или Стрелочки/Enter)</button>
                </div>
            </div>

            <!-- Таблица лучших попыток справа -->
            <div class="leaderboard">
                <h3 id="leaderboard-title">🏆 Рекорды</h3>
                <ol id="leaderboard-list">
                    <li>0</li>
                    <li>0</li>
                    <li>0</li>
                </ol>
            </div>
        </div>

        <button id="btn-back">В меню</button>
    </div>

<script>
    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');
    const btnSnake = document.getElementById('btn-snake');
    const btnTetris = document.getElementById('btn-tetris');
    const btnBack = document.getElementById('btn-back');
    const btnRestart = document.getElementById('btn-restart');
    const fieldSizeSelect = document.getElementById('field-size');
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreLabel = document.getElementById('score-label');
    const statusLabel = document.getElementById('status-label');
    const progressWrapper = document.getElementById('progress-wrapper');
    const progressFill = document.getElementById('progress-fill');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayScore = document.getElementById('overlay-score');
    const leaderboardTitle = document.getElementById('leaderboard-title');
    const leaderboardList = document.getElementById('leaderboard-list');

    let currentMode = null; 
    let gameInterval = null;
    let tileSize = 25;
    let cols = 20;
    let rows = 20;
    let isGameOver = false;

    let snakeHighScores = JSON.parse(localStorage.getItem('fuawei_snake_records') || '[]');
    let tetrisHighScores = JSON.parse(localStorage.getItem('fuawei_tetris_records') || '[0, 0, 0]');

    function updateLeaderboardUI() {
        if (currentMode === 'snake') {
            leaderboardTitle.innerText = "🏆 Топ-3 (Яблоки)";
            if (snakeHighScores.length === 0) {
                leaderboardList.innerHTML = '<li>Нет рекордов</li>';
            } else {
                leaderboardList.innerHTML = snakeHighScores.map(item => \`<li>\${item.apples} ябл. (\${item.percent}%)</li>\`).join('');
            }
        } else {
            leaderboardTitle.innerText = "🏆 Топ-3 (Очки)";
            leaderboardList.innerHTML = tetrisHighScores.map(score => \`<li>\${score} очков</li>\`).join('');
        }
    }

    function saveSnakeRecord(applesCount, percentVal) {
        snakeHighScores.push({ apples: applesCount, percent: percentVal });
        snakeHighScores.sort((a, b) => b.apples - a.apples);
        snakeHighScores = snakeHighScores.slice(0, 3);
        localStorage.setItem('fuawei_snake_records', JSON.stringify(snakeHighScores));
        updateLeaderboardUI();
    }

    function saveTetrisRecord(scoreVal) {
        tetrisHighScores.push(scoreVal);
        tetrisHighScores.sort((a, b) => b - a);
        tetrisHighScores = tetrisHighScores.slice(0, 3);
        localStorage.setItem('fuawei_tetris_records', JSON.stringify(tetrisHighScores));
        updateLeaderboardUI();
    }

    btnSnake.onclick = () => startGame('snake');
    btnTetris.onclick = () => startGame('tetris');
    
    const returnToMenu = () => {
        clearInterval(gameInterval);
        gameOverOverlay.classList.add('hidden');
        gameScreen.classList.add('hidden');
        menuScreen.classList.remove('hidden');
    };

    btnBack.onclick = returnToMenu;
    btnRestart.onclick = () => restartGame();

    function restartGame() {
        gameOverOverlay.classList.add('hidden');
        isGameOver = false;
        if (currentMode === 'snake') initSnakeGame();
        else initTetrisGame();
    }

    function startGame(mode) {
        currentMode = mode;
        gameOverOverlay.classList.add('hidden');
        isGameOver = false;

        if (mode === 'snake') {
            cols = parseInt(fieldSizeSelect.value);
            rows = cols;
            tileSize = Math.floor(400 / cols);
            canvas.width = cols * tileSize;
            canvas.height = rows * tileSize;
            progressWrapper.style.display = 'block';
            initSnakeGame();
        } else {
            cols = 10;
            rows = 20;
            tileSize = 22;
            canvas.width = cols * tileSize;
            canvas.height = rows * tileSize;
            progressWrapper.style.display = 'none';
            initTetrisGame();
        }

        updateLeaderboardUI();
        menuScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
    }

    // ==========================================
    // ЛОГИКА ЗМЕЙКИ
    // ==========================================
    let snake, direction, nextDirection, applesList, walls, snakeHistory, applesEaten, goldTimer, isInvulnerable;

    function initSnakeGame() {
        applesEaten = 0;
        isInvulnerable = false;
        goldTimer = 0;
        
        const mid = Math.floor(cols / 2);
        snake = [
            { x: mid, y: mid, type: 'head' },
            { x: mid, y: mid + 1, type: 'body' },
            { x: mid, y: mid + 2, type: 'tail' }
        ];
        snakeHistory = [];
        direction = { x: 0, y: -1 };
        nextDirection = { x: 0, y: -1 };

        generateWalls();
        spawnApples();

        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(updateSnake, 140);
    }

    function generateWalls() {
        walls = [];
        const wallCount = Math.floor(cols * rows * 0.08);
        const mid = Math.floor(cols / 2);

        while (walls.length < wallCount) {
            let wx = Math.floor(Math.random() * cols);
            let wy = Math.floor(Math.random() * rows);
            // Защитная зона 3x5 впереди змейки (ширина 3, высота 5)
            let inSafeZone = (wx >= mid - 1 && wx <= mid + 1 && wy >= mid - 4 && wy <= mid);

            if (!inSafeZone && !walls.some(w => w.x === wx && w.y === wy)) {
                walls.push({ x: wx, y: wy });
            }
        }
    }

    function spawnApples() {
        applesList = [];
        applesList.push({ ...getRandomEmptyCell(), type: 'red' });
        applesList.push({ ...getRandomEmptyCell(), type: 'red' });
        applesList.push({ ...getRandomEmptyCell(), type: 'rotten' });
        applesList.push({ ...getRandomEmptyCell(), type: 'gold' });
    }

    function getRandomEmptyCell() {
        while (true) {
            let x = Math.floor(Math.random() * cols);
            let y = Math.floor(Math.random() * rows);
            let occupied = snake.some(s => s.x === x && s.y === y) || 
                           walls.some(w => w.x === x && w.y === y) || 
                           applesList.some(a => a.x === x && a.y === y);
            if (!occupied) return { x, y };
        }
    }

    function updateSnake() {
        if (isGameOver) return;

        direction = nextDirection;
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        snakeHistory.unshift(JSON.parse(JSON.stringify(snake)));
        if (snakeHistory.length > 15) snakeHistory.pop();

        let hit = false;
        if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) hit = true;
        if (walls.some(w => w.x === head.x && w.y === head.y)) hit = true;
        if (snake.slice(0, -1).some(s => s.x === head.x && s.y === head.y)) hit = true;

        if (hit) {
            if (isInvulnerable) {
                // ОТКАТ НА 4 ИСТОРИИ НАЗАД (snakeHistory[3]), БЕЗ ЗАДЕРЖКИ
                let targetIndex = Math.min(3, snakeHistory.length - 1);
                if (targetIndex >= 0) {
                    snake = snakeHistory[targetIndex];
                    direction = { x: snake[0].x - snake[1].x, y: snake[0].y - snake[1].y };
                    nextDirection = direction;
                }
                isInvulnerable = false;
                goldTimer = 0;
                statusLabel.innerText = "⭐ Неуязвимость спасла (откат на 4 шага)!";
                return;
            } else {
                let totalCells = cols * rows - walls.length;
                let targetLength = Math.floor(totalCells * 0.5);
                let currentPercent = Math.min(100, Math.floor((snake.length / targetLength) * 100));
                
                triggerGameOver("ИГРА ОКОНЧЕНА", \`Яблок съедено: \${applesEaten} (\${currentPercent}%)\`);
                saveSnakeRecord(applesEaten, currentPercent);
                return;
            }
        }

        snake.unshift(head);
        
        let eatenIndex = applesList.findIndex(a => a.x === head.x && a.y === head.y);
        if (eatenIndex !== -1) {
            let apple = applesList[eatenIndex];
            if (apple.type === 'red') {
                applesEaten += 1;
            } else if (apple.type === 'rotten') {
                applesEaten = Math.max(0, applesEaten - 1);
                if (snake.length > 3) snake.pop();
                snake.pop();
            } else if (apple.type === 'gold') {
                isInvulnerable = true;
                goldTimer = Date.now() + 30000; 
                snake.pop(); 
            }
            spawnApples();
        } else {
            snake.pop();
        }

        if (isInvulnerable && Date.now() > goldTimer) {
            isInvulnerable = false;
        }

        let totalCells = cols * rows - walls.length;
        let targetLength = Math.floor(totalCells * 0.5);
        let progressPercent = Math.min(100, Math.floor((snake.length / targetLength) * 100));
        progressFill.style.width = progressPercent + '%';

        if (snake.length >= targetLength) {
            triggerGameOver("ПОБЕДА! 🎉", \`Вы заполнили половину поля! Яблок: \${applesEaten} (100%)\`);
            saveSnakeRecord(applesEaten, 100);
            return;
        }

        scoreLabel.innerText = \`Яблоки: \${applesEaten} | Длина: \${snake.length}/\${targetLength}\`;
        statusLabel.innerText = isInvulnerable ? \`⭐ ЗОЛОТОЙ (\${Math.ceil((goldTimer - Date.now())/1000)}с)\` : '';

        drawSnakeGame();
    }

    function triggerGameOver(title, msg) {
        isGameOver = true;
        clearInterval(gameInterval);
        overlayTitle.innerText = title;
        overlayScore.innerText = msg;
        gameOverOverlay.classList.remove('hidden');
    }

    function drawSnakeGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#666';
        walls.forEach(w => ctx.fillRect(w.x * tileSize, w.y * tileSize, tileSize, tileSize));

        applesList.forEach(a => {
            if (a.type === 'red') ctx.fillStyle = '#ff4d4d';
            else if (a.type === 'rotten') ctx.fillStyle = '#8b4513';
            else if (a.type === 'gold') ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc((a.x + 0.5) * tileSize, (a.y + 0.5) * tileSize, tileSize / 2.5, 0, Math.PI * 2);
            ctx.fill();
        });

        snake.forEach((seg, idx) => {
            ctx.fillStyle = isInvulnerable ? '#ffd700' : (idx === 0 ? '#4CAF50' : (idx === snake.length - 1 ? '#81C784' : '#66BB6A'));
            ctx.fillRect(seg.x * tileSize + 1, seg.y * tileSize + 1, tileSize - 2, tileSize - 2);

            if (idx === 0) {
                ctx.fillStyle = '#000';
                let eyeSize = Math.max(2, tileSize / 6);
                ctx.fillRect(seg.x * tileSize + tileSize * 0.3, seg.y * tileSize + tileSize * 0.3, eyeSize, eyeSize);
                ctx.fillRect(seg.x * tileSize + tileSize * 0.6, seg.y * tileSize + tileSize * 0.3, eyeSize, eyeSize);
            }
        });
    }

    // ==========================================
    // ЛОГИКА ТЕТРИСА (Вращение через центр)
    // ==========================================
    let board, currentPiece, tetrisScore;
    
    const TETRIS_SHAPES = [
        { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: '#00f0f0' },
        { shape: [[1,1],[1,1]], color: '#f0f000' },
        { shape: [[0,1,0],[1,1,1],[0,0,0]], color: '#a000f0' },
        { shape: [[1,0,0],[1,1,1],[0,0,0]], color: '#f0a000' },
        { shape: [[0,0,1],[1,1,1],[0,0,0]], color: '#0000f0' },
        { shape: [[0,1,1],[1,1,0],[0,0,0]], color: '#00f000' },
        { shape: [[1,1,0],[0,1,1],[0,0,0]], color: '#f00000' }
    ];

    function initTetrisGame() {
        tetrisScore = 0;
        board = Array.from({ length: rows }, () => Array(cols).fill(null));
        spawnTetrisPiece();
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(updateTetris, 180);
    }

    function spawnTetrisPiece() {
        let template = TETRIS_SHAPES[Math.floor(Math.random() * TETRIS_SHAPES.length)];
        currentPiece = {
            shape: template.shape,
            color: template.color,
            x: Math.floor(cols / 2) - Math.floor(template.shape[0].length / 2),
            y: 0
        };
        if (checkTetrisCollision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
            triggerGameOver("ТЕТРИС ОКОНЧЕН", "Счет: " + tetrisScore);
            saveTetrisRecord(tetrisScore);
        }
    }

    function checkTetrisCollision(x, y, shape) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    let newX = x + c;
                    let newY = y + r;
                    if (newX < 0 || newX >= cols || newY >= rows) return true;
                    if (newY >= 0 && board[newY][newX]) return true;
                }
            }
        }
        return false;
    }

    function mergeTetrisPiece() {
        currentPiece.shape.forEach((row, r) => {
            row.forEach((val, c) => {
                if (val && currentPiece.y + r >= 0) {
                    board[currentPiece.y + r][currentPiece.x + c] = currentPiece.color;
                }
            });
        });
        clearTetrisLines();
        spawnTetrisPiece();
    }

    function clearTetrisLines() {
        let linesCleared = 0;
        for (let r = rows - 1; r >= 0; r--) {
            if (board[r].every(cell => cell !== null)) {
                board.splice(r, 1);
                board.unshift(Array(cols).fill(null));
                linesCleared++;
                r++;
            }
        }
        if (linesCleared > 0) {
            tetrisScore += linesCleared * 100;
        }
    }

    function updateTetris() {
        if (isGameOver) return;
        if (!checkTetrisCollision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
            currentPiece.y++;
        } else {
            mergeTetrisPiece();
        }
        scoreLabel.innerText = 'Счет: ' + tetrisScore;
        statusLabel.innerText = 'Скин: Тетрис-Змейка';
        drawTetrisGame();
    }

    function drawTetrisGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c]) {
                    drawSnakeBlock(c, r, board[r][c], false);
                }
            }
        }

        if (currentPiece) {
            let hasDrawnEyes = false;
            currentPiece.shape.forEach((row, r) => {
                row.forEach((val, c) => {
                    if (val && currentPiece.y + r >= 0) {
                        let needEyes = !hasDrawnEyes;
                        if (needEyes) hasDrawnEyes = true;
                        drawSnakeBlock(currentPiece.x + c, currentPiece.y + r, currentPiece.color, needEyes);
                    }
                });
            });
        }
    }

    function drawSnakeBlock(x, y, color, hasEyes) {
        ctx.fillStyle = color;
        ctx.fillRect(x * tileSize + 1, y * tileSize + 1, tileSize - 2, tileSize - 2);

        ctx.fillStyle = '#ffffff33';
        ctx.fillRect(x * tileSize + tileSize * 0.2, y * tileSize + tileSize * 0.2, tileSize * 0.6, tileSize * 0.6);

        if (hasEyes) {
            ctx.fillStyle = '#000';
            let eyeSize = Math.max(2, tileSize / 6);
            ctx.fillRect(x * tileSize + tileSize * 0.3, y * tileSize + tileSize * 0.3, eyeSize, eyeSize);
            ctx.fillRect(x * tileSize + tileSize * 0.6, y * tileSize + tileSize * 0.3, eyeSize, eyeSize);
        }
    }

    window.addEventListener('keydown', e => {
        if (isGameOver) {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
                restartGame();
            }
            return;
        }

        if (currentMode === 'snake') {
            if (e.key === 'ArrowUp' && direction.y === 0) nextDirection = { x: 0, y: -1 };
            if (e.key === 'ArrowDown' && direction.y === 0) nextDirection = { x: 0, y: 1 };
            if (e.key === 'ArrowLeft' && direction.x === 0) nextDirection = { x: -1, y: 0 };
            if (e.key === 'ArrowRight' && direction.x === 0) nextDirection = { x: 1, y: 0 };
        } else if (currentMode === 'tetris') {
            if (e.key === 'ArrowLeft' && !checkTetrisCollision(currentPiece.x - 1, currentPiece.y, currentPiece.shape)) currentPiece.x--;
            if (e.key === 'ArrowRight' && !checkTetrisCollision(currentPiece.x + 1, currentPiece.y, currentPiece.shape)) currentPiece.x++;
            if (e.key === 'ArrowDown' && !checkTetrisCollision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) currentPiece.y++;
            if (e.key === 'ArrowUp') {
                let rotated = currentPiece.shape[0].map((_, index) => currentPiece.shape.map(row => row[index]).reverse());
                if (!checkTetrisCollision(currentPiece.x, currentPiece.y, rotated)) {
                    currentPiece.shape = rotated;
                }
            }
            drawTetrisGame();
        }
    });
</script>
</body>
</html>`;
}