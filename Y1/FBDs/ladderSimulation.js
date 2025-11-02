// Ladder Equilibrium Simulation
// Shows ladder leaning against smooth wall with person on it

const ladderSketch = function(p) {
    // Canvas dimensions
    const canvasW = 800;
    const canvasH = 500;

    // FORCE VECTOR SCALE FACTOR - adjust this to make vectors longer/shorter
    const FORCE_SCALE = 0.1; // pixels per Newton

    // Physical parameters
    let ladderLength = 300; // pixels
    let ladderAngle = 60; // degrees from horizontal (slider)
    let ladderMass = 25; // kg
    let personMass = 70; // kg (slider)
    let personPosition = 0.7; // fraction from bottom (0 to 1) (slider)
    let muGround = 0.5; // coefficient of friction at ground (slider)

    // Calculated forces
    let N_wall = 0; // Normal force from wall (horizontal)
    let N_ground = 0; // Normal force from ground (vertical)
    let f_ground = 0; // Friction force from ground (horizontal)
    let W_ladder = 0; // Weight of ladder
    let W_person = 0; // Weight of person
    let isEquilibrium = true;

    // UI
    let muSlider, personMassSlider, personPosSlider, angleSlider;
    let fbdSelector;
    let selectedFBD = 'ladder'; // 'ladder' or 'person'

    // Colors - BLUE for active forces (weights), RED for reactions
    const colorWall = '#8B4513';
    const colorGround = '#654321';
    const colorLadder = '#D2691E';
    const colorPerson = '#502118ff';
    const colorActiveForce = '#0000FF'; // BLUE for active forces (weights)
    const colorReaction = '#CC0000'; // RED for reactions (normal, friction)

    p.setup = function() {
        let canvas = p.createCanvas(canvasW, canvasH);
        canvas.parent('ladder-sketch');

        // Create sliders
        angleSlider = p.createSlider(30, 75, 60, 5);
        angleSlider.parent('ladder-controls');
        angleSlider.style('width', '200px');

        muSlider = p.createSlider(0, 1, 0.5, 0.05);
        muSlider.parent('ladder-controls');
        muSlider.style('width', '200px');

        personMassSlider = p.createSlider(40, 120, 70, 5);
        personMassSlider.parent('ladder-controls');
        personMassSlider.style('width', '200px');

        personPosSlider = p.createSlider(0, 100, 70, 5);
        personPosSlider.parent('ladder-controls');
        personPosSlider.style('width', '200px');

        // FBD selector
        fbdSelector = p.createSelect();
        fbdSelector.parent('ladder-fbd-selector');
        fbdSelector.option('Ladder', 'ladder');
        fbdSelector.option('Person', 'person');
        fbdSelector.selected('ladder');
        fbdSelector.changed(() => {
            selectedFBD = fbdSelector.value();
        });

        calculateForces();
    };

    p.draw = function() {
        p.background(255);

        // Update parameters from sliders
        ladderAngle = angleSlider.value();
        muGround = muSlider.value();
        personMass = personMassSlider.value();
        personPosition = personPosSlider.value() / 100;

        // Recalculate forces
        calculateForces();

        // Draw info box at top (before drawing views)
        drawInfoBox();

        // Draw split view
        drawSystemView();
        drawFBDView();

        // Draw divider line
        p.stroke(0);
        p.strokeWeight(2);
        p.line(canvasW/2, 70, canvasW/2, canvasH);
    };

    function calculateForces() {
        const g = 9.81;
        W_ladder = ladderMass * g;
        W_person = personMass * g;

        // Convert angle to radians
        const theta = ladderAngle * Math.PI / 180;

        // Position vectors (from base)
        const L = ladderLength / 100; // convert to meters for calculation

        // Equilibrium equations for ladder + person system
        // Taking moments about base = 0 (anticlockwise positive)
        // N_wall * L*sin(theta) - W_ladder * (L/2)*cos(theta) - W_person * d*cos(theta) = 0

        const d = personPosition * L;

        N_wall = (W_ladder * (L/2) * Math.cos(theta) + W_person * d * Math.cos(theta)) / (L * Math.sin(theta));

        // Horizontal equilibrium: f_ground - N_wall = 0
        f_ground = N_wall;

        // Vertical equilibrium: N_ground - W_ladder - W_person = 0
        N_ground = W_ladder + W_person;

        // Check if friction is sufficient
        const f_max = muGround * N_ground;
        isEquilibrium = (f_ground <= f_max);
    }

    function drawInfoBox() {
        // Info box at top of canvas
        const boxY = 5;
        const boxH = 60;

        if (!isEquilibrium) {
            p.fill(255, 200, 200);
            p.stroke(255, 0, 0);
            p.strokeWeight(2);
            p.rect(10, boxY, canvasW - 20, boxH, 5);
            p.fill(200, 0, 0);
            p.noStroke();
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(12);
            p.text('⚠ LADDER WILL SLIP! ⚠', canvasW/2, boxY + 15);
            p.textSize(10);
            p.text('Friction insufficient: f_required = ' + f_ground.toFixed(1) + ' N > f_max = ' + (muGround * N_ground).toFixed(1) + ' N', canvasW/2, boxY + 35);
            p.text('Increase coefficient of friction or reduce mass/position', canvasW/2, boxY + 50);
        } else {
            p.fill(200, 255, 200);
            p.stroke(0, 150, 0);
            p.strokeWeight(2);
            p.rect(10, boxY, canvasW - 20, boxH, 5);
            p.fill(0, 120, 0);
            p.noStroke();
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(12);
            p.text('✓ System in Equilibrium', canvasW/2, boxY + 15);
            p.textSize(10);
            p.text('f = ' + f_ground.toFixed(1) + ' N < f_max = ' + (muGround * N_ground).toFixed(1) + ' N', canvasW/2, boxY + 35);
            p.text('Angle: ' + ladderAngle + '° | Person at ' + (personPosition * 100).toFixed(0) + '% from base', canvasW/2, boxY + 50);
        }
    }

    function drawSystemView() {
        p.push();
        p.translate(50, 80);

        const viewW = 300;
        const viewH = 400;

        // Title
        p.fill(0);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(14);
        p.text('System View (Active Forces Only)', viewW/2, 0);

        // Wall (vertical, on right side) - moved to touch ladder properly
        const theta = ladderAngle * Math.PI / 180;
        const baseX = 50;
        const baseY = viewH - 50;
        const wallX = baseX + ladderLength * Math.cos(theta);

        p.fill(200);
        p.noStroke();
        p.rect(wallX - 10, 20, 20, viewH - 20);
        p.fill(0);
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(11);
        p.text('Smooth\nWall', wallX, 25);

        // Ground (horizontal, at bottom)
        p.fill(180);
        p.rect(0, baseY, viewW, 50);

        // Hatch marks for ground
        p.stroke(100);
        p.strokeWeight(1);
        for (let i = 0; i < 20; i++) {
            p.line(i * 15, baseY, i * 15 + 10, baseY + 10);
        }

        p.fill(0);
        p.noStroke();
        p.text('Rough Ground (μ=' + muGround.toFixed(2) + ')', viewW/2, baseY + 15);

        // Calculate ladder position
        const topX = baseX + ladderLength * Math.cos(theta);
        const topY = baseY - ladderLength * Math.sin(theta);

        // Draw ladder
        p.stroke(colorLadder);
        p.strokeWeight(8);
        p.line(baseX, baseY, topX, topY);

        // Draw rungs
        p.strokeWeight(2);
        for (let i = 1; i < 8; i++) {
            const frac = i / 8;
            const x1 = baseX + frac * ladderLength * Math.cos(theta);
            const y1 = baseY - frac * ladderLength * Math.sin(theta);
            const rungLen = 15;
            const perpX = -Math.sin(theta) * rungLen;
            const perpY = -Math.cos(theta) * rungLen;
            p.line(x1 + perpX, y1 + perpY, x1 - perpX, y1 - perpY);
        }

        // Draw person (crude stick figure)
        const personX = baseX + personPosition * ladderLength * Math.cos(theta);
        const personY = baseY - 40 - personPosition * ladderLength * Math.sin(theta);

        p.fill(colorPerson);
        p.noStroke();
        p.circle(personX, personY - 15, 20); // head
        p.stroke(colorPerson);
        p.strokeWeight(3);
        p.line(personX, personY - 5, personX, personY + 15); // body
        p.line(personX - 10, personY, personX + 10, personY); // arms
        p.line(personX, personY + 15, personX - 8, personY + 30); // legs
        p.line(personX, personY + 15, personX + 8, personY + 30);

        // Draw ONLY ACTIVE FORCES on system view (weights in BLUE)
        const ladderCOM_X = baseX + 0.5 * ladderLength * Math.cos(theta);
        const ladderCOM_Y = baseY - 0.5 * ladderLength * Math.sin(theta);
        drawForceArrow(p, ladderCOM_X, ladderCOM_Y, 0, W_ladder * FORCE_SCALE, colorActiveForce, 'W_L=' + W_ladder.toFixed(0) + ' N');
        drawForceArrow(p, personX, personY, 0, W_person * FORCE_SCALE, colorActiveForce, 'W_P=' + W_person.toFixed(0) + ' N');

        // Draw dimension quotes for projections
        const dimColor = '#505050'; // dark gray

        // Horizontal projection (below ground label)
        const horizProjY = baseY + 35;
        drawDimensionQuote(p, baseX, horizProjY, topX, horizProjY,
            (ladderLength * Math.cos(theta) / 100).toFixed(2) + ' m', dimColor, 'bottom');

        // Vertical projection (to the right of wall)
        const vertProjX = wallX + 25;
        drawDimensionQuote(p, vertProjX, topY, vertProjX, baseY,
            (ladderLength * Math.sin(theta) / 100).toFixed(2) + ' m', dimColor, 'right');

        // Draw coordinate system
        drawCoordSystem(p, 20, viewH - 70);

        p.pop();
    }

    function drawFBDView() {
        p.push();
        p.translate(canvasW/2 + 50, 80);

        const viewW = 300;
        const viewH = 400;

        // Title
        p.fill(0);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(14);
        p.text('Free Body Diagram: ' + (selectedFBD === 'ladder' ? 'Ladder' : 'Person'), viewW/2, 0);

        if (selectedFBD === 'ladder') {
            drawLadderFBD(viewW, viewH);
        } else {
            drawPersonFBD(viewW, viewH);
        }

        p.pop();
    }

    function drawLadderFBD(viewW, viewH) {
        p.push();
        p.translate(viewW/2, viewH/2);

        // Draw ladder (simplified, centered)
        const theta = ladderAngle * Math.PI / 180;
        const drawLen = 180;

        p.stroke(colorLadder);
        p.strokeWeight(6);
        p.line(-drawLen/2 * Math.cos(theta), drawLen/2 * Math.sin(theta),
               drawLen/2 * Math.cos(theta), -drawLen/2 * Math.sin(theta));

        // Draw coordinate system
        drawCoordSystem(p, -viewW/2 + 20, viewH/2 - 100);

        // Forces on ladder
        // Active forces in BLUE (weights)
        // Reactive forces in RED (normal, friction)

        // Normal from wall (at top) - RED (reaction)
        const topX = drawLen/2 * Math.cos(theta);
        const topY = -drawLen/2 * Math.sin(theta);
        drawForceArrow(p, topX, topY, -N_wall * FORCE_SCALE, 0, colorReaction, 'N_w=' + N_wall.toFixed(1) + ' N', 'top');

        // Normal from ground (at base) - RED (reaction)
        const baseX = -drawLen/2 * Math.cos(theta);
        const baseY = drawLen/2 * Math.sin(theta);
        drawForceArrow(p, baseX, baseY, 0, -N_ground * FORCE_SCALE, colorReaction, 'N_g=' + N_ground.toFixed(1) + ' N', 'left');

        // Friction from ground (at base) - RED (reaction)
        drawForceArrow(p, baseX, baseY, f_ground * FORCE_SCALE, 0, colorReaction, 'f=' + f_ground.toFixed(1) + ' N', 'bottom');

        // Weight of ladder (at center) - BLUE (active)
        drawForceArrow(p, 0, 0, 0, W_ladder * FORCE_SCALE, colorActiveForce, 'W_L=' + W_ladder.toFixed(0) + ' N', 'right');

        // Weight of person on ladder (at person position) - BLUE (active)
        const personFracFromCenter = personPosition - 0.5;
        const personX_fbd = personFracFromCenter * drawLen * Math.cos(theta);
        const personY_fbd = -personFracFromCenter * drawLen * Math.sin(theta);
        drawForceArrow(p, personX_fbd, personY_fbd, 0, W_person * FORCE_SCALE, colorActiveForce, 'W_P=' + W_person.toFixed(0) + ' N', 'right');

        // Draw dimension quotes for ladder segments in FBD
        const dimColor = '#505050'; // dark gray
        const horizOffset = 70; // offset below ladder for horizontal dimensions
        const vertOffset = 40; // offset to the right for vertical dimensions

        // Get x positions of key points
        const baseX_horiz = baseX;
        const centerX_horiz = 0; // ladder center
        const personX_horiz = personX_fbd;
        const topX_horiz = topX;

        // Horizontal dimensions (below the ladder)
        const horizY = baseY + horizOffset;

        // Determine if person is above or below center
        const personAboveCenter = personPosition > 0.5;

        if (personAboveCenter) {
            // Person above center: base -> center -> person -> top
            // Horizontal segment 1: base to W_L
            const h1_len = (ladderLength / 2 * Math.cos(theta) / 100).toFixed(2) + ' m';
            drawDimensionQuote(p, baseX_horiz, horizY, centerX_horiz, horizY, h1_len, dimColor, 'bottom');

            // Horizontal segment 2: W_L to W_P
            const h2_len = (Math.abs(ladderLength * (personPosition - 0.5) * Math.cos(theta)) / 100).toFixed(2) + ' m';
            drawDimensionQuote(p, centerX_horiz, horizY, personX_horiz, horizY, h2_len, dimColor, 'bottom');

            // Horizontal segment 3: W_P to top
            const h3_len = (ladderLength * (1 - personPosition) * Math.cos(theta) / 100).toFixed(2) + ' m';
            drawDimensionQuote(p, personX_horiz, horizY, topX_horiz, horizY, h3_len, dimColor, 'bottom');
        } else {
            // Person below center: base -> person -> center -> top
            // Horizontal segment 1: base to W_P
            const h1_len = (ladderLength * personPosition * Math.cos(theta) / 100).toFixed(2) + ' m';
            drawDimensionQuote(p, baseX_horiz, horizY, personX_horiz, horizY, h1_len, dimColor, 'bottom');

            // Horizontal segment 2: W_P to W_L
            const h2_len = (Math.abs(ladderLength * (personPosition - 0.5) * Math.cos(theta)) / 100).toFixed(2) + ' m';
            drawDimensionQuote(p, personX_horiz, horizY, centerX_horiz, horizY, h2_len, dimColor, 'bottom');

            // Horizontal segment 3: W_L to top
            const h3_len = (ladderLength * (1 - 0.5) * Math.cos(theta) / 100).toFixed(2) + ' m';
            drawDimensionQuote(p, centerX_horiz, horizY, topX_horiz, horizY, h3_len, dimColor, 'bottom');
        }

        // Get y positions of key points
        const baseY_vert = baseY;
        const centerY_vert = 0; // ladder center
        const personY_vert = personY_fbd;
        const topY_vert = topY;

        // Vertical dimensions (to the right of the ladder)
        const vertX = topX + vertOffset;

        if (personAboveCenter) {
            // Person above center: base -> center -> person -> top
            // Vertical segment 1: base to W_L
            const v1_len = (ladderLength / 2 * Math.sin(theta) / 100).toFixed(2) + ' m';
            drawDimensionQuote(p, vertX, baseY_vert, vertX, centerY_vert, v1_len, dimColor, 'right');

            // Vertical segment 2: W_L to W_P
            const v2_len = (Math.abs(ladderLength * (personPosition - 0.5) * Math.sin(theta)) / 100).toFixed(2) + ' m';
            drawDimensionQuote(p, vertX, centerY_vert, vertX, personY_vert, v2_len, dimColor, 'right');

            // Vertical segment 3: W_P to top
            const v3_len = (ladderLength * (1 - personPosition) * Math.sin(theta) / 100).toFixed(2) + ' m';
            drawDimensionQuote(p, vertX, personY_vert, vertX, topY_vert, v3_len, dimColor, 'right');
        } else {
            // Person below center: base -> person -> center -> top
            // Vertical segment 1: base to W_P
            const v1_len = (ladderLength * personPosition * Math.sin(theta) / 100).toFixed(2) + ' m';
            drawDimensionQuote(p, vertX, baseY_vert, vertX, personY_vert, v1_len, dimColor, 'right');

            // Vertical segment 2: W_P to W_L
            const v2_len = (Math.abs(ladderLength * (personPosition - 0.5) * Math.sin(theta)) / 100).toFixed(2) + ' m';
            drawDimensionQuote(p, vertX, personY_vert, vertX, centerY_vert, v2_len, dimColor, 'right');

            // Vertical segment 3: W_L to top
            const v3_len = (ladderLength * (1 - 0.5) * Math.sin(theta) / 100).toFixed(2) + ' m';
            drawDimensionQuote(p, vertX, centerY_vert, vertX, topY_vert, v3_len, dimColor, 'right');
        }

        p.pop();
    }

    function drawPersonFBD(viewW, viewH) {
        p.push();
        p.translate(viewW/2, viewH/2 - 50);

        // Draw person (crude stick figure, larger)
        p.fill(colorPerson);
        p.noStroke();
        p.circle(0, -30, 40); // head
        p.stroke(colorPerson);
        p.strokeWeight(5);
        p.line(0, -10, 0, 30); // body
        p.line(-20, 0, 20, 0); // arms
        p.line(0, 30, -15, 60); // legs
        p.line(0, 30, 15, 60);

        // Draw coordinate system
        drawCoordSystem(p, -viewW/2 + 20, viewH/2 - 50);

        // Forces on person - FOR EQUILIBRIUM, REACTION MUST BE VERTICAL
        // Person at rest on ladder → net force = 0
        // Weight is vertical downward, so reaction must be vertical upward

        // Weight (downward) - BLUE (active)
        drawForceArrow(p, 0, 30, 0, W_person * FORCE_SCALE, colorActiveForce, 'W_P=' + W_person.toFixed(0) + ' N', 'right');

        // Normal force from ladder (VERTICAL upward for equilibrium) - RED (reaction)
        // The reaction from the ladder on the person must be equal and opposite to weight
        const N_person = W_person;
        drawForceArrow(p, 0, 30, 0, -N_person * FORCE_SCALE, colorReaction, 'N=' + N_person.toFixed(0) + ' N', 'left');

        // Note
        p.fill(100);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(10);
        p.text('(Person at rest on ladder - in equilibrium)', 0, 120);
        p.text('For equilibrium: reaction force must be vertical', 0, 135);
        p.text('balancing the weight exactly', 0, 150);

        p.pop();
    }

    function drawForceArrow(p, x, y, dx, dy, col, label, labelPos = 'right') {
        const mag = Math.sqrt(dx*dx + dy*dy);
        if (mag < 1) return;

        p.stroke(col);
        p.strokeWeight(3);
        p.line(x, y, x + dx, y + dy); // dy is positive downward (canvas coords)

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
                p.text(label, x + dx + 8, y + dy);
            } else if (labelPos === 'left') {
                p.textAlign(p.RIGHT, p.CENTER);
                p.text(label, x + dx - 8, y + dy);
            } else if (labelPos === 'top') {
                p.textAlign(p.CENTER, p.BOTTOM);
                p.text(label, x + dx/2, y + dy/2 - 5);
            } else if (labelPos === 'bottom') {
                p.textAlign(p.CENTER, p.TOP);
                p.text(label, x + dx/2, y + dy/2 + 5);
            }
        }
    }

    function drawDimensionQuote(p, x1, y1, x2, y2, label, color, labelPos = 'auto') {
        // Draw dimension line with end markers (quotes)
        p.push();

        p.stroke(color);
        p.strokeWeight(1);
        p.line(x1, y1, x2, y2);

        // Calculate perpendicular direction for end markers
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx*dx + dy*dy);

        if (len < 1) {
            p.pop();
            return;
        }

        const perpX = -dy / len * 5;
        const perpY = dx / len * 5;

        // End markers (small perpendicular lines)
        p.line(x1 - perpX, y1 - perpY, x1 + perpX, y1 + perpY);
        p.line(x2 - perpX, y2 - perpY, x2 + perpX, y2 + perpY);

        // Label
        p.fill(color);
        p.noStroke();
        p.textSize(9);

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        if (labelPos === 'bottom') {
            p.textAlign(p.CENTER, p.TOP);
            p.text(label, midX, midY + 3);
        } else if (labelPos === 'right') {
            p.textAlign(p.LEFT, p.CENTER);
            p.text(label, midX + 5, midY);
        } else if (labelPos === 'auto') {
            // Determine best position based on line angle
            const angle = Math.atan2(dy, dx);
            p.push();
            p.translate(midX, midY);
            p.rotate(angle);
            p.textAlign(p.CENTER, p.BOTTOM);
            p.text(label, 0, -3);
            p.pop();
        }

        p.pop();
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
        p.rotate(0);
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
new p5(ladderSketch);
