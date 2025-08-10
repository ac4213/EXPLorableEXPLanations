let latticeType = 'SC';
let showLattice = false;
let showGridLines = true;
let showReducedSpheres = true;
let rotationX = 0;
let rotationY = 0;
let zoomLevel = 1;
let lastTouchDistance = 0;
let canvasSize;
let uiContainer;
let canvas;
let lastTouchX, lastTouchY;

function setup() {
  canvasSize = min(windowWidth, windowHeight - 200, 600);
  canvas = createCanvas(canvasSize, canvasSize, WEBGL);
  canvas.addClass('lattice-canvas');
  
  uiContainer = createDiv('');
  uiContainer.class('ui-container');
  uiContainer.position(0, canvasSize);
  uiContainer.style('width', '100%');
  uiContainer.style('display', 'flex');
  uiContainer.style('flex-wrap', 'wrap');
  uiContainer.style('justify-content', 'center');
  uiContainer.style('align-items', 'center');
  uiContainer.style('padding', '10px');
  
  let buttonContainer = createDiv('');
  buttonContainer.parent(uiContainer);
  buttonContainer.style('display', 'flex');
  buttonContainer.style('flex-wrap', 'wrap');
  buttonContainer.style('justify-content', 'center');
  buttonContainer.style('margin-bottom', '10px');

  let buttonStyles = 'margin: 5px; padding: 10px 15px; font-size: 16px;';
  createButton('SC').parent(buttonContainer).style(buttonStyles).mousePressed(() => latticeType = 'SC');
  createButton('BCC').parent(buttonContainer).style(buttonStyles).mousePressed(() => latticeType = 'BCC');
  createButton('FCC').parent(buttonContainer).style(buttonStyles).mousePressed(() => latticeType = 'FCC');
  createButton('HCP').parent(buttonContainer).style(buttonStyles).mousePressed(() => latticeType = 'HCP');

  let checkboxStyles = 'margin: 5px; font-size: 16px;';
  let latticeCheckbox = createCheckbox('Show Lattice', false);
  latticeCheckbox.parent(uiContainer).style(checkboxStyles);
  latticeCheckbox.changed(() => showLattice = latticeCheckbox.checked());
  
  let gridCheckbox = createCheckbox('Show Grid Lines', true);
  gridCheckbox.parent(uiContainer).style(checkboxStyles);
  gridCheckbox.changed(() => showGridLines = gridCheckbox.checked());
  
  let reducedCheckbox = createCheckbox('Show Reduced Spheres', true);
  reducedCheckbox.parent(uiContainer).style(checkboxStyles);
  reducedCheckbox.changed(() => showReducedSpheres = reducedCheckbox.checked());

  // Prevent default touch behavior on the canvas
  canvas.elt.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    }
  }, { passive: false });

  canvas.elt.addEventListener('touchmove', function(e) {
    e.preventDefault();
  }, { passive: false });
}

function draw() {
  background(240);
  
  ambientLight(100);
  pointLight(255, 255, 255, 300, 300, 300);
  
  push();
  scale(zoomLevel * canvasSize / 600);
  rotateX(rotationX);
  rotateY(rotationY);
  
  if (showLattice) {
    drawLattice();
  } else {
    drawUnitCell();
  }
  
  pop();
}

function touchMoved(event) {
  if (touches.length == 1) {
    let touch = touches[0];
    if (touch.x < width && touch.y < height) {
      let dx = touch.x - lastTouchX;
      let dy = touch.y - lastTouchY;
      rotationY += dx * 0.01;
      rotationX -= dy * 0.01; // Inverted the sign here
      lastTouchX = touch.x;
      lastTouchY = touch.y;
    }
  } else if (touches.length == 2) {
    let currentTouchDistance = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
    if (lastTouchDistance > 0) {
      zoomLevel *= currentTouchDistance / lastTouchDistance;
      zoomLevel = constrain(zoomLevel, 0.1, 10);
    }
    lastTouchDistance = currentTouchDistance;
  }
  return false;
}

function touchEnded() {
  lastTouchDistance = 0;
}

function mouseWheel(event) {
  if (mouseX < width && mouseY < height) {
    zoomLevel -= event.delta * 0.001;
    zoomLevel = constrain(zoomLevel, 0.1, 10);
    return false;
  }
}

function mouseDragged() {
  if (mouseX < width && mouseY < height) {
    rotationY += (mouseX - pmouseX) * 0.01;
    rotationX -= (mouseY - pmouseY) * 0.01; // Inverted the sign here
    return false;
  }
}

function windowResized() {
  canvasSize = min(windowWidth, windowHeight - 200, 600);
  resizeCanvas(canvasSize, canvasSize);
  uiContainer.position(0, canvasSize);
}

function drawUnitCell() {
  switch (latticeType) {
    case 'SC':
      drawSC();
      break;
    case 'BCC':
      drawBCC();
      break;
    case 'FCC':
      drawFCC();
      break;
    case 'HCP':
      drawHCP();
      break;
  }
}

function drawLattice() {
  if (latticeType === 'HCP') {
    drawHCPLattice();
  } else {
    const size = 3;
    const offset = (size - 1) / 2;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          push();
          translate((x - offset) * 100, (y - offset) * 100, (z - offset) * 100);
          drawUnitCell();
          pop();
        }
      }
    }
  }
}

function drawHCPLattice() {
  const a = 100; // width of the hexagon
  const positions = [
    [0, 0],
    [a, 0],
    [a/2, a*Math.sqrt(3)/2],
    [-a/2, a*Math.sqrt(3)/2],
    [-a, 0],
    [-a/2, -a*Math.sqrt(3)/2],
    [a/2, -a*Math.sqrt(3)/2]
  ];

  for (let [x, y] of positions) {
    push();
    translate(x, y, 0);
    if (x !== 0 || y !== 0) {
      rotateZ(Math.atan2(y, x));
    }
    drawHCP();
    pop();
  }
}

function drawSC() {
  const SCradius = showReducedSpheres ? 10 : 50;
  drawAtoms(() => {
    fill(255, 165, 0);
    for (let i = -1; i <= 1; i += 2) {
      for (let j = -1; j <= 1; j += 2) {
        for (let k = -1; k <= 1; k += 2) {
          push();
          translate(i * 50, j * 50, k * 50);
          sphere(SCradius);
          pop();
        }
      }
    }
  });
}

function drawBCC() {
  const BCCradius = showReducedSpheres ? 10 : 50;
  drawAtoms(() => {
    fill(255, 0, 0);
    // Center atom
    sphere(BCCradius);
    
    // Corner atoms
    for (let i = -1; i <= 1; i += 2) {
      for (let j = -1; j <= 1; j += 2) {
        for (let k = -1; k <= 1; k += 2) {
          push();
          translate(i * 50, j * 50, k * 50);
          sphere(BCCradius);
          pop();
        }
      }
    }
  });
}

function drawFCC() {
  const FCCradius = showReducedSpheres ? 10 : 35;
  drawAtoms(() => {
    fill(0, 255, 0);
    // Corner atoms
    for (let i = -1; i <= 1; i += 2) {
      for (let j = -1; j <= 1; j += 2) {
        for (let k = -1; k <= 1; k += 2) {
          push();
          translate(i * 50, j * 50, k * 50);
          sphere(FCCradius);
          pop();
        }
      }
    }
    
    // Face-centered atoms
    for (let i = -1; i <= 1; i += 2) {
      push();
      translate(i * 50, 0, 0);
      sphere(FCCradius);
      pop();
      push();
      translate(0, i * 50, 0);
      sphere(FCCradius);
      pop();
      push();
      translate(0, 0, i * 50);
      sphere(FCCradius);
      pop();
    }
  });
}

function drawHCP() {
  const a = 100; // width of the hexagon
  const c = 100; // height of the prism

  drawAtoms(() => {
    fill(0, 0, 255);
    // Top layer
    drawHexagonalLayer(c/2);
    
    // Bottom layer
    drawHexagonalLayer(-c/2);
    
    // Middle layer
    drawMiddleLayer(0);
  });
}

function drawAtoms(atomsDrawFunction) {
  if (showGridLines) {
    push();
    stroke(0);
    noFill();
    if (latticeType === 'HCP') {
      drawHexagonalPrism(100, 100);
    } else {
      box(100);
    }
    pop();
  }
  
  noStroke();
  specularMaterial(255);
  shininess(20);
  atomsDrawFunction();
}

function drawHexagonalPrism(width, height) {
  const radius = width / 2;
  
  // Draw top and bottom hexagons
  for (let z of [-height/2, height/2]) {
    push();
    translate(0, 0, z);
    beginShape();
    for (let i = 0; i < 6; i++) {
      const angle = i * TWO_PI / 6;
      vertex(radius * cos(angle), radius * sin(angle));
    }
    endShape(CLOSE);
    pop();
  }
  
  // Draw vertical edges
  for (let i = 0; i < 6; i++) {
    const angle = i * TWO_PI / 6;
    const x = radius * cos(angle);
    const y = radius * sin(angle);
    line(x, y, -height/2, x, y, height/2);
  }
}

function drawHexagonalLayer(z) {
  const radius = 50; // Radius of the hexagon
  const HCPradius = showReducedSpheres ? 10 : 25;
  
  // Draw atoms at the corners
  for (let i = 0; i < 6; i++) {
    const angle = i * PI / 3;
    push();
    translate(radius * cos(angle), radius * sin(angle), z);
    sphere(HCPradius);
    pop();
  }
  
  // Draw atom in the middle
  push();
  translate(0, 0, z);
  sphere(HCPradius);
  pop();
}

function drawMiddleLayer(z) {
  const radius = 50 * Math.sqrt(3) / 3; // Radius of the inscribed triangle
  const HCPradius = showReducedSpheres ? 10 : 25;
  
  // Draw three atoms in an equilateral triangle
  for (let i = 0; i < 3; i++) {
    const angle = i * 2 * PI / 3 + PI / 6; // Rotate by 30 degrees to align with hexagon
    push();
    translate(radius * cos(angle), radius * sin(angle), z);
    sphere(HCPradius);
    pop();
  }
}