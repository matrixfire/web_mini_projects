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
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.img = new Image();
    this.img.src = imgUrl || '';
    this.velocityX = 0;
    this.velocityY = 0;
    this.angle = 0;
    this.flipV = false;
    this.flipH = false;
    this.visible = true;
  }

  boundingBox() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height,
    };
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate((this.angle * Math.PI) / 180);
    if (this.flipV) ctx.scale(1, -1);
    if (this.flipH) ctx.scale(-1, 1);
    if (this.visible) {
      ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
    }
    this.x += this.velocityX;
    this.y += this.velocityY;
    ctx.restore();
  }
}

// Class for the bird entity
class Bird extends Entity {
  constructor(imgUrl) {
    super(myCanvas.width / 3, myCanvas.height / 2, 50, 50, imgUrl);
  }

  jump() {
    this.velocityY = -10;
  }

  applyGravity() {
    if (this.velocityY < 10) {
      this.velocityY += 1;
    }
  }

  tilt() {
    if (this.velocityY < 0) {
      this.angle = -15;
    } else if (this.angle < 70) {
      this.angle += 4;
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
  }

  incrementScore() {
    this.score++;
  }

  reset() {
    this.lives = 3;
    this.score = 0;
  }
}

// Main game class
class Game {
  constructor() {
    this.gameView = new GameView();
    this.bird = new Bird("https://cdn.shopify.com/s/files/1/0632/2939/5192/files/wwwr.png");
    this.pipes = [];
    this.stats = new GameStats();
    this.gameOver = false;
    this.gameMode = 'prestart';
    this.lastGameTime = null;
    this.collisionPause = false;
    this.init();
  }

  init() {
    document.getElementById('dragon').addEventListener('click', () => this.selectCharacter('dragon'));
    document.getElementById('horse').addEventListener('click', () => this.selectCharacter('horse'));
    ['touchstart', 'mousedown', 'keydown'].forEach(eventType => {
      addEventListener(eventType, event => this.handleInput(event));
    });
    setInterval(() => this.addPipe(), 2000);
  }

  selectCharacter(character) {
    const imgUrl = character === 'dragon' ? "https://cdn.shopify.com/s/files/1/0632/2939/5192/files/test2.png" : "https://cdn.shopify.com/s/files/1/0632/2939/5192/files/wwwr.png";
    this.bird.img.src = imgUrl;
    this.startGame();
  }

  startGame() {
    if (this.bird) {
      this.gameMode = 'running';
      this.loop();
    } else {
      alert('Please select a character to start the game!');
    }
  }

  handleInput(event) {
    if (this.collisionPause) return;

    switch (this.gameMode) {
      case 'prestart':
        this.gameMode = 'waiting';
        setTimeout(() => this.gameMode = 'running', 3000);
        break;
      case 'running':
        this.bird.jump();
        break;
      case 'over':
        if (new Date() - this.lastGameTime > 1000) {
          this.resetGame();
          this.gameMode = 'prestart';
        }
        break;
    }
    event.preventDefault();
  }

  addPipe() {
    if (this.gameMode !== 'running') return;
    const gapHeight = 150;
    const gapPosition = Math.random() * (myCanvas.height - gapHeight);
    this.pipes.push(new Pipe(myCanvas.width, gapPosition - 300, 50, 300, 'http://s2js.com/img/etc/flappypipe.png'));
    this.pipes.push(new Pipe(myCanvas.width, gapPosition + gapHeight, 50, 300, 'http://s2js.com/img/etc/flappypipe.png', true));
  }

  handleCollisions() {
    this.pipes.forEach(pipe => {
      if (this.isColliding(this.bird, pipe)) {
        this.stats.decrementLives();
        if (this.stats.lives > 0) {
          this.collisionPause = true;
          setTimeout(() => {
            this.collisionPause = false;
            this.bird.y = myCanvas.height / 2;
          }, 500);
        } else {
          this.gameMode = 'over';
          this.lastGameTime = new Date();
        }
      }
    });

    if (this.bird.y >= myCanvas.height - this.bird.height || this.bird.y <= 0) {
      this.stats.decrementLives();
      if (this.stats.lives > 0) {
        this.collisionPause = true;
        setTimeout(() => {
          this.collisionPause = false;
          this.bird.y = myCanvas.height / 2;
        }, 500);
      } else {
        this.gameMode = 'over';
        this.lastGameTime = new Date();
      }
    }
  }

  isColliding(entity1, entity2) {
    const box1 = entity1.boundingBox();
    const box2 = entity2.boundingBox();
    return !(box1.right < box2.left || box1.left > box2.right || box1.bottom < box2.top || box1.top > box2.bottom);
  }

  update() {
    if (this.gameMode === 'running') {
      this.bird.applyGravity();
      this.bird.tilt();
      this.pipes.forEach(pipe => pipe.x += pipe.velocityX);
      this.pipes = this.pipes.filter(pipe => pipe.x + pipe.width > 0);
    }
  }

  draw() {
    this.gameView.draw(this.bird, ...this.pipes);
    this.gameView.drawLives(this.stats.lives);
    if (this.gameMode === 'prestart') {
      this.gameView.drawText('Press, touch or click to start', myCanvas.width / 2, myCanvas.height / 4);
    } else if (this.gameMode === 'over') {
      this.gameView.drawText('Game Over', myCanvas.width / 2, myCanvas.height / 2);
      this.gameView.drawText(`Score: ${this.stats.score}`, myCanvas.width / 2, myCanvas.height / 2 + 50);
    }
  }

  loop() {
    if (this.collisionPause) return;
    this.update();
    this.draw();
    this.handleCollisions();
    if (this.gameMode !== 'over') {
      requestAnimationFrame(() => this.loop());
    }
  }

  resetGame() {
    this.bird.y = myCanvas.height / 2;
    this.bird.velocityY = 0;
    this.pipes = [];
    this.stats.reset();
  }
}

// Create a new game instance and start the game loop
const game = new Game();
game.loop();
