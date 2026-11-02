"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode5 = __toESM(require("vscode"));

// src/compile.ts
var import_child_process = require("child_process");
var path = __toESM(require("path"));
var vscode = __toESM(require("vscode"));
function Compile(context) {
  const comando = vscode.commands.registerCommand(
    "miextension.compile",
    (uri) => {
      const dir = path.dirname(uri.fsPath);
      const salida = path.join(dir, "a.exe");
      (0, import_child_process.exec)(
        `clang "${uri.fsPath}" -o "${salida}"`,
        { cwd: dir },
        (error, stdout, stderr) => {
          if (error) {
            vscode.window.showErrorMessage(stderr || error.message);
            return;
          }
          vscode.window.showInformationMessage(`Creado: ${salida}`);
        }
      );
    }
  );
  context.subscriptions.push(comando);
}

// src/counter.ts
var vscode2 = __toESM(require("vscode"));
function LineCount(context) {
  const cmd = vscode2.commands.registerCommand("fuawei.countLines", () => {
    const editor = vscode2.window.activeTextEditor;
    if (!editor) {
      vscode2.window.showErrorMessage("No file is open");
      return;
    }
    let empty = 0;
    let comments = 0;
    let code = 0;
    const language = editor.document.languageId;
    const lines = editor.document.getText().split("\n");
    for (const line of lines) {
      const t = line.trim();
      if (t === "") {
        empty++;
      } else if (t.startsWith("//") || language === "python" && t.startsWith("#")) {
        comments++;
      } else {
        code++;
      }
    }
    const total = empty + comments + code;
    const panel = vscode2.window.createWebviewPanel(
      "lineStats",
      "Line Statistics",
      vscode2.ViewColumn.Beside,
      {}
    );
    panel.webview.html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #1e1e1e;
                        color: white;
                        padding: 20px;
                    }

                    h2 {
                        text-align: center;
                        color: #4fc3f7;
                    }

                    .card {
                        padding: 15px;
                        margin: 12px 0;
                        border-radius: 10px;
                        font-size: 20px;
                        font-weight: bold;
                    }

                    .code {
                        background-color: #2e7d32;
                    }

                    .comment {
                        background-color: #ef6c00;
                    }

                    .empty {
                        background-color: #616161;
                    }

                    .total {
                        background-color: #1565c0;
                    }
                </style>
            </head>

            <body>

                <h2>\u{1F4CA} Line Statistics</h2>

                <div class="card code">
                    \u{1F4BB} Code lines: ${code}
                </div>

                <div class="card comment">
                    \u{1F4AC} Comment lines: ${comments}
                </div>

                <div class="card empty">
                    \u{1F4C4} Empty lines: ${empty}
                </div>

                <div class="card total">
                    \u{1F4C8} Total lines: ${total}
                </div>

            </body>
            </html>
            `;
  });
  context.subscriptions.push(cmd);
}

// src/time.ts
var vscode3 = __toESM(require("vscode"));
function Timer(context) {
  const today = () => (/* @__PURE__ */ new Date()).toDateString();
  let seconds = 0;
  if (context.globalState.get("timerDate") === today()) {
    seconds = context.globalState.get("timerSeconds", 0);
  }
  const item = vscode3.window.createStatusBarItem(vscode3.StatusBarAlignment.Left, 100);
  item.command = "fuawei.resetTimer";
  item.tooltip = "Coding time today (click to reset)";
  const format = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor(s % 3600 / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };
  const render = () => {
    item.text = `$(clock) ${format(seconds)}`;
  };
  const save = () => {
    context.globalState.update("timerDate", today());
    context.globalState.update("timerSeconds", seconds);
  };
  const reset = vscode3.commands.registerCommand("fuawei.resetTimer", () => {
    seconds = 0;
    save();
    render();
  });
  render();
  item.show();
  const interval = setInterval(() => {
    if (context.globalState.get("timerDate") !== today() && seconds > 0) {
      seconds = 0;
    }
    seconds++;
    save();
    render();
  }, 1e3);
  context.subscriptions.push(item, reset, {
    dispose: () => clearInterval(interval)
  });
}

// src/gamePanel.ts
var vscode4 = __toESM(require("vscode"));
function openGamePanel(context) {
  const panel = vscode4.window.createWebviewPanel(
    "fuaweiGame",
    "FUAWEI Arcade (Snake & Tetris)",
    vscode4.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );
  panel.webview.html = getGameHtml();
}
function getGameHtml() {
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

    <!-- \u041C\u0435\u043D\u044E -->
    <div id="menu-screen" class="screen">
        <h1>FUAWEI Arcade</h1>
        <label>\u0420\u0430\u0437\u043C\u0435\u0440 \u043F\u043E\u043B\u044F (\u0434\u043B\u044F \u0417\u043C\u0435\u0439\u043A\u0438):
            <select id="field-size">
                <option value="15">\u041C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 (15x15)</option>
                <option value="20" selected>\u0421\u0440\u0435\u0434\u043D\u0435\u0435 (20x20)</option>
                <option value="30">\u0411\u043E\u043B\u044C\u0448\u043E\u0435 (30x30)</option>
            </select>
        </label>
        <button id="btn-snake">\u0418\u0433\u0440\u0430\u0442\u044C \u0432 \u0417\u043C\u0435\u0439\u043A\u0443</button>
        <button id="btn-tetris">\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0422\u0435\u0442\u0440\u0438\u0441 (\u0421\u043A\u0438\u043D\u044B \u0417\u043C\u0435\u0439\u043A\u0438)</button>
    </div>

    <!-- \u0418\u0433\u0440\u043E\u0432\u043E\u0439 \u044D\u043A\u0440\u0430\u043D -->
    <div id="game-screen" class="screen hidden">
        <div class="hud">
            <span id="score-label">\u0421\u0447\u0435\u0442: 0</span>
            <span id="status-label" style="color: #ffd700; font-size: 14px;"></span>
        </div>
        
        <!-- \u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441-\u0431\u0430\u0440 (\u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F \u0417\u043C\u0435\u0439\u043A\u0438) -->
        <div id="progress-wrapper" class="progress-container">
            <div style="font-size: 11px; margin-bottom: 2px;">\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u043F\u043E\u0431\u0435\u0434\u044B (50% \u043F\u043E\u043B\u044F):</div>
            <div class="progress-bar-container">
                <div id="progress-fill" class="progress-bar-fill"></div>
            </div>
        </div>

        <div class="game-layout">
            <div class="canvas-container">
                <canvas id="game-canvas"></canvas>
                <!-- \u041E\u0432\u0435\u0440\u043B\u0435\u0439 \u0441\u043C\u0435\u0440\u0442\u0438 -->
                <div id="game-over-overlay" class="overlay-screen hidden">
                    <h2 id="overlay-title">\u0418\u0413\u0420\u0410 \u041E\u041A\u041E\u041D\u0427\u0415\u041D\u0410</h2>
                    <p id="overlay-score" style="color: #ccc; margin: 0;"></p>
                    <button id="btn-restart">\u0420\u0435\u0441\u0442\u0430\u0440\u0442 (\u0438\u043B\u0438 \u0421\u0442\u0440\u0435\u043B\u043E\u0447\u043A\u0438/Enter)</button>
                </div>
            </div>

            <!-- \u0422\u0430\u0431\u043B\u0438\u0446\u0430 \u043B\u0443\u0447\u0448\u0438\u0445 \u043F\u043E\u043F\u044B\u0442\u043E\u043A \u0441\u043F\u0440\u0430\u0432\u0430 -->
            <div class="leaderboard">
                <h3 id="leaderboard-title">\u{1F3C6} \u0420\u0435\u043A\u043E\u0440\u0434\u044B</h3>
                <ol id="leaderboard-list">
                    <li>0</li>
                    <li>0</li>
                    <li>0</li>
                </ol>
            </div>
        </div>

        <button id="btn-back">\u0412 \u043C\u0435\u043D\u044E</button>
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
            leaderboardTitle.innerText = "\u{1F3C6} \u0422\u043E\u043F-3 (\u042F\u0431\u043B\u043E\u043A\u0438)";
            if (snakeHighScores.length === 0) {
                leaderboardList.innerHTML = '<li>\u041D\u0435\u0442 \u0440\u0435\u043A\u043E\u0440\u0434\u043E\u0432</li>';
            } else {
                leaderboardList.innerHTML = snakeHighScores.map(item => \`<li>\${item.apples} \u044F\u0431\u043B. (\${item.percent}%)</li>\`).join('');
            }
        } else {
            leaderboardTitle.innerText = "\u{1F3C6} \u0422\u043E\u043F-3 (\u041E\u0447\u043A\u0438)";
            leaderboardList.innerHTML = tetrisHighScores.map(score => \`<li>\${score} \u043E\u0447\u043A\u043E\u0432</li>\`).join('');
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
    // \u041B\u041E\u0413\u0418\u041A\u0410 \u0417\u041C\u0415\u0419\u041A\u0418
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
            // \u0417\u0430\u0449\u0438\u0442\u043D\u0430\u044F \u0437\u043E\u043D\u0430 3x5 \u0432\u043F\u0435\u0440\u0435\u0434\u0438 \u0437\u043C\u0435\u0439\u043A\u0438 (\u0448\u0438\u0440\u0438\u043D\u0430 3, \u0432\u044B\u0441\u043E\u0442\u0430 5)
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
                // \u041E\u0422\u041A\u0410\u0422 \u041D\u0410 4 \u0418\u0421\u0422\u041E\u0420\u0418\u0418 \u041D\u0410\u0417\u0410\u0414 (snakeHistory[3]), \u0411\u0415\u0417 \u0417\u0410\u0414\u0415\u0420\u0416\u041A\u0418
                let targetIndex = Math.min(3, snakeHistory.length - 1);
                if (targetIndex >= 0) {
                    snake = snakeHistory[targetIndex];
                    direction = { x: snake[0].x - snake[1].x, y: snake[0].y - snake[1].y };
                    nextDirection = direction;
                }
                isInvulnerable = false;
                goldTimer = 0;
                statusLabel.innerText = "\u2B50 \u041D\u0435\u0443\u044F\u0437\u0432\u0438\u043C\u043E\u0441\u0442\u044C \u0441\u043F\u0430\u0441\u043B\u0430 (\u043E\u0442\u043A\u0430\u0442 \u043D\u0430 4 \u0448\u0430\u0433\u0430)!";
                return;
            } else {
                let totalCells = cols * rows - walls.length;
                let targetLength = Math.floor(totalCells * 0.5);
                let currentPercent = Math.min(100, Math.floor((snake.length / targetLength) * 100));
                
                triggerGameOver("\u0418\u0413\u0420\u0410 \u041E\u041A\u041E\u041D\u0427\u0415\u041D\u0410", \`\u042F\u0431\u043B\u043E\u043A \u0441\u044A\u0435\u0434\u0435\u043D\u043E: \${applesEaten} (\${currentPercent}%)\`);
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
            triggerGameOver("\u041F\u041E\u0411\u0415\u0414\u0410! \u{1F389}", \`\u0412\u044B \u0437\u0430\u043F\u043E\u043B\u043D\u0438\u043B\u0438 \u043F\u043E\u043B\u043E\u0432\u0438\u043D\u0443 \u043F\u043E\u043B\u044F! \u042F\u0431\u043B\u043E\u043A: \${applesEaten} (100%)\`);
            saveSnakeRecord(applesEaten, 100);
            return;
        }

        scoreLabel.innerText = \`\u042F\u0431\u043B\u043E\u043A\u0438: \${applesEaten} | \u0414\u043B\u0438\u043D\u0430: \${snake.length}/\${targetLength}\`;
        statusLabel.innerText = isInvulnerable ? \`\u2B50 \u0417\u041E\u041B\u041E\u0422\u041E\u0419 (\${Math.ceil((goldTimer - Date.now())/1000)}\u0441)\` : '';

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
    // \u041B\u041E\u0413\u0418\u041A\u0410 \u0422\u0415\u0422\u0420\u0418\u0421\u0410 (\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0447\u0435\u0440\u0435\u0437 \u0446\u0435\u043D\u0442\u0440)
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
            triggerGameOver("\u0422\u0415\u0422\u0420\u0418\u0421 \u041E\u041A\u041E\u041D\u0427\u0415\u041D", "\u0421\u0447\u0435\u0442: " + tetrisScore);
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
        scoreLabel.innerText = '\u0421\u0447\u0435\u0442: ' + tetrisScore;
        statusLabel.innerText = '\u0421\u043A\u0438\u043D: \u0422\u0435\u0442\u0440\u0438\u0441-\u0417\u043C\u0435\u0439\u043A\u0430';
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

// src/extension.ts
function activate(context) {
  Compile(context);
  Timer(context);
  LineCount(context);
  console.log('Congratulations, your extension "fuawei" is now active!');
  const helloWorldDisposable = vscode5.commands.registerCommand("fuawei.helloWorld", () => {
    vscode5.window.showInformationMessage("Hello World from FUAWEI!");
  });
  const gameDisposable = vscode5.commands.registerCommand("fuawei.openGame", () => {
    openGamePanel(context);
  });
  context.subscriptions.push(helloWorldDisposable);
  context.subscriptions.push(gameDisposable);
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
