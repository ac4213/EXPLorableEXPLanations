// Free Body Diagram Interactive Simulator
// Variables for the beam and canvas
let beam;
let canvasWidth = 800;
let canvasHeight = 600;
let gridSize = 20;

// Arrays to store forces and supports
let forces = [];
let supports = [];
let reactions = [];

// UI elements
let clearButton, exampleButton1, exampleButton2, exampleButton3;
let showReactions = true;
let selectedTool = null;
let draggedElement = null;
let isDragging = false;

// Colours consistent with theme
let beamColour;
let forceColour;
let supportColour;
let reactionColour;
let distributedColour;
let gridColour;

// Touch support
let lastTouchX = 0;
let lastTouchY = 0;

function setup() {
  // Create canvas
  let cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent('sketch-holder');
  
  // Initialise colours
  beamColour = color(51, 51, 51);
  forceColour = color(204, 0, 0);
  supportColour = color(0, 102, 204);
  reactionColour = color(0, 153, 0);
  distributedColour = color(255, 140, 0);
  gridColour = color(230, 230, 230);
  
  // Initialise beam
  beam = {
    x: 100,
    y: height/2,
    length: 600,
    height: 20
  };
  
  // Create buttons
  createButtons();
  
  // Set up event listeners for controls after a delay to ensure DOM is ready
  setTimeout(setupControls, 100);
  
  // Load first example
  setTimeout(loadExample1, 200);
}

function createButtons() {
  // Clear button
  clearButton = createButton('CLEAR');
  clearButton.parent('button-container');
  clearButton.mousePressed(clearDiagram);
  
  // Example buttons
  exampleButton1 = createButton('EXAMPLE: Simply Supported');
  exampleButton1.parent('button-container');
  exampleButton1.mousePressed(loadExample1);
  
  exampleButton2 = createButton('EXAMPLE: Cantilever');
  exampleButton2.parent('button-container');
  exampleButton2.mousePressed(loadExample2);
  
  exampleButton3 = createButton('EXAMPLE: Overhanging');
  exampleButton3.parent('button-container');
  exampleButton3.mousePressed(loadExample3);
}

function setupControls() {
  // Get control elements using standard DOM methods
  let loadSelect = document.getElementById('load-select');
  let supportSelect = document.getElementById('support-select');
  let reactionsCheckbox = document.getElementById('show-reactions');
  
  if (loadSelect) {
    loadSelect.addEventListener('change', function() {
      selectedTool = 'load-' + loadSelect.value;
      console.log('Selected tool:', selectedTool);
    });
  }
  
  if (supportSelect) {
    supportSelect.addEventListener('change', function() {
      selectedTool = 'support-' + supportSelect.value;
      console.log('Selected tool:', selectedTool);
    });
  }
  
  if (reactionsCheckbox) {
    reactionsCheckbox.addEventListener('change', function() {
      showReactions = reactionsCheckbox.checked;
      calculateReactions();
    });
  }
}

function draw() {
  background(255, 251, 235); // Cream background
  
  // Draw grid
  drawGrid();
  
  // Draw coordinate system
  drawCoordinateSystem();
  
  // Draw beam
  drawBeam();
  
  // Draw all supports
  for (let support of supports) {
    drawSupport(support);
  }
  
  // Draw all forces
  for (let force of forces) {
    drawForce(force);
  }
  
  // Draw reactions if enabled
  if (showReactions && reactions.length > 0) {
    for (let reaction of reactions) {
      drawReaction(reaction);
    }
  }
  
  // Draw dimensions
  drawDimensions();
  
  // Draw info text
  drawInfoText();
}

function drawGrid() {
  push();
  stroke(gridColour);
  strokeWeight(0.5);
  
  for (let x = 0; x <= width; x += gridSize) {
    line(x, 0, x, height);
  }
  
  for (let y = 0; y <= height; y += gridSize) {
    line(0, y, width, y);
  }
  pop();
}

function drawCoordinateSystem() {
  push();
  stroke(100);
  strokeWeight(1);
  fill(100);
  
  // X-axis arrow
  line(50, height - 50, 150, height - 50);
  // Arrowhead for X
  push();
  translate(150, height - 50);
  rotate(0);
  triangle(0, 0, -8, -4, -8, 4);
  pop();
  
  // Y-axis arrow
  line(50, height - 50, 50, height - 150);
  // Arrowhead for Y
  push();
  translate(50, height - 150);
  rotate(-PI/2);
  triangle(0, 0, -8, -4, -8, 4);
  pop();
  
  // Labels
  fill(0);
  noStroke();
  textAlign(CENTER, TOP);
  text('x', 150, height - 45);
  textAlign(LEFT, CENTER);
  text('y', 55, height - 150);
  
  pop();
}

function drawBeam() {
  push();
  fill(beamColour);
  stroke(0);
  strokeWeight(2);
  rect(beam.x, beam.y - beam.height/2, beam.length, beam.height);
  
  // Draw centre line with manual dashes
  stroke(150);
  strokeWeight(1);
  drawDashedLine(beam.x, beam.y, beam.x + beam.length, beam.y, 5, 5);
  pop();
}

function drawDashedLine(x1, y1, x2, y2, dashLength, gapLength) {
  let distance = dist(x1, y1, x2, y2);
  let dashCount = distance / (dashLength + gapLength);
  let dx = (x2 - x1) / distance;
  let dy = (y2 - y1) / distance;
  
  for (let i = 0; i < dashCount; i++) {
    let startX = x1 + (i * (dashLength + gapLength)) * dx;
    let startY = y1 + (i * (dashLength + gapLength)) * dy;
    let endX = startX + dashLength * dx;
    let endY = startY + dashLength * dy;
    line(startX, startY, endX, endY);
  }
}

function drawSupport(support) {
  push();
  stroke(supportColour);
  strokeWeight(2);
  fill(255);
  
  let x = support.x;
  let y = beam.y + beam.height/2;
  
  switch(support.type) {
    case 'roller':
      // Draw roller support (triangle with circle)
      noFill();
      triangle(x - 15, y, x + 15, y, x, y + 20);
      ellipse(x, y + 25, 10, 10);
      // Ground line
      line(x - 20, y + 30, x + 20, y + 30);
      break;
      
    case 'pin':
      // Draw pin support (triangle)
      noFill();
      triangle(x - 15, y, x + 15, y, x, y + 25);
      // Ground line
      line(x - 20, y + 30, x + 20, y + 30);
      break;
      
    case 'fixed':
      // Draw fixed support
      fill(supportColour);
      rect(x - 5, y, 10, 30);
      // Draw hatching
      stroke(0);
      for (let i = 0; i < 5; i++) {
        line(x - 10 - i*3, y + 30 + i*3, x + 10 + i*3, y + 30 + i*3);
      }
      break;
      
    case 'collar':
      // Draw collar support
      noFill();
      rect(x - 15, y - 10, 30, 20);
      ellipse(x, y, 8, 8);
      // Guide rails
      line(x - 25, y - 10, x - 25, y + 10);
      line(x + 25, y - 10, x + 25, y + 10);
      break;
  }
  
  // Draw label
  fill(0);
  noStroke();
  textAlign(CENTER, TOP);
  text(support.label || support.type, x, y + 40);
  
  pop();
}

function drawForce(force) {
  push();
  
  let x = force.x || 0;
  let y = beam.y;
  
  switch(force.type) {
    case 'point':
      // Draw point force arrow
      stroke(forceColour);
      fill(forceColour);
      strokeWeight(3);
      let forceLength = force.magnitude * 2;
      let startY = y - beam.height/2;
      let endY = startY - forceLength;
      
      // Arrow line
      line(x, startY, x, endY);
      // Arrowhead
      push();
      translate(x, startY);
      if (force.direction === 'down') {
        rotate(PI/2);
      } else {
        rotate(-PI/2);
      }
      noStroke();
      triangle(0, 0, -8, -4, -8, 4);
      pop();
      
      // Label
      noStroke();
      textAlign(CENTER, BOTTOM);
      text(force.magnitude + ' kN', x, endY - 5);
      break;
      
    case 'moment':
      // Draw moment
      stroke(forceColour);
      strokeWeight(2);
      noFill();
      let radius = 25;
      arc(x, y, radius * 2, radius * 2, -PI/2, PI);
      
      // Arrow on arc
      fill(forceColour);
      noStroke();
      push();
      let arrowAngle = force.direction === 'cw' ? PI : -PI/2;
      let arrowX = x + radius * cos(arrowAngle);
      let arrowY = y + radius * sin(arrowAngle);
      translate(arrowX, arrowY);
      rotate(arrowAngle + (force.direction === 'cw' ? PI/2 : -PI/2));
      triangle(0, 0, -6, -3, -6, 3);
      pop();
      
      // Label
      noStroke();
      textAlign(CENTER, CENTER);
      text(force.magnitude + ' kN·m', x, y - 40);
      break;
      
    case 'distributed':
      // Draw distributed load
      stroke(distributedColour);
      fill(distributedColour);
      strokeWeight(2);
      let startX = force.startX || beam.x;
      let endX = force.endX || beam.x + 100;
      let loadHeight = force.magnitude * 3;
      
      // Draw arrows
      for (let px = startX; px <= endX; px += 20) {
        line(px, y - loadHeight, px, y - beam.height/2);
        // Small arrowheads
        push();
        translate(px, y - beam.height/2);
        rotate(PI/2);
        noStroke();
        triangle(0, 0, -5, -2, -5, 2);
        pop();
      }
      
      // Draw top line
      line(startX, y - loadHeight, endX, y - loadHeight);
      
      // Label
      noStroke();
      textAlign(CENTER, BOTTOM);
      text(force.magnitude + ' kN/m', (startX + endX)/2, y - loadHeight - 5);
      break;
      
    case 'weight':
      // Draw weight force
      stroke(forceColour);
      fill(forceColour);
      strokeWeight(3);
      
      // Draw mass block
      push();
      fill(200);
      stroke(0);
      strokeWeight(1);
      rect(x - 20, y - 50, 40, 20);
      pop();
      
      // Draw arrow
      line(x, y - 30, x, y - beam.height/2);
      // Arrowhead
      push();
      translate(x, y - beam.height/2);
      rotate(PI/2);
      noStroke();
      triangle(0, 0, -8, -4, -8, 4);
      pop();
      
      // Label
      noStroke();
      textAlign(CENTER, BOTTOM);
      text('W = ' + force.magnitude + ' kN', x, y - 55);
      break;
  }
  
  pop();
}

function drawReaction(reaction) {
  push();
  stroke(reactionColour);
  fill(reactionColour);
  strokeWeight(3);
  
  let x = reaction.x;
  let y = beam.y + beam.height/2;
  
  if (reaction.type === 'force') {
    // Draw reaction force
    let forceLength = abs(reaction.magnitude) * 2;
    
    if (reaction.direction === 'vertical') {
      let startY = y + 35;
      let endY = startY - forceLength;
      
      // Arrow line
      line(x, startY, x, endY);
      // Arrowhead
      push();
      translate(x, endY);
      rotate(-PI/2);
      noStroke();
      triangle(0, 0, -8, -4, -8, 4);
      pop();
      
      // Label
      noStroke();
      textAlign(LEFT, CENTER);
      text('R_y = ' + reaction.magnitude.toFixed(1) + ' kN', x + 5, (startY + endY)/2);
    }
  } else if (reaction.type === 'moment') {
    // Draw reaction moment
    stroke(reactionColour);
    strokeWeight(2);
    noFill();
    let radius = 30;
    arc(x, y, radius * 2, radius * 2, 0, TWO_PI * 0.75);
    
    // Arrow on arc
    noStroke();
    push();
    let arrowAngle = reaction.magnitude > 0 ? PI * 0.75 : 0;
    let arrowX = x + radius * cos(arrowAngle);
    let arrowY = y + radius * sin(arrowAngle);
    translate(arrowX, arrowY);
    rotate(arrowAngle + (reaction.magnitude > 0 ? PI/2 : -PI/2));
    triangle(0, 0, -6, -3, -6, 3);
    pop();
    
    // Label
    noStroke();
    textAlign(CENTER, TOP);
    text('M = ' + reaction.magnitude.toFixed(1) + ' kN·m', x, y + 40);
  }
  
  pop();
}

function drawDimensions() {
  push();
  stroke(100);
  strokeWeight(1);
  fill(0);
  textAlign(CENTER, TOP);
  
  // Beam length dimension
  let dimY = beam.y + beam.height/2 + 80;
  line(beam.x, dimY - 5, beam.x, dimY + 5);
  line(beam.x + beam.length, dimY - 5, beam.x + beam.length, dimY + 5);
  drawDashedLine(beam.x, dimY, beam.x + beam.length, dimY, 2, 2);
  
  text((beam.length/100).toFixed(1) + ' m', beam.x + beam.length/2, dimY + 5);
  
  pop();
}

function drawInfoText() {
  push();
  fill(0);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(14);
  
  let info = 'Active Tool: ';
  if (selectedTool) {
    info += selectedTool.replace('-', ' ').toUpperCase();
  } else {
    info += 'None (select from dropdown)';
  }
  
  text(info, 10, 10);
  
  // Instructions
  textSize(12);
  text('Click on the beam to add elements', 10, 30);
  text('Drag elements to reposition', 10, 45);
  
  // Debug info
  text('Forces: ' + forces.length + ', Supports: ' + supports.length, 10, 60);
  
  pop();
}

function mousePressed() {
  // Check if clicking on an existing element to drag
  let clickedElement = getElementAtPosition(mouseX, mouseY);
  
  if (clickedElement) {
    draggedElement = clickedElement;
    isDragging = true;
  } else if (selectedTool && isOnBeam(mouseX, mouseY)) {
    // Add new element
    addElement(mouseX, mouseY);
  }
}

function mouseDragged() {
  if (isDragging && draggedElement) {
    // Update element position
    if (draggedElement.x !== undefined) {
      draggedElement.x = constrain(mouseX, beam.x, beam.x + beam.length);
    }
    if (draggedElement.startX !== undefined) {
      let width = draggedElement.endX - draggedElement.startX;
      draggedElement.startX = constrain(mouseX - width/2, beam.x, beam.x + beam.length - width);
      draggedElement.endX = draggedElement.startX + width;
    }
    
    calculateReactions();
  }
}

function mouseReleased() {
  isDragging = false;
  draggedElement = null;
}

// Touch event handlers
function touchStarted() {
  if (touches.length > 0) {
    lastTouchX = touches[0].x;
    lastTouchY = touches[0].y;
    
    // Simulate mouse press
    let clickedElement = getElementAtPosition(lastTouchX, lastTouchY);
    
    if (clickedElement) {
      draggedElement = clickedElement;
      isDragging = true;
    } else if (selectedTool && isOnBeam(lastTouchX, lastTouchY)) {
      addElement(lastTouchX, lastTouchY);
    }
  }
  return false; // Prevent default
}

function touchMoved() {
  if (touches.length > 0) {
    let touchX = touches[0].x;
    let touchY = touches[0].y;
    
    if (isDragging && draggedElement) {
      // Update element position
      if (draggedElement.x !== undefined) {
        draggedElement.x = constrain(touchX, beam.x, beam.x + beam.length);
      }
      if (draggedElement.startX !== undefined) {
        let width = draggedElement.endX - draggedElement.startX;
        draggedElement.startX = constrain(touchX - width/2, beam.x, beam.x + beam.length - width);
        draggedElement.endX = draggedElement.startX + width;
      }
      
      calculateReactions();
    }
    
    lastTouchX = touchX;
    lastTouchY = touchY;
  }
  return false; // Prevent default
}

function touchEnded() {
  isDragging = false;
  draggedElement = null;
  return false; // Prevent default
}

function isOnBeam(x, y) {
  return x >= beam.x && x <= beam.x + beam.length &&
         y >= beam.y - 50 && y <= beam.y + 50;
}

function getElementAtPosition(x, y) {
  // Check forces
  for (let force of forces) {
    if (force.type === 'distributed') {
      if (x >= force.startX - 10 && x <= force.endX + 10 &&
          y >= beam.y - 60 && y <= beam.y + 20) {
        return force;
      }
    } else if (force.x) {
      if (dist(x, y, force.x, beam.y) < 30) {
        return force;
      }
    }
  }
  
  // Check supports
  for (let support of supports) {
    if (dist(x, y, support.x, beam.y + beam.height/2) < 30) {
      return support;
    }
  }
  
  return null;
}

function addElement(x, y) {
  if (!selectedTool) return;
  
  let parts = selectedTool.split('-');
  let category = parts[0];
  let type = parts[1];
  
  if (category === 'load') {
    let newForce = {
      type: type,
      x: constrain(x, beam.x, beam.x + beam.length),
      magnitude: 10,
      direction: 'down'
    };
    
    if (type === 'distributed') {
      newForce.startX = constrain(x - 50, beam.x, beam.x + beam.length - 100);
      newForce.endX = newForce.startX + 100;
      newForce.magnitude = 5;
      delete newForce.x;
    } else if (type === 'moment') {
      newForce.direction = 'ccw';
      newForce.magnitude = 15;
    }
    
    forces.push(newForce);
  } else if (category === 'support') {
    // Remove existing support at this location
    supports = supports.filter(s => dist(s.x, 0, x, 0) > 50);
    
    let newSupport = {
      type: type,
      x: constrain(x, beam.x, beam.x + beam.length)
    };
    
    supports.push(newSupport);
  }
  
  calculateReactions();
}

function clearDiagram() {
  forces = [];
  supports = [];
  reactions = [];
  console.log('Diagram cleared');
}

function loadExample1() {
  console.log('Loading Example 1');
  clearDiagram();
  
  // Simply supported beam with point load and UDL
  supports = [
    {type: 'pin', x: beam.x + 50, label: 'A'},
    {type: 'roller', x: beam.x + beam.length - 50, label: 'B'}
  ];
  
  forces = [
    {type: 'point', x: beam.x + 200, magnitude: 20, direction: 'down'},
    {type: 'distributed', startX: beam.x + 350, endX: beam.x + 500, magnitude: 8}
  ];
  
  console.log('Example 1 loaded - Forces:', forces.length, 'Supports:', supports.length);
  calculateReactions();
}

function loadExample2() {
  console.log('Loading Example 2');
  clearDiagram();
  
  // Cantilever beam
  supports = [
    {type: 'fixed', x: beam.x + 50, label: 'A'}
  ];
  
  forces = [
    {type: 'point', x: beam.x + beam.length - 100, magnitude: 15, direction: 'down'},
    {type: 'moment', x: beam.x + 300, magnitude: 20, direction: 'cw'}
  ];
  
  console.log('Example 2 loaded - Forces:', forces.length, 'Supports:', supports.length);
  calculateReactions();
}

function loadExample3() {
  console.log('Loading Example 3');
  clearDiagram();
  
  // Overhanging beam
  supports = [
    {type: 'pin', x: beam.x + 150, label: 'A'},
    {type: 'roller', x: beam.x + 450, label: 'B'}
  ];
  
  forces = [
    {type: 'point', x: beam.x + 50, magnitude: 10, direction: 'down'},
    {type: 'point', x: beam.x + beam.length - 50, magnitude: 12, direction: 'down'},
    {type: 'distributed', startX: beam.x + 200, endX: beam.x + 400, magnitude: 6}
  ];
  
  console.log('Example 3 loaded - Forces:', forces.length, 'Supports:', supports.length);
  calculateReactions();
}

function calculateReactions() {
  reactions = [];
  
  if (!showReactions) return;
  
  // Simple reaction calculation for demonstration
  // (In a real application, this would solve equilibrium equations)
  
  // For simply supported beam (2 supports)
  if (supports.length === 2 && 
      supports.some(s => s.type === 'pin') && 
      supports.some(s => s.type === 'roller')) {
    
    let pinSupport = supports.find(s => s.type === 'pin');
    let rollerSupport = supports.find(s => s.type === 'roller');
    
    // Calculate total downward force
    let totalForce = 0;
    let totalMoment = 0; // About pin support
    
    for (let force of forces) {
      if (force.type === 'point' && force.x) {
        totalForce += force.magnitude;
        totalMoment += force.magnitude * (force.x - pinSupport.x);
      } else if (force.type === 'distributed') {
        let distributedForce = force.magnitude * (force.endX - force.startX) / 100;
        let centroid = (force.startX + force.endX) / 2;
        totalForce += distributedForce;
        totalMoment += distributedForce * (centroid - pinSupport.x);
      }
    }
    
    // Calculate reactions (simplified)
    let rollerReaction = totalMoment / (rollerSupport.x - pinSupport.x);
    let pinReaction = totalForce - rollerReaction;
    
    reactions.push({
      type: 'force',
      x: pinSupport.x,
      magnitude: pinReaction,
      direction: 'vertical'
    });
    
    reactions.push({
      type: 'force',
      x: rollerSupport.x,
      magnitude: rollerReaction,
      direction: 'vertical'
    });
  }
  
  // For cantilever (1 fixed support)
  else if (supports.length === 1 && supports[0].type === 'fixed') {
    let fixedSupport = supports[0];
    
    // Calculate total force and moment
    let totalForce = 0;
    let totalMoment = 0;
    
    for (let force of forces) {
      if (force.type === 'point' && force.x) {
        totalForce += force.magnitude;
        totalMoment += force.magnitude * abs(force.x - fixedSupport.x) / 100;
      } else if (force.type === 'moment') {
        totalMoment += force.magnitude * (force.direction === 'cw' ? 1 : -1);
      } else if (force.type === 'distributed') {
        let distributedForce = force.magnitude * (force.endX - force.startX) / 100;
        let centroid = (force.startX + force.endX) / 2;
        totalForce += distributedForce;
        totalMoment += distributedForce * abs(centroid - fixedSupport.x) / 100;
      }
    }
    
    reactions.push({
      type: 'force',
      x: fixedSupport.x,
      magnitude: totalForce,
      direction: 'vertical'
    });
    
    reactions.push({
      type: 'moment',
      x: fixedSupport.x,
      magnitude: totalMoment
    });
  }
}