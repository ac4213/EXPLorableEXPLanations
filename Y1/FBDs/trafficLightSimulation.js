// Traffic Light with Springs Simulation
// Shows traffic light suspended by two springs at 45° angles

const trafficLightSketch = function(p) {
    // Canvas dimensions
    const canvasW = 800;
    const canvasH = 500;

    // FORCE VECTOR SCALE FACTOR - adjust this to make vectors longer/shorter
    const FORCE_SCALE = 0.2; // pixels per Newton

    // Physical parameters
    let k1 = 1; // Spring constant for left spring (N/m) (slider)
    let k2 = 1; // Spring constant for right spring (N/m) (slider)
    let mass = 20; // Mass of traffic light (kg) (slider)

    // Fixed geometry
    const springAngle = 45; // degrees from horizontal
    const naturalLength = 80; // Natural length of springs (pixels)
    const attachmentSpacing = 300; // Horizontal distance between attachment points

    // Calculated values
    let weight = 0;
    let extension1 = 0; // Extension of spring 1
    let extension2 = 0; // Extension of spring 2
    let tension1 = 0; // Tension in spring 1
    let tension2 = 0; // Tension in spring 2
    let trafficLightY = 0; // Y position of traffic light
    let springLength1 = 0;
    let springLength2 = 0;

    // UI
    let k1Slider, k2Slider, massSlider;

    // Colors
    const colorSpring = '#4169E1';
    const colorTrafficLight = '#333333';
    const colorReaction = '#CC0000'; // RED for reaction forces (spring tensions)
    const colorSupport = '#666666';

    // Attachment points (fixed)
    let attachLeft = { x: 150, y: 50 };
    let attachRight = { x: 450, y: 50 };
    let trafficLightX = (attachLeft.x + attachRight.x) / 2;

    p.setup = function() {
        let canvas = p.createCanvas(canvasW, canvasH);
        canvas.parent('traffic-sketch');

        // Create sliders
        k1Slider = p.createSlider(1, 100, 1, 1);
        k1Slider.parent('traffic-controls');
        k1Slider.style('width', '200px');

        k2Slider = p.createSlider(1, 100, 1, 1);
        k2Slider.parent('traffic-controls');
        k2Slider.style('width', '200px');

        massSlider = p.createSlider(5, 100, 20, 1);
        massSlider.parent('traffic-controls');
        massSlider.style('width', '200px');

        calculateEquilibrium();
    };

    p.draw = function() {
        p.background(255);

        // Update parameters from sliders
        k1 = k1Slider.value();
        k2 = k2Slider.value();
        mass = massSlider.value();

        // Recalculate equilibrium
        calculateEquilibrium();

        // Draw split view
        drawSystemView();
        drawFBDView();

        // Draw divider line
        p.stroke(0);
        p.strokeWeight(2);
        p.line(canvasW/2, 0, canvasW/2, canvasH);
    };

    function calculateEquilibrium() {
        const g = 9.81;
        weight = mass * g; // N

        const theta = springAngle * Math.PI / 180;

        // For equilibrium:
        // Horizontal: T1*cos(theta) = T2*cos(theta) → T1 = T2
        // Vertical: T1*sin(theta) + T2*sin(theta) = W
        // So: 2*T*sin(theta) = W
        // T = W / (2*sin(theta))

        // But springs have different stiffnesses, so T1 ≠ T2 in general
        // We need to account for geometry

        // Let's say traffic light is at position (x, y)
        // Spring 1 goes from (attachLeft.x, attachLeft.y) to (x, y)
        // Spring 2 goes from (attachRight.x, attachRight.y) to (x, y)

        // Due to symmetry (if k1 = k2), traffic light is at center horizontally
        // But if k1 ≠ k2, it shifts

        // For simplicity, assume traffic light stays horizontally centered
        // (This is approximately true if springs are symmetric)

        const x = trafficLightX;

        // Vertical force balance:
        // T1*sin(θ1) + T2*sin(θ2) = W
        // Where θ1 and θ2 are the actual angles of the springs

        // Spring forces:
        // T1 = k1 * extension1
        // T2 = k2 * extension2

        // Length of spring 1: L1 = sqrt((x - attachLeft.x)^2 + (y - attachLeft.y)^2)
        // Extension 1: e1 = L1 - L0 (L0 = natural length)
        // Similarly for spring 2

        // We need to solve for y such that forces balance

        // Let's iterate to find equilibrium position
        let y = 200; // Initial guess
        let iterations = 0;
        const maxIterations = 100;

        while (iterations < maxIterations) {
            // Calculate spring lengths
            const L1 = p.dist(attachLeft.x, attachLeft.y, x, y);
            const L2 = p.dist(attachRight.x, attachRight.y, x, y);

            // Calculate extensions
            const e1 = Math.max(0, L1 - naturalLength);
            const e2 = Math.max(0, L2 - naturalLength);

            // Calculate tensions
            const T1 = k1 * e1;
            const T2 = k2 * e2;

            // Calculate angles
            const theta1 = Math.atan2(y - attachLeft.y, x - attachLeft.x);
            const theta2 = Math.atan2(y - attachRight.y, attachRight.x - x);

            // Calculate vertical components
            const Fy1 = T1 * Math.sin(theta1);
            const Fy2 = T2 * Math.sin(theta2);

            // Net vertical force (positive down)
            const Fnet = weight - Fy1 - Fy2;

            // Update position
            if (Math.abs(Fnet) < 0.1) {
                break; // Equilibrium found
            }

            y += Fnet * 0.01; // Adjust position
            iterations++;
        }

        trafficLightY = y;

        // Final calculations
        springLength1 = p.dist(attachLeft.x, attachLeft.y, x, trafficLightY);
        springLength2 = p.dist(attachRight.x, attachRight.y, x, trafficLightY);

        extension1 = Math.max(0, springLength1 - naturalLength);
        extension2 = Math.max(0, springLength2 - naturalLength);

        tension1 = k1 * extension1;
        tension2 = k2 * extension2;
    }

    function drawSystemView() {
        p.push();
        p.translate(0, 0);

        // Draw ceiling/support structure (contained within left half)
        p.fill(200);
        p.noStroke();
        p.rect(20, 0, 340, 20);
        p.fill(0);
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(12);
        p.text('Support Structure', 190, 25);

        // Adjusted attachment points to keep within left panel
        const leftX = 90;
        const rightX = 290;
        const attachY = 50;

        // Draw attachment points
        p.fill(colorSupport);
        p.stroke(0);
        p.strokeWeight(1);
        p.circle(leftX, attachY, 10);
        p.circle(rightX, attachY, 10);

        // Calculate traffic light position based on spring stiffnesses
        // Traffic light X position shifts based on stiffness ratio
        const centerX = (leftX + rightX) / 2;
        const stiffnessRatio = k2 / (k1 + k2); // 0.5 if equal, < 0.5 if k1 > k2
        const horizontalShift = (stiffnessRatio - 0.5) * 50; // Shift range: -25 to +25 pixels
        const lightX = centerX + horizontalShift;

        // Calculate equilibrium Y position for this X position
        let lightY = 200; // Initial guess
        for (let iter = 0; iter < 50; iter++) {
            const L1 = p.dist(leftX, attachY, lightX, lightY);
            const L2 = p.dist(rightX, attachY, lightX, lightY);
            const e1 = Math.max(0, L1 - naturalLength);
            const e2 = Math.max(0, L2 - naturalLength);
            const T1 = k1 * e1;
            const T2 = k2 * e2;
            const theta1 = Math.atan2(lightY - attachY, lightX - leftX);
            const theta2 = Math.atan2(lightY - attachY, rightX - lightX);
            const Fy1 = T1 * Math.sin(theta1);
            const Fy2 = T2 * Math.sin(theta2);
            const Fnet = weight - Fy1 - Fy2;
            if (Math.abs(Fnet) < 0.1) break;
            lightY += Fnet * 0.01;
        }
        // Draw attachment point at the top
        p.push();
        p.fill(colorSupport);
        p.stroke(0);
        p.strokeWeight(1);
        p.circle(lightX, lightY, 10);
        p.pop();

        // Draw springs with V-shape
        drawSpring(p, leftX, attachY, lightX, lightY, extension1, naturalLength, colorSpring);
        drawSpring(p, rightX, attachY, lightX, lightY, extension2, naturalLength, colorSpring);

        // Draw traffic light
        drawTrafficLight(p, lightX, lightY+45);

        // Draw only gravity (blue) in system view - points downward
        drawForceArrow(p, lightX, lightY+45, 0, weight * FORCE_SCALE, '#0000FF', 'W');

        // Title
        p.fill(0);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(14);
        p.text('System View', 190, 45);

        // Info box (contained within left panel)
        p.fill(220, 240, 255);
        p.stroke(0, 100, 200);
        p.strokeWeight(2);
        p.rect(20, canvasH - 120, 360, 100, 5);

        // Calculate actual spring lengths in this view
        const sysL1 = p.dist(leftX, attachY, lightX, lightY);
        const sysL2 = p.dist(rightX, attachY, lightX, lightY);
        const sysE1 = Math.max(0, sysL1 - naturalLength);
        const sysE2 = Math.max(0, sysL2 - naturalLength);

        // Convert to metres (assume 100 pixels = 1 meter)
        const pixelsPerMeter = 100;
        const sysL1_m = sysL1 / pixelsPerMeter;
        const sysL2_m = sysL2 / pixelsPerMeter;
        const sysE1_m = sysE1 / pixelsPerMeter;
        const sysE2_m = sysE2 / pixelsPerMeter;
        const naturalLength_m = naturalLength / pixelsPerMeter;

        // Calculate angles from horizontal (0°), positive counterclockwise
        // Both angles measured from horizontal right (positive x-axis)
        const dx1 = leftX - lightX;  // horizontal component
        const dy1 = attachY - lightY; // vertical component (negative because up)
        const dx2 = rightX - lightX;  // horizontal component
        const dy2 = attachY - lightY; // vertical component (negative because up)

        // atan2(dy, dx) gives angle from positive x-axis, counterclockwise
        // Spring 1: goes up and left, angle should be between 90° and 180°
        let theta1_rad = Math.atan2(-dy1, dx1); // negate dy1 to make upward positive
        let theta1_deg = theta1_rad * 180 / Math.PI;
        if (theta1_deg < 0) theta1_deg += 360; // ensure positive

        // Spring 2: goes up and right, angle should be between 0° and 90°
        let theta2_rad = Math.atan2(-dy2, dx2); // negate dy2 to make upward positive
        let theta2_deg = theta2_rad * 180 / Math.PI;
        if (theta2_deg < 0) theta2_deg += 360; // ensure positive

        // Angle between springs
        const angleBetweenSprings = Math.abs(theta1_deg - theta2_deg);

        p.fill(0);
        p.noStroke();
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(11);
        p.text('Spring 1: L₀=' + naturalLength_m.toFixed(2) + ' m, L=' + sysL1_m.toFixed(2) + ' m, Δx=' + sysE1_m.toFixed(3) + ' m', 30, canvasH - 110);
        p.text('         θ₁ = ' + theta1_deg.toFixed(1) + '° (from horizontal)', 30, canvasH - 95);
        p.text('Spring 2: L₀=' + naturalLength_m.toFixed(2) + ' m, L=' + sysL2_m.toFixed(2) + ' m, Δx=' + sysE2_m.toFixed(3) + ' m', 30, canvasH - 75);
        p.text('         θ₂ = ' + theta2_deg.toFixed(1) + '° (from horizontal)', 30, canvasH - 60);
        p.text('Angle between springs: ' + angleBetweenSprings.toFixed(1) + '°', 30, canvasH - 40);

        // Draw coordinate system
        drawCoordSystem(p, 30, canvasH - 140);

        p.pop();
    }

    function drawFBDView() {
        p.push();
        p.translate(canvasW/2, 0);

        // Title
        p.fill(0);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(14);
        p.text('Free Body Diagram: Traffic Light', 200, 45);

        // Draw attachment point at the top
        p.push();
        p.fill(colorSupport);
        p.stroke(0);
        p.strokeWeight(1);
        p.circle(200, 155, 10);
        p.pop();

        // Draw traffic light (centered)
        const centerX = 200;
        const centerY = 200;
        drawTrafficLight(p, centerX, centerY);

        // Top of traffic light is where springs attach (40 pixels above center)
        const attachPointY = centerY - 40;

        // Calculate angles based on actual spring geometry from system view
        // We need to recalculate the actual positions from the system view
        const leftX = 90;
        const rightX = 290;
        const attachY = 50;
        const centerXsys = (leftX + rightX) / 2;
        const stiffnessRatio = k2 / (k1 + k2);
        const horizontalShift = (stiffnessRatio - 0.5) * 50;
        const lightX = centerXsys + horizontalShift;

        // Calculate equilibrium Y position
        let lightY = 200;
        for (let iter = 0; iter < 50; iter++) {
            const L1 = p.dist(leftX, attachY, lightX, lightY);
            const L2 = p.dist(rightX, attachY, lightX, lightY);
            const e1 = Math.max(0, L1 - naturalLength);
            const e2 = Math.max(0, L2 - naturalLength);
            const T1 = k1 * e1;
            const T2 = k2 * e2;
            const theta1 = Math.atan2(lightY - attachY, lightX - leftX);
            const theta2 = Math.atan2(lightY - attachY, rightX - lightX);
            const Fy1 = T1 * Math.sin(theta1);
            const Fy2 = T2 * Math.sin(theta2);
            const Fnet = weight - Fy1 - Fy2;
            if (Math.abs(Fnet) < 0.1) break;
            lightY += Fnet * 0.01;
        }

        // Calculate spring angles (from traffic light to attachment points)
        // Positive counterclockwise from horizontal right
        const dx1 = leftX - lightX;
        const dy1 = attachY - lightY;
        let theta1 = Math.atan2(-dy1, dx1); // negate dy1 to make upward positive

        const dx2 = rightX - lightX;
        const dy2 = attachY - lightY;
        let theta2 = Math.atan2(-dy2, dx2); // negate dy2 to make upward positive

        // In FBD, show forces on traffic light
        // Tension from spring 1 (pulls along spring axis toward left attachment) - RED for reaction forces
        // In screen coords: positive y is down, but sin(theta) gives upward component, so negate
        const T1x_fbd = tension1 * Math.cos(theta1) * FORCE_SCALE;
        const T1y_fbd = -tension1 * Math.sin(theta1) * FORCE_SCALE; // negative to make upward in screen coords
        drawForceArrow(p, centerX, attachPointY, T1x_fbd, T1y_fbd, colorReaction, 'T₁=' + tension1.toFixed(1) + ' N', 'left');

        // Tension from spring 2 (pulls along spring axis toward right attachment) - RED for reaction forces
        const T2x_fbd = tension2 * Math.cos(theta2) * FORCE_SCALE;
        const T2y_fbd = -tension2 * Math.sin(theta2) * FORCE_SCALE; // negative to make upward in screen coords
        drawForceArrow(p, centerX, attachPointY, T2x_fbd, T2y_fbd, colorReaction, 'T₂=' + tension2.toFixed(1) + ' N', 'right');

        // Weight (downward) - BLUE for active force (gravity)
        drawForceArrow(p, centerX, centerY, 0, weight * FORCE_SCALE, '#0000FF', 'W=' + weight.toFixed(1) + ' N', 'right');

        // Equilibrium equations - aligned at bottom with system view infobox
        const infoBoxHeight = 130;
        const infoBoxTop = canvasH - infoBoxHeight - 20;

        p.fill(220, 240, 255);
        p.stroke(0, 100, 200);
        p.strokeWeight(2);
        p.rect(50, infoBoxTop, 300, infoBoxHeight, 5);

        p.fill(0);
        p.noStroke();
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(11);
        p.text('Equilibrium Equations:', 60, infoBoxTop + 10);
        p.textSize(10);

        // Vertical components
        // With angles positive counterclockwise from horizontal right:
        // sin(theta) gives the vertical component (positive = up)
        // For equilibrium: T1*sin(theta1) + T2*sin(theta2) = W
        const T1_vert = tension1 * Math.sin(theta1);
        const T2_vert = tension2 * Math.sin(theta2);
        const sum_vert = T1_vert + T2_vert - weight;

        p.text('ΣFy = 0:', 60, infoBoxTop + 30);
        p.text('T₁sin(θ₁) + T₂sin(θ₂) - W = 0', 70, infoBoxTop + 45);

        p.text('Spring Force Law (Hooke\'s Law):', 60, infoBoxTop + 80);
        p.text('T₁ = k₁Δx₁ = ' + k1 + ' × ' + extension1.toFixed(1) + ' = ' + tension1.toFixed(1) + ' N', 70, infoBoxTop + 95);
        p.text('T₂ = k₂Δx₂ = ' + k2 + ' × ' + extension2.toFixed(1) + ' = ' + tension2.toFixed(1) + ' N', 70, infoBoxTop + 110);

        // Draw coordinate system
        drawCoordSystem(p, 60, infoBoxTop - 20);

        p.pop();
    }

    function drawSpring(p, x1, y1, x2, y2, extension, naturalLen, col) {
        p.push();
        p.stroke(col);
        p.strokeWeight(2);
        p.noFill();

        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = p.dist(x1, y1, x2, y2);
        const angle = p.atan2(dy, dx);

        p.translate(x1, y1);
        p.rotate(angle);

        // Draw spring as zigzag
        const coils = 12;
        const coilWidth = 8;
        const segmentLen = len / coils;

        p.beginShape();
        p.vertex(0, 0);
        for (let i = 1; i < coils; i++) {
            const x = i * segmentLen;
            const y = (i % 2 === 0) ? coilWidth : -coilWidth;
            p.vertex(x, y);
        }
        p.vertex(len, 0);
        p.endShape();

        // Color based on extension (more stretched = darker/thicker)
        const thickness = p.map(extension, 0, 100, 2, 4);
        p.strokeWeight(thickness);

        p.pop();
    }

    function drawTrafficLight(p, x, y) {
        p.push();

        // Traffic light body (rectangle)
        p.fill(colorTrafficLight);
        p.stroke(0);
        p.strokeWeight(2);
        p.rect(x - 20, y - 40, 40, 80, 5);

        // Lights (red, yellow, green)
        p.noStroke();
        p.fill(255, 0, 0, 150);
        p.circle(x, y - 25, 15);
        p.fill(255, 255, 0, 250);
        p.circle(x, y, 15);
        p.fill(0, 255, 0, 100); // Green is on
        p.circle(x, y + 25, 15);

        // Visor
        p.fill(50);
        p.rect(x - 22, y - 42, 44, 6);
        p.rect(x - 22, y - 17, 44, 6);
        p.rect(x - 22, y + 8, 44, 6);
        p.rect(x - 22, y + 33, 44, 6);

        p.pop();
    }

    function drawForceArrow(p, x, y, dx, dy, col, label, labelPos = 'right') {
        const mag = Math.sqrt(dx*dx + dy*dy);
        if (mag < 0.1) return;

        p.stroke(col);
        p.strokeWeight(3);
        p.line(x, y, x + dx, y + dy); // dy is already in screen coordinates (positive = down)

        // Arrowhead
        p.push();
        p.translate(x + dx, y + dy);
        const angle = Math.atan2(dy, dx);
        p.rotate(angle);
        p.fill(col);
        p.noStroke();
        p.triangle(0, 0, -10, -5, -10, 5);
        p.pop();

        // Label
        if (label) {
            p.fill(col);
            p.noStroke();
            p.textSize(10);

            if (labelPos === 'right') {
                p.textAlign(p.LEFT, p.CENTER);
                p.text(label, x + dx/2 + 8, y + dy/2);
            } else if (labelPos === 'left') {
                p.textAlign(p.RIGHT, p.CENTER);
                p.text(label, x + dx/2 - 8, y + dy/2);
            }
        }
    }

    function drawCoordSystem(p, x, y) {
        p.push();
        p.stroke(100);
        p.strokeWeight(2);
        p.fill(100);

        // X axis
        p.line(x, y, x + 30, y);
        p.push();
        p.translate(x + 30, y);
        p.noStroke();
        p.triangle(0, 0, -6, -3, -6, 3);
        p.pop();

        // Y axis
        p.line(x, y, x, y - 30);
        p.push();
        p.translate(x, y - 30);
        p.rotate(-Math.PI/2);
        p.noStroke();
        p.triangle(0, 0, -6, -3, -6, 3);
        p.pop();

        p.fill(0);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(10);
        p.text('x', x + 30, y + 3);
        p.textAlign(p.LEFT, p.CENTER);
        p.text('y', x + 3, y - 30);

        p.pop();
    }
};

// Initialize the sketch
new p5(trafficLightSketch);
