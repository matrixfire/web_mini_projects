// Class to handle the game view and rendering
class GameView {
  constructor() {
    const canvas = document.querySelector("#myCanvas"); // Select the canvas element
    this.ctx = canvas.getContext("2d"); // Get the 2D drawing context
    this.width = canvas.width; // Canvas width
    this.height = canvas.height; // Canvas height
  }

  draw(...entities) {
    this.ctx.clearRect(0, 0, this.width, this.height); // Clear the canvas
    entities.forEach(entity => entity.draw(this.ctx)); // Draw each entity
  }

  drawText(text, x, y, size = "30px", color = "red", align = "center") {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size} Arial`;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }

  drawLives(lives) {
    const heartImg = new Image();
    heartImg.src = "https://cdn-icons-png.flaticon.com/512/833/833472.png";
    for (let i = 0; i < lives; i++) {
      this.ctx.drawImage(heartImg, 10 + i * 30, 10, 20, 20); // Draw heart images for lives
    }
  }
}

// Base class for game entities
class Entity {
  constructor(x, y, width, height, imgUrl) {
    this.x = x; // Initial x-coordinate of the entity
    this.y = y; // Initial y-coordinate of the entity
    this.width = width; // Width of the entity
    this.height = height; // Height of the entity
    this.img = new Image(); // Create a new image object
    this.img.src = imgUrl || ''; // Set the image source to the provided URL or an empty string if not provided
    this.velocityX = 0; // Initial horizontal velocity of the entity
    this.velocityY = 0; // Initial vertical velocity of the entity
    this.angle = 0; // Rotation angle of the entity in degrees
    this.flipV = false; // Vertical flip flag
    this.flipH = false; // Horizontal flip flag
    this.visible = true; // Visibility flag
  }

  // Method to get the bounding box of the entity
  boundingBox() {
    return {
      left: this.x, // Left boundary
      right: this.x + this.width, // Right boundary
      top: this.y, // Top boundary
      bottom: this.y + this.height, // Bottom boundary
    };
  }

  // Method to draw the entity on the canvas
  draw(ctx) {
    ctx.save(); // Save the current state of the canvas
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2); // Move the canvas origin to the center of the entity
    ctx.rotate((this.angle * Math.PI) / 180); // Rotate the canvas by the entity's angle in radians
    if (this.flipV) ctx.scale(1, -1); // Flip vertically if flipV is true
    if (this.flipH) ctx.scale(-1, 1); // Flip horizontally if flipH is true
    if (this.visible) {
      ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height); // Draw the entity image centered at the new origin
    }
    this.x += this.velocityX; // Update the x-coordinate by adding the horizontal velocity
    this.y += this.velocityY; // Update the y-coordinate by adding the vertical velocity
    ctx.restore(); // Restore the canvas to its previous state
  }
}

// Class for the bird entity
class Bird extends Entity {
  constructor(imgUrl) {
    // Initialize the bird entity at a specific position with given dimensions and image URL
    super(myCanvas.width / 3, myCanvas.height / 2, 50, 50, imgUrl);
  }

  // Method to make the bird jump
  jump() {
    this.velocityY = -10; // Set the vertical velocity to a negative value to make the bird jump
  }

  // Method to apply gravity to the bird
  applyGravity() {
    if (this.velocityY < 10) {
      this.velocityY += 1; // Increase the vertical velocity to simulate gravity
    }
  }

  // Method to adjust the tilt of the bird based on its velocity
  tilt() {
    if (this.velocityY < 0) {
      this.angle = -15; // Tilt the bird upwards if it's moving up
    } else if (this.angle < 70) {
      this.angle += 4; // Tilt the bird downwards gradually if it's falling
    }
  }
}

// Class for pipe entities
class Pipe extends Entity {
  constructor(x, y, width, height, imgUrl) {
    super(x, y, width, height, imgUrl);
    this.velocityX = -2;
  }
}

// Class to handle game scores and lives
class GameStats {
  constructor() {
    this.lives = 3;
    this.score = 0;
  }

  decrementLives() {
    this.lives--;
    console.log(`Lives remaining: ${this.lives}`);
  }

  incrementScore() {
    this.score++;
    console.log(`Score: ${this.score}`);
  }

  reset() {
    this.lives = 3;
    this.score = 0;
    console.log("Game stats reset");
  }
}

// Main game class
class Game {
  constructor() {
    this.gameView = new GameView(); // Initialize the game view
    this.bird = new Bird("https://cdn.shopify.com/s/files/1/0632/2939/5192/files/wwwr.png"); // Create a bird instance
    this.pipes = []; // Array to store pipe instances
    this.stats = new GameStats(); // Initialize game stats
    this.gameOver = false; // Flag to indicate if the game is over
    this.gameMode = 'prestart'; // Initial game mode
    this.lastGameTime = null; // Timestamp of the last game update
    this.collisionPause = false; // Flag to pause the game after a collision
    this.init(); // Initialize event listeners and game setup
  }

  // Initialize event listeners and game setup
  init() {
    document.getElementById('dragon').addEventListener('click', () => this.selectCharacter('dragon'));
    document.getElementById('horse').addEventListener('click', () => this.selectCharacter('horse'));
    ['touchstart', 'mousedown', 'keydown'].forEach(eventType => {
      addEventListener(eventType, event => this.handleInput(event));
    });
    this.addPipeInterval(); // Start adding pipes at regular intervals
  }

  // Select a character and start the game
  selectCharacter(character) {
    const imgUrl = character === 'dragon' ? "https://cdn.shopify.com/s/files/1/0632/2939/5192/files/test2.png" : "https://cdn.shopify.com/s/files/1/0632/2939/5192/files/wwwr.png";
    this.bird.img.src = imgUrl; // Update bird image
    console.log(`Character selected: ${character}`);
    this.startGame();
  }

  // Start the game
  startGame() {
    if (this.bird) {
      this.gameMode = 'running';
      console.log("Game started");
      this.loop();
    } else {
      alert('Please select a character to start the game!');
    }
  }

  // Handle player input
  handleInput(event) {
    if (this.collisionPause) return;

    switch (this.gameMode) {
      case 'prestart':
        this.gameMode = 'waiting';
        console.log("Game mode: waiting");
        setTimeout(() => {
          this.gameMode = 'running';
          console.log("Game mode: running");
        }, 3000); // Wait for 3 seconds before starting the game
        break;
      case 'running':
        this.bird.jump(); // Make the bird jump
        console.log("Bird jumped");
        break;
      case 'over':
        if (new Date() - this.lastGameTime > 1000) {
          this.resetGame(); // Reset the game state
          this.gameMode = 'prestart'; // Set the game mode to 'prestart'
          console.log("Game reset");
        }
        break;
    }
    event.preventDefault();
  }

  // Add a pair of pipes (top and bottom) to the game
  addPipe() {
    if (this.gameMode !== 'running') return;
    const gapHeight = 150; // Gap height between the pipes
    const gapPosition = Math.random() * (myCanvas.height - gapHeight); // Random position for the gap
    this.pipes.push(new Pipe(myCanvas.width, gapPosition - 300, 50, 300, 'http://s2js.com/img/etc/flappypipe.png')); // Top pipe
    this.pipes.push(new Pipe(myCanvas.width, gapPosition + gapHeight, 50, 300, 'http://s2js.com/img/etc/flappypipe.png', true)); // Bottom pipe
    console.log("Pipes added");
  }

  // Interval function to add pipes regularly
  addPipeInterval() {
    if (this.gameMode === 'running') {
      this.addPipe();
      setTimeout(() => this.addPipeInterval(), 2000); // Call the function again after 2 seconds
    }
  }

  // Handle collisions between the bird and pipes
  handleCollisions() {
    this.pipes.forEach(pipe => {
      if (this.isColliding(this.bird, pipe)) {
        console.log("Collision detected with pipe");
        this.stats.decrementLives();
        if (this.stats.lives > 0) {
          this.collisionPause = true;
          setTimeout(() => {
            this.collisionPause = false;
            this.reviveCharacter();
          }, 500); // Pause for 0.5 seconds before reviving
        } else {
          this.gameMode = 'over';
          this.lastGameTime = new Date();
          console.log("Game over");
        }
      }
    });

    // Check for collisions with the top or bottom of the canvas
    if (this.bird.y >= myCanvas.height - this.bird.height || this.bird.y <= 0) {
      console.log("Collision detected with top/bottom");
      this.stats.decrementLives();
      if (this.stats.lives > 0) {
        this.collisionPause = true;
        setTimeout(() => {
          this.collisionPause = false;
          this.reviveCharacter();
        }, 500); // Pause for 0.5 seconds before reviving
      } else {
        this.gameMode = 'over';
        this.lastGameTime = new Date();
        console.log("Game over");
      }
    }
  }

  // Revive the character after a collision
  reviveCharacter() {
    console.log("Reviving character");
    this.bird.y = myCanvas.height / 2; // Reset bird position to the middle of the canvas
    this.bird.velocityY = 0; // Reset bird velocity

    // Reset pipes to their initial positions
    this.pipes = []; // Clear current pipes
    this.addInitialPipes(); // Add initial pipes
  }

  // Add initial pipes to the game
  addInitialPipes() {
    console.log("Adding initial pipes");
    const pipePositions = [
      { x: 500, gap: 100, width: 140 },
      { x: 800, gap: 50, width: 140 },
      { x: 1000, gap: 250, width: 140 },
      { x: 1200, gap: 150, width: 120 },
      { x: 1600, gap: 100, width: 120 },
      { x: 1800, gap: 150, width: 120 },
      { x: 2000, gap: 200, width: 120 },
      { x: 2200, gap: 250, width: 120 },
      { x: 2400, gap: 30, width: 100 },
      { x: 2700, gap: 300, width: 100 },
      { x: 3000, gap: 100, width: 80 },
      { x: 3300, gap: 250, width: 80 },
      { x: 3600, gap: 50, width: 60 },
    ];

    pipePositions.forEach(pos => {
      this.addPipeAtPosition(pos.x, pos.gap, pos.width);
    });

    const finishLine = new Pipe(3900, 0, 50, myCanvas.height, 'http://s2js.com/img/etc/flappyend.png');
    finishLine.velocityX = -2;
    this.pipes.push(finishLine);
  }

  // Add a pair of pipes at a specific position
  addPipeAtPosition(x, gap, width) {
    this.pipes.push(new Pipe(x, gap - 300, 50, 300, 'http://s2js.com/img/etc/flappypipe.png')); // Top pipe
    this.pipes.push(new Pipe(x, gap + 150, 50, 300, 'http://s2js.com/img/etc/flappypipe.png', true)); // Bottom pipe
    console.log(`Pipes added at position ${x}, ${gap}`);
  }

  // Check if two entities are colliding
  isColliding(entity1, entity2) {
    const box1 = entity1.boundingBox();
    const box2 = entity2.boundingBox();
    return !(box1.right < box2.left || box1.left > box2.right || box1.bottom < box2.top || box1.top > box2.bottom);
  }

  // Update the game state
  update() {
    if (this.gameMode === 'running') {
      this.bird.applyGravity(); // Apply gravity to the bird
      this.bird.tilt(); // Tilt the bird based on its velocity
      this.pipes.forEach(pipe => pipe.x += pipe.velocityX); // Move pipes
      this.pipes = this.pipes.filter(pipe => pipe.x + pipe.width > 0); // Remove off-screen pipes
      console.log("Game state updated");
    }
  }

  // Draw the game entities and UI elements
  draw() {
    this.gameView.draw(this.bird, ...this.pipes); // Draw bird and pipes
    this.gameView.drawLives(this.stats.lives); // Draw remaining lives
    if (this.gameMode === 'prestart') {
      this.gameView.drawText('Press, touch or click to start', myCanvas.width / 2, myCanvas.height / 4);
    } else if (this.gameMode === 'over') {
      this.gameView.drawText('Game Over', myCanvas.width / 2, myCanvas.height / 2);
      this.gameView.drawText(`Score: ${this.stats.score}`, myCanvas.width / 2, myCanvas.height / 2 + 50);
    }
  }

  // Main game loop
  loop() {
    if (this.collisionPause) return;
    this.update(); // Update game state
    this.draw(); // Draw game entities and UI
    console.log("Game loop running");
    this.handleCollisions(); // Handle collisions
    if (this.gameMode !== 'over') {
      requestAnimationFrame(() => this.loop()); // Continue the game loop
    }
  }

  // Reset the game to its initial state
  resetGame() {
    this.bird.y = myCanvas.height / 2;
    this.bird.velocityY = 0;
    this.pipes = [];
    this.stats.reset();
    this.addInitialPipes(); // Add initial pipes when resetting the game
  }
}

// Create a new game instance and start the game loop
const game = new Game();
game.loop();
