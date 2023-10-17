var cnv
var Mohr; var infi;
var sxxOBJ; var syyOBJ; var txyOBJ; var thetOBJ;
var slider;
var InpYspacing;
var backgroundRGB=[126, 120, 100];

var savg; var rsxx; var rsyy; var rtxy;
var s1; var s2; var thetaP; var thetaS;
var MohrRad;

function setup() {
  cnv = createCanvas(800, 400);
  cnv.parent('sketch-holder');
  background(backgroundRGB[0],backgroundRGB[1],backgroundRGB[2]);

  //-------------LABELS-----------------------


  //--------------INPUTS------------------------
  var FontSize="12px";
  var InputPos=[cnv.position().x+0.05*width,cnv.position().y+0.60*height];
  InpYspacing=0.055*height;
  var InpSize=45; //pixels

  //sigma_xx
  sxxOBJ=createInput("100","number")
  sxxOBJ.position(InputPos[0],InputPos[1]);
  sxxOBJ.size(InpSize);
  sxxOBJ.style("font-size",FontSize);
  sxxOBJ.elt.step=10;
  sxxOBJ.input(calcola);
  //sigma_yy
  syyOBJ=createInput("-30","number")
  syyOBJ.position(InputPos[0],InputPos[1]+InpYspacing);
  syyOBJ.size(InpSize);
  syyOBJ.style("font-size", FontSize);
  syyOBJ.elt.step=10;
  syyOBJ.input(calcola);
  //tau_xy
  txyOBJ=createInput("40","number");
  txyOBJ.position(InputPos[0],InputPos[1]+2*InpYspacing);
  txyOBJ.size(InpSize);
  txyOBJ.style("font-size", FontSize);
  txyOBJ.elt.step=10;
  txyOBJ.input(calcola);
  //theta
  thetOBJ=createInput("0","number");
  thetOBJ.position(InputPos[0],InputPos[1]+4*InpYspacing);
  thetOBJ.size(InpSize);
  thetOBJ.style("font-size", FontSize);
  thetOBJ.elt.step=1;
  thetOBJ.input(angolobox);
  //slider
  var sliderpos=[cnv.position().x+0.025*width,cnv.position().y+0.475*height]
  slider = createSlider(-180,180,0,0.1);
  slider.position(sliderpos[0],sliderpos[1]);
  slider.style('width', 0.45*width+'px');
  slider.input(angoloslid)

  rectMode(CENTER);
  angleMode(DEGREES);
  calcola();
  noLoop();
}

// function draw(){
//   calcola();
// }

function calcola(){
  //console.log('calced!');
  background(backgroundRGB[0],backgroundRGB[1],backgroundRGB[2]);
  drawtext()
  drawinfi(-slider.value());
  drawMohr();
}

function drawtext(){
  var lbSpacing=sxxOBJ.width;
  var lbPos=[sxxOBJ.position().x-cnv.position().x,sxxOBJ.position().y-cnv.position().y+3]; //hate this +3 at the end
  var ResSpacing=0.3*width;

  push();
    //line(0.5*width,0,0.5*width,height);
    textSize(12); fill(0);
    textAlign(RIGHT,TOP);
    text("\u03C3xx= ",lbPos[0],lbPos[1]);
    text("\u03C3yy= ",lbPos[0],lbPos[1]+InpYspacing);
    text("\u03C4xy= ",lbPos[0],lbPos[1]+2*InpYspacing);
    text("\u0398= ",lbPos[0],lbPos[1]+4*InpYspacing);
    textAlign(LEFT,TOP);
    text(" [MPa]",lbPos[0]+lbSpacing,lbPos[1]);
    text(" [MPa]",lbPos[0]+lbSpacing,lbPos[1]+InpYspacing);
    text(" [MPa]",lbPos[0]+lbSpacing,lbPos[1]+2*InpYspacing);
    text(" [deg]",lbPos[0]+lbSpacing,lbPos[1]+4*InpYspacing);

    //----------------RESULTS------------------------
    var sxx=parseFloat(sxxOBJ.value());
    var syy=parseFloat(syyOBJ.value());
    var txy=parseFloat(txyOBJ.value());
    var thet=parseFloat(thetOBJ.value());

    savg=(sxx+syy)*0.5;
    rsxx=savg+0.5*(sxx-syy)*cos(2*thet)+txy*sin(2*thet);
    rsyy=savg-0.5*(sxx-syy)*cos(2*thet)-txy*sin(2*thet);
    rtxy=-0.5*(sxx-syy)*sin(2*thet)+txy*cos(2*thet);
    tmax=sqrt(sq(((sxx-syy)*0.5))+sq(txy)); //tmax=MohrRad
    thetaS=0.5*atan2(-(sxx-syy),2*txy);
    s1=savg+tmax;
    s2=savg-tmax;
    thetaP=0.5*atan2(2*txy,(sxx-syy));

    textAlign(RIGHT,TOP);
    text("\u03C3'xx= "+nfp(rsxx,0,2)+"[MPa]",lbPos[0]+ResSpacing,lbPos[1]);
    text("\u03C3'yy= "+nfp(rsyy,0,2)+"[MPa]",lbPos[0]+ResSpacing,lbPos[1]+InpYspacing);
    text("\u03C4'xy= "+nfp(rtxy,0,2)+"[MPa]",lbPos[0]+ResSpacing,lbPos[1]+2*InpYspacing);

    fill(0,0,255)
    text("\u03C31= "+nfp(s1,0,2)+"[MPa]",lbPos[0]+ResSpacing,lbPos[1]+4*InpYspacing);
    text("\u03C32= "+nfp(s2,0,2)+"[MPa]",lbPos[0]+ResSpacing,lbPos[1]+5*InpYspacing);
    text("\u0398p= "+nfp(thetaP,0,2)+"[deg]",lbPos[0]+1.5*ResSpacing,lbPos[1]+4.5*InpYspacing);

    fill(0,255,0)
    text("\u03C4max= "+nfp(tmax,0,2)+"[MPa]",lbPos[0]+ResSpacing,lbPos[1]+6*InpYspacing);
    text("\u0398s= "+nfp(thetaS,0,2)+"[deg]",lbPos[0]+1.5*ResSpacing,lbPos[1]+6*InpYspacing);

  pop();
}

function drawinfi(angle){
  var elsize=0.06*width //stress element size
  var elpos=[0.25*width,0.23*height] //element position
  // var sxx=parseFloat(sxxOBJ.value());
  // var syy=parseFloat(syyOBJ.value());
  // var txy=parseFloat(txyOBJ.value());
  // var thet=parseFloat(thetOBJ.value());

  push();
    translate(elpos[0],elpos[1]);
    rotate(angle);
    noFill();
    if (angle==0){
      stroke(255,0,0);
    }
    if (abs(angle)==abs(thetaP)){
      stroke(0,0,255);
    }
    if (abs(angle)==abs(thetaS)){
      stroke(0,255,0);
    }
    infi=rect(0,0,elsize,elsize);
    stroke(200,200,200)
    line(0,0,2*elsize,0)
    push()
      rotate(-angle)
      stroke(255,0,0)
      line(0,0,2*elsize,0)
    pop()
    if (angle != 0) {
      if (angle > 0){
        push();
          rotate(-angle);
          fill(200,200,200,80);
          arc(0,0,2*elsize,2*elsize,0,angle);
        pop();
        push();
        rotate(-angle);
          translate(elsize*cos(angle/2)+10,elsize*sin(angle/2)+10);
          textAlign(LEFT,TOP);
          text("\u0398",0,0);
        pop();
      } else {
        push();
          rotate(-angle);
          fill(200,200,200,80);
          arc(0,0,2*elsize,2*elsize,angle,0);
        pop();
      push();
        rotate(-angle);
        translate(elsize*cos(angle/2)+10,elsize*sin(angle/2)+10);
        textAlign(LEFT,TOP);
        text("\u0398",0,0);
      pop();
    }
    }

    //DRAW ARROWS
    var sp=7; //spacing
    //HORIZONTAL RIGHT
    stroke(0,0,255); fill(0,0,255);
    horzArrow(elsize/2+2*sp,0,elsize*abs(rsxx/s1),elsize/6,4,rsxx) //sxx
    stroke(0,255,0); fill(0,255,0);
    horzArrow(-elsize/2+(elsize-elsize*abs(rtxy/tmax))/2,-elsize/2-sp,elsize*abs(rtxy/tmax),elsize/6,4,rtxy) //tyx
    //VERTICAL UP
    rotate(-90)
    stroke(0,0,255); fill(0,0,255);
    horzArrow(elsize/2+2*sp,0,elsize*abs(rsyy/s1),elsize/6,4,rsyy) //syy
    stroke(0,255,0); fill(0,255,0);
    horzArrow(-elsize/2+(elsize-elsize*abs(rtxy/tmax))/2,elsize/2+sp,elsize*abs(rtxy/tmax),elsize/6,4,rtxy) //txy
    //HORIZONTAL LEFT
    rotate(-90)
    stroke(0,0,255); fill(0,0,255);
    horzArrow(elsize/2+2*sp,0,elsize*abs(rsxx/s1),elsize/6,4,rsxx) //sxx
    stroke(0,255,0); fill(0,255,0);
    horzArrow(-elsize/2+(elsize-elsize*abs(rtxy/tmax))/2,-elsize/2-sp,elsize*abs(rtxy/tmax),elsize/6,4,rtxy) //tyx
    //VERTICAL DOWN
    rotate(-90)
    stroke(0,0,255); fill(0,0,255);
    horzArrow(elsize/2+2*sp,0,elsize*abs(rsyy/s1),elsize/6,4,rsyy) //syy
    stroke(0,255,0); fill(0,255,0);
    horzArrow(-elsize/2+(elsize-elsize*abs(rtxy/tmax))/2,elsize/2+sp,elsize*abs(rtxy/tmax),elsize/6,4,rtxy) //txy

  pop();
}

function drawMohr(){
  var MohrCentre=[0.75*width,0.50*height];
  var MohrRad=350/2; //pixels
  var sxx=parseFloat(sxxOBJ.value());
  var syy=parseFloat(syyOBJ.value());
  var txy=parseFloat(txyOBJ.value());
  var thet=parseFloat(thetOBJ.value());

  push()
    translate(MohrCentre[0],MohrCentre[1])
    //CIRCLE
    stroke(0)
    fill(255,255,255,0)
    ellipse(0,0,2*MohrRad,2*MohrRad)
    //SAVG LABEL
    fill(0); stroke(0);
    textAlign(RIGHT,TOP); text(nfp(savg,0,2),0,0);
    //s1,s2 LABELS
    fill(0,0,255,80); stroke(0,0,255);
    textAlign(RIGHT,BOTTOM)
    text(nfp(s1,0,2),MohrRad,0);
    textAlign(LEFT,BOTTOM);
    text(nfp(s2,0,2),-MohrRad,0);
    line(-MohrRad,0,MohrRad,0) //s1,s2 BLUE line
    if (thetaP != 0){
      if (thetaP > 0) {
        arc(0,0,MohrRad/1.5,MohrRad/1.5,0,2*thetaP);
        textAlign(LEFT,TOP);
        text("2\u0398p",MohrRad/3*cos(thetaP),MohrRad/3*sin(thetaP))
      } else {
        arc(0,0,MohrRad/1.5,MohrRad/1.5,2*thetaP,0);
        textAlign(LEFT,BASELINE);
        text("2\u0398p",MohrRad/3*cos(thetaP),MohrRad/3*sin(thetaP))
      }
    }
    //tmax LABELS
    textAlign(CENTER,BOTTOM);
    fill(0,255,0,80); stroke(0,255,0);
    text(nfp(-tmax,0,2),0,-MohrRad);
    textAlign(CENTER,TOP);
    text(nfp(tmax,0,2),0,MohrRad);
    line(0,-MohrRad,0,MohrRad); //tmax line
    if (thetaS != 0){
      if (thetaS > 0) {
        arc(0,0,MohrRad/3,MohrRad/3,2*(thetaP-thetaS),2*thetaP);
        textAlign(LEFT,TOP);
        text("2\u0398s",MohrRad/6*cos(2*thetaP-thetaS),MohrRad/6*sin(2*thetaP-thetaS));
      } else {
        arc(0,0,MohrRad/3,MohrRad/3,2*thetaP,2*(thetaP-thetaS));
        textAlign(LEFT,TOP);
        text("2\u0398s",MohrRad/6*cos(2*thetaP-thetaS),MohrRad/6*sin(2*thetaP-thetaS));
      }
    }


    //RED line
    fill(255,0,0); stroke(255,0,0);
    push();
      rotate(2*thetaP);
      line(-MohrRad,0,MohrRad,0);
      push();
        translate(MohrRad,0)
        rotate(-2*thetaP);
        textAlign(LEFT,TOP);
        text("A",0,0);
      pop();
      push();
        translate(-MohrRad,0)
        rotate(-2*thetaP);
        textAlign(RIGHT,BOTTOM);
        text("B",0,0);
      pop();
    pop();

    //GREY LINE
    fill(200,200,200,80); stroke(200,200,200)
    push();
      rotate(2*(thetaP-thet));
      line(-MohrRad,0,MohrRad,0);
      if (thet != 0) {
        if (thet < 0){
          arc(0,0,MohrRad/2,MohrRad/2,2*thet,0);
        } else {
          arc(0,0,MohrRad/2,MohrRad/2,0,2*thet);
        }

        push();
          rotate(-2*(thetaP-thet))
          translate(MohrRad/3.5*cos(-thet),MohrRad/3.5*sin(-thet))
          textAlign(LEFT,TOP);
          text("2\u0398",0,0);
        pop();
      }
      push();
        translate(MohrRad,0)
        rotate(-2*(thetaP-thet));
        textAlign(LEFT,TOP);
        text("A'",0,0);
      pop();
      push();
        translate(-MohrRad,0)
        rotate(-2*(thetaP-thet));
        textAlign(RIGHT,BOTTOM);
        text("B'",0,0);
      pop();
    pop();


  pop()


}

function angolobox(){
  slider.value(thetOBJ.value())
  if (thetOBJ.value() > 180) {
    thetOBJ.value(180);
    slider.value(thetOBJ.value());
  }
  if (thetOBJ.value() < -180) {
    thetOBJ.value(-180);
    slider.value(thetOBJ.value());
  }
  calcola()
}

function angoloslid(){
  thetOBJ.value(slider.value());
  calcola()
}

function horzArrow(xa,ya,len,h,w,direc){
  direc=Math.sign(direc);
  push()
    rectMode(CORNER);
    if (direc==1) {
        if (abs(len)>2) {
          rect(xa,ya+w/2,len-h,-w);
          triangle(xa+len,ya,xa+len-h,ya+w*1.5,xa+len-h,ya-w*1.5);
        }
    } else {
        if (abs(len)>2) {
          rect(xa+h,ya+w/2,len,-w);
          triangle(xa,ya,xa+h,ya+w*1.5,xa+h,ya-w*1.5);
        }
      }
  pop();
}
