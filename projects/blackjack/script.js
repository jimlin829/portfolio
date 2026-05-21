const suits = [
  { name: "Hearts", symbol: "♥", red: true },
  { name: "Diamonds", symbol: "♦", red: true },
  { name: "Clubs", symbol: "♣", red: false },
  { name: "Spades", symbol: "♠", red: false }
];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

let chips = 1000;
let currentBet = 100;
let deck = [];
let playerHand = [];
let dealerHand = [];
let dealerHidden = true;
let roundActive = false;
let roundOver = false;

const chipsEl = document.querySelector("#chips");
const betEl = document.querySelector("#current-bet");
const statusEl = document.querySelector("#status");
const dealerCardsEl = document.querySelector("#dealer-cards");
const playerCardsEl = document.querySelector("#player-cards");
const dealerScoreEl = document.querySelector("#dealer-score");
const playerScoreEl = document.querySelector("#player-score");
const dealButton = document.querySelector("#deal-button");
const nextButton = document.querySelector("#next-button");
const hitButton = document.querySelector("#hit-button");
const standButton = document.querySelector("#stand-button");
const resetButton = document.querySelector("#reset-button");
const betButtons = document.querySelectorAll("[data-bet]");

function createDeck() {
  const cards = [];
  suits.forEach((suit) => {
    ranks.forEach((rank) => cards.push({ rank, suit }));
  });

  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

function cardValue(card) {
  if (card.rank === "A") return 11;
  if (["J", "Q", "K"].includes(card.rank)) return 10;
  return Number(card.rank);
}

function scoreHand(hand) {
  let total = hand.reduce((sum, card) => sum + cardValue(card), 0);
  let aces = hand.filter((card) => card.rank === "A").length;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

function isBlackjack(hand) {
  return hand.length === 2 && scoreHand(hand) === 21;
}

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = `status-line ${type}`.trim();
}

function drawCard(card, hidden = false) {
  const el = document.createElement("div");
  el.className = "card";

  if (hidden) {
    el.classList.add("back");
    return el;
  }

  if (card.suit.red) el.classList.add("red");
  el.dataset.rank = card.rank;
  el.dataset.suit = card.suit.symbol;
  el.textContent = card.suit.symbol;
  return el;
}

function render() {
  chipsEl.textContent = chips;
  betEl.textContent = currentBet;
  playerCardsEl.replaceChildren(...playerHand.map((card) => drawCard(card)));
  dealerCardsEl.replaceChildren(...dealerHand.map((card, index) => drawCard(card, dealerHidden && index === 1)));

  playerScoreEl.textContent = `Score: ${scoreHand(playerHand) || 0}`;
  if (dealerHidden && dealerHand.length > 0) {
    dealerScoreEl.textContent = `Visible score: ${cardValue(dealerHand[0])}`;
  } else {
    dealerScoreEl.textContent = `Score: ${scoreHand(dealerHand) || 0}`;
  }

  betButtons.forEach((button) => {
    button.disabled = roundActive;
  });
  hitButton.disabled = !roundActive;
  standButton.disabled = !roundActive;
  dealButton.classList.toggle("hidden", roundOver && chips > 0);
  nextButton.classList.toggle("hidden", !roundOver || chips <= 0);
  dealButton.disabled = roundActive || roundOver || chips <= 0;
  nextButton.disabled = roundActive || chips <= 0;
}

function settle(result) {
  roundActive = false;
  roundOver = true;
  dealerHidden = false;

  if (result === "blackjack") {
    const payout = Math.floor(currentBet * 1.5);
    chips += payout;
    setStatus(`Blackjack! You gain ${payout} chips.`, "win");
  } else if (result === "win") {
    chips += currentBet;
    setStatus(`You win ${currentBet} chips.`, "win");
  } else if (result === "loss") {
    chips -= currentBet;
    setStatus(`You lose ${currentBet} chips.`, "loss");
  } else {
    setStatus("Push. Your bet is returned.");
  }

  if (chips <= 0) {
    chips = 0;
    setStatus("You have 0 chips. Game over.", "loss");
  }

  currentBet = Math.min(currentBet, Math.max(chips, 10));
  render();
}

function compareHands() {
  const playerScore = scoreHand(playerHand);
  const dealerScore = scoreHand(dealerHand);

  if (dealerScore > 21) settle("win");
  else if (playerScore > dealerScore) settle("win");
  else if (playerScore < dealerScore) settle("loss");
  else settle("push");
}

function dealerTurn() {
  if (!roundActive) return;

  dealerHidden = false;

  while (scoreHand(dealerHand) < 17) {
    dealerHand.push(deck.pop());
  }

  compareHands();
}

function startRound() {
  if (chips <= 0) return;

  currentBet = Math.min(currentBet, chips);
  deck = createDeck();
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];
  dealerHidden = true;
  roundActive = true;
  roundOver = false;
  setStatus("Your turn: Hit or Stand.");

  if (isBlackjack(playerHand) || isBlackjack(dealerHand)) {
    if (isBlackjack(playerHand) && isBlackjack(dealerHand)) settle("push");
    else if (isBlackjack(playerHand)) settle("blackjack");
    else settle("loss");
    return;
  }

  render();
}

function hit() {
  if (!roundActive) return;

  playerHand.push(deck.pop());
  const score = scoreHand(playerHand);

  if (score > 21) {
    settle("loss");
  } else if (score === 21) {
    setStatus("You reached 21. Dealer plays.");
    dealerTurn();
  } else {
    setStatus("Card drawn. Hit or Stand?");
    render();
  }
}

function resetGame() {
  chips = 1000;
  currentBet = 100;
  deck = [];
  playerHand = [];
  dealerHand = [];
  dealerHidden = true;
  roundActive = false;
  roundOver = false;
  setStatus("Place a bet and press Deal.");
  render();
}

betButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentBet = Math.max(10, Math.min(chips, currentBet + Number(button.dataset.bet)));
    render();
  });
});

dealButton.addEventListener("click", startRound);
nextButton.addEventListener("click", startRound);
hitButton.addEventListener("click", hit);
standButton.addEventListener("click", dealerTurn);
resetButton.addEventListener("click", resetGame);

render();
