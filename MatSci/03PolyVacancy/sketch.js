// Debug flag (hard-coded)
const DEBUG = false;

let nucleationSites = [];
let atoms = [];
let colors = [];
let currentStep = 0;
let animationStarted = false;
let solidificationComplete = false;
let atomRadius;
let atomDiameter;
let annealingButton;
let annealing = false;
let gridSize;
let grid = [];
let givenDistance;
let lastToggleTime = 0;

function setup() {
  let size = min(windowWidth, windowHeight, 600);
  createCanvas(size, size);
  
  // Adjust atom size based on canvas size
  atomRadius = max(3, floor(size / 85));
  atomDiameter = atomRadius * 2;
  gridSize = atomRadius * 2;
  givenDistance = 5 * atomRadius;
  
  let startButton = select('#startButton');
  startButton.mousePressed(startAnimation);
  startButton.touchEnded(startAnimation);
  
  let resetButton = select('#resetButton');
  resetButton.mousePressed(resetSimulation);
  resetButton.touchEnded(resetSimulation);
  
  annealingButton = select('#annealingButton');
  annealingButton.mousePressed(toggleAnnealing);
  annealingButton.touchEnded(toggleAnnealing);
  
  resetSimulation();
}

function draw() {
  background(220);
  
  for (let atom of atoms) {
    fill(atom.color);
    circle(atom.x, atom.y, atomDiameter);
  }
  
  if (animationStarted && !solidificationComplete) {
    if (frameCount % 10 === 0) {
      growCrystals();
    }
  } else if (solidificationComplete && annealing) {
    moveAtoms();
  }
}

function windowResized() {
  let size = min(windowWidth, windowHeight, 600);
  resizeCanvas(size, size);
  
  // Recalculate atom size and related variables
  atomRadius = max(3, floor(size / 85));
  atomDiameter = atomRadius * 2;
  gridSize = atomRadius * 2;
  givenDistance = 5 * atomRadius;
  
  // Reset the simulation to adjust for new size
  resetSimulation();
}

function resetSimulation() {
  nucleationSites = [];
  atoms = [];
  colors = [];
  currentStep = 0;
  animationStarted = false;
  solidificationComplete = false;
  annealing = false;
  updateAnnealingButton();
  initializeGrid();
  
  for (let i = 0; i < 5; i++) {
    colors.push(color(random(255), random(255), random(255)));
  }
  
  for (let i = 0; i < 5; i++) {
    let x, y, angle;
    do {
      x = random(atomRadius, width - atomRadius);
      y = random(atomRadius, height - atomRadius);
    } while (checkOverlap(x, y));
    
    angle = random(TWO_PI);
    nucleationSites.push({ x, y, color: colors[i], angle: angle });
    addAtomToGrid({ x, y, color: colors[i] });
  }
}

function startAnimation() {
  if (!animationStarted) {
    animationStarted = true;
    currentStep = 0;
  }
}

function toggleAnnealing() {
  let currentTime = millis();
  if (currentTime - lastToggleTime > 300) {  // 300ms debounce
    annealing = !annealing;
    updateAnnealingButton();
    lastToggleTime = currentTime;
  }
  return false;  // Prevent default behavior
}

function updateAnnealingButton() {
  annealingButton.html(`Annealing: ${annealing ? 'ON' : 'OFF'}`);
  if (DEBUG) console.log(`Annealing toggled: ${annealing}`);
}

function growCrystals() {
  currentStep++;
  let newAtoms = [];
  
  for (let site of nucleationSites) {
    let layerAtoms = generateLayerAtoms(site, currentStep);
    newAtoms = newAtoms.concat(layerAtoms);
  }
  
  shuffleArray(newAtoms);
  
  let atomsAdded = 0;
  for (let atom of newAtoms) {
    if (!checkOverlap(atom.x, atom.y) && !isNearDifferentGrain(atom)) {
      addAtomToGrid(atom);
      atomsAdded++;
    }
  }
  
  if (atomsAdded === 0) {
    solidificationComplete = true;
  }
}

function generateLayerAtoms(site, layer) {
  let layerAtoms = [];
  
  for (let i = -layer; i <= layer; i++) {
    for (let j = -layer; j <= layer; j++) {
      if (Math.abs(i) === layer || Math.abs(j) === layer) {
        let localX = i * atomDiameter;
        let localY = j * atomDiameter;
        
        let globalX = localX * cos(site.angle) - localY * sin(site.angle) + site.x;
        let globalY = localX * sin(site.angle) + localY * cos(site.angle) + site.y;
        
        layerAtoms.push({ x: globalX, y: globalY, color: site.color });
      }
    }
  }
  
  return layerAtoms;
}

function initializeGrid() {
  grid = new Array(Math.ceil(width / gridSize));
  for (let i = 0; i < grid.length; i++) {
    grid[i] = new Array(Math.ceil(height / gridSize)).fill(null).map(() => []);
  }
}

function addAtomToGrid(atom) {
  let gridX = Math.floor(atom.x / gridSize);
  let gridY = Math.floor(atom.y / gridSize);
  grid[gridX][gridY].push(atom);
  atoms.push(atom);
}

function removeAtomFromGrid(atom) {
  let gridX = Math.floor(atom.x / gridSize);
  let gridY = Math.floor(atom.y / gridSize);
  grid[gridX][gridY] = grid[gridX][gridY].filter(a => a !== atom);
  atoms = atoms.filter(a => a !== atom);
}

function checkOverlap(x, y) {
  if (x < atomRadius || x > width - atomRadius || y < atomRadius || y > height - atomRadius) {
    return true;
  }
  
  let gridX = Math.floor(x / gridSize);
  let gridY = Math.floor(y / gridSize);
  
  for (let i = Math.max(0, gridX - 1); i <= Math.min(grid.length - 1, gridX + 1); i++) {
    for (let j = Math.max(0, gridY - 1); j <= Math.min(grid[0].length - 1, gridY + 1); j++) {
      for (let atom of grid[i][j]) {
        if (dist(x, y, atom.x, atom.y) < atomDiameter - 0.5) {
          return true;
        }
      }
    }
  }
  return false;
}

function isNearDifferentGrain(atom) {
  let gridX = Math.floor(atom.x / gridSize);
  let gridY = Math.floor(atom.y / gridSize);
  
  for (let i = Math.max(0, gridX - 1); i <= Math.min(grid.length - 1, gridX + 1); i++) {
    for (let j = Math.max(0, gridY - 1); j <= Math.min(grid[0].length - 1, gridY + 1); j++) {
      for (let neighborAtom of grid[i][j]) {
        if (neighborAtom.color !== atom.color &&
            dist(atom.x, atom.y, neighborAtom.x, neighborAtom.y) < givenDistance) {
          return true;
        }
      }
    }
  }
  return false;
}

function isAtBoundary(atom) {
  let gridX = Math.floor(atom.x / gridSize);
  let gridY = Math.floor(atom.y / gridSize);
  
  let searchRadius = Math.ceil(1.5 * givenDistance / gridSize);
  
  for (let i = Math.max(0, gridX - searchRadius); i <= Math.min(grid.length - 1, gridX + searchRadius); i++) {
    for (let j = Math.max(0, gridY - searchRadius); j <= Math.min(grid[0].length - 1, gridY + searchRadius); j++) {
      for (let neighborAtom of grid[i][j]) {
        if (neighborAtom !== atom && 
            neighborAtom.color !== atom.color &&
            dist(atom.x, atom.y, neighborAtom.x, neighborAtom.y) <= 1.5 * givenDistance) {
          return true;
        }
      }
    }
  }
  return false;
}

function findAdjacentGrid(atom) {
  let gridX = Math.floor(atom.x / gridSize);
  let gridY = Math.floor(atom.y / gridSize);
  
  let searchRadius = Math.ceil(1.5 * givenDistance / gridSize);
  
  let possibleGrids = [];
  
  for (let i = Math.max(0, gridX - searchRadius); i <= Math.min(grid.length - 1, gridX + searchRadius); i++) {
    for (let j = Math.max(0, gridY - searchRadius); j <= Math.min(grid[0].length - 1, gridY + searchRadius); j++) {
      if (grid[i][j].length > 0 && grid[i][j][0].color !== atom.color) {
        possibleGrids.push({x: i, y: j, color: grid[i][j][0].color});
      }
    }
  }
  
  if (possibleGrids.length > 0) {
    return random(possibleGrids);
  }
  
  return null;
}

function findClosestPositionInGrid(gridX, gridY, atom) {
  let centerX = (gridX + 0.5) * gridSize;
  let centerY = (gridY + 0.5) * gridSize;
  let radius = 0;
  let closestPosition = null;
  let closestDistance = Infinity;
  
  while (radius < gridSize * 1.5) {
    for (let angle = 0; angle < TWO_PI; angle += PI / 8) {
      let x = centerX + radius * cos(angle);
      let y = centerY + radius * sin(angle);
      
      if (!checkOverlap(x, y)) {
        let distance = dist(x, y, atom.x, atom.y);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestPosition = { x, y };
        }
      }
    }
    radius += atomRadius / 2;
  }
  
  return closestPosition;
}

function moveAtoms() {
  let boundaryAtoms = atoms.filter(isAtBoundary);
  
  if (boundaryAtoms.length === 0) {
    if (DEBUG) console.log("No boundary atoms found");
    return;
  }
  
  let selectedAtom = random(boundaryAtoms);
  
  let adjacentGrid = findAdjacentGrid(selectedAtom);
  
  if (adjacentGrid) {
    removeAtomFromGrid(selectedAtom);
    
    let newPosition = findClosestPositionInGrid(adjacentGrid.x, adjacentGrid.y, selectedAtom);
    
    if (newPosition) {
      selectedAtom.x = newPosition.x;
      selectedAtom.y = newPosition.y;
      selectedAtom.color = adjacentGrid.color;
      
      addAtomToGrid(selectedAtom);
      
      if (DEBUG) console.log("Atom moved to adjacent grid");
    } else {
      addAtomToGrid(selectedAtom);
      if (DEBUG) console.log("No available position in adjacent grid, atom not moved");
    }
  } else {
    if (DEBUG) console.log("No adjacent grid found for the selected atom");
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}