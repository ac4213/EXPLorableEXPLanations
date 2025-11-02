// Gear Trains Interactive Simulations
// Four p5.js sketches for different gear train concepts

// Global variables for control values
let involuteSketch, simpleGearSketch, compoundGearSketch, epicyclicSketch;

// ============== SIMULATION 1: ISO STANDARD INVOLUTE GEAR WITH TEETH ==============
const involuteSimulation = function (p) {
  // ISO Standard parameters
  let isoModule = 4.0; // mm
  let numTeeth = 24;
  let pressureAngleDeg = 20;

  // Animation
  let tAnim = 0;
  let isPaused = false;
  let showConstruction = true;

  // Derived geometry
  let rp = 0;  // Pitch radius
  let rb = 0;  // Base radius
  let ra = 0;  // Addendum radius
  let rf = 0;  // Dedendum radius

  let canvasScale = 2; // Static scale working for most ISO modules

  p.setup = function () {
    const c = p.createCanvas(800, 400);
    c.parent('involute-simulation');
    p.angleMode(p.RADIANS);
  };

  function readControls() {
    const moduleEl = document.getElementById('iso-module');
    const numTeethEl = document.getElementById('num-teeth-involute');
    const pressureAngleEl = document.getElementById('pressure-angle');

    if (moduleEl) isoModule = parseFloat(moduleEl.value);
    if (numTeethEl) numTeeth = parseInt(numTeethEl.value);
    if (pressureAngleEl) pressureAngleDeg = parseFloat(pressureAngleEl.value);
  }

  function updateGeometry() {
    const phi = pressureAngleDeg * p.PI / 180;
    const pitchDiameter = isoModule * numTeeth;
    rp = pitchDiameter / 2;
    rb = rp * p.cos(phi);
    ra = rp + isoModule;
    rf = rp - 1.25 * isoModule;
    if (rf < 0) rf = 0;
    if (rb < 0.1) rb = 0.1;

    // Scale dynamically to fit canvas (leave space for info panel)
    const maxRadius = ra * 1.1;
    const maxPixels = p.width / 2 - 100; 
  }

  function involutePoint(t) {
    return {
      x: rb * (p.cos(t) + t * p.sin(t)),
      y: rb * (p.sin(t) - t * p.cos(t))
    };
  }

  function findInvoluteParameter(r) {
    if (r <= rb) return 0;
    return p.sqrt((r * r) / (rb * rb) - 1);
  }

  function halfToothAngleISO() {
    return p.PI / (2 * numTeeth);
  }

function drawTrueInvoluteTooth() {
  const steps = 20; // steps along the involute curve
  const halfToothAngle = halfToothAngleISO();

  // Compute involute parameters
  const tStart = rf > rb ? findInvoluteParameter(rf) : 0;
  const tEnd = findInvoluteParameter(ra);

  // Right flank points
  let rightFlank = [];
  for (let i = 0; i <= steps; i++) {
    const t = tStart + (tEnd - tStart) * (i / steps);
    const pt = involutePoint(t);
    const angle = Math.atan2(pt.y, pt.x);
    const r = Math.sqrt(pt.x * pt.x + pt.y * pt.y);
    rightFlank.push({ r, a: angle });
  }

  // Rotate flank to align with tooth pitch
  const pitchT = findInvoluteParameter(rp);
  const pitchPt = involutePoint(pitchT);
  const invAngleAtPitch = Math.atan2(pitchPt.y, pitchPt.x);
  const rotation = halfToothAngle - invAngleAtPitch;

  rightFlank = rightFlank.map(pt => ({
    x: pt.r * Math.cos(pt.a + rotation) * canvasScale,
    y: pt.r * Math.sin(pt.a + rotation) * canvasScale
  }));

  // Left flank mirrored
  let leftFlank = [];
  for (let i = steps; i >= 0; i--) {
    const pt = rightFlank[i];
    leftFlank.push({ x: pt.x, y: -pt.y });
  }

  // Compute addendum arc angles
  const rightTip = rightFlank[rightFlank.length - 1];
  const leftTip = leftFlank[0];
  let angleStart = Math.atan2(rightTip.y, rightTip.x);
  let angleEnd = Math.atan2(leftTip.y, leftTip.x)+halfToothAngle*4;

  // Draw tooth shape (flanks + addendum arc)
  p.noFill();
  p.stroke(0);
  p.strokeWeight(2);

  // Flanks
  p.beginShape();
  rightFlank.slice().reverse().forEach(pt => p.vertex(pt.x, pt.y));
  leftFlank.slice().reverse().forEach(pt => p.vertex(pt.x, pt.y));
  p.endShape();

  // Addendum arc
  const arcSteps = 12; // smoothness of the addendum arc
  p.beginShape();
  for (let i = 0; i <= arcSteps; i++) {
    const theta = angleStart + i * (angleEnd - angleStart) / arcSteps;
    const x = ra * canvasScale * Math.cos(theta);
    const y = ra * canvasScale * Math.sin(theta);
    p.vertex(x, y);
  }
  p.endShape();
}


  p.draw = function () {
    p.background(245, 245, 235);
    readControls();
    updateGeometry();

    p.push();
    p.translate(p.width / 2 - 150, p.height / 2);

    if (!isPaused) {
      tAnim += 0.02;
      if (tAnim > 2) tAnim = 2;
    }

    // Construction circles
    if (showConstruction) {
      p.noFill();
      p.strokeWeight(1);
      p.stroke(0, 100, 200, 100); p.circle(0, 0, 2 * rb * canvasScale);
      p.stroke(200, 0, 0, 80);   p.circle(0, 0, 2 * rp * canvasScale);
      p.stroke(0, 150, 0, 60);   p.circle(0, 0, 2 * ra * canvasScale);
      p.stroke(150, 0, 150, 60); p.circle(0, 0, 2 * rf * canvasScale);
    }

    // Draw teeth (outline only)
    const toothAngle = (2 * p.PI) / numTeeth;
    for (let i = 0; i < numTeeth; i++) {
      p.push();
      p.rotate(i * toothAngle);
      drawTrueInvoluteTooth();
      p.pop();
    }

    // Centre bore
    const boreRadius = p.max(rb * 0.3, isoModule * 4) * canvasScale;
    p.fill(50);
    p.noStroke();
    p.circle(0, 0, boreRadius);
    const keyWidth = isoModule * 2 * canvasScale;
    const keyDepth = isoModule * 1.2 * canvasScale;
    p.rect(-keyWidth / 2, -boreRadius / 2, keyWidth, boreRadius / 2 + keyDepth);

    p.pop();

    // Red involute curve aligned to one tooth
    if (showConstruction && tAnim > 0) {
      p.push();
      p.translate(p.width / 2 - 150, p.height / 2);
      const halfToothAngle = halfToothAngleISO();
      const pitchT = findInvoluteParameter(rp);
      const pitchPt = involutePoint(pitchT);
      const invAngleAtPitch = p.atan2(pitchPt.y, pitchPt.x);
      const rotation = halfToothAngle - invAngleAtPitch;
      p.rotate(rotation);

      p.stroke(255, 0, 0, 200);
      p.strokeWeight(3);
      p.noFill();
      p.beginShape();
      for (let t = 0; t <= tAnim; t += 0.01) {
        const pt = involutePoint(t);
        const r = p.sqrt(pt.x*pt.x + pt.y*pt.y);
        if (r <= ra) p.vertex(pt.x*canvasScale, pt.y*canvasScale);
      }
      p.endShape();

      if (tAnim > 0) {
        const currentPt = involutePoint(tAnim);
        const tangentX = rb * canvasScale * p.cos(tAnim);
        const tangentY = rb * canvasScale * p.sin(tAnim);
        p.stroke(0, 200, 0, 150);
        p.strokeWeight(2);
        p.line(tangentX, tangentY, currentPt.x*canvasScale, currentPt.y*canvasScale);
        p.fill(255, 0, 0); p.noStroke(); p.circle(currentPt.x*canvasScale, currentPt.y*canvasScale, 8);
        p.fill(0, 200, 0); p.circle(tangentX, tangentY, 6);
      }
      p.pop();
    }

    // Info panel
    p.push();
    p.translate(p.width - 250, 50);
    p.fill(0);
    p.noStroke();
    p.textAlign(p.LEFT);
    p.textSize(14);
    p.text("ISO Standard Gear", 0, 0);
    p.textSize(12);
    p.text("ISO Parameters:", 0, 40);
    p.text("Module: " + isoModule + " mm", 0, 60);
    p.text("Teeth: " + numTeeth, 0, 80);
    p.text("Pressure Angle: " + pressureAngleDeg + "°", 0, 100);
    p.text("Calculated Dimensions:", 0, 140);
    p.text("Pitch Diameter: " + (rp * 2).toFixed(1) + " mm", 0, 160);
    p.text("Outside Diameter: " + (ra * 2).toFixed(1) + " mm", 0, 180);
    p.text("Root Diameter: " + (rf * 2).toFixed(1) + " mm", 0, 200);
    p.text("Base Circle: " + (rb * 2).toFixed(1) + " mm", 0, 220);
    p.text("Addendum: " + isoModule.toFixed(2) + " mm", 0, 240);
    p.text("Dedendum: " + (1.25 * isoModule).toFixed(2) + " mm", 0, 260);
    p.text("Clearance: " + (0.25 * isoModule).toFixed(2) + " mm", 0, 280);
    p.pop();
  };

  // External controls
  p.resetAnimation = () => { tAnim = 0; };
  p.togglePause = () => { isPaused = !isPaused; };
};

// Control listeners (unchanged)
function setupInvoluteControlListeners(sketch) {
  const numTeethSlider = document.getElementById('num-teeth-involute');
  if (numTeethSlider) {
    numTeethSlider.addEventListener('input', function() {
      const valueSpan = document.getElementById('num-teeth-involute-value');
      if (valueSpan) valueSpan.textContent = this.value;
    });
  }
  const resetButton = document.getElementById('reset-involute');
  if (resetButton && !resetButton.hasListener) {
    resetButton.hasListener = true;
    resetButton.addEventListener('click', () => sketch && sketch.resetAnimation());
  }
  const pauseButton = document.getElementById('pause-involute');
  if (pauseButton && !pauseButton.hasListener) {
    pauseButton.hasListener = true;
    pauseButton.addEventListener('click', function() {
      if (sketch) {
        sketch.togglePause();
        this.textContent = this.textContent === 'Pause' ? 'Resume' : 'Pause';
      }
    });
  }
  const constructionButton = document.getElementById('toggle-construction');
  if (constructionButton && !constructionButton.hasListener) {
    constructionButton.hasListener = true;
    constructionButton.addEventListener('click', () => sketch);
  }
}


// ============== SIMULATION 2: SIMPLE GEAR TRAIN ==============
const simpleGearSimulation = function(p) {
    let driverTeeth;
    let drivenTeeth;
    let idlerTeeth;
    let includeIdler;
    let inputSpeed;

    let driverAngle = 20;
    let drivenAngle = 0;
    let idlerAngle = 15;

    // Angular speeds (deg/ms), updated each frame
    let driverOmega;
    let drivenOmega;
    let idlerOmega;

    p.setup = function() {
        const canvas = p.createCanvas(800, 400);
        canvas.parent('simple-gear-simulation');
        p.angleMode(p.DEGREES);
    };

    p.draw = function() {
        p.background(245, 245, 235);

        // Update values from controls
        driverTeeth = parseInt(document.getElementById('driver-teeth').value);
        drivenTeeth = parseInt(document.getElementById('driven-teeth').value);
        idlerTeeth  = parseInt(document.getElementById('idler-teeth').value);
        includeIdler = document.getElementById('include-idler').checked;
        inputSpeed  = parseInt(document.getElementById('input-speed-simple').value);

        // Visual radii
        const moduleSize = 3;
        const driverRadius = driverTeeth * moduleSize;
        const drivenRadius = drivenTeeth * moduleSize;
        const idlerRadius  = idlerTeeth  * moduleSize;

        // Positions
        const driverX = 220;
        const driverY = p.height / 2;
        let drivenX, drivenY, idlerX, idlerY;

        if (includeIdler) {
            idlerX = driverX + driverRadius + idlerRadius;
            idlerY = driverY;
            drivenX = idlerX + idlerRadius + drivenRadius;
            drivenY = driverY;
        } else {
            drivenX = driverX + driverRadius + drivenRadius;
            drivenY = driverY;
        }

        // Driver angular velocity from input speed (RPM → deg/ms)
        driverOmega = inputSpeed * 360 / 60 / 1000;

        // Other gear velocities
        if (includeIdler) {
            idlerOmega  = -driverOmega * (driverTeeth / idlerTeeth);
            drivenOmega = -idlerOmega  * (idlerTeeth  / drivenTeeth);
        } else {
            drivenOmega = -driverOmega * (driverTeeth / drivenTeeth);
        }

        // Integrate angles
        driverAngle = (driverAngle + driverOmega * p.deltaTime) % 360;
        if (includeIdler) {
            idlerAngle  = (idlerAngle  + idlerOmega  * p.deltaTime) % 360;
        }
        drivenAngle = (drivenAngle + drivenOmega * p.deltaTime) % 360;

        // Connection lines
        p.stroke(150);
        p.strokeWeight(1);
        if (includeIdler) {
            p.line(driverX, driverY, idlerX, idlerY);
            p.line(idlerX, idlerY, drivenX, drivenY);
        } else {
            p.line(driverX, driverY, drivenX, drivenY);
        }

        // Draw gears
        drawGear(p, driverX, driverY, driverRadius, driverTeeth, driverAngle, p.color(200,100,100), "Driver");
        drawGear(p, drivenX, drivenY, drivenRadius, drivenTeeth, drivenAngle, p.color(100,100,200), "Driven");
        if (includeIdler) {
            drawGear(p, idlerX, idlerY, idlerRadius, idlerTeeth, idlerAngle, p.color(100,200,100), "Idler");
        }

        // Info panel on canvas (right side)
        const gearRatio = drivenTeeth / driverTeeth;
        const outputSpeed = inputSpeed / gearRatio;
        const outputDirection = includeIdler ? "Same as driver" : "Opposite to driver";

        p.push();
        p.fill(230, 247, 255);
        p.stroke(100, 180, 220);
        p.strokeWeight(2);
        p.rect(p.width - 280, 50, 260, 160, 5);

        p.fill(0);
        p.noStroke();
        p.textAlign(p.LEFT);
        p.textSize(12);
        let yPos = 70;
        p.text("Gear Ratio (Driven/Driver): " + gearRatio.toFixed(2), p.width - 270, yPos);
        yPos += 20;
        p.text("Gear Ratio (Driver/Driven): 1:" + gearRatio.toFixed(2), p.width - 270, yPos);
        yPos += 20;
        p.text("Output Speed: " + outputSpeed.toFixed(2) + " RPM", p.width - 270, yPos);
        yPos += 20;
        p.text("Output Direction:", p.width - 270, yPos);
        yPos += 18;
        p.text("  " + outputDirection, p.width - 270, yPos);
        p.pop();

        // Title
        p.fill(0);
        p.noStroke();
        p.textAlign(p.CENTER);
        p.textSize(16);
        p.text("Simple Gear Train", p.width / 2, 30);
    };

    // --- Gear drawing with proper teeth ---
   function drawGear(p, x, y, pitchR, teeth, angleDeg, col, label) {
        const phi = 20 * Math.PI / 180;
        const mVis = pitchR / teeth;
        const addendum = 2.0 * mVis;
        const dedendum = 2.5 * mVis;

        const ra = pitchR + addendum;
        const rr = Math.max(pitchR - dedendum, pitchR * 0.3);
        const rb = Math.max(pitchR * Math.cos(phi), rr * 0.95);
        const alpha = Math.PI / (2 * teeth);

        const involutePsi = (r) => {
            const q = r / rb;
            if (q < 1) return 0;
            const t = Math.sqrt(q*q - 1);
            return t - Math.atan(t);
        };

        const arcPoints = (r, a1, a2, steps) => {
            const pts = [];
            let d = a2 - a1;
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const a = a1 + d * t;
                pts.push([r * Math.cos(a), r * Math.sin(a)]);
            }
            return pts;
        };

        const psiP = involutePsi(pitchR);
        const baseOffset = alpha - psiP;

        p.push();
        p.translate(x, y);
        p.rotate(angleDeg);

        // Body
        p.noStroke();
        p.fill(col);
        p.circle(0, 0, rr * 2);

        p.stroke(30,30,30,160);
        p.strokeWeight(1.2);
        p.fill(col);

        const stepsFlank = 8;
        const stepsArc = 8;
        const toothPitch = 2 * Math.PI / teeth;

        for (let i = 0; i < teeth; i++) {
            const beta = i * toothPitch;
            const betaNext = (i + 1) * toothPitch;
            const r0 = Math.max(rb, rr);

            const angleLeft  = (r) => { const psi = involutePsi(r) + baseOffset; return beta + psi; };
            const angleRight = (r) => { const psi = involutePsi(r) + baseOffset; return betaNext - psi; };

            // Build flanks
            const leftFlank = [];
            for (let s = 0; s <= stepsFlank; s++) {
                const r = r0 + (ra - r0) * (s / stepsFlank);
                const th = angleLeft(r);
                leftFlank.push([r * Math.cos(th), r * Math.sin(th)]);
            }

            const rightFlank = [];
            for (let s = 0; s <= stepsFlank; s++) {
                const r = r0 + (ra - r0) * (s / stepsFlank);
                const th = angleRight(r);
                rightFlank.push([r * Math.cos(th), r * Math.sin(th)]);
            }

            // Tip arc
            const thetaR_tip = Math.atan2(rightFlank[rightFlank.length-1][1], rightFlank[rightFlank.length-1][0]);
            const thetaL_tip = Math.atan2(leftFlank[leftFlank.length-1][1], leftFlank[leftFlank.length-1][0]);
            const tipArc = arcPoints(ra, thetaR_tip, thetaL_tip, stepsArc);

            // Base arc
            const thetaR_base = Math.atan2(rightFlank[0][1], rightFlank[0][0]);
            const thetaL_base = Math.atan2(leftFlank[0][1], leftFlank[0][0]);
            const rootArc = arcPoints(rr, thetaL_base, thetaR_base, stepsArc);

            // Draw full tooth polygon
            p.beginShape();
            leftFlank.forEach(([vx, vy]) => p.vertex(vx, vy));
            tipArc.forEach(([vx, vy]) => p.vertex(vx, vy));
            rightFlank.slice().reverse().forEach(([vx, vy]) => p.vertex(vx, vy));
            rootArc.slice().reverse().forEach(([vx, vy]) => p.vertex(vx, vy));
            p.endShape(p.CLOSE);
        }

        // Pitch circle
        p.noFill();
        p.stroke(0,0,0,50);
        p.circle(0, 0, pitchR*2);

        // Hub & reference line
        p.noStroke();
        p.fill(50);
        p.circle(0,0,pitchR*0.3);
        p.stroke(255);
        p.strokeWeight(3);
        p.line(0,0,ra*0.5,0);

        p.pop();

        // Labels
        p.fill(0);
        p.noStroke();
        p.textAlign(p.CENTER);
        p.textSize(12);
        p.text(label, x, y + ra + 25);
        p.text(teeth + " teeth", x, y + ra + 40);
    }


};



//SIMULATION 3 - COMPOUND GEAR TRAIN WITH MESHING
const compoundGearSimulation = function(p) {
    let stage1DriverTeeth;
    let stage1DrivenTeeth;
    let stage2DriverTeeth;
    let stage2DrivenTeeth;
    let inputSpeed;
    let shaft1Angle = 0;
    let shaft2Angle = 20;
    let shaft3Angle = 0;

     // --- Gear drawing with proper teeth ---
   function drawGear(p, x, y, pitchR, teeth, angleDeg, col, label) {
        const phi = 20 * Math.PI / 180;
        const mVis = pitchR / teeth;
        const addendum = 2.0 * mVis;
        const dedendum = 2.5 * mVis;

        const ra = pitchR + addendum;
        const rr = Math.max(pitchR - dedendum, pitchR * 0.3);
        const rb = Math.max(pitchR * Math.cos(phi), rr * 0.95);
        const alpha = Math.PI / (2 * teeth);

        const involutePsi = (r) => {
            const q = r / rb;
            if (q < 1) return 0;
            const t = Math.sqrt(q*q - 1);
            return t - Math.atan(t);
        };

        const arcPoints = (r, a1, a2, steps) => {
            const pts = [];
            let d = a2 - a1;
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const a = a1 + d * t;
                pts.push([r * Math.cos(a), r * Math.sin(a)]);
            }
            return pts;
        };

        const psiP = involutePsi(pitchR);
        const baseOffset = alpha - psiP;

        p.push();
        p.translate(x, y);
        p.rotate(angleDeg);

        // Body
        p.noStroke();
        p.fill(col);
        p.circle(0, 0, rr * 2);

        p.stroke(30,30,30,160);
        p.strokeWeight(1.2);
        p.fill(col);

        const stepsFlank = 8;
        const stepsArc = 8;
        const toothPitch = 2 * Math.PI / teeth;

        for (let i = 0; i < teeth; i++) {
            const beta = i * toothPitch;
            const betaNext = (i + 1) * toothPitch;
            const r0 = Math.max(rb, rr);

            const angleLeft  = (r) => { const psi = involutePsi(r) + baseOffset; return beta + psi; };
            const angleRight = (r) => { const psi = involutePsi(r) + baseOffset; return betaNext - psi; };

            // Build flanks
            const leftFlank = [];
            for (let s = 0; s <= stepsFlank; s++) {
                const r = r0 + (ra - r0) * (s / stepsFlank);
                const th = angleLeft(r);
                leftFlank.push([r * Math.cos(th), r * Math.sin(th)]);
            }

            const rightFlank = [];
            for (let s = 0; s <= stepsFlank; s++) {
                const r = r0 + (ra - r0) * (s / stepsFlank);
                const th = angleRight(r);
                rightFlank.push([r * Math.cos(th), r * Math.sin(th)]);
            }

            // Tip arc
            const thetaR_tip = Math.atan2(rightFlank[rightFlank.length-1][1], rightFlank[rightFlank.length-1][0]);
            const thetaL_tip = Math.atan2(leftFlank[leftFlank.length-1][1], leftFlank[leftFlank.length-1][0]);
            const tipArc = arcPoints(ra, thetaR_tip, thetaL_tip, stepsArc);

            // Base arc
            const thetaR_base = Math.atan2(rightFlank[0][1], rightFlank[0][0]);
            const thetaL_base = Math.atan2(leftFlank[0][1], leftFlank[0][0]);
            const rootArc = arcPoints(rr, thetaL_base, thetaR_base, stepsArc);

            // Draw full tooth polygon
            p.beginShape();
            leftFlank.forEach(([vx, vy]) => p.vertex(vx, vy));
            tipArc.forEach(([vx, vy]) => p.vertex(vx, vy));
            rightFlank.slice().reverse().forEach(([vx, vy]) => p.vertex(vx, vy));
            rootArc.slice().reverse().forEach(([vx, vy]) => p.vertex(vx, vy));
            p.endShape(p.CLOSE);
        }

        // Pitch circle
        p.noFill();
        p.stroke(0,0,0,50);
        p.circle(0, 0, pitchR*2);

        // Hub & reference line
        p.noStroke();
        p.fill(50);
        p.circle(0,0,pitchR*0.3);
        p.stroke(255);
        p.strokeWeight(3);
        p.line(0,0,ra*0.5,0);

        p.pop();

/*         // Labels
        p.fill(0);
        p.noStroke();
        p.textAlign(p.CENTER);
        p.textSize(12);
        p.text(label, x, y + ra + 25);
        p.text(teeth + " teeth", x, y + ra + 40); */
    }

    p.setup = function() {
        let canvas = p.createCanvas(800, 400);
        canvas.parent('compound-gear-simulation');
        p.angleMode(p.DEGREES);
    };

    p.draw = function() {
        p.background(245, 245, 235);

        // Update values from controls
        stage1DriverTeeth = parseInt(document.getElementById('stage1-driver').value);
        stage1DrivenTeeth = parseInt(document.getElementById('stage1-driven').value);
        stage2DriverTeeth = parseInt(document.getElementById('stage2-driver').value);
        stage2DrivenTeeth = parseInt(document.getElementById('stage2-driven').value);
        inputSpeed = parseInt(document.getElementById('input-speed-compound').value);

        // Module size (same for all gears)
        let moduleSize = 2;
        let r1 = stage1DriverTeeth * moduleSize;
        let r2 = stage1DrivenTeeth * moduleSize;
        let r3 = stage2DriverTeeth * moduleSize;
        let r4 = stage2DrivenTeeth * moduleSize;

        // Shaft Y position (center vertical)
        let shaftY = p.height / 2;

        // Dynamically position shafts so teeth mesh
        let shaft1X = 110;
        let shaft2X = shaft1X + r1 + r2; // mesh stage1
        let shaft3X = shaft2X + r3 + r4; // mesh stage2

        // Update angles
        let speedFactor = inputSpeed / 60;
        shaft1Angle += speedFactor * 6;

        let stage1Ratio = stage1DrivenTeeth / stage1DriverTeeth;
        shaft2Angle -= speedFactor * 6 / stage1Ratio;

        let stage2Ratio = stage2DrivenTeeth / stage2DriverTeeth;
        let overallRatio = stage1Ratio * stage2Ratio;
        shaft3Angle -= speedFactor * 6 / overallRatio;

        // Draw shafts
        p.stroke(100);
        p.strokeWeight(8);
        p.line(shaft1X, shaftY - 100, shaft1X, shaftY + 100);
        p.line(shaft2X, shaftY - 100, shaft2X, shaftY + 100);
        p.line(shaft3X, shaftY - 100, shaft3X, shaftY + 100);

        // Draw gears (using drawGear)
        drawGear(p, shaft1X, shaftY - 30, r1, stage1DriverTeeth, shaft1Angle, p.color(200, 50, 50), "Input");
        drawGear(p, shaft2X, shaftY - 30, r2, stage1DrivenTeeth, shaft2Angle, p.color(50, 200, 50), "Stage 1 Driven");
        drawGear(p, shaft2X, shaftY + 30, r3, stage2DriverTeeth, shaft2Angle, p.color(50, 200, 50), "Stage 2 Driver");
        drawGear(p, shaft3X, shaftY + 30, r4, stage2DrivenTeeth, -shaft3Angle, p.color(50, 50, 200), "Output");

        // Labels
        p.fill(0);
        p.noStroke();
        p.textAlign(p.CENTER);
        p.textSize(16);
        p.text("Compound Gear Train", p.width / 2, 30);
        p.textSize(12);
        p.text("Shaft 1", shaft1X, shaftY + 130);
        p.text("Shaft 2", shaft2X, shaftY + 130);
        p.text("Shaft 3", shaft3X, shaftY + 130);

        // Info panel on canvas (right side)
        const intermediateSpeed = inputSpeed / stage1Ratio;
        const outputSpeed = inputSpeed / overallRatio;

        p.push();
        p.fill(230, 247, 255);
        p.stroke(100, 180, 220);
        p.strokeWeight(2);
        p.rect(p.width - 280, 50, 260, 200, 5);

        p.fill(0);
        p.noStroke();
        p.textAlign(p.LEFT);
        p.textSize(12);
        let yPos = 70;
        p.text("Stage 1 Ratio (Driven/Driver):", p.width - 270, yPos);
        yPos += 18;
        p.text("  " + stage1Ratio.toFixed(2) + " (1:" + stage1Ratio.toFixed(2) + ")", p.width - 270, yPos);
        yPos += 20;
        p.text("Stage 2 Ratio (Driven/Driver):", p.width - 270, yPos);
        yPos += 18;
        p.text("  " + stage2Ratio.toFixed(2) + " (1:" + stage2Ratio.toFixed(2) + ")", p.width - 270, yPos);
        yPos += 20;
        p.text("Overall Ratio (Driven/Driver):", p.width - 270, yPos);
        yPos += 18;
        p.text("  " + overallRatio.toFixed(2) + " (1:" + overallRatio.toFixed(2) + ")", p.width - 270, yPos);
        yPos += 20;
        p.text("Intermediate Speed:", p.width - 270, yPos);
        yPos += 18;
        p.text("  " + intermediateSpeed.toFixed(2) + " RPM", p.width - 270, yPos);
        yPos += 20;
        p.text("Output Speed:", p.width - 270, yPos);
        yPos += 18;
        p.text("  " + outputSpeed.toFixed(2) + " RPM", p.width - 270, yPos);
        p.pop();
    };
};



// ============== SIMULATION 4: EPICYCLIC GEAR TRAIN WITH REALISTIC GEARS ==============
const epicyclicGearSimulation = function(p) {
    let sunTeeth;
    let planetTeeth;
    let numPlanets;
    let inputSpeed;
    let fixedComponent = 'ring';
    let sunAngle = 0;
    let carrierAngle = 0;
    let planetAngles = [];
    let ringAngle = 0;

    p.setup = function() {
        let canvas = p.createCanvas(800, 400);
        canvas.parent('epicyclic-gear-simulation');
        p.angleMode(p.DEGREES);

        // Initialise planet angles
        for (let i = 0; i < 4; i++) {
            planetAngles[i] = 0;
        }
    };

    // --- Gear drawing with proper teeth ---
   function drawGear(p, x, y, pitchR, teeth, angleDeg, col, label) {
        const phi = 20 * Math.PI / 180;
        const mVis = pitchR / teeth;
        const addendum = 2.0 * mVis;
        const dedendum = 2.5 * mVis;

        const ra = pitchR + addendum;
        const rr = Math.max(pitchR - dedendum, pitchR * 0.3);
        const rb = Math.max(pitchR * Math.cos(phi), rr * 0.95);
        const alpha = Math.PI / (2 * teeth);

        const involutePsi = (r) => {
            const q = r / rb;
            if (q < 1) return 0;
            const t = Math.sqrt(q*q - 1);
            return t - Math.atan(t);
        };

        const arcPoints = (r, a1, a2, steps) => {
            const pts = [];
            let d = a2 - a1;
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const a = a1 + d * t;
                pts.push([r * Math.cos(a), r * Math.sin(a)]);
            }
            return pts;
        };

        const psiP = involutePsi(pitchR);
        const baseOffset = alpha - psiP;

        p.push();
        p.translate(x, y);
        p.rotate(angleDeg);

        // Body
        p.noStroke();
        p.fill(col);
        p.circle(0, 0, rr * 2);

        p.stroke(30,30,30,160);
        p.strokeWeight(1.2);
        p.fill(col);

        const stepsFlank = 8;
        const stepsArc = 8;
        const toothPitch = 2 * Math.PI / teeth;

        for (let i = 0; i < teeth; i++) {
            const beta = i * toothPitch;
            const betaNext = (i + 1) * toothPitch;
            const r0 = Math.max(rb, rr);

            const angleLeft  = (r) => { const psi = involutePsi(r) + baseOffset; return beta + psi; };
            const angleRight = (r) => { const psi = involutePsi(r) + baseOffset; return betaNext - psi; };

            // Build flanks
            const leftFlank = [];
            for (let s = 0; s <= stepsFlank; s++) {
                const r = r0 + (ra - r0) * (s / stepsFlank);
                const th = angleLeft(r);
                leftFlank.push([r * Math.cos(th), r * Math.sin(th)]);
            }

            const rightFlank = [];
            for (let s = 0; s <= stepsFlank; s++) {
                const r = r0 + (ra - r0) * (s / stepsFlank);
                const th = angleRight(r);
                rightFlank.push([r * Math.cos(th), r * Math.sin(th)]);
            }

            // Tip arc
            const thetaR_tip = Math.atan2(rightFlank[rightFlank.length-1][1], rightFlank[rightFlank.length-1][0]);
            const thetaL_tip = Math.atan2(leftFlank[leftFlank.length-1][1], leftFlank[leftFlank.length-1][0]);
            const tipArc = arcPoints(ra, thetaR_tip, thetaL_tip, stepsArc);

            // Base arc
            const thetaR_base = Math.atan2(rightFlank[0][1], rightFlank[0][0]);
            const thetaL_base = Math.atan2(leftFlank[0][1], leftFlank[0][0]);
            const rootArc = arcPoints(rr, thetaL_base, thetaR_base, stepsArc);

            // Draw full tooth polygon
            p.beginShape();
            leftFlank.forEach(([vx, vy]) => p.vertex(vx, vy));
            tipArc.forEach(([vx, vy]) => p.vertex(vx, vy));
            rightFlank.slice().reverse().forEach(([vx, vy]) => p.vertex(vx, vy));
            rootArc.slice().reverse().forEach(([vx, vy]) => p.vertex(vx, vy));
            p.endShape(p.CLOSE);
        }

        // Pitch circle
        p.noFill();
        p.stroke(0,0,0,50);
        p.circle(0, 0, pitchR*2);

        // Hub & reference line
        p.noStroke();
        p.fill(50);
        p.circle(0,0,pitchR*0.3);
        p.stroke(255);
        p.strokeWeight(3);
        p.line(0,0,ra*0.5,0);

        p.pop();

/*         // Labels
        p.fill(0);
        p.noStroke();
        p.textAlign(p.CENTER);
        p.textSize(12);
        p.text(label, x, y + ra + 25);
        p.text(teeth + " teeth", x, y + ra + 40); */
    }

    p.draw = function() {
        p.background(245, 245, 235);

        // Update values from controls
        sunTeeth = parseInt(document.getElementById('sun-teeth').value);
        planetTeeth = parseInt(document.getElementById('planet-teeth').value);
        numPlanets = parseInt(document.getElementById('num-planets').value);
        inputSpeed = parseInt(document.getElementById('input-speed-epicyclic').value);
        fixedComponent = document.getElementById('fixed-component').value;

        // Calculate ring teeth
        let ringTeeth = sunTeeth + 2 * planetTeeth;

        // Gear radii
        let moduleSize = 2;
        let sunRadius = sunTeeth * moduleSize;
        let planetRadius = planetTeeth * moduleSize;
        let ringRadius = ringTeeth * moduleSize;
        let carrierRadius = sunRadius + planetRadius;

        // Centre
        let cx = p.width / 2 - 100;
        let cy = p.height / 2;

        // Calculate speeds based on fixed component
        let speedFactor = inputSpeed / 60;
        let sunSpeed = 0, carrierSpeed = 0, ringSpeed = 0;

        if (fixedComponent === 'ring') {
            sunSpeed = speedFactor * 6;
            carrierSpeed = sunSpeed / (1 + ringTeeth / sunTeeth);
            ringSpeed = 0;
        } else if (fixedComponent === 'carrier') {
            sunSpeed = speedFactor * 6;
            carrierSpeed = 0;
            ringSpeed = -sunSpeed * (sunTeeth / ringTeeth);
        } else if (fixedComponent === 'sun') {
            sunSpeed = 0;
            carrierSpeed = speedFactor * 6;
            ringSpeed = carrierSpeed * (1 + sunTeeth / ringTeeth);
        }

        // Update angles
        sunAngle += sunSpeed;
        carrierAngle += carrierSpeed;
        ringAngle += ringSpeed;

        // --- Draw Ring Gear (internal teeth) ---
        drawGear(p, cx, cy, ringRadius, ringTeeth, ringAngle, [180, 180, 255], 'Ring');
        // Reverse the drawing for internal teeth if needed
        // Optional: could modify drawGear to handle internal teeth

        // --- Draw Carrier Arms ---
        p.push();
        p.translate(cx, cy);
        p.rotate(carrierAngle);
        p.stroke(100, 100, 100);
        p.strokeWeight(4);
        for (let i = 0; i < numPlanets; i++) {
            p.push();
            p.rotate(i * 360 / numPlanets);
            p.line(0, 0, carrierRadius, 0);
            p.pop();
        }
        p.pop();

        // --- Draw Sun Gear ---
        drawGear(p, cx, cy, sunRadius, sunTeeth, sunAngle, [200, 100, 100], 'Sun');

        // --- Draw Planet Gears ---
        for (let i = 0; i < numPlanets; i++) {
            let planetAngle = carrierAngle + i * 360 / numPlanets;
            let planetX = cx + carrierRadius * p.cos(planetAngle);
            let planetY = cy + carrierRadius * p.sin(planetAngle);

            // Planet rotation relative to sun and carrier
            let planetRotation = -sunAngle * (sunTeeth / planetTeeth) - carrierAngle * (ringTeeth / planetTeeth);
            drawGear(p, planetX, planetY, planetRadius, planetTeeth, planetRotation, [100, 200, 100], 'Planet ' + (i+1));
        }

        // --- Labels ---
        p.fill(0);
        p.noStroke();
        p.textAlign(p.CENTER);
        p.textSize(16);
        p.text("Epicyclic (Planetary) Gear Train", p.width / 2, 30);

        p.textSize(14);
        p.fill(255, 0, 0);
        p.text("Fixed: " + fixedComponent.toUpperCase(), p.width / 2, 60);

        // Calculate info for display
        let sunRPM = sunSpeed * 10;
        let carrierRPM = carrierSpeed * 10;
        let ringRPM = ringSpeed * 10;

        // Determine input component and calculate gear ratio
        let ratio = 1;
        let inputComponent = '';
        let outputComponent = '';

        if (fixedComponent === 'ring') {
            ratio = 1 + ringTeeth / sunTeeth;
            inputComponent = 'Sun';
            outputComponent = 'Carrier';
        } else if (fixedComponent === 'carrier') {
            ratio = -ringTeeth / sunTeeth;
            inputComponent = 'Sun';
            outputComponent = 'Ring';
        } else if (fixedComponent === 'sun') {
            ratio = 1 + sunTeeth / ringTeeth;
            inputComponent = 'Carrier';
            outputComponent = 'Ring';
        }

        // Info panel on canvas (right side)
        p.push();
        p.fill(230, 247, 255);
        p.stroke(100, 180, 220);
        p.strokeWeight(2);
        p.rect(p.width - 280, 90, 260, 200, 5);

        p.fill(0);
        p.noStroke();
        p.textAlign(p.LEFT);
        p.textSize(12);
        let yPos = 110;
        p.text("Ring Teeth: " + ringTeeth, p.width - 270, yPos);
        yPos += 20;
        p.text("Input: " + inputComponent + " → " + outputComponent, p.width - 270, yPos);
        yPos += 20;

        let sunText = fixedComponent === 'sun' ? "0.00 RPM (Fixed)" : sunRPM.toFixed(2) + " RPM";
        p.text("Sun Speed: " + sunText, p.width - 270, yPos);
        yPos += 20;

        let carrierText = fixedComponent === 'carrier' ? "0.00 RPM (Fixed)" : carrierRPM.toFixed(2) + " RPM";
        p.text("Carrier Speed: " + carrierText, p.width - 270, yPos);
        yPos += 20;

        let ringText = fixedComponent === 'ring' ? "0.00 RPM (Fixed)" : ringRPM.toFixed(2) + " RPM";
        p.text("Ring Speed: " + ringText, p.width - 270, yPos);
        yPos += 20;

        p.text("Gear Ratio (Output/Input):", p.width - 270, yPos);
        yPos += 18;
        p.text("  " + Math.abs(ratio).toFixed(2) + " (1:" + Math.abs(ratio).toFixed(2) + ")", p.width - 270, yPos);
        p.pop();
    };
};


// Initialise sketches when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create all four sketches
    involuteSketch = new p5(involuteSimulation);
    simpleGearSketch = new p5(simpleGearSimulation);
    compoundGearSketch = new p5(compoundGearSimulation);
    epicyclicSketch = new p5(epicyclicGearSimulation);
    
    // Set up control event listeners
    setupControlListeners();
});

// Set up all control event listeners
function setupControlListeners() {
    // Update value displays for all sliders
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        slider.addEventListener('input', function() {
            const valueSpan = document.getElementById(this.id + '-value');
            if (valueSpan) {
                valueSpan.textContent = this.value;
            }
        });
    });
    
    // Involute controls
    const resetButton = document.getElementById('reset-involute');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            if (involuteSketch) {
                involuteSketch.resetAnimation();
            }
        });
    }
    
    const pauseButton = document.getElementById('pause-involute');
    if (pauseButton) {
        pauseButton.addEventListener('click', function() {
            if (involuteSketch) {
                involuteSketch.togglePause();
                this.textContent = this.textContent === 'Pause' ? 'Resume' : 'Pause';
            }
        });
    }
    
    // Simple gear idler checkbox
    const idlerCheckbox = document.getElementById('include-idler');
    if (idlerCheckbox) {
        idlerCheckbox.addEventListener('change', function() {
            const idlerSlider = document.getElementById('idler-teeth');
            if (idlerSlider) {
                idlerSlider.disabled = !this.checked;
            }
        });
    }
}