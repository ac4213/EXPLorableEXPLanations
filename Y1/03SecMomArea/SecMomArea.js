// Canvas variables
var cnv, cnvx, cnvy;
var bgdRGB = [233, 216, 177]; // Match the parabolic applet background
var sliders = []; // Array of slider objects
var sliderLabels = ["Top flange width", "Top flange height", "Web width", "Web height", "Bottom flange width", "Bottom flange height"];
var sliderDefaults = [100, 30, 20, 150, 200, 30]; // Default values for sliders
var sliderMinMax = [[20, 300], [10, 50], [10, 50], [50, 300], [20, 300], [10, 50]]; // Min/max values for sliders
var figura = []; // Array of shape objects
var ctroid; // Centroid of the composite shape
var absx = 300, absy = 150; // Position of the figure on canvas - shifted left

// Control variables
var showCentroid = true;
var showAxes = false; // Grid turned off by default
var showDimensions = false;
var symmetricMode = false;

// UI elements
var buttonContainer;
var resultDiv;

function setup() {
    // Create canvas
    cnv = createCanvas(800, 500);
    cnv.parent('sketch-holder');
    cnvx = cnv.position().x;
    cnvy = cnv.position().y;
    
    // Create sliders
    createSliders();
    
    // Create initial figure
    resetFigure();
    
    // Display settings
    angleMode(DEGREES);
    rectMode(CENTER);
    textSize(12);
    
    // Set up results area
    resultDiv = select('#results-content');
    
    // Enable manual redraw to improve performance
    noLoop();
}

function createSliders() {
    // Create sliders below the canvas
    for (let i = 0; i < sliderLabels.length; i++) {
        let sliderDiv = createDiv();
        sliderDiv.parent('button-container');
        sliderDiv.style('margin', '10px');
        sliderDiv.style('text-align', 'center');
        
        let label = createP(sliderLabels[i] + ": ");
        label.parent(sliderDiv);
        label.style('margin', '5px');
        
        let slider = createSlider(sliderMinMax[i][0], sliderMinMax[i][1], sliderDefaults[i], 1);
        slider.style('width', '200px');
        slider.parent(sliderDiv);
        slider.input(() => {
            let val = slider.value();
            valueSpan.html(val + ' mm');
            
            // If in symmetric mode, update the paired slider
            if (symmetricMode && (i === 0 || i === 4)) {
                let pairedIdx = i === 0 ? 4 : 0;
                sliders[pairedIdx].value(val);
                document.getElementById('value-' + pairedIdx).innerHTML = val + ' mm';
            }
            
            updateFigure();
        });
        
        let valueSpan = createSpan(sliderDefaults[i] + ' mm');
        valueSpan.id('value-' + i);
        valueSpan.style('margin-left', '10px');
        valueSpan.parent(sliderDiv);
        
        sliders.push(slider);
    }
}

function draw() {
    // Clear the background
    background(bgdRGB[0], bgdRGB[1], bgdRGB[2]);
    
    // Draw the composite shape
    for (let i = 0; i < figura.length; i++) {
        figura[i].display();
    }
    
    // Calculate and draw the centroid
    ctroid = centroid(figura);
    
    if (showCentroid) {
        drawCentroid(ctroid);
    }
    
    // Draw dimension lines if enabled
    if (showDimensions) {
        drawDimensions();
    }
    
    // Calculate the second moment of area
    let Ixx = secmomarea(figura, ctroid.y);
    
    // Draw reference arrows showing the distances from component centroids to the composite centroid
    drawReferenceArrows();
    
    // Update the result display
    updateResults(ctroid, Ixx);
    
    // Draw explanatory text on the canvas
    drawExplanatoryText(ctroid, Ixx);
}

function resetFigure() {
    // Reset sliders to default values
    for (let i = 0; i < sliders.length; i++) {
        sliders[i].value(sliderDefaults[i]);
        document.getElementById('value-' + i).innerHTML = sliderDefaults[i] + ' mm';
    }
    
    // Update the figure
    updateFigure();
}

function updateFigure() {
    // Get values from sliders
    let tflangew = sliders[0].value();
    let tflangeh = sliders[1].value();
    let webt = sliders[2].value();
    let webh = sliders[3].value();
    let bflangew = sliders[4].value();
    let bflangeh = sliders[5].value();
    
    // Update the I-section components
    figura = [];
    
    // Top flange (red)
    figura.push(new RectShape(absx, absy, tflangew, tflangeh, [255, 0, 0]));
    
    // Web (green) - ensure it connects exactly with flanges
    figura.push(new RectShape(absx, absy + tflangeh/2 + webh/2, webt, webh, [0, 155, 0]));
    
    // Bottom flange (blue) - ensure it connects exactly with web
    figura.push(new RectShape(absx, absy + tflangeh + webh, bflangew, bflangeh, [0, 0, 255]));
    
    // Trigger redraw to update the visualization
    redraw();
}

function toggleSymmetry() {
    symmetricMode = !symmetricMode;
    
    if (symmetricMode) {
        // Make bottom flange width equal to top flange width
        let topFlangeWidth = sliders[0].value();
        sliders[4].value(topFlangeWidth);
        document.getElementById('value-4').innerHTML = topFlangeWidth + ' mm';
    }
    
    updateFigure();
}

function toggleDimensions() {
    showDimensions = !showDimensions;
    redraw();
}

function centroid(figura) {
    var totarea = 0;
    var sumY = 0;
    var sumX = 0;
    
    for (var ii = 0; ii < figura.length; ii++) {
        totarea = totarea + figura[ii].Area;
        sumY = sumY + figura[ii].Area * figura[ii].yc; // sum(Ai*yci)
        sumX = sumX + figura[ii].Area * figura[ii].xc; // sum(Ai*xci)
    }
    
    var yc = sumY / totarea;
    var xc = sumX / totarea; // For asymmetric shapes
    
    var res = {
        x: xc,
        y: yc
    };
    return res;
}

function secmomarea(figura, theaxis) {
    var Ixx = 0;
    for (var ii = 0; ii < figura.length; ii++) {
        var d = (figura[ii].yc - theaxis);
        Ixx = Ixx + figura[ii].Ixc + figura[ii].Area * Math.pow(d, 2); // Parallel axis theorem: Ia = Ix + Ad^2
    }
    return Ixx;
}

// Function to get total area of all components
function getTotalArea() {
    let totalArea = 0;
    for (let i = 0; i < figura.length; i++) {
        totalArea += figura[i].Area;
    }
    return totalArea;
}

// Function to draw the centroid marker
function drawCentroid(ctroid) {
    push();
    stroke(255, 0, 0);
    strokeWeight(2);
    fill(255, 255, 0);
    
    // Draw centroid circle
    ellipse(ctroid.x, ctroid.y, 10, 10);
    
    // Draw crosshairs
    line(ctroid.x - 15, ctroid.y, ctroid.x + 15, ctroid.y);
    line(ctroid.x, ctroid.y - 15, ctroid.x, ctroid.y + 15);
    
    // Label
    textAlign(CENTER, TOP);
    fill(0);
    text("Centroid", ctroid.x, ctroid.y + 20);
    
    pop();
}

// Function to draw dimensions
function drawDimensions() {
    push();
    stroke(100);
    strokeWeight(1);
    fill(0);
    textAlign(CENTER, CENTER);
    
    // Draw dimension lines for top flange
    let topFlangeWidth = figura[0].wdth;
    let x1 = figura[0].xc - topFlangeWidth / 2;
    let x2 = figura[0].xc + topFlangeWidth / 2;
    let y = figura[0].yc - figura[0].hght / 2 - 15;
    
    line(x1, y, x2, y);
    line(x1, y - 5, x1, y + 5);
    line(x2, y - 5, x2, y + 5);
    text(topFlangeWidth + " mm", (x1 + x2) / 2, y - 10);
    
    // Draw dimension lines for web height
    let webHeight = figura[1].hght;
    let x = figura[1].xc + figura[1].wdth / 2 + 15;
    let y1 = figura[1].yc - webHeight / 2;
    let y2 = figura[1].yc + webHeight / 2;
    
    line(x, y1, x, y2);
    line(x - 5, y1, x + 5, y1);
    line(x - 5, y2, x + 5, y2);
    
    push();
    translate(x + 10, (y1 + y2) / 2);
    rotate(90);
    text(webHeight + " mm", 0, 0);
    pop();
    
    // Draw dimension lines for bottom flange
    let bottomFlangeWidth = figura[2].wdth;
    x1 = figura[2].xc - bottomFlangeWidth / 2;
    x2 = figura[2].xc + bottomFlangeWidth / 2;
    y = figura[2].yc + figura[2].hght / 2 + 15;
    
    line(x1, y, x2, y);
    line(x1, y - 5, x1, y + 5);
    line(x2, y - 5, x2, y + 5);
    text(bottomFlangeWidth + " mm", (x1 + x2) / 2, y + 10);
    
    pop();
}

// Function to draw reference arrows showing the distances from component centroids to the composite centroid
function drawReferenceArrows() {
    push();
    strokeWeight(1);
    
    // Draw arrow from top flange centroid to composite centroid - offset to the right
    drawArrow(figura[0].xc + 70, figura[0].yc, ctroid.x + 70, ctroid.y, [200, 0, 0], true);
    
    // Draw arrow from web centroid to composite centroid - offset even further right
    if (Math.abs(figura[1].yc - ctroid.y) > 12) {
        let direction = (figura[1].yc - ctroid.y) < 0 ? 1 : -1;
        drawArrow(figura[1].xc + 100, figura[1].yc + direction, ctroid.x + 100, ctroid.y - direction, [0, 155, 0], true);
    }
    
    // Draw arrow from bottom flange centroid to composite centroid - offset to the right
    drawArrow(figura[2].xc + 130, figura[2].yc, ctroid.x + 130, ctroid.y, [0, 0, 200], true);
    
    // Label distance values - moved to the right
    textAlign(CENTER, CENTER);
    fill(200, 0, 0);
    let d1 = Math.abs(figura[0].yc - ctroid.y).toFixed(1);
    text("d₁ = " + d1 + " mm", figura[0].xc + 70, (figura[0].yc + ctroid.y) / 2);
    
    fill(0, 155, 0);
    let d2 = Math.abs(figura[1].yc - ctroid.y).toFixed(1);
    text("d₂ = " + d2 + " mm", figura[1].xc + 100, (figura[1].yc + ctroid.y) / 2);
    
    fill(0, 0, 200);
    let d3 = Math.abs(figura[2].yc - ctroid.y).toFixed(1);
    text("d₃ = " + d3 + " mm", figura[2].xc + 130, (figura[2].yc + ctroid.y) / 2);
    
    pop();
}

function updateResults(ctroid, Ixx) {
    if (!resultDiv) return;
    
    // Calculate individual second moments
    let Ixx1 = Math.round(secmomarea([figura[0]], ctroid.y));
    let Ixx2 = Math.round(secmomarea([figura[1]], ctroid.y));
    let Ixx3 = Math.round(secmomarea([figura[2]], ctroid.y));
    
    // Create a formatted HTML result
    let html = `
        <table>
        <tr>
            <th>Property</th>
            <th>Value</th>
        </tr>
        <tr>
            <td>Centroid (X, Y)</td>
            <td>(${ctroid.x.toFixed(1)}, ${ctroid.y.toFixed(1)}) mm</td>
        </tr>
        <tr>
            <td>Total Area</td>
            <td>${getTotalArea().toFixed(0)} mm²</td>
        </tr>
        <tr>
            <td>Ixx (Top Flange)</td>
            <td>${Ixx1.toFixed(0)} mm⁴</td>
        </tr>
        <tr>
            <td>Ixx (Web)</td>
            <td>${Ixx2.toFixed(0)} mm⁴</td>
        </tr>
        <tr>
            <td>Ixx (Bottom Flange)</td>
            <td>${Ixx3.toFixed(0)} mm⁴</td>
        </tr>
        <tr>
            <td><strong>Total Ixx</strong></td>
            <td><strong>${Math.round(Ixx).toFixed(0)} mm⁴</strong></td>
        </tr>
        </table>
        <p><strong>${symmetricMode ? 'Symmetric Mode: ON' : ''}</strong></p>
    `;
    
    resultDiv.innerHTML = html;
}

function drawExplanatoryText(ctroid, Ixx) {
    push();
    fill(0);
    textAlign(LEFT, BOTTOM);
    textSize(14);
    text("Moment of Area Explorer", 20, 25);
    
    // Draw legend
    textSize(12);
    fill(200, 0, 0);
    text("Top Flange", 520, 130);
    fill(0, 155, 0);
    text("Web", 520, 150);
    fill(0, 0, 200);
    text("Bottom Flange", 520, 170);
    
    pop();
}

function RectShape(xc, yc, wdth, hght, colore) {
    this.xc = xc;
    this.yc = yc;
    this.colr = colore;
    this.wdth = wdth;
    this.hght = hght;

    this.Area = wdth * hght; //b*h
    this.troid = {
        x: xc,
        y: yc
    }; //center
    this.Ixc = wdth * Math.pow(hght, 3) / 12; //bh^3/12 (Second moment about centroidal x-axis)
    this.Iyc = hght * Math.pow(wdth, 3) / 12; //hb^3/12 (Second moment about centroidal y-axis)

    this.display = function() {
        push();
        rectMode(CENTER);
        stroke(0);
        strokeWeight(2);
        
        // Fill with semi-transparent color
        fill(this.colr[0], this.colr[1], this.colr[2], 100);
        
        // Draw the rectangle
        rect(this.xc, this.yc, this.wdth, this.hght);
        
        // Add hatching pattern to help visualize the shape
        stroke(this.colr[0], this.colr[1], this.colr[2], 150);
        strokeWeight(1);
        
        let spacing = 10;
        for (let i = -this.wdth/2 + spacing/2; i < this.wdth/2; i += spacing) {
            drawHatchLine(this.xc + i, this.yc - this.hght/2, this.xc + i, this.yc + this.hght/2);
        }
        pop();
        
        // Display the centroid of this component
        this.showcentre();
        
        // Display the area label - moved to the right
        push();
        fill(0);
        textAlign(LEFT, CENTER);
        textSize(12);
        text("A = " + this.Area.toFixed(0) + " mm²", this.xc + this.wdth/2 + 20, this.yc);
        pop();
    };

    this.showcentre = function() {
        push();
        stroke(this.colr[0], this.colr[1], this.colr[2]);
        strokeWeight(1);
        fill(this.colr[0], this.colr[1], this.colr[2], 200);
        
        // Draw a small circle at the centroid
        ellipse(this.xc, this.yc, 6, 6);
        
        // Draw a small cross at the centroid
        drawHatchLine(this.xc - 4, this.yc, this.xc + 4, this.yc);
        drawHatchLine(this.xc, this.yc - 4, this.xc, this.yc + 4);
        pop();
    };
}

// Function to draw a line (avoiding the name conflict with p5.js line())
function drawHatchLine(x1, y1, x2, y2) {
    line(x1, y1, x2, y2);
}

// Draw an arrow from (fromx, fromy) to (tox, toy)
function drawArrow(fromx, fromy, tox, toy, color, twoheaded) {
    // Convert color array to hex string for canvas context
    var colorstring = "#";
    var pad = "00";
    for (var ii = 0; ii < color.length; ii++) {
        colorstring = colorstring + (pad + color[ii].toString(16)).slice(-pad.length);
    }
    
    // Get drawing context
    var ctx = cnv.drawingContext; // Access to raw canvas context
    var headlen = 5; // Length of arrow head
    
    // Calculate arrow angle
    var angle = Math.atan2(toy - fromy, tox - fromx);
    
    // Save original context settings
    var oldstrokestyle = ctx.strokeStyle;
    var oldlineWidth = ctx.lineWidth;
    var oldfillStyle = ctx.fillStyle;
    
    // Draw the main shaft of the arrow
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.strokeStyle = colorstring;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw the arrowhead at the end point
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI/7), toy - headlen * Math.sin(angle - Math.PI/7));
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI/7), toy - headlen * Math.sin(angle + Math.PI/7));
    ctx.lineTo(tox, toy);
    ctx.fillStyle = colorstring;
    ctx.fill();
    
    // If two-headed, draw the second arrowhead at the start point
    if (twoheaded) {
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(fromx + headlen * Math.cos(angle - Math.PI/7), fromy + headlen * Math.sin(angle - Math.PI/7));
        ctx.lineTo(fromx + headlen * Math.cos(angle + Math.PI/7), fromy + headlen * Math.sin(angle + Math.PI/7));
        ctx.lineTo(fromx, fromy);
        ctx.fillStyle = colorstring;
        ctx.fill();
    }
    
    // Restore original context settings
    ctx.strokeStyle = oldstrokestyle;
    ctx.lineWidth = oldlineWidth;
    ctx.fillStyle = oldfillStyle;
}