// Billiards Collision Simulation
// Demonstrates 2D momentum conservation and coefficient of restitution
// Improved version with slower animation and diagonal impact control

function initializeBilliardsSimulation() {
    // Create billiards sketch
    let billiardsSketch = function(p) {
        let whiteBall, blueBall;
        let showVectors = true;
        let restitution = 1;
        let massRatio = 1.0;
        let tableWidth = 800;
        let tableHeight = 400;
        let pixelsPerMeter = 40; // Scale factor
        let isRunning = false;
        let hasCollided = false;
        let timeScale = 0.01; // Slow down factor for animation (1% speed)

        // Initial conditions
        let whiteYPos = 200;
        let blueYPos = 200; // Blue ball always centred
        let whiteSpeed = 1;
        let blueSpeed = 1;
        
        // Trail for visualisation
        let whiteTrail = [];
        let blueTrail = [];
        let maxTrailLength = 30;
        
        // Data for display
        let collisionData = {
            impactAngle: 0,
            impactParameter: 0,
            whiteInitial: {v: 0, angle: 0},
            blueInitial: {v: 0, angle: 0},
            whiteFinal: {v: 0, angle: 0},
            blueFinal: {v: 0, angle: 0}
        };

        class Ball {
            constructor(x, y, vx, vy, mass, colour, name) {
                this.pos = p.createVector(x, y);
                this.vel = p.createVector(vx, vy);
                this.initialVel = p.createVector(vx, vy);
                this.radius = 15;
                this.mass = mass;
                this.colour = colour;
                this.name = name;
            }

            update() {
                if (isRunning) {
                    // Apply time scaling for slower animation
                    let scaledVel = p5.Vector.mult(this.vel, timeScale);
                    this.pos.add(scaledVel);
                    
                    // No wall collisions - balls continue off screen
                    // This makes the collision the focus of the simulation
                }
            }

            checkCollision(other) {
                let d = p.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
                if (d < this.radius + other.radius && d > 0 && !hasCollided) {
                    hasCollided = true;
                    
                    // Calculate collision normal (from this to other)
                    let normal = p5.Vector.sub(other.pos, this.pos);
                    normal.normalize();
                    
                    // Calculate impact angle and impact parameter
                    collisionData.impactAngle = p.degrees(p.atan2(normal.y, normal.x));
                    
                    // Impact parameter b (perpendicular distance from centre line)
                    // b = 0 for head-on collision, b = R1+R2 for grazing collision
                    let yDiff = Math.abs(whiteYPos - blueYPos);
                    collisionData.impactParameter = yDiff / (this.radius + other.radius);
                    
                    // Store initial velocities
                    collisionData.whiteInitial.v = whiteBall.vel.mag() / pixelsPerMeter;
                    collisionData.whiteInitial.angle = p.degrees(whiteBall.vel.heading());
                    collisionData.blueInitial.v = blueBall.vel.mag() / pixelsPerMeter;
                    collisionData.blueInitial.angle = p.degrees(blueBall.vel.heading());
                    
                    // Calculate tangent
                    let tangent = p.createVector(-normal.y, normal.x);
                    
                    // Project velocities onto normal and tangent
                    let v1n = p5.Vector.dot(this.vel, normal);
                    let v1t = p5.Vector.dot(this.vel, tangent);
                    let v2n = p5.Vector.dot(other.vel, normal);
                    let v2t = p5.Vector.dot(other.vel, tangent);
                    
                    // Apply conservation of momentum and coefficient of restitution
                    // Normal components
                    let v1n_new = ((this.mass - restitution * other.mass) * v1n + 
                                  (1 + restitution) * other.mass * v2n) / 
                                  (this.mass + other.mass);
                    let v2n_new = ((other.mass - restitution * this.mass) * v2n + 
                                  (1 + restitution) * this.mass * v1n) / 
                                  (this.mass + other.mass);
                    
                    // Tangential components remain unchanged (no friction)
                    let v1t_new = v1t;
                    let v2t_new = v2t;
                    
                    // Convert back to velocity vectors
                    let v1_normal = p5.Vector.mult(normal, v1n_new);
                    let v1_tangent = p5.Vector.mult(tangent, v1t_new);
                    let v2_normal = p5.Vector.mult(normal, v2n_new);
                    let v2_tangent = p5.Vector.mult(tangent, v2t_new);
                    
                    // Update velocities
                    this.vel = p5.Vector.add(v1_normal, v1_tangent);
                    other.vel = p5.Vector.add(v2_normal, v2_tangent);
                    
                    // Store final velocities
                    collisionData.whiteFinal.v = whiteBall.vel.mag() / pixelsPerMeter;
                    collisionData.whiteFinal.angle = p.degrees(whiteBall.vel.heading());
                    collisionData.blueFinal.v = blueBall.vel.mag() / pixelsPerMeter;
                    collisionData.blueFinal.angle = p.degrees(blueBall.vel.heading());
                    
                    // Separate balls to prevent overlap
                    let overlap = this.radius + other.radius - d;
                    let separation = p5.Vector.mult(normal, overlap / 2);
                    this.pos.sub(separation);
                    other.pos.add(separation);
                }
            }

            display() {
                p.push();
                
                // Draw shadow for 3D effect
                p.fill(0, 0, 0, 30);
                p.noStroke();
                p.ellipse(this.pos.x + 2, this.pos.y + 2, this.radius * 2, this.radius * 2);
                
                // Main ball
                p.fill(this.colour);
                p.stroke(0);
                p.strokeWeight(2);
                p.circle(this.pos.x, this.pos.y, this.radius * 2);
                
                // Highlight for 3D effect
                p.fill(255, 255, 255, 100);
                p.noStroke();
                p.ellipse(this.pos.x - this.radius/3, this.pos.y - this.radius/3, 
                         this.radius/2, this.radius/2);
                
                // Label
                p.fill(0);
                p.noStroke();
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(12);
                p.textStyle(p.BOLD);
                p.text(this.name, this.pos.x, this.pos.y);
                
                if (showVectors && this.vel.mag() > 0.01) {
                    p.stroke(255, 0, 0);
                    p.strokeWeight(3);
                    let velDisplay = p5.Vector.mult(this.vel, 2);
                    p.line(this.pos.x, this.pos.y, 
                           this.pos.x + velDisplay.x, this.pos.y + velDisplay.y);
                    
                    // Arrowhead
                    p.push();
                    p.translate(this.pos.x + velDisplay.x, this.pos.y + velDisplay.y);
                    p.rotate(velDisplay.heading());
                    p.fill(255, 0, 0);
                    p.noStroke();
                    p.triangle(0, 0, -8, -4, -8, 4);
                    p.pop();
                }
                p.pop();
            }
        }

        p.setup = function() {
            let canvas = p.createCanvas(tableWidth, tableHeight);
            canvas.parent('billiards-container');
            resetSimulation();
        };

        function resetSimulation() {
            isRunning = false;
            hasCollided = false;
            whiteTrail = [];
            blueTrail = [];
            
            // Blue ball always at centre height
            blueYPos = tableHeight / 2;
            
            // Create balls with initial positions and velocities
            whiteBall = new Ball(
                100, whiteYPos, 
                whiteSpeed * pixelsPerMeter, 0, 
                massRatio, 
                p.color(255, 255, 240), 
                'W'
            );
            
            blueBall = new Ball(
                700, blueYPos, 
                -blueSpeed * pixelsPerMeter, 0, 
                1, 
                p.color(100, 150, 255), 
                'B'
            );
            
            // Reset collision data
            collisionData = {
                impactAngle: 0,
                impactParameter: 0,
                whiteInitial: {v: whiteSpeed, angle: 0},
                blueInitial: {v: blueSpeed, angle: 180},
                whiteFinal: {v: 0, angle: 0},
                blueFinal: {v: 0, angle: 0}
            };
        }

        function drawTrajectoryPreview() {
            if (!isRunning && !hasCollided) {
                p.push();
                p.stroke(255, 255, 0, 100);
                p.strokeWeight(2);
                //p.setLineDash([5, 10]);
                
                // Draw expected path for white ball
                p.line(whiteBall.pos.x, whiteBall.pos.y, 
                      whiteBall.pos.x + 200, whiteBall.pos.y);
                
                // Draw expected path for blue ball
                p.stroke(100, 150, 255, 100);
                p.line(blueBall.pos.x, blueBall.pos.y, 
                      blueBall.pos.x - 200, blueBall.pos.y);
                
                // Show collision point preview if balls will collide
                let yDiff = Math.abs(whiteYPos - blueYPos);
                if (yDiff < whiteBall.radius + blueBall.radius) {
                    p.stroke(255, 0, 0, 100);
                    p.strokeWeight(2);
                    p.noFill();
                    p.circle(tableWidth/2, (whiteYPos + blueYPos)/2, 40);
                }
                
                p.pop();
            }
        }

        p.draw = function() {
            // Background gradient
            for (let i = 0; i <= tableHeight; i++) {
                let inter = p.map(i, 0, tableHeight, 0, 1);
                let c = p.lerpColor(p.color(0, 120, 0), p.color(0, 80, 0), inter);
                p.stroke(c);
                p.line(0, i, tableWidth, i);
            }
            
            // Draw grid for reference
            p.stroke(255, 255, 255, 20);
            p.strokeWeight(1);
            for (let x = 0; x < tableWidth; x += 50) {
                p.line(x, 0, x, tableHeight);
            }
            for (let y = 0; y < tableHeight; y += 50) {
                p.line(0, y, tableWidth, y);
            }
            
            // Centre line
            p.stroke(255, 255, 255, 40);
            p.strokeWeight(2);
            p.line(tableWidth/2, 0, tableWidth/2, tableHeight);
            
            // Draw trajectory preview
            drawTrajectoryPreview();
            
            // Add to trails
            if (isRunning) {
                whiteTrail.push({x: whiteBall.pos.x, y: whiteBall.pos.y});
                blueTrail.push({x: blueBall.pos.x, y: blueBall.pos.y});
                
                if (whiteTrail.length > maxTrailLength) whiteTrail.shift();
                if (blueTrail.length > maxTrailLength) blueTrail.shift();
            }
            
            // Draw trails
            p.noFill();
            p.strokeWeight(2);
            
            // White ball trail
            for (let i = 0; i < whiteTrail.length - 1; i++) {
                let alpha = p.map(i, 0, whiteTrail.length, 20, 150);
                p.stroke(255, 255, 240, alpha);
                p.line(whiteTrail[i].x, whiteTrail[i].y, 
                      whiteTrail[i + 1].x, whiteTrail[i + 1].y);
            }
            
            // Blue ball trail
            for (let i = 0; i < blueTrail.length - 1; i++) {
                let alpha = p.map(i, 0, blueTrail.length, 20, 150);
                p.stroke(100, 150, 255, alpha);
                p.line(blueTrail[i].x, blueTrail[i].y, 
                      blueTrail[i + 1].x, blueTrail[i + 1].y);
            }
            
            // Update and display balls
            whiteBall.update();
            blueBall.update();
            
            // Check collision
            whiteBall.checkCollision(blueBall);
            
            whiteBall.display();
            blueBall.display();
            
            // Draw collision indicator
            if (hasCollided && p.frameCount % 30 < 15) {
                p.push();
                p.stroke(255, 255, 0);
                p.strokeWeight(3);
                p.noFill();
                let collisionX = (whiteBall.pos.x + blueBall.pos.x) / 2;
                let collisionY = (whiteBall.pos.y + blueBall.pos.y) / 2;
                p.circle(collisionX, collisionY, 50);
                p.pop();
            }
            
            // Display collision data overlay
            displayDataOverlay();
        };
        
        function displayDataOverlay() {
            p.fill(255);
            p.stroke(0);
            p.strokeWeight(1);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(11);

            // Background for text - made smaller and more transparent
            p.fill(0, 0, 0, 100);
            p.noStroke();
            p.rect(5, 5, 290, 165, 5);
            
            p.fill(255);
            p.text('Initial Conditions:', 10, 10);
            p.text(`  White: v₀ = ${whiteSpeed.toFixed(1)} m/s, θ = 0°`, 10, 30);
            p.text(`  Blue:  v₀ = ${blueSpeed.toFixed(1)} m/s, θ = 180° (centred)`, 10, 50);
            p.text(`  Mass Ratio (W/B): ${massRatio.toFixed(1)}`, 10, 70);
            p.text(`  Coefficient of Restitution: ${restitution.toFixed(1)}`, 10, 90);
            p.text(`  White Ball Y Offset: ${(whiteYPos - tableHeight/2).toFixed(0)} px`, 10, 110);
            
            if (hasCollided) {
                p.fill(255, 255, 0);
                p.text(`Impact Parameter b: ${collisionData.impactParameter.toFixed(2)}`, 10, 135);
                p.text(`  (0 = head-on, 1 = grazing)`, 10, 155);
                p.fill(255);
                p.text('Final Velocities:', 10, 175);
                p.text(`  White: v = ${collisionData.whiteFinal.v.toFixed(2)} m/s, θ = ${collisionData.whiteFinal.angle.toFixed(1)}°`, 10, 195);
                p.text(`  Blue:  v = ${collisionData.blueFinal.v.toFixed(2)} m/s, θ = ${collisionData.blueFinal.angle.toFixed(1)}°`, 10, 215);
            }
            
            // Display momentum and energy
            let totalMomentumX = whiteBall.mass * whiteBall.vel.x + blueBall.mass * blueBall.vel.x;
            let totalMomentumY = whiteBall.mass * whiteBall.vel.y + blueBall.mass * blueBall.vel.y;
            let totalMomentum = p.sqrt(totalMomentumX * totalMomentumX + totalMomentumY * totalMomentumY);
            
            // Calculate kinetic energy
            let kineticEnergy = 0.5 * whiteBall.mass * whiteBall.vel.magSq() + 
                               0.5 * blueBall.mass * blueBall.vel.magSq();
            kineticEnergy = kineticEnergy / (pixelsPerMeter * pixelsPerMeter);
            
            p.fill(0, 0, 0, 100);
            p.noStroke();
            p.rect(tableWidth - 220, 5, 215, 90, 5);
            
            p.fill(255);
            p.textAlign(p.RIGHT, p.TOP);
            p.text(`Total Momentum: ${(totalMomentum/pixelsPerMeter).toFixed(2)} kg·m/s`, tableWidth - 10, 10);
            p.text(`Px: ${(totalMomentumX/pixelsPerMeter).toFixed(2)} kg·m/s`, tableWidth - 10, 30);
            p.text(`Py: ${(totalMomentumY/pixelsPerMeter).toFixed(2)} kg·m/s`, tableWidth - 10, 50);
            p.text(`Kinetic Energy: ${kineticEnergy.toFixed(2)} J`, tableWidth - 10, 70);
            p.text(`Animation Speed: ${(timeScale * 100).toFixed(0)}%`, tableWidth - 10, 90);
        }

        // External controls
        p.resetSimulation = function() {
            resetSimulation();
        };

        p.runCollision = function() {
            resetSimulation();
            isRunning = true;
        };

        p.toggleVectors = function() {
            showVectors = !showVectors;
        };

        p.setParameter = function(param, value) {
            switch(param) {
                case 'massRatio':
                    massRatio = value;
                    break;
                case 'whiteY':
                    whiteYPos = value;
                    break;
                case 'whiteSpeed':
                    whiteSpeed = value;
                    break;
                case 'blueSpeed':
                    blueSpeed = value;
                    break;
                case 'restitution':
                    restitution = value;
                    break;
                case 'timeScale':
                    timeScale = value;
                    break;
            }
            resetSimulation();
        };
    };

    // Create p5 instance
    let billiards = new p5(billiardsSketch);
    
    // Set up control event listeners
    document.getElementById('reset-billiards').addEventListener('click', function() {
        billiards.resetSimulation();
    });
    
    document.getElementById('run-collision').addEventListener('click', function() {
        billiards.runCollision();
    });
    
    document.getElementById('toggle-vectors').addEventListener('click', function() {
        billiards.toggleVectors();
    });
    
    // Slider controls
    document.getElementById('mass-ratio').addEventListener('input', function() {
        document.getElementById('mass-ratio-value').textContent = parseFloat(this.value).toFixed(1);
        billiards.setParameter('massRatio', parseFloat(this.value));
    });
    
    document.getElementById('y-pos-white').addEventListener('input', function() {
        document.getElementById('y-pos-white-value').textContent = this.value;
        billiards.setParameter('whiteY', parseInt(this.value));
    });
    
    document.getElementById('speed-white').addEventListener('input', function() {
        document.getElementById('speed-white-value').textContent = parseFloat(this.value).toFixed(1);
        billiards.setParameter('whiteSpeed', parseFloat(this.value));
    });
    
    document.getElementById('speed-blue').addEventListener('input', function() {
        document.getElementById('speed-blue-value').textContent = parseFloat(this.value).toFixed(1);
        billiards.setParameter('blueSpeed', parseFloat(this.value));
    });
    
    document.getElementById('restitution').addEventListener('input', function() {
        document.getElementById('restitution-value').textContent = this.value;
        billiards.setParameter('restitution', parseFloat(this.value));
    });
    
    // Animation speed control (if added to HTML)
    if (document.getElementById('time-scale')) {
        document.getElementById('time-scale').addEventListener('input', function() {
            document.getElementById('time-scale-value').textContent = (parseFloat(this.value) * 100).toFixed(0) + '%';
            billiards.setParameter('timeScale', parseFloat(this.value));
        });
    }
}