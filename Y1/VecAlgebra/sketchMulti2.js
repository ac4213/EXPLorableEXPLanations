// Common button container setup function
function setupButtonContainer(p) {
    const buttonContainer = p.createDiv('');
    buttonContainer.style('width', '100%');
    buttonContainer.style('display', 'flex');
    buttonContainer.style('justify-content', 'center');
    buttonContainer.style('gap', '10px');
    buttonContainer.style('margin-top', '10px');
    buttonContainer.style('margin-bottom', '20px');
    return buttonContainer;
  }
  
  // Vector class that can be used across all sketches
  class Vector {
    constructor(p, P1, P2, options = {}) {
      this.p = p;
      this.x1 = P1.x;
      this.y1 = P1.y;
      this.x2 = P2.x;
      this.y2 = P2.y;
      this.type = options.type || "regular";
      this.isResultant = options.isResultant || (this.type === "resultant");
      this.col = options.color || p.color(0, 0, 255);
      this.label = options.label || "";
      this.active = false;
      this.controllable = false;
      this.beta = p.random(0.5, 4); // Parameter for arcs
      this.gridStep = options.gridStep || 10;
    }
  
    showArrow(color) {
      const p = this.p;
      // Use provided color or instance color
      const col = color || this.col;
      
      const v = p.createVector(this.x2 - this.x1, this.y2 - this.y1);
      const l = v.mag();
      const h = 10;
      
      p.push();
      p.stroke(col);
      
      if (this.isResultant) {
        p.strokeWeight(4);
        if (p.drawingContext && p.drawingContext.setLineDash) {
          p.drawingContext.setLineDash([5, 10]);
        }
      } else {
        p.strokeWeight(2);
      }
      
      p.line(this.x1, this.y1, this.x2, this.y2);
      p.pop();
  
      // Draw arrow head
      if (l !== 0) {
        p.push();
        p.stroke(col);
        p.fill(col);
        p.translate(this.x1, this.y1);
        p.rotate(v.heading());
        p.triangle(l, 0, l - h, h / 2, l - h, -h / 2);
        p.pop();
      }
  
      // Draw control handle
      if ((this.controllable || this.type === "actionable") && !this.isResultant) {
        p.stroke(p.color(0, 0, 0));
        p.fill(p.color(200, 200, 200, 70));
        p.ellipseMode(p.CENTER);
        p.push();
        if (!this.active) {
          p.noStroke();
        }
        p.circle(this.x2, this.y2, 30);
        p.pop();
      }
    }
  
    Cartesian(col) {
      const p = this.p;
      const lx = this.x2 - this.x1;
      const ly = this.y2 - this.y1;
      const h = 5;
      
      p.push();
      p.textSize(14);
      p.stroke(col);
      p.fill(col);
      p.strokeWeight(1);
  
      // X component
      if (lx !== 0) {
        p.line(this.x1, 0, this.x2, 0);
        if (lx > 0) {
          p.triangle(lx, 0, lx - h, h / 2, lx - h, -h / 2);
        } else {
          p.triangle(lx, 0, lx + h, h / 2, lx + h, -h / 2);
        }
        p.text(p.round((this.x2 - this.x1) / this.gridStep, 1), (this.x2 - this.x1) / 2, 0);
      }
  
      // Y component
      if (ly !== 0) {
        p.line(this.x2, this.y1, this.x2, this.y2);
        if (ly <= 0) {
          p.triangle(this.x2, ly, this.x2 + h / 2, ly + h, this.x2 - h / 2, ly + h);
        } else {
          p.triangle(this.x2, ly, this.x2 + h / 2, ly - h, this.x2 - h / 2, ly - h);
        }
        p.text(p.round((-this.y2 + this.y1) / this.gridStep, 1), this.x2, (this.y2 - this.y1) / 2);
      }
      
      p.pop();
    }
  
    Polar(col) {
      const p = this.p;
      const v = p.createVector(this.x2 - this.x1, this.y2 - this.y1);
      const l = v.mag();
      
      p.textSize(14);
      
      // Draw angle arc
      p.push();
      p.ellipseMode(p.CENTER);
      p.strokeWeight(1);
      p.stroke(col);
      const angle = -p.round((p.atan2(v.y, v.x) * 180) / p.PI);
      
      p.noFill();
      if (angle >= 0) {
        p.arc(0, 0, 2 * this.beta * this.gridStep, 2 * this.beta * this.gridStep, v.heading(), 0);
      } else {
        p.arc(0, 0, 2 * this.beta * this.gridStep, 2 * this.beta * this.gridStep, 0, v.heading());
      }
      
      p.fill(col);
      p.text(
        angle + "°",
        this.beta * this.gridStep * p.cos(v.heading() / 2),
        this.beta * this.gridStep * p.sin(v.heading() / 2)
      );
      p.pop();
      
      // Draw magnitude
      p.push();
      p.stroke(col);
      p.fill(col);
      p.translate(this.x1, this.y1);
      if (p.abs(angle) <= 90) {
        p.rotate(v.heading());
        p.text(p.round(l / this.gridStep, 1), l / 2, 0);
      } else {
        p.rotate(v.heading() - p.PI);
        p.text(p.round(l / this.gridStep, 1), -l / 2, 0);
      }
      p.pop();
    }
  
    Controls() {
      this.controllable = true;
      this.showArrow(this.col);
    }
  
    clicked() {
      const p = this.p;
      const d = p.dist(p.mouseX - p.width / 2, p.mouseY - p.height / 2, this.x2, this.y2);
      if (d < 15 && (this.controllable || this.type === "actionable") && !this.isResultant) {
        this.active = true;
      }
    }
  
    dragged() {
      const p = this.p;
      this.x2 = p.mouseX - p.width / 2;
      this.y2 = p.mouseY - p.height / 2;
    }
  }
  
  // Sketch 1: Basic Vector Representation
  let sketch1 = function(p) {
    let vectors = [];
    let showHandles = false;
    let showPolar = false;
    let showCartesian = false;
    let gridStep;
    
    p.setup = function() {
      p.createCanvas(400, 400);
      gridStep = p.width / 10;
      p.textAlign(p.CENTER, p.CENTER);
      
      const origin = p.createVector(0, 0);
      const end = p.createVector(3 * gridStep, -4 * gridStep);
      vectors.push(new Vector(p, origin, end, { 
        gridStep,
        type: "actionable"  // Changed to actionable to ensure it works with the controls
      }));
      
      // Create UI buttons
      const buttonContainer = setupButtonContainer(p);
      
    /*const btnHandles = p.createButton("Toggle Handles");
      btnHandles.parent(buttonContainer);
      btnHandles.mousePressed(() => {
        showHandles = !showHandles;
        vectors.forEach(v => v.controllable = showHandles);
      });*/
      
      const btnCartesian = p.createButton("Toggle Cartesian");
      btnCartesian.parent(buttonContainer);
      btnCartesian.mousePressed(() => showCartesian = !showCartesian);
      
      const btnPolar = p.createButton("Toggle Polar");
      btnPolar.parent(buttonContainer);
      btnPolar.mousePressed(() => showPolar = !showPolar);
    };
    
    p.draw = function() {
      p.background(255);
      p.strokeJoin(p.BEVEL);
      
      // Draw grid
      p.stroke(200);
      for (let i = 0; i <= 10; i++) {
        p.line(i * gridStep, 0, i * gridStep, p.height);
        p.line(0, i * gridStep, p.width, i * gridStep);
      }
      
      // Set origin in center
      p.translate(p.width / 2, p.height / 2);
      
      // Label axes
      p.stroke(0);
      p.fill(200);
      p.text("+", 0, 0);
      p.text("X", 4.8 * gridStep, 0);
      p.text("Y", 0, -4.8 * gridStep);
      
      // Draw vectors
      vectors.forEach(v => {
        v.showArrow(p.color(255, 0, 0));
        if (showCartesian) v.Cartesian(p.color(0, 0, 0));
        if (showPolar) v.Polar(p.color(0, 0, 0));
        if (showHandles) v.Controls();
      });
    };
    
    p.mousePressed = function() {
      vectors.forEach(v => {
        v.active = false;
        v.clicked();
      });
    };
    
    p.mouseDragged = function() {
      for (let i = 0; i < vectors.length; i++) {
        if (vectors[i].active) {
          vectors[i].dragged();
          return false;
        }
      }
    };
  };
  
  // Sketch 2: Vector Scaling
  let sketch2 = function(p) {
    let vectors = [];
    let showPolar = false;
    let showCartesian = false;
    let gridStep;
    let scaleInput;
    
    p.setup = function() {
      const canvas = p.createCanvas(400, 400);
      gridStep = p.width / 30;
      p.textAlign(p.CENTER, p.CENTER);
      
      const origin = p.createVector(0, 0);
      const end = p.createVector(3 * gridStep, -4 * gridStep);
      
      // Base vector - make this actionable so it can be dragged
      vectors.push(new Vector(p, origin, end, { 
        gridStep,
        type: "actionable"
      }));
      
      // Resultant (scaled) vector
      vectors.push(new Vector(p, origin, end, { 
        gridStep, 
        isResultant: true, 
        color: p.color(255, 0, 0) 
      }));
      
      // Create UI
      const buttonContainer = setupButtonContainer(p);
      
      const btnCartesian = p.createButton("Toggle Cartesian");
      btnCartesian.parent(buttonContainer);
      btnCartesian.mousePressed(() => showCartesian = !showCartesian);
      
      const btnPolar = p.createButton("Toggle Polar");
      btnPolar.parent(buttonContainer);
      btnPolar.mousePressed(() => showPolar = !showPolar);
      
      scaleInput = p.createInput("1", "number");
      scaleInput.parent(buttonContainer);
      scaleInput.size(40);
    };
    
    p.draw = function() {
      p.background(255);
      p.strokeJoin(p.BEVEL);
      
      // Draw grid
      p.stroke(200);
      for (let i = 0; i <= 30; i++) {
        p.line(i * gridStep, 0, i * gridStep, p.height);
        p.line(0, i * gridStep, p.width, i * gridStep);
      }
      
      // Set origin to center
      p.translate(p.width / 2, p.height / 2);
      
      // Label axes
      p.stroke(0);
      p.fill(200);
      p.text("+", 0, 0);
      p.text("X", 14 * gridStep, 0);
      p.text("Y", 0, -14 * gridStep);
      
      // Scale the resultant vector
      const scale = parseFloat(scaleInput.value()) || 0;
      vectors[1].x2 = scale * vectors[0].x2;
      vectors[1].y2 = scale * vectors[0].y2;
      
      // Draw vectors
      vectors.forEach(v => {
        v.showArrow();
        if (showCartesian) v.Cartesian(p.color(0, 0, 0));
        if (showPolar) v.Polar(p.color(0, 0, 0));
      });
    };
    
    p.mousePressed = function() {
      vectors.forEach(v => {
        v.active = false;
        v.clicked();
      });
    };
    
    p.mouseDragged = function() {
      for (let i = 0; i < vectors.length; i++) {
        if (vectors[i].active) {
          vectors[i].dragged();
          return false;
        }
      }
    };
  };
  
  // Sketch 3: Vector Addition with Parallelogram
  let sketch3 = function(p) {
    let vectors = [];
    let showPolar = false;
    let showCartesian = false;
    let showParallelogram = false;
    let showLabels = false;
    let gridStep;
    
    p.setup = function() {
      const canvas = p.createCanvas(600, 600);
      gridStep = p.width / 30;
      p.textAlign(p.CENTER, p.BOTTOM);
      
      const origin = p.createVector(0, 0);
      const endA = p.createVector(3 * gridStep, -5 * gridStep);
      const endB = p.createVector(2 * gridStep, 2 * gridStep);
      
      vectors.push(new Vector(p, origin, endA, { 
        gridStep, 
        type: "actionable",
        color: p.color(0, 0, 255) 
      }));
      
      vectors.push(new Vector(p, origin, endB, { 
        gridStep, 
        type: "actionable",
        color: p.color(0, 200, 255) 
      }));
      
      vectors.push(new Vector(p, origin, p.createVector(0, 0), { 
        gridStep, 
        type: "resultant",
        color: p.color(255, 0, 0) 
      }));
      
      // Create UI
      const buttonContainer = setupButtonContainer(p);
      
      const btnCartesian = p.createButton("Toggle Cartesian");
      btnCartesian.parent(buttonContainer);
      btnCartesian.mousePressed(() => showCartesian = !showCartesian);
      
      const btnPolar = p.createButton("Toggle Polar");
      btnPolar.parent(buttonContainer);
      btnPolar.mousePressed(() => showPolar = !showPolar);
      
      const btnParallel = p.createButton("Toggle Parallelogram");
      btnParallel.parent(buttonContainer);
      btnParallel.mousePressed(() => showParallelogram = !showParallelogram);
      
      const btnLabels = p.createButton("Toggle Labels");
      btnLabels.parent(buttonContainer);
      btnLabels.mousePressed(() => showLabels = !showLabels);
    };
    
    p.draw = function() {
      p.background(255);
      p.strokeJoin(p.BEVEL);
      
      // Draw grid
      p.stroke(200);
      for (let i = 0; i <= 30; i++) {
        p.line(i * gridStep, 0, i * gridStep, p.height);
        p.line(0, i * gridStep, p.width, i * gridStep);
      }
      
      // Set origin to center
      p.translate(p.width / 2, p.height / 2);
      
      // Label axes
      p.push();
      p.textAlign(p.CENTER, p.CENTER);
      p.stroke(0);
      p.fill(200);
      p.text("+", 0, 0);
      p.text("X", 14 * gridStep, 0);
      p.text("Y", 0, -14 * gridStep);
      p.pop();
      
      // Update resultant vector
      vectors[2].x2 = vectors[0].x2 + vectors[1].x2;
      vectors[2].y2 = vectors[0].y2 + vectors[1].y2;
      
      // Draw parallelogram
      if (showParallelogram) {
        p.push();
        p.strokeWeight(1);
        p.stroke(0, 0, 255);
        p.fill(0, 0, 255, 20);
        p.beginShape();
        p.vertex(vectors[0].x1, vectors[0].y1);
        p.vertex(vectors[0].x2, vectors[0].y2);
        p.vertex(vectors[2].x2, vectors[2].y2);
        p.vertex(vectors[1].x2, vectors[1].y2);
        p.endShape(p.CLOSE);
        p.stroke(0, 200, 255);
        p.line(vectors[0].x2, vectors[0].y2, vectors[2].x2, vectors[2].y2);
        p.pop();
      }
      
      // Draw vectors
      vectors.forEach(v => {
        v.showArrow();
        if (showCartesian) v.Cartesian(v.col);
        if (showPolar) v.Polar(v.col);
      });
      
      // Draw labels
      if (showLabels) {
        p.push();
        p.stroke(0);
        p.textSize(22);
        p.textAlign(p.LEFT, p.BOTTOM);
        
        p.fill(0, 0, 255);
        p.text('A', vectors[0].x2, vectors[0].y2);
        
        p.fill(0, 200, 255);
        p.text('B', vectors[1].x2, vectors[1].y2);
        
        p.fill(255, 0, 0);
        p.text('R', vectors[2].x2, vectors[2].y2);
        p.pop();
      }
    };
    
    p.mousePressed = function() {
      vectors.forEach(v => {
        v.active = false;
        v.clicked();
      });
    };
    
    p.mouseDragged = function() {
      for (let i = 0; i < vectors.length; i++) {
        if (vectors[i].active) {
          vectors[i].dragged();
          return false;
        }
      }
    };
  };
  
  // Sketch 4: Triangle Rule Animation
  let sketch4 = function(p) {
    let vectors = [];
    let showPolar = false;
    let showCartesian = false;
    let showLabels = false;
    let isPlaying = false;
    let animationStep = 0;
    let animationSteps = 10;
    let vectorOrder = [0, 1, 2];
    let gridStep;
    let tempVectors = [];
    let tempD1; // To store intermediate points for animation
    
    p.setup = function() {
      const canvas = p.createCanvas(600, 600);
      gridStep = p.width / 30;
      p.textAlign(p.CENTER, p.BOTTOM);
      
      const origin = p.createVector(0, 0);
      
      vectors.push(new Vector(p, origin, p.createVector(6 * gridStep, -9 * gridStep), { 
        gridStep, 
        type: "actionable",
        color: p.color(0, 0, 255),
        label: "A"
      }));
      
      vectors.push(new Vector(p, origin, p.createVector(0 * gridStep, 5 * gridStep), { 
        gridStep, 
        type: "actionable",
        color: p.color(0, 150, 255),
        label: "B"
      }));
      
      vectors.push(new Vector(p, origin, p.createVector(-10 * gridStep, -3 * gridStep), { 
        gridStep, 
        type: "actionable",
        color: p.color(0, 255, 255),
        label: "C"
      }));
      
      vectors.push(new Vector(p, origin, p.createVector(0, 0), { 
        gridStep, 
        type: "resultant",
        color: p.color(255, 0, 0),
        label: "R"
      }));
      
      // Create UI
      const buttonContainer = setupButtonContainer(p);
      
      const btnCartesian = p.createButton("Toggle Cartesian");
      btnCartesian.parent(buttonContainer);
      btnCartesian.mousePressed(() => showCartesian = !showCartesian);
      
      const btnPolar = p.createButton("Toggle Polar");
      btnPolar.parent(buttonContainer);
      btnPolar.mousePressed(() => showPolar = !showPolar);
      
      const btnLabels = p.createButton("Toggle Labels");
      btnLabels.parent(buttonContainer);
      btnLabels.mousePressed(() => showLabels = !showLabels);
      
      const btnPlay = p.createButton("Play Triangle Rule");
      btnPlay.parent(buttonContainer);
      btnPlay.mousePressed(() => {
        isPlaying = true;
        animationStep = 0;
        tempVectors = [];
        p.frameRate(10);
      });
      
      const btnReset = p.createButton("RESET");
      btnReset.parent(buttonContainer);
      btnReset.mousePressed(() => {
        isPlaying = false;
        vectorOrder = shuffleArray([...vectorOrder]);
        animationStep = 0;
        tempVectors = [];
        p.frameRate(60);
      });
    };
    
    p.draw = function() {
      p.background(255);
      p.strokeJoin(p.BEVEL);
      
      // Draw grid
      p.stroke(200);
      for (let i = 0; i <= 30; i++) {
        p.line(i * gridStep, 0, i * gridStep, p.height);
        p.line(0, i * gridStep, p.width, i * gridStep);
      }
      
      // Set origin to center
      p.translate(p.width / 2, p.height / 2);
      
      // Label axes
      p.push();
      p.textAlign(p.CENTER, p.CENTER);
      p.stroke(0);
      p.fill(200);
      p.text("+", 0, 0);
      p.text("X", 14 * gridStep, 0);
      p.text("Y", 0, -14 * gridStep);
      p.pop();
      
      // Update resultant vector
      vectors[3].x2 = vectors[0].x2 + vectors[1].x2 + vectors[2].x2;
      vectors[3].y2 = vectors[0].y2 + vectors[1].y2 + vectors[2].y2;
      
      // Handle animation
      if (isPlaying) {
        showCartesian = false;
        showPolar = false;
        showLabels = false;
        animateTriangleRule();
      }
      
      // Draw vectors
      vectors.forEach(v => {
        v.showArrow();
        if (showCartesian) v.Cartesian(v.col);
        if (showPolar) v.Polar(v.col);
      });
      
      // Draw temporary vectors for animation
      tempVectors.forEach(v => v.showArrow());
      
      // Draw labels
      if (showLabels) {
        p.push();
        p.stroke(0);
        p.textSize(22);
        p.textAlign(p.LEFT, p.BOTTOM);
        
        p.fill(vectors[0].col);
        p.text(vectors[0].label, vectors[0].x2, vectors[0].y2);
        
        p.fill(vectors[1].col);
        p.text(vectors[1].label, vectors[1].x2, vectors[1].y2);
        
        p.fill(vectors[2].col);
        p.text(vectors[2].label, vectors[2].x2, vectors[2].y2);
        
        p.fill(vectors[3].col);
        p.text(vectors[3].label, vectors[3].x2, vectors[3].y2);
        p.pop();
      }
    };
    
    function animateTriangleRule() {
      animationStep += 1 / animationSteps;
      tempVectors = [];
      
      if (animationStep <= 1) { // Move both vectors 1 and 2
        const v0 = vectors[vectorOrder[0]];
        const v1 = vectors[vectorOrder[1]];
        const v2 = vectors[vectorOrder[2]];
        
        // Calculate displacement for first vector
        const xdisp = v0.x2 - v0.x1;
        const ydisp = v0.y2 - v0.y1;
        
        // Create temporary vector for second vector
        const point1 = p.createVector(v1.x1 + animationStep * xdisp, v1.y1 + animationStep * ydisp);
        const point2 = p.createVector(v1.x2 + animationStep * xdisp, v1.y2 + animationStep * ydisp);
        tempVectors.push(new Vector(p, point1, point2, {
          gridStep,
          color: v1.col
        }));
        
        // Save the starting point for the next phase of animation
        tempD1 = point1;
        
        // Create temporary vector for third vector
        const point3 = p.createVector(v2.x1 + animationStep * xdisp, v2.y1 + animationStep * ydisp);
        const point4 = p.createVector(v2.x2 + animationStep * xdisp, v2.y2 + animationStep * ydisp);
        tempVectors.push(new Vector(p, point3, point4, {
          gridStep,
          color: v2.col
        }));
        
      } else if (animationStep > 1 && animationStep <= 2.1) { // Keep moving third vector
        const v0 = vectors[vectorOrder[0]];
        const v1 = vectors[vectorOrder[1]];
        const v2 = vectors[vectorOrder[2]];
        
        // First displacement (already completed)
        const xdisp1 = v0.x2 - v0.x1;
        const ydisp1 = v0.y2 - v0.y1;
        
        // Keep the second vector in place after first displacement
        const point1 = p.createVector(v1.x1 + xdisp1, v1.y1 + ydisp1);
        const point2 = p.createVector(v1.x2 + xdisp1, v1.y2 + ydisp1);
        tempVectors.push(new Vector(p, point1, point2, {
          gridStep,
          color: v1.col
        }));
        
        // Second displacement (in progress)
        const xdisp2 = v1.x2 - v1.x1;
        const ydisp2 = v1.y2 - v1.y1;
        
        // Move the third vector according to both displacements
        const point3 = p.createVector(
          v2.x1 + xdisp1 + (animationStep - 1) * xdisp2, 
          v2.y1 + ydisp1 + (animationStep - 1) * ydisp2
        );
        const point4 = p.createVector(
          v2.x2 + xdisp1 + (animationStep - 1) * xdisp2, 
          v2.y2 + ydisp1 + (animationStep - 1) * ydisp2
        );
        tempVectors.push(new Vector(p, point3, point4, {
          gridStep,
          color: v2.col
        }));
      }
    }
    
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
    
    p.mousePressed = function() {
      vectors.forEach(v => {
        v.active = false;
        v.clicked();
      });
    };
    
    p.mouseDragged = function() {
      // Clear temporary vectors when dragging
      tempVectors = [];
      
      // Handle vector dragging
      for (let i = 0; i < vectors.length; i++) {
        if (vectors[i].active) {
          vectors[i].dragged();
          return false;
        }
      }
    };
  };