// Global variables
let canvasWidth, canvasHeight;
let shaftLength, shaftRadius;
let bearingDiameter;
let rotorAngle = 0;
let rpm = 300;
let isRunning = true;
let showForces = true;

// Unbalance parameters
let unbalanceType = 'static';
let unbalanceMass = 30; // g
let unbalanceRadius = 50; // mm
let unbalanceAngle = 0; // degrees
let unbalancePosition1 = 0.25; // relative position along shaft (0-1)
let unbalancePosition2 = 0.75; // relative position along shaft (0-1)

// Balancing weights
let balance1Mass = 0; // g
let balance1Angle = 180; // degrees
let balance2Mass = 0; // g
let balance2Angle = 180; // degrees

// Color scheme
const colors = {
    shaft: [150, 150, 150],
    disk: [200, 200, 200],
    bearing: [100, 100, 100],
    unbalanceMass: [255, 100, 100],
    balanceMass: [100, 200, 100],
    force: [255, 50, 50],
    background: [245, 245, 235],
    text: [50, 50, 50]
};

// Setup function - called once at beginning
function setup() {
    // Create canvas and place it in the sketch-holder div
    canvasWidth = document.getElementById('sketch-holder').offsetWidth;
    canvasHeight = 400;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('sketch-holder');
    
    // Set initial dimensions
    shaftLength = 300; // mm
    shaftRadius = 5; // mm
    bearingDiameter = 20; // mm
    
    // Set up event listeners for controls
    setupEventListeners();
    
    // Initial calculation of forces
    calculateForces();
}

// Force and moment calculation variables
let forceLeft = { x: 0, y: 0 };
let forceRight = { x: 0, y: 0 };
let totalForce = { x: 0, y: 0, magnitude: 0 };
let totalMoment = { x: 0, y: 0, magnitude: 0 };

// Calculate forces based on unbalance and balancing weights
function calculateForces() {
    // Convert RPM to angular velocity (rad/s)
    const omega = (rpm * 2 * Math.PI) / 60;
    const omegaSquared = omega * omega;
    
    // Reset forces
    forceLeft = { x: 0, y: 0 };
    forceRight = { x: 0, y: 0 };
    totalForce = { x: 0, y: 0, magnitude: 0 };
    totalMoment = { x: 0, y: 0, magnitude: 0 };
    
    // Skip calculation if not rotating
    if (rpm === 0) return;
    
    // Calculate unbalance forces
    let unbalanceForces = [];
    
    if (unbalanceType === 'static' || unbalanceType === 'dynamic') {
        // Add first unbalance mass
        const angleRad1 = radians(unbalanceAngle);
        const force1 = (unbalanceMass / 1000) * (unbalanceRadius / 1000) * omegaSquared;
        unbalanceForces.push({
            fx: force1 * cos(angleRad1),
            fy: force1 * sin(angleRad1),
            position: unbalancePosition1
        });
    }
    
    if (unbalanceType === 'couple' || unbalanceType === 'dynamic') {
        // Add second unbalance mass (for couple and dynamic unbalance)
        let secondAngle = unbalanceType === 'couple' ? unbalanceAngle + 180 : unbalanceAngle + 120;
        const angleRad2 = radians(secondAngle);
        // For couple unbalance, use same mass and radius
        const mass2 = unbalanceType === 'couple' ? unbalanceMass : unbalanceMass * 0.7;
        const radius2 = unbalanceType === 'couple' ? unbalanceRadius : unbalanceRadius * 0.8;
        const force2 = (mass2 / 1000) * (radius2 / 1000) * omegaSquared;
        
        unbalanceForces.push({
            fx: force2 * cos(angleRad2),
            fy: force2 * sin(angleRad2),
            position: unbalancePosition2
        });
    }
    
    // Add balancing weights forces
    if (balance1Mass > 0) {
        const angleRad = radians(balance1Angle);
        const force = (balance1Mass / 1000) * (unbalanceRadius / 1000) * omegaSquared;
        unbalanceForces.push({
            fx: force * cos(angleRad),
            fy: force * sin(angleRad),
            position: 0.15 // Position of balancing plane 1
        });
    }
    
    if (balance2Mass > 0) {
        const angleRad = radians(balance2Angle);
        const force = (balance2Mass / 1000) * (unbalanceRadius / 1000) * omegaSquared;
        unbalanceForces.push({
            fx: force * cos(angleRad),
            fy: force * sin(angleRad),
            position: 0.85 // Position of balancing plane 2
        });
    }
    
    // Calculate total force and moment
    let totalFx = 0;
    let totalFy = 0;
    let totalMx = 0;
    let totalMy = 0;
    
    unbalanceForces.forEach(force => {
        totalFx += force.fx;
        totalFy += force.fy;
        
        // Calculate moment relative to center (0.5)
        const lever = (force.position - 0.5) * shaftLength / 1000; // Convert to m
        totalMx += force.fx * lever;
        totalMy += force.fy * lever;
    });
    
    totalForce.x = totalFx;
    totalForce.y = totalFy;
    totalForce.magnitude = Math.sqrt(totalFx * totalFx + totalFy * totalFy);
    
    totalMoment.x = totalMx;
    totalMoment.y = totalMy;
    totalMoment.magnitude = Math.sqrt(totalMx * totalMx + totalMy * totalMy);
    
    // Calculate bearing reactions
    // For a simple beam with bearings at both ends:
    forceLeft.x = totalFx / 2 - totalMy / (shaftLength / 1000);
    forceLeft.y = totalFy / 2 + totalMx / (shaftLength / 1000);
    
    forceRight.x = totalFx / 2 + totalMy / (shaftLength / 1000);
    forceRight.y = totalFy / 2 - totalMx / (shaftLength / 1000);
}

// Calculate and apply balancing weights for current unbalance
function calculateBalanceWeights() {
    // Skip if not rotating
    if (rpm === 0) {
        alert("Please set a non-zero RPM value to calculate balancing weights.");
        return;
    }
    
    // For static unbalance (single plane balancing)
    if (unbalanceType === 'static') {
        // For static balancing, we need just one balancing weight 180° opposite
        balance1Mass = unbalanceMass;
        balance1Angle = (unbalanceAngle + 180) % 360;
        
        // Update UI sliders and inputs
        document.getElementById('balance1MassSlider').value = balance1Mass;
        document.getElementById('balance1MassValue').value = balance1Mass;
        document.getElementById('balance1AngleSlider').value = balance1Angle;
        document.getElementById('balance1AngleValue').value = balance1Angle;
        
        // No need for second balancing weight
        balance2Mass = 0;
        document.getElementById('balance2MassSlider').value = 0;
        document.getElementById('balance2MassValue').value = 0;
    } else {
        // Two-plane balancing for couple and dynamic unbalance
        // This is a simplified calculation - in a real application you'd solve the MR and MRL equations
        const omega = (rpm * 2 * Math.PI) / 60;
        const omegaSquared = omega * omega;
        
        if (unbalanceType === 'couple') {
            // For couple unbalance, equal weights at same angle in both planes
            balance1Mass = unbalanceMass;
            balance1Angle = (unbalanceAngle + 180) % 360;
            
            balance2Mass = unbalanceMass;
            balance2Angle = (unbalanceAngle + 180) % 360;
        } else {
            // For dynamic unbalance, weights calculated based on both force and moment balance
            // Simplified calculation for demonstration purposes
            balance1Mass = unbalanceMass * 0.8;
            balance1Angle = (unbalanceAngle + 180) % 360;
            
            balance2Mass = unbalanceMass * 0.6;
            balance2Angle = ((unbalanceAngle + 120) + 180) % 360;
        }
        
        // Update UI sliders and inputs
        document.getElementById('balance1MassSlider').value = balance1Mass;
        document.getElementById('balance1MassValue').value = balance1Mass;
        document.getElementById('balance1AngleSlider').value = balance1Angle;
        document.getElementById('balance1AngleValue').value = balance1Angle;
        
        document.getElementById('balance2MassSlider').value = balance2Mass;
        document.getElementById('balance2MassValue').value = balance2Mass;
        document.getElementById('balance2AngleSlider').value = balance2Angle;
        document.getElementById('balance2AngleValue').value = balance2Angle;
    }
    
    // Recalculate forces with new balancing weights
    calculateForces();
}

// Apply calculated balancing weights
function applyBalanceWeights() {
    // This function would normally apply the calculated weights to the physical system
    // For now, we'll just show a message
    const totalForceNewton = totalForce.magnitude.toFixed(2);
    const totalMomentNm = totalMoment.magnitude.toFixed(4);
    
    let status = "";
    
    if (totalForce.magnitude < 0.01 && totalMoment.magnitude < 0.001) {
        status = "System well balanced!";
    } else if (totalForce.magnitude < 0.1 && totalMoment.magnitude < 0.01) {
        status = "System acceptably balanced.";
    } else {
        status = "System still has significant unbalance.";
    }
    
    alert(`Balancing weights applied.\nResidual force: ${totalForceNewton} N\nResidual moment: ${totalMomentNm} Nm\n\n${status}`);
}

// Reset the simulation to initial state
function resetSimulation() {
    rpm = 300;
    unbalanceType = 'static';
    unbalanceMass = 30;
    unbalanceRadius = 50;
    unbalanceAngle = 0;
    
    balance1Mass = 0;
    balance1Angle = 180;
    balance2Mass = 0;
    balance2Angle = 180;
    
    // Update UI elements
    document.getElementById('rpmSlider').value = rpm;
    document.getElementById('rpmValue').value = rpm;
    document.getElementById('unbalanceTypeSelect').value = unbalanceType;
    document.getElementById('massSlider').value = unbalanceMass;
    document.getElementById('massValue').value = unbalanceMass;
    document.getElementById('radiusSlider').value = unbalanceRadius;
    document.getElementById('radiusValue').value = unbalanceRadius;
    document.getElementById('angleSlider').value = unbalanceAngle;
    document.getElementById('angleValue').value = unbalanceAngle;
    
    document.getElementById('balance1MassSlider').value = balance1Mass;
    document.getElementById('balance1MassValue').value = balance1Mass;
    document.getElementById('balance1AngleSlider').value = balance1Angle;
    document.getElementById('balance1AngleValue').value = balance1Angle;
    document.getElementById('balance2MassSlider').value = balance2Mass;
    document.getElementById('balance2MassValue').value = balance2Mass;
    document.getElementById('balance2AngleSlider').value = balance2Angle;
    document.getElementById('balance2AngleValue').value = balance2Angle;
    
    updateUnbalanceConfiguration();
    calculateForces();
}

// Draw function - called continuously
function draw() {
    background(colors.background);
    
    // Update rotation angle based on RPM
    if (isRunning) {
        rotorAngle += (rpm / 60) * (Math.PI / 30);
        if (rotorAngle > 2 * Math.PI) {
            rotorAngle -= 2 * Math.PI;
        }
    }
    
    // Set up coordinate system: origin at center of canvas, positive y down
    translate(canvasWidth / 2, canvasHeight / 2);
    
    // Draw shaft and components
    drawRotor();
    
    // Draw force vectors and diagrams if enabled
    if (showForces) {
        drawForceVectors();
    }
    
    // Update force and MR diagrams
    updateForceDiagram();
    updateMRDiagram();
}

// Draw the rotor system (shaft, bearings, disks, and masses)
function drawRotor() {
    // Scale factor for display (convert mm to pixels with scaling)
    const scale = 0.7;
    const shaftHalfLength = (shaftLength * scale) / 2;
    
    // Draw fixed base for bearings
    fill(180);
    noStroke();
    rect(-shaftHalfLength - 20, 50, 20, 100);
    rect(shaftHalfLength, 50, 20, 100);
    
    // Draw bearings
    fill(colors.bearing[0], colors.bearing[1], colors.bearing[2]);
    ellipse(-shaftHalfLength, 0, bearingDiameter, bearingDiameter);
    ellipse(shaftHalfLength, 0, bearingDiameter, bearingDiameter);
    
    // Draw shaft
    stroke(colors.shaft[0], colors.shaft[1], colors.shaft[2]);
    strokeWeight(shaftRadius * 2);
    line(-shaftHalfLength, 0, shaftHalfLength, 0);
    
    // Draw center disk
    noStroke();
    fill(colors.disk[0], colors.disk[1], colors.disk[2]);
    const diskDiameter = 60;
    ellipse(0, 0, diskDiameter, diskDiameter);
    
    // Draw reference line on center disk
    stroke(0);
    strokeWeight(1);
    const lineLength = diskDiameter / 2;
    const rotatedX = lineLength * cos(rotorAngle);
    const rotatedY = lineLength * sin(rotorAngle);
    line(0, 0, rotatedX, rotatedY);
    
    // Draw unbalance masses based on type
    drawUnbalanceMasses(shaftHalfLength, scale);
    
    // Draw balancing weights if applied
    drawBalancingWeights(shaftHalfLength, scale);
}

// Draw unbalance masses based on unbalance type
function drawUnbalanceMasses(shaftHalfLength, scale) {
    noStroke();
    fill(colors.unbalanceMass[0], colors.unbalanceMass[1], colors.unbalanceMass[2]);
    
    if (unbalanceType === 'static' || unbalanceType === 'dynamic') {
        // First unbalance mass
        const xPos1 = map(unbalancePosition1, 0, 1, -shaftHalfLength, shaftHalfLength);
        const massRadius = map(unbalanceMass, 0, 100, 5, 15); // Scale mass size for visibility
        
        // Position on disk at angle + rotation
        const totalAngle1 = rotorAngle + radians(unbalanceAngle);
        const massX1 = xPos1 + (unbalanceRadius * scale/2) * cos(totalAngle1);
        const massY1 = (unbalanceRadius * scale/2) * sin(totalAngle1);
        
        ellipse(massX1, massY1, massRadius * 2, massRadius * 2);
    }
    
    if (unbalanceType === 'couple' || unbalanceType === 'dynamic') {
        // Second unbalance mass
        const xPos2 = map(unbalancePosition2, 0, 1, -shaftHalfLength, shaftHalfLength);
        
        let secondAngle = unbalanceType === 'couple' ? unbalanceAngle + 180 : unbalanceAngle + 120;
        const totalAngle2 = rotorAngle + radians(secondAngle);
        
        // For couple and dynamic, we may have different mass/radius for second mass
        let mass2 = unbalanceType === 'couple' ? unbalanceMass : unbalanceMass * 0.7;
        let radius2 = unbalanceType === 'couple' ? unbalanceRadius : unbalanceRadius * 0.8;
        
        const massRadius2 = map(mass2, 0, 100, 5, 15);
        const massX2 = xPos2 + (radius2 * scale/2) * cos(totalAngle2);
        const massY2 = (radius2 * scale/2) * sin(totalAngle2);
        
        ellipse(massX2, massY2, massRadius2 * 2, massRadius2 * 2);
    }
}

// Draw balancing weights if applied
function drawBalancingWeights(shaftHalfLength, scale) {
    if (balance1Mass > 0) {
        fill(colors.balanceMass[0], colors.balanceMass[1], colors.balanceMass[2]);
        
        const xPos = map(0.15, 0, 1, -shaftHalfLength, shaftHalfLength); // First balancing plane
        const massRadius = map(balance1Mass, 0, 100, 5, 15);
        
        const totalAngle = rotorAngle + radians(balance1Angle);
        const massX = xPos + (unbalanceRadius * scale/2) * cos(totalAngle);
        const massY = (unbalanceRadius * scale/2) * sin(totalAngle);
        
        ellipse(massX, massY, massRadius * 2, massRadius * 2);
    }
    
    if (balance2Mass > 0) {
        fill(colors.balanceMass[0], colors.balanceMass[1], colors.balanceMass[2]);
        
        const xPos = map(0.85, 0, 1, -shaftHalfLength, shaftHalfLength); // Second balancing plane
        const massRadius = map(balance2Mass, 0, 100, 5, 15);
        
        const totalAngle = rotorAngle + radians(balance2Angle);
        const massX = xPos + (unbalanceRadius * scale/2) * cos(totalAngle);
        const massY = (unbalanceRadius * scale/2) * sin(totalAngle);
        
        ellipse(massX, massY, massRadius * 2, massRadius * 2);
    }
}

// Draw force vectors representing reactions at bearings
function drawForceVectors() {
    if (rpm === 0) return;
    
    const scale = 0.7;
    const shaftHalfLength = (shaftLength * scale) / 2;
    const forceScale = 30; // Scale factor for vector display (N to pixels)
    
    // Draw left bearing force
    stroke(colors.force[0], colors.force[1], colors.force[2]);
    strokeWeight(2);
    
    const leftForceMagnitude = Math.sqrt(forceLeft.x * forceLeft.x + forceLeft.y * forceLeft.y);
    if (leftForceMagnitude > 0.01) {
        const leftForceAngle = atan2(forceLeft.y, forceLeft.x);
        const leftVectorLength = constrain(leftForceMagnitude * forceScale, 5, 50);
        drawArrow(-shaftHalfLength, 0, 
                 -shaftHalfLength + leftVectorLength * cos(leftForceAngle), 
                 leftVectorLength * sin(leftForceAngle));
    }
    
    // Draw right bearing force
    const rightForceMagnitude = Math.sqrt(forceRight.x * forceRight.x + forceRight.y * forceRight.y);
    if (rightForceMagnitude > 0.01) {
        const rightForceAngle = atan2(forceRight.y, forceRight.x);
        const rightVectorLength = constrain(rightForceMagnitude * forceScale, 5, 50);
        drawArrow(shaftHalfLength, 0, 
                 shaftHalfLength + rightVectorLength * cos(rightForceAngle), 
                 rightVectorLength * sin(rightForceAngle));
    }
    
    // Show force values
    noStroke();
    fill(colors.text[0], colors.text[1], colors.text[2]);
    textSize(12);
    textAlign(CENTER);
    text(`${leftForceMagnitude.toFixed(2)} N`, -shaftHalfLength, -30);
    text(`${rightForceMagnitude.toFixed(2)} N`, shaftHalfLength, -30);
}

// Helper function to draw an arrow
function drawArrow(x1, y1, x2, y2) {
    line(x1, y1, x2, y2);
    
    const angle = atan2(y2 - y1, x2 - x1);
    const arrowSize = 8;
    
    // Draw arrowhead
    push();
    translate(x2, y2);
    rotate(angle);
    beginShape();
    vertex(0, 0);
    vertex(-arrowSize, -arrowSize/2);
    vertex(-arrowSize, arrowSize/2);
    endShape(CLOSE);
    pop();
}

// Update the forces diagram 
function updateForceDiagram() {
    const forcesDiagram = document.getElementById('forcesDiagram');
    
    // Clear previous content
    while (forcesDiagram.firstChild) {
        forcesDiagram.removeChild(forcesDiagram.firstChild);
    }
    
    // Create diagram title
    const title = document.createElement('h3');
    title.textContent = 'Reaction Forces';
    forcesDiagram.appendChild(title);
    
    // Create force information
    const forceInfo = document.createElement('div');
    forceInfo.innerHTML = `
        <p>Left bearing: ${Math.sqrt(forceLeft.x * forceLeft.x + forceLeft.y * forceLeft.y).toFixed(2)} N</p>
        <p>Right bearing: ${Math.sqrt(forceRight.x * forceRight.x + forceRight.y * forceRight.y).toFixed(2)} N</p>
        <p>Total force: ${totalForce.magnitude.toFixed(2)} N</p>
        <p>Total moment: ${totalMoment.magnitude.toFixed(4)} Nm</p>
    `;
    forcesDiagram.appendChild(forceInfo);
    
    // Add recommendation if forces are high
    if (rpm > 0 && totalForce.magnitude > 0.5) {
        const recommendation = document.createElement('p');
        recommendation.style.color = 'red';
        recommendation.textContent = 'System requires balancing!';
        forcesDiagram.appendChild(recommendation);
    } else if (rpm > 0 && totalForce.magnitude < 0.1) {
        const recommendation = document.createElement('p');
        recommendation.style.color = 'green';
        recommendation.textContent = 'System well balanced.';
        forcesDiagram.appendChild(recommendation);
    }
}

// Update the MR diagram 
function updateMRDiagram() {
    const mrDiagram = document.getElementById('mrDiagram');
    
    // Clear previous content
    while (mrDiagram.firstChild) {
        mrDiagram.removeChild(mrDiagram.firstChild);
    }
    
    // Create diagram title
    const title = document.createElement('h3');
    title.textContent = 'MR Diagram';
    mrDiagram.appendChild(title);
    
    // Create MR vector information
    const mrInfo = document.createElement('div');
    
    // Calculate MR values for unbalance
    const mrUnbalanceText = calculateMRText();
    
    mrInfo.innerHTML = `
        <p>Unbalance MR: ${mrUnbalanceText}</p>
        <p>Balance MR (Left): ${(balance1Mass * unbalanceRadius / 1000).toFixed(4)} kg·m @ ${balance1Angle}°</p>
        <p>Balance MR (Right): ${(balance2Mass * unbalanceRadius / 1000).toFixed(4)} kg·m @ ${balance2Angle}°</p>
        <p>Residual: ${(totalForce.magnitude / ((rpm * 2 * Math.PI) / 60)**2).toFixed(4)} kg·m</p>
    `;
    mrDiagram.appendChild(mrInfo);
}

// Calculate MR text representation based on unbalance type
function calculateMRText() {
    const mr = (unbalanceMass * unbalanceRadius / 1000).toFixed(4);
    
    if (unbalanceType === 'static') {
        return `${mr} kg·m @ ${unbalanceAngle}°`;
    } else if (unbalanceType === 'couple') {
        return `${mr} kg·m @ ${unbalanceAngle}° & ${mr} kg·m @ ${(unbalanceAngle + 180) % 360}°`;
    } else { // dynamic
        const mr2 = ((unbalanceMass * 0.7) * (unbalanceRadius * 0.8) / 1000).toFixed(4);
        return `${mr} kg·m @ ${unbalanceAngle}° & ${mr2} kg·m @ ${(unbalanceAngle + 120) % 360}°`;
    }
}

// Update unbalance configuration based on selected type
function updateUnbalanceConfiguration() {
    switch(unbalanceType) {
        case 'static':
            // Single mass at middle of shaft
            unbalancePosition1 = 0.5;
            break;
        case 'couple':
            // Two equal masses 180° apart
            unbalancePosition1 = 0.25;
            unbalancePosition2 = 0.75;
            break;
        case 'dynamic':
            // Two masses at different angles
            unbalancePosition1 = 0.25;
            unbalancePosition2 = 0.75;
            break;
    }
}

// Function to set up event listeners for all UI controls
function setupEventListeners() {
    // RPM slider
    const rpmSlider = document.getElementById('rpmSlider');
    const rpmValue = document.getElementById('rpmValue');
    
    rpmSlider.addEventListener('input', function() {
        rpm = parseInt(this.value);
        rpmValue.value = rpm;
        calculateForces();
    });
    
    rpmValue.addEventListener('change', function() {
        rpm = parseInt(this.value);
        rpmSlider.value = rpm;
        calculateForces();
    });
    
    // Shaft length slider
    const shaftLengthSlider = document.getElementById('shaftLengthSlider');
    const shaftLengthValue = document.getElementById('shaftLengthValue');
    
    shaftLengthSlider.addEventListener('input', function() {
        shaftLength = parseInt(this.value);
        shaftLengthValue.value = shaftLength;
        calculateForces();
    });
    
    shaftLengthValue.addEventListener('change', function() {
        shaftLength = parseInt(this.value);
        shaftLengthSlider.value = shaftLength;
        calculateForces();
    });
    
    // Unbalance type select
    const unbalanceTypeSelect = document.getElementById('unbalanceTypeSelect');
    unbalanceTypeSelect.addEventListener('change', function() {
        unbalanceType = this.value;
        updateUnbalanceConfiguration();
        calculateForces();
    });
    
    // Unbalance mass slider
    const massSlider = document.getElementById('massSlider');
    const massValue = document.getElementById('massValue');
    
    massSlider.addEventListener('input', function() {
        unbalanceMass = parseInt(this.value);
        massValue.value = unbalanceMass;
        calculateForces();
    });
    
    massValue.addEventListener('change', function() {
        unbalanceMass = parseInt(this.value);
        massSlider.value = unbalanceMass;
        calculateForces();
    });
    
    // Unbalance radius slider
    const radiusSlider = document.getElementById('radiusSlider');
    const radiusValue = document.getElementById('radiusValue');
    
    radiusSlider.addEventListener('input', function() {
        unbalanceRadius = parseInt(this.value);
        radiusValue.value = unbalanceRadius;
        calculateForces();
    });
    
    radiusValue.addEventListener('change', function() {
        unbalanceRadius = parseInt(this.value);
        radiusSlider.value = unbalanceRadius;
        calculateForces();
    });
    
    // Unbalance angle slider
    const angleSlider = document.getElementById('angleSlider');
    const angleValue = document.getElementById('angleValue');
    
    angleSlider.addEventListener('input', function() {
        unbalanceAngle = parseInt(this.value);
        angleValue.value = unbalanceAngle;
        calculateForces();
    });
    
    angleValue.addEventListener('change', function() {
        unbalanceAngle = parseInt(this.value);
        angleSlider.value = unbalanceAngle;
        calculateForces();
    });
    
    // Balance 1 mass slider
    const balance1MassSlider = document.getElementById('balance1MassSlider');
    const balance1MassValue = document.getElementById('balance1MassValue');
    
    balance1MassSlider.addEventListener('input', function() {
        balance1Mass = parseInt(this.value);
        balance1MassValue.value = balance1Mass;
        calculateForces();
    });
    
    balance1MassValue.addEventListener('change', function() {
        balance1Mass = parseInt(this.value);
        balance1MassSlider.value = balance1Mass;
        calculateForces();
    });
    
    // Balance 1 angle slider
    const balance1AngleSlider = document.getElementById('balance1AngleSlider');
    const balance1AngleValue = document.getElementById('balance1AngleValue');
    
    balance1AngleSlider.addEventListener('input', function() {
        balance1Angle = parseInt(this.value);
        balance1AngleValue.value = balance1Angle;
        calculateForces();
    });
    
    balance1AngleValue.addEventListener('change', function() {
        balance1Angle = parseInt(this.value);
        balance1AngleSlider.value = balance1Angle;
        calculateForces();
    });
    
    // Balance 2 mass slider
    const balance2MassSlider = document.getElementById('balance2MassSlider');
    const balance2MassValue = document.getElementById('balance2MassValue');
    
    balance2MassSlider.addEventListener('input', function() {
        balance2Mass = parseInt(this.value);
        balance2MassValue.value = balance2Mass;
        calculateForces();
    });
    
    balance2MassValue.addEventListener('change', function() {
        balance2Mass = parseInt(this.value);
        balance2MassSlider.value = balance2Mass;
        calculateForces();
    });
    
    // Balance 2 angle slider
    const balance2AngleSlider = document.getElementById('balance2AngleSlider');
    const balance2AngleValue = document.getElementById('balance2AngleValue');
    
    balance2AngleSlider.addEventListener('input', function() {
        balance2Angle = parseInt(this.value);
        balance2AngleValue.value = balance2Angle;
        calculateForces();
    });
    
    balance2AngleValue.addEventListener('change', function() {
        balance2Angle = parseInt(this.value);
        balance2AngleSlider.value = balance2Angle;
        calculateForces();
    });
    
    // Button event listeners
    const calcBalanceBtn = document.getElementById('calcBalanceBtn');
    calcBalanceBtn.addEventListener('click', calculateBalanceWeights);
    
    const applyBalanceBtn = document.getElementById('applyBalanceBtn');
    applyBalanceBtn.addEventListener('click', applyBalanceWeights);
    
    const resetBtn = document.getElementById('resetBtn');
    resetBtn.addEventListener('click', resetSimulation);
}