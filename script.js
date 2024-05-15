const ctx = myCanvas.getContext('2d'); // Get the 2D context from the canvas
const FPS = 40; // Frames per second
const jumpAmount = -10; // Amount of upward velocity when the bird jumps
const maxFallSpeed = 10; // Maximum downward velocity
const acceleration = 1; // Gravity acceleration
const pipeSpeed = -2; // Speed of the pipes moving left
let gameMode = 'prestart'; // Game state: 'prestart', 'running', 'over'
let lastGameTime; // Last time the game was running
let bottomBarOffset = 0; // Offset for the moving bottom bar
let pipes = []; // Array to hold the pipes

class MySprite {
  constructor(imgUrl) {
    this.x = 0;
    this.y = 0;
    this.visible = true;
    this.velocityX = 0;
    this.velocityY = 0;
    this.img = new Image();
    this.img.src = imgUrl || '';
    this.angle = 0;
    this.flipV = false;
    this.flipH = false;
  }

  // Draw and update the sprite
  doFrameThings() {
    ctx.save();
    ctx.translate(this.x + this.img.width / 2, this.y + this.img.height / 2);
    ctx.rotate((this.angle * Math.PI) / 180);
    if (this.flipV) ctx.scale(1, -1);
    if (this.flipH) ctx.scale(-1, 1);
    if (this.visible) {
      ctx.drawImage(this.img, -this.img.width / 2, -this.img.height / 2);
    }
    this.x += this.velocityX;
    this.y += this.velocityY;
    ctx.restore();
  }
}

// Check if two sprites are touching
const imagesTouching = (thing1, thing2) => {
  if (!thing1.visible || !thing2.visible) return false;
  if (
    thing1.x >= thing2.x + thing2.img.width ||
    thing1.x + thing1.img.width <= thing2.x
  ) return false;
  if (
    thing1.y >= thing2.y + thing2.img.height ||
    thing1.y + thing1.img.height <= thing2.y
  ) return false;
  return true;
}

// Handle player input
const gotPlayerInput = (event) => {
  switch (gameMode) {
    case 'prestart':
      gameMode = 'running';
      break;
    case 'running':
      bird.velocityY = jumpAmount;
      break;
    case 'over':
      if (new Date() - lastGameTime > 1000) {
        resetGame();
        gameMode = 'running';
      }
      break;
  }
  event.preventDefault();
}

// Add event listeners for player input
['touchstart', 'mousedown', 'keydown'].forEach(eventType => {
  addEventListener(eventType, gotPlayerInput);
});

// Apply gravity to the bird and check for collisions with the top and bottom
const makeBirdSlowAndFall = () => {
  if (bird.velocityY < maxFallSpeed) {
    bird.velocityY += acceleration;
  }
  if (bird.y > myCanvas.height - bird.img.height || bird.y < 0 - bird.img.height) {
    bird.velocityY = 0;
    gameMode = 'over';
  }
}

// Add a pair of pipes (top and bottom) to the game
const addPipe = (xPos, topOfGap, gapWidth) => {
  const topPipe = new MySprite(pipePiece.src);
  topPipe.x = xPos;
  topPipe.y = topOfGap - pipePiece.height;
  topPipe.velocityX = pipeSpeed;
  pipes.push(topPipe);

  const bottomPipe = new MySprite(pipePiece.src);
  bottomPipe.flipV = true;
  bottomPipe.x = xPos;
  bottomPipe.y = topOfGap + gapWidth;
  bottomPipe.velocityX = pipeSpeed;
  pipes.push(bottomPipe);
}

// Adjust the bird's angle based on its velocity
const makeBirdTiltAppropriately = () => {
  if (bird.velocityY < 0) {
    bird.angle = -15;
  } else if (bird.angle < 70) {
    bird.angle += 4;
  }
}

// Draw all the pipes
const showThePipes = () => {
  pipes.forEach(pipe => pipe.doFrameThings());
}

// Check for collisions between the bird and any pipes
const checkForEndGame = () => {
  pipes.forEach(pipe => {
    if (imagesTouching(bird, pipe)) gameMode = 'over';
  });
}

// Display the intro instructions
const displayIntroInstructions = () => {
  ctx.font = '25px Arial';
  ctx.fillStyle = 'red';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Press, touch or click to start',
    myCanvas.width / 2,
    myCanvas.height / 4
  );
}

// Display the game over screen and score
const displayGameOver = () => {
  let score = 0;
  pipes.forEach(pipe => {
    if (pipe.x < bird.x) score += 0.5;
  });
  ctx.font = '30px Arial';
  ctx.fillStyle = 'red';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', myCanvas.width / 2, 100);
  ctx.fillText(`Score: ${score}`, myCanvas.width / 2, 150);
  ctx.font = '20px Arial';
  ctx.fillText('Click, touch, or press to play again', myCanvas.width / 2, 300);
}

// Display the moving bar at the bottom
const displayBarRunningAlongBottom = () => {
  if (bottomBarOffset < -23) bottomBarOffset = 0;
  ctx.drawImage(
    bottomBar,
    bottomBarOffset,
    myCanvas.height - bottomBar.height
  );
}

// Reset the game to its initial state
const resetGame = () => {
  bird.y = myCanvas.height / 2;
  bird.angle = 0;
  pipes = []; // Erase all the pipes from the array
  addAllMyPipes(); // Reload them in their starting positions
}

// Add all pipes to the game
const addAllMyPipes = () => {
  addPipe(500, 100, 140);
  addPipe(800, 50, 140);
  addPipe(1000, 250, 140);
  addPipe(1200, 150, 120);
  addPipe(1600, 100, 120);
  addPipe(1800, 150, 120);
  addPipe(2000, 200, 120);
  addPipe(2200, 250, 120);
  addPipe(2400, 30, 100);
  addPipe(2700, 300, 100);
  addPipe(3000, 100, 80);
  addPipe(3300, 250, 80);
  addPipe(3600, 50, 60);
  const finishLine = new MySprite('http://s2js.com/img/etc/flappyend.png');
  finishLine.x = 3900;
  finishLine.velocityX = pipeSpeed;
  pipes.push(finishLine);
}

const pipePiece = new Image();
pipePiece.onload = addAllMyPipes;
pipePiece.src = 'http://s2js.com/img/etc/flappypipe.png';

// Main game loop
const doAFrame = () => {
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  bird.doFrameThings();
  displayBarRunningAlongBottom();
  switch (gameMode) {
    case 'prestart':
      displayIntroInstructions();
      break;
    case 'running':
      lastGameTime = new Date();
      bottomBarOffset += pipeSpeed;
      showThePipes();
      makeBirdTiltAppropriately();
      makeBirdSlowAndFall();
      checkForEndGame();
      break;
    case 'over':
      makeBirdSlowAndFall();
      displayGameOver();
      break;
  }
}

const bottomBar = new Image();
bottomBar.src = 'http://s2js.com/img/etc/flappybottom.png';

const bird = new MySprite('https://cdn.shopify.com/s/files/1/0632/2939/5192/files/test2.png');
bird.x = myCanvas.width / 3;
bird.y = myCanvas.height / 2;

setInterval(doAFrame, 1000 / FPS); // Start the game loop
