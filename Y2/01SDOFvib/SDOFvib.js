var cnv, cnvx, cnvy; //canvas variables
var Kslider, Mslider, Cslider, F0slider, fslider; //sliders containers
var bgdRGB = [85, 140, 137]; //background color
var themass;
var mypars; //themass and simulation parameters
var Yspacing;
var counter = 0,
  yMass = 60;
var UNDERDAMPED = false,
  OVERDAMPED = false;
var TIMEHISTORY, FRFAMP, FRFPHASE;

function setup() {
  cnv = createCanvas(200, 500);
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

  // sliders
  var sliderpos = [cnvx + 0.2 * width, cnvy + 0.6 * height];
  Mslider = createSlider(1, 10, 1, 0.1);
  Mslider.position(sliderpos[0], sliderpos[1]);
  Mslider.style('width', InputWidth + 'px');
  Mslider.input(slide);

  Kslider = createSlider(1000, 10000, 5000, 100);
  Kslider.position(sliderpos[0], sliderpos[1] + Yspacing);
  Kslider.style('width', InputWidth + 'px');
  Kslider.input(slide);

  Cslider = createSlider(0, 100, 10, 0.5);
  Cslider.position(sliderpos[0], sliderpos[1] + Yspacing * 2);
  Cslider.style('width', InputWidth + 'px');
  Cslider.input(slide);

  F0slider = createSlider(0, 10000, 0, 500);
  F0slider.position(sliderpos[0], sliderpos[1] + Yspacing * 4);
  F0slider.style('width', InputWidth + 'px');
  F0slider.input(slide);

  fslider = createSlider(0, 20, 5, 0.01);
  fslider.position(sliderpos[0], sliderpos[1] + Yspacing * 5);
  fslider.style('width', InputWidth + 'px');
  fslider.input(slide);

  // button = createButton('Simulate!');
  // button.position(400, 200);
  // button.mousePressed(simula);


  TIMEHISTORY = document.getElementById('TimeHistory');
  // TESTER.style.position = "absolute";
  // TESTER.style.left = cnvx+10;
  // TESTER.style.top = cnvy+10;
  FRFAMP = document.getElementById('FRFamp');
  FRFPHASE = document.getElementById('FRFphase');

  mypars = {
    m: Mslider.value(),
    k: Kslider.value(),
    c: Cslider.value(),
    Ttot: 2,
    ff: fslider.value()
  };
  themass = new Mass(0.5 * width, yMass, 100, 60);
  themass.display();
  results = calcola();
  drawtext();

  var fps = 60;
  frameRate(fps);
  angleMode(DEGREES);
}

function draw() {
  if (counter === results.Y.length - 1) {
    counter = 0;
    results = calcola();
    themass.move(0, true); //reset the mass
  }
  background(bgdRGB[0], bgdRGB[1], bgdRGB[2]); //clear background
  themass.move(results.Y[counter], false); //move the mass
  drawtext();
  counter++;
}


function calcola() {
  mypars = {
    m: Mslider.value(),
    k: Kslider.value(),
    c: Cslider.value(),
    Ttot: mypars.Ttot,
    F0: F0slider.value(),
    ff: fslider.value()
  };
  //general
  var ccrit = 2 * Math.sqrt(mypars.k * mypars.m);
  if (mypars.c < ccrit) {
    UNDERDAMPED = true;
    OVERDAMPED = false;
  }
  if (mypars.c > ccrit) {
    UNDERDAMPED = false;
    OVERDAMPED = true;
  }
  var zeta = mypars.c / ccrit;
  var wn = Math.sqrt(mypars.k / mypars.m);
  var fn = wn / (2 * Math.PI);
  var wd = wn * Math.sqrt(1 - Math.pow(zeta, 2));
  var fd = wd / (2 * Math.PI);
  var T = 1 / fd;
  //sampling
  var Ncycles = Math.round(mypars.Ttot / T);
  var fs = 100 * fd;
  var dt = 1 / fs;
  //SIMULATION
  var A = 1,
    B = 0,
    C = Math.sqrt(Math.pow(A, 2) + Math.pow(B, 2)),
    F0 = mypars.F0,
    wf = 2 * Math.PI * mypars.ff;
  var t = new Array(1);
  t[0] = 0;
  var Y = new Array(1);
  Y[0] = 0;
  var envelope = new Array(1);
  envelope[0] = 0;
  var perY = new Array(1);
  perY[0] = 0;
  var ii = 0,
    tt = 0,
    YYn = 0,
    ee = 0;
  var wn2 = (Math.pow(wn, 2)),
    wf2 = (Math.pow(wf, 2));

  if (UNDERDAMPED) { //if UNDERDAMPED
    while (t[t.length - 1] < mypars.Ttot) {
      tt = ii * dt;
      YYn = A * Math.exp(-zeta * wn * tt) * Math.cos(wd * tt) + B * Math.exp(-zeta * wn * tt) * Math.sin(wd * tt);
      ee = C * Math.exp(-zeta * wn * tt);
      var aa = F0 * (mypars.m * (wn2 - wf2)) / (Math.pow(mypars.m, 2) * Math.pow((wn2 - wf2), 2) + wn2 * Math.pow(mypars.c, 2)),
        bb = F0 * (mypars.c * wf) / (Math.pow(mypars.m, 2) * Math.pow((wn2 - wf2), 2) + wn2 * Math.pow(mypars.c, 2)),
        YYp = aa * Math.cos(wf * tt) + bb * Math.sin(wf * tt);
      t.push(tt);
      Y.push(YYn + YYp);
      envelope.push(ee);
      if (t[t.length - 1] <= T) {
        perY.push(YYn);
      }
      ii++;
    }
  } else {
    if (OVERDAMPED) { //if OVERDAMPED
      while (t[t.length - 1] < mypars.Ttot) {
        dt = 0.001;
        tt = ii * dt;
        YYn = Math.exp(-mypars.c * tt / (2 * mypars.m)) * (A + B * tt);
        t.push(tt);
        Y.push(YYn);
        ii++;
      }
    } else { //if CRITICALLY DAMPED
      var r1 = (-mypars.c + Math.sqrt(Math.pow(mypars.c, 2) - 4 * mypars.m * mypars.k)) / (2 * mypars.m);
      var r2 = (-mypars.c - Math.sqrt(Math.pow(mypars.c, 2) - 4 * mypars.m * mypars.k)) / (2 * mypars.m);
      while (t[t.length - 1] < mypars.Ttot) {
        dt = 0.001;
        tt = ii * dt;
        YYn = A * Math.exp(r1 * tt) + B * Math.exp(r2 * tt);
        t.push(tt);
        Y.push(YYn);
        ii++;
      }
    }
  }
  t.splice(0, 1);
  Y.splice(0, 1);
  envelope.splice(0, 1);
  perY.splice(0, 1);
  counter = 0;
  themass.move(0, true); //move the mass

  var farr = new Array(500);
  var FRFamp = new Array(500);
  var FRFphase = new Array(500);
  var df = 0.05,
    thisAMP = 0,
    thisPHASE = 0;
  for (ii = 0; ii < farr.length; ii++) {
    farr[ii] = ii * df;
    r = wn / (2 * Math.PI * farr[ii]);
    FRFamp[ii] = (F0 / mypars.k) / Math.sqrt(Math.pow(1 - Math.pow(r, 2), 2) + Math.pow(2 * zeta * r, 2));
    FRFphase[ii] = Math.atan2((2 * zeta * r), (1 - Math.pow(r, 2))) * 180 / Math.PI - 180;
  }
  r = wn / (2 * Math.PI * mypars.ff);
  thisAMP = (F0 / mypars.k) / Math.sqrt(Math.pow(1 - Math.pow(r, 2), 2) + Math.pow(2 * zeta * r, 2));
  thisPHASE = Math.atan2((2 * zeta * r), (1 - Math.pow(r, 2))) * 180 / Math.PI - 180;

  var res = {
    ccrit: ccrit, //critical damping
    zeta: zeta, //damping ratio
    wn: wn, //natural frequency [rad/s]
    fn: fn, //natural frequency [Hz]
    wd: wd, //damped natural frequency [rad/s]
    fd: fd, //damped natural frequency [Hz]
    T: T, //period [s]
    Ncycles: Ncycles, //total number of cycles in Ttot seconds
    fs: fs, //sampling frequency [Hz]
    dt: dt, //sampling interval [s]
    A: A, //initial condition/1
    B: B, //initial condition/2
    t: t, //time vector [s]
    Y: Y, //solution vector [m]
    perY: perY, //first period
    env: envelope, //envelope (if any)
    farr: farr,
    FRFamp: FRFamp,
    FRFphase: FRFphase,
    thisAMP: thisAMP,
    thisPHASE: thisPHASE,
  };

  var THdata = [{
      x: res.t,
      y: res.Y,
      text: "signal",
      line: {
        width: 1,
        color: "blue",
        shape: "spline"
      }
    },
    {
      x0: 0,
      dx: res.dt,
      y: res.perY,
      text: "period",
      line: {
        dash: "dot",
        color: "red",
        shape: "spline"
      }
    },
    {
      x: res.t,
      y: res.env,
      text: "envelope",
      line: {
        width: 1,
        color: "orange",
        shape: "spline"
      }
    }
  ];

  //array of tick values
  var tvals = Array.apply(null, {
    length: Ncycles
  }).map(Number.call, Number); //[0,...,Ncycles-1]
  tvals = tvals.map(function (x) {
    return x * T;
  }); //[0*T,T,2T,...,(Ncycles-1)*T]
  var theheight = 150;
  if (F0 === 0) {
    theheight = 500;
  }

  var THlayout = {
    height: theheight,
    font: {
      size: 8
    },
    showlegend: false,
    title: 'Time History',
    xaxis: {
      title: 'time [s]',
      range: [0, mypars.Ttot],
      tickmode: "array",
      tickvals: tvals,
      tickformat: "<.2f",
      hoverformat: "<.2f"
    },
    yaxis: {
      title: 'amp [m]',
      hoverformat: "<.2f"
    }, //range: [-1, 1]
    margin: {
      l: 30,
      t: 25,
      r: 0,
      b: 35,
      pad: 0
    },
  };

  var plotopts = {
    showLink: false,
    displayModeBar: false
  };

  Plotly.newPlot(TIMEHISTORY, THdata, THlayout, plotopts);

  if (F0 != 0) {
    var FRFAMPdata = [{
        x: res.farr,
        y: res.FRFamp
      },
      {
        x: [mypars.ff],
        y: [res.thisAMP],
        marker: {
          size: 10,
          color: "red"
        }
      }
    ];
    var FRFAMPlayout = {
      font: {
        size: 8
      },
      showlegend: false,
      title: 'FRF',
      xaxis: {
        title: 'frequency [Hz]',
        tickformat: "<.2f",
        hoverformat: "<.2f"
      },
      yaxis: {
        title: 'amp [m]',
        tickformat: "<.2f",
        hoverformat: "<.2f"
      }, //range: [-1, 1]
      margin: {
        l: 40,
        t: 25,
        r: 0,
        b: 35,
        pad: 0
      },
    };
    Plotly.newPlot(FRFAMP, FRFAMPdata, FRFAMPlayout, plotopts);

    var FRFPHASEdata = [{
        x: res.farr,
        y: res.FRFphase
      },
      {
        x: [mypars.ff],
        y: [res.thisPHASE],
        marker: {
          size: 10,
          color: "red"
        }
      }
    ];
    var FRFPHASElayout = {
      font: {
        size: 8
      },
      showlegend: false,
      title: 'FRFphase',
      xaxis: {
        title: 'frequency [Hz]',
        tickformat: "<.2f",
        hoverformat: "<.2f"
      },
      yaxis: {
        title: 'phase [deg]',
        tickmode: "array",
        tickvals: [0, -45, -90, -135, -180],
        tickformat: "<f",
        hoverformat: "<.2f"
      }, //range: [-1, 1]
      margin: {
        l: 45,
        t: 25,
        r: 0,
        b: 35,
        pad: 0
      },
    };
    Plotly.newPlot(FRFPHASE, FRFPHASEdata, FRFPHASElayout, plotopts);
  } else {
    Plotly.purge(FRFAMP);
    Plotly.purge(FRFPHASE);
  }
  return res; //returns results
}

function Mass(x, y, wdth, hght) {
  this.x = x;
  this.y = y;
  this.wdth = wdth;
  this.hght = hght;

  this.move = function (y, reset) {
    if (reset) {
      this.y = yMass;
      this.display();
    } else {
      this.y += -y;
      this.display();
    }

  };

  this.display = function () {
    push();
    rectMode(CENTER);
    stroke("black");
    fill(200, 200, 200);
    var l = 12,
      Lmin = 3 * l,
      Lmax = 6 * l,
      Lavg = (Lmin + Lmax) / 2;
    if (Cslider.value() === 0) {
      this.drawSPRING(this.x, Lavg + cnvy + this.hght / 2, 2 * l, Lavg + cnvy - this.y);
    } else {
      this.drawSPRING(this.x - 20, Lavg + cnvy + this.hght / 2, 2 * l, Lavg + cnvy - this.y);
      this.drawDASHPOT(this.x + 20, Lavg + cnvy + this.hght / 2, 2.75 * l, Lavg + cnvy - this.y);
    }
    rect(this.x, this.y, this.wdth, this.hght); //draw MASS
    fill("black");
    rect(this.x, cnvy + this.hght / 2 + Lavg, this.wdth, 10); //draw MASS
    pop();
  };

  this.drawSPRING = function (p0x, p0y, l, L0) {
    var alpha = Math.asin((L0 - 2 * l) / (4 * Math.sqrt(2) * l));
    push();
    stroke("black");

    var p1x = p0x,
      p1y = p0y - l;
    line(p0x, p0y, p1x, p1y); //stem from ground

    var p2x = p1x - l / 2 * Math.cos(alpha),
      p2y = p1y - l / 2 * Math.sqrt(2) * Math.sin(alpha);
    line(p1x, p1y, p2x, p2y); //to left (half)

    var p3x = p2x + l * Math.cos(alpha),
      p3y = p2y - l * Math.sqrt(2) * Math.sin(alpha);
    line(p2x, p2y, p3x, p3y); //to right
    var p4x = p3x - l * Math.cos(alpha),
      p4y = p3y - l * Math.sqrt(2) * Math.sin(alpha);
    line(p3x, p3y, p4x, p4y); //to left
    var p5x = p4x + l * Math.cos(alpha),
      p5y = p4y - l * Math.sqrt(2) * Math.sin(alpha);
    line(p4x, p4y, p5x, p5y); //to right

    var p6x = p5x - l / 2 * Math.cos(alpha),
      p6y = p5y - l / 2 * Math.sqrt(2) * Math.sin(alpha);
    line(p5x, p5y, p6x, p6y); //to left (half)

    var p7x = p6x,
      p7y = p6y - l;
    line(p6x, p6y, p7x, p7y); //stem to mass
    pop();
  };

  this.drawDASHPOT = function (p0x, p0y, l, L0) {
    push();
    var w = 10;
    //Lmin=2*l+0.3;
    //Lmax=3*l; %(2+4*sqrt(2))*l;
    var h = L0 - 1.75 * l;
    var c = 1 * l;
    var p1x = p0x,
      p1y = p0y - l;
    line(p0x, p0y, p1x, p1y);
    var p1xl = p1x - w / 2,
      p1xr = p1x + w / 2;
    line(p1xl, p1y, p1xr, p1y);

    var p2x = p1x,
      p2y = p1y - h,
      p2xl = p2x - w / 2,
      p2xr = p2x + w / 2;
    line(p2xl, p2y, p2xr, p2y);
    line(p2xl, p2y, p2xl, p2y + c);
    line(p2xr, p2y, p2xr, p2y + c);
    var p4y = p2y - l;
    line(p2x, p2y, p2x, p4y);
    pop();
  };
}

function slide() {
  results = calcola();
  counter = 0;
}

function drawtext() {
  var lbSpacing = Mslider.width + 5;
  var lbPos = [Mslider.position().x - 10, Mslider.position().y - cnvy]; //hate this +3 at the end
  var ResSpacing = 0.3 * width;

  push();
  //line(0.5*width,0,0.5*width,height);
  textSize(12);
  fill(0);
  textAlign(CENTER, BOTTOM);
  text("parameters:", width / 2, lbPos[1] - Yspacing + 20);
  text("forcing:", width / 2, lbPos[1] + 3 * Yspacing + 20);
  textAlign(RIGHT, TOP);
  text("m= ", lbPos[0], lbPos[1]);
  text("k= ", lbPos[0], lbPos[1] + Yspacing);
  text("c= ", lbPos[0], lbPos[1] + 2 * Yspacing);
  text("F0= ", lbPos[0], lbPos[1] + 4 * Yspacing);
  text("ff= ", lbPos[0], lbPos[1] + 5 * Yspacing); //\u03c9
  textAlign(LEFT, TOP);
  text(" [kg]", lbPos[0] + lbSpacing, lbPos[1]);
  text(" [N/m]", lbPos[0] + lbSpacing, lbPos[1] + Yspacing);
  text(" [Ns/m]", lbPos[0] + lbSpacing, lbPos[1] + 2 * Yspacing);
  text(" [N]", lbPos[0] + lbSpacing, lbPos[1] + 4 * Yspacing);
  text(" [Hz]", lbPos[0] + lbSpacing, lbPos[1] + 5 * Yspacing);

  //----------------RESULTS------------------------
  // var sxx = parseFloat(sxxOBJ.value());
  // var syy = parseFloat(syyOBJ.value());
  // var txy = parseFloat(txyOBJ.value());
  // var thet = parseFloat(thetOBJ.value());

  // textAlign(RIGHT, TOP);
  // text("\u03C3'xx= " + nfp(rsxx, 0, 2) + "[MPa]", lbPos[0] + ResSpacing, lbPos[1]);
  // text("\u03C3'yy= " + nfp(rsyy, 0, 2) + "[MPa]", lbPos[0] + ResSpacing, lbPos[1] + Yspacing);
  // text("\u03C4'xy= " + nfp(rtxy, 0, 2) + "[MPa]", lbPos[0] + ResSpacing, lbPos[1] + 2 * Yspacing);

  // fill(0, 0, 255)
  // text("\u03C31= " + nfp(s1, 0, 2) + "[MPa]", lbPos[0] + ResSpacing, lbPos[1] + 4 * Yspacing);
  // text("\u03C32= " + nfp(s2, 0, 2) + "[MPa]", lbPos[0] + ResSpacing, lbPos[1] + 5 * Yspacing);
  // text("\u0398p= " + nfp(thetaP, 0, 2) + "[deg]", lbPos[0] + 1.5 * ResSpacing, lbPos[1] + 4.5 * Yspacing);

  // fill(0, 255, 0)
  // text("\u03C4max= " + nfp(tmax, 0, 2) + "[MPa]", lbPos[0] + ResSpacing, lbPos[1] + 6 * Yspacing);
  // text("\u0398s= " + nfp(thetaS, 0, 2) + "[deg]", lbPos[0] + 1.5 * ResSpacing, lbPos[1] + 6 * Yspacing);

  pop();
}

// function horzArrow(xa, ya, len, h, w, direc) {
//   direc = Math.sign(direc);
//   push()
//   rectMode(CORNER);
//   if (direc == 1) {
//     if (abs(len) > 2) {
//       rect(xa, ya + w / 2, len - h, -w);
//       triangle(xa + len, ya, xa + len - h, ya + w * 1.5, xa + len - h, ya - w * 1.5);
//     }
//   } else {
//     if (abs(len) > 2) {
//       rect(xa + h, ya + w / 2, len, -w);
//       triangle(xa, ya, xa + h, ya + w * 1.5, xa + h, ya - w * 1.5);
//     }
//   }
//   pop();
// }