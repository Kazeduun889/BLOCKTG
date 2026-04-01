// Конфигурация
const SIZE = 6;
const COLORS = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33']; // красный, зелёный, синий, жёлтый

let board = [];
let score = 0;

// DOM элементы
const gameBoard = document.getElementById('game-board');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restart');

// Инициализация поля
function initBoard() {
  board = Array(SIZE).fill().map(() =>
    Array(SIZE).fill().map(() => COLORS[Math.floor(Math.random() * COLORS.length)])
  );
  renderBoard();
  updateScore(0);
}

// Отображение доски
function renderBoard() {
  gameBoard.innerHTML = '';
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.backgroundColor = board[row][col];
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', () => handleCellClick(row, col));
      gameBoard.appendChild(cell);
    }
  }
}

// Обработка клика
function handleCellClick(row, col) {
  const targetColor = board[row][col];
  const group = findGroup(row, col);

  if (group.length < 2) return; // нужно минимум 2 блока

  // Удаляем группу
  for (const [r, c] of group) {
    board[r][c] = null;
  }

  updateScore(group.length * 10);
  applyGravity();
  renderBoard();

  // Отправка события в Telegram (можно использовать для аналитики)
  if (window.Telegram?.WebApp?.HapticFeedback) {
    Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

// Поиск группы (DFS)
function findGroup(row, col, visited = new Set(), color = board[row][col]) {
  const key = `${row},${col}`;
  if (
    visited.has(key) ||
    row < 0 || col < 0 || row >= SIZE || col >= SIZE ||
    board[row][col] !== color
  ) return [];

  visited.add(key);
  const group = [[row, col]];

  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of directions) {
    const [nr, nc] = [row + dr, col + dc];
    group.push(...findGroup(nr, nc, visited, color));
  }

  return group;
}

// Гравитация — блоки падают вниз
function applyGravity() {
  for (let col = 0; col < SIZE; col++) {
    const column = [];
    for (let row = SIZE - 1; row >= 0; row--) {
      if (board[row][col] !== null) {
        column.push(board[row][col]);
      }
    }
    while (column.length < SIZE) {
      column.push(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }
    for (let row = 0; row < SIZE; row++) {
      board[SIZE - 1 - row][col] = column[row];
    }
  }
}

// Обновление счёта
function updateScore(points) {
  score += points;
  scoreElement.textContent = score;
}

// Перезапуск
restartButton.addEventListener('click', () => {
  score = 0;
  initBoard();
});

// Запуск при загрузке
window.onload = () => {
  initBoard();

  // Уведомляем Telegram, что приложение готово
  if (window.Telegram?.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
  }
};
