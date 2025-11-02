// Pulley-Beam System Simulation
// Shows a pinned beam with distributed load, lifted by cable over pulley

const pulleyBeamSketch = function(p) {
    // Canvas dimensions
    const canvasW = 800;
    const canvasH = 500;

    // Physical parameters
    let beamLength = 300; // pixels
    let beamWeight_N = 500; // Weight of beam in Newtons (slider)
    let beamAngle = 0; // degrees from horizontal (always horizontal)

    // Calculated values
    let cable_force = 0; // N (calculated from equilibrium)
    let pinReaction_x = 0;
    let pinReaction_y = 0;
    let udl_magnitude = 0; // kN/m (calculated from beam weight)

    // UI
    let beamWeightSlider;
    let fbdSelector;
    let selectedFBD = 'beam'; // 'beam' or 'pulley'

    // Scale factor for force vectors
    const forceScale = 0.2; // pixels per Newton
    const udlScale = 100; // separate scale factor for UDL arrows for better visibility

    // Colors
    const colorBeam = '#8B4513';
    const colorPin = '#666666';
    const colorCable = '#333333';
    const colorPulley = '#444444';
    const colorUDL = '#11add4ff'; // Blue, same as cable force
    const colorTension = '#0066CC';
    const colorReaction = '#CC0000';

    p.setup = function() {
        let canvas = p.createCanvas(canvasW, canvasH);
        canvas.parent('pulley-sketch');

        // Create sliders
        beamWeightSlider = p.createSlider(100, 1500, 500, 50);
        beamWeightSlider.parent('pulley-controls');
        beamWeightSlider.style('width', '200px');

        // FBD selector
        fbdSelector = p.createSelect();
        fbdSelector.parent('pulley-fbd-selector');
        fbdSelector.option('Beam', 'beam');
        fbdSelector.option('Pulley', 'pulley');
        fbdSelector.selected('beam');
        fbdSelector.changed(() => {
            selectedFBD = fbdSelector.value();
        });

        calculateEquilibrium();
    };

    p.draw = function() {
        p.background(255);

        // Update parameters from sliders
        beamWeight_N = beamWeightSlider.value();
        beamAngle = 0; // Always horizontal

        // Calculate distributed load from beam weight
        // UDL = Weight / Length
        const L = beamLength / 100; // Convert to meters
        udl_magnitude = (beamWeight_N / 1000) / L; // Convert to kN/m

        // Recalculate equilibrium with new geometry
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
        // Convert beam length to meters
        const L = beamLength / 100; // meters

        // Beam weight acts as a uniformly distributed load across entire beam
        // UDL resultant force (beam weight)
        const F_udl = beamWeight_N / 1000; // Convert to kN

        // Beam is always horizontal (theta = 0)
        // Cable goes vertically up from beam tip, wraps around pulley,
        // then goes HORIZONTALLY to the wall on the left

        // Taking moments about the pin (anticlockwise positive):
        // For horizontal beam:
        // Weight creates clockwise moment: M_weight = F_udl * (L/2)
        // Cable at tip creates anticlockwise moment: M_cable = T * L
        // (cable pulls vertically up at distance L from pin)

        // For equilibrium: T * L = F_udl * (L/2)
        // Solving for T: T = F_udl / 2 = beamWeight / 2

        // Calculate cable force from moment equilibrium
        const cable_force_kN = F_udl / 2;
        cable_force = cable_force_kN * 1000; // Convert to N

        // Calculate pin reactions using force equilibrium
        // At the tip: Cable pulls vertically up with force T
        // Cable from pulley to wall pulls horizontally (force T)
        // At pin: Reaction Ax (horizontal) and Ay (vertical)
        // Weight: F_udl acts vertically down at center

        // Vertical equilibrium: Ay + T - F_udl = 0
        pinReaction_y = F_udl - cable_force_kN;

        // Horizontal equilibrium: Ax - T = 0 (horizontal cable pulls left with T)
        pinReaction_x = cable_force_kN;
    }

    function drawSystemView() {
        p.push();
        p.translate(50, 250);

        // Title
        p.fill(0);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(14);
        p.text('System View', 150, -230);

        // Draw vertical wall on the left
        p.stroke(100);
        p.strokeWeight(3);
        p.line(0, -150, 0, 150);
        // Wall hatch marks
        for (let i = -140; i <= 140; i += 20) {
            p.line(0, i, -10, i + 10);
        }

        // Pin support at origin
        drawPin(p, 0, 0);

        // Calculate beam endpoints
        const theta = beamAngle * Math.PI / 180;
        const tipX = beamLength * Math.cos(theta);
        const tipY = -beamLength * Math.sin(theta); // negative because y-axis points down

        // Draw beam
        p.stroke(colorBeam);
        p.strokeWeight(8);
        p.line(0, 0, tipX, tipY);

        // Draw UDL on entire beam (beam weight distributed)
        drawDistributedLoad(p, 0, 0, tipX, tipY, udl_magnitude * udlScale, theta);

        // Pulley position (above beam tip)
        const pulleyX = tipX - 15;
        const pulleyY = tipY - 100;

        // Draw cable from beam tip to pulley
        p.stroke(colorCable);
        p.strokeWeight(3);
        p.line(tipX, tipY, pulleyX+15, pulleyY);

        // Draw pulley
        p.fill(colorPulley);
        p.stroke(0);
        p.strokeWeight(2);
        p.circle(pulleyX, pulleyY, 30);

        // Draw pin in center (white circle with black border)
        p.fill(255);
        p.stroke(0);
        p.strokeWeight(2);
        p.circle(pulleyX, pulleyY, 12);

        // Draw cable from pulley going horizontally to wall
        // Cable wraps 90 degrees around pulley: enters from bottom (vertical), exits to left (horizontal)
        const exitX = pulleyX; // Exit point on left side of pulley
        const exitY = pulleyY - 15; // At pulley center height

        p.stroke(colorCable);
        p.strokeWeight(3);
        // Cable from pulley to wall (horizontal)
        p.line(exitX, exitY, 0, pulleyY-15);

        // Draw cable force arrow (vertical, at beam tip)
        //const cableForceArrowLen = cable_force * forceScale;
        //drawForceArrow(p, tipX, tipY, 0, cableForceArrowLen, colorTension, 'F=' + cable_force.toFixed(0) + ' N', 'left');

        // Draw coordinate system
        drawCoordSystem(p, -30, 170);

        p.pop();
    }

    function drawFBDView() {
        p.push();
        p.translate(canvasW/2 + 50, 250);

        // Title
        p.fill(0);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(14);
        p.text('Free Body Diagram: ' + (selectedFBD === 'beam' ? 'Beam' : 'Pulley'), 150, -230);

        if (selectedFBD === 'beam') {
            drawBeamFBD();
        } else {
            drawPulleyFBD();
        }

        // Draw coordinate system
        drawCoordSystem(p, -30, 170);

        p.pop();
    }

    function drawBeamFBD() {
        // Draw beam (simplified)
        const theta = beamAngle * Math.PI / 180;
        const drawLen = 180;
        const tipX = drawLen * Math.cos(theta);
        const tipY = -drawLen * Math.sin(theta);

        p.stroke(colorBeam);
        p.strokeWeight(6);
        p.line(0, 0, tipX, tipY);

        // Pin reactions (force components)
        if (Math.abs(pinReaction_y) > 0.1) {
            const dir = pinReaction_y > 0 ? 1 : -1;
            const arrowLen = Math.abs(pinReaction_y) * 1000 * forceScale;
            drawForceArrow(p, 0, 0, 0, dir * arrowLen, colorReaction, 'Ay=' + (pinReaction_y * 1000).toFixed(0) + ' N', 'right');
        }
        /* if (Math.abs(pinReaction_x) > 0.1) {
            const dir = pinReaction_x > 0 ? 1 : -1;
            const arrowLen = Math.abs(pinReaction_x) * 1000 * forceScale;
            drawForceArrow(p, 0, 10, dir * arrowLen, 0, colorReaction, 'Ax=' + (pinReaction_x * 1000).toFixed(0) + ' N', 'bottom');
        } */

        // UDL on entire beam (beam weight distributed) - draw faintly
        p.push();
        p.drawingContext.globalAlpha = 0.3; // Make UDL semitransparent
        drawDistributedLoad(p, 0, 0, tipX, tipY, udl_magnitude * udlScale * 0.8, theta);
        p.pop();

        // Draw resultant of UDL (concentrated force at center)
        const centerX = tipX / 2;
        const centerY = tipY / 2;
        const resultantArrowLen = beamWeight_N * forceScale;
        // Create UDL color with some transparency for the resultant
        const udlColorSemi = p.color(colorUDL);
        udlColorSemi.setAlpha(200);
        drawForceArrow(p, centerX, centerY, 0, -resultantArrowLen, udlColorSemi, 'W=' + beamWeight_N.toFixed(0) + ' N', 'right');

        // Cable force at tip (upward)
        const cableForceArrowLen = cable_force * forceScale;
        drawForceArrow(p, tipX, tipY, 0, cableForceArrowLen, colorTension, 'F=' + cable_force.toFixed(0) + ' N', 'left');

        // Note about distributed load
        p.fill(100);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(10);
        p.text('UDL: w = ' + udl_magnitude.toFixed(2) + ' kN/m', 100, 120);
        p.text('Resultant at center: W = ' + beamWeight_N.toFixed(0) + ' N', 100, 135);
    }

    function drawPulleyFBD() {
        // Center the pulley in the FBD panel
        p.push();
        p.translate(100, -40);

        // Draw pulley (simplified circle)
        p.push();
        p.fill(255);
        p.stroke(colorPulley);
        p.strokeWeight(4);
        p.circle(40, 40, 80);
        p.pop();

        // Draw pin at center (white circle with black border)
        p.fill(255);
        p.stroke(0);
        p.strokeWeight(2);
        p.circle(40, 40, 16);

        // Cable forces (massless, frictionless pulley → same tension throughout)
        // Cable comes from below (beam side) - pulling down on pulley
        const cableArrowLen = cable_force * forceScale;
        drawForceArrow(p, 80, 40, 0, -cableArrowLen, colorTension, 'F=' + cable_force.toFixed(0) + ' N', 'right');

        // Cable goes horizontally to the right - pulling right on pulley
        drawForceArrow(p, 40, 0, -cableArrowLen, 0, colorTension, 'F=' + cable_force.toFixed(0) + ' N', 'top');

        // Reaction at axle (from support structure)
        // For a frictionless, massless pulley, the axle reaction balances the vector sum of cable forces
        const R_x = cable_force;
        const R_y = cable_force;
        const R_mag = Math.sqrt(R_x*R_x + R_y*R_y);
        const R_angle = Math.atan2(R_y, R_x);

        const Rx_draw = R_mag * forceScale * Math.cos(R_angle);
        const Ry_draw = R_mag * forceScale * Math.sin(R_angle);

        drawForceArrow(p, 40, 40, Rx_draw, Ry_draw, colorReaction, 'R=' + R_mag.toFixed(0) + ' N', 'left');

        p.pop();

        // Note - positioned lower and centered
        p.fill(100);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(10);
        p.text('Massless, frictionless pulley', 100, 130);
        p.text('Force same throughout cable', 100, 145);
    }

    function drawDistributedLoad(p, x1, y1, x2, y2, intensity, beamAngle) {
        // Draw arrows perpendicular to beam (downward in global frame)
        const numArrows = 8;
        const dx = (x2 - x1) / numArrows;
        const dy = (y2 - y1) / numArrows;

        p.stroke(colorUDL);
        p.strokeWeight(2);
        p.fill(colorUDL);

        for (let i = 0; i <= numArrows; i++) {
            const px = x1 + i * dx;
            const py = y1 + i * dy;

            // Draw downward arrow
            p.line(px, py, px, py - intensity);

            // Arrowhead
            p.push();
            p.translate(px, py);
            p.noStroke();
            p.triangle(0, 0, -4, -8, 4, -8);
            p.pop();
        }

        // Draw line connecting arrow tips
        p.line(x1, y1 - intensity, x2, y2 - intensity);

        // Label
        p.fill(colorUDL);
        p.noStroke();
        p.textAlign(p.CENTER, p.BOTTOM);
        p.textSize(11);
        p.text('w=' + udl_magnitude.toFixed(1) + ' kN/m', (x1 + x2)/2, (y1 + y2)/2 - intensity - 5);
    }

    function drawPin(p, x, y) {
        p.fill(255);
        p.stroke(colorPin);
        p.strokeWeight(2);
        p.circle(x, y, 20);
    }

    function drawForceArrow(p, x, y, dx, dy, col, label, labelPos = 'right') {
        const mag = Math.sqrt(dx*dx + dy*dy);
        if (mag < 0.1) return;

        p.stroke(col);
        p.strokeWeight(3);
        p.line(x, y, x + dx, y - dy);

        // Arrowhead - offset forward by 1px along arrow direction
        const arrowheadOffset = 3; // pixels to move forward (adjustable)
        const offsetX = (dx / mag) * arrowheadOffset;
        const offsetY = (dy / mag) * arrowheadOffset;

        p.push();
        p.translate(x + dx + offsetX, y - dy - offsetY);
        const angle = Math.atan2(-dy, dx);
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
                p.text(label, x + dx/2 + 8, y - dy/2);
            } else if (labelPos === 'left') {
                p.textAlign(p.RIGHT, p.CENTER);
                p.text(label, x + dx/2 - 8, y - dy/2);
            } else if (labelPos === 'bottom') {
                p.textAlign(p.CENTER, p.TOP);
                p.text(label, x + dx/2, y - dy/2 + 8);
            } else if (labelPos === 'top') {
                p.textAlign(p.CENTER, p.BOTTOM);
                p.text(label, x + dx/2, y - dy/2 - 8);
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

    function drawAngleArc(p, x, y, angleDeg, radius, color) {
        // Draw arc showing angle theta from horizontal
        if (Math.abs(angleDeg) < 0.5) return; // Don't draw if angle is too small

        p.push();
        p.translate(x, y);

        p.noFill();
        p.stroke(color);
        p.strokeWeight(1.5);

        const angleRad = angleDeg * Math.PI / 180;
        if (angleDeg > 0) {
            p.arc(0, 0, radius * 2, radius * 2, -angleRad, 0);
        } else {
            p.arc(0, 0, radius * 2, radius * 2, 0, -angleRad);
        }

        // Draw angle label
        p.fill(color);
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(11);
        const labelRadius = radius + 15;
        const labelAngle = angleRad / 2;
        const labelX = labelRadius * Math.cos(-labelAngle);
        const labelY = -labelRadius * Math.sin(-labelAngle);
        p.text('θ', labelX, labelY);

        p.pop();
    }

    function drawHorizontalProjectionQuote(p, x1, x2, theta) {
        // Draw a dimension line showing horizontal projection of beam
        const yPos = 80; // Position below the beam

        p.push();
        p.stroke('#666666');
        p.strokeWeight(1);

        // Vertical ticks at ends
        p.line(x1, yPos - 8, x1, yPos + 8);
        p.line(x2, yPos - 8, x2, yPos + 8);

        // Horizontal line
        p.line(x1, yPos, x2, yPos);

        // Arrowheads
        p.fill('#666666');
        p.noStroke();
        p.triangle(x1, yPos, x1 + 8, yPos - 4, x1 + 8, yPos + 4);
        p.triangle(x2, yPos, x2 - 8, yPos - 4, x2 - 8, yPos + 4);

        // Label
        p.fill('#666666');
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(10);
        const L = beamLength / 100; // meters
        const horizontalProjection = L * Math.cos(theta);
        p.text('L cos(θ) = ' + horizontalProjection.toFixed(2) + ' m', (x1 + x2) / 2, yPos + 10);

        p.pop();
    }
};

// Initialize the sketch
new p5(pulleyBeamSketch);
