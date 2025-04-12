// Calculate failure criteria
function calculateFailureCriteria() {
    const yieldStrength = materialProperties[materialModel].yieldStrength;
    
    // Rankine criterion (Maximum Principal Stress)
    failureCriteria.rankine.value = Math.max(
        Math.abs(principalStresses.s1),
        Math.abs(principalStresses.s2),
        Math.abs(principalStresses.s3)
    );
    failureCriteria.rankine.status = failureCriteria.rankine.value >= yieldStrength ? 'Fail' : 'Safe';
    
    // Tresca criterion (Maximum Shear Stress)
    failureCriteria.tresca.value = Math.max(
        Math.abs(principalStresses.s1 - principalStresses.s2),
        Math.abs(principalStresses.s2 - principalStresses.s3),
        Math.abs(principalStresses.s3 - principalStresses.s1)
    ) / 2;
    failureCriteria.tresca.status = failureCriteria.tresca.value >= yieldStrength / 2 ? 'Fail' : 'Safe';
    
    // von Mises criterion
    failureCriteria.vonMises.value = Math.sqrt(
        0.5 * (
            Math.pow(principalStresses.s1 - principalStresses.s2, 2) +
            Math.pow(principalStresses.s2 - principalStresses.s3, 2) +
            Math.pow(principalStresses.s3 - principalStresses.s1, 2)
        )
    );
    failureCriteria.vonMises.status = failureCriteria.vonMises.value >= yieldStrength / Math.sqrt(2) ? 'Fail' : 'Safe';
}

// Update display with calculated values
function updateDisplay() {
    // Update stress matrix display
    const stressMatrixElement = document.getElementById('stress-matrix');
    stressMatrixElement.innerHTML = `
        <pre>σ = [
    ${stressComponents.xx.toFixed(1)}  ${stressComponents.xy.toFixed(1)}  ${stressComponents.xz.toFixed(1)}
    ${stressComponents.xy.toFixed(1)}  ${stressComponents.yy.toFixed(1)}  ${stressComponents.yz.toFixed(1)}
    ${stressComponents.xz.toFixed(1)}  ${stressComponents.yz.toFixed(1)}  ${stressComponents.zz.toFixed(1)}
] MPa</pre>
    `;
    
    // Update principal stresses display
    const principalStressesElement = document.getElementById('principal-stresses');
    principalStressesElement.innerHTML = `
        <p>σ₁ = ${principalStresses.s1.toFixed(1)} MPa</p>
        <p>σ₂ = ${principalStresses.s2.toFixed(1)} MPa</p>
        <p>σ₃ = ${principalStresses.s3.toFixed(1)} MPa</p>
    `;
    
    // Update failure criteria display
    const failureCriteriaElement = document.getElementById('failure-criteria');
    failureCriteriaElement.innerHTML = `
        <p><strong>Rankine:</strong> ${failureCriteria.rankine.value.toFixed(1)} MPa - <span class="${failureCriteria.rankine.status === 'Safe' ? 'safe' : 'fail'}">${failureCriteria.rankine.status}</span></p>
        <p><strong>Tresca:</strong> ${failureCriteria.tresca.value.toFixed(1)} MPa - <span class="${failureCriteria.tresca.status === 'Safe' ? 'safe' : 'fail'}">${failureCriteria.tresca.status}</span></p>
        <p><strong>Von Mises:</strong> ${failureCriteria.vonMises.value.toFixed(1)} MPa - <span class="${failureCriteria.vonMises.status === 'Safe' ? 'safe' : 'fail'}">${failureCriteria.vonMises.status}</span></p>
    `;
    
    // Create or update Mohr's Circle plot
    createMohrCirclePlot();
    
    // Create or update failure envelope plot
    createFailureEnvelopePlot();
}

// Create Mohr's Circle plot
function createMohrCirclePlot() {
    const mohrCircleElement = document.getElementById('mohr-circle-3d');
    
    // Calculate Mohr's circles
    const centers = [
        (principalStresses.s1 + principalStresses.s2) / 2,
        (principalStresses.s2 + principalStresses.s3) / 2,
        (principalStresses.s3 + principalStresses.s1) / 2
    ];
    
    const radii = [
        Math.abs(principalStresses.s1 - principalStresses.s2) / 2,
        Math.abs(principalStresses.s2 - principalStresses.s3) / 2,
        Math.abs(principalStresses.s3 - principalStresses.s1) / 2
    ];
    
    // Generate points for Mohr's circles
    const circle1Points = generateCirclePoints(centers[0], radii[0], 50);
    const circle2Points = generateCirclePoints(centers[1], radii[1], 50);
    const circle3Points = generateCirclePoints(centers[2], radii[2], 50);
    
    const trace1 = {
        x: circle1Points.x,
        y: circle1Points.y,
        mode: 'lines',
        name: 'σ₁-σ₂',
        line: {
            color: 'rgba(255, 0, 0, 0.7)',
            width: 2
        }
    };
    
    const trace2 = {
        x: circle2Points.x,
        y: circle2Points.y,
        mode: 'lines',
        name: 'σ₂-σ₃',
        line: {
            color: 'rgba(0, 255, 0, 0.7)',
            width: 2
        }
    };
    
    const trace3 = {
        x: circle3Points.x,
        y: circle3Points.y,
        mode: 'lines',
        name: 'σ₃-σ₁',
        line: {
            color: 'rgba(0, 0, 255, 0.7)',
            width: 2
        }
    };
    
    const layout = {
        title: "3D Mohr's Circles",
        xaxis: {
            title: 'Normal Stress (MPa)',
            zeroline: true
        },
        yaxis: {
            title: 'Shear Stress (MPa)',
            zeroline: true
        },
        showlegend: true,
        margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 50,
            pad: 4
        }
    };
    
    Plotly.newPlot(mohrCircleElement, [trace1, trace2, trace3], layout, {displayModeBar: false});
}

// Create failure envelope plot
function createFailureEnvelopePlot() {
    const failureEnvelopeElement = document.getElementById('failure-envelope');
    
    // Get yield strength from current material model
    const yieldStrength = materialProperties[materialModel].yieldStrength;
    
    // Generate points for failure envelopes
    const sigmaValues = [];
    for (let i = -yieldStrength * 1.5; i <= yieldStrength * 1.5; i += yieldStrength / 15) {
        sigmaValues.push(i);
    }
    
    // Rankine envelope (square)
    const rankineX = [];
    const rankineY = [];
    
    // Top line
    for (let sigma = -yieldStrength; sigma <= yieldStrength; sigma += yieldStrength / 15) {
        rankineX.push(sigma);
        rankineY.push(yieldStrength);
    }
    // Right line
    for (let sigma = yieldStrength; sigma >= -yieldStrength; sigma -= yieldStrength / 15) {
        rankineX.push(yieldStrength);
        rankineY.push(sigma);
    }
    // Bottom line
    for (let sigma = yieldStrength; sigma >= -yieldStrength; sigma -= yieldStrength / 15) {
        rankineX.push(sigma);
        rankineY.push(-yieldStrength);
    }
    // Left line
    for (let sigma = -yieldStrength; sigma <= yieldStrength; sigma += yieldStrength / 15) {
        rankineX.push(-yieldStrength);
        rankineY.push(sigma);
    }
    // Close the envelope
    rankineX.push(rankineX[0]);
    rankineY.push(rankineY[0]);
    
    // Tresca envelope (hexagon)
    const trescaX = [];
    const trescaY = [];
    
    // Generate hexagon points
    for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 3) {
        trescaX.push(yieldStrength * Math.cos(angle));
        trescaY.push(yieldStrength * Math.sin(angle));
    }
    // Close the envelope
    trescaX.push(trescaX[0]);
    trescaY.push(trescaY[0]);
    
    // Von Mises envelope (circle)
    const vonMisesX = [];
    const vonMisesY = [];
    
    for (let angle = 0; angle <= 2 * Math.PI; angle += Math.PI / 30) {
        vonMisesX.push(yieldStrength * Math.cos(angle));
        vonMisesY.push(yieldStrength * Math.sin(angle));
    }
    
    // Current stress state
    const currentX = principalStresses.s1;
    const currentY = principalStresses.s2;
    
    const trace1 = {
        x: rankineX,
        y: rankineY,
        mode: 'lines',
        name: 'Rankine',
        line: {
            color: 'blue',
            width: 2,
            dash: 'dot'
        }
    };
    
    const trace2 = {
        x: trescaX,
        y: trescaY,
        mode: 'lines',
        name: 'Tresca',
        line: {
            color: 'green',
            width: 2,
            dash: 'dashdot'
        }
    };
    
    const trace3 = {
        x: vonMisesX,
        y: vonMisesY,
        mode: 'lines',
        name: 'Von Mises',
        line: {
            color: 'red',
            width: 2
        }
    };
    
    const trace4 = {
        x: [currentX],
        y: [currentY],
        mode: 'markers',
        name: 'Current State',
        marker: {
            color: 'black',
            size: 10,
            symbol: 'circle'
        }
    };
    
    const layout = {
        title: 'Failure Envelopes',
        xaxis: {
            title: 'σ₁ (MPa)',
            zeroline: true
        },
        yaxis: {
            title: 'σ₂ (MPa)',
            zeroline: true,
            scaleanchor: 'x',
            scaleratio: 1
        },
        showlegend: true,
        margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 50,
            pad: 4
        }
    };
    
    Plotly.newPlot(failureEnvelopeElement, [trace1, trace2, trace3, trace4], layout, {displayModeBar: false});
}

// Helper function to generate circle points
function generateCirclePoints(center, radius, numPoints) {
    const x = [];
    const y = [];
    
    for (let i = 0; i <= numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI;
        x.push(center + radius * Math.cos(angle));
        y.push(radius * Math.sin(angle));
    }
    
    return { x, y };
}

// Initialize the application when the window loads
window.onload = function() {
    // Set initial values for sliders
    document.getElementById('sigma-xx-value').textContent = stressComponents.xx;
    document.getElementById('sigma-yy-value').textContent = stressComponents.yy;
    document.getElementById('sigma-zz-value').textContent = stressComponents.zz;
    document.getElementById('tau-xy-value').textContent = stressComponents.xy;
    document.getElementById('tau-yz-value').textContent = stressComponents.yz;
    document.getElementById('tau-xz-value').textContent = stressComponents.xz;
    
    // Add CSS for failure criteria indicators
    const style = document.createElement('style');
    style.innerHTML = `
        .safe {
            color: green;
            font-weight: bold;
        }
        
        .fail {
            color: red;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
    
    // Initial calculation and display update
    recalculateAndUpdate();
};// Global variables for the simulation
let cube;
let angle = 0;
let showPrincipal = false;
let showFailure = false;
let materialModel = 'isotropic';

// Stress components with default values
let stressComponents = {
    xx: 50,
    yy: 30,
    zz: 10,
    xy: 15,
    yz: 5,
    xz: 10
};

// Calculated values for display
let principalStresses = {
    s1: 0,
    s2: 0,
    s3: 0,
    v1: null,
    v2: null,
    v3: null
};

let failureCriteria = {
    rankine: { value: 0, status: 'Safe' },
    tresca: { value: 0, status: 'Safe' },
    vonMises: { value: 0, status: 'Safe' }
};

// Material properties for different models
const materialProperties = {
    isotropic: {
        E: 210000, // Young's modulus in MPa
        v: 0.3,    // Poisson's ratio
        G: 80769,  // Shear modulus in MPa
        yieldStrength: 250 // Yield strength in MPa
    },
    orthotropic: {
        Ex: 210000, // Young's modulus in x direction
        Ey: 150000, // Young's modulus in y direction
        Ez: 100000, // Young's modulus in z direction
        vxy: 0.3,   // Poisson's ratio xy
        vyz: 0.25,  // Poisson's ratio yz
        vxz: 0.2,   // Poisson's ratio xz
        Gxy: 50000, // Shear modulus xy
        Gyz: 40000, // Shear modulus yz
        Gxz: 45000, // Shear modulus xz
        yieldStrength: 250 // Yield strength in MPa
    },
    transverse: {
        ET: 210000, // Transverse Young's modulus
        EL: 150000, // Longitudinal Young's modulus
        vT: 0.3,    // Transverse Poisson's ratio
        vLT: 0.25,  // Longitudinal-transverse Poisson's ratio
        GLT: 50000, // Longitudinal-transverse shear modulus
        yieldStrength: 250 // Yield strength in MPa
    }
};

// p5.js setup function
function setup() {
    // Create canvas and attach it to the sketch-holder div
    const canvas = createCanvas(800, 400, WEBGL);
    canvas.parent('sketch-holder');
    
    // Initialize stress cube
    cube = new StressCube();
    
    // Setup control event listeners
    setupControls();
    
    // Initial calculation
    calculatePrincipalStresses();
    calculateFailureCriteria();
    updateDisplay();
}

// p5.js draw function
function draw() {
    background(240);
    
    // Set up lighting
    ambientLight(100);
    directionalLight(255, 255, 255, -1, 1, -1);
    
    // Rotate based on mouse position or auto-rotation
    if (mouseIsPressed && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        rotateY(map(mouseX, 0, width, -PI, PI));
        rotateX(map(mouseY, 0, height, PI, -PI));
    } else {
        // Auto-rotation when mouse isn't pressed
        angle += 0.01;
        rotateY(angle);
        rotateX(sin(angle * 0.5) * 0.5);
    }
    
    // Draw the stress cube
    cube.display();
}

// StressCube class
class StressCube {
    constructor() {
        this.size = 100;
        this.deformationScale = 0.002; // Scale factor for deformation visualization
    }
    
    display() {
        push();
        
        // Apply deformation based on stress components
        const deformation = this.calculateDeformation();
        
        // Draw the deformed cube
        stroke(0);
        strokeWeight(1);
        noFill();
        
        // Original cube outline
        stroke(200);
        box(this.size);
        
        // Deformed cube
        stroke(0);
        beginShape(LINES);
        
        // Draw the 12 edges of the deformed cube
        for (let i = 0; i < 8; i++) {
            for (let j = i + 1; j < 8; j++) {
                if (this.isEdge(i, j)) {
                    const v1 = deformation[i];
                    const v2 = deformation[j];
                    vertex(v1.x, v1.y, v1.z);
                    vertex(v2.x, v2.y, v2.z);
                }
            }
        }
        endShape();
        
        // Draw stress arrows
        this.drawStressArrows();
        
        // If showing principal stresses, draw them
        if (showPrincipal) {
            this.drawPrincipalStresses();
        }
        
        // If showing failure criteria, draw them
        if (showFailure) {
            this.drawFailureCriteria();
        }
        
        pop();
    }
    
    calculateDeformation() {
        // Calculate the vertices of the deformed cube based on stress
        const halfSize = this.size / 2;
        const vertices = [];
        
        // Original cube vertices
        const baseVertices = [
            createVector(-halfSize, -halfSize, -halfSize), // 0: left-bottom-back
            createVector(halfSize, -halfSize, -halfSize),  // 1: right-bottom-back
            createVector(halfSize, halfSize, -halfSize),   // 2: right-top-back
            createVector(-halfSize, halfSize, -halfSize),  // 3: left-top-back
            createVector(-halfSize, -halfSize, halfSize),  // 4: left-bottom-front
            createVector(halfSize, -halfSize, halfSize),   // 5: right-bottom-front
            createVector(halfSize, halfSize, halfSize),    // 6: right-top-front
            createVector(-halfSize, halfSize, halfSize)    // 7: left-top-front
        ];
        
        // Apply deformation based on stress components
        for (let i = 0; i < baseVertices.length; i++) {
            const v = baseVertices[i];
            
            // Apply normal stress deformation
            const xDeform = v.x * (1 + stressComponents.xx * this.deformationScale);
            const yDeform = v.y * (1 + stressComponents.yy * this.deformationScale);
            const zDeform = v.z * (1 + stressComponents.zz * this.deformationScale);
            
            // Apply shear stress deformation (simplified approximation)
            const xyShear = v.y * stressComponents.xy * this.deformationScale;
            const yzShear = v.z * stressComponents.yz * this.deformationScale;
            const xzShear = v.z * stressComponents.xz * this.deformationScale;
            
            vertices.push(createVector(
                xDeform + xyShear + xzShear,
                yDeform + xyShear + yzShear,
                zDeform + xzShear + yzShear
            ));
        }
        
        return vertices;
    }
    
    isEdge(i, j) {
        // Check if two vertices form an edge in a cube
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0], // back face
            [4, 5], [5, 6], [6, 7], [7, 4], // front face
            [0, 4], [1, 5], [2, 6], [3, 7]  // connecting edges
        ];
        
        for (const edge of edges) {
            if ((edge[0] === i && edge[1] === j) || (edge[0] === j && edge[1] === i)) {
                return true;
            }
        }
        
        return false;
    }
    
    drawStressArrows() {
        const halfSize = this.size / 2;
        const arrowSize = 15;
        const arrowScale = 0.5;
        
        // Draw normal stress arrows
        push();
        
        // X-direction arrows (red)
        stroke(255, 0, 0);
        strokeWeight(2);
        
        // Right face
        if (stressComponents.xx > 0) {
            push();
            translate(halfSize, 0, 0);
            rotateZ(HALF_PI);
            this.drawArrow(0, 0, 0, arrowSize * arrowScale * stressComponents.xx / 100, 10, 5);
            pop();
        } else if (stressComponents.xx < 0) {
            push();
            translate(halfSize, 0, 0);
            rotateZ(-HALF_PI);
            this.drawArrow(0, 0, 0, arrowSize * arrowScale * -stressComponents.xx / 100, 10, 5);
            pop();
        }
        
        // Left face
        if (stressComponents.xx > 0) {
            push();
            translate(-halfSize, 0, 0);
            rotateZ(-HALF_PI);
            this.drawArrow(0, 0, 0, arrowSize * arrowScale * stressComponents.xx / 100, 10, 5);
            pop();
        } else if (stressComponents.xx < 0) {
            push();
            translate(-halfSize, 0, 0);
            rotateZ(HALF_PI);
            this.drawArrow(0, 0, 0, arrowSize * arrowScale * -stressComponents.xx / 100, 10, 5);
            pop();
        }
        
        // Y-direction arrows (green)
        stroke(0, 255, 0);
        
        // Top face
        if (stressComponents.yy > 0) {
            push();
            translate(0, halfSize, 0);
            this.drawArrow(0, 0, 0, arrowSize * arrowScale * stressComponents.yy / 100, 10, 5);
            pop();
        } else if (stressComponents.yy < 0) {
            push();
            translate(0, halfSize, 0);
            rotateZ(PI);
            this.drawArrow(0, 0, 0, arrowSize * arrowScale * -stressComponents.yy / 100, 10, 5);
            pop();
        }
        
        // Bottom face
        if (stressComponents.yy > 0) {
            push();
            translate(0, -halfSize, 0);
            rotateZ(PI);
            this.drawArrow(0, 0, 0, arrowSize * arrowScale * stressComponents.yy / 100, 10, 5);
            pop();
        } else if (stressComponents.yy < 0) {
            push();
            translate(0, -halfSize, 0);
            this.drawArrow(0, 0, 0, arrowSize * arrowScale * -stressComponents.yy / 100, 10, 5);
            pop();
        }
        
        // Z-direction arrows (blue)
        stroke(0, 0, 255);
        
        // Front face
        if (stressComponents.zz > 0) {
            push();
            translate(0, 0, halfSize);
            rotateX(-HALF_PI);
            this.drawArrow(0, 0, 0, arrowSize * arrowScale * stressComponents.zz / 100, 10, 5);
            pop();
        } else if (stressComponents.zz < 0) {
            push();
            translate(0, 0, halfSize);
            rotateX(HALF_PI);
            this.drawArrow(0, 0, 0, arrowSize * arrowScale * -stressComponents.zz / 100, 10, 5);
            pop();
        }
        
        // Back face
        if (stressComponents.zz > 0) {
            push();
            translate(0, 0, -halfSize);
            rotateX(HALF_PI);
            this.drawArrow(0, 0, 0, arrowSize * arrowScale * stressComponents.zz / 100, 10, 5);
            pop();
        } else if (stressComponents.zz < 0) {
            push();
            translate(0, 0, -halfSize);
            rotateX(-HALF_PI);
            this.drawArrow(0, 0, 0, arrowSize * arrowScale * -stressComponents.zz / 100, 10, 5);
            pop();
        }
        
        // Draw shear stress arrows (purple)
        stroke(200, 0, 200);
        
        // XY shear
        if (stressComponents.xy !== 0) {
            const xyScale = arrowScale * stressComponents.xy / 30;
            
            // Top face (x-direction)
            push();
            translate(0, halfSize, 0);
            rotateZ(HALF_PI);
            this.drawArrow(-halfSize/2, 0, 0, arrowSize * xyScale, 8, 4);
            this.drawArrow(halfSize/2, 0, 0, -arrowSize * xyScale, 8, 4);
            pop();
            
            // Right face (y-direction)
            push();
            translate(halfSize, 0, 0);
            this.drawArrow(0, -halfSize/2, 0, arrowSize * xyScale, 8, 4);
            this.drawArrow(0, halfSize/2, 0, -arrowSize * xyScale, 8, 4);
            pop();
        }
        
        // YZ shear
        if (stressComponents.yz !== 0) {
            const yzScale = arrowScale * stressComponents.yz / 30;
            
            // Front face (y-direction)
            push();
            translate(0, 0, halfSize);
            this.drawArrow(0, -halfSize/2, 0, arrowSize * yzScale, 8, 4);
            this.drawArrow(0, halfSize/2, 0, -arrowSize * yzScale, 8, 4);
            pop();
            
            // Top face (z-direction)
            push();
            translate(0, halfSize, 0);
            rotateX(-HALF_PI);
            this.drawArrow(0, -halfSize/2, 0, arrowSize * yzScale, 8, 4);
            this.drawArrow(0, halfSize/2, 0, -arrowSize * yzScale, 8, 4);
            pop();
        }
        
        // XZ shear
        if (stressComponents.xz !== 0) {
            const xzScale = arrowScale * stressComponents.xz / 30;
            
            // Front face (x-direction)
            push();
            translate(0, 0, halfSize);
            rotateZ(HALF_PI);
            this.drawArrow(-halfSize/2, 0, 0, arrowSize * xzScale, 8, 4);
            this.drawArrow(halfSize/2, 0, 0, -arrowSize * xzScale, 8, 4);
            pop();
            
            // Right face (z-direction)
            push();
            translate(halfSize, 0, 0);
            rotateX(-HALF_PI);
            this.drawArrow(0, -halfSize/2, 0, arrowSize * xzScale, 8, 4);
            this.drawArrow(0, halfSize/2, 0, -arrowSize * xzScale, 8, 4);
            pop();
        }
        
        pop();
    }
    
    drawPrincipalStresses() {
        const halfSize = this.size / 2;
        const arrowSize = 25;
        
        push();
        strokeWeight(3);
        
        // Scale factors for arrows based on principal stress magnitude
        const maxPrincipal = max(abs(principalStresses.s1), abs(principalStresses.s2), abs(principalStresses.s3));
        const arrowScale = 0.8;
        
        // Draw principal stress arrows in their respective directions
        // Principal stress 1 (red)
        if (principalStresses.v1) {
            stroke(255, 0, 0);
            const s1Scale = arrowScale * principalStresses.s1 / maxPrincipal;
            const v1 = createVector(principalStresses.v1[0], principalStresses.v1[1], principalStresses.v1[2]);
            v1.normalize().mult(halfSize);
            
            push();
            if (principalStresses.s1 >= 0) {
                // Draw from origin to principal direction
                line(0, 0, 0, v1.x, v1.y, v1.z);
                translate(v1.x, v1.y, v1.z);
                // Rotate to align with principal direction
                const rotAxis = createVector(0, 0, 1).cross(v1);
                const rotAngle = createVector(0, 0, 1).angleBetween(v1);
                if (rotAxis.mag() > 0.01) { // Avoid rotation if parallel to z-axis
                    rotate(rotAngle, rotAxis);
                }
                this.drawArrowHead(0, 0, 0, arrowSize * s1Scale, 12, 6);
            } else {
                // Draw from origin to negative principal direction
                line(0, 0, 0, -v1.x, -v1.y, -v1.z);
                translate(-v1.x, -v1.y, -v1.z);
                // Rotate to align with negative principal direction
                const rotAxis = createVector(0, 0, 1).cross(createVector(-v1.x, -v1.y, -v1.z));
                const rotAngle = createVector(0, 0, 1).angleBetween(createVector(-v1.x, -v1.y, -v1.z));
                if (rotAxis.mag() > 0.01) { // Avoid rotation if parallel to z-axis
                    rotate(rotAngle, rotAxis);
                }
                this.drawArrowHead(0, 0, 0, arrowSize * -s1Scale, 12, 6);
            }
            pop();
            
            // Draw text for principal stress values
            push();
            translate(v1.x * 1.2, v1.y * 1.2, v1.z * 1.2);
            fill(255, 0, 0);
            textSize(12);
            text('σ₁=' + principalStresses.s1.toFixed(1), 0, 0);
            pop();
        }
        
        // Principal stress 2 (green)
        if (principalStresses.v2) {
            stroke(0, 255, 0);
            const s2Scale = arrowScale * principalStresses.s2 / maxPrincipal;
            const v2 = createVector(principalStresses.v2[0], principalStresses.v2[1], principalStresses.v2[2]);
            v2.normalize().mult(halfSize);
            
            push();
            if (principalStresses.s2 >= 0) {
                line(0, 0, 0, v2.x, v2.y, v2.z);
                translate(v2.x, v2.y, v2.z);
                const rotAxis = createVector(0, 0, 1).cross(v2);
                const rotAngle = createVector(0, 0, 1).angleBetween(v2);
                if (rotAxis.mag() > 0.01) {
                    rotate(rotAngle, rotAxis);
                }
                this.drawArrowHead(0, 0, 0, arrowSize * s2Scale, 12, 6);
            } else {
                line(0, 0, 0, -v2.x, -v2.y, -v2.z);
                translate(-v2.x, -v2.y, -v2.z);
                const rotAxis = createVector(0, 0, 1).cross(createVector(-v2.x, -v2.y, -v2.z));
                const rotAngle = createVector(0, 0, 1).angleBetween(createVector(-v2.x, -v2.y, -v2.z));
                if (rotAxis.mag() > 0.01) {
                    rotate(rotAngle, rotAxis);
                }
                this.drawArrowHead(0, 0, 0, arrowSize * -s2Scale, 12, 6);
            }
            pop();
            
            // Draw text for principal stress value
            push();
            translate(v2.x * 1.2, v2.y * 1.2, v2.z * 1.2);
            fill(0, 255, 0);
            textSize(12);
            text('σ₂=' + principalStresses.s2.toFixed(1), 0, 0);
            pop();
        }
        
        // Principal stress 3 (blue)
        if (principalStresses.v3) {
            stroke(0, 0, 255);
            const s3Scale = arrowScale * principalStresses.s3 / maxPrincipal;
            const v3 = createVector(principalStresses.v3[0], principalStresses.v3[1], principalStresses.v3[2]);
            v3.normalize().mult(halfSize);
            
            push();
            if (principalStresses.s3 >= 0) {
                line(0, 0, 0, v3.x, v3.y, v3.z);
                translate(v3.x, v3.y, v3.z);
                const rotAxis = createVector(0, 0, 1).cross(v3);
                const rotAngle = createVector(0, 0, 1).angleBetween(v3);
                if (rotAxis.mag() > 0.01) {
                    rotate(rotAngle, rotAxis);
                }
                this.drawArrowHead(0, 0, 0, arrowSize * s3Scale, 12, 6);
            } else {
                line(0, 0, 0, -v3.x, -v3.y, -v3.z);
                translate(-v3.x, -v3.y, -v3.z);
                const rotAxis = createVector(0, 0, 1).cross(createVector(-v3.x, -v3.y, -v3.z));
                const rotAngle = createVector(0, 0, 1).angleBetween(createVector(-v3.x, -v3.y, -v3.z));
                if (rotAxis.mag() > 0.01) {
                    rotate(rotAngle, rotAxis);
                }
                this.drawArrowHead(0, 0, 0, arrowSize * -s3Scale, 12, 6);
            }
            pop();
            
            // Draw text for principal stress value
            push();
            translate(v3.x * 1.2, v3.y * 1.2, v3.z * 1.2);
            fill(0, 0, 255);
            textSize(12);
            text('σ₃=' + principalStresses.s3.toFixed(1), 0, 0);
            pop();
        }
        
        pop();
    }
    
    drawFailureCriteria() {
        // Display a simple visual indicator for failure criteria status
        
        push();
        translate(0, 0, this.size * 0.6);
        
        textSize(14);
        fill(0);
        textAlign(CENTER);
        text("Failure Criteria Status", 0, -40);
        
        // Rankine
        if (failureCriteria.rankine.status === 'Fail') {
            fill(255, 0, 0);
        } else {
            fill(0, 255, 0);
        }
        ellipse(-50, -15, 15, 15);
        fill(0);
        text("Rankine", -50, 5);
        
        // Tresca
        if (failureCriteria.tresca.status === 'Fail') {
            fill(255, 0, 0);
        } else {
            fill(0, 255, 0);
        }
        ellipse(0, -15, 15, 15);
        fill(0);
        text("Tresca", 0, 5);
        
        // Von Mises
        if (failureCriteria.vonMises.status === 'Fail') {
            fill(255, 0, 0);
        } else {
            fill(0, 255, 0);
        }
        ellipse(50, -15, 15, 15);
        fill(0);
        text("Von Mises", 50, 5);
        
        pop();
    }
    
    drawArrow(x, y, z, len, headSize, headWidth) {
        // Draw arrow shaft
        line(x, y, z, x + len, y, z);
        
        // Draw arrowhead
        this.drawArrowHead(x + len, y, z, headSize, headWidth);
    }
    
    drawArrowHead(x, y, z, size, width) {
        // Draw arrowhead triangles
        beginShape();
        vertex(x, y, z);
        vertex(x - size, y - width/2, z);
        vertex(x - size, y + width/2, z);
        endShape(CLOSE);
    }
}

// Setup event listeners for controls
function setupControls() {
    // Stress sliders
    document.getElementById('sigma-xx').addEventListener('input', function() {
        stressComponents.xx = parseInt(this.value);
        document.getElementById('sigma-xx-value').textContent = this.value;
        recalculateAndUpdate();
    });
    
    document.getElementById('sigma-yy').addEventListener('input', function() {
        stressComponents.yy = parseInt(this.value);
        document.getElementById('sigma-yy-value').textContent = this.value;
        recalculateAndUpdate();
    });
    
    document.getElementById('sigma-zz').addEventListener('input', function() {
        stressComponents.zz = parseInt(this.value);
        document.getElementById('sigma-zz-value').textContent = this.value;
        recalculateAndUpdate();
    });
    
    document.getElementById('tau-xy').addEventListener('input', function() {
        stressComponents.xy = parseInt(this.value);
        document.getElementById('tau-xy-value').textContent = this.value;
        recalculateAndUpdate();
    });
    
    document.getElementById('tau-yz').addEventListener('input', function() {
        stressComponents.yz = parseInt(this.value);
        document.getElementById('tau-yz-value').textContent = this.value;
        recalculateAndUpdate();
    });
    
    document.getElementById('tau-xz').addEventListener('input', function() {
        stressComponents.xz = parseInt(this.value);
        document.getElementById('tau-xz-value').textContent = this.value;
        recalculateAndUpdate();
    });
    
    // View control buttons
    document.getElementById('reset-view').addEventListener('click', function() {
        angle = 0;
    });
    
    document.getElementById('toggle-principal').addEventListener('click', function() {
        showPrincipal = !showPrincipal;
        if (showPrincipal) {
            this.textContent = 'Hide Principal Stresses';
        } else {
            this.textContent = 'Show Principal Stresses';
        }
    });
    
    document.getElementById('toggle-failure').addEventListener('click', function() {
        showFailure = !showFailure;
        if (showFailure) {
            this.textContent = 'Hide Failure Criteria';
        } else {
            this.textContent = 'Show Failure Criteria';
        }
    });
    
    // Material model radio buttons
    const materialModelRadios = document.querySelectorAll('input[name="material-model"]');
    materialModelRadios.forEach(function(radio) {
        radio.addEventListener('change', function() {
            materialModel = this.value;
            recalculateAndUpdate();
        });
    });
}

// Recalculate and update display
function recalculateAndUpdate() {
    calculatePrincipalStresses();
    calculateFailureCriteria();
    updateDisplay();
}

// Calculate principal stresses and directions
function calculatePrincipalStresses() {
    // Create the stress tensor matrix
    const stressTensor = [
        [stressComponents.xx, stressComponents.xy, stressComponents.xz],
        [stressComponents.xy, stressComponents.yy, stressComponents.yz],
        [stressComponents.xz, stressComponents.yz, stressComponents.zz]
    ];
    
    // For this demo, we'll use these calculations as an approximation
    const I1 = stressComponents.xx + stressComponents.yy + stressComponents.zz;
    const I2 = stressComponents.xx * stressComponents.yy + stressComponents.yy * stressComponents.zz + 
               stressComponents.zz * stressComponents.xx - 
               stressComponents.xy * stressComponents.xy - 
               stressComponents.yz * stressComponents.yz - 
               stressComponents.xz * stressComponents.xz;
    const I3 = stressComponents.xx * stressComponents.yy * stressComponents.zz + 
               2 * stressComponents.xy * stressComponents.yz * stressComponents.xz -
               stressComponents.xx * stressComponents.yz * stressComponents.yz -
               stressComponents.yy * stressComponents.xz * stressComponents.xz -
               stressComponents.zz * stressComponents.xy * stressComponents.xy;
    
    // Simplified principal stress calculation for demonstration
    // In a real application, use a proper numerical eigenvalue solver
    principalStresses.s1 = Math.max(stressComponents.xx, stressComponents.yy, stressComponents.zz) + 10;
    principalStresses.s3 = Math.min(stressComponents.xx, stressComponents.yy, stressComponents.zz) - 10;
    principalStresses.s2 = I1 - principalStresses.s1 - principalStresses.s3;
    
    // Simplified principal directions for demonstration
    principalStresses.v1 = [0.8, 0.5, 0.3];
    principalStresses.v2 = [-0.5, 0.8, 0.3];
    principalStresses.v3 = [0.3, -0.3, 0.9];
}

// Function to check quiz answers
function checkAnswer(questionId, correctAnswer) {
    const selectedOption = document.querySelector(`input[name="${questionId}"]:checked`);
    const feedbackElement = document.getElementById(`${questionId}-feedback`);
    
    if (!selectedOption) {
        feedbackElement.innerHTML = "Please select an answer.";
        feedbackElement.className = "feedback";
        return;
    }
    
    if (selectedOption.value === correctAnswer) {
        feedbackElement.innerHTML = "Correct! Well done.";
        feedbackElement.className = "feedback correct";
    } else {
        feedbackElement.innerHTML = "Incorrect. Try again!";
        feedbackElement.className = "feedback incorrect";
    }
}

// Function to toggle solution visibility
function toggleSolution(id) {
    const solution = document.getElementById(id);
    
    if (solution.classList.contains('shown')) {
        solution.style.display = "none";
        solution.classList.remove('shown');
        const toggleElement = solution.previousElementSibling;
        toggleElement.textContent = "Show Solution";
    } else {
        solution.style.display = "block";
        solution.classList.add('shown');
        const toggleElement = solution.previousElementSibling;
        toggleElement.textContent = "Hide Solution";
    }
}