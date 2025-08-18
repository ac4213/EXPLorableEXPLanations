// Performance monitoring
let frameRates = [];
const FPS_SAMPLE_SIZE = 60;
let lastFrameTime = 0;

// Define the initial position, velocity, and acceleration
let gamePaused = false;
let initialPosition; //initial position vector
let position; //current position vector
let finalPositions = []; //list of final position vectors
const MAX_FINAL_POSITIONS = 2; // Limit stored positions to prevent memory bloat
let velocity; //current velocity vector
let acceleration; //current acceleration vector
let scalefac = 10; //scale factor for physics

// Define the gravity and launch angle
let gravity; //gravity vector
let g = 9.81/scalefac; //gravity scaled by a factor
let angle; // Launch angle in degrees
let ballSize = 10; // projectile diameter in pixels

// Define the obstacles
let obstacles = [];
let numObstacles = 2;

// Define the target
let target;
let targetMinSize = 5;
let targetMaxSize = 30;

// Define GUI palette
let ballColor;
let obstacleColor;

// Define the state of the game
let isFired = false;
let isTouch = false;
let hasTouchScreen = false;
let fireButton;
let resetButton;

// Keep track of last valid position
let lastValidX;
let lastValidY;

// Streak tracking
let consecutiveHits = 0;
let scoreContainer;
let congratsElement;
let congratsTimeout;
let wasTargetHit = false;

// Animation parameters
let targetHitAnimation = false;
let targetHitTime = 0;
const TARGET_HIT_DURATION = 1500; // Duration in milliseconds

function setup() {
  // More reliable touch detection
  hasTouchScreen = (window.matchMedia("(pointer: coarse)").matches || 
                   window.matchMedia("(any-pointer: coarse)").matches ||
                   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  
  console.log("Touch device detected:", hasTouchScreen);
  
  // Make canvas responsive
  let canvasWidth = min(windowWidth * 0.95, 800);
  let canvasHeight = min(windowHeight * 0.8, 600);
  
  cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent('sketch-holder');
  
  // Prevent context menu and selection
  const preventDefault = (e) => e.preventDefault();
  cnv.elt.addEventListener('contextmenu', preventDefault);
  cnv.elt.addEventListener('selectstart', preventDefault);
  document.addEventListener('gesturestart', preventDefault);
  
  // Clean up event listeners on window unload
  window.addEventListener('unload', () => {
    if (cnv && cnv.elt) {
      cnv.elt.removeEventListener('contextmenu', preventDefault);
      cnv.elt.removeEventListener('selectstart', preventDefault);
    }
    document.removeEventListener('gesturestart', preventDefault);
  });
  
  textSize(12);
  rectMode(CENTER);
  
  initialPosition = createVector(0, height);
  lastValidX = initialPosition.x;
  lastValidY = initialPosition.y;
  gravity = createVector(0, g);
  
  // Set up buttons
  resetButton = select('#reset-button');
  fireButton = select('#fire-button');
  scoreContainer = select('#score-container');
  congratsElement = select('#congratulations');
  
  // Set up button handlers
  if (hasTouchScreen) {
    console.log("Setting up touch controls");
    
    fireButton.style('display', 'inline-block');
    
    // Ensure buttons work on touch devices
    resetButton.elt.addEventListener('touchend', function(e) {
      e.preventDefault();
      e.stopPropagation();
      reset();
    }, false);
    
    fireButton.elt.addEventListener('touchend', function(e) {
      e.preventDefault();
      e.stopPropagation();
      fireProjectile();
    }, false);
  } else {
    // Mouse only handlers
    resetButton.mousePressed(reset);
    fireButton.mousePressed(fireProjectile);
  }
  
  ballColor = color(255, 204, 84);
  obstacleColor = color(72, 65, 192);
  
  lastValidX = initialPosition.x;
  lastValidY = initialPosition.y;
  
  // Initialize performance monitoring
  lastFrameTime = performance.now();
  
  reset();

  congratsElement.elt.addEventListener('click', unpauseGame);
  congratsElement.elt.addEventListener('touchend', unpauseGame);
}

function checkTargetHit(x, y) {
  return (y >= height && x >= target.x-ballSize/2 && x <= target.y+ballSize/2);
}

function reset(input) {
  if (input === "refire") {
    // Handle streak before resetting position
    if (wasTargetHit) {
      consecutiveHits++;
      scoreContainer.html('Streak: ' + consecutiveHits);
      
      if (consecutiveHits === 3) {
        congratsElement.style('display', 'block');
        gamePaused = true;
      }
      // Create new obstacles and target only after a successful hit
      createObstacles();
      createTarget();
    } else {
      consecutiveHits = 0;
      scoreContainer.html('Streak: 0');
      // Create new obstacles and target after a miss
      createObstacles();
      createTarget();
    }
    
    isFired = false;
    position = createVector(0, height);
    wasTargetHit = false;  // Reset the hit flag
    
    if (finalPositions.length >= MAX_FINAL_POSITIONS) {
      finalPositions = finalPositions.slice(-MAX_FINAL_POSITIONS);
    }
  } else {
    // Full reset (when Reset button is pressed)
    finalPositions = [];
    isFired = false;
    position = createVector(0, height);
    createObstacles();
    createTarget();
    lastValidX = initialPosition.x;
    lastValidY = initialPosition.y;
    consecutiveHits = 0;
    scoreContainer.html('Streak: 0');
    wasTargetHit = false;
  }
  
  if (hasTouchScreen) {
    fireButton.style('display', 'inline-block');
  }
}

function draw() {
  if (gamePaused) return; // Don't update game state while paused

  // Performance monitoring
  const currentTime = performance.now();
  const deltaTime = currentTime - lastFrameTime;
  frameRates.push(1000 / deltaTime);
  if (frameRates.length > FPS_SAMPLE_SIZE) {
    frameRates.shift();
  }
  lastFrameTime = currentTime;
  
  background(233, 216, 177);
  drawGrid();
  
  //draw GROUND and WALL
  push();
  stroke(160,72,45);
  strokeWeight(5);
  line(0, height, width, height);
  line(width, height, width, 0);
  pop();
  
  drawObstacles();
  drawTarget();
  
  let x0 = initialPosition.x;
  let y0 = initialPosition.y;
  let x1, y1;

  // Modified input handling
  if (hasTouchScreen) {
    if (touches && touches.length > 0) {
      // Active touch
      let touchInCanvas = touches[0].x >= 0 && touches[0].x <= width && 
                         touches[0].y >= 0 && touches[0].y <= height;
      if (touchInCanvas) {
        x1 = touches[0].x;
        y1 = touches[0].y;
        lastValidX = x1;
        lastValidY = y1;
        isTouch = true;
      } else {
        // Touch outside canvas - use last valid position
        x1 = lastValidX;
        y1 = lastValidY;
      }
    } else {
      // No active touch - keep last position
      x1 = lastValidX;
      y1 = lastValidY;
    }
  } else if (!hasTouchScreen && mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    // Mouse input
    x1 = mouseX;
    y1 = mouseY;
    lastValidX = x1;
    lastValidY = y1;
  } else {
    // Fallback - use last valid position
    x1 = lastValidX;
    y1 = lastValidY;
  }

  // Draw the aiming vector and calculate velocity if not fired
  if (!isFired) {
    push();
    strokeWeight(2);
    stroke(255,0,0);
    fill(255,0,0);
    line(x0, y0, x1, y1);
    drawArrowhead(x0, y0, x1, y1);
    pop();

    // Calculate angle and speed
    angle = atan2(y1 - y0, x1 - x0);
    let initialSpeed = min(dist(x0, y0, x1, y1)/scalefac, 50);

    velocity = p5.Vector.fromAngle(angle);
    velocity.mult(initialSpeed);

    // Draw the data with responsive positioning
    push();
    fill(0);
    textSize(max(12, width * 0.015));
    let textX = x1;
    let textY = y1;
    let padding = width * 0.03;

    if (x1 > width/2) {
      textAlign(RIGHT, CENTER);
      textX -= 6*padding;
    } else {
      textAlign(LEFT, CENTER);
      textX += 3*padding;
    }
    if (y1 < height*0.1) {
      textAlign(RIGHT, CENTER);
      textY += 4*padding;
    } else {
      textAlign(LEFT, CENTER);
      textY;
    }

    text(`θ= ${degrees(-angle).toFixed(1)}°`, textX, textY);
    text(`v₀= ${initialSpeed.toFixed(1)}`, textX, textY - padding);
    pop();
  } else { //if fired, apply physics
    velocity.add(gravity);
    position.add(velocity);
  }

  drawBall(position.x, position.y, ballColor);

  // Check collisions efficiently
  if (isFired) {  // Only check collisions if the ball has been fired
    if (position.y >= height || position.x >= width) {
      finalPositions.push({xf: position.x, yf: min(position.y, height)});
      wasTargetHit = position.y >= height && checkTargetHit(position.x, position.y);
      
      if (wasTargetHit) {
        // Start hit animation instead of immediate reset
        targetHitAnimation = true;
        targetHitTime = millis();
        isFired = false;  // Stop ball movement
      } else {
        reset("refire");
      }
    } else {
      for (let obstacle of obstacles) {
        if (checkCircleRectCollision(
          position.x, position.y, ballSize/2,
          obstacle.x, obstacle.y,
          obstacle.w, obstacle.h, 0
        )) {
          finalPositions.push({xf: position.x, yf: position.y});
          wasTargetHit = false;
          reset("refire");
          break;
        }
      }
    }
  }

  drawFinalPositions();
}

function drawBall(x, y, c) {
  push();
  stroke(0);
  fill(c);
  ellipse(x, y, ballSize);
  pop();
}

function drawFinalPositions() {
  push();
  stroke(0);
  fill(ballColor);
  for (let pos of finalPositions) {
    ellipse(pos.xf, pos.yf, ballSize);
  }
  pop();
}

function drawArrowhead(x0, y0, x1, y1) {
  let angle = atan2(y1 - y0, x1 - x0);
  let arrowSize = width * 0.015;

  push();
  translate(x1, y1);
  rotate(angle);
  beginShape();
  vertex(0, 0);
  vertex(-arrowSize, -arrowSize / 2);
  vertex(-arrowSize, arrowSize / 2);
  endShape(CLOSE);
  pop();
}

function drawGrid() {
  let minorSpacing = 10;
  let majorSpacing = 50;

  stroke(200);
  for (let x = 0; x < width; x += minorSpacing) {
    line(x, 0, x, height);
  }
  for (let y = 0; y < height; y += minorSpacing) {
    line(0, height-y, width, height-y);
  }
  
  stroke(100);
  fill(100);
  for (let x = majorSpacing; x < width; x += majorSpacing) {
    line(x, 0, x, height);
    textAlign(CENTER, TOP);
    text((x/scalefac).toFixed(0), x, 0);
  }
  for (let y = majorSpacing; y < height; y += majorSpacing) {
    line(0, height-y, width, height-y);
    textAlign(LEFT, CENTER);
    text((y/scalefac).toFixed(0), 0, height-y);
  }
}

function createObstacles() {
  obstacles = [];
  for (let i = 0; i < numObstacles; i++) {
    let x = random(width * 0.2, width * 0.8);
    let y = random(height * 0.2, height * 0.8);
    let w = random(width * 0.025, width * 0.0875);
    let h = random(height * 0.033, height * 0.083);
    obstacles.push({x, y, w, h});
  }
}

function drawObstacles() {
  push();
  stroke(0);
  strokeWeight(2);
  fill(obstacleColor);
  for (let obs of obstacles) {
    rect(obs.x, obs.y, obs.w, obs.h);
  }
  pop();
}

function createTarget() {
  let targetPos = random(width * 0.1, width * 0.9);
  let targetSize = random(targetMinSize, targetMaxSize);
  target = createVector(targetPos, targetPos + targetSize);
}

function drawTarget() {
  push();
  if (targetHitAnimation) {
    // Calculate animation progress (0 to 1)
    let progress = (millis() - targetHitTime) / TARGET_HIT_DURATION;
    
    if (progress >= 1) {
      // Animation complete, reset
      targetHitAnimation = false;
      reset("refire");
    } else {
      // Pulse between red and green based on progress
      let pulseColor = lerpColor(
        color(200, 0, 0),    // Red
        color(0, 200, 50),   // Green
        abs(sin(progress * PI * 2))  // Oscillate
      );
      stroke(pulseColor);
      strokeWeight(20);  // Make it slightly bigger during animation
    }
  } else {
    stroke(0, 200, 50);
    strokeWeight(15);
  }
  line(target.x, height, target.y, height);
  pop();
}

function checkCircleRectCollision(cx, cy, cr, rx, ry, rw, rh, ra) {
  let localCircle = createVector(cx - rx, cy - ry).rotate(-ra);
  let nearestX = max(-rw / 2, min(localCircle.x, rw / 2));
  let nearestY = max(-rh / 2, min(localCircle.y, rh / 2));
  let distance = dist(localCircle.x, localCircle.y, nearestX, nearestY);
  return distance <= cr;
}

function fireProjectile() {
  if (!isFired && velocity) {
    isFired = true;
  }
}

function touchStarted(e) {
  if (!hasTouchScreen) return false;
  
  if (e && e.preventDefault) e.preventDefault();
  if (!isFired && touches && touches.length > 0) {
    isTouch = true;
  }
  return false;
}

function touchEnded(e) {
  if (!hasTouchScreen) return false;
  
  if (e && e.preventDefault) e.preventDefault();
  // Keep the last valid position by not resetting anything
  return false;
}

function touchMoved(e) {
  if (e && e.preventDefault) e.preventDefault();
  return false;
}

function mousePressed(e) {
  if (e && e.preventDefault) e.preventDefault();
  return false;
}

function mouseDragged(e) {
  if (e && e.preventDefault) e.preventDefault();
  return false;
}

function mouseClicked() {
  if (hasTouchScreen) return false;
  
  let pointerInCanvas = mouseX >= 0 && mouseX <= width && 
                       mouseY >= 0 && mouseY <= height;
  if (!isFired && pointerInCanvas) {
    isFired = true;
  }
  return false;
}

function windowResized() {
  let canvasWidth = min(windowWidth * 0.95, 800);
  let canvasHeight = min(windowHeight * 0.8, 600);
  resizeCanvas(canvasWidth, canvasHeight);
  initialPosition = createVector(0, height);
    reset();
}

function unpauseGame(e) {
  if (e) {
      e.preventDefault();
      e.stopPropagation();
  }
  if (gamePaused) {
      gamePaused = false;
      congratsElement.style('display', 'none');
      reset(); // Full reset to start new round
  }
}