const myCanvas = document.getElementById('myCanvas');
const ctx = myCanvas.getContext('2d');

const FPS = 40;
const jumpAmount = -10;
const maxFallSpeed = 10;
const acceleration = 1;
const pipeSpeed = -2;
let gameMode = 'prestart';
let lastGameTime;
let bottomBarOffset = 0;
let pipes = [];
let selectedCharacter = null;
let lives = 3;
let collisionPause = false;

const dragonImgUrl = "https://cdn.shopify.com/s/files/1/0632/2939/5192/files/test2.png";
const horseImgUrl = "https://cdn.shopify.com/s/files/1/0632/2939/5192/files/wwwr.png";
const heartImgUrl = "https://cdn-icons-png.flaticon.com/512/833/833472.png";

const heartImg = new Image();
heartImg.src = heartImgUrl;

class MySprite {
  constructor(imgUrl) {
    this.x = 100;
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

// Function to start the game
function startGame() {
  if (selectedCharacter) {
    gameMode = 'running';
    setInterval(doAFrame, 1000 / FPS); // Start the game loop
  } else {
    alert('Please select a character to start the game!');
  }
}

// Event listeners for character selection
document.getElementById('dragon').addEventListener('click', () => {
  selectedCharacter = new MySprite(dragonImgUrl);
  bird.img.src = dragonImgUrl;
  startGame();
});

document.getElementById('horse').addEventListener('click', () => {
  selectedCharacter = new MySprite(horseImgUrl);
  bird.img.src = horseImgUrl;
  startGame();
});

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
  if (collisionPause) return;

  switch (gameMode) {
    case 'prestart':
      gameMode = 'running';
      break;
    case 'running':
      if (selectedCharacter) {
        selectedCharacter.velocityY = jumpAmount;
      }
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
  if (selectedCharacter.velocityY < maxFallSpeed) {
    selectedCharacter.velocityY += acceleration;
  }
  if (selectedCharacter.y > myCanvas.height - selectedCharacter.img.height || selectedCharacter.y < 0 - selectedCharacter.img.height) {
    handleCollision();
  }
}

// Handle collision and decrement lives
const handleCollision = () => {
  lives--;
  if (lives > 0) {
    collisionPause = true;
    setTimeout(() => {
      collisionPause = false;
      reviveCharacter();
    }, 500); // Pause for 0.5 seconds before reviving
  } else {
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
  if (selectedCharacter.velocityY < 0) {
    selectedCharacter.angle = -15;
  } else if (selectedCharacter.angle < 70) {
    selectedCharacter.angle += 4;
  }
}

// Draw all the pipes
const showThePipes = () => {
  pipes.forEach(pipe => pipe.doFrameThings());
}

// Check for collisions between the bird and any pipes
const checkForEndGame = () => {
  pipes.forEach(pipe => {
    if (imagesTouching(selectedCharacter, pipe)) {
      handleCollision();
    }
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
    if (pipe.x < selectedCharacter.x) score += 0.5;
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

// Display lives counter
const displayLivesCounter = () => {
  for (let i = 0; i < lives; i++) {
    ctx.drawImage(heartImg, 10 + i * 30, 10, 20, 20);
  }
}

// Revive the character in the middle of the most adjacent pipe
const reviveCharacter = () => {
  selectedCharacter.y = myCanvas.height / 2;
  selectedCharacter.angle = 0;

  // Find the nearest pipe and adjust their positions
  let nearestPipeIndex = 0;
  let minDistance = Infinity;

  pipes.forEach((pipe, index) => {
    const distance = Math.abs(pipe.x - selectedCharacter.x);
    if (distance < minDistance) {
      minDistance = distance;
      nearestPipeIndex = index;
    }
  });

  const nearestPipe = pipes[nearestPipeIndex];
  const offset = myCanvas.width / 3 - nearestPipe.x;

  pipes.forEach(pipe => {
    pipe.x += offset;
  });

  // Rewind pipes briefly to avoid immediate collision
  pipes.forEach(pipe => {
    pipe.x += pipeSpeed * 20; // Adjust this value to rewind pipes
  });

  setTimeout(() => {
    pipes.forEach(pipe => {
      pipe.x -= pipeSpeed * 20; // Restore pipe positions
    });
  }, 500); // Adjust the delay to match the rewind duration
}

// Reset the game to its initial state
const resetGame = () => {
  selectedCharacter.y = myCanvas.height / 2;
  selectedCharacter.angle = 0;
  pipes = []; // Erase all the pipes from the array
  addAllMyPipes(); // Reload them in their starting positions
  lives = 3; // Reset lives
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
  if (collisionPause) return;

  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  selectedCharacter?.doFrameThings();
  displayBarRunningAlongBottom();
  displayLivesCounter();
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

const bird = new MySprite(horseImgUrl); // Initialize with one character by default
bird.x = myCanvas.width / 3;
bird.y = myCanvas.height / 2;
