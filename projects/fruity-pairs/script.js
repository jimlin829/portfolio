const difficulties = {
  Easy: { grid: [4, 3], pairs: 6 },
  Medium: { grid: [4, 5], pairs: 10 },
  Hard: { grid: [7, 4], pairs: 14 }
};

const fruits = [
  ["Banana", "banana.png"],
  ["Blackberry", "black-berry-dark.png"],
  ["Black Cherry", "black-cherry.png"],
  ["Coconut", "coconut.png"],
  ["Green Apple", "green-apple.png"],
  ["Green Grape", "green-grape.png"],
  ["Lemon", "lemon.png"],
  ["Lime", "lime.png"],
  ["Orange", "orange.png"],
  ["Peach", "peach.png"],
  ["Pear", "pear.png"],
  ["Plum", "plum.png"],
  ["Raspberry", "raspberry.png"],
  ["Red Apple", "red-apple.png"],
  ["Red Cherry", "red-cherry.png"],
  ["Red Grape", "red-grape.png"],
  ["Star Fruit", "star-fruit.png"],
  ["Strawberry", "strawberry.png"],
  ["Watermelon", "watermelon.png"]
];

let difficulty = "Easy";
let cards = [];
let selected = [];
let moves = 0;
let startedAt = 0;
let timer = null;
let lockBoard = false;

const menuScreen = document.querySelector("#menu-screen");
const gameScreen = document.querySelector("#game-screen");
const instructionsScreen = document.querySelector("#instructions-screen");
const victoryScreen = document.querySelector("#victory-screen");
const difficultyOptions = document.querySelector("#difficulty-options");
const rankingList = document.querySelector("#ranking-list");
const board = document.querySelector("#board");
const movesEl = document.querySelector("#moves");
const timeEl = document.querySelector("#time");
const difficultyLabel = document.querySelector("#difficulty-label");
const victoryMessage = document.querySelector("#victory-message");
const victoryRanking = document.querySelector("#victory-ranking");

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function getScores() {
  return JSON.parse(localStorage.getItem("fruityPairsScores") || "{}");
}

function setScores(scores) {
  localStorage.setItem("fruityPairsScores", JSON.stringify(scores));
}

function getElapsedSeconds() {
  return startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
}

function updateTimer() {
  timeEl.textContent = formatTime(getElapsedSeconds());
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function showScreen(screen) {
  [menuScreen, gameScreen, instructionsScreen, victoryScreen].forEach((element) => {
    element.classList.add("hidden");
  });
  screen.classList.remove("hidden");
}

function renderDifficultyButtons() {
  difficultyOptions.replaceChildren();
  Object.entries(difficulties).forEach(([name, config]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${name} ${config.grid[0]}x${config.grid[1]}`;
    button.classList.toggle("active", difficulty === name);
    button.addEventListener("click", () => {
      difficulty = name;
      renderDifficultyButtons();
      renderRanking();
    });
    difficultyOptions.append(button);
  });
}

function renderRanking(target = rankingList) {
  const scores = getScores()[difficulty] || [];
  target.replaceChildren();

  if (!scores.length) {
    const empty = document.createElement("li");
    empty.className = "empty-ranking";
    empty.textContent = "No games yet";
    target.append(empty);
    return;
  }

  scores.slice(0, 5).forEach((score) => {
    const item = document.createElement("li");
    item.textContent = `${score.moves} moves · ${formatTime(score.seconds)}`;
    target.append(item);
  });
}

function renderMenu() {
  clearInterval(timer);
  renderDifficultyButtons();
  renderRanking();
  showScreen(menuScreen);
}

function createCards() {
  const config = difficulties[difficulty];
  const selectedFruits = fruits.slice(0, config.pairs);
  return shuffle([...selectedFruits, ...selectedFruits].map(([name, file], index) => ({
    id: `${name}-${index}`,
    name,
    file,
    revealed: false,
    matched: false
  })));
}

function renderBoard() {
  const [cols] = difficulties[difficulty].grid;
  board.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 122px))`;
  board.replaceChildren();

  cards.forEach((card, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "card";
    button.classList.toggle("revealed", card.revealed);
    button.classList.toggle("matched", card.matched);
    button.setAttribute("aria-label", card.revealed || card.matched ? card.name : "Hidden fruit card");
    button.addEventListener("click", () => flipCard(index));

    if (card.revealed || card.matched) {
      const image = document.createElement("img");
      image.className = "fruit";
      image.src = `assets/fruits/${card.file}`;
      image.alt = card.name;

      const label = document.createElement("span");
      label.className = "fruit-name";
      label.textContent = card.name;

      button.append(image, label);
    }

    board.append(button);
  });
}

function startGame() {
  cards = createCards();
  selected = [];
  moves = 0;
  lockBoard = false;
  startedAt = Date.now();
  difficultyLabel.textContent = difficulty;
  movesEl.textContent = "0";
  updateTimer();
  clearInterval(timer);
  timer = setInterval(updateTimer, 1000);
  renderBoard();
  showScreen(gameScreen);
}

function flipCard(index) {
  if (lockBoard) return;

  const card = cards[index];
  if (card.revealed || card.matched) return;

  card.revealed = true;
  selected.push(index);
  renderBoard();

  if (selected.length === 2) {
    moves += 1;
    movesEl.textContent = String(moves);
    resolvePair();
  }
}

function resolvePair() {
  const [firstIndex, secondIndex] = selected;
  const first = cards[firstIndex];
  const second = cards[secondIndex];

  if (first.name === second.name) {
    first.matched = true;
    second.matched = true;
    selected = [];
    renderBoard();
    if (cards.every((card) => card.matched)) finishGame();
    return;
  }

  lockBoard = true;
  setTimeout(() => {
    first.revealed = false;
    second.revealed = false;
    selected = [];
    lockBoard = false;
    renderBoard();
  }, 750);
}

function finishGame() {
  clearInterval(timer);
  const seconds = getElapsedSeconds();
  const scores = getScores();
  const records = scores[difficulty] || [];
  records.push({ moves, seconds, date: new Date().toISOString() });
  records.sort((a, b) => a.moves - b.moves || a.seconds - b.seconds);
  scores[difficulty] = records.slice(0, 10);
  setScores(scores);

  victoryMessage.textContent = `You completed ${difficulty} in ${moves} moves and ${formatTime(seconds)}.`;
  document.querySelectorAll(".empty-ranking").forEach((node) => node.remove());
  renderRanking(victoryRanking);
  showScreen(victoryScreen);
}

function clearRecords() {
  const scores = getScores();
  scores[difficulty] = [];
  setScores(scores);
  renderMenu();
}

document.querySelector("#play-button").addEventListener("click", startGame);
document.querySelector("#instructions-button").addEventListener("click", () => showScreen(instructionsScreen));
document.querySelector("#instructions-back-button").addEventListener("click", renderMenu);
document.querySelector("#clear-button").addEventListener("click", clearRecords);
document.querySelector("#restart-button").addEventListener("click", startGame);
document.querySelector("#menu-button").addEventListener("click", renderMenu);
document.querySelector("#play-again-button").addEventListener("click", startGame);
document.querySelector("#victory-menu-button").addEventListener("click", renderMenu);

renderMenu();
