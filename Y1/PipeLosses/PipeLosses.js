// Pipe Losses Simulation using p5.js - Complete Rewrite
let sketch = new p5(function(p) {
    // System parameters
    let pipeLength = 30; // m
    let pipeDiameter = 100; // mm
    let flowVelocity = 2; // m/s
    let pumpPressure = 200; // kPa
    let roughness = 0.046; // mm (commercial steel)

    // Fittings included in system
    let includeElbow90 = false;
    let includeElbow45 = false;
    let includeGateValve = false;
    let includeGlobeValve = false;

    // Physical constants
    const density = 1000; // kg/m³ (water)
    const viscosity = 0.001; // Pa·s (water at 20°C)
    const g = 9.81; // m/s²

    // Loss coefficients
    const K_VALUES = {
        elbow90: 0.9,
        elbow45: 0.4,
        gateValve: 0.2,
        globeValve: 10.0
    };

    // Flow particles for animation
    let particles = [];

    // Calculation results
    let reynolds, frictionFactor, majorLoss, minorLoss, totalLoss, dischargeHeight;

    p.setup = function() {
        let canvasWidth = Math.min(900, p.windowWidth - 40);
        p.createCanvas(canvasWidth, 500);
        setupControls();
        initializeParticles();
        calculateSystem();
    };

    p.draw = function() {
        p.background(245);

        // Draw the complete pipe system with dynamic geometry
        drawPipeSystem();

        // Update and draw flow particles
        updateParticles();
        drawParticles();

        // Draw info box
        drawInfobox();
    };

    function initializeParticles() {
        particles = [];
        for (let i = 0; i < 40; i++) {
            particles.push({
                progress: p.random(1),
                speed: flowVelocity * 0.015
            });
        }
    }

    function drawPipeSystem() {
        // Calculate pipe segment positions
        let segments = [];
        let currentX = 80;
        let currentY = 250;

        // 1. Pump at start
        drawPump(30, currentY, pumpPressure);
        segments.push({type: 'pump', x: 30, y: currentY, pressure: pumpPressure});

        // 2. Initial horizontal pipe section
        let segmentLength = 100;
        drawHorizontalPipe(currentX, currentY, segmentLength);
        currentX += segmentLength;

        // Track cumulative loss for pressure display
        let cumulativeLoss = 0;
        let pressureAtPoint = pumpPressure;

        // 3. Add fittings based on checkboxes
        if (includeElbow90) {
            drawElbow90(currentX, currentY);
            cumulativeLoss += K_VALUES.elbow90 * (flowVelocity * flowVelocity) / (2 * g) * density * g / 1000;
            pressureAtPoint = pumpPressure - cumulativeLoss;
            drawPressureGauge(currentX + 15, currentY - 50, pressureAtPoint);
            currentX += 40;
            drawHorizontalPipe(currentX, currentY, segmentLength);
            currentX += segmentLength;
        }

        if (includeElbow45) {
            drawElbow45(currentX, currentY);
            cumulativeLoss += K_VALUES.elbow45 * (flowVelocity * flowVelocity) / (2 * g) * density * g / 1000;
            pressureAtPoint = pumpPressure - cumulativeLoss;
            drawPressureGauge(currentX + 15, currentY - 50, pressureAtPoint);
            currentX += 40;
            drawHorizontalPipe(currentX, currentY, segmentLength);
            currentX += segmentLength;
        }

        if (includeGateValve) {
            drawGateValve(currentX, currentY);
            cumulativeLoss += K_VALUES.gateValve * (flowVelocity * flowVelocity) / (2 * g) * density * g / 1000;
            pressureAtPoint = pumpPressure - cumulativeLoss;
            drawPressureGauge(currentX + 15, currentY - 50, pressureAtPoint);
            currentX += 40;
            drawHorizontalPipe(currentX, currentY, segmentLength);
            currentX += segmentLength;
        }

        if (includeGlobeValve) {
            drawGlobeValve(currentX, currentY);
            cumulativeLoss += K_VALUES.globeValve * (flowVelocity * flowVelocity) / (2 * g) * density * g / 1000;
            pressureAtPoint = pumpPressure - cumulativeLoss;
            drawPressureGauge(currentX + 15, currentY - 50, pressureAtPoint);
            currentX += 40;
            drawHorizontalPipe(currentX, currentY, segmentLength);
            currentX += segmentLength;
        }

        // 4. Final horizontal section before vertical discharge
        drawHorizontalPipe(currentX, currentY, 50);
        currentX += 50;

        // Draw pressure drop line along horizontal pipes
        drawPressureDropLine(80, currentX);

        // 5. Vertical discharge pipe showing height
        drawVerticalDischarge(currentX, currentY);
    }

    function drawPump(x, y, pressure) {
        // Draw pump symbol
        p.fill(100, 150, 255);
        p.stroke(50, 100, 200);
        p.strokeWeight(3);
        p.ellipse(x, y, 40, 40);

        // Pump blades
        p.line(x - 12, y, x + 12, y);
        p.line(x, y - 12, x, y + 12);

        // Label
        p.noStroke();
        p.fill(0);
        p.textSize(10);
        p.textAlign(p.CENTER);
        p.text('Pump', x, y - 30);

        // Pressure gauge on pump
        drawPressureGauge(x + 30, y - 40, pressure);
    }

    function drawPressureGauge(x, y, pressure) {
        // Circular gauge
        p.fill(255);
        p.stroke(100);
        p.strokeWeight(2);
        p.circle(x, y, 30);

        // Needle (simplified)
        p.stroke(200, 50, 50);
        p.strokeWeight(2);
        let angle = p.map(pressure, 0, pumpPressure, -p.PI/2, p.PI/2);
        p.line(x, y, x + 10 * p.cos(angle - p.PI/2), y + 10 * p.sin(angle - p.PI/2));

        // Pressure value
        p.noStroke();
        p.fill(0);
        p.textSize(9);
        p.textAlign(p.CENTER);
        p.text(pressure.toFixed(0) + ' kPa', x, y + 22);
    }

    function drawHorizontalPipe(x, y, length) {
        p.fill(180, 180, 200, 150);
        p.stroke(100);
        p.strokeWeight(2);
        p.rect(x, y - 15, length, 30, 3);
    }

    function drawElbow90(x, y) {
        p.fill(220, 120, 120);
        p.stroke(150, 80, 80);
        p.strokeWeight(2);
        // Draw 90° bend symbol
        p.rect(x - 5, y - 15, 25, 30);
        p.arc(x + 10, y - 15, 20, 20, 0, p.PI/2);

        p.noStroke();
        p.fill(0);
        p.textSize(9);
        p.textAlign(p.CENTER);
        p.text('90°', x + 10, y + 25);
    }

    function drawElbow45(x, y) {
        p.fill(220, 160, 120);
        p.stroke(150, 120, 80);
        p.strokeWeight(2);
        // Draw 45° bend symbol
        p.rect(x - 5, y - 15, 25, 30);
        p.quad(x, y - 15, x + 20, y - 5, x + 20, y + 5, x, y + 15);

        p.noStroke();
        p.fill(0);
        p.textSize(9);
        p.textAlign(p.CENTER);
        p.text('45°', x + 10, y + 25);
    }

    function drawGateValve(x, y) {
        p.fill(120, 220, 120);
        p.stroke(80, 150, 80);
        p.strokeWeight(2);
        p.ellipse(x + 10, y, 30, 30);
        p.line(x - 5, y, x + 25, y);
        p.line(x + 10, y - 15, x + 10, y - 25);

        p.noStroke();
        p.fill(0);
        p.textSize(9);
        p.textAlign(p.CENTER);
        p.text('Gate', x + 10, y + 25);
    }

    function drawGlobeValve(x, y) {
        p.fill(220, 120, 220);
        p.stroke(150, 80, 150);
        p.strokeWeight(2);
        p.ellipse(x + 10, y, 30, 30);
        p.line(x - 5, y, x + 25, y);
        p.line(x + 10, y - 10, x + 10, y - 25);
        p.ellipse(x + 10, y - 25, 10, 10);

        p.noStroke();
        p.fill(0);
        p.textSize(9);
        p.textAlign(p.CENTER);
        p.text('Globe', x + 10, y + 25);
    }

    function drawPressureDropLine(startX, endX) {
        // Show pressure drop as a declining line above the pipe
        let startP = pumpPressure;
        let endP = pumpPressure - (majorLoss * density * g / 1000);

        p.stroke(200, 50, 50, 150);
        p.strokeWeight(2);
        p.line(startX, 200, endX, 200 + (startP - endP) * 0.5);

        // Label
        p.noStroke();
        p.fill(150, 0, 0);
        p.textSize(10);
        p.textAlign(p.LEFT);
        p.text('Pressure Drop', startX + 10, 195);
    }

    function drawVerticalDischarge(x, baseY) {
        // Calculate discharge height from remaining pressure head
        // h = (P_pump - P_losses) / (ρ * g)
        let remainingPressure = pumpPressure * 1000 - totalLoss * density * g; // Pa
        dischargeHeight = Math.max(0, remainingPressure / (density * g)); // meters

        // Convert to pixels (1m = 20 pixels for visualization)
        let heightPixels = Math.min(dischargeHeight * 20, 200);

        // Draw vertical pipe
        p.fill(180, 180, 200, 150);
        p.stroke(100);
        p.strokeWeight(2);
        p.rect(x, baseY - heightPixels, 30, heightPixels);

        // Draw water column rising in vertical pipe
        p.fill(100, 150, 255, 200);
        p.noStroke();
        // Animated water level
        let waterLevel = heightPixels * (0.9 + 0.1 * p.sin(p.frameCount * 0.05));
        p.rect(x + 2, baseY - waterLevel, 26, waterLevel);

        // Draw discharge spout at top
        p.fill(100, 150, 255, 220);
        p.stroke(80, 120, 200);
        p.strokeWeight(2);
        // Water flowing out
        for (let i = 0; i < 5; i++) {
            let dropY = baseY - heightPixels + i * 15 + (p.frameCount % 15);
            if (dropY < baseY) {
                p.ellipse(x + 15, dropY, 6, 10);
            }
        }

        // Height label
        p.noStroke();
        p.fill(0);
        p.textSize(11);
        p.textAlign(p.LEFT);
        p.text('Height: ' + dischargeHeight.toFixed(2) + ' m', x + 35, baseY - heightPixels/2);

        // Draw atmosphere line
        p.stroke(100);
        p.strokeWeight(1);
        p.line(x - 20, baseY - heightPixels - 10, x + 60, baseY - heightPixels - 10);
        p.noStroke();
        p.textSize(9);
        p.text('Atmosphere', x + 35, baseY - heightPixels - 15);
    }

    function updateParticles() {
        for (let particle of particles) {
            particle.progress += particle.speed;
            if (particle.progress > 1) {
                particle.progress = 0;
            }
        }
    }

    function drawParticles() {
        // Draw flowing particles along the horizontal pipes
        p.noStroke();
        p.fill(74, 144, 226, 180);

        for (let particle of particles) {
            let x = 80 + particle.progress * (p.width - 200);
            let y = 250 + p.random(-8, 8);

            if (x < p.width - 150) {
                p.ellipse(x, y, 5, 5);
            }
        }
    }

    function setupControls() {
        document.getElementById("pipe-length").addEventListener("input", function() {
            pipeLength = parseFloat(this.value);
            document.getElementById("pipe-length-value").textContent = pipeLength;
            calculateSystem();
        });

        document.getElementById("pipe-diameter").addEventListener("input", function() {
            pipeDiameter = parseFloat(this.value);
            document.getElementById("pipe-diameter-value").textContent = pipeDiameter;
            calculateSystem();
        });

        document.getElementById("flow-velocity").addEventListener("input", function() {
            flowVelocity = parseFloat(this.value);
            document.getElementById("flow-velocity-value").textContent = flowVelocity.toFixed(1);
            initializeParticles();
            calculateSystem();
        });

        document.getElementById("pump-pressure").addEventListener("input", function() {
            pumpPressure = parseFloat(this.value);
            document.getElementById("pump-pressure-value").textContent = pumpPressure;
            calculateSystem();
        });

        document.getElementById("roughness").addEventListener("change", function() {
            roughness = parseFloat(this.value);
            calculateSystem();
        });

        // Checkbox event listeners
        document.getElementById("include-elbow90").addEventListener("change", function() {
            includeElbow90 = this.checked;
            calculateSystem();
        });

        document.getElementById("include-elbow45").addEventListener("change", function() {
            includeElbow45 = this.checked;
            calculateSystem();
        });

        document.getElementById("include-gate-valve").addEventListener("change", function() {
            includeGateValve = this.checked;
            calculateSystem();
        });

        document.getElementById("include-globe-valve").addEventListener("change", function() {
            includeGlobeValve = this.checked;
            calculateSystem();
        });
    }

    function calculateSystem() {
        const D = pipeDiameter / 1000; // Convert to meters

        // Reynolds number
        reynolds = (density * flowVelocity * D) / viscosity;

        // Friction factor
        if (reynolds < 2300) {
            frictionFactor = 64 / reynolds;
        } else {
            // Swamee-Jain equation for turbulent flow
            const epsilon = roughness / 1000; // Convert mm to m
            const term1 = (epsilon / D) / 3.7;
            const term2 = 5.74 / Math.pow(reynolds, 0.9);
            frictionFactor = 0.25 / Math.pow(Math.log10(term1 + term2), 2);
        }

        // Major loss (Darcy-Weisbach)
        majorLoss = frictionFactor * (pipeLength / D) * (flowVelocity * flowVelocity) / (2 * g);

        // Minor losses
        let totalK = 0;
        if (includeElbow90) totalK += K_VALUES.elbow90;
        if (includeElbow45) totalK += K_VALUES.elbow45;
        if (includeGateValve) totalK += K_VALUES.gateValve;
        if (includeGlobeValve) totalK += K_VALUES.globeValve;

        minorLoss = totalK * (flowVelocity * flowVelocity) / (2 * g);

        // Total head loss
        totalLoss = majorLoss + minorLoss;

        // Discharge height: h = (P_pump - losses) / (ρ * g)
        let remainingPressure = pumpPressure * 1000 - totalLoss * density * g; // Pa
        dischargeHeight = Math.max(0, remainingPressure / (density * g));
    }

    function drawInfobox() {
        // Draw semi-transparent info box in top-right corner
        let boxWidth = 280;
        let boxHeight = 160;
        let boxX = p.width - boxWidth - 15;
        let boxY = 15;

        // Background
        p.fill(255, 255, 255, 230);
        p.stroke(100);
        p.strokeWeight(1);
        p.rect(boxX, boxY, boxWidth, boxHeight, 5);

        // Title
        p.fill(0);
        p.noStroke();
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(13);
        p.textStyle(p.BOLD);
        p.text('System Performance:', boxX + 10, boxY + 10);

        // Info text
        p.textStyle(p.NORMAL);
        p.textSize(11);
        let yPos = boxY + 30;
        let lineHeight = 20;

        let flowRegime = reynolds < 2300 ? 'Laminar' : 'Turbulent';
        p.text('Reynolds Number: Re = ' + reynolds.toFixed(0) + ' (' + flowRegime + ')', boxX + 10, yPos);
        yPos += lineHeight;
        p.text('Friction Factor: f = ' + frictionFactor.toFixed(4), boxX + 10, yPos);
        yPos += lineHeight;
        p.text('Major Loss (friction): h_f = ' + majorLoss.toFixed(2) + ' m', boxX + 10, yPos);
        yPos += lineHeight;
        p.text('Minor Loss (fittings): h_L = ' + minorLoss.toFixed(2) + ' m', boxX + 10, yPos);
        yPos += lineHeight;
        p.text('Total Head Loss: h_total = ' + totalLoss.toFixed(2) + ' m', boxX + 10, yPos);
        yPos += lineHeight;
        p.text('Discharge Height: h = ' + dischargeHeight.toFixed(2) + ' m', boxX + 10, yPos);
    }

}, 'sketch-holder');

// Quiz submission
document.getElementById('submit-quiz').addEventListener('click', function() {
    const answers = {
        q1: 'b',
        q2: 'b',
        q3: 'b',
        q4: 'b',
        q5: 'b',
        q6: 'b'
    };

    submitQuiz(
        Object.entries(answers).map(([name, correct]) => ({name, correctAnswer: correct})),
        'quiz-results'
    );
});
