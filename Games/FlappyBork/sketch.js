let bird;
let pipes = [];
let score = 0;
let gameover = false;

function setup() {
  createCanvas(400, 600);
  bird = new Bird();
  pipes.push(new Pipe());
}

function draw() {
  background(0);
  
  if (!gameover) {
    bird.update();
    bird.show();

    if (frameCount % 75 == 0) {
      pipes.push(new Pipe());
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
      pipes[i].show();
      pipes[i].update();

      if (pipes[i].hits(bird)) {
        gameover = true;
      }

      if (pipes[i].offscreen()) {
        pipes.splice(i, 1);
        score++;
      }
    }

    textSize(32);
    fill(255);
    text("Score: " + score, 10, 30);
  } else {
    textSize(32);
    fill(255, 0, 0);
    text("Game Over!", 100, height / 2 - 20);
    text("Final Score: " + score, 100, height / 2 + 30);
    noLoop();
  }
}

function keyPressed() {
  if (key == ' ' && !gameover) {
    bird.up();
  } else if (gameover) {
    resetGame();
  }
}

// Add touch support
function touchStarted() {
  if (!gameover) {
    bird.up();
  } else {
    resetGame();
  }
  return false; // Prevent default behavior
}

function resetGame() {
  score = 0;
  pipes = [];
  bird = new Bird();
  pipes.push(new Pipe());
  gameover = false;
  loop();
}

class Bird {
  constructor() {
    this.y = height / 2;
    this.x = 64;

    this.gravity = 0.7;
    this.lift = -12;
    this.velocity = 0;
  }

  show() {
    fill(255);
    ellipse(this.x, this.y, 32, 32);
  }

  up() {
    this.velocity += this.lift;
  }

  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;

    if (this.y > height) {
      this.y = height;
      this.velocity = 0;
    }

    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }
  }
}

class Pipe {
  constructor() {
    this.top = random(height / 2);
    this.bottom = random(height / 2);
    this.x = width;
    this.w = 20;
    this.speed = 3;
  }

  hits(bird) {
    if (bird.y < this.top || bird.y > height - this.bottom) {
      if (bird.x > this.x && bird.x < this.x + this.w) {
        return true;
      }
    }
    return false;
  }

  show() {
    fill(255);
    rect(this.x, 0, this.w, this.top);
    rect(this.x, height - this.bottom, this.w, this.bottom);
  }

  update() {
    this.x -= this.speed;
  }

  offscreen() {
    return (this.x < -this.w);
  }
}
