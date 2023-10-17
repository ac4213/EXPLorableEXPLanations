var cnv, cnvx, cnvy; //canvas variables
var bgdRGB = [200,200,200]; //[85, 140, 137]; //background color
var sliders=[]; //sliders is an array of slider objects
var Yspacing, sliderpos = 20;
var figura = []; //figura is an array of shapes objects
var ctroid;
var absx=630, absy=50;
var tflangew=100, tflangeh=30;
var webt=20, webh=150;
var bflangew=200, bflangeh=30;
var uppEQ, midEQ, lowEQ, resEQ;

function setup() {
  cnv = createCanvas(800, 500);
  cnv.parent('sketch-holder');
  cnvx = cnv.position().x;
  cnvy = cnv.position().y;
  background(bgdRGB[0], bgdRGB[1], bgdRGB[2]);
  //--------------INPUTS------------------------
  var FontSize = "12px";
  var InputPos = [cnvx + 0.1 * width, cnvy + 0.60 * height];
  var InputWidth = 0.50 * width;
  Yspacing = 0.055 * height;
  var InpSize = 45; //pixels
  
  //crea la figura
  figura.push(new RectShape(absx,absy,tflangew,tflangeh,[255,0,0]));
  figura.push(new RectShape(absx,absy+tflangeh/2+webh/2,webt,webh,[0,255,0]));
  figura.push(new RectShape(absx,absy+webh+tflangeh,bflangew,bflangeh,[0,0,255]));

  //crea sliders
  sliders.push(createSlider(20,300,tflangew,10));
  sliders[0].position(sliderpos,cnvy+absy);
  sliders[0].style('width', 200+'px');
  sliders[0].input(slidercallback);

  sliders.push(createSlider(20,300,bflangew,10));
  sliders[1].position(sliderpos,cnvy+absy+webh+tflangeh);
  sliders[1].style('width', 200+'px');
  sliders[1].input(slidercallback);

  //crea equations
  uppEQ = document.createElement('div');
  uppEQ.id="equazione";
  uppEQ.style.position = 'absolute';
  uppEQ.style.left =(sliders[0].x+sliders[0].width+100) + 'px';
  uppEQ.style.top = (cnvy + figura[0].yc-60) + 'px';
  uppEQ.style.textAlign="center";
  uppEQ.style.color = 'red';
  document.body.appendChild(uppEQ);
  
  midEQ = document.createElement('div');
  midEQ.id="equazione";
  midEQ.style.position = 'absolute';
  midEQ.style.left =(sliders[0].x+sliders[0].width+100) + 'px';
  midEQ.style.top = (cnvy + figura[1].yc-60) + 'px';
  midEQ.style.textAlign="center";
  midEQ.style.color = 'green';
  document.body.appendChild(midEQ);
  
  lowEQ = document.createElement('div');
  lowEQ.id="equazione";
  lowEQ.style.position = 'absolute';
  lowEQ.style.left =(sliders[0].x+sliders[0].width+100) + 'px';
  lowEQ.style.top = (cnvy + figura[2].yc-60) + 'px';
  lowEQ.style.textAlign="center";
  lowEQ.style.color = 'blue';
  document.body.appendChild(lowEQ);
  
  resEQ = document.createElement('div');
  resEQ.id="equazione";
  resEQ.style.position = 'absolute';
  resEQ.style.left =(sliders[0].x+sliders[0].width+100) + 'px';
  resEQ.style.top = (cnvy + figura[2].yc-60+80) + 'px';
  resEQ.style.textAlign="center";
  resEQ.style.color = 'black';
  document.body.appendChild(resEQ);

  genEQ = document.createElement('div');
  genEQ.id="equazione";
  genEQ.style.position = 'absolute';
  genEQ.style.left =(sliders[0].x) + 'px';
  genEQ.style.top = (cnvy + figura[2].yc+100) + 'px';
  genEQ.style.textAlign="center";
  genEQ.style.color = "#EEEEEE";
  document.body.appendChild(genEQ);

  uppEQ.innerHTML = " $$ I^{^{\(1\)}}_{xx}= \\frac{b_1h_1^3}{12} + A_1d_1^2 $$ ";
  midEQ.innerHTML = " $$ I^{^{\(2\)}}_{xx}= \\frac{b_2h_2^3}{12} + A_2d_2^2 $$ ";
  lowEQ.innerHTML = " $$ I^{^{\(3\)}}_{xx}= \\frac{b_3h_3^3}{12} + A_3d_3^2 $$ ";
  resEQ.innerHTML = " $$ I_{xx} = I^{^{\(1\)}}_{xx} + I^{^{\(2\)}}_{xx} + I^{^{\(3\)}}_{xx} $$ ";
  genEQ.innerHTML = " $$ y_c = \\frac{\\sum(A_i y_i)}{\\sum(A_i)} = \\frac{A_1y_1+A_2y_2+A_3y_3}{A_1+A_2+A_3} $$ ";
  
  
  MathJax.Hub.Queue(["Typeset",MathJax.Hub],"equazione");  

  //var fps = 60;
  //frameRate(fps);
  angleMode(DEGREES);
  noLoop();
  redraw();
}

function draw() {
  background(bgdRGB[0], bgdRGB[1], bgdRGB[2]); //clear background
  for (var ii=0; ii < figura.length; ii++) {
    figura[ii].display();
  }
  ctroid = centroid(figura);
  ellipse(ctroid.x,ctroid.y,5);
  drawArrow(ctroid.x,ctroid.y,ctroid.x+100,ctroid.y,[255,255,255]);  
  var Ixx = secmomarea(figura,ctroid.y);

  line(sliders[0].x+sliders[0].width+60,figura[2].yc+23,sliders[0].x+sliders[0].width+260,figura[2].yc+23)
  line(sliders[0].x+sliders[0].width+60,figura[2].yc+25,sliders[0].x+sliders[0].width+260,figura[2].yc+25)

  drawtext();
}

function centroid(figura) {
  var totarea = 0;
  var sum=0;
  for (var ii = 0; ii < figura.length; ii++) {
    totarea = totarea + figura[ii].Area;
    sum = sum + figura[ii].Area * figura[ii].yc; //sum(Ai*yci)
  }
  var yc = sum/totarea;
  var xc = figura[0].xc;

  var res = {
    x: xc,
    y: yc
  };
  return res;
}

function secmomarea(figura,theaxis) {
  var Ixx = 0;
  for (var ii = 0; ii < figura.length; ii++) {
    var d = (figura[ii].yc - theaxis);
    Ixx = Ixx + figura[ii].Ixc + figura[ii].Area * Math.pow(d, 2); //Ia=Ix+Ad^2
  }
  return Ixx;
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
  this.Ixc = wdth * Math.pow(hght, 3) / 12; //bh^3/12
  this.Iyc = hght * Math.pow(wdth, 3) / 12; //hb^3/12

  this.display = function() {
    push();
      rectMode(CENTER);
      //stroke(this.colr[0],this.colr[1],this.colr[2]);
      stroke(0);
      fill(this.colr[0],this.colr[1],this.colr[2],50); //color,alpha
      rect(this.xc, this.yc, this.wdth, this.hght); //draw Recto
    pop();
    drawArrow(this.xc,this.yc,this.xc+Math.max(this.wdth/3,50),this.yc,this.colr);
    this.showcentre();
  };

  this.showcentre = function() {
    push();
      stroke(this.colr[0],this.colr[1],this.colr[2]);
      fill(this.colr[0],this.colr[1],this.colr[2],30); //color,alpha
      ellipse(this.xc, this.yc, 5); //draw Recto
    pop();
  };
}

function slidercallback() {
  tflangew=sliders[0].value();
  bflangew=sliders[1].value();
  figura[0]=(new RectShape(absx,absy,tflangew,tflangeh,[255,0,0]));
  figura[1]=(new RectShape(absx,absy+tflangeh/2+webh/2,webt,webh,[0,255,0]));
  figura[2]=(new RectShape(absx,absy+webh+tflangeh,bflangew,bflangeh,[0,0,255]));
  redraw();
}

function drawtext() {
  push();
    textSize(12);
    fill(0);
    textAlign(CENTER,BOTTOM);
    text("top flange width",sliders[0].x+sliders[0].width/2,sliders[0].y-cnvy);
    text("bottom flange width",sliders[1].x+sliders[1].width/2,sliders[1].y-cnvy);
    textAlign(CENTER,TOP);
    text("[mm]",sliders[0].x+sliders[0].width/2,sliders[0].y+sliders[0].height-cnvy);
    text("[mm]",sliders[1].x+sliders[1].width/2,sliders[1].y+sliders[1].height-cnvy);   
    text("centroid position",sliders[1].x+sliders[1].width/2+20,sliders[1].y+sliders[1].height);   
    fill("red");
    var Ixx1 = Math.round(secmomarea([figura[0]],ctroid.y));
    var dist1 = Math.round(Math.pow(figura[0].yc - ctroid.y,2));
    text(Ixx1 + " = " + figura[0].Ixc + " + " + figura[0].Area + " * " + dist1,width/2-20,sliders[0].y-cnvy);
    fill("green");
    var Ixx2 = Math.round(secmomarea([figura[1]],ctroid.y));
    var dist2 = Math.round(Math.pow(figura[1].yc - ctroid.y,2));
    text(Ixx2 + " = " + figura[1].Ixc + " + " + figura[1].Area + " * " + dist2,width/2-20,(sliders[0].y+sliders[1].y)/2-cnvy);
    fill("blue");
    var Ixx3 = Math.round(secmomarea([figura[2]],ctroid.y));
    var dist3 = Math.round(Math.pow(figura[2].yc - ctroid.y,2));
    text(Ixx3 + " = " + figura[2].Ixc + " + " + figura[2].Area + " * " + dist3,width/2-20,sliders[1].y-cnvy);
  pop();
  if (Math.abs(figura[1].yc-ctroid.y)>12){
    if ((figura[1].yc-ctroid.y)<0) {var pix=1} else {var pix=-1}
    drawArrow(figura[1].xc+20, figura[1].yc+pix, ctroid.x+20, ctroid.y-pix, [100,100,100],true)
  }
  drawArrow(figura[0].xc+30, figura[0].yc+1, ctroid.x+30, ctroid.y-1, [100,100,100],true)
  drawArrow(figura[2].xc+40, figura[2].yc-1, ctroid.x+40, ctroid.y+1, [100,100,100],true)  
}

function drawArrow(fromx, fromy, tox, toy, color, twoheaded){
  //variables to be used when creating the arrow
  var colorstring="#", pad="00";
  for (var ii=0; ii < color.length; ii++) {
    colorstring= colorstring + (pad + color[ii].toString(16)).slice(-pad.length);
  }
  var ctx = cnv.drawingContext; //works for P5.
  var headlen = 5;

  var angle = Math.atan2(toy-fromy,tox-fromx);

  var oldstrokestyle=ctx.strokeStyle;
  var oldlineWidth=ctx.lineWidth;
  var oldfillStyle=ctx.fillStyle;

  //starting path of the arrow from the start square to the end square and drawing the stroke
  ctx.beginPath();
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.strokeStyle = colorstring;
  ctx.lineWidth = 1;
  ctx.stroke();

  //starting a new path from the head of the arrow to one of the sides of the point
  ctx.beginPath();
  ctx.moveTo(tox, toy);
  ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

  //path from the side point of the arrow, to the other side point
  ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));

  //path from the side point back to the tip of the arrow, and then again to the opposite side point
  ctx.lineTo(tox, toy);
  ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

  //draws the paths created above
  ctx.strokeStyle = colorstring;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = colorstring;
  ctx.fill();

  if (twoheaded) {
    //starting a new path from the head of the arrow to one of the sides of the point
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(fromx+headlen*Math.cos(angle-Math.PI/7),fromy+headlen*Math.sin(angle-Math.PI/7));

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(fromx+headlen*Math.cos(angle+Math.PI/7),fromy+headlen*Math.sin(angle+Math.PI/7));

    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(fromx, fromy);
    ctx.lineTo(fromx+headlen*Math.cos(angle-Math.PI/7),fromy+headlen*Math.sin(angle-Math.PI/7));

    //draws the paths created above
    ctx.strokeStyle = colorstring;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = colorstring;
    ctx.fill();
  }

  ctx.strokeStyle =oldstrokestyle;
  ctx.lineWidth = oldlineWidth;
  ctx.fillStyle = oldfillStyle;
}