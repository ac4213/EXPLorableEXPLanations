// Debug message to verify script is running
console.log("Gear trains script loaded");

// Main p5.js sketches for gear simulations
let typeSketch, profileSketch, simpleSketch, compoundSketch, epicyclicSketch, applicationSketch;

// Global parameters and state
const BACKGROUND_COLOR = [245, 245, 235];
let globalGearType = 'spur';
let globalRotationSpeed = 0.03;
let globalNumTeeth = 20;
let globalPressureAngle = 20;
let globalShowInvolute = false;

// Simple gear train globals
let simpleDriverTeeth = 20;
let simpleDrivenTeeth = 40;
let simpleIdlerTeeth = 15;
let simpleIncludeIdler = false;
let simpleDriverSpeed = 30; // RPM

// Setup function to create all sketches when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Content Loaded - Initializing sketches");
    
    // Set up UI event listeners first
    setupUIEventListeners();
    console.log("UI event listeners set up");
    
    try {
        // Create the gear type sketch
        typeSketch = new p5(createGearTypeSketch, 'gear-types-simulation');
        console.log("Gear type sketch created");
        
        // Create the tooth profile sketch
        profileSketch = new p5(createToothProfileSketch, 'tooth-profile-simulation');
        console.log("Tooth profile sketch created");
        
        // Create the simple gear train sketch
        simpleSketch = new p5(createSimpleGearSketch, 'simple-gear-simulation');
        console.log("Simple gear train sketch created");
        
        // Create the compound gear train sketch
        compoundSketch = new p5(createCompoundGearSketch, 'compound-gear-simulation');
        console.log("Compound gear train sketch created");
        
        // Create the epicyclic gear train sketch
        epicyclicSketch = new p5(createEpicyclicGearSketch, 'epicyclic-gear-simulation');
        console.log("Epicyclic gear train sketch created");
        
        // Create the application sketch
        applicationSketch = new p5(createApplicationSketch, 'application-simulation');
        console.log("Application sketch created");
    } catch (error) {
        console.error("Error initializing sketches:", error);
    }
});

// Gear class - base gear functionality
class Gear {
    constructor(x, y, radius, numTeeth, color = [200, 200, 200], isInternal = false) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.numTeeth = numTeeth;
        this.color = color;
        this.isInternal = isInternal;
        this.angle = 0;
        this.toothHeight = radius * 0.15;
        this.toothWidth = (Math.PI * 2 * radius) / (numTeeth * 2);
        this.angularVelocity = 0;
    }
    
    // Rotate the gear
    rotate(deltaAngle) {
        this.angle += deltaAngle;
    }
    
    // Display the gear
    display(p) {
        p.push();
        p.translate(this.x, this.y);
        p.rotate(this.angle);
        
        // Draw gear body
        p.fill(this.color);
        p.stroke(0);
        p.strokeWeight(1);
        
        if (this.isInternal) {
            // Draw internal gear (ring gear)
            this.drawInternalGear(p);
        } else {
            // Draw external gear (normal gear)
            this.drawExternalGear(p);
        }
        
        // Draw center hole or mark
        p.fill(50);
        p.ellipse(0, 0, this.radius * 0.2, this.radius * 0.2);
        
        p.pop();
    }
    
    drawExternalGear(p) {
        // Draw base circle
        p.ellipse(0, 0, this.radius * 2, this.radius * 2);
        
        // Draw teeth
        p.strokeWeight(1);
        for (let i = 0; i < this.numTeeth; i++) {
            let angle = (i * Math.PI * 2) / this.numTeeth;
            let x1 = this.radius * Math.cos(angle);
            let y1 = this.radius * Math.sin(angle);
            let x2 = (this.radius + this.toothHeight) * Math.cos(angle);
            let y2 = (this.radius + this.toothHeight) * Math.sin(angle);
            
            // Draw tooth
            p.line(x1, y1, x2, y2);
            
            // Draw tooth width
            let angleDelta = this.toothWidth / this.radius;
            let x3 = (this.radius + this.toothHeight) * Math.cos(angle + angleDelta);
            let y3 = (this.radius + this.toothHeight) * Math.sin(angle + angleDelta);
            let x4 = (this.radius + this.toothHeight) * Math.cos(angle - angleDelta);
            let y4 = (this.radius + this.toothHeight) * Math.sin(angle - angleDelta);
            
            p.line(x2, y2, x3, y3);
            p.line(x2, y2, x4, y4);
        }
    }
    
    drawInternalGear(p) {
        // For internal gear, draw the inner circle and teeth pointing inward
        p.ellipse(0, 0, this.radius * 2, this.radius * 2);
        
        // Add a larger outer circle
        p.ellipse(0, 0, (this.radius + this.toothHeight * 2) * 2, (this.radius + this.toothHeight * 2) * 2);
        
        // Draw teeth pointing inward
        for (let i = 0; i < this.numTeeth; i++) {
            let angle = (i * Math.PI * 2) / this.numTeeth;
            let x1 = this.radius * Math.cos(angle);
            let y1 = this.radius * Math.sin(angle);
            let x2 = (this.radius - this.toothHeight) * Math.cos(angle);
            let y2 = (this.radius - this.toothHeight) * Math.sin(angle);
            
            // Draw tooth
            p.line(x1, y1, x2, y2);
            
            // Draw tooth width
            let angleDelta = this.toothWidth / this.radius;
            let x3 = (this.radius - this.toothHeight) * Math.cos(angle + angleDelta);
            let y3 = (this.radius - this.toothHeight) * Math.sin(angle + angleDelta);
            let x4 = (this.radius - this.toothHeight) * Math.cos(angle - angleDelta);
            let y4 = (this.radius - this.toothHeight) * Math.sin(angle - angleDelta);
            
            p.line(x2, y2, x3, y3);
            p.line(x2, y2, x4, y4);
        }
    }
}

// HelicalGear class - extends Gear to create a helical gear visualization
class HelicalGear extends Gear {
    constructor(x, y, radius, numTeeth, color = [200, 200, 200], helixAngle = 15) {
        super(x, y, radius, numTeeth, color);
        this.helixAngle = helixAngle; // Helix angle in degrees
    }
    
    drawExternalGear(p) {
        // Draw base circle
        p.ellipse(0, 0, this.radius * 2, this.radius * 2);
        
        // Draw helical teeth
        p.strokeWeight(1);
        for (let i = 0; i < this.numTeeth; i++) {
            let angle = (i * Math.PI * 2) / this.numTeeth;
            
            // Create a helical effect by varying the tooth height
            for (let j = -10; j <= 10; j++) {
                let offset = (j / 10) * this.toothHeight * Math.tan(this.helixAngle * Math.PI / 180);
                let angleOffset = offset / this.radius;
                let currentAngle = angle + angleOffset;
                
                let x1 = this.radius * Math.cos(currentAngle);
                let y1 = this.radius * Math.sin(currentAngle);
                let x2 = (this.radius + this.toothHeight - Math.abs(j/10) * this.toothHeight * 0.5) * Math.cos(currentAngle);
                let y2 = (this.radius + this.toothHeight - Math.abs(j/10) * this.toothHeight * 0.5) * Math.sin(currentAngle);
                
                // Draw tooth segment
                p.line(x1, y1, x2, y2);
            }
        }
    }
}

// BevelGear class - extends Gear to create a bevel gear visualization
class BevelGear extends Gear {
    constructor(x, y, radius, numTeeth, color = [200, 200, 200], angle = 45) {
        super(x, y, radius, numTeeth, color);
        this.bevelAngle = angle; // Bevel angle in degrees
    }
    
    drawExternalGear(p) {
        // Draw base circle
        p.ellipse(0, 0, this.radius * 2, this.radius * 2);
        
        // Draw conical shape
        p.fill(this.color[0], this.color[1], this.color[2], 150);
        p.beginShape();
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
            let x = this.radius * Math.cos(angle);
            let y = this.radius * Math.sin(angle);
            p.vertex(x, y);
        }
        p.endShape(p.CLOSE);
        
        // Draw teeth
        p.strokeWeight(1);
        for (let i = 0; i < this.numTeeth; i++) {
            let angle = (i * Math.PI * 2) / this.numTeeth;
            
            // Create a conical effect
            for (let r = this.radius; r > this.radius * 0.7; r -= this.radius * 0.05) {
                let factor = (r - this.radius * 0.7) / (this.radius * 0.3);
                let toothHeight = this.toothHeight * factor;
                
                let x1 = r * Math.cos(angle);
                let y1 = r * Math.sin(angle);
                let x2 = (r + toothHeight) * Math.cos(angle);
                let y2 = (r + toothHeight) * Math.sin(angle);
                
                // Draw tooth
                p.line(x1, y1, x2, y2);
            }
        }
    }
}

// Function to create the gear type sketch
function createGearTypeSketch(p) {
    let spur, helical, bevel;
    
    p.setup = function() {
        p.createCanvas(350, 350);
        p.angleMode(p.RADIANS);
        
        // Create different gear types
        spur = new Gear(0, 0, 80, 20, [180, 180, 220]);
        helical = new HelicalGear(0, 0, 80, 20, [180, 220, 180]);
        bevel = new BevelGear(0, 0, 80, 20, [220, 180, 180]);
        
        console.log("Gear type sketch setup complete");
    };
    
    p.draw = function() {
        p.background(BACKGROUND_COLOR);
        p.translate(p.width/2, p.height/2);
        
        // Rotate and display the selected gear based on global state
        let speed = globalRotationSpeed;
        let currentGear;
        
        switch (globalGearType) {
            case 'helical':
                currentGear = helical;
                break;
            case 'bevel':
                currentGear = bevel;
                break;
            case 'spur':
            default:
                currentGear = spur;
                break;
        }
        
        currentGear.rotate(speed);
        currentGear.display(p);
        
        // Display info about the current gear
        p.fill(0);
        p.noStroke();
        p.textSize(14);
        p.textAlign(p.CENTER);
        p.text(globalGearType.toUpperCase() + " GEAR", 0, -120);
        p.text("Teeth: " + currentGear.numTeeth, 0, 120);
        p.text("Speed: " + Math.round(speed * 1000) + " units", 0, 140);
    };
}

// Function to create the tooth profile sketch
function createToothProfileSketch(p) {
    p.setup = function() {
        p.createCanvas(350, 350);
        p.angleMode(p.DEGREES);
        console.log("Tooth profile sketch setup complete");
    };
    
    p.draw = function() {
        p.background(BACKGROUND_COLOR);
        p.translate(p.width/2, p.height/2);
        
        // Calculate gear parameters based on inputs
        let moduleMM = 5; // mm per tooth
        let pitchDiameter = moduleMM * globalNumTeeth;
        let baseDiameter = pitchDiameter * Math.cos(globalPressureAngle * Math.PI / 180);
        let addendum = moduleMM;
        let dedendum = 1.25 * moduleMM;
        let outerDiameter = pitchDiameter + 2 * addendum;
        let rootDiameter = pitchDiameter - 2 * dedendum;
        
        // Scale for display
        let scale = 300 / outerDiameter;
        
        // Draw reference circles
        p.noFill();
        p.stroke(200, 0, 0, 100);
        p.ellipse(0, 0, pitchDiameter * scale, pitchDiameter * scale);
        
        p.stroke(0, 150, 0, 100);
        p.ellipse(0, 0, baseDiameter * scale, baseDiameter * scale);
        
        p.stroke(0, 0, 150, 100);
        p.ellipse(0, 0, outerDiameter * scale, outerDiameter * scale);
        
        p.stroke(150, 0, 150, 100);
        p.ellipse(0, 0, rootDiameter * scale, rootDiameter * scale);
        
        // Display info
        p.fill(0);
        p.noStroke();
        p.textSize(12);
        p.textAlign(p.LEFT);
        p.text("Number of Teeth: " + globalNumTeeth, -150, -130);
        p.text("Pressure Angle: " + globalPressureAngle + "°", -150, -110);
        p.text("Show Involute: " + (globalShowInvolute ? "Yes" : "No"), -150, -90);
        
        // Draw center
        p.fill(0);
        p.ellipse(0, 0, 10, 10);
    };
}

// Function to create the simple gear train sketch
function createSimpleGearSketch(p) {
    let driverGear, drivenGear, idlerGear;
    
    p.setup = function() {
        p.createCanvas(350, 350);
        p.angleMode(p.RADIANS);
        
        // Initial gear creation - will be updated in updateGears()
        updateGears();
        
        console.log("Simple gear train sketch setup complete");
    };
    
    p.draw = function() {
        p.background(BACKGROUND_COLOR);
        p.translate(p.width/2, p.height/2);
        
        // Calculate rotation speed in radians per frame
        // simpleDriverSpeed is in RPM, convert to radians per frame (assuming 60 FPS)
        let driverDelta = (simpleDriverSpeed * Math.PI) / (30 * 60); // 2π/60 * RPM / 60fps
        
        // Rotate driver gear
        driverGear.rotate(driverDelta);
        
        // Calculate and apply rotations based on gear configuration
        if (simpleIncludeIdler) {
            // With idler: driver -> idler -> driven
            let idlerDelta = -driverDelta * (driverGear.numTeeth / idlerGear.numTeeth);
            idlerGear.rotate(idlerDelta);
            
            let drivenDelta = -idlerDelta * (idlerGear.numTeeth / drivenGear.numTeeth);
            drivenGear.rotate(drivenDelta);
        } else {
            // Direct: driver -> driven
            let drivenDelta = -driverDelta * (driverGear.numTeeth / drivenGear.numTeeth);
            drivenGear.rotate(drivenDelta);
        }
        
        // Draw connecting lines between gears
        p.stroke(0);
        p.strokeWeight(1);
        if (simpleIncludeIdler) {
            p.line(driverGear.x, driverGear.y, idlerGear.x, idlerGear.y);
            p.line(idlerGear.x, idlerGear.y, drivenGear.x, drivenGear.y);
        } else {
            p.line(driverGear.x, driverGear.y, drivenGear.x, drivenGear.y);
        }
        
        // Display gears
        driverGear.display(p);
        drivenGear.display(p);
        
        if (simpleIncludeIdler) {
            idlerGear.display(p);
        }
        
        // Display gear info
        displayGearInfo(p);
    };
    
    function updateGears() {
        console.log("Updating simple gear train - Driver teeth:", simpleDriverTeeth, "Driven teeth:", simpleDrivenTeeth, "Include idler:", simpleIncludeIdler);
        
        // Calculate gear sizes based on teeth (assuming same module)
        const moduleSize = 2;
        const driverRadius = simpleDriverTeeth * moduleSize / 2;
        const drivenRadius = simpleDrivenTeeth * moduleSize / 2;
        const idlerRadius = simpleIdlerTeeth * moduleSize / 2;
        
        // Position gears
        let driverX, driverY, drivenX, drivenY, idlerX, idlerY;
        
        if (simpleIncludeIdler) {
            // With idler: arrange to form a triangle
            driverX = -80;
            driverY = 0;
            drivenX = 80;
            drivenY = 0;
            idlerX = 0;
            idlerY = -80; // Above the other gears
        } else {
            // Direct meshing: position side by side
            const centerDistance = driverRadius + drivenRadius;
            driverX = -centerDistance / 2;
            driverY = 0;
            drivenX = centerDistance / 2;
            drivenY = 0;
        }
        
        // Create gears
        driverGear = new Gear(driverX, driverY, driverRadius, simpleDriverTeeth, [180, 180, 220]);
        drivenGear = new Gear(drivenX, drivenY, drivenRadius, simpleDrivenTeeth, [220, 180, 180]);
        
        if (simpleIncludeIdler) {
            idlerGear = new Gear(idlerX, idlerY, idlerRadius, simpleIdlerTeeth, [180, 220, 180]);
        }
    }
    
    function displayGearInfo(p) {
        p.fill(0);
        p.noStroke();
        p.textSize(14);
        p.textAlign(p.CENTER);
        
        // Title
        p.text("SIMPLE GEAR TRAIN", 0, -150);
        
        // Driver info
        p.text("Driver", driverGear.x, driverGear.y - driverGear.radius - 10);
        p.text(driverGear.numTeeth + " teeth", driverGear.x, driverGear.y + driverGear.radius + 20);
        p.text(simpleDriverSpeed + " RPM", driverGear.x, driverGear.y + driverGear.radius + 40);
        
        // Driven info
        p.text("Driven", drivenGear.x, drivenGear.y - drivenGear.radius - 10);
        p.text(drivenGear.numTeeth + " teeth", drivenGear.x, drivenGear.y + drivenGear.radius + 20);
        
        // Calculate actual output speed
        let ratio = simpleDrivenTeeth / simpleDriverTeeth;
        let outputSpeed = simpleDriverSpeed / ratio;
        p.text(outputSpeed.toFixed(2) + " RPM", drivenGear.x, drivenGear.y + drivenGear.radius + 40);
        
        // Idler info if included
        if (simpleIncludeIdler) {
            p.text("Idler", idlerGear.x, idlerGear.y - idlerGear.radius - 10);
            p.text(idlerGear.numTeeth + " teeth", idlerGear.x, idlerGear.y - idlerGear.radius - 30);
        }
        
        // Overall info
        p.textAlign(p.CENTER);
        p.text("Gear Ratio: 1:" + ratio.toFixed(2), 0, 150);
        
        // Direction
        let direction = simpleIncludeIdler ? "Clockwise" : "Counterclockwise";
        p.text("Output Direction: " + direction, 0, 170);
    }
    
    // Expose the updateGears function
    this.updateGears = updateGears;
}

// Function to create the compound gear train sketch
function createCompoundGearSketch(p) {
    p.setup = function() {
        p.createCanvas(350, 350);
        console.log("Compound gear train sketch setup complete");
    };
    
    p.draw = function() {
        p.background(BACKGROUND_COLOR);
        p.translate(p.width/2, p.height/2);
        p.textSize(16);
        p.textAlign(p.CENTER);
        p.fill(0);
        p.text("COMPOUND GEAR TRAIN", 0, 0);
        p.textSize(12);
        p.text("(Advanced functionality to be implemented)", 0, 20);
    };
}

// Function to create the epicyclic gear train sketch
function createEpicyclicGearSketch(p) {
    p.setup = function() {
        p.createCanvas(350, 350);
        console.log("Epicyclic gear train sketch setup complete");
    };
    
    p.draw = function() {
        p.background(BACKGROUND_COLOR);
        p.translate(p.width/2, p.height/2);
        p.textSize(16);
        p.textAlign(p.CENTER);
        p.fill(0);
        p.text("EPICYCLIC GEAR TRAIN", 0, 0);
        p.textSize(12);
        p.text("(Advanced functionality to be implemented)", 0, 20);
    };
}

// Function to create the application sketch
function createApplicationSketch(p) {
    p.setup = function() {
        p.createCanvas(350, 350);
        console.log("Application sketch setup complete");
    };
    
    p.draw = function() {
        p.background(BACKGROUND_COLOR);
        p.translate(p.width/2, p.height/2);
        p.textSize(16);
        p.textAlign(p.CENTER);
        p.fill(0);
        p.text("APPLICATIONS", 0, 0);
        p.textSize(12);
        p.text("(Advanced functionality to be implemented)", 0, 20);
    };
}

// UI event handlers
function setupUIEventListeners() {
    console.log("Setting up UI event listeners");
    
    // Gear Type controls
    const gearTypeSelector = document.getElementById('gear-type-selector');
    const rotationSpeedSlider = document.getElementById('rotation-speed');
    
    if (gearTypeSelector) {
        gearTypeSelector.addEventListener('change', function() {
            globalGearType = this.value;
            console.log("Gear type changed to:", globalGearType);
        });
    } else {
        console.warn("Gear type selector not found");
    }
    
    if (rotationSpeedSlider) {
        rotationSpeedSlider.addEventListener('input', function() {
            globalRotationSpeed = parseInt(this.value) / 1000;
            console.log("Rotation speed changed to:", globalRotationSpeed);
        });
    } else {
        console.warn("Rotation speed slider not found");
    }
    
    // Tooth Profile controls
    const numTeethSlider = document.getElementById('number-of-teeth');
    const pressureAngleSelect = document.getElementById('pressure-angle');
    const showInvoluteCheck = document.getElementById('show-involute');
    
    if (numTeethSlider) {
        numTeethSlider.addEventListener('input', function() {
            globalNumTeeth = parseInt(this.value);
            console.log("Number of teeth changed to:", globalNumTeeth);
            
            const teethValue = document.getElementById('teeth-value');
            if (teethValue) {
                teethValue.textContent = globalNumTeeth;
            }
        });
    } else {
        console.warn("Number of teeth slider not found");
    }
    
    if (pressureAngleSelect) {
        pressureAngleSelect.addEventListener('change', function() {
            globalPressureAngle = parseFloat(this.value);
            console.log("Pressure angle changed to:", globalPressureAngle);
        });
    } else {
        console.warn("Pressure angle select not found");
    }
    
    if (showInvoluteCheck) {
        showInvoluteCheck.addEventListener('change', function() {
            globalShowInvolute = this.checked;
            console.log("Show involute changed to:", globalShowInvolute);
        });
    } else {
        console.warn("Show involute checkbox not found");
    }
    
    // Simple Gear Train controls
    const driverTeethSlider = document.getElementById('driver-teeth');
    const drivenTeethSlider = document.getElementById('driven-teeth');
    const includeIdlerCheckbox = document.getElementById('include-idler');
    const idlerTeethSlider = document.getElementById('idler-teeth');
    const driverSpeedSlider = document.getElementById('driver-speed');
    
    if (driverTeethSlider) {
        driverTeethSlider.addEventListener('input', function() {
            simpleDriverTeeth = parseInt(this.value);
            console.log("Driver teeth changed to:", simpleDriverTeeth);
            
            // Update value display
            const valueDisplay = document.getElementById('driver-teeth-value');
            if (valueDisplay) {
                valueDisplay.textContent = simpleDriverTeeth;
            }
            
            // Update the simulation
            if (simpleSketch && simpleSketch.updateGears) {
                simpleSketch.updateGears();
            }
            
            // Update calculations
            updateSimpleGearCalculations();
        });
    } else {
        console.warn("Driver teeth slider not found");
    }
    
    if (drivenTeethSlider) {
        drivenTeethSlider.addEventListener('input', function() {
            simpleDrivenTeeth = parseInt(this.value);
            console.log("Driven teeth changed to:", simpleDrivenTeeth);
            
            // Update value display
            const valueDisplay = document.getElementById('driven-teeth-value');
            if (valueDisplay) {
                valueDisplay.textContent = simpleDrivenTeeth;
            }
            
            // Update the simulation
            if (simpleSketch && simpleSketch.updateGears) {
                simpleSketch.updateGears();
            }
            
            // Update calculations
            updateSimpleGearCalculations();
        });
    } else {
        console.warn("Driven teeth slider not found");
    }
    
    if (includeIdlerCheckbox) {
        includeIdlerCheckbox.addEventListener('change', function() {
            simpleIncludeIdler = this.checked;
            console.log("Include idler changed to:", simpleIncludeIdler);
            
            // Enable/disable idler teeth slider
            if (idlerTeethSlider) {
                idlerTeethSlider.disabled = !simpleIncludeIdler;
            }
            
            // Update the simulation
            if (simpleSketch && simpleSketch.updateGears) {
                simpleSketch.updateGears();
            }
            
            // Update calculations
            updateSimpleGearCalculations();
        });
    } else {
        console.warn("Include idler checkbox not found");
    }
    
    if (idlerTeethSlider) {
        idlerTeethSlider.addEventListener('input', function() {
            simpleIdlerTeeth = parseInt(this.value);
            console.log("Idler teeth changed to:", simpleIdlerTeeth);
            
            // Update value display
            const valueDisplay = document.getElementById('idler-teeth-value');
            if (valueDisplay) {
                valueDisplay.textContent = simpleIdlerTeeth;
            }
            
            // Only update if idler is included
            if (simpleIncludeIdler && simpleSketch && simpleSketch.updateGears) {
                simpleSketch.updateGears();
            }
        });
        
        // Initialize disabled state
        idlerTeethSlider.disabled = !simpleIncludeIdler;
    } else {
        console.warn("Idler teeth slider not found");
    }
    
    if (driverSpeedSlider) {
        driverSpeedSlider.addEventListener('input', function() {
            simpleDriverSpeed = parseInt(this.value);
            console.log("Driver speed changed to:", simpleDriverSpeed);
            
            // Update value display
            const valueDisplay = document.getElementById('driver-speed-value');
            if (valueDisplay) {
                valueDisplay.textContent = simpleDriverSpeed;
            }
            
            // Update calculations
            updateSimpleGearCalculations();
        });
    } else {
        console.warn("Driver speed slider not found");
    }
    
    // Update all slider value displays
    document.querySelectorAll('input[type="range"]').forEach(slider => {
        const valueSpan = document.getElementById(`${slider.id}-value`);
        if (valueSpan) {
            valueSpan.textContent = slider.value;
            console.log(`Updated value display for ${slider.id}: ${slider.value}`);
        }
    });

    // Set up navigation
    const navLinks = document.querySelectorAll('.simulation-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1); // Remove the # from href
            
            // Hide all sections and deactivate all links
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            // Show target section and activate clicked link
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                this.classList.add('active');
                console.log("Activated section:", targetId);
            } else {
                console.warn("Target section not found:", targetId);
            }
        });
    });
    
    // Setup practice problem solutions toggle
    document.querySelectorAll('.solution-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const solutionId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            const solution = document.getElementById(solutionId);
            
            if (solution) {
                if (solution.style.display === "block") {
                    solution.style.display = "none";
                    this.textContent = "Show Solution";
                } else {
                    solution.style.display = "block";
                    this.textContent = "Hide Solution";
                }
            }
        });
    });
    
    console.log("UI event listeners setup complete");
}

// Function to update simple gear calculations in the UI
function updateSimpleGearCalculations() {
    console.log("Updating simple gear calculations");
    
    // Calculate gear ratio
    const ratio = simpleDrivenTeeth / simpleDriverTeeth;
    const outputSpeed = simpleDriverSpeed / ratio;
    const direction = simpleIncludeIdler ? "Clockwise" : "Counterclockwise";
    
    // Update UI elements
    const simpleRatioElem = document.getElementById('simple-ratio');
    const outputSpeedElem = document.getElementById('output-speed');
    const outputDirectionElem = document.getElementById('output-direction');
    
    if (simpleRatioElem) {
        simpleRatioElem.textContent = ratio.toFixed(2);
    }
    
    if (outputSpeedElem) {
        outputSpeedElem.textContent = outputSpeed.toFixed(2) + " RPM";
    }
    
    if (outputDirectionElem) {
        outputDirectionElem.textContent = direction;
    }
    
    console.log("Simple gear calculations updated - Ratio:", ratio.toFixed(2), 
               "Output speed:", outputSpeed.toFixed(2), 
               "Direction:", direction);
}