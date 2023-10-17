let sketch1 = function (p) {  // p is the instance of p5.js
  let V = [];
  let ShowHandles = false;
  let ShowPolar = false;
  let ShowCartesian = false;
  let GridStep

  p.setup = function () {
    p.createCanvas(400, 400);
    GridStep = p.width / 10; //consider using xGridStep and yGridstep for rectangular canvas
    p.textAlign(p.CENTER, p.CENTER);

    O = p.createVector(0, 0);
    A = p.createVector(3 * GridStep, -4 * GridStep);
    V[0] = new Vettore(O, A);

    //GENERATE INTERFACE
    butHAND = p.createButton("Toggle Handles");
    butHAND.mousePressed(toggleHandles);
    butCART = p.createButton("Toggle Cartesian");
    butCART.mousePressed(toggleCartesian);
    butPOLR = p.createButton("Toggle Polar");
    butPOLR.mousePressed(togglePolar);
  }


  p.draw = function () {
    p.background(255);
    p.strokeJoin(p.BEVEL);

    //CREATE GRID
    p.stroke(200);
    for (let i = 0; i < 10; i++) {
      p.line(i * GridStep, 0, i * GridStep, p.height);
      p.line(0, i * GridStep, p.width, i * GridStep);
    }

    //POPULATE AXES
    p.translate(p.width / 2, p.height / 2); //translate origin in the middle
    p.stroke(0);
    p.fill(200);
    p.text("+", 0, 0);
    p.text("X", 4.8 * GridStep, 0);
    p.text("Y", 0, -4.8 * GridStep);

    //DRAW VECTORS
    for (let i = 0; i < V.length; i++) {
      V[i].showArrow(p.color(255, 0, 0));
      if (ShowCartesian) {
        V[i].Cartesian(p.color(0, 0, 0));
      }
      if (ShowPolar) {
        V[i].Polar(p.color(0, 0, 0));
      }
      if (ShowHandles) {
        V[i].Controls();
      }
    }
  }

  //GLOBAL MOUSE FUNCTIONS
  p.mousePressed = function () {
    for (let i = 0; i < V.length; i++) {
      V[i].active = false;
      V[i].clicked();
    }
  }

  p.mouseDragged = function () {
    for (let i = 0; i < V.length; i++) {
      if (V[i].active) {
        V[i].dragged();
        return false;
      }
    }
  }

  //GUI FUNCTIONS
  function toggleHandles() {
    for (let i = 0; i < V.length; i++) {
      V[i].controllable = false;
    }
    ShowHandles = !ShowHandles;
  }

  function toggleCartesian() {
    ShowCartesian = !ShowCartesian;
  }

  function togglePolar() {
    ShowPolar = !ShowPolar;
  }

  //CLASSES
  class Vettore {
    constructor(P1, P2) {
      this.x1 = P1.x;
      this.y1 = P1.y;
      this.x2 = P2.x;
      this.y2 = P2.y;
      this.active = false;
      this.controllable = false;
      this.beta = p.random(0.5, 2); //parameter for arcs
    }

    showArrow(col) {
      let V = p.createVector(this.x2 - this.x1, this.y2 - this.y1);
      let l = V.mag();
      let h = 10;
      p.push();
      p.strokeWeight(2);
      p.stroke(col);
      p.fill(col);

      p.push();
      p.translate(this.x1, this.y1);
      p.rotate(V.heading());
      p.triangle(l, 0, l - h, h / 2, l - h, -h / 2);
      p.pop();

      p.line(this.x1, this.y1, this.x2, this.y2);
      p.pop();
    }

    Cartesian(col) {

      let lx = this.x2 - this.x1;
      let ly = this.y2 - this.y1;
      let h = 5;

      p.push();
      p.textSize(14);
      p.stroke(col);
      p.fill(col);
      p.strokeWeight(1);

      p.line(this.x1, 0, this.x2, 0);
      p.line(this.x2, this.y1, this.x2, this.y2);
      if (lx >= 0) {
        p.triangle(lx, 0, lx - h, h / 2, lx - h, -h / 2);
      } else {
        p.triangle(lx, 0, lx + h, h / 2, lx + h, -h / 2);
      }
      if (ly <= 0) {
        p.triangle(this.x2, ly, this.x2 + h / 2, ly + h, this.x2 - h / 2, ly + h);
      } else {
        p.triangle(this.x2, ly, this.x2 + h / 2, ly - h, this.x2 - h / 2, ly - h);
      }
      p.text(p.round((this.x2 - this.x1) / GridStep, 1), (this.x2 - this.x1) / 2, 0);
      p.text(p.round((-this.y2 + this.y1) / GridStep, 1), this.x2, (this.y2 - this.y1) / 2);
      p.pop();
    }

    Polar(col) {
      p.textSize(14);
      p.stroke(col);
      p.fill(col);

      let V = p.createVector(this.x2 - this.x1, this.y2 - this.y1);
      let l = V.mag();

      p.push();
      p.ellipseMode(p.CENTER);
      p.strokeWeight(1);
      p.stroke(col);
      let angolo = -p.round((p.atan2(V.y, V.x) * 180) / p.PI);
      if (angolo >= 0) {
        p.noFill();
        p.arc(
          0,
          0,
          2 * this.beta * GridStep,
          2 * this.beta * GridStep,
          V.heading(),
          0
        );
        p.fill(col);
      } else {
        p.noFill();
        p.arc(
          0,
          0,
          2 * this.beta * GridStep,
          2 * this.beta * GridStep,
          0,
          V.heading()
        );
        p.fill(col);
      }
      p.text(
        angolo + "°",
        this.beta * GridStep * p.cos(V.heading() / 2),
        this.beta * GridStep * p.sin(V.heading() / 2)
      );
      p.pop();

      p.push();
      p.translate(this.x1, this.y1);
      if (p.abs(angolo) <= 90) {
        p.rotate(V.heading());
        p.text(p.round(l / GridStep, 1), l / 2, 0);
      } else {
        p.rotate(V.heading() - p.PI);
        p.text(p.round(l / GridStep, 1), -l / 2, 0);
      }

      p.pop();
    }

    Controls() {
      if (ShowHandles) {
        this.controllable = true;
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

    clicked() {
      let d = p.dist(p.mouseX - p.width / 2, p.mouseY - p.height / 2, this.x2, this.y2);
      if (d < 15 && this.controllable) {
        this.active = true;
      }
    }

    dragged() {
      this.x2 = p.mouseX - p.width / 2;
      this.y2 = p.mouseY - p.height / 2;
    }
  }

};

let sketch2 = function (p) {  // p is the instance of p5.js
  let cnv
  let V = [];
  let ShowPolar = false,
    ShowCartesian = false,
    GridStep,
    cnvx, cnvy;

  p.setup = function () {
    cnv = p.createCanvas(400, 400);
    GridStep = p.width / 30; //consider using xGridStep and yGridstep for rectangular canvas
    p.textAlign(p.CENTER, p.CENTER);
    cnvx = cnv.position().x;
    cnvy = cnv.position().y;

    O = p.createVector(0, 0);
    A = p.createVector(3 * GridStep, -4 * GridStep);
    V[0] = new Vettore(O, A);
    V[1] = new Vettore(O, A, isresultant = true, p.color(255, 0, 0));

    //GENERATE INTERFACE
    butCART = p.createButton("Toggle Cartesian");
    butCART.mousePressed(toggleCartesian);
    butPOLR = p.createButton("Toggle Polar");
    butPOLR.mousePressed(togglePolar);
    inpSCAL = p.createInput("1", "number");
    inpSCAL.input(p.draw);
    inpSCAL.position(cnvx + p.width / 2 - 20, cnvy + p.height - 25);
    inpSCAL.size(40);

  }

  p.draw = function () {

    p.background(255);
    p.strokeJoin(p.BEVEL);

    //CREATE GRID
    p.stroke(200);
    for (let i = 0; i < 30; i++) {
      p.line(i * GridStep, 0, i * GridStep, p.height);
      p.line(0, i * GridStep, p.width, i * GridStep);
    }

    //POPULATE AXES
    p.translate(p.width / 2, p.height / 2); //translate origin in the middle
    p.stroke(0);
    p.fill(200);
    p.text("+", 0, 0);
    p.text("X", 14 * GridStep, 0);
    p.text("Y", 0, -14 * GridStep);



    V[1].x2 = inpSCAL.value() * V[0].x2;
    V[1].y2 = inpSCAL.value() * V[0].y2;

    //DRAW VECTORS
    for (i = 0; i < V.length; i++) {
      V[i].showArrow();
      if (ShowCartesian) {
        V[i].Cartesian(p.color(0, 0, 0));
      }
      if (ShowPolar) {
        V[i].Polar(p.color(0, 0, 0));
      }
    }
  }

  //GLOBAL MOUSE FUNCTIONS
  p.mousePressed = function () {
    for (i = 0; i < V.length; i++) {
      V[i].active = false;
      V[i].clicked();
    }
  }

  p.mouseDragged = function () {
    for (i = 0; i < V.length; i++) {
      if (V[i].active) {
        V[i].dragged();
        return false;
      }
    }
  }

  //GUI FUNCTIONS
  function toggleCartesian() {
    ShowCartesian = !ShowCartesian;
  }

  function togglePolar() {
    ShowPolar = !ShowPolar;
  }

  //CLASSES
  class Vettore {
    constructor(P1, P2, isresultant = false, col = p.color(0, 0, 255)) {
      this.x1 = P1.x;
      this.y1 = P1.y;
      this.x2 = P2.x;
      this.y2 = P2.y;
      this.resultant = isresultant;
      this.col = col;

      this.active = false;
      this.beta = p.random(0.5, 2); //parameter for arcs

    }

    showArrow() {
      let V = p.createVector(this.x2 - this.x1, this.y2 - this.y1);
      let l = V.mag();
      let h = 10;
      p.push();
      p.stroke(this.col);
      if (this.resultant) {
        p.strokeWeight(4)
        cnv.drawingContext.setLineDash([5, 10]);
      } else {
        p.strokeWeight(2);
      }
      p.line(this.x1, this.y1, this.x2, this.y2);
      p.pop();

      if (l != 0) {
        p.push();
        p.stroke(this.col);
        p.fill(this.col);
        p.translate(this.x1, this.y1);
        p.rotate(V.heading());
        p.triangle(l, 0, l - h, h / 2, l - h, -h / 2);
        p.pop();
      }

      if (!this.resultant) {
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
      p.textSize(14);
      p.stroke(col);
      p.fill(col);

      let lx = this.x2 - this.x1;
      let ly = this.y2 - this.y1;
      let h = 5;
      p.push();
      p.strokeWeight(1);
      p.stroke(col);
      p.fill(col);
      p.line(this.x1, 0, this.x2, 0);
      p.line(this.x2, this.y1, this.x2, this.y2);
      if (lx >= 0) {
        p.triangle(lx, 0, lx - h, h / 2, lx - h, -h / 2);
      } else {
        p.triangle(lx, 0, lx + h, h / 2, lx + h, -h / 2);
      }
      if (ly <= 0) {
        p.triangle(this.x2, ly, this.x2 + h / 2, ly + h, this.x2 - h / 2, ly + h);
      } else {
        p.triangle(this.x2, ly, this.x2 + h / 2, ly - h, this.x2 - h / 2, ly - h);
      }
      p.text(p.round((this.x2 - this.x1) / GridStep, 1), (this.x2 - this.x1) / 2, 0);
      p.text(
        p.round((-this.y2 + this.y1) / GridStep, 1),
        this.x2,
        (this.y2 - this.y1) / 2
      );
      p.pop();
    }

    Polar(col) {
      p.textSize(14);
      p.stroke(col);
      p.fill(col);

      let V = p.createVector(this.x2 - this.x1, this.y2 - this.y1);
      let l = V.mag();

      p.push();
      p.ellipseMode(p.CENTER);
      p.strokeWeight(1);
      p.stroke(col);
      let angolo = -p.round((p.atan2(V.y, V.x) * 180) / p.PI);
      if (angolo >= 0) {
        p.noFill();
        p.arc(
          0,
          0,
          2 * this.beta * GridStep,
          2 * this.beta * GridStep,
          V.heading(),
          0
        );
        p.fill(col);
      } else {
        p.noFill();
        p.arc(
          0,
          0,
          2 * this.beta * GridStep,
          2 * this.beta * GridStep,
          0,
          V.heading()
        );
        p.fill(col);
      }
      p.text(
        angolo + "°",
        this.beta * GridStep * p.cos(V.heading() / 2),
        this.beta * GridStep * p.sin(V.heading() / 2)
      );
      p.pop();

      p.push();
      p.translate(this.x1, this.y1);
      if (p.abs(angolo) <= 90) {
        p.rotate(V.heading());
        p.text(p.round(l / GridStep, 1), l / 2, 0);
      } else {
        p.rotate(V.heading() - p.PI);
        p.text(p.round(l / GridStep, 1), -l / 2, 0);
      }

      p.pop();
    }

    clicked() {
      let d = p.dist(p.mouseX - p.width / 2, p.mouseY - p.height / 2, this.x2, this.y2);
      if (d < 15 && !this.resultant) {
        this.active = true;
      }
    }

    dragged() {
      this.x2 = p.mouseX - p.width / 2;
      this.y2 = p.mouseY - p.height / 2;
    }
  }
}

let sketch3 = function (p) {
  let cnv
  let V = [];
  let ShowPolar = false,
    ShowCartesian = false,
    DRAWPARALLELOGRAM = false,
    ShowLabels = false,
    GridStep

  p.setup = function () {
    cnv = p.createCanvas(600, 600);
    GridStep = p.width / 30; //consider using xGridStep and yGridstep for rectangular canvas
    p.textAlign(p.CENTER, p.BOTTOM);

    O = p.createVector(0, 0);
    A = p.createVector(3 * GridStep, -5 * GridStep);
    B = p.createVector(2 * GridStep, 2 * GridStep);
    V[0] = new Vettore(O, A);
    V[1] = new Vettore(O, B, isresultant = false, p.color(0, 200, 255));
    V[2] = new Vettore(O, B, isresultant = true, p.color(255, 0, 0));

    //GENERATE INTERFACE
    butCART = p.createButton("Toggle Cartesian");
    butCART.mousePressed(toggleCartesian);
    butPOLR = p.createButton("Toggle Polar");
    butPOLR.mousePressed(togglePolar);
    butPRGR = p.createButton("Toggle Parallelogram");
    butPRGR.mousePressed(toggleParallelogram);
    butLABL = p.createButton("Toggle Labels");
    butLABL.mousePressed(toggleLabels);

  }

  p.draw = function () {
    p.background(255);
    p.strokeJoin(p.BEVEL);

    //CREATE GRID
    p.stroke(200);
    for (let i = 0; i < 30; i++) {
      p.line(i * GridStep, 0, i * GridStep, p.height);
      p.line(0, i * GridStep, p.width, i * GridStep);
    }

    //POPULATE AXES
    p.translate(p.width / 2, p.height / 2); //translate origin in the middle
    p.push();
    p.textAlign(p.CENTER, p.CENTER);
    p.stroke(0);
    p.fill(200);
    p.text("+", 0, 0);
    p.text("X", 14 * GridStep, 0);
    p.text("Y", 0, -14 * GridStep);
    p.pop();

    V[2].x2 = V[0].x2 + V[1].x2;
    V[2].y2 = V[0].y2 + V[1].y2;

    //DRAW PARALLELOGRAM
    if (DRAWPARALLELOGRAM) {
      p.push();
      p.strokeWeight(1);
      p.stroke(0, 0, 255);
      p.fill(0, 0, 255, 20);
      p.beginShape();
      p.vertex(V[0].x1, V[0].y1);
      p.vertex(V[0].x2, V[0].y2);
      p.vertex(V[2].x2, V[2].y2);
      p.vertex(V[1].x2, V[1].y2);
      p.endShape(p.CLOSE);
      p.stroke(0, 200, 255)
      p.line(V[0].x2, V[0].y2, V[2].x2, V[2].y2)
      p.pop();
    }

    //DRAW VECTORS
    for (let i = 0; i < V.length; i++) {
      V[i].showArrow();
      if (ShowCartesian) {
        V[i].Cartesian(V[i].col);
      }
      if (ShowPolar) {
        V[i].Polar(V[i].col);
      }
    }

    //DRAW LABELS
    if (ShowLabels) {
      p.push();
      p.stroke(0)
      p.textSize(22);
      p.textAlign(p.LEFT, p.BOTTOM)
      p.fill(0, 0, 255);
      p.text('A', V[0].x2, V[0].y2);
      p.fill(0, 200, 255);
      p.text('B', V[1].x2, V[1].y2);
      p.fill(255, 0, 0);
      p.text('R', V[2].x2, V[2].y2);
      p.pop();
    }
  }

  //GLOBAL MOUSE FUNCTIONS
  p.mousePressed = function () {
    for (i = 0; i < V.length; i++) {
      V[i].active = false;
      V[i].clicked();
    }
  }

  p.mouseDragged = function () {
    for (i = 0; i < V.length; i++) {
      if (V[i].active) {
        V[i].dragged();
        return false;
      }
    }
  }


  //GUI FUNCTIONS
  function toggleCartesian() {
    ShowCartesian = !ShowCartesian;
  }

  function togglePolar() {
    ShowPolar = !ShowPolar;
  }

  function toggleParallelogram() {
    DRAWPARALLELOGRAM = !DRAWPARALLELOGRAM;
  }

  function toggleLabels() {
    ShowLabels = !ShowLabels;
  }



  //CLASSES
  class Vettore {
    constructor(P1, P2, isresultant = false, col = p.color(0, 0, 255)) {
      this.x1 = P1.x;
      this.y1 = P1.y;
      this.x2 = P2.x;
      this.y2 = P2.y;
      this.resultant = isresultant;
      this.col = col;

      this.active = false;
      this.beta = p.random(0.5, 4); //parameter for arcs

    }

    showArrow() {
      let V = p.createVector(this.x2 - this.x1, this.y2 - this.y1);
      let l = V.mag();
      let h = 10;
      p.push();
      p.stroke(this.col);
      if (this.resultant) {
        p.strokeWeight(4)
        cnv.drawingContext.setLineDash([5, 10]);
      } else {
        p.strokeWeight(2);
      }
      p.line(this.x1, this.y1, this.x2, this.y2);
      p.pop();

      if (l != 0) {
        p.push();
        p.stroke(this.col);
        p.fill(this.col);
        p.translate(this.x1, this.y1);
        p.rotate(V.heading());
        p.triangle(l, 0, l - h, h / 2, l - h, -h / 2);
        p.pop();
      }

      if (!this.resultant) {
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
      let lx = this.x2 - this.x1;
      let ly = this.y2 - this.y1;
      let h = 5;
      p.push();
      p.textSize(14);
      p.strokeWeight(1);
      p.stroke(col);
      p.fill(col);
      switch (lx) {
        case 0: break;
        default:
          p.line(this.x1, 0, this.x2, 0);
          if (lx > 0) {
            p.triangle(lx, 0, lx - h, h / 2, lx - h, -h / 2);
          } else {
            p.triangle(lx, 0, lx + h, h / 2, lx + h, -h / 2);
          }
          p.text(p.round((this.x2 - this.x1) / GridStep, 1), (this.x2 - this.x1) / 2, 0);
      }
      switch (ly) {
        case 0: break;
        default:
          p.line(this.x2, this.y1, this.x2, this.y2);
          if (ly <= 0) {
            p.triangle(this.x2, ly, this.x2 + h / 2, ly + h, this.x2 - h / 2, ly + h);
          } else {
            p.triangle(this.x2, ly, this.x2 + h / 2, ly - h, this.x2 - h / 2, ly - h);
          }
          p.text(p.round((-this.y2 + this.y1) / GridStep, 1), this.x2, (this.y2 - this.y1) / 2);
      }
      p.pop();
    }

    Polar(col) {
      let V = p.createVector(this.x2 - this.x1, this.y2 - this.y1);
      let l = V.mag();

      p.textSize(14);

      p.push();
      p.ellipseMode(p.CENTER);
      p.strokeWeight(1);
      p.stroke(col);
      let angolo = -p.round((p.atan2(V.y, V.x) * 180) / p.PI);
      if (angolo >= 0) {
        p.noFill();
        p.arc(
          0,
          0,
          2 * this.beta * GridStep,
          2 * this.beta * GridStep,
          V.heading(),
          0
        );
        p.fill(col);
      } else {
        p.noFill();
        p.arc(
          0,
          0,
          2 * this.beta * GridStep,
          2 * this.beta * GridStep,
          0,
          V.heading()
        );
        p.fill(col);
      }
      p.text(
        angolo + "°",
        this.beta * GridStep * p.cos(V.heading() / 2),
        this.beta * GridStep * p.sin(V.heading() / 2)
      );
      p.pop();

      p.push();
      p.stroke(col);
      p.fill(col);
      p.translate(this.x1, this.y1);
      if (p.abs(angolo) <= 90) {
        p.rotate(V.heading());
        p.text(p.round(l / GridStep, 1), l / 2, 0);
      } else {
        p.rotate(V.heading() - p.PI);
        p.text(p.round(l / GridStep, 1), -l / 2, 0);
      }

      p.pop();
    }

    clicked() {
      let d = p.dist(p.mouseX - p.width / 2, p.mouseY - p.height / 2, this.x2, this.y2);
      if (d < 15 && !this.resultant) {
        this.active = true;
      }
    }

    dragged() {
      this.x2 = p.mouseX - p.width / 2;
      this.y2 = p.mouseY - p.height / 2;
    }
  }
}

let sketch4 = function (p) {
  let cnv
  let V = [];
  let ShowPolar = false,
    ShowCartesian = false,
    DRAWPARALLELOGRAM = false,
    ShowLabels = false,
    isplaying = false,
    N = 10, // ANIMATION STEPS
    q = 0,
    GridStep,
    jj = [0, 1, 2];

  p.setup = function () {
    cnv = p.createCanvas(600, 600);
    GridStep = p.width / 30; //consider using xGridStep and yGridstep for rectangular canvas
    p.textAlign(p.CENTER, p.BOTTOM);

    O = p.createVector(0, 0);
    A = p.createVector(6 * GridStep, -9 * GridStep);
    B = p.createVector(0 * GridStep, 5 * GridStep);
    C = p.createVector(-10 * GridStep, -3 * GridStep);
    V[0] = new Vettore(O, A, type = "actionable", p.color(0, 0, 255), label = "A");
    V[1] = new Vettore(O, B, type = "actionable", p.color(0, 150, 255), label = "B");
    V[2] = new Vettore(O, C, type = "actionable", p.color(0, 255, 255), label = "C");
    V[3] = new Vettore(O, B, type = "resultant", p.color(255, 0, 0), label = "R");

    //GENERATE INTERFACE
    butCART = p.createButton("Toggle Cartesian");
    butCART.mousePressed(toggleCartesian);
    butPOLR = p.createButton("Toggle Polar");
    butPOLR.mousePressed(togglePolar);
    butLABL = p.createButton("Toggle Labels");
    butLABL.mousePressed(toggleLabels);
    butPLAY = p.createButton("Play Triangle Rule");
    butPLAY.mousePressed(playTriangleRule);
    butREST = p.createButton("RESET");
    butREST.mousePressed(RESETbutton);

  }

  p.draw = function () {
    p.background(255);
    p.strokeJoin(p.BEVEL);

    //CREATE GRID
    p.stroke(200);
    for (let i = 0; i < 30; i++) {
      p.line(i * GridStep, 0, i * GridStep, p.height);
      p.line(0, i * GridStep, p.width, i * GridStep);
    }

    //POPULATE AXES
    p.translate(p.width / 2, p.height / 2); //translate origin in the middle
    p.push();
    p.textAlign(p.CENTER, p.CENTER);
    p.stroke(0);
    p.fill(200);
    p.text("+", 0, 0);
    p.text("X", 14 * GridStep, 0);
    p.text("Y", 0, -14 * GridStep);
    p.pop();

    V[3].x2 = V[0].x2 + V[1].x2 + V[2].x2;  //RESULTANT x
    V[3].y2 = V[0].y2 + V[1].y2 + V[2].y2;  //RESULTANT y

    //PLAY TRIANGLE RULE
    if (isplaying) {
      DRAWPARALLELOGRAM = false;
      ShowCartesian = false;
      ShowPolar = false;
      ShowLabels = false;
      playTriangleRule();
    }

    //DRAW VECTORS
    for (let i = 0; i < V.length; i++) {
      V[i].showArrow();
      if (ShowCartesian) {
        V[i].Cartesian(V[i].col);
      }
      if (ShowPolar) {
        V[i].Polar(V[i].col);
      }
    }

    //DRAW LABELS
    if (ShowLabels) {
      p.push();
      p.stroke(0)
      p.textSize(22);
      p.textAlign(p.LEFT, p.BOTTOM)
      p.fill(0, 0, 255);
      p.text(V[0].label, V[0].x2, V[0].y2);
      p.fill(0, 150, 255);
      p.text(V[1].label, V[1].x2, V[1].y2);
      p.fill(0, 255, 255);
      p.text(V[2].label, V[2].x2, V[2].y2);
      p.fill(255, 0, 0);
      p.text(V[3].label, V[3].x2, V[3].y2);
      p.pop();
    }

  }

  //GLOBAL MOUSE FUNCTIONS
  p.mousePressed = function () {
    for (let i = 0; i < V.length; i++) {
      V[i].active = false;
      V[i].clicked();
    }
  }

  p.mouseDragged = function () {
    for (let i = V.length - 1; i >= 0; i--) {
      if (V[i].type == "regular") {
        V.splice(i, 1);
      }
    }

    for (let i = 0; i < V.length; i++) {
      if (V[i].active) {
        V[i].dragged();
        return false;
      }
    }
  }


  //GUI FUNCTIONS
  function toggleCartesian() {
    ShowCartesian = !ShowCartesian;
  }

  function togglePolar() {
    ShowPolar = !ShowPolar;
  }

  function toggleLabels() {
    ShowLabels = !ShowLabels;
  }

  function playTriangleRule() {
    isplaying = true;
    p.frameRate(10);
    q += 1 / N;
    if (q <= 1) { //move both vectors 1 and 2
      let xdisp = (V[jj[0]].x2 - V[jj[0]].x1); //amount to move in the x-dir
      let ydisp = (V[jj[0]].y2 - V[jj[0]].y1); //amount to move in the y-dir
      D1 = p.createVector(V[jj[1]].x1 + q * xdisp, V[jj[1]].y1 + q * ydisp); //temp point D1
      D2 = p.createVector(V[jj[1]].x2 + q * xdisp, V[jj[1]].y2 + q * ydisp); //temp point D2
      V[4] = new Vettore(D1, D2, type = "regular", V[jj[1]].col);

      xdisp = (V[jj[0]].x2 - V[jj[0]].x1); //amount to move in the x-dir
      ydisp = (V[jj[0]].y2 - V[jj[0]].y1); //amount to move in the y-dir
      E1 = p.createVector(V[jj[2]].x1 + q * xdisp, V[jj[2]].y1 + q * ydisp); //temp point E1
      E2 = p.createVector(V[jj[2]].x2 + q * xdisp, V[jj[2]].y2 + q * ydisp); //temp point E2
      V[5] = new Vettore(E1, E2, type = "regular", V[jj[2]].col);

    }
    if (q > 1 && q <= 2.1) { //keep moving vector 2
      xdisp = (V[jj[1]].x2 - V[jj[1]].x1); //amount to move in the x-dir
      ydisp = (V[jj[1]].y2 - V[jj[1]].y1); //amount to move in the y-dir
      E1 = p.createVector(V[jj[2]].x1 + D1.x + (q - 1) * xdisp, V[jj[2]].y1 + D1.y + (q - 1) * ydisp);
      E2 = p.createVector(V[jj[2]].x2 + D1.x + (q - 1) * xdisp, V[jj[2]].y2 + D1.y + (q - 1) * ydisp);
      V[5] = new Vettore(E1, E2, type = "regular", V[jj[2]].col);

    }

  }

  function RESETbutton() {
    isplaying = false;
    jj = shuffleArray(jj);
    q = 0;
    V.splice(4, 2);
    p.frameRate(60);
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];  // swap elements
    }
    return array;
  }


  //CLASSES
  class Vettore {
    constructor(P1, P2, type = "regular", col = p.color(0, 0, 255), label = "") {
      this.x1 = P1.x;
      this.y1 = P1.y;
      this.x2 = P2.x;
      this.y2 = P2.y;
      this.type = type;
      this.col = col;
      this.label = label;

      this.active = false;
      this.beta = p.random(0.5, 4); //parameter for arcs

    }

    showArrow() {
      let V = p.createVector(this.x2 - this.x1, this.y2 - this.y1);
      let l = V.mag();
      let h = 10;
      p.push();
      p.stroke(this.col);
      switch (this.type) {
        case "resultant":
          p.strokeWeight(4)
          cnv.drawingContext.setLineDash([5, 10]);
          break;
        case "actionable":
          p.strokeWeight(2);
          break;
        default:
          p.strokeWeight(1);
          break;
      }
      p.line(this.x1, this.y1, this.x2, this.y2);
      p.pop();

      if (l != 0) {
        p.push();
        p.stroke(this.col);
        p.fill(this.col);
        p.translate(this.x1, this.y1);
        p.rotate(V.heading());
        p.triangle(l, 0, l - h, h / 2, l - h, -h / 2);
        p.pop();
      }

      if (this.type == "actionable") {
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
      if (this.type != "regular") {
        let lx = this.x2 - this.x1;
        let ly = this.y2 - this.y1;
        let h = 5;
        p.push();
        p.textSize(14);
        p.strokeWeight(1);
        p.stroke(col);
        p.fill(col);
        switch (lx) {
          case 0: break;
          default:
            p.line(this.x1, 0, this.x2, 0);
            if (lx > 0) {
              p.triangle(lx, 0, lx - h, h / 2, lx - h, -h / 2);
            } else {
              p.triangle(lx, 0, lx + h, h / 2, lx + h, -h / 2);
            }
            p.text(p.round((this.x2 - this.x1) / GridStep, 1), (this.x2 - this.x1) / 2, 0);
        }
        switch (ly) {
          case 0: break;
          default:
            p.line(this.x2, this.y1, this.x2, this.y2);
            if (ly <= 0) {
              p.triangle(this.x2, ly, this.x2 + h / 2, ly + h, this.x2 - h / 2, ly + h);
            } else {
              p.triangle(this.x2, ly, this.x2 + h / 2, ly - h, this.x2 - h / 2, ly - h);
            }
            p.text(p.round((-this.y2 + this.y1) / GridStep, 1), this.x2, (this.y2 - this.y1) / 2);
        }
        p.pop();
      }
    }

    Polar(col) {
      if (this.type != "regular") {
        let V = p.createVector(this.x2 - this.x1, this.y2 - this.y1);
        let l = V.mag();

        p.textSize(14);

        p.push();
        p.ellipseMode(p.CENTER);
        p.strokeWeight(1);
        p.stroke(col);
        let angolo = -p.round((p.atan2(V.y, V.x) * 180) / p.PI);
        if (angolo >= 0) {
          p.noFill();
          p.arc(0, 0, 2 * this.beta * GridStep, 2 * this.beta * GridStep, V.heading(), 0);
          p.fill(col);
        } else {
          p.noFill();
          p.arc(0, 0, 2 * this.beta * GridStep, 2 * this.beta * GridStep, 0, V.heading());
          p.fill(col);
        }
        p.text(
          angolo + "°",
          this.beta * GridStep * p.cos(V.heading() / 2),
          this.beta * GridStep * p.sin(V.heading() / 2)
        );
        p.pop();

        p.push();
        p.stroke(col);
        p.fill(col);
        p.translate(this.x1, this.y1);
        if (p.abs(angolo) <= 90) {
          p.rotate(V.heading());
          p.text(p.round(l / GridStep, 1), l / 2, 0);
        } else {
          p.rotate(V.heading() - p.PI);
          p.text(p.round(l / GridStep, 1), -l / 2, 0);
        }

        p.pop();
      }
    }

    clicked() {
      let d = p.dist(p.mouseX - p.width / 2, p.mouseY - p.height / 2, this.x2, this.y2);
      if (d < 15 && this.type == "actionable") {
        this.active = true;
      }
    }

    dragged() {
      this.x2 = p.mouseX - p.width / 2;
      this.y2 = p.mouseY - p.height / 2;
    }
  }

}