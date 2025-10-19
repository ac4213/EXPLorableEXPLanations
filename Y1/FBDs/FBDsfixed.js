// Free Body Diagram Interactive Simulator (clean v3 - colors + draggable labels)
// Variables for the beam and canvas
let beam;
let canvasWidth = 800;
let canvasHeight = 600;
let gridSize = 20;

// Arrays to store forces and supports
let forces = [];
let supports = [];
let reactions = [];

// Status messaging
let statusMessage = '';
let statusLevel = 'ok'; // 'ok' | 'warn' | 'error'

// Unit scale (pixels per metre) for moment calculations
const PX_PER_M = 100;

// UI elements
let clearButton, exampleButton1, exampleButton2, exampleButton3;
let showReactions = true;
let selectedTool = null;
let draggedElement = null;
let draggedLabelKey = null; // key for the label being dragged
let isDragging = false;

// Colours (as requested)
let colorPointLoad;       // BLUE
let colorMoment;          // GREEN
let colorDistributed;     // ORANGE
let colorReaction;        // RED
let beamColour;
let gridColour;
let supportColour;

// Touch support
let lastTouchX = 0;
let lastTouchY = 0;

// Label offsets: map key -> {dx, dy}
// Keys for forces: `F:<id>`
// Keys for reactions: `R:<type>:<x>` (x rounded)
let labelOffsets = {};
let nextId = 1;

// ------------------------ Setup & UI ------------------------
function setup() {
  let cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent('sketch-holder');
  
  // Colours
  beamColour = color(51, 51, 51);
  supportColour = color(0, 102, 204);
  gridColour = color(230, 230, 230);
  colorPointLoad = color(0, 90, 200);       // blue
  colorMoment = color(0, 150, 0);           // green
  colorDistributed = color(255, 140, 0);    // orange
  colorReaction = color(200, 0, 0);         // red
  
  // Beam
  beam = { x: 30, y: height/2, length: 600, height: 20 };
  
  createButtons();
  setTimeout(setupControls, 100);
  setTimeout(loadExample1, 200);
}

function createButtons() {
  clearButton = createButton('CLEAR');
  clearButton.parent('button-container');
  clearButton.mousePressed(clearDiagram);
  
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

function setStatus(message, level='ok') { statusMessage = message; statusLevel = level; }
function clearStatus() { setStatus('', 'ok'); }

function setupControls() {
  let loadSelect = document.getElementById('load-select');
  let supportSelect = document.getElementById('support-select');
  let reactionsCheckbox = document.getElementById('show-reactions');
  if (loadSelect) {
    loadSelect.addEventListener('change', function() { selectedTool = 'load-' + loadSelect.value; });
  }
  if (supportSelect) {
    supportSelect.addEventListener('change', function() { selectedTool = 'support-' + supportSelect.value; });
  }
  if (reactionsCheckbox) {
    reactionsCheckbox.addEventListener('change', function() { showReactions = reactionsCheckbox.checked; calculateReactions(); });
  }
}

// ------------------------ Draw Loop ------------------------
function draw() {
  background(255, 251, 235);
  drawGrid();
  drawCoordinateSystem();
  drawBeam();
  for (let s of supports) drawSupport(s);
  for (let f of forces) drawForce(f);
  if (showReactions && reactions.length) for (let r of reactions) drawReaction(r);
  drawDimensions();
  drawInfoText();
}

// ------------------------ Drawing helpers ------------------------
function drawGrid() {
  push();
  stroke(gridColour); strokeWeight(0.5);
  for (let x = 0; x <= width; x += gridSize) line(x, 0, x, height);
  for (let y = 0; y <= height; y += gridSize) line(0, y, width, y);
  pop();
}

function drawCoordinateSystem() {
  push();
  stroke(100); strokeWeight(1); fill(100);
  line(50, height - 50, 150, height - 50);
  push(); translate(150, height - 50); rotate(0); triangle(0,0,-8,-4,-8,4); pop();
  line(50, height - 50, 50, height - 150);
  push(); translate(50, height - 150); rotate(-PI/2); triangle(0,0,-8,-4,-8,4); pop();
  fill(0); noStroke(); textAlign(CENTER, TOP); text('x', 150, height - 45);
  textAlign(LEFT, CENTER); text('y', 55, height - 150);
  pop();
}

function drawBeam() {
  push();
  fill(beamColour); stroke(0); strokeWeight(2);
  rect(beam.x, beam.y - beam.height/2, beam.length, beam.height);
  stroke(150); strokeWeight(1);
  drawDashedLine(beam.x, beam.y, beam.x + beam.length, beam.y, 5, 5);
  pop();
}

function drawDashedLine(x1,y1,x2,y2,dash, gap) {
  let d = dist(x1,y1,x2,y2);
  let n = d / (dash+gap);
  let dx = (x2-x1)/d, dy = (y2-y1)/d;
  for (let i=0;i<n;i++) {
    let sx = x1 + (i*(dash+gap))*dx;
    let sy = y1 + (i*(dash+gap))*dy;
    line(sx,sy, sx+dash*dx, sy+dash*dy);
  }
}

function drawSupport(support) {
  push();
  stroke(supportColour); strokeWeight(2); fill(255);
  let x = support.x, y = beam.y + beam.height/2;
  switch (support.type) {
    case 'roller': noFill(); ellipse(x, y+15, 30, 30); line(x-20,y+30,x+20,y+30); break;
    case 'pin':    noFill(); triangle(x-15,y+30, x+15,y+30, x,y); line(x-20,y+30,x+20,y+30); break;
    case 'fixed':  fill(supportColour); rect(x-5, y, 10, 30); stroke(0); for (let i=0;i<5;i++) line(x-10-i*3,y+30+i*3,x+10+i*3,y+30+i*3); break;
    case 'collar': noFill(); rect(x-15,y-10,30,20); ellipse(x,y,8,8); line(x-25,y-10,x-25,y+10); line(x+25,y-10,x+25,y+10); break;
  }
  fill(0); noStroke(); textAlign(CENTER, TOP); text(support.label || support.type, x, y + 40);
  pop();
}

// ---- Label helpers ----
function labelKeyForForce(f){ return 'F:' + (f.id || 'u'); }
function labelKeyForReaction(r){ return 'R:' + r.type + ':' + Math.round(r.x); }
function getLabelOffset(key){ return labelOffsets[key] || {dx: 0, dy: 0}; }
function setLabelOffset(key, dx, dy){ labelOffsets[key] = {dx, dy}; }

function drawWithLabel(baseX, baseY, textStr, col, key, align='CENTER', vAlign='BOTTOM') {
  // text color same as element color
  push();
  noStroke();
  fill(col);
  textAlign(align, vAlign);
  const off = getLabelOffset(key);
  const lx = baseX + off.dx;
  const ly = baseY + off.dy;
  text(textStr, lx, ly);
  pop();
  // return bbox for hit testing
  push();
  textSize(12);
  let tw = textWidth(textStr);
  pop();
  let w = max(30, tw + 10), h = 18;
  return {x: (align==='CENTER'? lx - w/2 : lx), y: (vAlign==='BOTTOM'? ly - h : ly - h/2), w, h, cx: lx, cy: ly};
}

function hitTestLabel(mx, my, bbox) {
  return mx >= bbox.x && mx <= bbox.x + bbox.w && my >= bbox.y && my <= bbox.y + bbox.h;
}

// ---- Loads & reactions ----
function drawForce(force) {
  push();
  let x = force.x || 0;
  let y = beam.y;

  const sign = Math.sign(force.magnitude || 0) || 1;
  const mag = Math.abs(force.magnitude || 0);
  const unit = (force.type==='moment' ? 'kN·m' : (force.type==='distributed' ? 'kN/m' : 'kN'));
  const baseLabel = (force.label ? (force.label + ' = ') : '');
  const labelText = baseLabel + (sign<0?'-':'') + mag + ' ' + unit;

  // Ensure id for label tracking
  if (!force.id) force.id = nextId++;

  switch (force.type) {
    case 'point': {
      stroke(colorPointLoad); fill(colorPointLoad); strokeWeight(3);
      const downward = (force.direction === 'down');
      const drawDown = (sign > 0 ? downward : !downward);
      const len = mag * 2;
      const anchorY = y - beam.height/2;
      const startY = anchorY;
      const endY   = drawDown ? (anchorY - len) : (anchorY + len);
      line(x, startY, x, endY);
      push();
      translate(x, anchorY);
      // FIX: down => PI/2 (arrow points down), up => -PI/2
      rotate(drawDown ? PI/2 : -PI/2);
      noStroke();
      triangle(0,0,-8,-4,-8,4);
      pop();
      // Label (blue)
      let key = labelKeyForForce(force);
      drawWithLabel(x, min(startY, endY) - 6, labelText, colorPointLoad, key, 'CENTER', 'BOTTOM');
      break;
    }
    case 'moment': {
      stroke(colorMoment); strokeWeight(2); noFill();
      const radius = 25;
      const ccw = (force.direction === 'ccw');
      const ccwEffective = (sign > 0 ? ccw : !ccw);
      arc(x, y, radius * 2, radius * 2, -PI/2, PI);
      noStroke(); push();
      const arrowAngle = ccwEffective ? -PI/4 : (3*PI/4);
      const ax = x + radius * Math.cos(arrowAngle);
      const ay = y + radius * Math.sin(arrowAngle);
      translate(ax, ay);
      rotate(arrowAngle + (ccwEffective ? -PI/2 : PI/2));
      triangle(0,0,-6,-3,-6,3);
      pop();
      let key = labelKeyForForce(force);
      drawWithLabel(x, y - 40, labelText + ' (' + (ccwEffective ? 'CCW' : 'CW') + ')', colorMoment, key, 'CENTER', 'BOTTOM');
      break;
    }
    case 'distributed': {
      stroke(colorDistributed); fill(colorDistributed); strokeWeight(2);
      const startX = force.startX || beam.x;
      const endX   = force.endX   || (beam.x + 100);
      const h = mag * 3;
      const up = (sign < 0);
      for (let px = startX; px <= endX; px += 10) {
        line(px, up ? (y + h) : (y - h), px, y - beam.height/2);
        push(); translate(px, y - beam.height/2); rotate(up ? -PI/2 : PI/2); noStroke(); triangle(0,0,-5,-2,-5,2); pop();
      }
      line(startX, up ? (y + h) : (y - h), endX, up ? (y + h) : (y - h));
      let key = labelKeyForForce(force);
      drawWithLabel((startX + endX)/2, (up ? (y + h) : (y - h)) - 5, labelText, colorDistributed, key, 'CENTER', 'BOTTOM');
      break;
    }
    case 'weight': {
      stroke(colorPointLoad); fill(colorPointLoad); strokeWeight(3);
      push(); fill(200); stroke(0); strokeWeight(1); rect(x-20, y-50, 40, 20); pop();
      const len = mag * 2;
      const top = y - beam.height/2;
      const startY = top;
      const endY = top - len;
      line(x, startY, x, endY);
      push(); translate(x, endY); rotate(-PI/2); noStroke(); triangle(0,0,-8,-4,-8,4); pop();
      let key = labelKeyForForce(force);
      drawWithLabel(x, endY - 6, baseLabel + (sign<0?'-':'') + mag + ' kN', colorPointLoad, key, 'CENTER', 'BOTTOM');
      break;
    }
  }
  pop();
}

function drawReaction(reaction) {
  push();
  stroke(colorReaction); fill(colorReaction); strokeWeight(3);
  let x = reaction.x;
  let y = beam.y + beam.height/2;

  if (reaction.type === 'force') {
    const sign = Math.sign(reaction.magnitude || 0) || 1;
    const mag = Math.abs(reaction.magnitude || 0);
    const len = mag * 2;
    const startY = y + 35;
    const endY = startY - (sign > 0 ? len : -len);
    line(x, startY, x, endY);
    push(); translate(x, endY); rotate(sign > 0 ? -PI/2 : PI/2); noStroke(); triangle(0,0,-8,-4,-8,4); pop();
    noStroke();
    const name = reaction.label || 'R';
    let key = labelKeyForReaction(reaction);
    drawWithLabel(x, (startY + endY)/2, name + ' = ' + (sign < 0 ? '-' : '') + mag.toFixed(2) + ' kN', colorReaction, key, 'CENTER', 'CENTER');
  } else if (reaction.type === 'moment') {
    stroke(colorReaction); strokeWeight(2); noFill();
    const radius = 20;
    const sign = Math.sign(reaction.magnitude || 0) || 1;
    arc(x, y, radius * 2, radius * 2, 0, TWO_PI * 0.75);
    noStroke(); push();
    const ccw = sign > 0;
    const arrowAngle = ccw ? PI * 0.75 : 0;
    const ax = x + radius * Math.cos(arrowAngle);
    const ay = y + radius * Math.sin(arrowAngle);
    translate(ax, ay);
    rotate(arrowAngle + (ccw ? PI/2 : -PI/2));
    triangle(0,0,-6,-3,-6,3);
    pop();
    const sense = (sign > 0 ? 'CCW' : 'CW');
    const name = reaction.label || 'M';
    let key = labelKeyForReaction(reaction);
    drawWithLabel(x, y + radius + 12, name + ' = ' + Math.abs(reaction.magnitude).toFixed(2) + ' kN·m (' + sense + ')', colorReaction, key, 'CENTER', 'TOP');
  }
  pop();
}

function drawDimensions() {
  push();
  stroke(100); strokeWeight(1); fill(0); textAlign(CENTER, TOP);
  let dimY = beam.y + beam.height/2 + 80;
  line(beam.x, dimY - 5, beam.x, dimY + 5);
  line(beam.x + beam.length, dimY - 5, beam.x + beam.length, dimY + 5);
  drawDashedLine(beam.x, dimY, beam.x + beam.length, dimY, 2, 2);
  text((beam.length/100).toFixed(1) + ' m', beam.x + beam.length/2, dimY + 5);
  pop();
}

function drawInfoText() {
  push();
  fill(0); noStroke(); textAlign(LEFT, TOP); textSize(12);
  text('Click on the beam to add elements', 10, 30);
  text('Drag elements to reposition', 10, 45);
  text('Drag labels to reposition labels', 10, 60);
  if (statusMessage) {
    push();
    let bg = statusLevel === 'error' ? color(255, 220, 220) : (statusLevel === 'warn' ? color(255, 245, 200) : color(220, 255, 220));
    let fg = statusLevel === 'error' ? color(160, 0, 0) : (statusLevel === 'warn' ? color(120, 90, 0) : color(0, 120, 0));
    noStroke(); fill(bg); rect(10, 80, width - 20, 28, 6);
    fill(fg); textAlign(LEFT, CENTER); text(statusMessage, 16, 94);
    pop();
  }
  pop();
}

// ------------------------ Interaction ------------------------
function mousePressed() {
  // Priority: label hit test first
  let hit = getLabelKeyAt(mouseX, mouseY);
  if (hit) {
    draggedLabelKey = hit;
    isDragging = true;
    return;
  }
  let clickedElement = getElementAtPosition(mouseX, mouseY);
  if (clickedElement) { draggedElement = clickedElement; isDragging = true; }
  else if (selectedTool && isOnBeam(mouseX, mouseY)) { addElement(mouseX, mouseY); }
}

function mouseDragged() {
  if (!isDragging) return;
  if (draggedLabelKey) {
    // Move label offset by mouse delta from its current anchor
    let off = getLabelOffset(draggedLabelKey);
    // Move by raw delta of mouse movement
    // We don't track prev mouse; just increment by small step based on pmouse
    let dx = mouseX - pmouseX;
    let dy = mouseY - pmouseY;
    setLabelOffset(draggedLabelKey, off.dx + dx, off.dy + dy);
  } else if (draggedElement) {
    if (draggedElement.x !== undefined) draggedElement.x = constrain(mouseX, beam.x, beam.x + beam.length);
    if (draggedElement.startX !== undefined) {
      let width = draggedElement.endX - draggedElement.startX;
      draggedElement.startX = constrain(mouseX - width/2, beam.x, beam.x + beam.length - width);
      draggedElement.endX = draggedElement.startX + width;
    }
    calculateReactions();
  }
}

function mouseReleased() { isDragging = false; draggedElement = null; draggedLabelKey = null; }

// Touch -> treat labels similarly (simple support)
function touchStarted() {
  if (touches.length > 0) {
    lastTouchX = touches[0].x; lastTouchY = touches[0].y;
    let hit = getLabelKeyAt(lastTouchX, lastTouchY);
    if (hit) { draggedLabelKey = hit; isDragging = true; return false; }
    let clicked = getElementAtPosition(lastTouchX, lastTouchY);
    if (clicked) { draggedElement = clicked; isDragging = true; }
    else if (selectedTool && isOnBeam(lastTouchX, lastTouchY)) { addElement(lastTouchX, lastTouchY); }
  }
  return false;
}
function touchMoved() {
  if (touches.length > 0) {
    let tx = touches[0].x, ty = touches[0].y;
    if (draggedLabelKey) {
      let off = getLabelOffset(draggedLabelKey);
      setLabelOffset(draggedLabelKey, off.dx + (tx - lastTouchX), off.dy + (ty - lastTouchY));
    } else if (isDragging && draggedElement) {
      if (draggedElement.x !== undefined) draggedElement.x = constrain(tx, beam.x, beam.x + beam.length);
      if (draggedElement.startX !== undefined) {
        let w = draggedElement.endX - draggedElement.startX;
        draggedElement.startX = constrain(tx - w/2, beam.x, beam.x + beam.length - w);
        draggedElement.endX = draggedElement.startX + w;
      }
      calculateReactions();
    }
    lastTouchX = tx; lastTouchY = ty;
  }
  return false;
}
function touchEnded() { isDragging = false; draggedElement = null; draggedLabelKey = null; return false; }

// ------------------------ Utilities ------------------------
function isOnBeam(x, y) {
  return x >= beam.x && x <= beam.x + beam.length && y >= beam.y - 50 && y <= beam.y + 50;
}

function getElementAtPosition(x, y) {
  for (let force of forces) {
    if (force.type === 'distributed') {
      if (x >= force.startX - 10 && x <= force.endX + 10 && y >= beam.y - 60 && y <= beam.y + 20) return force;
    } else if (force.x) {
      if (dist(x, y, force.x, beam.y) < 30) return force;
    }
  }
  for (let support of supports) if (dist(x, y, support.x, beam.y + beam.height/2) < 30) return support;
  return null;
}

// Return the label key under a point (checks all labels' bboxes)
function getLabelKeyAt(mx, my) {
  // Re-create all bboxes by "drawing" with label (but not actually moving)
  // Forces
  for (let f of forces) {
    const sign = Math.sign(f.magnitude || 0) || 1;
    const mag = Math.abs(f.magnitude || 0);
    const unit = (f.type==='moment' ? 'kN·m' : (f.type==='distributed' ? 'kN/m' : 'kN'));
    const baseLabel = (f.label ? (f.label + ' = ') : '');
    const labelText = baseLabel + (sign<0?'-':'') + mag + ' ' + unit;
    if (!f.id) f.id = nextId++;
    let key = labelKeyForForce(f);
    let x = f.x || 0, y = beam.y;
    if (f.type === 'point') {
      const len = mag * 2;
      const anchorY = y - beam.height/2;
      const downward = (f.direction === 'down');
      const drawDown = (sign > 0 ? downward : !downward);
      const endY   = drawDown ? (anchorY - len) : (anchorY + len);
      const bbox = drawWithLabel(x, min(anchorY, endY) - 6, labelText, colorPointLoad, key, 'CENTER', 'BOTTOM');
      if (hitTestLabel(mx,my,bbox)) return key;
    } else if (f.type === 'moment') {
      const bbox = drawWithLabel(x, y - 40, labelText + ' (' + ((sign>0 && f.direction==='ccw') || (sign<0 && f.direction!=='ccw') ? 'CCW':'CW') + ')', colorMoment, key, 'CENTER', 'BOTTOM');
      if (hitTestLabel(mx,my,bbox)) return key;
    } else if (f.type === 'distributed') {
      const startX = f.startX || beam.x, endX = f.endX || (beam.x + 100);
      const h = mag * 3, up = (sign<0);
      const bbox = drawWithLabel((startX+endX)/2, (up ? (y + h) : (y - h)) - 5, labelText, colorDistributed, key, 'CENTER', 'BOTTOM');
      if (hitTestLabel(mx,my,bbox)) return key;
    } else if (f.type === 'weight') {
      const len = mag * 2; const top = y - beam.height/2; const endY = top - len;
      const bbox = drawWithLabel(x, endY - 6, baseLabel + (sign<0?'-':'') + mag + ' kN', colorPointLoad, key, 'CENTER', 'BOTTOM');
      if (hitTestLabel(mx,my,bbox)) return key;
    }
  }
  // Reactions
  if (showReactions) {
    for (let r of reactions) {
      let key = labelKeyForReaction(r);
      let x = r.x, y = beam.y + beam.height/2;
      if (r.type === 'force') {
        const sign = Math.sign(r.magnitude || 0) || 1;
        const mag = Math.abs(r.magnitude || 0);
        const startY = y + 35;
        const len = mag * 2;
        const endY = startY - (sign > 0 ? len : -len);
        const name = r.label || 'R';
        const bbox = drawWithLabel(x, (startY + endY)/2, name + ' = ' + (sign < 0 ? '-' : '') + mag.toFixed(2) + ' kN', colorReaction, key, 'CENTER', 'CENTER');
        if (hitTestLabel(mx,my,bbox)) return key;
      } else if (r.type === 'moment') {
        const sign = Math.sign(r.magnitude || 0) || 1;
        const radius = 20;
        const sense = (sign > 0 ? 'CCW' : 'CW');
        const name = r.label || 'M';
        const bbox = drawWithLabel(x, y + radius + 12, name + ' = ' + Math.abs(r.magnitude).toFixed(2) + ' kN·m (' + sense + ')', colorReaction, key, 'CENTER', 'TOP');
        if (hitTestLabel(mx,my,bbox)) return key;
      }
    }
  }
  return null;
}

// ------------------------ Examples ------------------------
function clearDiagram() {
  forces = []; supports = []; reactions = [];
  labelOffsets = {};
  nextId = 1;
  clearStatus();
}

function loadExample1() {
  clearDiagram();
  supports = [{type: 'pin', x: beam.x, label: 'A'},{type: 'roller', x: beam.x + beam.length, label: 'B'}];
  forces = [{id: nextId++, type: 'point', x: beam.x + 200, magnitude: 30, direction: 'down'}];
  calculateReactions();
}
function loadExample2() {
  clearDiagram();
  supports = [{type: 'fixed', x: beam.x, label: 'A'}];
  forces = [{id: nextId++, type: 'point', x: beam.x + beam.length, magnitude: 50, direction: 'down'}];
  calculateReactions();
}
function loadExample3() {
  clearDiagram();
  supports = [{type: 'pin', x: beam.x, label: 'A'},{type: 'roller', x: beam.x + 400, label: 'B'}];
  forces = [{id: nextId++, type: 'point', x: beam.x + beam.length - 50, magnitude: 30, direction: 'down'}];
  calculateReactions();
}

// ------------------------ Statics Solver ------------------------
function calculateReactions() {
  reactions = [];
  clearStatus();
  if (!showReactions) return;

  const supportUnknowns = supports.reduce((sum, s) => {
    switch (s.type) {
      case 'fixed': return sum + 2;
      case 'collar': return sum + 2;
      case 'pin': return sum + 1;
      case 'roller': return sum + 1;
      default: return sum;
    }
  }, 0);

  const EQNS = 2;
  if (supportUnknowns === 0) { setStatus('Ipostatic: no reactions. The structure is a mechanism (unstable) — add supports.', 'error'); return; }
  if (supportUnknowns < EQNS) { setStatus('Ipostatic: not enough reactions to guarantee equilibrium (mechanism).', 'error'); return; }
  if (supportUnknowns > EQNS) { setStatus('Hyperstatic (indeterminate): more unknown reactions than equilibrium equations — cannot solve with just Σ=0.', 'error'); return; }

  function loadResultants(x0_px) {
    let V = 0, M = 0;
    for (let f of forces) {
      if ((f.type === 'point' || f.type === 'weight') && typeof f.x === 'number') {
        V += f.magnitude;
        const dx_m = (f.x - x0_px) / PX_PER_M;
        M += f.magnitude * dx_m;
      } else if (f.type === 'distributed') {
        const L_m = (f.endX - f.startX) / PX_PER_M;
        const F = f.magnitude * L_m;
        const centroid_px = 0.5 * (f.startX + f.endX);
        const dx_m = (centroid_px - x0_px) / PX_PER_M;
        V += F; M += F * dx_m;
      } else if (f.type === 'moment') {
        const sign = (f.direction === 'ccw') ? 1 : -1;
        M += sign * f.magnitude;
      }
    }
    return { V, M };
  }

  if (supports.length === 1 && (supports[0].type === 'fixed' || supports[0].type === 'collar')) {
    const s = supports[0];
    const { V, M } = loadResultants(s.x);
    const R = V, Mr = -M;
    reactions.push({ type: 'force', x: s.x, magnitude: R, direction: 'vertical', label: (s.label || 'A') + 'y' });
    reactions.push({ type: 'moment', x: s.x, magnitude: Mr, label: 'M' + (s.label || 'A') });
    setStatus('Determinate: single fixed support. Reactions shown.', 'ok');
    return;
  }

  if (supports.length === 2) {
    const sA = supports[0].x <= supports[1].x ? supports[0] : supports[1];
    const sB = (sA === supports[0]) ? supports[1] : supports[0];
    const L_px = sB.x - sA.x;
    if (Math.abs(L_px) < 1e-6) { setStatus('Ipostatic: supports coincide (mechanism). Separate the supports.', 'error'); return; }
    const L_m = L_px / PX_PER_M;
    const { V, M } = loadResultants(sA.x);
    const RB = M / L_m;
    const RA = V - RB;
    reactions.push({ type: 'force', x: sA.x, magnitude: RA, direction: 'vertical', label: (sA.label || 'A') + 'y' });
    reactions.push({ type: 'force', x: sB.x, magnitude: RB, direction: 'vertical', label: (sB.label || 'B') + 'y' });
    setStatus('Determinate: two supports. Reactions shown.', 'ok');
    return;
  }

  setStatus('Configuration not supported in this simplified Year 1 tool.', 'warn');
}
