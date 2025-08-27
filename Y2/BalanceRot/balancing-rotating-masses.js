// Global variables for both simulations
let isInitialized = false;
let singleSimulation = {
    rpm: 0,
    angle: 0,
    isPaused: false,
    unbalance: { mass: 50, radius: 60, angle: 0 },
    balance: { mass: 0, radius: 60, angle: 180, enabled: false },
    totalForce: 0,
    vibrationX: 0,
    vibrationY: 0
};

let multiSimulation = {
    rpm: 0,
    angle: 0,
    isPaused: false,
    unbalances: [
        { mass: 50, radius: 60, position: 25, angle: 0, color: [255, 0, 0] },
        { mass: 30, radius: 80, position: 50, angle: 120, color: [0, 100, 255] },
        { mass: 40, radius: 50, position: 75, angle: 240, color: [255, 150, 0] }
    ],
    balances: [
        { mass: 0, radius: 60, position: 10, angle: 0, enabled: false },
        { mass: 0, radius: 60, position: 90, angle: 0, enabled: false }
    ],
    totalForce: { x: 0, y: 0 },
    totalMoment: 0,
    leftBearing: 0,
    rightBearing: 0,
    vibrationX: 0,
    vibrationY: 0
};

// Shaft parameters
const SHAFT_LENGTH = 400;
const SHAFT_DIAMETER = 30;

// P5.js sketches
let singleSideView, singleFrontView, singleMRDiagram, singleForceDiagram;
let multiSideView, multiFrontView, multiMRDiagram, multiMRLDiagram;

function setup() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSimulations);
    } else {
        initializeSimulations();
    }
}

function initializeSimulations() {
    // Prevent multiple initialization
    if (isInitialized) return;
    isInitialized = true;
    
    // Create single plane simulation views
    createSingleSideView();
    createSingleFrontView();
    createSingleMRDiagram();
    createSingleForceDiagram();
    
    // Create multi-plane simulation views
    createMultiSideView();
    createMultiFrontView();
    createMultiMRDiagram();
    createMultiMRLDiagram();
    
    // Setup control listeners
    setupSingleControls();
    setupMultiControls();
}

// Start setup when script loads
setup();

// ========== SINGLE PLANE SIMULATION ==========

function createSingleSideView() {
    singleSideView = new p5(function(p) {
        p.setup = function() {
            let container = document.getElementById('single-side-view');
            if (container) {
                p.createCanvas(container.offsetWidth - 20, 280).parent('single-side-view');
            }
        };
        
        p.draw = function() {
            p.clear();
            p.background(255);
            p.translate(p.width/2, p.height/2);
            
            // Apply vibration if unbalanced and rotating
            if (!singleSimulation.balance.enabled && singleSimulation.rpm > 0) {
                p.translate(singleSimulation.vibrationX * 5, singleSimulation.vibrationY * 5);
            }
            
            // Draw shaft
            p.fill(180);
            p.stroke(100);
            p.strokeWeight(2);
            let shaftDrawLength = p.width * 0.7;
            p.rect(-shaftDrawLength/2, -SHAFT_DIAMETER/2, shaftDrawLength, SHAFT_DIAMETER);
            
            // Draw bearings
            p.fill(100);
            p.noStroke();
            p.rect(-shaftDrawLength/2 - 20, -SHAFT_DIAMETER, 20, SHAFT_DIAMETER * 2);
            p.rect(shaftDrawLength/2, -SHAFT_DIAMETER, 20, SHAFT_DIAMETER * 2);
            
            // Draw unbalance mass (always at centre for single plane)
            p.fill(255, 0, 0, 200);
            let massSize = p.map(singleSimulation.unbalance.mass, 0, 200, 15, 40);
            p.ellipse(0, 0, massSize, massSize);
            
            // Draw balance mass if enabled
            if (singleSimulation.balance.enabled) {
                p.fill(0, 255, 0, 200);
                let balanceSize = p.map(singleSimulation.balance.mass, 0, 200, 15, 40);
                p.ellipse(0, 0, balanceSize, balanceSize);
            }
            
            // Labels
            p.fill(0);
            p.noStroke();
            p.textAlign(p.CENTER);
            p.textSize(12);
            p.text('Side View', 0, -p.height/2 + 30);
            
            // Show position markers
            p.stroke(150);
            p.strokeWeight(1);
            p.line(-shaftDrawLength/2, SHAFT_DIAMETER/2 + 10, shaftDrawLength/2, SHAFT_DIAMETER/2 + 10);
            p.text('0%', -shaftDrawLength/2, SHAFT_DIAMETER/2 + 25);
            p.text('50%', 0, SHAFT_DIAMETER/2 + 25);
            p.text('100%', shaftDrawLength/2, SHAFT_DIAMETER/2 + 25);
        };
    });
}

function createSingleFrontView() {
    singleFrontView = new p5(function(p) {
        p.setup = function() {
            let container = document.getElementById('single-front-view');
            if (container) {
                p.createCanvas(container.offsetWidth - 20, 280).parent('single-front-view');
            }
        };
        
        p.draw = function() {
            p.clear();
            p.background(255);
            p.translate(p.width/2, p.height/2);
            
            // Update rotation
            if (!singleSimulation.isPaused) {
                updateSingleRotation(p);
            }
            
            // Apply vibration
            if (!singleSimulation.balance.enabled && singleSimulation.rpm > 0) {
                p.translate(singleSimulation.vibrationX * 10, singleSimulation.vibrationY * 10);
            }
            
            // Draw shaft circle
            p.fill(180);
            p.stroke(100);
            p.strokeWeight(2);
            let shaftRadius = SHAFT_DIAMETER * 2;
            p.ellipse(0, 0, shaftRadius * 2, shaftRadius * 2);
            
            // Draw reference line
            p.stroke(0);
            p.strokeWeight(1);
            p.line(shaftRadius, 0, shaftRadius + 20, 0);
            
            // Rotate for animation
            p.push();
            p.rotate(singleSimulation.angle);
            
            // Draw unbalance mass
            p.push();
            p.rotate(p.radians(singleSimulation.unbalance.angle));
            p.translate(singleSimulation.unbalance.radius, 0);
            p.fill(255, 0, 0);
            p.noStroke();
            let massSize = p.map(singleSimulation.unbalance.mass, 0, 200, 10, 30);
            p.ellipse(0, 0, massSize, massSize);
            p.pop();
            
            // Draw connection line to unbalance
            p.stroke(255, 0, 0, 100);
            p.strokeWeight(2);
            p.push();
            p.rotate(p.radians(singleSimulation.unbalance.angle));
            p.line(0, 0, singleSimulation.unbalance.radius, 0);
            p.pop();
            
            // Draw balance mass if enabled
            if (singleSimulation.balance.enabled) {
                p.push();
                p.rotate(p.radians(singleSimulation.balance.angle));
                p.translate(singleSimulation.balance.radius, 0);
                p.fill(0, 255, 0);
                p.noStroke();
                let balanceSize = p.map(singleSimulation.balance.mass, 0, 200, 10, 30);
                p.ellipse(0, 0, balanceSize, balanceSize);
                p.pop();
                
                // Draw connection line to balance
                p.stroke(0, 255, 0, 100);
                p.strokeWeight(2);
                p.push();
                p.rotate(p.radians(singleSimulation.balance.angle));
                p.line(0, 0, singleSimulation.balance.radius, 0);
                p.pop();
            }
            
            p.pop(); // End rotation
            
            // Draw labels
            p.fill(0);
            p.noStroke();
            p.textAlign(p.CENTER);
            p.textSize(12);
            p.text('Front View', 0, -p.height/2 + 30);
            p.text(`Angle: ${(singleSimulation.angle * 180/Math.PI).toFixed(0)}°`, 0, p.height/2 - 20);
        };
    });
}

function createSingleMRDiagram() {
    singleMRDiagram = new p5(function(p) {
        p.setup = function() {
            let container = document.getElementById('single-mr-diagram');
            if (container) {
                p.createCanvas(container.offsetWidth - 20, 280).parent('single-mr-diagram');
            }
        };
        
        p.draw = function() {
            p.clear();
            p.background(255);
            p.translate(p.width/2, p.height/2);
            
            // Draw axes
            p.stroke(200);
            p.strokeWeight(1);
            p.line(-p.width/2 + 30, 0, p.width/2 - 30, 0);
            p.line(0, -p.height/2 + 30, 0, p.height/2 - 30);
            
            // Calculate MR vectors
            let scale = 0.015;
            let vectors = [];
            
            // Unbalance vector
            let mr = singleSimulation.unbalance.mass * singleSimulation.unbalance.radius;
            let vecAngle = singleSimulation.unbalance.angle * Math.PI/180 + singleSimulation.angle;
            vectors.push({
                x: mr * Math.cos(vecAngle) * scale,
                y: mr * Math.sin(vecAngle) * scale,
                color: [255, 0, 0],
                label: 'Unbalance'
            });
            
            // Balance vector if enabled
            if (singleSimulation.balance.enabled) {
                mr = singleSimulation.balance.mass * singleSimulation.balance.radius;
                vecAngle = singleSimulation.balance.angle * Math.PI/180 + singleSimulation.angle;
                vectors.push({
                    x: mr * Math.cos(vecAngle) * scale,
                    y: mr * Math.sin(vecAngle) * scale,
                    color: [0, 255, 0],
                    label: 'Balance'
                });
            }
            
            // Draw vector polygon
            p.stroke(100);
            p.strokeWeight(2);
            p.noFill();
            p.beginShape();
            p.vertex(0, 0);
            let currentX = 0, currentY = 0;
            vectors.forEach(v => {
                currentX += v.x;
                currentY += v.y;
                p.vertex(currentX, currentY);
            });
            p.endShape();
            
            // Draw individual vectors
            currentX = 0;
            currentY = 0;
            vectors.forEach(v => {
                p.stroke(v.color[0], v.color[1], v.color[2]);
                p.strokeWeight(3);
                p.line(currentX, currentY, currentX + v.x, currentY + v.y);
                
                // Draw arrowhead
                p.push();
                p.translate(currentX + v.x, currentY + v.y);
                p.rotate(p.atan2(v.y, v.x));
                p.line(0, 0, -8, -4);
                p.line(0, 0, -8, 4);
                p.pop();
                
                currentX += v.x;
                currentY += v.y;
            });
            
            // Draw resultant (closing vector)
            if (Math.abs(currentX) > 0.1 || Math.abs(currentY) > 0.1) {
                p.stroke(255, 0, 255);
                p.strokeWeight(3);
                p.line(currentX, currentY, 0, 0);
                
                // Arrowhead
                p.push();
                p.translate(0, 0);
                p.rotate(p.atan2(-currentY, -currentX));
                p.line(0, 0, -8, -4);
                p.line(0, 0, -8, 4);
                p.pop();
                
                // Label
                p.fill(255, 0, 255);
                p.noStroke();
                p.textAlign(p.CENTER);
                p.text('Resultant', currentX/2, currentY/2 - 10);
            }
            
            // Title
            p.fill(0);
            p.noStroke();
            p.textAlign(p.CENTER);
            p.textSize(12);
            p.text('MR Polygon (g·mm)', 0, -p.height/2 + 30);
        };
    });
}

function createSingleForceDiagram() {
    singleForceDiagram = new p5(function(p) {
        p.setup = function() {
            let container = document.getElementById('single-force-diagram');
            if (container) {
                p.createCanvas(container.offsetWidth - 20, 280).parent('single-force-diagram');
            }
        };
        
        p.draw = function() {
            p.clear();
            p.background(255);
            p.translate(p.width/2, p.height/2);
            
            // Calculate forces
            updateSingleForces();
            
            // Draw shaft representation
            p.stroke(100);
            p.strokeWeight(3);
            let shaftDrawLength = p.width * 0.7;
            p.line(-shaftDrawLength/2, 0, shaftDrawLength/2, 0);
            
            // Draw bearings
            p.fill(100);
            p.noStroke();
            p.triangle(-shaftDrawLength/2 - 10, 10, -shaftDrawLength/2, 0, -shaftDrawLength/2 + 10, 10);
            p.triangle(shaftDrawLength/2 - 10, 10, shaftDrawLength/2, 0, shaftDrawLength/2 + 10, 10);
            
            // Draw centrifugal force
            if (singleSimulation.totalForce > 0.1) {
                let forceScale = Math.min(50, singleSimulation.totalForce * 2);
                let forceAngle = singleSimulation.unbalance.angle * Math.PI/180 + singleSimulation.angle;
                
                // Force vector at centre
                p.stroke(255, 0, 0);
                p.strokeWeight(3);
                let fx = Math.cos(forceAngle) * forceScale;
                let fy = Math.sin(forceAngle) * forceScale;
                p.line(0, 0, fx, fy);
                
                // Arrowhead
                p.push();
                p.translate(fx, fy);
                p.rotate(p.atan2(fy, fx));
                p.line(0, 0, -8, -4);
                p.line(0, 0, -8, 4);
                p.pop();
                
                // Reaction forces at bearings (simplified - equal and opposite)
                p.stroke(255, 0, 255);
                p.strokeWeight(2);
                p.line(-shaftDrawLength/2, 0, -shaftDrawLength/2 - fx/2, -fy/2);
                p.line(shaftDrawLength/2, 0, shaftDrawLength/2 - fx/2, -fy/2);
            }
            
            // Labels
            p.fill(0);
            p.noStroke();
            p.textAlign(p.CENTER);
            p.textSize(12);
            p.text('Forces & Reactions', 0, -p.height/2 + 30);
            p.text(`Force: ${singleSimulation.totalForce.toFixed(1)} N`, 0, p.height/2 - 20);
        };
    });
}

// ========== MULTI-PLANE SIMULATION ==========

function createMultiSideView() {
    multiSideView = new p5(function(p) {
        p.setup = function() {
            let container = document.getElementById('multi-side-view');
            if (container) {
                p.createCanvas(container.offsetWidth - 20, 280).parent('multi-side-view');
            }
        };
        
        p.draw = function() {
            p.clear();
            p.background(255);
            p.translate(p.width/2, p.height/2);
            
            // Apply vibration if unbalanced
            if (!multiSimulation.balances[0].enabled && !multiSimulation.balances[1].enabled && multiSimulation.rpm > 0) {
                p.translate(multiSimulation.vibrationX * 5, multiSimulation.vibrationY * 5);
            }
            
            // Draw shaft
            p.fill(180);
            p.stroke(100);
            p.strokeWeight(2);
            let shaftDrawLength = p.width * 0.7;
            p.rect(-shaftDrawLength/2, -SHAFT_DIAMETER/2, shaftDrawLength, SHAFT_DIAMETER);
            
            // Draw bearings
            p.fill(100);
            p.noStroke();
            p.rect(-shaftDrawLength/2 - 20, -SHAFT_DIAMETER, 20, SHAFT_DIAMETER * 2);
            p.rect(shaftDrawLength/2, -SHAFT_DIAMETER, 20, SHAFT_DIAMETER * 2);
            
            // Draw unbalance masses
            multiSimulation.unbalances.forEach((mass, i) => {
                if (mass.mass > 0) {
                    let xPos = p.map(mass.position, 0, 100, -shaftDrawLength/2, shaftDrawLength/2);
                    p.fill(mass.color[0], mass.color[1], mass.color[2], 200);
                    let size = p.map(mass.mass, 0, 150, 10, 35);
                    p.ellipse(xPos, 0, size, size);
                    
                    // Label
                    p.fill(0);
                    p.noStroke();
                    p.textAlign(p.CENTER);
                    p.textSize(10);
                    p.text(`M${i+1}`, xPos, -size/2 - 5);
                }
            });
            
            // Draw balance masses if enabled
            multiSimulation.balances.forEach((balance, i) => {
                if (balance.enabled && balance.mass > 0) {
                    let xPos = p.map(balance.position, 0, 100, -shaftDrawLength/2, shaftDrawLength/2);
                    p.fill(0, 255, 0, 200);
                    let size = p.map(balance.mass, 0, 150, 10, 35);
                    p.ellipse(xPos, 0, size, size);
                    
                    // Label
                    p.fill(0);
                    p.noStroke();
                    p.textAlign(p.CENTER);
                    p.textSize(10);
                    p.text(`B${i === 0 ? 'A' : 'B'}`, xPos, -size/2 - 5);
                }
            });
            
            // Position markers
            p.stroke(150);
            p.strokeWeight(1);
            p.line(-shaftDrawLength/2, SHAFT_DIAMETER/2 + 10, shaftDrawLength/2, SHAFT_DIAMETER/2 + 10);
            
            // Mark balance plane positions
            p.stroke(0, 200, 0);
            p.strokeWeight(2);
            let posA = p.map(10, 0, 100, -shaftDrawLength/2, shaftDrawLength/2);
            let posB = p.map(90, 0, 100, -shaftDrawLength/2, shaftDrawLength/2);
            p.line(posA, SHAFT_DIAMETER/2 + 5, posA, SHAFT_DIAMETER/2 + 15);
            p.line(posB, SHAFT_DIAMETER/2 + 5, posB, SHAFT_DIAMETER/2 + 15);
            
            p.fill(0);
            p.noStroke();
            p.textAlign(p.CENTER);
            p.textSize(10);
            p.text('0%', -shaftDrawLength/2, SHAFT_DIAMETER/2 + 25);
            p.text('50%', 0, SHAFT_DIAMETER/2 + 25);
            p.text('100%', shaftDrawLength/2, SHAFT_DIAMETER/2 + 25);
        };
    });
}

function createMultiFrontView() {
    multiFrontView = new p5(function(p) {
        p.setup = function() {
            let container = document.getElementById('multi-front-view');
            if (container) {
                p.createCanvas(container.offsetWidth - 20, 280).parent('multi-front-view');
            }
        };
        
        p.draw = function() {
            p.clear();
            p.background(255);
            p.translate(p.width/2, p.height/2);
            
            // Update rotation
            if (!multiSimulation.isPaused) {
                updateMultiRotation(p);
            }
            
            // Apply vibration
            if (!multiSimulation.balances[0].enabled && !multiSimulation.balances[1].enabled && multiSimulation.rpm > 0) {
                p.translate(multiSimulation.vibrationX * 10, multiSimulation.vibrationY * 10);
            }
            
            // Draw shaft circle
            p.fill(180);
            p.stroke(100);
            p.strokeWeight(2);
            let shaftRadius = SHAFT_DIAMETER * 2;
            p.ellipse(0, 0, shaftRadius * 2, shaftRadius * 2);
            
            // Draw reference line
            p.stroke(0);
            p.strokeWeight(1);
            p.line(shaftRadius, 0, shaftRadius + 20, 0);
            
            // Rotate for animation
            p.push();
            p.rotate(multiSimulation.angle);
            
            // Draw unbalance masses
            multiSimulation.unbalances.forEach((mass, i) => {
                if (mass.mass > 0) {
                    p.push();
                    p.rotate(p.radians(mass.angle));
                    p.translate(mass.radius, 0);
                    p.fill(mass.color[0], mass.color[1], mass.color[2]);
                    p.noStroke();
                    let size = p.map(mass.mass, 0, 150, 8, 25);
                    p.ellipse(0, 0, size, size);
                    p.pop();
                    
                    // Connection line
                    p.stroke(mass.color[0], mass.color[1], mass.color[2], 100);
                    p.strokeWeight(2);
                    p.push();
                    p.rotate(p.radians(mass.angle));
                    p.line(0, 0, mass.radius, 0);
                    p.pop();
                }
            });
            
            // Draw balance masses if enabled
            multiSimulation.balances.forEach((balance, i) => {
                if (balance.enabled && balance.mass > 0) {
                    p.push();
                    p.rotate(p.radians(balance.angle));
                    p.translate(balance.radius, 0);
                    p.fill(0, 255, 0);
                    p.noStroke();
                    let size = p.map(balance.mass, 0, 150, 8, 25);
                    p.ellipse(0, 0, size, size);
                    p.pop();
                    
                    // Connection line
                    p.stroke(0, 255, 0, 100);
                    p.strokeWeight(2);
                    p.push();
                    p.rotate(p.radians(balance.angle));
                    p.line(0, 0, balance.radius, 0);
                    p.pop();
                }
            });
            
            p.pop(); // End rotation
            
            // Labels
            p.fill(0);
            p.noStroke();
            p.textAlign(p.CENTER);
            p.textSize(12);
            p.text('Front View', 0, -p.height/2 + 30);
            p.text(`Angle: ${(multiSimulation.angle * 180/Math.PI).toFixed(0)}°`, 0, p.height/2 - 20);
        };
    });
}

function createMultiMRDiagram() {
    multiMRDiagram = new p5(function(p) {
        p.setup = function() {
            let container = document.getElementById('multi-mr-diagram');
            if (container) {
                p.createCanvas(container.offsetWidth - 20, 280).parent('multi-mr-diagram');
            }
        };
        
        p.draw = function() {
            p.clear();
            p.background(255);
            p.translate(p.width/2, p.height/2);
            
            // Draw axes
            p.stroke(200);
            p.strokeWeight(1);
            p.line(-p.width/2 + 30, 0, p.width/2 - 30, 0);
            p.line(0, -p.height/2 + 30, 0, p.height/2 - 30);
            
            // Calculate MR vectors
            let scale = 0.008; // Reduced scale for better fit
            let vectors = [];
            
            // Add unbalance vectors
            multiSimulation.unbalances.forEach((mass, i) => {
                if (mass.mass > 0) {
                    let mr = mass.mass * mass.radius;
                    let vecAngle = mass.angle * Math.PI/180 + multiSimulation.angle;
                    vectors.push({
                        x: mr * Math.cos(vecAngle) * scale,
                        y: mr * Math.sin(vecAngle) * scale,
                        color: mass.color,
                        label: `M${i+1}`
                    });
                }
            });
            
            // Add balance vectors if enabled
            multiSimulation.balances.forEach((balance, i) => {
                if (balance.enabled && balance.mass > 0) {
                    let mr = balance.mass * balance.radius;
                    let vecAngle = balance.angle * Math.PI/180 + multiSimulation.angle;
                    vectors.push({
                        x: mr * Math.cos(vecAngle) * scale,
                        y: mr * Math.sin(vecAngle) * scale,
                        color: [0, 255, 0],
                        label: i === 0 ? 'BA' : 'BB'
                    });
                }
            });
            
            // Draw vector polygon
            if (vectors.length > 0) {
                p.stroke(100);
                p.strokeWeight(2);
                p.noFill();
                p.beginShape();
                p.vertex(0, 0);
                let currentX = 0, currentY = 0;
                vectors.forEach(v => {
                    currentX += v.x;
                    currentY += v.y;
                    p.vertex(currentX, currentY);
                });
                p.endShape();
                
                // Draw individual vectors
                currentX = 0;
                currentY = 0;
                vectors.forEach(v => {
                    p.stroke(v.color[0], v.color[1], v.color[2]);
                    p.strokeWeight(3);
                    p.line(currentX, currentY, currentX + v.x, currentY + v.y);
                    
                    // Label
                    p.fill(v.color[0], v.color[1], v.color[2]);
                    p.noStroke();
                    p.textAlign(p.CENTER);
                    p.textSize(10);
                    p.text(v.label, currentX + v.x/2, currentY + v.y/2 - 5);
                    
                    currentX += v.x;
                    currentY += v.y;
                });
                
                // Draw resultant
                if (Math.abs(currentX) > 0.1 || Math.abs(currentY) > 0.1) {
                    p.stroke(255, 0, 255);
                    p.strokeWeight(3);
                    p.line(currentX, currentY, 0, 0);
                    
                    p.fill(255, 0, 255);
                    p.noStroke();
                    p.text('R', currentX/2, currentY/2 + 10);
                }
            }
            
            // Title
            p.fill(0);
            p.noStroke();
            p.textAlign(p.CENTER);
            p.textSize(12);
            p.text('MR Polygon (g·mm)', 0, -p.height/2 + 30);
        };
    });
}

function createMultiMRLDiagram() {
    multiMRLDiagram = new p5(function(p) {
        p.setup = function() {
            let container = document.getElementById('multi-mrl-diagram');
            if (container) {
                p.createCanvas(container.offsetWidth - 20, 280).parent('multi-mrl-diagram');
            }
        };
        
        p.draw = function() {
            p.clear();
            p.background(255);
            p.translate(p.width/2, p.height/2);
            
            // Draw axes
            p.stroke(200);
            p.strokeWeight(1);
            p.line(-p.width/2 + 30, 0, p.width/2 - 30, 0);
            p.line(0, -p.height/2 + 30, 0, p.height/2 - 30);
            
            // Calculate MRL vectors
            let scale = 0.0001; // Reduced scale for better fit
            let vectors = [];
            
            // Add unbalance MRL vectors
            multiSimulation.unbalances.forEach((mass, i) => {
                if (mass.mass > 0) {
                    let mrl = mass.mass * mass.radius * (mass.position - 50) * 4;
                    let vecAngle = mass.angle * Math.PI/180 + multiSimulation.angle;
                    vectors.push({
                        x: mrl * Math.cos(vecAngle) * scale,
                        y: mrl * Math.sin(vecAngle) * scale,
                        color: mass.color,
                        label: `M${i+1}L`
                    });
                }
            });
            
            // Add balance MRL vectors if enabled
            multiSimulation.balances.forEach((balance, i) => {
                if (balance.enabled && balance.mass > 0) {
                    let mrl = balance.mass * balance.radius * (balance.position - 50) * 4;
                    let vecAngle = balance.angle * Math.PI/180 + multiSimulation.angle;
                    vectors.push({
                        x: mrl * Math.cos(vecAngle) * scale,
                        y: mrl * Math.sin(vecAngle) * scale,
                        color: [0, 255, 0],
                        label: i === 0 ? 'BAL' : 'BBL'
                    });
                }
            });
            
            // Draw vector polygon
            if (vectors.length > 0) {
                p.stroke(100);
                p.strokeWeight(2);
                p.noFill();
                p.beginShape();
                p.vertex(0, 0);
                let currentX = 0, currentY = 0;
                vectors.forEach(v => {
                    currentX += v.x;
                    currentY += v.y;
                    p.vertex(currentX, currentY);
                });
                p.endShape();
                
                // Draw individual vectors
                currentX = 0;
                currentY = 0;
                vectors.forEach(v => {
                    p.stroke(v.color[0], v.color[1], v.color[2]);
                    p.strokeWeight(3);
                    p.line(currentX, currentY, currentX + v.x, currentY + v.y);
                    
                    // Label
                    p.fill(v.color[0], v.color[1], v.color[2]);
                    p.noStroke();
                    p.textAlign(p.CENTER);
                    p.textSize(10);
                    p.text(v.label, currentX + v.x/2, currentY + v.y/2 - 5);
                    
                    currentX += v.x;
                    currentY += v.y;
                });
                
                // Draw resultant
                if (Math.abs(currentX) > 0.1 || Math.abs(currentY) > 0.1) {
                    p.stroke(255, 0, 255);
                    p.strokeWeight(3);
                    p.line(currentX, currentY, 0, 0);
                    
                    p.fill(255, 0, 255);
                    p.noStroke();
                    p.text('R', currentX/2, currentY/2 + 10);
                }
            }
            
            // Title
            p.fill(0);
            p.noStroke();
            p.textAlign(p.CENTER);
            p.textSize(12);
            p.text('MRL Polygon (g·mm²)', 0, -p.height/2 + 30);
        };
    });
}

// ========== UPDATE FUNCTIONS ==========

function updateSingleRotation(p) {
    if (singleSimulation.rpm === 0) {
        // Static balance - heavy side down
        let targetAngle = Math.PI/2 - singleSimulation.unbalance.angle * Math.PI/180;
        if (singleSimulation.balance.enabled) {
            // Calculate net unbalance
            let netX = singleSimulation.unbalance.mass * singleSimulation.unbalance.radius * 
                      Math.cos(singleSimulation.unbalance.angle * Math.PI/180);
            let netY = singleSimulation.unbalance.mass * singleSimulation.unbalance.radius * 
                      Math.sin(singleSimulation.unbalance.angle * Math.PI/180);
            netX += singleSimulation.balance.mass * singleSimulation.balance.radius * 
                   Math.cos(singleSimulation.balance.angle * Math.PI/180);
            netY += singleSimulation.balance.mass * singleSimulation.balance.radius * 
                   Math.sin(singleSimulation.balance.angle * Math.PI/180);
            
            if (Math.abs(netX) > 0.1 || Math.abs(netY) > 0.1) {
                targetAngle = Math.PI/2 - Math.atan2(netY, netX);
            }
        }
        
        // Smooth approach to target
        let diff = targetAngle - singleSimulation.angle;
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        singleSimulation.angle += diff * 0.1;
    } else {
        // Rotate at specified RPM
        let omega = (singleSimulation.rpm * p.TWO_PI) / (60 * 60); // rad/frame at 60fps
        singleSimulation.angle += omega;
    }
    
    // Update vibration
    updateSingleVibration();
}

function updateMultiRotation(p) {
    if (multiSimulation.rpm === 0) {
        // Calculate net unbalance for static position
        let netX = 0, netY = 0;
        
        multiSimulation.unbalances.forEach(mass => {
            if (mass.mass > 0) {
                netX += mass.mass * mass.radius * Math.cos(mass.angle * Math.PI/180);
                netY += mass.mass * mass.radius * Math.sin(mass.angle * Math.PI/180);
            }
        });
        
        multiSimulation.balances.forEach(balance => {
            if (balance.enabled && balance.mass > 0) {
                netX += balance.mass * balance.radius * Math.cos(balance.angle * Math.PI/180);
                netY += balance.mass * balance.radius * Math.sin(balance.angle * Math.PI/180);
            }
        });
        
        if (Math.abs(netX) > 0.1 || Math.abs(netY) > 0.1) {
            let targetAngle = Math.PI/2 - Math.atan2(netY, netX);
            let diff = targetAngle - multiSimulation.angle;
            while (diff > Math.PI) diff -= 2 * Math.PI;
            while (diff < -Math.PI) diff += 2 * Math.PI;
            multiSimulation.angle += diff * 0.1;
        }
    } else {
        // Rotate at specified RPM
        let omega = (multiSimulation.rpm * Math.PI * 2) / (60 * 60);
        multiSimulation.angle += omega;
    }
    
    // Update vibration and forces
    updateMultiVibration();
    updateMultiForces();
}

function updateSingleForces() {
    let omega = (singleSimulation.rpm * 2 * Math.PI) / 60; // rad/s
    
    // Calculate unbalance force
    let force = (singleSimulation.unbalance.mass / 1000) * 
                (singleSimulation.unbalance.radius / 1000) * 
                omega * omega;
    
    // Add balance force if enabled
    if (singleSimulation.balance.enabled) {
        let balanceForce = (singleSimulation.balance.mass / 1000) * 
                          (singleSimulation.balance.radius / 1000) * 
                          omega * omega;
        let unbalanceAngle = singleSimulation.unbalance.angle * Math.PI/180;
        let balanceAngle = singleSimulation.balance.angle * Math.PI/180;
        
        let fx = force * Math.cos(unbalanceAngle) + balanceForce * Math.cos(balanceAngle);
        let fy = force * Math.sin(unbalanceAngle) + balanceForce * Math.sin(balanceAngle);
        force = Math.sqrt(fx * fx + fy * fy);
    }
    
    singleSimulation.totalForce = force;
    
    // Update display
    let forceDisplay = document.getElementById('single-force');
    if (forceDisplay) {
        forceDisplay.textContent = force.toFixed(2) + ' N';
    }
    
    // Update status
    let statusDiv = document.querySelector('#single-status .status-value');
    if (statusDiv) {
        if (force < 0.5 || singleSimulation.balance.enabled && force < 0.5) {
            statusDiv.textContent = 'Balanced';
            statusDiv.className = 'status-value balanced';
        } else {
            statusDiv.textContent = 'Unbalanced';
            statusDiv.className = 'status-value unbalanced';
        }
    }
}

function updateMultiForces() {
    let omega = (multiSimulation.rpm * 2 * Math.PI) / 60;
    let totalFx = 0, totalFy = 0, totalMoment = 0;
    
    // Calculate forces from unbalances
    multiSimulation.unbalances.forEach(mass => {
        if (mass.mass > 0) {
            let force = (mass.mass / 1000) * (mass.radius / 1000) * omega * omega;
            let angle = mass.angle * Math.PI/180 + multiSimulation.angle;
            totalFx += force * Math.cos(angle);
            totalFy += force * Math.sin(angle);
            
            // Moment about left bearing
            let leverArm = (mass.position / 100) * (SHAFT_LENGTH / 1000);
            totalMoment += force * leverArm;
        }
    });
    
    // Add balance forces if enabled
    multiSimulation.balances.forEach(balance => {
        if (balance.enabled && balance.mass > 0) {
            let force = (balance.mass / 1000) * (balance.radius / 1000) * omega * omega;
            let angle = balance.angle * Math.PI/180 + multiSimulation.angle;
            totalFx += force * Math.cos(angle);
            totalFy += force * Math.sin(angle);
            
            let leverArm = (balance.position / 100) * (SHAFT_LENGTH / 1000);
            totalMoment += force * leverArm;
        }
    });
    
    multiSimulation.totalForce = { x: totalFx, y: totalFy };
    multiSimulation.totalMoment = totalMoment;
    
    let totalForceMag = Math.sqrt(totalFx * totalFx + totalFy * totalFy);
    
    // Calculate bearing reactions
    multiSimulation.rightBearing = Math.abs(totalMoment / (SHAFT_LENGTH / 1000)) + totalForceMag / 2;
    multiSimulation.leftBearing = totalForceMag - multiSimulation.rightBearing;
    
    // Update display with null checks
    let forceDisplay = document.getElementById('multi-force');
    if (forceDisplay) forceDisplay.textContent = totalForceMag.toFixed(2) + ' N';
    
    let momentDisplay = document.getElementById('multi-moment');
    if (momentDisplay) momentDisplay.textContent = Math.abs(totalMoment).toFixed(3) + ' N·m';
    
    let leftDisplay = document.getElementById('multi-left-bearing');
    if (leftDisplay) leftDisplay.textContent = Math.abs(multiSimulation.leftBearing).toFixed(2) + ' N';
    
    let rightDisplay = document.getElementById('multi-right-bearing');
    if (rightDisplay) rightDisplay.textContent = Math.abs(multiSimulation.rightBearing).toFixed(2) + ' N';
    
    // Update status
    let statusDiv = document.querySelector('#multi-status .status-value');
    if (statusDiv) {
        if (totalForceMag < 0.5 && Math.abs(totalMoment) < 0.01) {
            statusDiv.textContent = 'Balanced';
            statusDiv.className = 'status-value balanced';
        } else {
            statusDiv.textContent = 'Unbalanced';
            statusDiv.className = 'status-value unbalanced';
        }
    }
}

function updateSingleVibration() {
    if (!singleSimulation.balance.enabled && singleSimulation.rpm > 0) {
        let vibrationMag = Math.min(1, singleSimulation.totalForce / 10);
        let angle = singleSimulation.unbalance.angle * Math.PI/180 + singleSimulation.angle;
        singleSimulation.vibrationX = Math.cos(angle) * vibrationMag;
        singleSimulation.vibrationY = Math.sin(angle) * vibrationMag;
    } else {
        singleSimulation.vibrationX = 0;
        singleSimulation.vibrationY = 0;
    }
}

function updateMultiVibration() {
    if ((!multiSimulation.balances[0].enabled || !multiSimulation.balances[1].enabled) && multiSimulation.rpm > 0) {
        let forceMag = Math.sqrt(multiSimulation.totalForce.x ** 2 + multiSimulation.totalForce.y ** 2);
        let vibrationMag = Math.min(1, forceMag / 10);
        let angle = Math.atan2(multiSimulation.totalForce.y, multiSimulation.totalForce.x);
        multiSimulation.vibrationX = Math.cos(angle) * vibrationMag;
        multiSimulation.vibrationY = Math.sin(angle) * vibrationMag;
    } else {
        multiSimulation.vibrationX = 0;
        multiSimulation.vibrationY = 0;
    }
}

// ========== BALANCING CALCULATIONS ==========

function calculateSingleBalance() {
    // Simple single plane balance
    singleSimulation.balance.mass = singleSimulation.unbalance.mass * 
                                   singleSimulation.unbalance.radius / 
                                   singleSimulation.balance.radius;
    singleSimulation.balance.angle = (singleSimulation.unbalance.angle + 180) % 360;
    
    // Update display
    let massDisplay = document.getElementById('single-balance-mass');
    let angleDisplay = document.getElementById('single-balance-angle');
    if (massDisplay) massDisplay.textContent = singleSimulation.balance.mass.toFixed(1) + ' g';
    if (angleDisplay) angleDisplay.textContent = singleSimulation.balance.angle.toFixed(0) + '°';
}

function calculateMultiBalance() {
    // Calculate total MR and MRL
    let totalMRx = 0, totalMRy = 0;
    let totalMRLx = 0, totalMRLy = 0;
    
    multiSimulation.unbalances.forEach(mass => {
        if (mass.mass > 0) {
            let mr = mass.mass * mass.radius;
            let angle = mass.angle * Math.PI / 180;
            totalMRx += mr * Math.cos(angle);
            totalMRy += mr * Math.sin(angle);
            
            let l = (mass.position - 50) * 4; // Scaled position
            totalMRLx += mr * l * Math.cos(angle);
            totalMRLy += mr * l * Math.sin(angle);
        }
    });
    
    // Solve for two balance planes
    let lA = (10 - 50) * 4; // Position A at 10%
    let lB = (90 - 50) * 4; // Position B at 90%
    let det = lB - lA;
    
    if (Math.abs(det) > 0.1) {
        // Calculate MR for each balance plane
        let mrAx = (-totalMRLx + totalMRx * lB) / det;
        let mrAy = (-totalMRLy + totalMRy * lB) / det;
        let mrBx = (totalMRLx - totalMRx * lA) / det;
        let mrBy = (totalMRLy - totalMRy * lA) / det;
        
        // Balance A
        let mrA = Math.sqrt(mrAx * mrAx + mrAy * mrAy);
        let angleA = Math.atan2(mrAy, mrAx) * 180 / Math.PI;
        multiSimulation.balances[0].mass = mrA / multiSimulation.balances[0].radius;
        multiSimulation.balances[0].angle = (angleA + 360) % 360;
        
        // Balance B
        let mrB = Math.sqrt(mrBx * mrBx + mrBy * mrBy);
        let angleB = Math.atan2(mrBy, mrBx) * 180 / Math.PI;
        multiSimulation.balances[1].mass = mrB / multiSimulation.balances[1].radius;
        multiSimulation.balances[1].angle = (angleB + 360) % 360;
        
        // Update display
        let balanceADisplay = document.getElementById('multi-balance-a');
        let balanceBDisplay = document.getElementById('multi-balance-b');
        if (balanceADisplay) {
            balanceADisplay.textContent = 
                `${multiSimulation.balances[0].mass.toFixed(1)} g @ ${multiSimulation.balances[0].angle.toFixed(0)}°`;
        }
        if (balanceBDisplay) {
            balanceBDisplay.textContent = 
                `${multiSimulation.balances[1].mass.toFixed(1)} g @ ${multiSimulation.balances[1].angle.toFixed(0)}°`;
        }
    }
}

// ========== CONTROL SETUP ==========

function setupSingleControls() {
    // RPM control
    let rpmSlider = document.getElementById('single-rpm');
    let rpmValue = document.getElementById('single-rpm-value');
    if (rpmSlider && rpmValue) {
        rpmSlider.addEventListener('input', () => {
            singleSimulation.rpm = parseFloat(rpmSlider.value);
            rpmValue.value = singleSimulation.rpm;
        });
        rpmValue.addEventListener('input', () => {
            singleSimulation.rpm = parseFloat(rpmValue.value);
            rpmSlider.value = singleSimulation.rpm;
        });
    }
    
    // Mass control
    let massSlider = document.getElementById('single-mass');
    let massValue = document.getElementById('single-mass-value');
    if (massSlider && massValue) {
        massSlider.addEventListener('input', () => {
            singleSimulation.unbalance.mass = parseFloat(massSlider.value);
            massValue.value = singleSimulation.unbalance.mass;
        });
        massValue.addEventListener('input', () => {
            singleSimulation.unbalance.mass = parseFloat(massValue.value);
            massSlider.value = singleSimulation.unbalance.mass;
        });
    }
    
    // Radius control
    let radiusSlider = document.getElementById('single-radius');
    let radiusValue = document.getElementById('single-radius-value');
    if (radiusSlider && radiusValue) {
        radiusSlider.addEventListener('input', () => {
            singleSimulation.unbalance.radius = parseFloat(radiusSlider.value);
            radiusValue.value = singleSimulation.unbalance.radius;
        });
        radiusValue.addEventListener('input', () => {
            singleSimulation.unbalance.radius = parseFloat(radiusValue.value);
            radiusSlider.value = singleSimulation.unbalance.radius;
        });
    }
    
    // Buttons
    let pauseBtn = document.getElementById('single-pause');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            singleSimulation.isPaused = !singleSimulation.isPaused;
            pauseBtn.textContent = singleSimulation.isPaused ? 'Resume' : 'Pause';
        });
    }
    
    let calculateBtn = document.getElementById('single-calculate');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateSingleBalance);
    }
    
    let applyBtn = document.getElementById('single-apply');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            calculateSingleBalance();
            singleSimulation.balance.enabled = true;
        });
    }
    
    let removeBtn = document.getElementById('single-remove');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            singleSimulation.balance.enabled = false;
            let massDisplay = document.getElementById('single-balance-mass');
            let angleDisplay = document.getElementById('single-balance-angle');
            if (massDisplay) massDisplay.textContent = '-- g';
            if (angleDisplay) angleDisplay.textContent = '-- °';
        });
    }
    
    let resetBtn = document.getElementById('single-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            singleSimulation.angle = 0;
            singleSimulation.rpm = 0;
            singleSimulation.unbalance = { mass: 50, radius: 60, angle: 0 };
            singleSimulation.balance.enabled = false;
            if (rpmSlider) rpmSlider.value = 0;
            if (rpmValue) rpmValue.value = 0;
            if (massSlider) massSlider.value = 50;
            if (massValue) massValue.value = 50;
            if (radiusSlider) radiusSlider.value = 60;
            if (radiusValue) radiusValue.value = 60;
        });
    }
}

function setupMultiControls() {
    // RPM control
    let rpmSlider = document.getElementById('multi-rpm');
    let rpmValue = document.getElementById('multi-rpm-value');
    if (rpmSlider && rpmValue) {
        rpmSlider.addEventListener('input', () => {
            multiSimulation.rpm = parseFloat(rpmSlider.value);
            rpmValue.value = multiSimulation.rpm;
        });
        rpmValue.addEventListener('input', () => {
            multiSimulation.rpm = parseFloat(rpmValue.value);
            rpmSlider.value = multiSimulation.rpm;
        });
    }
    
    // Setup controls for each mass
    for (let i = 1; i <= 3; i++) {
        let massSlider = document.getElementById(`multi-mass${i}`);
        let massValue = document.getElementById(`multi-mass${i}-value`);
        let radiusSlider = document.getElementById(`multi-radius${i}`);
        let radiusValue = document.getElementById(`multi-radius${i}-value`);
        let positionSlider = document.getElementById(`multi-position${i}`);
        let positionValue = document.getElementById(`multi-position${i}-value`);
        
        if (massSlider && massValue) {
            massSlider.addEventListener('input', () => {
                multiSimulation.unbalances[i-1].mass = parseFloat(massSlider.value);
                massValue.value = multiSimulation.unbalances[i-1].mass;
            });
            massValue.addEventListener('input', () => {
                multiSimulation.unbalances[i-1].mass = parseFloat(massValue.value);
                massSlider.value = multiSimulation.unbalances[i-1].mass;
            });
        }
        
        if (radiusSlider && radiusValue) {
            radiusSlider.addEventListener('input', () => {
                multiSimulation.unbalances[i-1].radius = parseFloat(radiusSlider.value);
                radiusValue.value = multiSimulation.unbalances[i-1].radius;
            });
            radiusValue.addEventListener('input', () => {
                multiSimulation.unbalances[i-1].radius = parseFloat(radiusValue.value);
                radiusSlider.value = multiSimulation.unbalances[i-1].radius;
            });
        }
        
        if (positionSlider && positionValue) {
            positionSlider.addEventListener('input', () => {
                multiSimulation.unbalances[i-1].position = parseFloat(positionSlider.value);
                positionValue.value = multiSimulation.unbalances[i-1].position;
            });
            positionValue.addEventListener('input', () => {
                multiSimulation.unbalances[i-1].position = parseFloat(positionValue.value);
                positionSlider.value = multiSimulation.unbalances[i-1].position;
            });
        }
    }
    
    // Buttons
    let pauseBtn = document.getElementById('multi-pause');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            multiSimulation.isPaused = !multiSimulation.isPaused;
            pauseBtn.textContent = multiSimulation.isPaused ? 'Resume' : 'Pause';
        });
    }
    
    let calculateBtn = document.getElementById('multi-calculate');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateMultiBalance);
    }
    
    let applyBtn = document.getElementById('multi-apply');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            calculateMultiBalance();
            multiSimulation.balances[0].enabled = true;
            multiSimulation.balances[1].enabled = true;
        });
    }
    
    let removeBtn = document.getElementById('multi-remove');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            multiSimulation.balances[0].enabled = false;
            multiSimulation.balances[1].enabled = false;
            let balanceA = document.getElementById('multi-balance-a');
            let balanceB = document.getElementById('multi-balance-b');
            if (balanceA) balanceA.textContent = '-- g @ -- °';
            if (balanceB) balanceB.textContent = '-- g @ -- °';
        });
    }
    
    let resetBtn = document.getElementById('multi-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            multiSimulation.angle = 0;
            multiSimulation.rpm = 0;
            multiSimulation.unbalances[0] = { mass: 50, radius: 60, position: 25, angle: 0, color: [255, 0, 0] };
            multiSimulation.unbalances[1] = { mass: 30, radius: 80, position: 50, angle: 120, color: [0, 100, 255] };
            multiSimulation.unbalances[2] = { mass: 40, radius: 50, position: 75, angle: 240, color: [255, 150, 0] };
            multiSimulation.balances[0].enabled = false;
            multiSimulation.balances[1].enabled = false;
            
            // Reset all controls
            if (rpmSlider) rpmSlider.value = 0;
            if (rpmValue) rpmValue.value = 0;
            for (let i = 1; i <= 3; i++) {
                let mass = document.getElementById(`multi-mass${i}`);
                let massVal = document.getElementById(`multi-mass${i}-value`);
                let radius = document.getElementById(`multi-radius${i}`);
                let radiusVal = document.getElementById(`multi-radius${i}-value`);
                let position = document.getElementById(`multi-position${i}`);
                let positionVal = document.getElementById(`multi-position${i}-value`);
                
                if (mass) mass.value = multiSimulation.unbalances[i-1].mass;
                if (massVal) massVal.value = multiSimulation.unbalances[i-1].mass;
                if (radius) radius.value = multiSimulation.unbalances[i-1].radius;
                if (radiusVal) radiusVal.value = multiSimulation.unbalances[i-1].radius;
                if (position) position.value = multiSimulation.unbalances[i-1].position;
                if (positionVal) positionVal.value = multiSimulation.unbalances[i-1].position;
            }
        });
    }
}