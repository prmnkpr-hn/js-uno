const colors = ['red', 'green', 'blue', 'yellow'];
const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', '+2'];
const wildCards = ['Wild', 'Wild+4'];

let deck = [];
let discardPile = [];
let playerHand = [];
let cpuHands = [[], [], []];
let currentPlayerIndex = 0;
let direction = 1;
let isGameOver = false;

function createDeck() {
    let deck = [];
    for (let color of colors) {
        for (let value of values) {
            deck.push({ color, value });
            if (value !== '0') {
                deck.push({ color, value });
            }
        }
    }
    for (let i = 0; i < 4; i++) {
        deck.push({ color: 'wild', value: 'Wild' });
        deck.push({ color: 'wild', value: 'Wild+4' });
    }
    return shuffle(deck);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function drawCard(deck) {
    if (deck.length === 0) {
        deck = shuffle(discardPile);
        discardPile = [];
    }
    return deck.pop();
}

function renderCard(card) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card', card.color === 'wild' ? 'wild' : card.color);
    cardElement.textContent = card.value;
    return cardElement;
}

function startGame() {
    deck = createDeck();
    playerHand = [];
    cpuHands = [[], [], []];
    for (let i = 0; i < 7; i++) {
        playerHand.push(drawCard(deck));
        cpuHands[0].push(drawCard(deck));
        cpuHands[1].push(drawCard(deck));
        cpuHands[2].push(drawCard(deck));
    }
    discardPile = [drawCard(deck)];
    currentPlayerIndex = 0;
    direction = 1;
    isGameOver = false;
    renderGame();
}

function renderGame() {
    const playerHandElement = document.getElementById('player-hand');
    playerHandElement.innerHTML = '';
    playerHand.forEach(card => {
        const cardElement = renderCard(card);
        cardElement.addEventListener('click', () => playCard(card, 0));
        playerHandElement.appendChild(cardElement);
    });

    cpuHands.forEach((cpuHand, index) => {
        const cpuHandElement = document.getElementById(`cpu${index + 1}-hand`);
        cpuHandElement.querySelector('.card-count').textContent = cpuHand.length;
    });

    const discardPileElement = document.getElementById('discard-pile');
    discardPileElement.innerHTML = '';
    discardPileElement.appendChild(renderCard(discardPile[discardPile.length - 1]));

    if (playerHand.length === 1) {
        document.getElementById('message').textContent = 'You must say UNO!';
    } else {
        document.getElementById('message').textContent = '';
    }

    if (isGameOver) {
        calculateScores();
    }

    // プレイヤーのターンかどうかに応じて背景色を変更
    const gameBoard = document.getElementById('game-board');
    if (currentPlayerIndex === 0) {
        gameBoard.classList.add('player-turn');
    } else {
        gameBoard.classList.remove('player-turn');
    }
}

function playCard(card, playerIndex) {
    if (currentPlayerIndex !== playerIndex) return;
    const topCard = discardPile[discardPile.length - 1];
    if (card.color === topCard.color || card.value === topCard.value || card.color === 'wild') {
        discardPile.push(card);
        playerHand.splice(playerHand.indexOf(card), 1);
        if (playerHand.length === 0) {
            isGameOver = true;
        }
        checkSpecialCard(card);
        currentPlayerIndex = (currentPlayerIndex + direction + 4) % 4;
        renderGame();
        if (currentPlayerIndex !== 0) {
            setTimeout(cpuTurn, 1000);
        }
    }
}

function checkSpecialCard(card) {
    if (card.value === 'Skip') {
        currentPlayerIndex = (currentPlayerIndex + direction + 4) % 4;
    } else if (card.value === 'Reverse') {
        direction *= -1;
    } else if (card.value === '+2') {
        let nextPlayerIndex = (currentPlayerIndex + direction + 4) % 4;
        for (let i = 0; i < 2; i++) {
            if (nextPlayerIndex === 0) {
                playerHand.push(drawCard(deck));
            } else {
                cpuHands[nextPlayerIndex - 1].push(drawCard(deck));
            }
        }
    } else if (card.value === 'Wild' || card.value === 'Wild+4') {
        setWildColor(card);
        if (card.value === 'Wild+4') {
            let nextPlayerIndex = (currentPlayerIndex + direction + 4) % 4;
            for (let i = 0; i < 4; i++) {
                if (nextPlayerIndex === 0) {
                    playerHand.push(drawCard(deck));
                } else {
                    cpuHands[nextPlayerIndex - 1].push(drawCard(deck));
                }
            }
        }
    }
}

function setWildColor(card) {
    if (currentPlayerIndex === 0) {
        const colors = ['red', 'green', 'blue', 'yellow'];
        const chosenColor = prompt('Choose a color (red, green, blue, yellow):').toLowerCase();
        if (colors.includes(chosenColor)) {
            card.color = chosenColor;
        } else {
            setWildColor(card);
        }
    } else {
        const colors = ['red', 'green', 'blue', 'yellow'];
        card.color = colors[Math.floor(Math.random() * colors.length)];
    }
}

function cpuTurn() {
    let cpuHand = cpuHands[currentPlayerIndex - 1];
    const topCard = discardPile[discardPile.length - 1];
    let playableCard = cpuHand.find(card => card.color === topCard.color || card.value === topCard.value || card.color === 'wild');
    if (playableCard) {
        discardPile.push(playableCard);
        cpuHand.splice(cpuHand.indexOf(playableCard), 1);
        if (cpuHand.length === 0) {
            isGameOver = true;
        }
        checkSpecialCard(playableCard);
    } else {
        cpuHand.push(drawCard(deck));
    }
    currentPlayerIndex = (currentPlayerIndex + direction + 4) % 4;
    renderGame();
    if (currentPlayerIndex !== 0) {
        setTimeout(cpuTurn, 1000);
    }
}

function calculateScores() {
    const playerScores = [
        { name: 'You', hand: playerHand },
        { name: 'CPU 1', hand: cpuHands[0] },
        { name: 'CPU 2', hand: cpuHands[1] },
        { name: 'CPU 3', hand: cpuHands[2] }
    ];
    playerScores.forEach(player => {
        player.score = player.hand.reduce((acc, card) => {
            if (parseInt(card.value)) {
                return acc + parseInt(card.value);
            } else if (card.value === 'Skip' || card.value === 'Reverse' || card.value === '+2') {
                return acc + 20;
            } else {
                return acc + 50;
            }
        }, 0);
    });
    const winner = playerScores.find(player => player.hand.length === 0);
    document.getElementById('message').textContent = `${winner.name} wins this round! Scores: ${playerScores.map(player => `${player.name}: ${player.score} points`).join(', ')}`;
}

document.getElementById('draw-button').addEventListener('click', () => {
    if (!isGameOver && currentPlayerIndex === 0) {
        playerHand.push(drawCard(deck));
        currentPlayerIndex = (currentPlayerIndex + direction + 4) % 4;
        renderGame();
        if (currentPlayerIndex !== 0) {
            setTimeout(cpuTurn, 1000);
        }
    }
});

document.addEventListener('DOMContentLoaded', startGame);
