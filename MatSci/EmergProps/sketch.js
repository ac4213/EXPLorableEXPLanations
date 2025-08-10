let engine, world, render;
let atoms = [];
let constraints = [];
let force = 0;
let temperature = 0;
const cols = 12;
const rows = 12;
const maxForce = 0.04;
const maxTemperature = 100;
let canvas;
let atomRadius;
let maxVibrationAmplitude;
const breakSpringLength = 1.5; // Springs break at 150% of original length
let forceScaleFactor;
const maxCanvasSize = 600;
const padding = 50; // Padding around the atom lattice

function setup() {
    const containerElement = document.getElementById('canvas-container');
    const containerWidth = min(containerElement.offsetWidth, maxCanvasSize);
    const containerHeight = min(containerElement.offsetHeight, maxCanvasSize);

    canvas = createCanvas(containerWidth, containerHeight);
    canvas.parent('canvas-container');

    // Calculate atom radius based on canvas size (excluding padding)
    atomRadius = min(width - 2 * padding, height - 2 * padding) / (max(cols, rows) * 4);
    maxVibrationAmplitude = atomRadius * 2;
    forceScaleFactor = calculateForceScaleFactor();

    engine = Matter.Engine.create({
        gravity: { x: 0, y: 0 },
        constraintIterations: 5,
        positionIterations: 5,
        velocityIterations: 5
    });
    world = engine.world;

    let mouse = Matter.Mouse.create(canvas.elt);
    mouse.pixelRatio = pixelDensity(); // Fix for high DPI displays
    let mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    });
    Matter.World.add(world, mouseConstraint);

    createAtomGrid();

    const forceSlider = document.getElementById('force-slider');
    const tempSlider = document.getElementById('temp-slider');

    // Use both 'input' and 'change' events for better cross-device compatibility
    forceSlider.addEventListener('input', updateForce);
    forceSlider.addEventListener('change', updateForce);
    tempSlider.addEventListener('input', updateTemperature);
    tempSlider.addEventListener('change', updateTemperature);

    // Prevent canvas from capturing mouse events when interacting with sliders
    forceSlider.addEventListener('mousedown', (e) => e.stopPropagation());
    tempSlider.addEventListener('mousedown', (e) => e.stopPropagation());

    window.addEventListener('resize', windowResized);
}

function calculateForceScaleFactor() {
    // Base the scale factor on the diagonal of the canvas (excluding padding)
    const diagonal = sqrt(width**2+height**2);
    const referenceDiagonal = maxCanvasSize*sqrt(2); // Diagonal of a max size canvas minus padding
    
    const scalefac=(diagonal / referenceDiagonal)**4;
    //console.log({width,height,scalefac});
    return scalefac;
}

function createAtomGrid() {
    atoms = [];
    constraints = [];
    Matter.World.clear(world);

    const latticeWidth = width - 2 * padding;
    const latticeHeight = height - 2 * padding;
    const spacing = min(latticeWidth, latticeHeight) / (max(cols, rows) - 1);
    const startX = (width - (cols - 1) * spacing) / 2;
    const startY = (height - (rows - 1) * spacing) / 2;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const x = startX + j * spacing;
            const y = startY + i * spacing;
            const atom = Matter.Bodies.circle(x, y, atomRadius, {
                friction: 0.001,
                frictionAir: 0.01,
                restitution: 0.1
            });
            atoms.push(atom);
            Matter.World.add(world, atom);
        }
    }

    for (let i = 0; i < atoms.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);

        if (col < cols - 1) createConstraint(i, i + 1);
        if (row < rows - 1) createConstraint(i, i + cols);
        if (col < cols - 1 && row < rows - 1) createConstraint(i, i + cols + 1);
        if (col > 0 && row < rows - 1) createConstraint(i, i + cols - 1);
    }
}

function createConstraint(i, j) {
    const bodyA = atoms[i];
    const bodyB = atoms[j];
    const length = Matter.Vector.magnitude(Matter.Vector.sub(bodyA.position, bodyB.position));
    const constraint = Matter.Constraint.create({
        bodyA: bodyA,
        bodyB: bodyB,
        length: length,
        stiffness: 0.1,
        damping: 0.1
    });
    constraints.push({
        constraint: constraint,
        originalLength: length,
        broken: false
    });
    Matter.World.add(world, constraint);
}

function draw() {
    background(255);  // White background
    Matter.Engine.update(engine);

    applyForceAndTemperature();

    // Check and draw constraints
    for (let i = constraints.length - 1; i >= 0; i--) {
        const c = constraints[i];
        if (!c.broken) {
            const currentLength = Matter.Vector.magnitude(
                Matter.Vector.sub(c.constraint.bodyA.position, c.constraint.bodyB.position)
            );
            if (currentLength > c.originalLength * breakSpringLength) {
                Matter.World.remove(world, c.constraint);
                c.broken = true;
            } else {
                stroke(200);
                line(
                    c.constraint.bodyA.position.x,
                    c.constraint.bodyA.position.y,
                    c.constraint.bodyB.position.x,
                    c.constraint.bodyB.position.y
                );
            }
        }
    }

    // Draw atoms
    noStroke();
    fill(0, 0, 255);
    atoms.forEach(atom => {
        circle(atom.position.x, atom.position.y, atomRadius * 2);
    });
}

function applyForceAndTemperature() {
    const scaledForce = force * forceScaleFactor;
    for (let i = 0; i < atoms.length; i++) {
        if (i % cols === 0) {
            Matter.Body.applyForce(atoms[i], atoms[i].position, { x: -scaledForce, y: 0 });
        } else if (i % cols === cols - 1) {
            Matter.Body.applyForce(atoms[i], atoms[i].position, { x: scaledForce, y: 0 });
        }
        
        // Apply random vibration based on temperature
        const vibrationAmplitude = (temperature / maxTemperature) * maxVibrationAmplitude;
        const vibrationX = random(-vibrationAmplitude, vibrationAmplitude);
        const vibrationY = random(-vibrationAmplitude, vibrationAmplitude);
        Matter.Body.setPosition(atoms[i], {
            x: atoms[i].position.x + vibrationX,
            y: atoms[i].position.y + vibrationY
        });
    }
}

function updateForce(event) {
    force = map(parseFloat(event.target.value), 0, 100, 0, maxForce);
    document.getElementById('force-value').textContent = event.target.value + "%";
}

function updateTemperature(event) {
    temperature = map(parseInt(event.target.value), 0, 100, 0, maxTemperature);
    document.getElementById('temp-value').textContent = event.target.value + "%";
}

function windowResized() {
    const containerElement = document.getElementById('canvas-container');
    const containerWidth = min(containerElement.offsetWidth, maxCanvasSize);
    const containerHeight = min(containerElement.offsetHeight, maxCanvasSize);
    resizeCanvas(containerWidth, containerHeight);
    atomRadius = min(width - 2 * padding, height - 2 * padding) / (max(cols, rows) * 4);
    maxVibrationAmplitude = atomRadius * 2;
    forceScaleFactor = calculateForceScaleFactor();
    createAtomGrid();
}

// Touch event handlers remain the same
function touchStarted(event) {
    if (event.target.type === 'range') {
        return true;
    }
    return false;
}

function touchMoved(event) {
    if (event.target.type === 'range') {
        return true;
    }
    return false;
}

function touchEnded(event) {
    if (event.target.type === 'range') {
        return true;
    }
    return false;
}

function mousePressed(event) {
    if (event.target.type === 'range') {
        return true;
    }
}