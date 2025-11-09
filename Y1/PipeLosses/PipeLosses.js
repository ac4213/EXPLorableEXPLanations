// Pipe losses simulation using p5.js
let sketch = new p5(function(p) {
    let pipeLength = 50; // m
    let pipeDiameter = 100; // mm
    let flowVelocity = 2; // m/s
    let roughness = 0.046; // mm (commercial steel)
    let fittings = [];

    const density = 1000; // kg/m³
    const viscosity = 0.001; // Pa·s (water at 20°C)
    const g = 9.81;

    const fittingTypes = {
        'elbow90': {K: 0.9, label: '90° Elbow', color: [200, 100, 100]},
        'elbow45': {K: 0.4, label: '45° Elbow', color: [200, 150, 100]},
        'tee': {K: 0.6, label: 'T-junction', color: [100, 150, 200]},
        'valve': {K: 0.2, label: 'Gate Valve', color: [100, 200, 100]},
        'globe': {K: 10.0, label: 'Globe Valve', color: [200, 100, 200]}
    };

    let particles = [];

    p.setup = function() {
        let canvasWidth = Math.min(800, p.windowWidth - 40);
        p.createCanvas(canvasWidth, 350);
        setupControls();
        initializeParticles();
        calculateLosses();
    };

    p.draw = function() {
        p.background(240);

        // Draw pipe system
        drawPipeSystem(p);

        // Update and draw particles
        updateParticles(p);
        drawParticles(p);

        // Draw legend for fittings
        drawFittingsLegend(p);
    };

    function initializeParticles() {
        particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: 20 + i * 15,
                y: 175 + p.random(-15, 15),
                vx: flowVelocity * 15
            });
        }
    }

    function drawPipeSystem(p) {
        // Draw main horizontal pipe
        p.fill(180, 180, 200, 150);
        p.stroke(100);
        p.strokeWeight(3);
        p.rect(20, 150, 760, 50, 5);

        // Draw fittings along the pipe
        const spacing = 760 / (fittings.length + 1);
        for (let i = 0; i < fittings.length; i++) {
            const xPos = 20 + spacing * (i + 1);
            const fitting = fittingTypes[fittings[i]];

            p.fill(fitting.color);
            p.stroke(80);
            p.strokeWeight(2);

            // Draw fitting icon
            switch(fittings[i]) {
                case 'elbow90':
                    p.rect(xPos - 15, 150, 30, 25);
                    p.triangle(xPos - 15, 125, xPos + 15, 125, xPos, 150);
                    break;
                case 'elbow45':
                    p.rect(xPos - 15, 150, 30, 25);
                    p.quad(xPos - 15, 135, xPos + 15, 135, xPos + 20, 150, xPos - 10, 150);
                    break;
                case 'tee':
                    p.rect(xPos - 15, 150, 30, 25);
                    p.rect(xPos - 10, 110, 20, 40);
                    break;
                case 'valve':
                case 'globe':
                    p.ellipse(xPos, 175, 40, 40);
                    p.line(xPos - 20, 175, xPos + 20, 175);
                    break;
            }

            // Label
            p.noStroke();
            p.fill(0);
            p.textAlign(p.CENTER);
            p.textSize(9);
            p.text(fitting.label.split(' ')[0], xPos, 220);
        }

        // Draw flow direction arrow
        p.fill(100);
        p.noStroke();
        p.textSize(12);
        p.textAlign(p.CENTER);
        p.text('Flow Direction →', 400, 240);

        // Draw pressure gradient
        drawPressureGradient(p);
    }

    function drawPressureGradient(p) {
        // Visual representation of pressure drop
        const totalLoss = calculateTotalLoss();
        const gradientHeight = Math.min(totalLoss * 3, 50);

        p.stroke(200, 50, 50);
        p.strokeWeight(2);
        p.noFill();
        p.beginShape();
        p.vertex(20, 130);
        p.vertex(20, 130 - gradientHeight * 0.1);
        p.vertex(780, 130 - gradientHeight);
        p.vertex(780, 130);
        p.endShape();

        p.fill(200, 50, 50, 50);
        p.noStroke();
        p.beginShape();
        p.vertex(20, 130);
        p.vertex(20, 130 - gradientHeight * 0.1);
        p.vertex(780, 130 - gradientHeight);
        p.vertex(780, 130);
        p.endShape(p.CLOSE);

        // Label
        p.fill(150, 0, 0);
        p.textSize(10);
        p.textAlign(p.LEFT);
        p.text('Pressure', 25, 120);
    }

    function updateParticles(p) {
        for (let particle of particles) {
            particle.x += particle.vx * 0.03;

            if (particle.x > 780) {
                particle.x = 20;
                particle.y = 175 + p.random(-15, 15);
            }
        }
    }

    function drawParticles(p) {
        p.noStroke();
        p.fill(74, 144, 226, 180);
        for (let particle of particles) {
            if (particle.x >= 20 && particle.x <= 780) {
                p.ellipse(particle.x, particle.y, 4, 4);
            }
        }
    }

    function drawFittingsLegend(p) {
        p.fill(0);
        p.noStroke();
        p.textAlign(p.LEFT);
        p.textSize(11);
        p.text('Current Fittings: ' + (fittings.length === 0 ? 'None' : fittings.length), 20, 280);

        let yPos = 295;
        for (let i = 0; i < fittings.length && i < 3; i++) {
            const fitting = fittingTypes[fittings[i]];
            p.fill(fitting.color);
            p.rect(20, yPos, 15, 15);
            p.fill(0);
            p.text(fitting.label + ' (K=' + fitting.K + ')', 40, yPos + 12);
            yPos += 18;
        }
        if (fittings.length > 3) {
            p.text('... and ' + (fittings.length - 3) + ' more', 40, yPos);
        }
    }

    function setupControls() {
        document.getElementById("pipe-length").addEventListener("input", function() {
            pipeLength = parseFloat(this.value);
            document.getElementById("pipe-length-value").textContent = pipeLength;
            calculateLosses();
        });

        document.getElementById("pipe-diameter").addEventListener("input", function() {
            pipeDiameter = parseFloat(this.value);
            document.getElementById("pipe-diameter-value").textContent = pipeDiameter;
            calculateLosses();
        });

        document.getElementById("flow-velocity").addEventListener("input", function() {
            flowVelocity = parseFloat(this.value);
            document.getElementById("flow-velocity-value").textContent = flowVelocity.toFixed(1);
            initializeParticles();
            calculateLosses();
        });

        document.getElementById("roughness").addEventListener("change", function() {
            roughness = parseFloat(this.value);
            calculateLosses();
        });

        // Fitting buttons
        document.querySelectorAll('.fitting-button').forEach(button => {
            button.addEventListener('click', function() {
                const fittingType = this.dataset.fitting;
                if (fittingType) {
                    fittings.push(fittingType);
                    calculateLosses();
                }
            });
        });

        document.getElementById("clear-fittings").addEventListener("click", function() {
            fittings = [];
            calculateLosses();
        });
    }

    function calculateTotalLoss() {
        const D = pipeDiameter / 1000; // Convert to meters
        const Re = (density * flowVelocity * D) / viscosity;

        // Calculate friction factor
        let f;
        if (Re < 2300) {
            f = 64 / Re;
        } else {
            // Swamee-Jain equation for turbulent flow
            const epsilon = roughness; // mm
            const term1 = (epsilon / D) / 3.7;
            const term2 = 5.74 / Math.pow(Re, 0.9);
            f = 0.25 / Math.pow(Math.log10(term1 + term2), 2);
        }

        // Major loss
        const majorLoss = f * (pipeLength / D) * (flowVelocity * flowVelocity) / (2 * g);

        // Minor loss
        let totalK = 0;
        for (let fitting of fittings) {
            totalK += fittingTypes[fitting].K;
        }
        const minorLoss = totalK * (flowVelocity * flowVelocity) / (2 * g);

        const totalLoss = majorLoss + minorLoss;
        const pressureDrop = density * g * totalLoss / 1000; // kPa

        // Update display
        document.getElementById("reynolds").textContent = Re.toFixed(0);
        document.getElementById("flow-regime").textContent = Re < 2300 ? 'Laminar' : 'Turbulent';
        document.getElementById("friction-factor").textContent = f.toFixed(4);
        document.getElementById("major-loss").textContent = majorLoss.toFixed(2);
        document.getElementById("minor-loss").textContent = minorLoss.toFixed(2);
        document.getElementById("total-loss").textContent = totalLoss.toFixed(2);
        document.getElementById("pressure-drop").textContent = pressureDrop.toFixed(1);

        return totalLoss;
    }

    function calculateLosses() {
        calculateTotalLoss();
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
