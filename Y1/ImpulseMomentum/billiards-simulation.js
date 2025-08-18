// Billiards Collision Simulation
// Demonstrates 2D momentum conservation and coefficient of restitution

function initializeBilliardsSimulation() {
    // Create billiards sketch
    let billiardsSketch = function(p) {
        let whiteBall, blueBall;
        let showVectors = true;
        let restitution = 0.9;
        let massRatio = 1.0;
        let tableWidth = 800;
        let tableHeight = 400;
        let pixelsPerMeter = 40; // Scale factor
        let isRunning = false;
        let hasCollided = false;
        
        // Initial conditions
        let whiteYPos = 200;
        let blueYPos = 200;
        let whiteSpeed = 5;
        let blueSpeed = 2;
        
        // Data for display
        let collisionData = {
            impactAngle: 0,
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
                    this.pos.add(this.vel);
                }
                
                // Wall collisions (elastic)
                if (this.pos.x - this.radius < 0 || this.pos.x + this.radius > tableWidth) {
                    this.vel.x *= -1;
                    this.pos.x = p.constrain(this.pos.x, this.radius, tableWidth - this.radius);
                }
                if (this.pos.y - this.radius < 0 || this.pos.y + this.radius > tableHeight) {
                    this.vel.y *= -1;
                    this.pos.y = p.constrain(this.pos.y, this.radius, tableHeight - this.radius);
                }
            }

            checkCollision(other) {
                let d = p.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
                if (d < this.radius + other.radius && d > 0 && !hasCollided) {
                    hasCollided = true;
                    
                    // Calculate collision normal (from this to other)
                    let normal = p5.Vector.sub(other.pos, this.pos);
                    normal.normalize();
                    
                    // Calculate impact angle
                    collisionData.impactAngle = p.degrees(p.atan2(normal.y, normal.x));
                    
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
                p.fill(this.colour);
                p.stroke(0);
                p.strokeWeight(2);
                p.circle(this.pos.x, this.pos.y, this.radius * 2);
                
                // Label
                p.fill(0);
                p.noStroke();
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(10);
                p.text(this.name, this.pos.x, this.pos.y);
                
                if (showVectors && this.vel.mag() > 0.01) {
                    p.stroke(255, 0, 0);
                    p.strokeWeight(2);
                    let velDisplay = p5.Vector.mult(this.vel, 2);
                    p.line(this.pos.x, this.pos.y, 
                           this.pos.x + velDisplay.x, this.pos.y + velDisplay.y);
                    
                    // Arrowhead
                    p.push();
                    p.translate(this.pos.x + velDisplay.x, this.pos.y + velDisplay.y);
                    p.rotate(velDisplay.heading());
                    p.fill(255, 0, 0);
                    p.noStroke();
                    p.triangle(0, 0, -5, -3, -5, 3);
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
            
            // Create balls with initial positions and velocities
            whiteBall = new Ball(
                100, whiteYPos, 
                whiteSpeed * pixelsPerMeter, 0, 
                massRatio, 
                p.color(255), 
                'W'
            );
            
            blueBall = new Ball(
                700, blueYPos, 
                -blueSpeed * pixelsPerMeter, 0, 
                1, 
                p.color(100, 100, 255), 
                'B'
            );
            
            // Reset collision data
            collisionData = {
                impactAngle: 0,
                whiteInitial: {v: whiteSpeed, angle: 0},
                blueInitial: {v: blueSpeed, angle: 180},
                whiteFinal: {v: 0, angle: 0},
                blueFinal: {v: 0, angle: 0}
            };
        }

        p.draw = function() {
            // Background
            p.background(0, 100, 0);
            
            // Table border
            p.stroke(139, 69, 19);
            p.strokeWeight(20);
            p.noFill();
            p.rect(0, 0, tableWidth, tableHeight);
            
            // Centre line
            p.stroke(255, 255, 255, 50);
            p.strokeWeight(1);
            p.line(tableWidth/2, 0, tableWidth/2, tableHeight);
            
            // Update and display balls
            whiteBall.update();
            blueBall.update();
            
            // Check collision
            whiteBall.checkCollision(blueBall);
            
            whiteBall.display();
            blueBall.display();
            
            // Display collision data overlay
            p.fill(255);
            p.stroke(0);
            p.strokeWeight(1);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(14);
            
            // Background for text
            p.fill(0, 0, 0, 180);
            p.noStroke();
            p.rect(5, 5, 350, 180, 5);
            
            p.fill(255);
            p.text('Initial Conditions:', 10, 10);
            p.text(`  White: v₀ = ${whiteSpeed.toFixed(1)} m/s, θ = 0°`, 10, 30);
            p.text(`  Blue:  v₀ = ${blueSpeed.toFixed(1)} m/s, θ = 180°`, 10, 50);
            p.text(`  Mass Ratio (W/B): ${massRatio.toFixed(1)}`, 10, 70);
            p.text(`  Coefficient of Restitution: ${restitution.toFixed(1)}`, 10, 90);
            
            if (hasCollided) {
                p.text(`Impact Angle: ${collisionData.impactAngle.toFixed(1)}°`, 10, 115);
                p.text('Final Velocities:', 10, 135);
                p.text(`  White: v = ${collisionData.whiteFinal.v.toFixed(2)} m/s, θ = ${collisionData.whiteFinal.angle.toFixed(1)}°`, 10, 155);
                p.text(`  Blue:  v = ${collisionData.blueFinal.v.toFixed(2)} m/s, θ = ${collisionData.blueFinal.angle.toFixed(1)}°`, 10, 175);
            }
            
            // Display momentum
            let totalMomentumX = whiteBall.mass * whiteBall.vel.x + blueBall.mass * blueBall.vel.x;
            let totalMomentumY = whiteBall.mass * whiteBall.vel.y + blueBall.mass * blueBall.vel.y;
            let totalMomentum = p.sqrt(totalMomentumX * totalMomentumX + totalMomentumY * totalMomentumY);
            
            // Calculate kinetic energy
            let kineticEnergy = 0.5 * whiteBall.mass * whiteBall.vel.magSq() + 
                               0.5 * blueBall.mass * blueBall.vel.magSq();
            kineticEnergy = kineticEnergy / (pixelsPerMeter * pixelsPerMeter);
            
            p.fill(0, 0, 0, 180);
            p.noStroke();
            p.rect(tableWidth - 255, 5, 250, 80, 5);
            
            p.fill(255);
            p.textAlign(p.RIGHT, p.TOP);
            p.text(`Total Momentum: ${(totalMomentum/pixelsPerMeter).toFixed(2)} kg·m/s`, tableWidth - 10, 10);
            p.text(`Px: ${(totalMomentumX/pixelsPerMeter).toFixed(2)} kg·m/s`, tableWidth - 10, 30);
            p.text(`Py: ${(totalMomentumY/pixelsPerMeter).toFixed(2)} kg·m/s`, tableWidth - 10, 50);
            p.text(`Kinetic Energy: ${kineticEnergy.toFixed(2)} J`, tableWidth - 10, 70);
        };

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
                case 'blueY':
                    blueYPos = value;
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
    
    document.getElementById('y-pos-blue').addEventListener('input', function() {
        document.getElementById('y-pos-blue-value').textContent = this.value;
        billiards.setParameter('blueY', parseInt(this.value));
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
}