let h, k, l;
let axisLength;
let cellSize = 200;
let rotationX = 0;
let rotationY = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let zoom = 0.5;
let canvasSize;
let controlPanel;
let isDragging = false;
let originTranslation;
let lastTouchDistance = 0;
let lastClickTime = 0;
const clickDelay = 100; // Minimum time between clicks in milliseconds

function setup() {
  let containerDiv = createDiv();
  containerDiv.id('container');
  containerDiv.parent('canvas-container');

  canvasSize = min(windowWidth, windowHeight - 150) - 80; // Increased space for controls
  let canvas = createCanvas(canvasSize, canvasSize, WEBGL);
  canvas.parent(containerDiv);

  createControlPanel(containerDiv);

  axisLength = 250;

  canvas.mousePressed(startDrag);
  canvas.mouseReleased(endDrag);
  canvas.touchStarted(touchStartedCanvas);
  canvas.touchMoved(touchMovedCanvas);
  canvas.touchEnded(touchEndedCanvas);

  // Prevent default touch behavior on the canvas only
  canvas.elt.addEventListener('touchstart', function(e) {
    e.preventDefault();
  }, { passive: false });
  canvas.elt.addEventListener('touchmove', function(e) {
    e.preventDefault();
  }, { passive: false });
}

function createControlPanel(container) {
  controlPanel = createDiv();
  controlPanel.id('control-panel');
  controlPanel.parent(container);

  let inputContainer = createDiv();
  inputContainer.class('input-container');
  inputContainer.parent(controlPanel);

  h = createButtonRow(inputContainer, 'h', 'red');
  k = createButtonRow(inputContainer, 'k', 'green');
  l = createButtonRow(inputContainer, 'l', 'blue');
}

function createButtonRow(container, label, color) {
  let row = createDiv();
  row.class('button-row');
  row.parent(container);

  let lbl = createSpan(label);
  lbl.style('color', color);
  lbl.parent(row);

  let minusBtn = createButton('-');
  minusBtn.class('control-button');
  minusBtn.parent(row);
  minusBtn.mousePressed(() => handleButtonClick(label, -1));
  minusBtn.touchStarted(() => handleButtonClick(label, -1));

  let valueDisplay = createSpan('0');
  valueDisplay.class('value-display');
  valueDisplay.id(label + '-value');
  valueDisplay.parent(row);

  let plusBtn = createButton('+');
  plusBtn.class('control-button');
  plusBtn.parent(row);
  plusBtn.mousePressed(() => handleButtonClick(label, 1));
  plusBtn.touchStarted(() => handleButtonClick(label, 1));

  return valueDisplay;
}

function handleButtonClick(label, change) {
  let currentTime = millis();
  if (currentTime - lastClickTime > clickDelay) {
    updateValue(label, change);
    lastClickTime = currentTime;
  }
  return false; // Prevent default behavior
}

function updateValue(label, change) {
  let valueDisplay = select('#' + label + '-value');
  let currentValue = parseInt(valueDisplay.html());
  let newValue = constrain(currentValue + change, -2, 2);
  valueDisplay.html(newValue);
  updatePlane();
}

function draw() {
  background(240);
  
  push();
  scale(zoom);
  rotateX(rotationX);
  rotateY(rotationY);
  translate(-cellSize/2, -cellSize/2, -cellSize/2);
  
  // Draw unit cell
  stroke(0);
  noFill();
  drawUnitCell();
  
  // Draw axes
  drawAxes();
  
  // Apply origin translation for plane visualization
  if (originTranslation) {
    translate(originTranslation.x, originTranslation.y, originTranslation.z);
  }
  
  // Draw plane
  fill(0, 255, 255, 100);
  drawPlane();
  
  pop();
}

function drawUnitCell() {
  // Front face
  line(0, 0, 0, cellSize, 0, 0);
  line(0, 0, 0, 0, cellSize, 0);
  line(cellSize, 0, 0, cellSize, cellSize, 0);
  line(0, cellSize, 0, cellSize, cellSize, 0);
  
  // Back face
  line(0, 0, cellSize, cellSize, 0, cellSize);
  line(0, 0, cellSize, 0, cellSize, cellSize);
  line(cellSize, 0, cellSize, cellSize, cellSize, cellSize);
  line(0, cellSize, cellSize, cellSize, cellSize, cellSize);
  
  // Connecting edges
  line(0, 0, 0, 0, 0, cellSize);
  line(cellSize, 0, 0, cellSize, 0, cellSize);
  line(0, cellSize, 0, 0, cellSize, cellSize);
  line(cellSize, cellSize, 0, cellSize, cellSize, cellSize);
}

function drawPlane() {
  let hVal = parseInt(select('#h-value').html());
  let kVal = parseInt(select('#k-value').html());
  let lVal = parseInt(select('#l-value').html());
  
  if (hVal === 0 && kVal === 0 && lVal === 0) return;
  
  let points = calculatePlanePoints(kVal, hVal, lVal); //TODO: change k and h for right-handed coordinate frame
  
  if (points.length > 0) {
    beginShape();
    for (let p of points) {
      vertex(p.x, p.y, p.z);
    }
    endShape(CLOSE);
  }
}

function calculatePlanePoints(h, k, l) {
  let points = [];
  let zeroCount = (h === 0 ? 1 : 0) + (k === 0 ? 1 : 0) + (l === 0 ? 1 : 0);
  
  // Calculate origin translation
  originTranslation = createVector(
    h < 0 ? cellSize : 0,
    k < 0 ? cellSize : 0,
    l < 0 ? cellSize : 0
  );
  
  let xIntercept = h !== 0 ? cellSize / h : 0;
  let yIntercept = k !== 0 ? cellSize / k : 0;
  let zIntercept = l !== 0 ? cellSize / l : 0;
  
  if (zeroCount === 2) {
    // Plane perpendicular to the non-zero axis
    if (h !== 0) {
      points.push(createVector(xIntercept, 0, 0));
      points.push(createVector(xIntercept, cellSize, 0));
      points.push(createVector(xIntercept, cellSize, cellSize));
      points.push(createVector(xIntercept, 0, cellSize));
    } else if (k !== 0) {
      points.push(createVector(0, yIntercept, 0));
      points.push(createVector(cellSize, yIntercept, 0));
      points.push(createVector(cellSize, yIntercept, cellSize));
      points.push(createVector(0, yIntercept, cellSize));
    } else { // l !== 0
      points.push(createVector(0, 0, zIntercept));
      points.push(createVector(cellSize, 0, zIntercept));
      points.push(createVector(cellSize, cellSize, zIntercept));
      points.push(createVector(0, cellSize, zIntercept));
    }
  } else if (zeroCount === 1) {
    // Rectangular plane parallel to one axis
    if (h === 0) {
      points.push(createVector(0, 0, zIntercept));
      points.push(createVector(0, yIntercept, 0));
      points.push(createVector(cellSize, yIntercept, 0));
      points.push(createVector(cellSize, 0, zIntercept));
    } else if (k === 0) {
      points.push(createVector(xIntercept, 0, 0));
      points.push(createVector(0, 0, zIntercept));
      points.push(createVector(0, cellSize, zIntercept));
      points.push(createVector(xIntercept, cellSize, 0));
    } else { // l === 0
      points.push(createVector(xIntercept, 0, 0));
      points.push(createVector(0, yIntercept, 0));
      points.push(createVector(0, yIntercept, cellSize));
      points.push(createVector(xIntercept, 0, cellSize));
    }
  } else {
    // Triangular plane
    points.push(createVector(xIntercept, 0, 0));
    points.push(createVector(0, yIntercept, 0));
    points.push(createVector(0, 0, zIntercept));
  }
  
  return points;
}

function drawAxes() {
  strokeWeight(3);
  
  stroke(0, 255, 0);
  line(0, 0, 0, axisLength, 0, 0);
  
  stroke(255, 0, 0);
  line(0, 0, 0, 0, axisLength, 0);
  
  stroke(0, 0, 255);
  line(0, 0, 0, 0, 0, axisLength);
  
  strokeWeight(1);
}

function updatePlane() {
  redraw();
}

function startDrag() {
  isDragging = true;
  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

function endDrag() {
  isDragging = false;
}

function mouseDragged() {
  if (!isDragging) return false;

  let deltaX = mouseX - lastMouseX;
  let deltaY = mouseY - lastMouseY;
  
  rotationY -= map(deltaX, 0, width, 0, TWO_PI);
  rotationX -= map(deltaY, 0, height, 0, TWO_PI);
  
  lastMouseX = mouseX;
  lastMouseY = mouseY;
  
  return false;
}

function mouseWheel(event) {
  zoom -= event.delta * 0.001;
  zoom = constrain(zoom, 0.1, 3);
  return false;
}

function touchStartedCanvas() {
  if (touches.length > 0) {
    lastMouseX = touches[0].x;
    lastMouseY = touches[0].y;
  }
  return false;
}

function touchMovedCanvas() {
  if (touches.length === 1) {
    let deltaX = touches[0].x - lastMouseX;
    let deltaY = touches[0].y - lastMouseY;
    
    rotationY -= map(deltaX, 0, width, 0, TWO_PI);
    rotationX -= map(deltaY, 0, height, 0, TWO_PI);
    
    lastMouseX = touches[0].x;
    lastMouseY = touches[0].y;
  } else if (touches.length === 2) {
    let newDist = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
    if (lastTouchDistance > 0) {
      let deltaDistance = newDist - lastTouchDistance;
      zoom += deltaDistance * 0.01;
      zoom = constrain(zoom, 0.1, 3);
    }
    lastTouchDistance = newDist;
  }
  return false;
}

function touchEndedCanvas() {
  lastTouchDistance = 0;
  return false;
}

function windowResized() {
  canvasSize = min(windowWidth, windowHeight - 150) - 20;
  resizeCanvas(canvasSize, canvasSize);
}