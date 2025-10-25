// Angular Momentum Conservation Simulation
// Demonstrates conservation of angular momentum with variable moment of inertia

function initializeAngularSimulation() {
    // Create angular momentum sketch
    let angularSketch = function(p) {
        let angle = 0;
        let angularVel = 0;
        let massRadius = 100;
        let targetRadius = 100;
        let massSize = 20;
        let momentOfInertia;
        let angularMomentum = 0;
        let isSpinning = false;
        
        // Visual enhancement variables
        let trailPoints = [];
        let maxTrailPoints = 20;

        p.setup = function() {
            let canvas = p.createCanvas(600, 400);
            canvas.parent('angular-container');
            calculateMomentOfInertia();
        };

        function calculateMomentOfInertia() {
            // Two point masses at distance r from centre
            // I = 2 * m * r^2 (treating masses as point masses)
            // Scaling factor for display purposes
            momentOfInertia = 2 * massSize * massRadius * massRadius / 10000;
        }

        p.draw = function() {
            p.background(240);
            
            // Draw reference grid
            drawGrid();
            
            p.push();
            p.translate(p.width/2, p.height/2);
            
            // Draw rotation indicator circle
            p.stroke(200);
            p.strokeWeight(1);
            p.noFill();
            p.circle(0, 0, massRadius * 2 + 40);
            
            // Draw axis (bearing)
            p.stroke(100);
            p.strokeWeight(6);
            p.line(0, -25, 0, 25);
            
            // Draw centre hub
            p.fill(80);
            p.noStroke();
            p.ellipse(0, 0, 15, 15);
            
            // Add inner circle detail
            p.fill(120);
            p.ellipse(0, 0, 8, 8);
            
            // Rotate system
            p.rotate(angle);
            
            // Draw connecting rod with gradient effect
            p.push();
            for (let i = 0; i < 5; i++) {
                p.stroke(50 + i * 20);
                p.strokeWeight(5 - i);
                p.line(-massRadius, 0, massRadius, 0);
            }
            p.pop();
            
            // Draw masses with 3D effect
            drawMassWithEffect(-massRadius, 0);
            drawMassWithEffect(massRadius, 0);
            
            p.pop();
            
            // Update rotation
            if (isSpinning) {
                angle += angularVel;
                
                // Add trail points for visual effect
                if (angularVel !== 0) {
                    let x1 = p.width/2 + massRadius * p.cos(angle);
                    let y1 = p.height/2 + massRadius * p.sin(angle);
                    trailPoints.push({x: x1, y: y1, alpha: 255});
                    
                    if (trailPoints.length > maxTrailPoints) {
                        trailPoints.shift();
                    }
                }
                
                // Smoothly transition radius
                if (massRadius !== targetRadius) {
                    let diff = targetRadius - massRadius;
                    massRadius += diff * 0.1;
                    
                    // Conserve angular momentum
                    if (angularMomentum !== 0) {
                        calculateMomentOfInertia();
                        angularVel = angularMomentum / momentOfInertia;
                    }
                }
            }
            
            // Draw motion trail
            drawTrail();
            
            // Display information panel
            drawInfoPanel();
            
/*             // Draw visual indicators
            if (isSpinning) {
                drawRotationIndicator();
            } */
        };

        function drawGrid() {
            p.stroke(220);
            p.strokeWeight(0.5);
            for (let x = 0; x < p.width; x += 50) {
                p.line(x, 0, x, p.height);
            }
            for (let y = 0; y < p.height; y += 50) {
                p.line(0, y, p.width, y);
            }
        }

        function drawMassWithEffect(x, y) {
            p.push();
            p.translate(x, y);
            
            // Shadow
            p.fill(0, 0, 0, 30);
            p.noStroke();
            p.ellipse(3, 3, massSize * 2, massSize * 2);
            
            // Main mass
            p.fill(200, 50, 50);
            p.stroke(150, 30, 30);
            p.strokeWeight(2);
            p.ellipse(0, 0, massSize * 2, massSize * 2);
            
            // Highlight
            p.fill(255, 150, 150);
            p.noStroke();
            p.ellipse(-massSize/3, -massSize/3, massSize/2, massSize/2);
            
            p.pop();
        }

        function drawTrail() {
            p.noFill();
            for (let i = 0; i < trailPoints.length; i++) {
                let point = trailPoints[i];
                point.alpha *= 0.95; // Fade out
                p.stroke(200, 50, 50, point.alpha);
                p.strokeWeight(3);
                p.point(point.x, point.y);
            }
        }

        function drawInfoPanel() {
            // Background panel - made smaller and more transparent
            p.fill(0, 0, 0, 100);
            p.noStroke();
            p.rect(5, 5, 250, 120, 5);

            // Text information
            p.fill(255);
            p.noStroke();
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(11);
            p.text(`Angular Velocity: ${(angularVel * 60).toFixed(2)} rad/s`, 10, 10);
            p.text(`Moment of Inertia: ${momentOfInertia.toFixed(4)} kg·m²`, 10, 30);
            p.text(`Angular Momentum: 120 kg·m²/s`, 10, 50);
            p.text(`Mass Position: ${massRadius.toFixed(0)} px from centre`, 10, 70);
            
            // RPM display
            let rpm = Math.abs(angularVel * 60 * 60 / (2 * Math.PI));
            p.text(`Rotation Speed: ${rpm.toFixed(1)} RPM`, 10, 90);
            
            // Visual indicator of conservation
            if (angularMomentum !== 0) {
                p.fill(0, 255, 0);
                p.text('L = Iω = constant ✓', 10, 115);
            }
        }

/*         function drawRotationIndicator() {
            // Draw rotation direction arrow
            p.push();
            p.translate(p.width/2, p.height/2);
            
            if (angularVel > 0) {
                // Clockwise arrow
                p.stroke(100, 200, 100, 100);
                p.strokeWeight(3);
                p.noFill();
                p.arc(0, 0, 300, 300, 0, p.PI/2);
                
                // Arrowhead
                p.fill(100, 200, 100, 100);
                p.noStroke();
                p.push();
                p.translate(150, 0);
                p.rotate(p.PI/2);
                p.triangle(0, 0, -8, -5, -8, 5);
                p.pop();
            }
            
            p.pop();
        } */

        // Control functions
        p.spinUp = function() {
            if (!isSpinning) {
                angularVel = 0.05;
                angularMomentum = momentOfInertia * angularVel;
                isSpinning = true;
                trailPoints = []; // Clear trail
            }
        };

        p.extendMasses = function() {
            if (isSpinning) {
                targetRadius = 150;
            }
        };

        p.retractMasses = function() {
            if (isSpinning) {
                targetRadius = 50;
            }
        };

        p.resetSimulation = function() {
            angle = 0;
            angularVel = 0;
            massRadius = 100;
            targetRadius = 100;
            angularMomentum = 0;
            isSpinning = false;
            trailPoints = [];
            calculateMomentOfInertia();
        };
    };

    // Create p5 instance
    let angular = new p5(angularSketch);
    
    // Set up control event listeners
    document.getElementById('spin-up').addEventListener('click', function() {
        angular.spinUp();
    });
    
    document.getElementById('extend-masses').addEventListener('click', function() {
        angular.extendMasses();
    });
    
    document.getElementById('retract-masses').addEventListener('click', function() {
        angular.retractMasses();
    });
    
    document.getElementById('reset-angular').addEventListener('click', function() {
        angular.resetSimulation();
    });
}