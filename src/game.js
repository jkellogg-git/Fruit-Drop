// -----------------------------------------------------------------------------
// Fruit Drop Game
// A simple browser game where the player moves a basket to catch falling fruits.
// Features include a timer, score tracking, sound effects, and responsive canvas.
// Author: Jordan Kellogg
// -----------------------------------------------------------------------------


let canvas = document.querySelector('#gameCanvas');
let ctx = canvas.getContext('2d');
canvas.width = 1024;
canvas.height = 800;

let START = 1;
let PLAYING = 2;
let END = 3;
let gameState = START;
let isGameRunning;

let endScore = document.querySelector("#scoreSpan");
endDisplay = document.querySelector("#endOverlay");
endDisplay.style.display = 'none';
startDisplay = document.querySelector("#startOverlay");

let bg_music = document.querySelector("#background-music");
bg_music.volume = 0.25;
bg_music.loop = true;
let pickup = document.querySelector("#pickup");
pickup.volume = 0.25;


let timer = 30; 
let timerInterval;
let fruitInterval;
let tick = 0;


bg_music.addEventListener('canplaythrough', soundhandler, false);
pickup.addEventListener('canplaythrough', soundhandler, false);

function soundhandler() {
    bg_music.removeEventListener('canplaythrough', soundhandler, false);
    pickup.removeEventListener('canplaythrough', soundhandler, false);
}

let spriteObject = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    dx: 5,
    img: new Image()
};

let basket = Object.create(spriteObject);
basket.img.src = '../sprites/basket-image.png';
basket.img.onload = function() {
    console.log('image loaded');
    basket.width = 120;
    basket.height = 120;
    basket.x = canvas.width / 2 - basket.width / 2;
    basket.y = canvas.height - basket.height;
};

let fruitImages = [];
for (let i = 1; i <= 16; i++) {
    let img = new Image();
    img.src = `../sprites/fruits/${i}.png`;
    fruitImages.push(img);
}

let fruits = [];
let score = 0;

function drawBasket() {
    ctx.drawImage(basket.img, basket.x, basket.y, basket.width, basket.height);
}

function drawFruits() {
    for (let i = 0; i < fruits.length; i++) {
        let fruit = fruits[i];
        ctx.drawImage(fruit.img, fruit.x, fruit.y, 40, 40);
    }
}

function moveBasket() {
    if (rightPressed && basket.x < canvas.width - basket.width) {
        basket.x += basket.dx;
    } else if (leftPressed && basket.x > 0) {
        basket.x -= basket.dx;
    }
}

function updateFruits() {
    for (let i = fruits.length - 1; i >= 0; i--) {
        let fruit = fruits[i];
        fruit.y += fruit.dy;

        if (fruit.y + fruit.height > canvas.height) {
            fruits.splice(i, 1);
        } else if (fruit.y + fruit.height > basket.y && fruit.x > basket.x && fruit.x < basket.x + basket.width) {
            score++;
            fruits.splice(i, 1);
            pickup.currentTime = 0;
            pickup.play();
        }
    }
}

function addFruit() {
    let img = fruitImages[Math.floor(Math.random() * fruitImages.length)];
    let x = Math.random() * (canvas.width - img.width);
    let y = -img.height;
    let dy = 2;
    fruits.push({ x, y, width: img.width, height: img.height, dy, img });
    tick++;
}

function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 8, 20);
}

function drawTime() {
    ctx.font = '16px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Time: ' + timer, 8, 40);
}

function updateTimer() {
    if (timer > 0) {
        timer--;
        console.log("Time left: " + timer);
        if (timer === 0) {
            clearInterval(timerInterval);
            gameState = END;
        }
    }
}


let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', function(event) {
    switch(event.code){
        case 'ArrowRight':
            rightPressed = true;
            break;
        case 'ArrowLeft':
            leftPressed = true;
    } 
});

document.addEventListener('keyup', function(event) {
    switch(event.code){
        case 'ArrowRight':
            rightPressed = false;
            break;
        case 'ArrowLeft':
            leftPressed = false;
    } 
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBasket();
    drawFruits();
    drawScore();
    drawTime();
    moveBasket();
    updateFruits();
}

function endGame() {
    clearInterval(timerInterval);
    timer = 0;
    isGameRunning = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    drawTime();
    drawScore();
    console.log("END GAME STARTING");
    document.querySelector("#endOverlay").style.display = 'block';
    startOverlay.style.display = 'none';
    endScore.innerHTML = score;
}


function playAgain() {
    score = 0;
    tick = 0;
    fruits = [];
    timer = 30; 
}

document.querySelector("#restartButton").addEventListener('click', function() {
    document.querySelector("#endOverlay").style.display = 'none';
    document.querySelector("#startOverlay").style.display = 'flex';
    clearInterval(fruitInterval);
    playAgain();
});


document.getElementById('startButton').addEventListener('click', function() {
    document.querySelector('#startOverlay').style.display = 'none';
    start();
});

function start() {
    timer = 30;
    tick = 0;
    score = 0;
    fruits = [];
    if (fruitInterval) clearInterval(fruitInterval);
    if (timerInterval) clearInterval(timerInterval);
    fruitInterval = setInterval(addFruit, 1000);
    timerInterval = setInterval(updateTimer, 1000);
    gameState = PLAYING;
    bg_music.play();
    isGameRunning = true;
    update();
}

function update() {
    console.log(gameState);

    if (isGameRunning) {
        requestAnimationFrame(update);
    }
    
    switch (gameState) {
        case START:
            start();
            break;
        case PLAYING:
            gameLoop();
            break;
        case END:
            endGame();
            break;
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    basket.x = canvas.width / 2 - basket.width / 2;
    basket.y = canvas.height - basket.height;
}

// Set initial size
resizeCanvas();

// Update canvas size on window resize
window.addEventListener('resize', resizeCanvas);
