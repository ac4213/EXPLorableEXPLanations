/* ============================================================
   Interactive Simulations (p5 instance mode)
   - Sketch 1: Original plane stress + Mohr's circle (instance mode, themed bg)
   - Sketch 2: Failure criteria envelopes on (σ1, σ2) plane
   ============================================================ */

/* -------------------------------
   Sketch 1: Plane Stress + Mohr
   (p5 instance mode; canvas-only layout;
   controls anchored to container; themed bg)
---------------------------------*/
const planeStressMohr = (p) => {
  // DOM & canvas
  const containerId = 'stress-transform-sketch';
  let cnv, sxxOBJ, syyOBJ, txyOBJ, thetOBJ, slider;

  // theme / sizing
  const BG = [126, 120, 100];      // matches page #f9f9f9
  const CANVAS_W = 800, CANVAS_H = 400;

  // spacing (derived from canvas height)
  let InpYspacing = 22;            // set in setup from canvas

  // computed stress state
  let savg, rsxx, rsyy, rtxy, tmax, s1, s2, thetaP, thetaS;

  // single source of truth for all on-canvas layout (never read DOM positions)
  const LAYOUT = {
    inputX: 0,        // left of inputs/labels
    inputY: 0,        // top row of inputs
    resultDX: 0,      // dx to results column
    sliderX: 0,
    sliderY: 0,
    elemX: 0.25,      // element center (fraction of width)
    elemY: 0.23,      // element center (fraction of height)
    mohrCX: 0.75,     // Mohr circle center (fraction of width)
    mohrCY: 0.50,     // Mohr circle center (fraction of height)
    mohrR: 175        // Mohr radius in px
  };

  // helpers
  const num = (v, d = 0) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const rel = (a, b) => (Math.abs(b) > 1e-9 ? Math.abs(a / b) : 0);

  p.setup = function () {
    // make container a positioned ancestor so p5 DOM elements position relative to it
    const container = document.getElementById(containerId);
    if (container && getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
      container.style.minHeight = `${CANVAS_H + 20}px`;
    }

    cnv = p.createCanvas(CANVAS_W, CANVAS_H);
    cnv.parent(containerId);
    cnv.style('display', 'block'); // avoid baseline gap
    p.angleMode(p.DEGREES);

    // derive spacing from canvas height
    InpYspacing = 0.055 * p.height;

    // compute canvas-relative layout once (we do NOT read any DOM element positions)
    computeLayout();

    // create inputs (parented to container); their positions come from LAYOUT only
    const FontSize = "12px";
    const InpSize  = 45;

    sxxOBJ = p.createInput("100", "number"); sxxOBJ.size(InpSize).style("font-size", FontSize); sxxOBJ.elt.step = 10; sxxOBJ.parent(containerId); sxxOBJ.input(recalc);
    syyOBJ = p.createInput("-30","number");  syyOBJ.size(InpSize).style("font-size", FontSize); syyOBJ.elt.step = 10; syyOBJ.parent(containerId); syyOBJ.input(recalc);
    txyOBJ = p.createInput("40", "number");  txyOBJ.size(InpSize).style("font-size", FontSize); txyOBJ.elt.step = 10; txyOBJ.parent(containerId); txyOBJ.input(recalc);
    thetOBJ= p.createInput("0",  "number");  thetOBJ.size(InpSize).style("font-size", FontSize); thetOBJ.elt.step = 1;  thetOBJ.parent(containerId); thetOBJ.input(onAngleBox);

    slider = p.createSlider(-180, 180, 0, 0.1);
    slider.parent(containerId);
    slider.input(onAngleSlider);

    // anchor controls inside container (absolute) using the canvas-relative layout
    placeControls();

    // draw once (we’ll manually redraw on input)
    recalc();
    p.noLoop();
  };

  // If you later decide to make the canvas responsive (resizeCanvas),
  // keep this: it re-anchors the controls & redraws using updated layout.
  p.windowResized = function () {
    computeLayout();
    placeControls();
    recalc();
  };

  function computeLayout() {
    LAYOUT.inputX   = 0.05  * p.width;
    LAYOUT.inputY   = 0.60  * p.height;
    LAYOUT.resultDX = 0.30  * p.width;
    LAYOUT.sliderX  = 0.025 * p.width;
    LAYOUT.sliderY  = 0.475 * p.height;
  }

  function placeControls() {
    // p5.DOM elements are absolute positioned; because the container is relative,
    // these left/top coordinates are relative to the container (not the page).
    sxxOBJ.position(LAYOUT.inputX, LAYOUT.inputY);
    syyOBJ.position(LAYOUT.inputX, LAYOUT.inputY + InpYspacing);
    txyOBJ.position(LAYOUT.inputX, LAYOUT.inputY + 2 * InpYspacing);
    thetOBJ.position(LAYOUT.inputX, LAYOUT.inputY + 4 * InpYspacing);
    slider.position(LAYOUT.sliderX, LAYOUT.sliderY);
    slider.style('width', `${0.45 * p.width}px`);
  }

  function recalc() {
    p.background(...BG);

    const sxx = num(sxxOBJ.value());
    const syy = num(syyOBJ.value());
    const txy = num(txyOBJ.value());
    const thet= num(thetOBJ.value());

    // stress transforms (unchanged math)
    savg   = (sxx + syy) * 0.5;
    rsxx   = savg + 0.5*(sxx - syy)*p.cos(2*thet) + txy*p.sin(2*thet);
    rsyy   = savg - 0.5*(sxx - syy)*p.cos(2*thet) - txy*p.sin(2*thet);
    rtxy   = -0.5*(sxx - syy)*p.sin(2*thet) + txy*p.cos(2*thet);
    tmax   = p.sqrt(p.sq(((sxx - syy)*0.5)) + p.sq(txy));
    thetaS = 0.5*p.atan2(-(sxx - syy), 2*txy);
    s1     = savg + tmax;
    s2     = savg - tmax;
    thetaP = 0.5*p.atan2(2*txy, (sxx - syy));

    drawLabels();
    drawElement(-Number(slider.value()));
    drawMohr();
  }

  function drawLabels() {
    const lbX = LAYOUT.inputX;
    const lbY = LAYOUT.inputY + 3;
    const space = sxxOBJ.width;     // numeric width is fine
    const dx  = LAYOUT.resultDX;

    p.push();
    p.textSize(12); p.fill(0);

    p.textAlign(p.RIGHT, p.TOP);
    p.text("\u03C3xx= ", lbX, lbY);
    p.text("\u03C3yy= ", lbX, lbY + InpYspacing);
    p.text("\u03C4xy= ", lbX, lbY + 2*InpYspacing);
    p.text("\u0398= ",   lbX, lbY + 4*InpYspacing);

    p.textAlign(p.LEFT, p.TOP);
    p.text(" [MPa]", lbX + space, lbY);
    p.text(" [MPa]", lbX + space, lbY + InpYspacing);
    p.text(" [MPa]", lbX + space, lbY + 2*InpYspacing);
    p.text(" [deg]", lbX + space, lbY + 4*InpYspacing);

    p.textAlign(p.RIGHT, p.TOP);
    p.text("\u03C3'xx= " + p.nfp(rsxx,0,2) + "[MPa]", lbX + dx, lbY);
    p.text("\u03C3'yy= " + p.nfp(rsyy,0,2) + "[MPa]", lbX + dx, lbY + InpYspacing);
    p.text("\u03C4'xy= " + p.nfp(rtxy,0,2) + "[MPa]", lbX + dx, lbY + 2*InpYspacing);

    p.fill(0,0,255);
    p.text("\u03C31= " + p.nfp(s1,0,2) + "[MPa]",   lbX + dx, lbY + 4*InpYspacing);
    p.text("\u03C32= " + p.nfp(s2,0,2) + "[MPa]",   lbX + dx, lbY + 5*InpYspacing);
    p.text("\u0398p= " + p.nfp(thetaP,0,2) + "[deg]", lbX + 1.5*dx, lbY + 4.5*InpYspacing);

    p.fill(0,255,0);
    p.text("\u03C4max= " + p.nfp(tmax,0,2) + "[MPa]", lbX + dx,          lbY + 6*InpYspacing);
    p.text("\u0398s= " + p.nfp(thetaS,0,2) + "[deg]", lbX + 1.5*dx,       lbY + 6*InpYspacing);
    p.pop();
  }

  function drawElement(angle) {
    const elSize = 0.06 * p.width;
    const cx = LAYOUT.elemX * p.width;
    const cy = LAYOUT.elemY * p.height;

    const mag = (v, ref) => elSize * rel(v, ref);
    const sp = 7;

    const horzArrow = (xa, ya, len, h, w, direc) => {
      const sign = Math.sign(direc || 0);
      p.push();
      p.rectMode(p.CORNER);
      if (sign === 1) {
        if (Math.abs(len) > 2) { p.rect(xa, ya + w/2, len - h, -w); p.triangle(xa + len, ya, xa + len - h, ya + w*1.5, xa + len - h, ya - w*1.5); }
      } else {
        if (Math.abs(len) > 2) { p.rect(xa + h, ya + w/2, len, -w); p.triangle(xa, ya, xa + h, ya + w*1.5, xa + h, ya - w*1.5); }
      }
      p.pop();
    };

    p.push();
    p.translate(cx, cy);
    p.rotate(angle);

    // square + axes
    p.noFill();
    const tol = 1;                 // degrees
    const a = -angle;              // if your drawing uses -angle, keep this

    // wrap to [-180,180]
    const wrap180 = x => ((x + 180) % 360 + 360) % 360 - 180;

    // "within tol of θ0 + k*period"?
    const nearPeriodic = (ang, theta0, period) => {
    const d = wrap180(ang - theta0);                 // shortest diff to base
    const r = ((d % period) + period) % period;      // 0..period
    const distToGrid = Math.min(r, period - r);      // distance to nearest k*period
    return distToGrid <= tol;
    };

    const nearZero   = Math.abs(wrap180(angle)) <= tol;      // red at 0° (±tol)
    const nearThetaP = nearPeriodic(a, thetaP, 90);          // blue at θp ± n·90°
    const nearThetaS = nearPeriodic(a, thetaS, 90);          // green at θs ± n·90°

    if      (nearZero)   p.stroke(255, 0, 0);
    else if (nearThetaP) p.stroke(0, 0, 255);
    else if (nearThetaS) p.stroke(0, 255, 0);
    else                 p.stroke(0);
    p.rectMode(p.CENTER);
    p.rect(0, 0, elSize, elSize);
    p.stroke(200); p.line(0, 0, 2*elSize, 0);
    p.push(); p.rotate(-angle); p.stroke(255,0,0); p.line(0, 0, 2*elSize, 0); p.pop();

    // σxx / τxy on each face
    p.stroke(0,0,255); p.fill(0,0,255);
    horzArrow(elSize/2 + 2*sp, 0, mag(rsxx, s1), elSize/6, 4, rsxx);

    p.stroke(0,255,0); p.fill(0,255,0);
    horzArrow(-elSize/2 + (elSize - mag(rtxy, tmax))/2, -elSize/2 - sp, mag(rtxy, tmax), elSize/6, 4, rtxy);

    p.rotate(-90);
    p.stroke(0,0,255); p.fill(0,0,255);
    horzArrow(elSize/2 + 2*sp, 0, mag(rsyy, s1), elSize/6, 4, rsyy);

    p.stroke(0,255,0); p.fill(0,255,0);
    horzArrow(-elSize/2 + (elSize - mag(rtxy, tmax))/2, elSize/2 + sp, mag(rtxy, tmax), elSize/6, 4, rtxy);

    p.rotate(-90);
    p.stroke(0,0,255); p.fill(0,0,255);
    horzArrow(elSize/2 + 2*sp, 0, mag(rsxx, s1), elSize/6, 4, rsxx);

    p.stroke(0,255,0); p.fill(0,255,0);
    horzArrow(-elSize/2 + (elSize - mag(rtxy, tmax))/2, -elSize/2 - sp, mag(rtxy, tmax), elSize/6, 4, rtxy);

    p.rotate(-90);
    p.stroke(0,0,255); p.fill(0,0,255);
    horzArrow(elSize/2 + 2*sp, 0, mag(rsyy, s1), elSize/6, 4, rsyy);

    p.stroke(0,255,0); p.fill(0,255,0);
    horzArrow(-elSize/2 + (elSize - mag(rtxy, tmax))/2, elSize/2 + sp, mag(rtxy, tmax), elSize/6, 4, rtxy);

    p.pop();
  }

  function drawMohr() {
    const Cx = LAYOUT.mohrCX * p.width;
    const Cy = LAYOUT.mohrCY * p.height;
    const R  = LAYOUT.mohrR;
    const thet = num(thetOBJ.value());

    p.push();                   // one outer push, nothing leaks
    p.translate(Cx, Cy);

    // circle
    p.stroke(0); p.noFill(); p.ellipse(0, 0, 2*R, 2*R);

    // Savg
    p.fill(0); p.textAlign(p.RIGHT, p.TOP); p.text(p.nfp(savg, 0, 2), 0, 0);

    // s1/s2 axis & labels
    p.fill(0,0,255,80); p.stroke(0,0,255);
    p.textAlign(p.RIGHT, p.BOTTOM); p.text(p.nfp(s1,0,2),  R, 0);
    p.textAlign(p.LEFT,  p.BOTTOM); p.text(p.nfp(s2,0,2), -R, 0);
    p.line(-R, 0, R, 0);

    // 2θp
    if (thetaP !== 0) {
      p.fill(0,0,255,80); p.stroke(0,0,255);
      if (thetaP > 0) p.arc(0,0,R/1.5,R/1.5,0,2*thetaP);
      else            p.arc(0,0,R/1.5,R/1.5,2*thetaP,0);
      p.textAlign(p.LEFT, p.TOP);
      p.text("2\u0398p", (R/3)*p.cos(thetaP), (R/3)*p.sin(thetaP));
    }

    // τmax vertical
    p.textAlign(p.CENTER, p.BOTTOM);
    p.fill(0,255,0,80); p.stroke(0,255,0);
    p.text(p.nfp(-tmax,0,2), 0, -R);
    p.textAlign(p.CENTER, p.TOP);
    p.text(p.nfp(tmax,0,2),  0,  R);
    p.line(0,-R,0,R);

    // 2θs
    if (thetaS !== 0) {
      p.fill(0,255,0,80); p.stroke(0,255,0);
      if (thetaS > 0) p.arc(0,0,R/3,R/3,2*(thetaP-thetaS),2*thetaP);
      else            p.arc(0,0,R/3,R/3,2*thetaP,2*(thetaP-thetaS));
      p.textAlign(p.LEFT, p.TOP);
      p.text("2\u0398s", (R/6)*p.cos(2*thetaP - thetaS), (R/6)*p.sin(2*thetaP - thetaS));
    }

    // red line A—B
    p.push(); 
    p.fill(255,0,0); p.stroke(255,0,0);
    p.rotate(2*thetaP); p.line(-R,0,R+30,0);
      p.push(); p.translate(R,0);  p.rotate(-2*thetaP); p.textAlign(p.LEFT,  p.TOP);    p.text("A", 0, 5); p.pop();
      p.push(); p.translate(-R,0); p.rotate(-2*thetaP); p.textAlign(p.RIGHT, p.BOTTOM); p.text("B", 0, 0); p.pop();
      p.push(); p.translate(R+30,0); p.textAlign(p.RIGHT, p.BOTTOM); p.text("0°", 0, 0); p.pop();
    p.pop();

    // grey line for current θ
    p.fill(200,200,200,80); p.stroke(200,200,200);
    p.push(); p.rotate(2 * (thetaP - thet));
      p.line(-R, 0, R, 0);
      if (thet !== 0) {
        p.fill(200,200,200,80); p.stroke(200,200,200)
        if (thet < 0) p.arc(0,0,R/2,R/2,2*thet,0);
        else          p.arc(0,0,R/2,R/2,0,2*thet);

        p.push(); p.rotate(-2*(thetaP - thet));
          p.translate((R/3.5)*p.cos(-thet), (R/3.5)*p.sin(-thet));
          p.textAlign(p.LEFT, p.TOP); p.text("2\u0398", 0, 0);
        p.pop();
      }
      p.push(); p.translate(R,0);   p.rotate(-2*(thetaP - thet)); p.textAlign(p.LEFT,  p.TOP);    p.text("A'", 0, 0); p.pop();
      p.push(); p.translate(-R,0);  p.rotate(-2*(thetaP - thet)); p.textAlign(p.RIGHT, p.BOTTOM); p.text("B'", 0, 0); p.pop();
    p.pop();

    p.pop(); // outer push
  }

  function onAngleBox() {
    slider.value(thetOBJ.value());
    if (thetOBJ.value() > 180)  { thetOBJ.value(180);  slider.value(180); }
    if (thetOBJ.value() < -180) { thetOBJ.value(-180); slider.value(-180); }
    recalc();
  }
  function onAngleSlider() {
    thetOBJ.value(slider.value());
    recalc();
  }
};

new p5(planeStressMohr);



/* ---------------------------------------------
   Sketch 2: Failure Criteria on (σ1, σ2) plane
   (fixed scale: ±650 MPa box)
-----------------------------------------------*/
const failureCriteriaSketch = (p) => {
  let cnv, W = 700, H = 460;
  let center, scalePix;

  // hardcoded plotting limit (MPa)
  const PLOT_LIMIT = 600;       // box from -650 to +650 MPa
  const MARGIN = 60;            // pixels around plot

  p.setup = function () {
    cnv = p.createCanvas(W, H);
    cnv.parent('failure-criteria-sketch');
    p.textFont('sans-serif');
    p.angleMode(p.DEGREES);

    // hook inputs
    ['yield-stress','ultimate-tensile','test-s1','test-s2']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => p.redraw());
      });

    p.noLoop();
  };

  p.draw = function () {
    const { sy, sut, suc, s1, s2 } = readInputs();

    // background themed
    p.background(249);

    // fixed scale (±PLOT_LIMIT MPa)
    center  = p.createVector(W/2, H/2);
    scalePix = (Math.min(W, H) - 2*MARGIN) / (2*PLOT_LIMIT);

    // grid & axes
    drawAxes();

    // Rankine rectangle (with suc = sut)
    drawRankine(sut, suc);

    // Tresca hexagon (|σ1|, |σ2|, |σ1-σ2| ≤ σy)
    drawTresca(sy);

    // Von Mises ellipse (σ1^2 - σ1σ2 + σ2^2 = σy^2)
    drawVonMises(sy);

    // test point
    drawPoint(s1, s2);

    // compute & update FS
    const safetyFactors = updateSafety({ sy, sut, suc, s1, s2 });

    // draw safety factors infobox on canvas
    drawSafetyInfobox(safetyFactors);
  };

  function readInputs() {
    const sy  = parseFloat(document.getElementById('yield-stress').value) || 0;
    const sut = parseFloat(document.getElementById('ultimate-tensile').value) || 0;
    const suc = sut; // compressive ultimate == tensile ultimate
    const s1  = parseFloat(document.getElementById('test-s1').value) || 0;
    const s2  = parseFloat(document.getElementById('test-s2').value) || 0;
    return { sy, sut, suc, s1, s2 };
  }

  // world→screen
  function sx(σ1) { return center.x + σ1 * scalePix; }
  function sy(σ2) { return center.y - σ2 * scalePix; } // up is +

  function drawAxes() {
    p.push();
    p.stroke(180);
    p.strokeWeight(1);

    // grid (5 divisions each way)
    const step = 100;
    for (let v = -PLOT_LIMIT; v <= PLOT_LIMIT + 1e-6; v += step) {
      p.line(sx(-PLOT_LIMIT), sy(v), sx(PLOT_LIMIT), sy(v));
      p.line(sx(v), sy(-PLOT_LIMIT), sx(v), sy(PLOT_LIMIT));
    }

    // axes
    p.stroke(0);
    p.strokeWeight(2);
    p.line(sx(-PLOT_LIMIT), sy(0), sx(PLOT_LIMIT), sy(0));
    p.line(sx(0), sy(-PLOT_LIMIT), sx(0), sy(PLOT_LIMIT));
    p.noStroke();
    p.fill(0);
    p.textAlign(p.RIGHT, p.TOP);
    p.text('σ₂', sx(0)-6, sy(PLOT_LIMIT)+6);
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.text('σ₁', sx(PLOT_LIMIT)-6, sy(0)-6);
    p.pop();
  }

  function drawRankine(Sut, Suc) {
    // Domain: -Suc ≤ σ1,σ2 ≤ Sut  (here Suc = Sut; will clip to plot box)
    p.push();
    p.stroke(120);
    p.fill(200, 200, 200, 40);
    const left = -Suc, right = Sut, top = Sut, bottom = -Suc;
    p.beginShape();
    p.vertex(sx(left),  sy(bottom));
    p.vertex(sx(right), sy(bottom));
    p.vertex(sx(right), sy(top));
    p.vertex(sx(left),  sy(top));
    p.endShape(p.CLOSE);
    p.noStroke(); p.fill(90);
    p.text('Rankine', sx(Math.min(right, PLOT_LIMIT)) - 40, sy(Math.min(top, PLOT_LIMIT)) + 15);
    p.pop();
  }

  function drawTresca(Sy) {
    // hexagon vertices (σy)
    const v = [
      [ Sy, 0],
      [ Sy, Sy],
      [ 0,  Sy],
      [-Sy, 0],
      [-Sy, -Sy],
      [ 0,  -Sy]
    ];
    p.push();
    p.stroke(255, 165, 0);
    p.strokeWeight(2);
    p.fill(255, 165, 0, 35);
    p.beginShape();
    v.forEach(pt => p.vertex(sx(pt[0]), sy(pt[1])));
    p.endShape(p.CLOSE);
    p.noStroke(); p.fill(255, 140, 0);
    p.text('Tresca', sx(Math.min(Sy, PLOT_LIMIT)) - 28, sy(0) - 10);
    p.pop();
  }

  function drawVonMises(Sy) {
    p.push();
    p.noFill();
    p.stroke(0, 100, 200);
    p.strokeWeight(2);
    p.beginShape();
    for (let ang = 0; ang <= 360; ang += 1) {
      const r = Sy / Math.sqrt(1 - 0.5 * Math.sin(2 * p.radians(ang)));
      const s1 = r * Math.cos(p.radians(ang));
      const s2 = r * Math.sin(p.radians(ang));
      p.vertex(sx(s1), sy(s2));
    }
    p.endShape(p.CLOSE);
    p.noStroke(); p.fill(0, 100, 200);
    p.text('Mises', sx(Sy * 0.9), sy(Sy * 0.35));
    p.pop();
  }

  function drawPoint(S1, S2) {
    p.push();
    p.stroke(20); p.fill(20);
    p.circle(sx(S1), sy(S2), 6);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`(σ₁=${S1.toFixed(0)}, σ₂=${S2.toFixed(0)})`, sx(S1) + 8, sy(S2) + 8);
    p.pop();
  }

  function updateSafety({ sy, sut, suc, s1, s2 }) {
    // Rankine FS
    const fs_t1 = s1 > 0 ? (sut / s1) : Infinity;
    const fs_t2 = s2 > 0 ? (sut / s2) : Infinity;
    const fs_c1 = s1 < 0 ? (suc / Math.abs(s1)) : Infinity;
    const fs_c2 = s2 < 0 ? (suc / Math.abs(s2)) : Infinity;
    const fsRankine = Math.min(fs_t1, fs_t2, fs_c1, fs_c2);

    // Tresca FS
    const trescaEq = Math.max(Math.abs(s1), Math.abs(s2), Math.abs(s1 - s2));
    const fsTresca = sy / (trescaEq || 1e-9);

    // Von Mises FS
    const misesEq = Math.sqrt(s1*s1 - s1*s2 + s2*s2);
    const fsMises = sy / (misesEq || 1e-9);

    const fmt = x => (isFinite(x) ? x.toFixed(2) : '∞');
    const elR = document.getElementById('fs-rankine');
    const elT = document.getElementById('fs-tresca');
    const elM = document.getElementById('fs-vonmises');
    if (elR) elR.textContent = fmt(fsRankine);
    if (elT) elT.textContent = fmt(fsTresca);
    if (elM) elM.textContent = fmt(fsMises);

    const minFS = Math.min(
      isFinite(fsRankine) ? fsRankine : Infinity,
      fsTresca,
      fsMises
    );
    const status = document.getElementById('safety-status');
    if (status) {
      if (minFS >= 1) {
        status.textContent = 'Component is SAFE';
        status.style.color = 'green';
      } else {
        status.textContent = 'Component FAILS';
        status.style.color = 'crimson';
      }
    }

    // Return safety factors for canvas drawing
    return {
      rankine: fsRankine,
      tresca: fsTresca,
      vonMises: fsMises,
      minFS: minFS,
      isSafe: minFS >= 1
    };
  }

  function drawSafetyInfobox(safetyFactors) {
    const boxW = 200;
    const boxH = 120;
    const boxX = W - boxW;
    const boxY = 15;

    p.push();

    // Draw semi-transparent background
    p.fill(255, 255, 255, 240);
    p.stroke(100);
    p.strokeWeight(1);
    p.rect(boxX, boxY, boxW, boxH, 5);

    // Title
    p.noStroke();
    p.fill(0);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(13);
    p.textStyle(p.BOLD);
    p.text('Safety Factors', boxX + 10, boxY + 8);

    // Results
    p.textSize(11);
    p.textStyle(p.NORMAL);
    let y = boxY + 30;
    const lineH = 18;

    const fmt = x => (isFinite(x) ? x.toFixed(2) : '∞');

    p.fill(90);
    p.text('Rankine (Brittle):', boxX + 10, y);
    p.textAlign(p.RIGHT, p.TOP);
    p.text('FS = ' + fmt(safetyFactors.rankine), boxX + boxW - 10, y);
    y += lineH;

    p.textAlign(p.LEFT, p.TOP);
    p.text('Tresca (Ductile):', boxX + 10, y);
    p.textAlign(p.RIGHT, p.TOP);
    p.text('FS = ' + fmt(safetyFactors.tresca), boxX + boxW - 10, y);
    y += lineH;

    p.textAlign(p.LEFT, p.TOP);
    p.text('Von Mises (Ductile):', boxX + 10, y);
    p.textAlign(p.RIGHT, p.TOP);
    p.text('FS = ' + fmt(safetyFactors.vonMises), boxX + boxW - 10, y);
    y += lineH + 5;

    // Status
    p.textAlign(p.CENTER, p.TOP);
    p.textStyle(p.BOLD);
    if (safetyFactors.isSafe) {
      p.fill(0, 150, 0);
      p.text('Component is SAFE', boxX + boxW/2, y);
    } else {
      p.fill(220, 20, 60);
      p.text('Component FAILS', boxX + boxW/2, y);
    }

    p.pop();
  }
};

// Mount sketch 2
new p5(failureCriteriaSketch);
