const myCanvas = document.getElementById('myCanvas'); // exists??


// Class to handle the game view and rendering
class GameView {
  constructor() {
    const canvas = document.querySelector("#myCanvas"); // Select the canvas element using its ID
    this.ctx = canvas.getContext("2d"); // Get the 2D drawing context of the canvas
    this.width = canvas.width; // Store the canvas width in the instance
    this.height = canvas.height; // Store the canvas height in the instance
  }

  draw(...entities) {
    // Clear the entire canvas to prepare for new drawings
    this.ctx.clearRect(0, 0, this.width, this.height); 
    // Iterate over all entities passed as arguments and call their draw method
    entities.forEach(entity => entity.draw(this.ctx)); 
  }

  drawText(text, x, y, size = "30px", color = "red", align = "center") {
    this.ctx.fillStyle = color; // Set the text color
    this.ctx.font = `${size} Arial`; // Set the font size and family
    this.ctx.textAlign = align; // Set the text alignment
    this.ctx.fillText(text, x, y); // Draw the text at the specified position
  }

  drawLives(lives) {
    const heartImg = new Image(); // Create a new image object
    heartImg.src = "https://cdn-icons-png.flaticon.com/512/833/833472.png"; // Set the source of the image (heart icon)
    for (let i = 0; i < lives; i++) {
      // Draw the heart image for each life, offsetting each by 30 pixels horizontally
      this.ctx.drawImage(heartImg, 10 + i * 30, 10, 20, 20); 
    }
  }

  drawGameOver() {
    this.ctx.fillStyle = "white";
    this.ctx.font = "30px monospace";
    this.ctx.textAlign = "center";
    this.ctx.fillText("GAME OVER", this.width / 2, this.height / 2); // Draw game over text
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
    // Bird will not move horizontally! only verticlly!
  }

  // Method to make the bird jump
  jump() {
    this.velocityY = -10;
    // Bird will not move horizontally! only verticlly!
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
    this.gameView = new GameView(); // Initialize the game view for rendering
    this.bird = new Bird("https://cdn.shopify.com/s/files/1/0632/2939/5192/files/wwwr.png"); // Create a bird instance with the default image
    this.pipes = []; // Array to store pipe instances
    this.stats = new GameStats(); // Initialize game stats (lives and score)
    this.gameOver = false; // Flag to indicate if the game is over
    this.gameMode = 'prestart'; // Initial game mode
    this.lastGameTime = null; // Timestamp of the last game update
    this.collisionPause = false; // Flag to pause the game after a collision
    this.init(); // Initialize event listeners and game setup
  }

  // Initialize event listeners and game setup
  init() {
    document.getElementById('dragon').addEventListener('click', () => this.selectCharacter('dragon')); // Event listener for dragon character selection
    document.getElementById('horse').addEventListener('click', () => this.selectCharacter('horse')); // Event listener for horse character selection
    ['touchstart', 'mousedown', 'keydown'].forEach(eventType => {
      addEventListener(eventType, event => this.handleInput(event)); // Event listeners for player input
    });
    setInterval(() => this.addPipe(), 2000); // Add pipes at regular intervals (every 2 seconds)
  }

  // Select a character and start the game
  selectCharacter(character) {
    const imgUrl = character === 'dragon' 
      ? "https://cdn.shopify.com/s/files/1/0632/2939/5192/files/test2.png" 
      : "https://cdn.shopify.com/s/files/1/0632/2939/5192/files/wwwr.png"; // Select character image URL based on the chosen character
    this.bird.img.src = imgUrl; // Update bird image
    this.startGame(); // Start the game
  }

  // Start the game
  startGame() {
    if (this.bird) {
      this.gameMode = 'running'; // Set game mode to 'running'
      this.loop(); // Start the game loop
    } else {
      alert('Please select a character to start the game!'); // Alert if no character is selected
    }
  }

  // Handle player input
  handleInput(event) {
    if (this.collisionPause) return; // Ignore input if the game is paused due to a collision

    switch (this.gameMode) {
      case 'prestart':
        this.gameMode = 'waiting'; // Set game mode to 'waiting'
        setTimeout(() => this.gameMode = 'running', 3000); // Wait for 3 seconds before starting the game
        break;
      case 'running':
        this.bird.jump(); // Make the bird jump
        break;
      case 'over':
        if (new Date() - this.lastGameTime > 1000) { // Check if enough time has passed since the game ended
          this.resetGame(); // Reset the game state
          this.gameMode = 'prestart'; // Set the game mode to 'prestart'
        }
        break;
    }
    event.preventDefault(); // Prevent the default action for the event (e.g., scrolling the page)
  }

  // Add a pair of pipes (top and bottom) to the game
  addPipe() {
    if (this.gameMode !== 'running') return; // Only add pipes if the game is running
    const gapHeight = 150; // Gap height between the pipes
    const gapPosition = Math.random() * (myCanvas.height - gapHeight); // Random position for the gap
    this.pipes.push(new Pipe(myCanvas.width, gapPosition - 300, 50, 300, 'http://s2js.com/img/etc/flappypipe.png')); // Top pipe
    this.pipes.push(new Pipe(myCanvas.width, gapPosition + gapHeight, 50, 300, 'http://s2js.com/img/etc/flappypipe.png', true)); // Bottom pipe
  }

  // // Check if two entities are colliding, instance method
  // isColliding(entity1, entity2) {
  //   const box1 = entity1.boundingBox();
  //   const box2 = entity2.boundingBox();
  //   return !(box1.right < box2.left || box1.left > box2.right || box1.bottom < box2.top || box1.top > box2.bottom); // Check if the bounding boxes overlap
  // }

  // Check if two entities are colliding
  static isColliding(entity1, entity2) {
    const box1 = entity1.boundingBox();
    const box2 = entity2.boundingBox();
    return !(box1.right < box2.left || box1.left > box2.right || box1.bottom < box2.top || box1.top > box2.bottom); // Check if the bounding boxes overlap
  }

  // Check if the bird hits the top or bottom of the canvas
  static hitsTopBottom(bird, canvasHeight) {
    return bird.y >= canvasHeight - bird.height || bird.y <= 0; // Check if the bird hits the top or bottom of the canvas
  }


// Handle collisions between the bird and pipes
checkCollision() {
  this.pipes.forEach(pipe => {
    if (Game.isColliding(this.bird, pipe)) {
      console.log("Hitting Pipes");
      this.stats.decrementLives(); // Decrement lives if a collision is detected
      if (this.stats.lives > 0) {
        this.collisionPause = true; // Pause the game after a collision
      } else {
        this.gameMode = 'over'; // Set game mode to 'over' if no lives are left
        this.lastGameTime = new Date(); // Record the time the game ended
      }
    }
  });

    if (Game.hitsTopBottom(this.bird, myCanvas.height)) {
      console.log("Hitting bottom or top");
      this.stats.decrementLives(); // Decrement lives if the bird hits the top or bottom of the canvas
      if (this.stats.lives > 0) {
        this.collisionPause = true; // Pause the game after a collision
      } else {
        this.gameMode = 'over'; // Set game mode to 'over' if no lives are left
        this.lastGameTime = new Date(); // Record the time the game ended
      }
    }
}


  // Draw the game entities and UI elements
  draw() {
    this.gameView.draw(this.bird, ...this.pipes); // Draw bird and pipes
    this.gameView.drawLives(this.stats.lives); // Draw remaining lives
    if (this.gameMode === 'prestart') {
      // this.gameView.drawText('Press, touch or click to start', myCanvas.width / 2, myCanvas.height / 4);
      // temp out
    } else if (this.gameMode === 'over') {
      // this.gameView.drawText('Game Over', myCanvas.width / 2, myCanvas.height / 2);
      // this.gameView.drawText(`Score: ${this.stats.score}`, myCanvas.width / 2, myCanvas.height / 2 + 50);
      // temp out
    }
  }

  // Update the game state
  update() {
    if (this.gameMode === 'running') {
      this.bird.applyGravity(); // Apply gravity to the bird
      this.bird.tilt(); // Tilt the bird based on its velocity
      this.pipes.forEach(pipe => pipe.x += pipe.velocityX); // Move pipes
      this.pipes = this.pipes.filter(pipe => pipe.x + pipe.width > 0); // Remove off-screen pipes
    }
  }

  // Main game loop
  loop() {
    if (this.collisionPause) return; // Pause the game loop if a collision has occurred
    this.update(); // Update game state
    this.draw(); // Draw game entities and UI
    this.checkCollision(); // check collisions
    if (this.gameMode !== 'over') {
      // requestAnimationFrame(() => this.loop());
      if (this.collisionPause === true) {
        console.log(`Collision: ${this.collisionPause}!`)
        this.collisionPause = false;

        // .............................................................................................................................................................


          console.log(`pipes ${this.pipes.length}`);
          while (this.pipes.length > 0) {
            this.pipes.pop();
          }
          console.log(`Now pipes ${this.pipes.length}`);

          this.bird.y = myCanvas.height / 2; // Reset bird position

      }
      setTimeout(() => this.loop(), 1000 / 40); // Continue the game loop at 40 FPS
    } else {
      this.draw(); // Draw game entities and UI one last time
      this.gameView.drawGameOver(); // Display game over message
    }
  }

  // Reset the game to its initial state
  resetGame() {
    this.bird.y = myCanvas.height / 2; // Reset bird position
    this.bird.velocityY = 0; // Reset bird velocity
    this.pipes = []; // Clear current pipes
    this.stats.reset(); // Reset game stats
  }
}


// Create a new game instance and start the game loop
const game = new Game();
game.loop();
