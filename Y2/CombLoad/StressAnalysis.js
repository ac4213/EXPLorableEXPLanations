// Global variables for sketches
let axialSketch, shearSketch, bendingSketch, torsionSketch, combinedSketch;

// When the window loads, initialize all sketches
window.onload = function() {
  axialSketch = new p5(createAxialSketch, 'axial-simulation');
  shearSketch = new p5(createShearSketch, 'shear-simulation');
  bendingSketch = new p5(createBendingSketch, 'bending-simulation');
  torsionSketch = new p5(createTorsionSketch, 'torsion-simulation');
  combinedSketch = new p5(createCombinedSketch, 'combined-simulation');
};

// Common colors
const colors = {
  background: [245, 245, 245],
  material: [200, 200, 200],
  tension: [255, 100, 100],
  compression: [100, 100, 255],
  shear: [100, 255, 100],
  grid: [180, 180, 180],
  text: [50, 50, 50],
  arrow: [255, 165, 0]
};

// Helper function to draw arrows
function drawArrow(p, x1, y1, x2, y2, headSize) {
  p.push();
  p.stroke(colors.arrow);
  p.strokeWeight(2);
  p.fill(colors.arrow);
  
  // Draw line
  p.line(x1, y1, x2, y2);
  
  // Calculate direction and angle
  let angle = p.atan2(y2 - y1, x2 - x1);
  
  // Draw arrowhead
  p.translate(x2, y2);
  p.rotate(angle);
  p.triangle(0, 0, -headSize, -headSize/2, -headSize, headSize/2);
  
  p.pop();
}

// Helper function to draw a stress indicator
function drawStressIndicator(p, x, y, value, maxValue, isCompression, isShear = false) {
  const maxLength = 40;
  const length = (value / maxValue) * maxLength;
  
  p.push();
  if (isShear) {
    p.fill(colors.shear);
    p.stroke(0);
    p.rect(x, y, length, 5);
  } else if (isCompression) {
    p.fill(colors.compression);
    p.stroke(0);
    p.rect(x, y, -length, 5);
  } else {
    p.fill(colors.tension);
    p.stroke(0);
    p.rect(x, y, length, 5);
  }
  p.pop();
}

// Axial Stress Sketch
function createAxialSketch(p) {
  let axialForce, crossArea;
  const barWidth = 50;
  let barLength, originalLength;
  const maxDeformation = 50;
  
  p.setup = function() {
    p.createCanvas(p.windowWidth * 0.8, 300);
    p.textAlign(p.CENTER, p.CENTER);
    
    // Initialize variables
    axialForce = document.getElementById('axial-force').value;
    crossArea = document.getElementById('axial-area').value;
    barLength = p.width * 0.6;
    originalLength = barLength;
    
    // Add event listeners
    document.getElementById('axial-force').addEventListener('input', updateAxialForce);
    document.getElementById('axial-area').addEventListener('input', updateCrossArea);
  };
  
  p.draw = function() {
    p.background(colors.background);
    
    // Calculate stress
    const stress = (axialForce / crossArea);
    const maxStress = 100 / 1; // Max force / Min area
    const stressPercentage = stress / maxStress;
    
    // Calculate deformation
    const deformation = stressPercentage * maxDeformation;
    barLength = originalLength - deformation;
    
    // Draw fixed end
    p.fill(100);
    p.rect(p.width * 0.1, p.height/2 - 100, 10, 200);
    
    // Draw bar
    p.fill(colors.material);
    p.rect(p.width * 0.1 + 10, p.height/2 - barWidth/2, barLength, barWidth);
    
    // Draw force arrows
    const arrowX = p.width * 0.1 + 10 + barLength + 30;
    for (let i = 0; i < 5; i++) {
      drawArrow(p, arrowX, p.height/2 - 40 + i*20, arrowX - 20, p.height/2 - 40 + i*20, 8);
    }
    
    // Draw stress distribution
    p.fill(0);
    p.textSize(14);
    p.text("Stress Distribution", p.width * 0.5, 30);
    
    // Draw cross section
    p.fill(colors.material);
    p.ellipse(p.width * 0.7, p.height/2, crossArea * 15, crossArea * 15);
    
    // Draw stress arrows on cross section
    const radius = crossArea * 7.5;
    const centerX = p.width * 0.7;
    const centerY = p.height/2;
    const numArrows = 16;
    const isCompression = true;
    
    for (let i = 0; i < numArrows; i++) {
      const angle = (i * p.TWO_PI) / numArrows;
      const x = centerX + radius * p.cos(angle);
      const y = centerY + radius * p.sin(angle);
      const arrowLength = 15 * stressPercentage;
      
      // Direction is inward for compression, outward for tension
      const dirX = -p.cos(angle) * arrowLength;
      const dirY = -p.sin(angle) * arrowLength;
      
      drawArrow(p, x, y, x + dirX, y + dirY, 5);
    }
    
    // Display stress value
    p.fill(0);
    p.textSize(16);
    p.text(`Axial Stress: ${stress.toFixed(2)} MPa`, p.width * 0.5, p.height - 30);
    
    // Label
    p.text(`Axial Force (P)`, arrowX, p.height/2 + 50);
  };
  
  function updateAxialForce() {
    axialForce = document.getElementById('axial-force').value;
  }
  
  function updateCrossArea() {
    crossArea = document.getElementById('axial-area').value;
  }
  
  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth * 0.8, 300);
    barLength = p.width * 0.6;
    originalLength = barLength;
  };
}

// Shear Stress Sketch
function createShearSketch(p) {
  let shearForce, beamHeight;
  const beamWidth = 200;
  const beamThickness = 20;
  
  p.setup = function() {
    p.createCanvas(p.windowWidth * 0.8, 300);
    p.textAlign(p.CENTER, p.CENTER);
    
    // Initialize variables
    shearForce = document.getElementById('shear-force').value;
    beamHeight = document.getElementById('beam-height').value * 20;
    
    // Add event listeners
    document.getElementById('shear-force').addEventListener('input', updateShearForce);
    document.getElementById('beam-height').addEventListener('input', updateBeamHeight);
  };
  
  p.draw = function() {
    p.background(colors.background);
    
    // Calculate parameters
    const normalizedForce = shearForce / 100; // Normalize to 0-1
    const maxShearStress = (3 * shearForce) / (2 * beamWidth * beamThickness);
    
    // Draw beam cross section (rectangular)
    p.push();
    p.translate(p.width * 0.3, p.height/2);
    p.fill(colors.material);
    p.rect(-beamWidth/2, -beamHeight/2, beamWidth, beamHeight);
    
    // Draw neutral axis
    p.stroke(100);
    p.strokeWeight(1);
    p.line(-beamWidth/2, 0, beamWidth/2, 0);
    p.noStroke();
    
    // Draw shear stress distribution (parabolic)
    const numLayers = 20;
    const layerHeight = beamHeight / numLayers;
    
    for (let i = 0; i < numLayers; i++) {
      const y = -beamHeight/2 + i * layerHeight + layerHeight/2;
      const normalizedY = 2 * y / beamHeight; // -1 to 1
      const stressValue = maxShearStress * (1 - normalizedY * normalizedY);
      const width = stressValue / maxShearStress * 50 * normalizedForce;
      
      p.fill(colors.shear[0], colors.shear[1], colors.shear[2], 200);
      p.rect(beamWidth/2, y - layerHeight/2, width, layerHeight);
    }
    p.pop();
    
    // Draw longitudinal view
    p.push();
    p.translate(p.width * 0.7, p.height/2);
    p.fill(colors.material);
    p.rect(-beamHeight/2, -beamWidth/4, beamHeight, beamWidth/2);
    
    // Draw deformation (exaggerated)
    const deformation = normalizedForce * 10;
    p.beginShape();
    p.fill(200, 200, 200, 100);
    p.vertex(-beamHeight/2, -beamWidth/4);
    p.vertex(-beamHeight/2 + deformation, -beamWidth/4);
    p.vertex(beamHeight/2 - deformation, beamWidth/4);
    p.vertex(beamHeight/2, beamWidth/4);
    p.endShape(p.CLOSE);
    
    // Draw shear force arrows
    drawArrow(p, 0, -beamWidth/4 - 20, 0, -beamWidth/4 - 5, 5);
    drawArrow(p, 0, beamWidth/4 + 20, 0, beamWidth/4 + 5, 5);
    p.pop();
    
    // Display values
    p.fill(0);
    p.textSize(16);
    p.text(`Maximum Shear Stress: ${maxShearStress.toFixed(2)} MPa`, p.width * 0.5, p.height - 30);
    p.text(`Shear Stress Distribution (Parabolic)`, p.width * 0.3, 30);
    p.text(`Shear Deformation (Exaggerated)`, p.width * 0.7, 30);
  };
  
  function updateShearForce() {
    shearForce = document.getElementById('shear-force').value;
  }
  
  function updateBeamHeight() {
    beamHeight = document.getElementById('beam-height').value * 20;
  }
  
  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth * 0.8, 300);
  };
}


// Bending Stress Sketch
function createBendingSketch(p) {
  let bendingMoment, beamType;
  const beamLength = 200;
  
  p.setup = function() {
    p.createCanvas(p.windowWidth * 0.8, 300);
    p.textAlign(p.CENTER, p.CENTER);
    p.angleMode(p.DEGREES);
    
    // Initialize variables
    bendingMoment = document.getElementById('bending-moment').value;
    beamType = document.getElementById('beam-type').value;
    
    // Add event listeners
    document.getElementById('bending-moment').addEventListener('input', updateBendingMoment);
    document.getElementById('beam-type').addEventListener('change', updateBeamType);
  };
  
  p.draw = function() {
    p.background(colors.background);
    
    // Calculate parameters
    const normalizedMoment = bendingMoment / 1000; // Normalize to 0-1
    const curvature = normalizedMoment * 0.2;
    
    // Draw beam before deformation
    p.push();
    p.translate(p.width * 0.5, p.height * 0.4);
    p.fill(220, 220, 220, 150);
    p.rect(-beamLength/2, -10, beamLength, 20);
    p.pop();
    
    // Draw deformed beam
    p.push();
    p.translate(p.width * 0.5, p.height * 0.4);
    p.fill(colors.material);
    
    // Draw curved beam
    p.beginShape();
    for (let x = -beamLength/2; x <= beamLength/2; x += 5) {
      const y = curvature * x * x / 100;
      p.vertex(x, y);
    }
    for (let x = beamLength/2; x >= -beamLength/2; x -= 5) {
      const y = curvature * x * x / 100 + 20;
      p.vertex(x, y);
    }
    p.endShape(p.CLOSE);
    
    // Draw moment arrows
    const arrowSize = 15;
    drawArrow(p, -beamLength/2 - 20, -20, -beamLength/2 - 20, 20, arrowSize);
    drawArrow(p, -beamLength/2 - 40, 20, -beamLength/2 - 40, -20, arrowSize);
    drawArrow(p, beamLength/2 + 20, 20, beamLength/2 + 20, -20, arrowSize);
    drawArrow(p, beamLength/2 + 40, -20, beamLength/2 + 40, 20, arrowSize);
    
    p.pop();
    
    // Draw cross section
    p.push();
    p.translate(p.width * 0.5, p.height * 0.7);
    
    let maxDistance = 0;
    let momentOfInertia = 0;
    
    if (beamType === 'rectangular') {
      const width = 80;
      const height = 50;
      maxDistance = height / 2;
      momentOfInertia = width * height * height * height / 12;
      
      // Draw rectangular section
      p.fill(colors.material);
      p.rect(-width/2, -height/2, width, height);
      
      // Draw neutral axis
      p.stroke(100);
      p.strokeWeight(1);
      p.line(-width/2, 0, width/2, 0);
      p.noStroke();
      
      // Draw stress distribution
      const stressAtEdge = (bendingMoment * maxDistance) / momentOfInertia;
      const numLayers = 10;
      const layerHeight = height / numLayers;
      
      for (let i = 0; i < numLayers; i++) {
        const y = -height/2 + i * layerHeight + layerHeight/2;
        const stress = (bendingMoment * y) / momentOfInertia;
        const normalizedStress = stress / stressAtEdge;
        
        if (y < 0) {
          // Compression zone (above neutral axis)
          drawStressIndicator(p, 0, y, -normalizedStress * 40, 40, true);
        } else {
          // Tension zone (below neutral axis)
          drawStressIndicator(p, 0, y, normalizedStress * 40, 40, false);
        }
      }
      
    } else if (beamType === 'i-beam') {
      const flangeWidth = 80;
      const flangeHeight = 15;
      const webHeight = 40;
      const webWidth = 10;
      maxDistance = (webHeight + 2 * flangeHeight) / 2;
      
      // Approximate moment of inertia for I-beam
      const h = webHeight + 2 * flangeHeight;
      momentOfInertia = (flangeWidth * h * h * h / 12) - ((flangeWidth - webWidth) * webHeight * webHeight * webHeight / 12);
      
      // Draw I-beam section
      p.fill(colors.material);
      // Top flange
      p.rect(-flangeWidth/2, -webHeight/2 - flangeHeight, flangeWidth, flangeHeight);
      // Web
      p.rect(-webWidth/2, -webHeight/2, webWidth, webHeight);
      // Bottom flange
      p.rect(-flangeWidth/2, webHeight/2, flangeWidth, flangeHeight);
      
      // Draw neutral axis
      p.stroke(100);
      p.strokeWeight(1);
      p.line(-flangeWidth/2, 0, flangeWidth/2, 0);
      p.noStroke();
      
      // Draw stress distribution
      const stressAtEdge = (bendingMoment * maxDistance) / momentOfInertia;
      const numLayers = 14;
      const totalHeight = webHeight + 2 * flangeHeight;
      const layerHeight = totalHeight / numLayers;
      
      for (let i = 0; i < numLayers; i++) {
        const y = -totalHeight/2 + i * layerHeight + layerHeight/2;
        const stress = (bendingMoment * y) / momentOfInertia;
        const normalizedStress = stress / stressAtEdge;
        
        if (y < 0) {
          // Compression zone (above neutral axis)
          drawStressIndicator(p, 0, y, -normalizedStress * 40, 40, true);
        } else {
          // Tension zone (below neutral axis)
          drawStressIndicator(p, 0, y, normalizedStress * 40, 40, false);
        }
      }
      
    } else if (beamType === 'circular') {
      const radius = 30;
      maxDistance = radius;
      momentOfInertia = Math.PI * radius * radius * radius * radius / 4;
      
      // Draw circular section
      p.fill(colors.material);
      p.circle(0, 0, radius * 2);
      
      // Draw neutral axis
      p.stroke(100);
      p.strokeWeight(1);
      p.line(-radius, 0, radius, 0);
      p.noStroke();
      
      // Draw stress distribution
      const stressAtEdge = (bendingMoment * maxDistance) / momentOfInertia;
      const numLayers = 10;
      const layerHeight = 2 * radius / numLayers;
      
      for (let i = 0; i < numLayers; i++) {
        const y = -radius + i * layerHeight + layerHeight/2;
        const stress = (bendingMoment * y) / momentOfInertia;
        const normalizedStress = stress / stressAtEdge;
        
        if (y < 0) {
          // Compression zone (above neutral axis)
          drawStressIndicator(p, 0, y, -normalizedStress * 40, 40, true);
        } else {
          // Tension zone (below neutral axis)
          drawStressIndicator(p, 0, y, normalizedStress * 40, 40, false);
        }
      }
    }
    
    // Display max stress
    const maxStress = (bendingMoment * maxDistance) / momentOfInertia;
    p.fill(0);
    p.textSize(12);
    p.text("Compression", -60, -maxDistance - 15);
    p.text("Tension", -60, maxDistance + 15);
    
    p.pop();
    
    // Display values
    p.fill(0);
    p.textSize(16);
    p.text(`Maximum Bending Stress: ${maxStress.toFixed(2)} MPa`, p.width * 0.5, p.height - 30);
    p.text(`Bending Stress Distribution (Linear)`, p.width * 0.5, 30);
    p.text(`Neutral Axis`, p.width * 0.5, p.height * 0.7);
  };
  
  function updateBendingMoment() {
    bendingMoment = document.getElementById('bending-moment').value;
  }
  
  function updateBeamType() {
    beamType = document.getElementById('beam-type').value;
  }
  
  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth * 0.8, 300);
  };
}

// Torsional Stress Sketch
function createTorsionSketch(p) {
  let torque, shaftDiameter, shaftType;
  const shaftLength = 200;
  
  p.setup = function() {
    p.createCanvas(p.windowWidth * 0.8, 300);
    p.textAlign(p.CENTER, p.CENTER);
    p.angleMode(p.DEGREES);
    
    // Initialize variables
    torque = document.getElementById('torque').value;
    shaftDiameter = document.getElementById('shaft-diameter').value * 10;
    shaftType = document.getElementById('shaft-type').value;
    
    // Add event listeners
    document.getElementById('torque').addEventListener('input', updateTorque);
    document.getElementById('shaft-diameter').addEventListener('input', updateShaftDiameter);
    document.getElementById('shaft-type').addEventListener('change', updateShaftType);
  };
  
  p.draw = function() {
    p.background(colors.background);
    
    // Calculate parameters
    const normalizedTorque = torque / 100; // Normalize to 0-1
    const twist = normalizedTorque * 30; // in degrees
    
    // Draw shaft longitudinal view
    p.push();
    p.translate(p.width * 0.3, p.height * 0.4);
    
    // Draw undeformed shaft (transparent)
    p.fill(220, 220, 220, 150);
    p.rect(-shaftLength/2, -shaftDiameter/4, shaftLength, shaftDiameter/2);
    
    // Draw deformed shaft
    p.fill(colors.material);
    
    // Draw twisted shaft (simplified representation)
    let twistIncrement = twist / 10;
    p.beginShape();
    for (let i = 0; i <= 10; i++) {
      let x = -shaftLength/2 + i * shaftLength/10;
      let angle = i * twistIncrement;
      let yTop = -shaftDiameter/4 * p.cos(angle);
      let yBottom = shaftDiameter/4 * p.cos(angle);
      
      if (i === 0) {
        p.vertex(x, yTop);
      } else {
        p.vertex(x, yTop);
      }
    }
    for (let i = 10; i >= 0; i--) {
      let x = -shaftLength/2 + i * shaftLength/10;
      let angle = i * twistIncrement;
      let yBottom = shaftDiameter/4 * p.cos(angle);
      
      p.vertex(x, yBottom);
    }
    p.endShape(p.CLOSE);
    
    // Draw torque arrows
    p.push();
    p.translate(-shaftLength/2 - 20, 0);
    p.noFill();
    p.stroke(colors.arrow);
    p.strokeWeight(2);
    p.arc(0, 0, 40, 40, 230, 490);
    p.pop();
    
    p.push();
    p.translate(shaftLength/2 + 20, 0);
    p.noFill();
    p.stroke(colors.arrow);
    p.strokeWeight(2);
    p.arc(0, 0, 40, 40, 50, 310);
    p.pop();
    
    p.pop();
    
    // Draw cross section
    p.push();
    p.translate(p.width * 0.7, p.height * 0.4);
    
    let outerRadius = shaftDiameter / 2;
    let innerRadius = shaftType === 'hollow' ? outerRadius * 0.7 : 0;
    let polarMomentOfInertia = 0;
    
    if (shaftType === 'solid') {
      // J for solid shaft
      polarMomentOfInertia = Math.PI * Math.pow(outerRadius, 4) / 2;
      
      // Draw solid shaft
      p.fill(colors.material);
      p.circle(0, 0, outerRadius * 2);
      
    } else if (shaftType === 'hollow') {
      // J for hollow shaft
      polarMomentOfInertia = Math.PI * (Math.pow(outerRadius, 4) - Math.pow(innerRadius, 4)) / 2;
      
      // Draw hollow shaft
      p.fill(colors.material);
      p.circle(0, 0, outerRadius * 2);
      p.fill(colors.background);
      p.circle(0, 0, innerRadius * 2);
    }
    
    // Draw shear stress contours (circles)
    const maxStress = (torque * outerRadius) / polarMomentOfInertia;
    const numContours = 5;
    
    for (let i = 1; i <= numContours; i++) {
      const ratio = i / numContours;
      const stressRatio = ratio;
      const radiusRatio = ratio;
      const contourRadius = radiusRatio * outerRadius;
      
      if (contourRadius > innerRadius) {
        const alpha = 100 + 155 * stressRatio;
        p.stroke(100, 255, 100, alpha);
        p.strokeWeight(1);
        p.noFill();
        p.circle(0, 0, contourRadius * 2);
      }
    }
    
    // Draw stress arrows (shear)
    const numArrows = 16;
    for (let i = 0; i < numArrows; i++) {
      const angle = (i * p.TWO_PI) / numArrows;
      const arrowDistance = outerRadius * 0.85;
      const x = arrowDistance * p.cos(angle);
      const y = arrowDistance * p.sin(angle);
      
      p.push();
      p.translate(x, y);
      p.rotate(angle + 90);
      
      p.stroke(0, 200, 0);
      p.strokeWeight(1);
      p.line(-5, 0, 5, 0);
      p.triangle(5, 0, 2, -2, 2, 2);
      p.pop();
    }
    
    p.pop();
    
    // Display values
    const maxShearStress = (torque * outerRadius) / polarMomentOfInertia;
    p.fill(0);
    p.textSize(16);
    p.text(`Maximum Torsional Stress: ${maxShearStress.toFixed(2)} MPa`, p.width * 0.5, p.height - 30);
    p.text(`Twisted Shaft (Angle: ${twist.toFixed(1)}°)`, p.width * 0.3, p.height * 0.2);
    p.text(`Torsional Stress Distribution`, p.width * 0.7, p.height * 0.2);
    
    // Legend
    p.textSize(12);
    p.text("(Varies linearly with radius)", p.width * 0.7, p.height * 0.25);
    
    // Draw stress distribution graph
    p.push();
    p.translate(p.width * 0.5, p.height * 0.7);
    
    // Axes
    p.stroke(0);
    p.strokeWeight(1);
    p.line(-100, 0, 100, 0); // r-axis
    p.line(0, 50, 0, -50); // tau-axis
    
    // Labels
    p.noStroke();
    p.fill(0);
    p.text("r", 110, 5);
    p.text("τ", 5, -55);
    
    // Stress distribution line (linear)
    p.stroke(0, 150, 0);
    p.strokeWeight(2);
    p.line(-outerRadius, 0, outerRadius, 0);
    p.line(-outerRadius, 0, 0, -40 * normalizedTorque);
    p.line(0, -40 * normalizedTorque, outerRadius, 0);
    
    // Hollow shaft inner radius markers if applicable
    if (shaftType === 'hollow') {
      p.stroke(150);
      p.strokeWeight(1);
      p.line(-innerRadius, -5, -innerRadius, 5);
      p.line(innerRadius, -5, innerRadius, 5);
      p.noStroke();
      p.fill(150);
      p.text("Inner Radius", innerRadius + 5, 15);
    }
    
    p.noStroke();
    p.fill(0);
    p.text("Linear Variation", 0, 40);
    
    p.pop();
  };
  
  function updateTorque() {
    torque = document.getElementById('torque').value;
  }
  
  function updateShaftDiameter() {
    shaftDiameter = document.getElementById('shaft-diameter').value * 10;
  }
  
  function updateShaftType() {
    shaftType = document.getElementById('shaft-type').value;
  }
  
  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth * 0.8, 300);
  };
}

// Combined Stresses Sketch
function createCombinedSketch(p) {
  let normalStressX, normalStressY, shearStressXY;
  const elementSize = 100;
  
  p.setup = function() {
    p.createCanvas(p.windowWidth * 0.8, 300);
    p.textAlign(p.CENTER, p.CENTER);
    p.angleMode(p.DEGREES);
    
    // Initialize variables
    normalStressX = document.getElementById('normal-stress-x').value;
    normalStressY = document.getElementById('normal-stress-y').value;
    shearStressXY = document.getElementById('shear-stress-xy').value;
    
    // Add event listeners
    document.getElementById('normal-stress-x').addEventListener('input', updateNormalStressX);
    document.getElementById('normal-stress-y').addEventListener('input', updateNormalStressY);
    document.getElementById('shear-stress-xy').addEventListener('input', updateShearStressXY);
  };
  
  p.draw = function() {
    p.background(colors.background);
    
    // Calculate principal stresses
    const avgStress = (parseFloat(normalStressX) + parseFloat(normalStressY)) / 2;
    const diffStress = (parseFloat(normalStressX) - parseFloat(normalStressY)) / 2;
    const radius = Math.sqrt(Math.pow(diffStress, 2) + Math.pow(shearStressXY, 2));
    
    const sigma1 = avgStress + radius;
    const sigma2 = avgStress - radius;
    
    // Calculate principal angle
    let theta_p = 0.5 * Math.atan2(2 * shearStressXY, normalStressX - normalStressY);
    theta_p = theta_p * 180 / Math.PI; // Convert to degrees
    
    // Calculate von Mises stress
    const vonMisesStress = Math.sqrt(Math.pow(sigma1, 2) - sigma1 * sigma2 + Math.pow(sigma2, 2));
    
    // Draw 2D element before deformation
    p.push();
    p.translate(p.width * 0.3, p.height * 0.45);
    p.stroke(0);
    p.strokeWeight(1);
    p.fill(220, 220, 220, 150);
    p.rect(-elementSize/2, -elementSize/2, elementSize, elementSize);
    p.pop();
    
    // Draw deformed element
    p.push();
    p.translate(p.width * 0.3, p.height * 0.45);
    
    // Scaling factors for visualization
    const scaleX = normalStressX / 100;
    const scaleY = normalStressY / 100;
    const scaleShear = shearStressXY / 50;
    
    // Calculate deformed corners
    let deformedX = elementSize * (1 + 0.2 * scaleX);
    let deformedY = elementSize * (1 + 0.2 * scaleY);
    let shearDeformation = elementSize * 0.2 * scaleShear;
    
    p.fill(colors.material);
    p.beginShape();
    p.vertex(-deformedX/2, -deformedY/2 + shearDeformation);
    p.vertex(deformedX/2, -deformedY/2 - shearDeformation);
    p.vertex(deformedX/2, deformedY/2 + shearDeformation);
    p.vertex(-deformedX/2, deformedY/2 - shearDeformation);
    p.endShape(p.CLOSE);
    
    // Draw normal stress arrows (x-direction)
    if (normalStressX !== 0) {
      const dirX = normalStressX > 0 ? -1 : 1; // Outward for tension, inward for compression
      const arrowLength = Math.abs(normalStressX) / 5;
      
      // Left side
      drawArrow(p, -deformedX/2 - 10, -deformedY/4, -deformedX/2 - 10 - dirX * arrowLength, -deformedY/4, 5);
      drawArrow(p, -deformedX/2 - 10, deformedY/4, -deformedX/2 - 10 - dirX * arrowLength, deformedY/4, 5);
      
      // Right side
      drawArrow(p, deformedX/2 + 10, -deformedY/4, deformedX/2 + 10 - dirX * arrowLength, -deformedY/4, 5);
      drawArrow(p, deformedX/2 + 10, deformedY/4, deformedX/2 + 10 - dirX * arrowLength, deformedY/4, 5);
      
      // Label
      p.fill(0);
      p.textSize(12);
      p.text(`σx = ${normalStressX} MPa`, 0, -deformedY/2 - 25);
    }
    
    // Draw normal stress arrows (y-direction)
    if (normalStressY !== 0) {
      const dirY = normalStressY > 0 ? -1 : 1; // Outward for tension, inward for compression
      const arrowLength = Math.abs(normalStressY) / 5;
      
      // Top side
      drawArrow(p, -deformedX/4, -deformedY/2 - 10, -deformedX/4, -deformedY/2 - 10 - dirY * arrowLength, 5);
      drawArrow(p, deformedX/4, -deformedY/2 - 10, deformedX/4, -deformedY/2 - 10 - dirY * arrowLength, 5);
      
      // Bottom side
      drawArrow(p, -deformedX/4, deformedY/2 + 10, -deformedX/4, deformedY/2 + 10 - dirY * arrowLength, 5);
      drawArrow(p, deformedX/4, deformedY/2 + 10, deformedX/4, deformedY/2 + 10 - dirY * arrowLength, 5);
      
      // Label
      p.fill(0);
      p.textSize(12);
      p.text(`σy = ${normalStressY} MPa`, -deformedX/2 - 60, 0);
    }
    
    // Draw shear stress arrows
    if (shearStressXY !== 0) {
      const arrowLength = Math.abs(shearStressXY) / 3;
      const dirShear = shearStressXY > 0 ? 1 : -1;
      
      // Draw shear arrows on each face
      // Top face
      drawArrow(p, -deformedX/4, -deformedY/2 - 5, -deformedX/4 + dirShear * arrowLength, -deformedY/2 - 5, 5);
      drawArrow(p, deformedX/4, -deformedY/2 - 5, deformedX/4 - dirShear * arrowLength, -deformedY/2 - 5, 5);
      
      // Right face
      drawArrow(p, deformedX/2 + 5, -deformedY/4, deformedX/2 + 5, -deformedY/4 + dirShear * arrowLength, 5);
      drawArrow(p, deformedX/2 + 5, deformedY/4, deformedX/2 + 5, deformedY/4 - dirShear * arrowLength, 5);
      
      // Bottom face
      drawArrow(p, -deformedX/4, deformedY/2 + 5, -deformedX/4 - dirShear * arrowLength, deformedY/2 + 5, 5);
      drawArrow(p, deformedX/4, deformedY/2 + 5, deformedX/4 + dirShear * arrowLength, deformedY/2 + 5, 5);
      
      // Left face
      drawArrow(p, -deformedX/2 - 5, -deformedY/4, -deformedX/2 - 5, -deformedY/4 - dirShear * arrowLength, 5);
      drawArrow(p, -deformedX/2 - 5, deformedY/4, -deformedX/2 - 5, deformedY/4 + dirShear * arrowLength, 5);
      
      // Label
      p.push();
      p.translate(deformedX/2 + 25, -deformedY/2 - 10);
      p.fill(0);
      p.textSize(12);
      p.text(`τxy = ${shearStressXY} MPa`, 0, 0);
      p.pop();
    }
    
    p.pop();
    
    // Draw Mohr's Circle
    p.push();
    p.translate(p.width * 0.7, p.height * 0.45);
    
    // Draw axes
    p.stroke(0);
    p.strokeWeight(1);
    p.line(-80, 0, 80, 0); // σ-axis
    p.line(0, -60, 0, 60); // τ-axis
    
    // Labels
    p.noStroke();
    p.fill(0);
    p.textSize(12);
    p.text("σ", 85, 5);
    p.text("τ", 10, -65);
    
    // Draw Mohr's circle
    p.stroke(0, 0, 200);
    p.strokeWeight(1);
    p.noFill();
    p.circle(avgStress / 2, 0, radius);
    
    // Draw points for the initial stress state
    p.fill(200, 0, 0);
    p.noStroke();
    p.circle(normalStressX / 2, shearStressXY / 2, 5); // (σx, τxy)
    p.circle(normalStressY / 2, -shearStressXY / 2, 5); // (σy, -τxy)
    
    // Draw principal stress points
    p.fill(0, 0, 200);
    p.circle(sigma1 / 2, 0, 5); // σ1
    p.circle(sigma2 / 2, 0, 5); // σ2
    
    // Label principal stresses
    p.fill(0);
    p.text(`σ1 = ${sigma1.toFixed(1)} MPa`, sigma1 / 2, -10);
    p.text(`σ2 = ${sigma2.toFixed(1)} MPa`, sigma2 / 2, 15);
    
    p.pop();
    
    // Display principal stresses and directions
    p.fill(0);
    p.textSize(16);
    p.text(`Principal Stresses: σ1 = ${sigma1.toFixed(1)} MPa, σ2 = ${sigma2.toFixed(1)} MPa`, p.width * 0.5, p.height - 50);
    p.text(`Principal Angle: θp = ${theta_p.toFixed(1)}°`, p.width * 0.5, p.height - 30);
    p.text(`von Mises Stress: σvm = ${vonMisesStress.toFixed(1)} MPa`, p.width * 0.5, p.height - 10);
    
    // Titles
    p.text(`Stress Element (Deformed)`, p.width * 0.3, 30);
    p.text(`Mohr's Circle`, p.width * 0.7, 30);
  };
  
  function updateNormalStressX() {
    normalStressX = document.getElementById('normal-stress-x').value;
  }
  
  function updateNormalStressY() {
    normalStressY = document.getElementById('normal-stress-y').value;
  }
  
  function updateShearStressXY() {
    shearStressXY = document.getElementById('shear-stress-xy').value;
  }
  
  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth * 0.8, 300);
  };
}