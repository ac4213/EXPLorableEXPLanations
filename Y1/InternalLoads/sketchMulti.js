let sketch1 = function(p) {  // p is the instance of p5.js
  // Declare any variables you need here
let cnv
// Variables for beam length, force, andent
let beamLength = 400;
let forcePosition = 200;
let forceMagnitude = -50;
let forceAngle=90;
let momentPosition = 250;
let momentMagnitude = 0;

let forcePositionSlider, forceMagnitudeSlider, momentPositionSlider, momentMagnitudeSlider;


  p.setup = function() {
      // Setup your sketch here
      cnv=p.createCanvas(600, 600);

// Create sliders for customizing values
forcePositionSlider = p.createSlider(0, beamLength, forcePosition,10);
forcePositionSlider.position(200, 35);

forceMagnitudeSlider = p.createSlider(-80,80,forceMagnitude,10);  
forceMagnitudeSlider.position(10, 35);

//forceAngleSlider = createSlider(0,180,forceAngle,5);  
//forceAngleSlider.position(400, 35);

momentPositionSlider = p.createSlider(0, beamLength, momentPosition,10);
momentPositionSlider.position(200, 85);

momentMagnitudeSlider = p.createSlider(-10,10,momentMagnitude,1);  
momentMagnitudeSlider.position(10, 85);

  };

  p.draw = function() {
      // Animate your sketch here
      p.background(255,245,190);


// Update variables with slider and input values
forcePosition = forcePositionSlider.value();
forceMagnitude = forceMagnitudeSlider.value();
//forceAngle = forceAngleSlider.value();
momentPosition = momentPositionSlider.value();
momentMagnitude = momentMagnitudeSlider.value();

//draw GUI
p.text("Force: " + forceMagnitude + " [N]", 10, 30); 
p.text("a = " + forcePosition + " [mm]", 210, 30);
//text("angle = " + forceAngle + " [deg]", 410,80);
p.text("Moment: " + momentMagnitude  + " [Nm]", 10, 80); 
p.text("b = " + momentPosition + " [mm]", 210,80);

// Draw the x-axis
p.line(500, 100, 550, 100);
p.text("x",555,105);
// Draw the y-axis
p.line(500, 100, 500, 50);
p.text("y",495,40);
// Draw the z-axis
drawMoment(500,100,15,"black",1)
p.text("z",475,75);

// Draw the beam
beamTop= p.height/2-30;
beamBot= p.height/2+90;
beamMid= p.height/2;
p.push();
p.fill(255);
p.strokeWeight(2);
p.rect(100, p.height / 2 - 20, beamLength, 40);
p.strokeWeight(0.5);
cnv.drawingContext.setLineDash([5, 10]);
p.line(100,p.height/2,beamLength+100,p.height/2);
p.textSize(16); p.fill(0); p.textStyle(p.BOLD);
p.text("A",85,p.height/2+5);
p.text("B",100+beamLength+2,p.height/2+5);
p.pop();

// Draw Dimensions
p.push();
p.strokeWeight(0.5);
if (forcePosition>10 && p.abs(forceMagnitude)) {
  drawDimension(100,beamTop,forcePosition+95,beamTop,3)
  p.text("a",forcePosition/2+95,beamTop-10) 
}
if (momentPosition>10 && p.abs(momentMagnitude)) {
  drawDimension(100,beamMid+10,momentPosition+95,beamMid+10,3);
  p.text("b",momentPosition/2+95,beamMid-5) 
}
p.strokeWeight(1); p.textSize(14);
drawDimension(100,beamBot+100,beamLength+100,beamBot+100,3)
p.text("L = 400 [mm]",beamLength/2+65,beamBot+90) 
p.pop();


//draw constraints
p.push();
p.stroke(0); p.fill(0); p.strokeWeight(2);
p.triangle(100,beamBot-70,110,beamBot-50,90,beamBot-50);
p.circle(500,beamBot-60,20); p.line(520,beamBot-50,480,beamBot-50);
p.pop();

//draw active loads
p.push();
p.textSize(16);
p.fill("blue")
drawForceVector(forcePosition+100, beamTop, forceMagnitude, forceAngle,"blue",2)
if (p.abs(forceMagnitude)>0) {
   p.text("F", forcePosition-5+100, beamTop-p.abs(forceMagnitude)-5);
}
drawMoment(momentPosition+100,beamMid,momentMagnitude,"blue",2);
if (p.abs(momentMagnitude)>0) {
  p.text("M", momentPosition+95, beamMid -5);
 }
p.pop();


//calculate and draw reactive loads
By=(-forceMagnitude*forcePosition/beamLength-momentMagnitude*1000/beamLength);
Ay=-forceMagnitude-By;
p.push();
p.textSize(16);
p.fill("red")
drawForceVector(100, beamBot, Ay, forceAngle,"red",2)
p.text("Ay = " + p.abs(Ay) + "[N]", -50+100, beamBot+50);
drawForceVector(500, beamBot, By, forceAngle,"red",2)
p.text("By = " + p.abs(By) + "[N]", -50+500, beamBot+50);
p.pop();

  };

  // You can also declare other functions and use them in setup() or draw()
function drawMoment(x,y,magn,col,strokeW) {
// Draw the arc of the circle
p.push();
  p.noFill(); p.stroke(col); p.strokeWeight(strokeW)

  let radius = 50;
  let startAngle = -p.abs(magn)*p.HALF_PI/10;
  let endAngle = p.abs(magn)*p.HALF_PI/10;

  p.translate(x,y)
  //draw point of application
  p.push();
    p.strokeWeight(4);
    p.point(0,0);
  p.pop();
  //draw arc
  p.arc(0, 0, radius, radius, startAngle, endAngle);

  if (magn<0) {
  // Calculate the coordinates of the arrowhead END
  let arrowheadEndX = radius/2 * p.cos(endAngle);
  let arrowheadEndY = radius/2 * p.sin(endAngle);
  // Draw the arrowhead END
  p.push();
    p.translate(arrowheadEndX,arrowheadEndY);
    p.rotate(endAngle+p.HALF_PI-0.2);
    p.fill(col);
    p.triangle(0,0,-10,5,-10,-5);
  p.pop();
  } if (magn>0) {
  // Calculate the coordinates of the arrowhead START
  let arrowheadStartX = radius/2 * p.cos(startAngle);
  let arrowheadStartY = radius/2 * p.sin(startAngle);
  // Draw the arrowhead START
  p.push();
    p.translate(arrowheadStartX,arrowheadStartY);
    p.rotate(startAngle-p.HALF_PI+0.2);
    p.fill(col);
    p.triangle(0,0,-10,5,-10,-5);
  p.pop();
}

p.pop();

}

function drawForceVector(x, y, magn, angle, col, strokeW) {
p.angleMode(p.DEGREES)
p.push(); // Save current drawing state

// Move origin to arrow's tip
p.translate(x, y);

// Rotate the canvas
p.rotate(angle);

// Set color, stroke weight and fill
p.stroke(col);
p.strokeWeight(strokeW);
p.fill(col);

// Draw arrow's line
p.line(0, 0, -p.abs(magn), 0);

// Draw arrowhead
let arrowheadSize = 10; // You can adjust the size of the arrowhead
if (magn<0) {
  p.triangle(0,0,-arrowheadSize,arrowheadSize/2,-arrowheadSize,-arrowheadSize/2);
}
if (magn>0){
  p.triangle(-p.abs(magn),0,-p.abs(magn)+arrowheadSize,arrowheadSize/2,-p.abs(magn)+arrowheadSize,-arrowheadSize/2);
}

p.pop(); // Restore original drawing state
p.angleMode(p.RADIANS)
}

function drawDimension(x1,y1,x2,y2,arrowSize) {

let angle = p.atan2(y2 - y1, x2 - x1);

p.line(x1,y1,x2,y2);

p.push();
  p.translate(x1, y1);
  p.rotate(angle+p.PI);
  p.line(-arrowSize, -arrowSize, 0, 0);
  p.line(-arrowSize, arrowSize, 0, 0);
p.pop();

p.push();
  p.translate(x2, y2);
  p.rotate(angle);
  p.line(-arrowSize, -arrowSize, 0, 0);
  p.line(-arrowSize, arrowSize, 0, 0);
p.pop();
}
};

let sketch2 = function(p) {  // p is the instance of p5.js
  // Declare any variables you need here
let cnv
// Variables for beam length, force, andent
let beamLength = 400;
let forcePosition = 200;
let forceMagnitude = -50;
let forceAngle=90;
let momentPosition = 250;
let momentMagnitude = 0;

let forcePositionSlider, forceMagnitudeSlider, momentPositionSlider, momentMagnitudeSlider;

  p.setup = function() {
      // Setup your sketch here
      cnv=p.createCanvas(600, 600);

// Create sliders for customizing values
forcePositionSlider = p.createSlider(0, beamLength, forcePosition,10);
forcePositionSlider.position(200, 35);

forceMagnitudeSlider = p.createSlider(-80,80,forceMagnitude,10);  
forceMagnitudeSlider.position(10, 35);

//forceAngleSlider = createSlider(0,180,forceAngle,5);  
//forceAngleSlider.position(400, 35);

momentPositionSlider = p.createSlider(0, beamLength, momentPosition,10);
momentPositionSlider.position(200, 85);

momentMagnitudeSlider = p.createSlider(-10,10,momentMagnitude,1);  
momentMagnitudeSlider.position(10, 85);

  };

  p.draw = function() {
      // Animate your sketch here
     p.background(255,245,190);


// Update variables with slider and input values
forcePosition = forcePositionSlider.value();
forceMagnitude = forceMagnitudeSlider.value();
//forceAngle = forceAngleSlider.value();
momentPosition = momentPositionSlider.value();
momentMagnitude = momentMagnitudeSlider.value();

//draw GUI
p.text("Force: " + forceMagnitude + " [N]", 10, 30); 
p.text("a = " + forcePosition + " [mm]", 210, 30);
//text("angle = " + forceAngle + " [deg]", 410,80);
p.text("Moment: " + momentMagnitude  + " [Nm]", 10, 80); 
p.text("b = " + momentPosition + " [mm]", 210,80);

// Draw the x-axis
p.line(500, 100, 550, 100);
p.text("x",555,105);
// Draw the y-axis
p.line(500, 100, 500, 50);
p.text("y",495,40);
// Draw the z-axis
drawMoment(500,100,1.5,"black",1,0)
p.text("z",475,75);

// Draw the beam
beamTop= p.height/2-30;
beamBot= p.height/2+90;
beamMid= p.height/2;
p.push();
p.fill(255);
p.strokeWeight(2);
p.rect(100, p.height / 2 - 20, beamLength, 40);
p.strokeWeight(0.5);
cnv.drawingContext.setLineDash([5, 10]);
p.line(100,p.height/2,beamLength+100,p.height/2);
p.textSize(16); p.fill(0); p.textStyle(p.BOLD);
p.text("A",89,p.height/2-45);
p.text("B",100+beamLength+2,p.height/2+5);
p.pop();

// Draw Dimensions
p.push();
p.strokeWeight(0.5);
if (forcePosition>10 && p.abs(forceMagnitude)) {
  drawDimension(100,beamTop,forcePosition+95,beamTop,3)
  p.text("a",forcePosition/2+95,beamTop-10) 
}
if (momentPosition>10 && p.abs(momentMagnitude)) {
  drawDimension(100,beamMid+10,momentPosition+95,beamMid+10,3);
  p.text("b",momentPosition/2+95,beamMid-5) 
}
p.strokeWeight(1); p.textSize(14);
drawDimension(100,beamBot+100,beamLength+100,beamBot+100,3)
p.text("L = 400 [mm]",beamLength/2+65,beamBot+90) 
p.pop();


//draw constraints
p.push();
p.stroke(0); p.fill(0); p.strokeWeight(2);
p.rect(100,beamBot-50,-10,-80);
p.pop();

//draw active loads
p.push();
p.textSize(16);
p.fill("blue")
drawForceVector(forcePosition+100, beamTop, forceMagnitude, forceAngle,"blue",2)
if (p.abs(forceMagnitude)>0) {
   p.text("F", forcePosition-5+100, beamTop-p.abs(forceMagnitude)-5);
}
drawMoment(momentPosition+100,beamMid,momentMagnitude/10,"blue",2,0);
if (p.abs(momentMagnitude)>0) {
  p.text("M", momentPosition+95, beamMid -5);
 }
p.pop();


//calculate and draw reactive loads
Ma=-(forceMagnitude*forcePosition/1000+momentMagnitude);
Ay=-forceMagnitude;
p.push();
p.textSize(16);
p.fill("red");
drawForceVector(100, beamBot, Ay, forceAngle,"red",2)
p.text("Ay = " + p.abs(Ay) + "[N]", -50+100, beamBot+50);
drawMoment(89, beamMid, Ma/35,"red",2,1)
p.text("Ma= " + p.round(p.abs(Ma),2) + "[Nm]", 0, beamTop-10);
p.pop();

  };

  // You can also declare other functions and use them in setup() or draw()
function drawMoment(x,y,magn,col,strokeW,isleft) {
// Draw the arc of the circle
p.push();
  p.noFill(); p.stroke(col); p.strokeWeight(strokeW)

  let radius = 50;
if (isleft==1) {
    startAngle = -p.abs(magn)*(p.HALF_PI)+p.PI;
    endAngle = p.abs(magn)*(p.HALF_PI)+p.PI; 
  } else {
    startAngle = -p.abs(magn)*p.HALF_PI;
    endAngle = p.abs(magn)*p.HALF_PI;  
  }

  p.translate(x,y)
  //draw point of application
  p.push();
    p.strokeWeight(4);
    p.point(0,0);
  p.pop();
  //draw arc
  p.arc(0, 0, radius, radius, startAngle, endAngle);

// --DEBUG--
//push(); 
//strokeWeight(10); 
//stroke("green"); 
//point(radius/2 * cos(startAngle),radius/2 * sin(startAngle)); 
//stroke("magenta"); 
//point(radius/2 * cos(endAngle),radius/2 * sin(endAngle)); 
//pop();

  if (magn<0) {
  // Calculate the coordinates of the arrowhead END
  let arrowheadEndX = radius/2 * p.cos(endAngle);
  let arrowheadEndY = radius/2 * p.sin(endAngle);
  // Draw the arrowhead END
  p.push();
    p.translate(arrowheadEndX,arrowheadEndY);
    p.rotate(endAngle+p.HALF_PI-0.2);
    p.fill(col);
    p.triangle(0,0,-10,5,-10,-5);
  p.pop();
  } if (magn>0) {
  // Calculate the coordinates of the arrowhead START
  let arrowheadStartX = radius/2 * p.cos(startAngle);
  let arrowheadStartY = radius/2 * p.sin(startAngle);
  // Draw the arrowhead START
  p.push();
    p.translate(arrowheadStartX,arrowheadStartY);
    p.rotate(startAngle-p.HALF_PI+0.2);
    p.fill(col);
    p.triangle(0,0,-10,5,-10,-5);
  p.pop();
}

p.pop();

}

function drawForceVector(x, y, magn, angle, col, strokeW) {
p.angleMode(p.DEGREES)
p.push(); // Save current drawing state

// Move origin to arrow's tip
p.translate(x, y);

// Rotate the canvas
p.rotate(angle);

// Set color, stroke weight and fill
p.stroke(col);
p.strokeWeight(strokeW);
p.fill(col);

// Draw arrow's line
p.line(0, 0, -p.abs(magn), 0);

// Draw arrowhead
let arrowheadSize = 10; // You can adjust the size of the arrowhead
if (magn<0) {
  p.triangle(0,0,-arrowheadSize,arrowheadSize/2,-arrowheadSize,-arrowheadSize/2);
}
if (magn>0){
  p.triangle(-p.abs(magn),0,-p.abs(magn)+arrowheadSize,arrowheadSize/2,-p.abs(magn)+arrowheadSize,-arrowheadSize/2);
}

p.pop(); // Restore original drawing state
p.angleMode(p.RADIANS)
}

function drawDimension(x1,y1,x2,y2,arrowSize) {

let angle = p.atan2(y2 - y1, x2 - x1);

p.line(x1,y1,x2,y2);

p.push();
  p.translate(x1, y1);
  p.rotate(angle+p.PI);
  p.line(-arrowSize, -arrowSize, 0, 0);
  p.line(-arrowSize, arrowSize, 0, 0);
p.pop();

p.push();
  p.translate(x2, y2);
  p.rotate(angle);
  p.line(-arrowSize, -arrowSize, 0, 0);
  p.line(-arrowSize, arrowSize, 0, 0);
p.pop();
}
};

let sketch3 = function(p) {  // p is the instance of p5.js
  // Declare any variables you need here
let cnv

//Global Variables
const L = 300; //beam length [mm]
let a = L/2; //force position
let F = -50; // force magnitude
let forceAngle=90; //force angle
let b = L; // moment position
let M = 0; // moment magnitude
let c = L/2; //distributed load starting position
let d = L; // distributed load final position
let q = 0; // distributed load magnitude

let aSlider, FSlider, bSlider, MSlider, qSlider, cSlider, dSlider;
  p.setup = function() {
      // Setup your sketch here
      cnv=p.createCanvas(600, 700);

// Create sliders for customizing values
aSlider = p.createSlider(0, L, a,10); //[mm]
aSlider.position(200, 15);

FSlider = p.createSlider(-80,80,F,10);  
FSlider.position(10, 15);

//forceAngleSlider = createSlider(0,180,forceAngle,5);  
//forceAngleSlider.position(400, 35);

bSlider = p.createSlider(0, L, b,10); //[mm]
bSlider.position(200, 65);

MSlider = p.createSlider(-10,10,M,1); //[mm]
MSlider.position(10, 65);

//cutPositionSlider = createSlider(0,L,100,1);  
//cutPositionSlider.position(10, 125);

qSlider= p.createSlider(-1,1,q,0.1);
qSlider.position(10,115)

cSlider= p.createSlider(0,L,c,10);
cSlider.position(200,115)

dSlider= p.createSlider(0,L,d,10);
dSlider.position(410,115)

  };

  p.draw = function() {
      // Animate your sketch here
      const beamPositionX = 150;
const beamPositionY = 230;
const beamWidth = 40;

//sand colour background
p.background(255,245,190);


// Update variables with slider and input values
a = aSlider.value();
F = FSlider.value();
//forceAngle = forceAngleSlider.value();
b = bSlider.value();
M = MSlider.value();
//cutPosition = cutPositionSlider.value();
c = cSlider.value();
if (dSlider.value() < cSlider.value()) { 
  dSlider.value(cSlider.value());
}
d = dSlider.value();
q = qSlider.value();

//draw GUI
p.text("F = " + F + " [N]", 10, 15); 
p.text("a = " + a + " [mm]", 210, 15);
//text("angle = " + forceAngle + " [deg]", 410,80);
p.text("M = " + M  + " [Nm]", 10, 65); 
p.text("b = " + b + " [mm]", 210,65);
//text("Cut at: " + cutPosition  + " [mm]", 10, 125); 
p.text("q = " + q  + " [N/mm]", 10, 115); 
p.text("c = " + c  + " [mm]", 210, 115); 
p.text("d = " + d  + " [mm]", 410, 115); 

// Draw the x-axis
p.push();
p.translate(500,70);
p.line(0, 0, 50, 0);
p.text("x",55,5);
// Draw the y-axis
p.line(0, 0, 0, -50);
p.text("y",-5,-55);
// Draw the z-axis
drawMoment(0,0,1.5,"black",1,0)
p.text("z",-25,-25);
p.pop();

// Draw the beam
beamTop= beamPositionY-beamWidth/2;
beamBot= beamPositionY+beamWidth/2;
beamMid= beamPositionY;
p.push();
p.fill(255,0);
p.strokeWeight(2);
p.rect(beamPositionX,beamTop,L,beamWidth);
p.strokeWeight(0.5);
cnv.drawingContext.setLineDash([5, 10]);
p.line(beamPositionX,beamPositionY,beamPositionX+L,beamPositionY);
p.textSize(16); p.fill(0); p.textStyle(p.BOLD);
p.pop();

// Draw Dimensions
p.push();
p.strokeWeight(0.5);
if (a>10 && p.abs(F)) {
  drawDimension(beamPositionX,beamTop-20,beamPositionX+a-5,beamTop-20,3);
  p.text("a",beamPositionX+a/2-5,beamTop-25); 
}
if (b>10 && p.abs(M)) {
  drawDimension(beamPositionX,beamMid+10,beamPositionX+b-5,beamMid+10,3);
  p.text("b",beamPositionX+b/2-5,beamMid-5) 
}
if (c>10 && p.abs(q) && d>c) {
  drawDimension(beamPositionX,beamTop-50,beamPositionX+c-5,beamTop-50,3);
  p.text("c",beamPositionX+c/2-5,beamTop-55);
  drawDimension(beamPositionX,beamTop-60,beamPositionX+d-5,beamTop-60,3);
  p.text("d",beamPositionX+d/2-5,beamTop-65);
}
p.strokeWeight(1); p.textSize(14);
drawDimension(beamPositionX,beamBot+20,beamPositionX+L,beamBot+20,3)
p.text("L = 300 [mm]",beamPositionX+L/2-35,beamBot+35) 
p.pop();


 //draw constraints
p.push();
p.stroke(0); p.fill(0); p.strokeWeight(2);
p.triangle(beamPositionX,beamBot,beamPositionX+10,beamBot+20,beamPositionX-10,beamBot+20);
p.circle(beamPositionX+L,beamBot+10,20); 
p.line(beamPositionX+L-20,beamBot+20,beamPositionX+L+20,beamBot+20);
p.pop();

//draw active loads
p.push();
p.textSize(16);
p.fill("blue")
drawForceVector(beamPositionX+a, beamTop-5, F, forceAngle,"blue",2)
if (p.abs(F)>0) {
   p.text("F", beamPositionX+a-5, beamTop-p.abs(F)-10);
}
drawMoment(beamPositionX+b,beamMid,M/10,"blue",2,0);
if (p.abs(M)>0) {
  p.text("M", beamPositionX+b, beamMid -5);
 }
drawDistribution(beamPositionX+c,beamTop-5,beamPositionX+d,q*40,90,"blue",1);
if (p.abs(q)>0 && c<d) {
  p.text("q", beamPositionX+(c+d)/2, beamTop-30);
 }
p.pop();


//calculate and draw reactive loads
By=-(F*a+M*1000+q/2*(d-c)*(d-c)+q*c*(d-c))/L; //[N]
Ay=-(By+F+q*(d-c)); //[N]
p.push();
p.textSize(16);
p.fill("red");

    drawForceVector(beamPositionX-5, beamBot+5, Ay, forceAngle,"red",2)
p.text("Ay = " + p.abs(p.round(Ay,1)) + "[N]", beamPositionX-50, beamBot+50);

    
    drawForceVector(beamPositionX+L+5, beamBot+5, By, forceAngle,"red",2)
p.text("By = " + p.abs(p.round(By,1)) + "[N]", beamPositionX+L-50, beamBot+50); 
p.pop();

//DRAW INTERNAL LOADS
originX=beamPositionX;
originY=beamPositionY+250;
p.push();
p.strokeWeight(2);
p.line(beamPositionX-50,originY,500,originY); //x-axis
p.line(beamPositionX,originY+100,beamPositionX,originY-150); //y-axis
p.textSize(16); p.textStyle(p.BOLD)
p.text("0",originX-12,originY+14)
p.text("L",originX+L+3,originY+14)
p.fill("green");
p.text("V(x)",originX-35,originY-150)
p.fill("red");
p.text("M(x)",originX-38,originY-130)
p.strokeWeight(0.5)
p.line(originX+L,originY+100,beamPositionX+L,originY-150); //end of line at L
cnv.drawingContext.setLineDash([5, 10]);
if (p.abs(F)>0) {
  p.line(originX+a,originY+100,originX+a,originY-150); //cut at a
}
if (p.abs(M)>0) {
  p.line(originX+b,originY+100,originX+b,originY-150); //cut at b
}
if (p.abs(q)>0 && c<d) {
  p.line(originX+c,originY+100,originX+c,originY-150); //cut at c
  p.line(originX+d,originY+100,originX+d,originY-150); //cut at d
}
p.pop();
//SFD
p.push();
p.stroke("green");
p.strokeWeight(3);
myPlot(originX,originY,0,L,SFD);
p.pop();
//BMD
p.push();
p.stroke("red");
p.strokeWeight(3); p.noFill();
myPlot(originX,originY,0,L,BMD);
p.pop();
  };

  // You can also declare other functions and use them in setup() or draw()
function SFD(x) {
//[N]
return Ay*singFun(x,0,0)+F*singFun(x,a,0)+q*singFun(x,c,1)-q*singFun(x,d,1);
}

function BMD(x) {
//[Nm]
ysf=10; //vertical scale factor
msf=10; //Moments scale factor
return ysf*Ay*singFun(x,0,1)/1000 + ysf*F*singFun(x,a,1)/1000 + ysf*q*singFun(x,c,2)/2/1000 - ysf*q*singFun(x,d,2)/2/1000 - msf*M*singFun(x,b,0);
}

function drawMoment(x,y,magn,col,strokeW,isleft) {
// Draw the arc of the circle
p.push();
  p.noFill(); p.stroke(col); p.strokeWeight(strokeW)

  let radius = 50;
if (isleft==1) {
    startAngle = -p.abs(magn)*(p.HALF_PI)+p.PI;
    endAngle = p.abs(magn)*(p.HALF_PI)+p.PI; 
  } else {
    startAngle = -p.abs(magn)*p.HALF_PI;
    endAngle = p.abs(magn)*p.HALF_PI;  
  }

  p.translate(x,y)
  //draw point of application
  p.push();
    p.strokeWeight(4);
    p.point(0,0);
  p.pop();
  //draw arc
  p.arc(0, 0, radius, radius, startAngle, endAngle);

// --DEBUG--
//push(); 
//strokeWeight(10); 
//stroke("green"); 
//point(radius/2 * cos(startAngle),radius/2 * sin(startAngle)); 
//stroke("magenta"); 
//point(radius/2 * cos(endAngle),radius/2 * sin(endAngle)); 
//pop();

  if (magn<0) {
  // Calculate the coordinates of the arrowhead END
  let arrowheadEndX = radius/2 * p.cos(endAngle);
  let arrowheadEndY = radius/2 * p.sin(endAngle);
  // Draw the arrowhead END
  p.push();
    p.translate(arrowheadEndX,arrowheadEndY);
    p.rotate(endAngle+p.HALF_PI-0.2);
    p.fill(col);
    p.triangle(0,0,-10,5,-10,-5);
  p.pop();
  } if (magn>0) {
  // Calculate the coordinates of the arrowhead START
  let arrowheadStartX = radius/2 * p.cos(startAngle);
  let arrowheadStartY = radius/2 * p.sin(startAngle);
  // Draw the arrowhead START
  p.push();
    p.translate(arrowheadStartX,arrowheadStartY);
    p.rotate(startAngle-p.HALF_PI+0.2);
    p.fill(col);
    p.triangle(0,0,-10,5,-10,-5);
  p.pop();
}

p.pop();

}

function drawForceVector(x, y, magn, angle, col, strokeW) {
p.angleMode(p.DEGREES)
p.push(); // Save current drawing state

// Move origin to arrow's tip
p.translate(x, y);

// Rotate the canvas
p.rotate(angle);

// Set color, stroke weight and fill
p.stroke(col);
p.strokeWeight(strokeW);
p.fill(col);

// Draw arrow's line
p.line(0, 0, -p.abs(magn), 0);

// Draw arrowhead
let arrowheadSize = 10; // You can adjust the size of the arrowhead
if (magn<0) {
  p.triangle(0,0,-arrowheadSize,arrowheadSize/2,-arrowheadSize,-arrowheadSize/2);
}
if (magn>0){
  p.triangle(-p.abs(magn),0,-p.abs(magn)+arrowheadSize,arrowheadSize/2,-p.abs(magn)+arrowheadSize,-arrowheadSize/2);
}

p.pop(); // Restore original drawing state
p.angleMode(p.RADIANS)
}

function drawDimension(x1,y1,x2,y2,arrowSize) {

let angle = p.atan2(y2 - y1, x2 - x1);

p.line(x1,y1,x2,y2);

p.push();
  p.translate(x1, y1);
  p.rotate(angle+p.PI);
  p.line(-arrowSize, -arrowSize, 0, 0);
  p.line(-arrowSize, arrowSize, 0, 0);
p.pop();

p.push();
  p.translate(x2, y2);
  p.rotate(angle);
  p.line(-arrowSize, -arrowSize, 0, 0);
  p.line(-arrowSize, arrowSize, 0, 0);
p.pop();
}

function drawDistribution(x,y,wid,magn,angle,col,strokeW) {
if (wid<=x) { return }
p.angleMode(p.DEGREES)
p.push(); // Save current drawing state

// Move origin to arrow's tip
p.translate(x, y);

// Rotate the canvas
p.rotate(angle);

// Set color, stroke weight and fill
p.stroke(col);
p.strokeWeight(strokeW);
p.fill(col);


for (let i = x; i <= wid; i+=10) {
  
  // Draw arrowheads (start and end)
  if ( i==x || i==wid ) {
    p.strokeWeight(strokeW+0.5)// Draw arrow's lines 
    let ahSize = 8; // You can adjust the size of the arrowhead
    if (magn<0) {
      p.triangle(0,x-i,-ahSize,x-i+ahSize/2,-ahSize,x-i-ahSize/2);
    }
    if (magn>0){
      p.triangle(-p.abs(magn),x-i,-p.abs(magn)+ahSize,x-i+ahSize/2,-p.abs(magn)+ahSize,x-i-ahSize/2);
    }
  } else {
    p.strokeWeight(strokeW)
  }
p.line(0, x-i, -p.abs(magn),x-i);
}


p.strokeWeight(strokeW+0.5)
p.line(-p.abs(magn), 0, -p.abs(magn) ,x-wid);

p.pop(); // Restore original drawing state
p.angleMode(p.RADIANS)
}

function myPlot(originX,originY,xi,xf,f) {
//xi: x_initial
//xf: x_final
//f: function of single variable f(x)

// Move the origin
p.translate(originX, originY);

// Loop over horizontal pixels
p.noFill();
p.strokeCap(p.ROUND);
p.strokeJoin(p.ROUND);
p.beginShape();
for (let x = xi; x < xf; x++) {
  let y = f(x) ;  // scale for visibility
  // Check if y is a finite number
  if (isFinite(y)) {
    //point(x, -y);  // minus y because the y-axis is flipped in p5
    p.vertex(x,-y);
  }
}
p.endShape();
}

function singFun(x,a,n) {
//singularity function <x-a>^n
if (x>=a) {
  return Math.pow((x-a),n);
} else {
  return 0
}


}
};

let sketch4 = function(p) {  // p is the instance of p5.js
  // Declare any variables you need here
let cnv

//Global Variables
const L = 300; //beam length [mm]
let a = L; //force position
let F = -50; // force magnitude
let forceAngle=90; //force angle
let b = L; // moment position
let M = 0; // moment magnitude
let c = L/2; //distributed load starting position
let d = L; // distributed load final position
let q = 0; // distributed load magnitude

let aSlider, FSlider, bSlider, MSlider, qSlider, cSlider, dSlider;
  p.setup = function() {
      // Setup your sketch here
      cnv=p.createCanvas(600, 700);

// Create sliders for customizing values
aSlider = p.createSlider(0, L, a,10); //[mm]
aSlider.position(200, 15);

FSlider = p.createSlider(-80,80,F,10);  
FSlider.position(10, 15);

//forceAngleSlider = createSlider(0,180,forceAngle,5);  
//forceAngleSlider.position(400, 35);

bSlider = p.createSlider(0, L, b,10); //[mm]
bSlider.position(200, 65);

MSlider = p.createSlider(-10,10,M,1); //[mm]
MSlider.position(10, 65);

//cutPositionSlider = createSlider(0,L,100,1);  
//cutPositionSlider.position(10, 125);

qSlider= p.createSlider(-1,1,q,0.1);
qSlider.position(10,115)

cSlider= p.createSlider(0,L,c,10);
cSlider.position(200,115)

dSlider= p.createSlider(0,L,d,10);
dSlider.position(410,115)

  };

  p.draw = function() {
      // Animate your sketch here
      const beamPositionX = 150;
const beamPositionY = 230;
const beamWidth = 40;

//sand colour background
p.background(255,245,190);


// Update variables with slider and input values
a = aSlider.value();
F = FSlider.value();
//forceAngle = forceAngleSlider.value();
b = bSlider.value();
M = MSlider.value();
//cutPosition = cutPositionSlider.value();
c = cSlider.value();
if (dSlider.value() < cSlider.value()) { 
  dSlider.value(cSlider.value());
}
d = dSlider.value();
q = qSlider.value();

//draw GUI
p.text("F = " + F + " [N]", 10, 15); 
p.text("a = " + a + " [mm]", 210, 15);
//text("angle = " + forceAngle + " [deg]", 410,80);
p.text("M = " + M  + " [Nm]", 10, 65); 
p.text("b = " + b + " [mm]", 210,65);
//text("Cut at: " + cutPosition  + " [mm]", 10, 125); 
p.text("q = " + q  + " [N/mm]", 10, 115); 
p.text("c = " + c  + " [mm]", 210, 115); 
p.text("d = " + d  + " [mm]", 410, 115); 

// Draw the x-axis
p.push();
p.translate(500,70);
p.line(0, 0, 50, 0);
p.text("x",55,5);
// Draw the y-axis
p.line(0, 0, 0, -50);
p.text("y",-5,-55);
// Draw the z-axis
drawMoment(0,0,1.5,"black",1,0)
p.text("z",-25,-25);
p.pop();

// Draw the beam
beamTop= beamPositionY-beamWidth/2;
beamBot= beamPositionY+beamWidth/2;
beamMid= beamPositionY;
p.push();
p.fill(255,0);
p.strokeWeight(2);
p.rect(beamPositionX,beamTop,L,beamWidth);
p.strokeWeight(0.5);
cnv.drawingContext.setLineDash([5, 10]);
p.line(beamPositionX,beamPositionY,beamPositionX+L,beamPositionY);
p.textSize(16); p.fill(0); p.textStyle(p.BOLD);
p.pop();

// Draw Dimensions
p.push();
p.strokeWeight(0.5);
if (a>10 && p.abs(F)) {
  drawDimension(beamPositionX,beamTop-20,beamPositionX+a-5,beamTop-20,3);
  p.text("a",beamPositionX+a/2-5,beamTop-25); 
}
if (b>10 && p.abs(M)) {
  drawDimension(beamPositionX,beamMid+10,beamPositionX+b-5,beamMid+10,3);
  p.text("b",beamPositionX+b/2-5,beamMid-5) 
}
if (c>10 && p.abs(q) && d>c) {
  drawDimension(beamPositionX,beamTop-50,beamPositionX+c-5,beamTop-50,3);
  p.text("c",beamPositionX+c/2-5,beamTop-55);
  drawDimension(beamPositionX,beamTop-60,beamPositionX+d-5,beamTop-60,3);
  p.text("d",beamPositionX+d/2-5,beamTop-65);
}
p.strokeWeight(1); p.textSize(14);
drawDimension(beamPositionX,beamBot+20,beamPositionX+L,beamBot+20,3)
p.text("L = 300 [mm]",beamPositionX+L/2-35,beamBot+35) 
p.pop();


//draw constraints
p.push();
p.stroke(0); p.fill(0); p.strokeWeight(2);
p.rect(beamPositionX,beamTop-10,-10,beamWidth+20);
p.pop();

//draw active loads
p.push();
p.textSize(16);
p.fill("blue")
drawForceVector(beamPositionX+a, beamTop-5, F, forceAngle,"blue",2)
if (p.abs(F)>0) {
   p.text("F", beamPositionX+a-5, beamTop-p.abs(F)-10);
}
drawMoment(beamPositionX+b,beamMid,M/10,"blue",2,0);
if (p.abs(M)>0) {
  p.text("M", beamPositionX+b, beamMid -5);
 }
drawDistribution(beamPositionX+c,beamTop-5,beamPositionX+d,q*40,90,"blue",1);
if (p.abs(q)>0 && c<d) {
  p.text("q", beamPositionX+(c+d)/2, beamTop-30);
 }
p.pop();


//calculate and draw reactive loads
Ma=-(F*a/1000+M+q*(d-c)*(c+d)/2000); //[Nm]
Ay=-(F+q*(d-c)); //[N]
p.push();
p.textSize(16);
p.fill("red");
drawForceVector(beamPositionX-5, beamBot+5, Ay/2, forceAngle,"red",2)
p.text("Ay = " + p.abs(Ay) + "[N]", beamPositionX-50, beamBot+50);
drawMoment(beamPositionX-5, beamMid, Ma/35,"red",2,1)
p.text("Ma= " + p.round(p.abs(Ma),2) + "[Nm]", beamPositionX-110, beamTop-10);
p.pop();

//DRAW INTERNAL LOADS
originX=beamPositionX;
originY=beamPositionY+250;
p.push();
p.strokeWeight(2);
p.line(beamPositionX-50,originY,500,originY); //x-axis
p.line(beamPositionX,originY+100,beamPositionX,originY-150); //y-axis
p.textSize(16); p.textStyle(p.BOLD)
p.text("0",originX-12,originY+14)
p.text("L",originX+L+3,originY+14)
p.fill("green");
p.text("V(x)",originX-35,originY-150)
p.fill("red");
p.text("M(x)",originX-38,originY-130)
p.strokeWeight(0.5)
p.line(originX+L,originY+100,beamPositionX+L,originY-150); //end of line at L
cnv.drawingContext.setLineDash([5, 10]);
if (p.abs(F)>0) {
  p.line(originX+a,originY+100,originX+a,originY-150); //cut at a
}
if (p.abs(M)>0) {
  p.line(originX+b,originY+100,originX+b,originY-150); //cut at b
}
if (p.abs(q)>0 && c<d) {
  p.line(originX+c,originY+100,originX+c,originY-150); //cut at c
  p.line(originX+d,originY+100,originX+d,originY-150); //cut at d
}
p.pop();
//SFD
p.push();
p.stroke("green");
p.strokeWeight(3);
myPlot(originX,originY,0,L,SFD);
p.pop();
//BMD
p.push();
p.stroke("red");
p.strokeWeight(3); p.noFill();
myPlot(originX,originY,0,L,BMD);
p.pop();
  };

  // You can also declare other functions and use them in setup() or draw()
function SFD(x) {
//[N]
return Ay*singFun(x,0,0)+F*singFun(x,a,0)+q*singFun(x,c,1)-q*singFun(x,d,1);
}

function BMD(x) {
//[Nm]
ysf=10; //vertical scale factor
msf=10; //Moments scale factor
return -msf*Ma*singFun(x,0,0) + ysf*Ay*singFun(x,0,1)/1000 + ysf*F*singFun(x,a,1)/1000 + ysf*q*singFun(x,c,2)/2/1000 - ysf*q*singFun(x,d,2)/2/1000 - msf*M*singFun(x,b,0);
}

function drawMoment(x,y,magn,col,strokeW,isleft) {
// Draw the arc of the circle
p.push();
  p.noFill(); p.stroke(col); p.strokeWeight(strokeW)

  let radius = 50;
if (isleft==1) {
    startAngle = -p.abs(magn)*(p.HALF_PI)+p.PI;
    endAngle = p.abs(magn)*(p.HALF_PI)+p.PI; 
  } else {
    startAngle = -p.abs(magn)*p.HALF_PI;
    endAngle = p.abs(magn)*p.HALF_PI;  
  }

  p.translate(x,y)
  //draw point of application
  p.push();
    p.strokeWeight(4);
    p.point(0,0);
  p.pop();
  //draw arc
  p.arc(0, 0, radius, radius, startAngle, endAngle);

// --DEBUG--
//push(); 
//strokeWeight(10); 
//stroke("green"); 
//point(radius/2 * cos(startAngle),radius/2 * sin(startAngle)); 
//stroke("magenta"); 
//point(radius/2 * cos(endAngle),radius/2 * sin(endAngle)); 
//pop();

  if (magn<0) {
  // Calculate the coordinates of the arrowhead END
  let arrowheadEndX = radius/2 * p.cos(endAngle);
  let arrowheadEndY = radius/2 * p.sin(endAngle);
  // Draw the arrowhead END
  p.push();
    p.translate(arrowheadEndX,arrowheadEndY);
    p.rotate(endAngle+p.HALF_PI-0.2);
    p.fill(col);
    p.triangle(0,0,-10,5,-10,-5);
  p.pop();
  } if (magn>0) {
  // Calculate the coordinates of the arrowhead START
  let arrowheadStartX = radius/2 * p.cos(startAngle);
  let arrowheadStartY = radius/2 * p.sin(startAngle);
  // Draw the arrowhead START
  p.push();
    p.translate(arrowheadStartX,arrowheadStartY);
    p.rotate(startAngle-p.HALF_PI+0.2);
    p.fill(col);
    p.triangle(0,0,-10,5,-10,-5);
  p.pop();
}

p.pop();

}

function drawForceVector(x, y, magn, angle, col, strokeW) {
p.angleMode(p.DEGREES)
p.push(); // Save current drawing state

// Move origin to arrow's tip
p.translate(x, y);

// Rotate the canvas
p.rotate(angle);

// Set color, stroke weight and fill
p.stroke(col);
p.strokeWeight(strokeW);
p.fill(col);

// Draw arrow's line
p.line(0, 0, -p.abs(magn), 0);

// Draw arrowhead
let arrowheadSize = 10; // You can adjust the size of the arrowhead
if (magn<0) {
  p.triangle(0,0,-arrowheadSize,arrowheadSize/2,-arrowheadSize,-arrowheadSize/2);
}
if (magn>0){
  p.triangle(-p.abs(magn),0,-p.abs(magn)+arrowheadSize,arrowheadSize/2,-p.abs(magn)+arrowheadSize,-arrowheadSize/2);
}

p.pop(); // Restore original drawing state
p.angleMode(p.RADIANS)
}

function drawDimension(x1,y1,x2,y2,arrowSize) {

let angle = p.atan2(y2 - y1, x2 - x1);

p.line(x1,y1,x2,y2);

p.push();
  p.translate(x1, y1);
  p.rotate(angle+p.PI);
  p.line(-arrowSize, -arrowSize, 0, 0);
  p.line(-arrowSize, arrowSize, 0, 0);
p.pop();

p.push();
  p.translate(x2, y2);
  p.rotate(angle);
  p.line(-arrowSize, -arrowSize, 0, 0);
  p.line(-arrowSize, arrowSize, 0, 0);
p.pop();
}

function drawDistribution(x,y,wid,magn,angle,col,strokeW) {
if (wid<=x) { return }
p.angleMode(p.DEGREES)
p.push(); // Save current drawing state

// Move origin to arrow's tip
p.translate(x, y);

// Rotate the canvas
p.rotate(angle);

// Set color, stroke weight and fill
p.stroke(col);
p.strokeWeight(strokeW);
p.fill(col);


for (let i = x; i <= wid; i+=10) {
  
  // Draw arrowheads (start and end)
  if ( i==x || i==wid ) {
    p.strokeWeight(strokeW+0.5)// Draw arrow's lines 
    let ahSize = 8; // You can adjust the size of the arrowhead
    if (magn<0) {
      p.triangle(0,x-i,-ahSize,x-i+ahSize/2,-ahSize,x-i-ahSize/2);
    }
    if (magn>0){
      p.triangle(-p.abs(magn),x-i,-p.abs(magn)+ahSize,x-i+ahSize/2,-p.abs(magn)+ahSize,x-i-ahSize/2);
    }
  } else {
    p.strokeWeight(strokeW)
  }
p.line(0, x-i, -p.abs(magn),x-i);
}


p.strokeWeight(strokeW+0.5)
p.line(-p.abs(magn), 0, -p.abs(magn) ,x-wid);

p.pop(); // Restore original drawing state
p.angleMode(p.RADIANS)
}

function myPlot(originX,originY,xi,xf,f) {
//xi: x_initial
//xf: x_final
//f: function of single variable f(x)

// Move the origin
p.translate(originX, originY);

// Loop over horizontal pixels
p.noFill();
p.strokeCap(p.ROUND);
p.strokeJoin(p.ROUND);
p.beginShape();
for (let x = xi; x < xf; x++) {
  let y = f(x) ;  // scale for visibility
  // Check if y is a finite number
  if (isFinite(y)) {
    //point(x, -y);  // minus y because the y-axis is flipped in p5
    p.vertex(x,-y);
  }
}
p.endShape();
}

function singFun(x,a,n) {
//singularity function <x-a>^n
if (x>=a) {
  return Math.pow((x-a),n);
} else {
  return 0
}


}
}









