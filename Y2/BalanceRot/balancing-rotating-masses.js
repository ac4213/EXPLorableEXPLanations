
/* balancing-rotating-masses.js
 * Enhanced version with gravity equilibrium, balancing calculations, and vibration
 * Wired angle sliders; dashed 0° reference that ROTATES with rotor; auto-remove balance on any non-RPM input change
 * British English spelling and comments throughout
 */

/* -----------------------------------------------------------
   Global parameters and state
----------------------------------------------------------- */
let timeScale = 1;
const SLOWMO_SCALE = 0.15;
const GRAVITY_DAMPING = 0.95; // Damping for settling to equilibrium
const MR_FIXED_SCALE = 0.2; // pixels per (gmm) for Single MR polygon
const FORCE_FIXED_SCALE = 0.004; // pixels per (gmmrad^2) for Forces & Reactions
const MR_MULTI_FIXED_SCALE  = 0.02;   // pixels per (gmm) for Multi MR polygon
const MRL_MULTI_FIXED_SCALE = 0.0001; // pixels per (gmm) for Multi MRL polygon
let singlePaused = false; // shared pause state for all single-plane canvases
let multiPaused  = false; // shared pause state for all multi-plane canvases

const colours = {
  red:    [220, 60, 60],
  blue:   [20, 120, 255],
  orange: [255, 140, 0],
  green:  [40, 170, 40],
  gray:   [120, 120, 120],
  purple: [150, 50, 200],
};

/* -----------------------------------------------------------
   Helpers: angles + dashed ray
----------------------------------------------------------- */
const deg2rad = d => (d * Math.PI) / 180;
const rad2deg = r => (r * 180) / Math.PI;
const normAngRad = r => {
  let a = r % (2*Math.PI);
  if (a < 0) a += 2*Math.PI;
  return a;
};

function dashedZeroRay(p, len, thetaRad) {
  p.push();
  p.rotate(thetaRad);                 // spin with the rotor/body
  p.stroke(120);
  p.strokeWeight(1.5);
  p.drawingContext.setLineDash([6, 6]);
  p.line(0, 0, len, 0);               // 0° is +x in the body frame
  p.drawingContext.setLineDash([]);
  p.pop();
}

/* -----------------------------------------------------------
   Parameters
----------------------------------------------------------- */
// Single plane parameters
const singleParams = {
  omega: 0,
  radius_mm: 60,
  mass_g: 50,
  rotorRadius_mm: 110,
  isBalanced: false,
  balanceMass_g: 0,
  balanceRadius_mm: 80,
  balanceAngle: 0,
  equilibriumAngle: 0,
  angularVel: 0, // For gravity settling
};
const SINGLE_DEFAULTS = { 
  rpm: 0,
  mass_g: singleParams.mass_g,
  radius_mm: singleParams.radius_mm,
  balanceRadius_mm: singleParams.balanceRadius_mm,
  balanceAngle: Math.PI,
  isBalanced: false
};

// Multi-plane parameters
const multiParams = {
  omega: 0,
  shaftHalfLen_mm: 220,
  rotorRadius_mm: 120,
  isBalanced: false,
  masses: [
    { id: 1, m_g: 50, r_mm: 60, posPct: 25, colour: colours.red,    phase: 0 },
    { id: 2, m_g: 30, r_mm: 80, posPct: 50, colour: colours.blue,   phase: Math.PI/3 },
    { id: 3, m_g: 40, r_mm: 50, posPct: 75, colour: colours.orange, phase: 2*Math.PI/3 },
  ],
  // Planes at 10% (L) and 90% (M)
  balanceMasses: [
    { plane: 'L', posPct: 10, m_g: 0, r_mm: 80, angle: 0, colour: colours.green },
    { plane: 'M', posPct: 90, m_g: 0, r_mm: 80, angle: 0, colour: colours.green },
  ],
  equilibriumAngle: 0,
  angularVel: 0,
};
const MULTI_DEFAULTS = {
  rpm: 0,
  isBalanced: false,
  rotorRadius_mm: multiParams.rotorRadius_mm,
  shaftHalfLen_mm: multiParams.shaftHalfLen_mm,
  masses: JSON.parse(JSON.stringify(multiParams.masses)),
  balanceMasses: JSON.parse(JSON.stringify(multiParams.balanceMasses)),
};

/* -----------------------------------------------------------
   DOM helpers
----------------------------------------------------------- */
const $ = (id) => document.getElementById(id);

function updateSlowmoLabel(id) {
  const el = $(id);
  if (el) el.textContent = timeScale !== 1 ? 'Slow-mo: ON' : 'Slow-mo';
}

function updateBalanceLabel(id, balanced) {
  const el = $(id);
  if (el) el.textContent = balanced ? 'Remove Balance' : 'Apply Balance';
}

function measureBox(parentEl, aspect = 0.62, minH = 300) {
  const w = parentEl?.clientWidth || 600;
  const h = Math.max(minH, Math.floor(w * aspect));
  return { w, h };
}

function bindRangeNumber(rangeId, numberId, onChange) {
  const rng = $(rangeId);
  const num = $(numberId);
  if (!rng || !num) return;
  const apply = (val) => { rng.value = String(val); num.value = String(val); onChange(Number(val)); };
  rng.addEventListener('input', e => apply(e.target.value));
  num.addEventListener('input', e => apply(e.target.value));
  // initialise
  apply(rng.value);
}

/* -----------------------------------------------------------
   Balancing calculations
----------------------------------------------------------- */
function calculateSingleCentreOfMass() {
  if (singleParams.isBalanced) return 0;
  return 0;
}

function calculateMultiCentreOfMass(theta) {
  let totalMx = 0, totalMy = 0;
  for (const m of multiParams.masses) {
    const angle = theta + m.phase;
    totalMx += m.m_g * m.r_mm * Math.cos(angle);
    totalMy += m.m_g * m.r_mm * Math.sin(angle);
  }
  if (multiParams.isBalanced) {
    for (const bm of multiParams.balanceMasses) {
      totalMx += bm.m_g * bm.r_mm * Math.cos(theta + bm.angle);
      totalMy += bm.m_g * bm.r_mm * Math.sin(theta + bm.angle);
    }
  }
  return Math.atan2(totalMy, totalMx);
}

function calculateSingleBalance() {
  const MR_unbalance = singleParams.mass_g * singleParams.radius_mm;
  singleParams.balanceRadius_mm = 80;
  singleParams.balanceMass_g = MR_unbalance / singleParams.balanceRadius_mm;
  singleParams.balanceAngle = Math.PI;
}

/* Use plane L as the reference for balancing */
function calculateMultiBalance() {
  // Reference z at plane L
  const zL = posPctToZmm(multiParams.balanceMasses[0].posPct, multiParams.shaftHalfLen_mm);
  const zM = posPctToZmm(multiParams.balanceMasses[1].posPct, multiParams.shaftHalfLen_mm);
  const LB = zM - zL;         // distance M from L

  // Sum MR and MRL (about L)
  let MRx = 0, MRy = 0;
  let MRLx = 0, MRLy = 0;

  for (const m of multiParams.masses) {
    const MR = m.m_g * m.r_mm;
    const z  = posPctToZmm(m.posPct, multiParams.shaftHalfLen_mm);
    const L  = z - zL;
    MRx  += MR * Math.cos(m.phase);
    MRy  += MR * Math.sin(m.phase);
    MRLx += MR * L * Math.cos(m.phase);
    MRLy += MR * L * Math.sin(m.phase);
  }

  // Solve:
  // MR_L + MR_M = -MR
  // (0)*MR_L + (LB)*MR_M = -(MR*L)
  const MR_Mx = (-MRLx) / LB;
  const MR_My = (-MRLy) / LB;
  const MR_Lx = -MRx - MR_Mx;
  const MR_Ly = -MRy - MR_My;

  const MR_M_mag = Math.hypot(MR_Mx, MR_My);
  const MR_M_ang = Math.atan2(MR_My, MR_Mx);
  const MR_L_mag = Math.hypot(MR_Lx, MR_Ly);
  const MR_L_ang = Math.atan2(MR_Ly, MR_Lx);

  // Set balance masses
  const bmL = multiParams.balanceMasses[0];
  const bmM = multiParams.balanceMasses[1];
  bmM.m_g = MR_M_mag / bmM.r_mm;
  bmM.angle = MR_M_ang;
  bmL.m_g = MR_L_mag / bmL.r_mm;
  bmL.angle = MR_L_ang;

  updateBalanceDisplay();
}

function updateBalanceDisplay() {
  const singleBalanceEl = $('single-balance-mass');
  const singleAngleEl = $('single-balance-angle');
  if (singleBalanceEl && singleAngleEl) {
    if (singleParams.isBalanced) {
      singleBalanceEl.textContent = singleParams.balanceMass_g.toFixed(1) + ' g';
      singleAngleEl.textContent = '180';
    } else {
      singleBalanceEl.textContent = '-- g';
      singleAngleEl.textContent = '-- ';
    }
  }

  const planeAEl = $('multi-balance-a');
  const planeBEl = $('multi-balance-b');
  if (planeAEl && planeBEl) {
    if (multiParams.isBalanced) {
      const angleL = (rad2deg(multiParams.balanceMasses[0].angle) + 360) % 360;
      const angleM = (rad2deg(multiParams.balanceMasses[1].angle) + 360) % 360;
      planeAEl.textContent = `L: ${multiParams.balanceMasses[0].m_g.toFixed(1)} g @ ${angleL.toFixed(0)}`;
      planeBEl.textContent = `M: ${multiParams.balanceMasses[1].m_g.toFixed(1)} g @ ${angleM.toFixed(0)}`;
    } else {
      planeAEl.textContent = 'L: -- g @ -- ';
      planeBEl.textContent = 'M: -- g @ -- ';
    }
  }
}

/* -----------------------------------------------------------
   Utility
----------------------------------------------------------- */
function posPctToZmm(pct, halfLen) {
  const clamped = Math.max(0, Math.min(100, pct));
  return -halfLen + (2 * halfLen) * (clamped / 100);
}

function drawArrow(p, x1, y1, x2, y2, headLen = 10, headAng = Math.PI/7, weight = 2) {
  p.strokeWeight(weight);
  p.line(x1, y1, x2, y2);
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hx1 = x2 - headLen * Math.cos(ang - headAng);
  const hy1 = y2 - headLen * Math.sin(ang - headAng);
  const hx2 = x2 - headLen * Math.cos(ang + headAng);
  const hy2 = y2 - headLen * Math.sin(ang + headAng);
  p.line(x2, y2, hx1, hy1);
  p.line(x2, y2, hx2, hy2);
}

/* -----------------------------------------------------------
   Balance auto-unapply helpers
----------------------------------------------------------- */
function autoUnapplySingleBalance() {
  if (singleParams.isBalanced) {
    singleParams.isBalanced = false;
    updateBalanceLabel('single-apply', false);
    updateBalanceDisplay();
  }
}
function autoUnapplyMultiBalance() {
  if (multiParams.isBalanced) {
    multiParams.isBalanced = false;
    updateBalanceLabel('multi-apply', false);
    updateBalanceDisplay();
  }
}

/* -----------------------------------------------------------
   Wire up controls (SINGLE + MULTI)
----------------------------------------------------------- */
function resetSingle() {
  singleParams.omega = 0;
  singleParams.isBalanced = SINGLE_DEFAULTS.isBalanced;
  singleParams.mass_g = SINGLE_DEFAULTS.mass_g;
  singleParams.radius_mm = SINGLE_DEFAULTS.radius_mm;
  singleParams.balanceMass_g = 0;
  singleParams.balanceRadius_mm = SINGLE_DEFAULTS.balanceRadius_mm;
  singleParams.balanceAngle = SINGLE_DEFAULTS.balanceAngle;

  const setVal = (id, v) => { const e = $(id); if (e) { e.value = String(v); e.dispatchEvent(new Event('input', {bubbles:true})); } };
  setVal('single-rpm', 0);  setVal('single-rpm-value', 0);
  setVal('single-mass', singleParams.mass_g); setVal('single-mass-value', singleParams.mass_g);
  setVal('single-radius', singleParams.radius_mm); setVal('single-radius-value', singleParams.radius_mm);
  setVal('single-balance-radius', singleParams.balanceRadius_mm); setVal('single-balance-radius-value', singleParams.balanceRadius_mm);
  updateBalanceLabel('single-apply', singleParams.isBalanced);
  updateSlowmoLabel('single-slowmo');
}

function wireSingleControls() {
  bindRangeNumber('single-rpm', 'single-rpm-value', (rpm) => {
    singleParams.omega = (rpm * 2 * Math.PI) / 60;
    // RPM change does NOT auto-remove balance (as requested)
  });
  bindRangeNumber('single-mass', 'single-mass-value', (m) => { singleParams.mass_g = m; autoUnapplySingleBalance(); });
  bindRangeNumber('single-radius', 'single-radius-value', (r) => { singleParams.radius_mm = r; autoUnapplySingleBalance(); });

  const balanceBtn = $('single-apply');
  if (balanceBtn && !balanceBtn._bound) {
    balanceBtn._bound = true;
    balanceBtn.addEventListener('click', () => {
      singleParams.isBalanced = !singleParams.isBalanced;
      if (singleParams.isBalanced) calculateSingleBalance();
      updateBalanceLabel('single-apply', singleParams.isBalanced);
      updateBalanceDisplay();
    });
  }

  const pauseBtn = $('single-pause');
  if (pauseBtn && !pauseBtn._bound) {
    pauseBtn._bound = true;
    pauseBtn.addEventListener('click', () => {
      singlePaused = !singlePaused;
      pauseBtn.textContent = singlePaused ? 'Resume' : 'Pause';
    });
  }

  const slowmoBtn = $('single-slowmo');
  if (slowmoBtn && !slowmoBtn._bound) {
    slowmoBtn._bound = true;
    updateSlowmoLabel('single-slowmo');
    slowmoBtn.addEventListener('click', () => {
      timeScale = (timeScale === 1 ? SLOWMO_SCALE : 1);
      updateSlowmoLabel('single-slowmo');
    });
  }

  const resetBtn = $('single-reset');
  if (resetBtn && !resetBtn._bound) {
    resetBtn._bound = true;
    resetBtn.addEventListener('click', resetSingle);
  }
}

function resetMulti() {
  multiParams.omega = 0;
  multiParams.isBalanced = MULTI_DEFAULTS.isBalanced;
  multiParams.rotorRadius_mm = MULTI_DEFAULTS.rotorRadius_mm;
  multiParams.shaftHalfLen_mm = MULTI_DEFAULTS.shaftHalfLen_mm;
  multiParams.masses = JSON.parse(JSON.stringify(MULTI_DEFAULTS.masses));
  multiParams.balanceMasses = JSON.parse(JSON.stringify(MULTI_DEFAULTS.balanceMasses));
  multiParams.angularVel = 0;

  const setVal = (id, v) => { const e = $(id); if (e) { e.value = String(v); e.dispatchEvent(new Event('input', {bubbles:true})); } };
  setVal('multi-rpm', 0); setVal('multi-rpm-value', 0);

  // Mass 1
  setVal('multi-mass1',     multiParams.masses[0].m_g);   setVal('multi-mass1-value',     multiParams.masses[0].m_g);
  setVal('multi-radius1',   multiParams.masses[0].r_mm);  setVal('multi-radius1-value',   multiParams.masses[0].r_mm);
  setVal('multi-position1', multiParams.masses[0].posPct);setVal('multi-position1-value', multiParams.masses[0].posPct);
  setVal('multi-angle1',    Math.round((rad2deg(multiParams.masses[0].phase)+360)%360));
  setVal('multi-angle1-value', Math.round((rad2deg(multiParams.masses[0].phase)+360)%360));

  // Mass 2
  setVal('multi-mass2',     multiParams.masses[1].m_g);   setVal('multi-mass2-value',     multiParams.masses[1].m_g);
  setVal('multi-radius2',   multiParams.masses[1].r_mm);  setVal('multi-radius2-value',   multiParams.masses[1].r_mm);
  setVal('multi-position2', multiParams.masses[1].posPct);setVal('multi-position2-value', multiParams.masses[1].posPct);
  setVal('multi-angle2',    Math.round((rad2deg(multiParams.masses[1].phase)+360)%360));
  setVal('multi-angle2-value', Math.round((rad2deg(multiParams.masses[1].phase)+360)%360));

  // Mass 3
  setVal('multi-mass3',     multiParams.masses[2].m_g);   setVal('multi-mass3-value',     multiParams.masses[2].m_g);
  setVal('multi-radius3',   multiParams.masses[2].r_mm);  setVal('multi-radius3-value',   multiParams.masses[2].r_mm);
  setVal('multi-position3', multiParams.masses[2].posPct);setVal('multi-position3-value', multiParams.masses[2].posPct);
  setVal('multi-angle3',    Math.round((rad2deg(multiParams.masses[2].phase)+360)%360));
  setVal('multi-angle3-value', Math.round((rad2deg(multiParams.masses[2].phase)+360)%360));

  updateBalanceLabel('multi-apply', multiParams.isBalanced);
  updateBalanceDisplay();
}

function wireMultiControls() {
  bindRangeNumber('multi-rpm', 'multi-rpm-value', (rpm) => {
    multiParams.omega = (rpm * 2 * Math.PI) / 60;
    // RPM change does NOT auto-remove balance (as requested)
  });

  // Mass 1
  bindRangeNumber('multi-mass1',     'multi-mass1-value',     v => { multiParams.masses[0].m_g = v; autoUnapplyMultiBalance(); });
  bindRangeNumber('multi-radius1',   'multi-radius1-value',   v => { multiParams.masses[0].r_mm = v; autoUnapplyMultiBalance(); });
  bindRangeNumber('multi-position1', 'multi-position1-value', v => { multiParams.masses[0].posPct = v; autoUnapplyMultiBalance(); });
  bindRangeNumber('multi-angle1',    'multi-angle1-value',    v => { multiParams.masses[0].phase = normAngRad(deg2rad(v)); autoUnapplyMultiBalance(); });

  // Mass 2
  bindRangeNumber('multi-mass2',     'multi-mass2-value',     v => { multiParams.masses[1].m_g = v; autoUnapplyMultiBalance(); });
  bindRangeNumber('multi-radius2',   'multi-radius2-value',   v => { multiParams.masses[1].r_mm = v; autoUnapplyMultiBalance(); });
  bindRangeNumber('multi-position2', 'multi-position2-value', v => { multiParams.masses[1].posPct = v; autoUnapplyMultiBalance(); });
  bindRangeNumber('multi-angle2',    'multi-angle2-value',    v => { multiParams.masses[1].phase = normAngRad(deg2rad(v)); autoUnapplyMultiBalance(); });

  // Mass 3
  bindRangeNumber('multi-mass3',     'multi-mass3-value',     v => { multiParams.masses[2].m_g = v; autoUnapplyMultiBalance(); });
  bindRangeNumber('multi-radius3',   'multi-radius3-value',   v => { multiParams.masses[2].r_mm = v; autoUnapplyMultiBalance(); });
  bindRangeNumber('multi-position3', 'multi-position3-value', v => { multiParams.masses[2].posPct = v; autoUnapplyMultiBalance(); });
  bindRangeNumber('multi-angle3',    'multi-angle3-value',    v => { multiParams.masses[2].phase = normAngRad(deg2rad(v)); autoUnapplyMultiBalance(); });

  const balanceBtn = $('multi-apply');
  if (balanceBtn && !balanceBtn._bound) {
    balanceBtn._bound = true;
    balanceBtn.addEventListener('click', () => {
      multiParams.isBalanced = !multiParams.isBalanced;
      if (multiParams.isBalanced) calculateMultiBalance();
      updateBalanceLabel('multi-apply', multiParams.isBalanced);
      updateBalanceDisplay();
    });
  }

  const pauseBtn = $('multi-pause');
  if (pauseBtn && !pauseBtn._bound) {
    pauseBtn._bound = true;
    pauseBtn.addEventListener('click', () => {
      multiPaused = !multiPaused;
      pauseBtn.textContent = multiPaused ? 'Resume' : 'Pause';
    });
  }

  const slowmoBtn = $('multi-slowmo');
  if (slowmoBtn && !slowmoBtn._bound) {
    slowmoBtn._bound = true;
    updateSlowmoLabel('multi-slowmo');
    slowmoBtn.addEventListener('click', () => {
      timeScale = (timeScale === 1 ? SLOWMO_SCALE : 1);
      updateSlowmoLabel('multi-slowmo');
    });
  }

  const resetBtn = $('multi-reset');
  if (resetBtn && !resetBtn._bound) {
    resetBtn._bound = true;
    resetBtn.addEventListener('click', resetMulti);
  }
}

/* -----------------------------------------------------------
   SINGLE PLANE - Front View (uses global singlePaused/timeScale)
----------------------------------------------------------- */
const singleFrontSketch = (p) => {
  let theta = 0;
  let parentEl, canvas;

  p.setup = function() {
    wireSingleControls();
    parentEl = $('single-front-view');
    const { w, h } = measureBox(parentEl, 0.62, 320);
    canvas = p.createCanvas(w, h);
    canvas.parent(parentEl);
    p.ellipseMode(p.CENTER);
    p.strokeCap(p.ROUND);
  };

  p.windowResized = function() {
    const { w, h } = measureBox(parentEl, 0.62, 320);
    p.resizeCanvas(w, h);
  };

  p.draw = function() {
    p.background(255);
    const dt = (p.deltaTime / 1000) * (singlePaused ? 0 : timeScale);

    if (singleParams.omega < 0.1) {
      const targetAngle = singleParams.isBalanced ? 0 : Math.PI/2;
      const diff = Math.atan2(Math.sin(targetAngle - theta), Math.cos(targetAngle - theta));
      const settleRate = 2.0;
      theta += diff * Math.min(1, dt * settleRate);
    } else {
      theta += singleParams.omega * dt;
    }

    let vibrationX = 0, vibrationY = 0;
    if (!singleParams.isBalanced && singleParams.omega > 0.1) {
      const vibrationMag = Math.min(10, (singleParams.mass_g * singleParams.radius_mm * singleParams.omega * singleParams.omega) / 10000);
      vibrationX = vibrationMag * Math.cos(theta);
      vibrationY = vibrationMag * Math.sin(theta);
    }

    p.push();
    p.translate(p.width/2 + vibrationX, p.height/2 + vibrationY);

    const margin = 24;
    const maxR = Math.max(singleParams.rotorRadius_mm, singleParams.radius_mm);
    const s = (Math.min(p.width, p.height) - 2*margin) / (2*maxR);

    // dashed 0° reference (rotating)
    const bodyLen = (Math.min(p.width, p.height) - 2*margin) / 2;
    dashedZeroRay(p, bodyLen, theta);

    p.noFill();
    p.stroke(0, 60);
    p.strokeWeight(2);
    p.circle(0, 0, 2 * singleParams.rotorRadius_mm * s);

    p.stroke(0, 20);
    for (let i = 0; i < 8; i++) {
      const a = theta + (i * Math.PI) / 4;
      p.line(0, 0, Math.cos(a) * singleParams.rotorRadius_mm * s, Math.sin(a) * singleParams.rotorRadius_mm * s);
    }

    const r = singleParams.radius_mm * s;
    const mx = Math.cos(theta) * r;
    const my = Math.sin(theta) * r;
    p.stroke(colours.red, 120);
    drawArrow(p, 0, 0, mx, my, 10, Math.PI/7, 2);
    p.noStroke();
    p.fill(colours.red);
    p.circle(mx, my, 12);

    if (singleParams.isBalanced) {
      const br = singleParams.balanceRadius_mm * s;
      const bx = Math.cos(theta + singleParams.balanceAngle) * br;
      const by = Math.sin(theta + singleParams.balanceAngle) * br;
      p.stroke(colours.green, 120);
      drawArrow(p, 0, 0, bx, by, 10, Math.PI/7, 2);
      p.noStroke();
      p.fill(colours.green);
      p.circle(bx, by, 12);
    }

    p.fill(0);
    p.circle(0, 0, 4);
    p.pop();

    p.noStroke();
    p.fill(30);
    p.textSize(13);
    p.textAlign(p.LEFT, p.TOP);
    const rpm = (singleParams.omega * 60) / (2 * Math.PI);
    p.text(`Single * FRONT (x-y)\nRPM: ${rpm.toFixed(0)}  Balance: ${singleParams.isBalanced ? 'ON' : 'OFF'}`, 10, 10);

    const statusEl = $('single-status');
    if (statusEl) {
      const statusValue = statusEl.querySelector('.status-value');
      if (statusValue) {
        statusValue.textContent = singleParams.isBalanced ? 'Balanced' : 'Unbalanced';
        statusValue.className = 'status-value ' + (singleParams.isBalanced ? 'balanced' : 'unbalanced');
      }
    }
  };
};

/* -----------------------------------------------------------
   SINGLE PLANE - Side View
----------------------------------------------------------- */
const singleSideSketch = (p) => {
  let theta = 0;
  let parentEl, canvas;

  p.setup = function() {
    parentEl = $('single-side-view');
    const { w, h } = measureBox(parentEl, 0.62, 240);
    canvas = p.createCanvas(w, h);
    canvas.parent(parentEl);
    p.strokeCap(p.ROUND);
  };

  p.windowResized = function() {
    const { w, h } = measureBox(parentEl, 0.62, 240);
    p.resizeCanvas(w, h);
  };

  p.draw = function() {
    p.background(255);
    const dt = (p.deltaTime / 1000) * (singlePaused ? 0 : timeScale);

    if (singleParams.omega < 0.1) {
      const targetAngle = singleParams.isBalanced ? 0 : -Math.PI/2;
      const diff = Math.atan2(Math.sin(targetAngle - theta), Math.cos(targetAngle - theta));
      const settleRate = 2.0;
      theta += diff * Math.min(1, dt * settleRate);
    } else {
      theta += singleParams.omega * dt;
    }

    let vibrationY = 0;
    if (!singleParams.isBalanced && singleParams.omega > 0.1) {
      vibrationY = Math.min(15, (singleParams.mass_g * singleParams.radius_mm * singleParams.omega * singleParams.omega) / 10000) * Math.sin(theta);
    }

    const leftX = 60;
    const rightX = p.width - 60;
    const centerX = (leftX + rightX) / 2;
    const midY = p.height / 2;

    p.stroke(0, 60);
    p.strokeWeight(4);
    p.line(leftX, midY + vibrationY, rightX, midY + vibrationY);

    p.stroke(0, 120);
    p.strokeWeight(3);
    p.line(leftX, midY - 30, leftX, midY + 30);
    p.line(rightX, midY - 30, rightX, midY + 30);

    const s_side = (p.height - 60) / (2 * Math.max(1, singleParams.rotorRadius_mm));
    const y = s_side * singleParams.radius_mm * Math.sin(theta);

    p.stroke(colours.red[0], colours.red[1], colours.red[2]);
    p.strokeWeight(3);
    p.line(centerX, midY + vibrationY, centerX, midY + vibrationY - y);
    p.noStroke();
    p.fill(colours.red[0], colours.red[1], colours.red[2]);
    p.circle(centerX, midY + vibrationY - y, 10);

    if (singleParams.isBalanced) {
      const by = s_side * singleParams.balanceRadius_mm * Math.sin(theta + singleParams.balanceAngle);
      p.stroke(colours.green[0], colours.green[1], colours.green[2]);
      p.strokeWeight(3);
      p.line(centerX, midY, centerX, midY - by);
      p.noStroke();
      p.fill(colours.green[0], colours.green[1], colours.green[2]);
      p.circle(centerX, midY - by, 8);
    }

    p.noStroke();
    p.fill(30);
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Single * SIDE (z-y)`, 10, 10);
  };
};

/* -----------------------------------------------------------
   SINGLE PLANE - MR Diagram with reactions (fixed scale)
----------------------------------------------------------- */
const singleMRSketch = (p) => {
  let theta = 0;
  let parentEl, canvas;

  p.setup = function() {
    parentEl = $('single-mr-diagram');
    const { w, h } = measureBox(parentEl, 0.62, 320);
    canvas = p.createCanvas(w, h);
    canvas.parent(parentEl);
    p.strokeCap(p.ROUND);
  };

  p.windowResized = function() {
    const { w, h } = measureBox(parentEl, 0.62, 320);
    p.resizeCanvas(w, h);
  };

  p.draw = function() {
    p.background(255);
    const dt = (p.deltaTime / 1000) * (singlePaused ? 0 : timeScale);

    if (singleParams.omega < 0.1) {
      const targetAngle = singleParams.isBalanced ? 0 : Math.PI/2;
      const diff = Math.atan2(Math.sin(targetAngle - theta), Math.cos(targetAngle - theta));
      const settleRate = 2.0;
      theta += diff * Math.min(1, dt * settleRate);
    } else {
      theta += singleParams.omega * dt;
    }

    const vectors = [];
    const MR = singleParams.mass_g * singleParams.radius_mm;
    vectors.push({ x: MR * Math.cos(theta), y: MR * Math.sin(theta), colour: colours.red, label: 'Unbalance' });

    if (singleParams.isBalanced) {
      const MR_bal = singleParams.balanceMass_g * singleParams.balanceRadius_mm;
      vectors.push({ x: MR_bal * Math.cos(theta + singleParams.balanceAngle), y: MR_bal * Math.sin(theta + singleParams.balanceAngle), colour: colours.green, label: 'Balance' });
    }

    let totalX = 0, totalY = 0;
    for (const v of vectors) { totalX += v.x; totalY += v.y; }

    const margin = 28;
    const s = MR_FIXED_SCALE;

    p.push();
    p.translate(p.width/2, p.height/2);

    p.noFill();
    p.stroke(0, 25);
    p.rectMode(p.CENTER);
    p.rect(0, 0, p.width - 2*margin, p.height - 2*margin, 8);
    // axes
    p.stroke(0, 40);
    p.line(-p.width, 0, p.width, 0);
    p.line(0, -p.height, 0, p.height);
    // rotating dashed 0° reference
    const mrLen = (p.width / 2) - margin;
    dashedZeroRay(p, mrLen, theta);

    let cx = 0, cy = 0;
    for (const v of vectors) {
      p.stroke(v.colour[0], v.colour[1], v.colour[2]);
      p.strokeWeight(3);
      const nx = cx + v.x * s;
      const ny = cy + v.y * s;
      drawArrow(p, cx, cy, nx, ny, 12, Math.PI/7, 3);
      cx = nx; cy = ny;
    }

    if (!singleParams.isBalanced && (Math.abs(totalX) > 0.1 || Math.abs(totalY) > 0.1)) {
      p.stroke(0, 0, 0, 140);
      p.strokeWeight(2);
      drawArrow(p, 0, 0, totalX * s, totalY * s, 10, Math.PI/7, 2);
    }

    p.pop();

    p.noStroke();
    p.fill(30);
    p.textSize(13);
    p.textAlign(p.LEFT, p.TOP);
    const resultantMag = Math.sqrt(totalX*totalX + totalY*totalY);
    p.text(`Single * MR Diagram\n|MR| = ${resultantMag.toFixed(0)} gmm`, 10, 10);
  };
};

/* -----------------------------------------------------------
   SINGLE PLANE - Forces & Reactions (fixed scale, green only when applied)
----------------------------------------------------------- */
const singleForcesSketch = (p) => {
  let theta = 0;
  let parentEl, canvas;

  p.setup = function() {
    parentEl = $('single-force-diagram');
    const { w, h } = measureBox(parentEl, 0.45, 240);
    canvas = p.createCanvas(w, h);
    canvas.parent(parentEl);
    p.strokeCap(p.ROUND);
  };

  p.windowResized = function() {
    const { w, h } = measureBox(parentEl, 0.45, 240);
    p.resizeCanvas(w, h);
  };

  p.draw = function() {
    p.background(255);
    const dt = (p.deltaTime / 1000) * (singlePaused ? 0 : timeScale);

    if (singleParams.omega < 0.1) {
      const targetAngle = singleParams.isBalanced ? 0 : -Math.PI/2;
      const diff = Math.atan2(Math.sin(targetAngle - theta), Math.cos(targetAngle - theta));
      const settleRate = 2.0;
      theta += diff * Math.min(1, dt * settleRate);
    } else {
      theta += singleParams.omega * dt;
    }

    const leftX = 50, rightX = p.width - 50, midY = p.height/2;

    let vibrationY = 0;
    if (!singleParams.isBalanced && singleParams.omega > 0.1) {
      vibrationY = Math.min(15, (singleParams.mass_g * singleParams.radius_mm * singleParams.omega * singleParams.omega) / 20000) * Math.sin(theta);
    }

    p.stroke(0, 60);
    p.strokeWeight(3);
    p.line(leftX, midY + vibrationY, rightX, midY + vibrationY);

    p.strokeWeight(2);
    p.line(leftX, midY + 25, leftX, midY - 25);
    p.line(rightX, midY + 25, rightX, midY - 25);

    const F = singleParams.mass_g * singleParams.radius_mm * (singleParams.omega ** 2);
    const scaleF = FORCE_FIXED_SCALE;

    const F1 = singleParams.mass_g * singleParams.radius_mm * (singleParams.omega ** 2);
    const Fx1 = F1 * Math.cos(theta) * scaleF;
    const Fy1 = F1 * Math.sin(theta) * scaleF;
    p.stroke(colours.red[0], colours.red[1], colours.red[2]);
    drawArrow(p, (leftX + rightX)/2, midY + vibrationY, (leftX + rightX)/2 + Fx1, midY + vibrationY - Fy1, 10, Math.PI/7, 3);

    let Fx2 = 0, Fy2 = 0;
    if (singleParams.isBalanced) {
      const F2 = singleParams.balanceMass_g * singleParams.balanceRadius_mm * (singleParams.omega ** 2);
      Fx2 = F2 * Math.cos(theta + singleParams.balanceAngle) * scaleF;
      Fy2 = F2 * Math.sin(theta + singleParams.balanceAngle) * scaleF;
      p.stroke(colours.green[0], colours.green[1], colours.green[2]);
      drawArrow(p, (leftX + rightX)/2, midY + vibrationY, (leftX + rightX)/2 + Fx2, midY + vibrationY - Fy2, 10, Math.PI/7, 3);
    }

    const Rx = -(Fx1 + Fx2) / 2;
    const Ry =  (Fy1 + Fy2) / 2;
    p.stroke(colours.purple[0], colours.purple[1], colours.purple[2]);
    drawArrow(p, leftX, midY, leftX + Rx, midY - Ry, 8, Math.PI/7, 2);
    drawArrow(p, rightX, midY, rightX + Rx, midY - Ry, 8, Math.PI/7, 2);

    p.noStroke();
    p.fill(30);
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Single * Forces & Reactions\nStatus: ${singleParams.isBalanced ? 'Balanced' : 'Unbalanced'}`, 10, 10);

    const forceEl = $('single-force');
    if (forceEl) {
      const forceN = F * 0.001 * 0.001 * (singleParams.omega ** 2);
      forceEl.textContent = forceN.toFixed(1) + ' N';
    }
  };
};

/* -----------------------------------------------------------
   MULTI-PLANE - Front View (global multiPaused/timeScale)
----------------------------------------------------------- */
const multiFrontSketch = (p) => {
  let theta = 0;
  let parentEl, canvas;

  p.setup = function() {
    wireMultiControls();
    parentEl = $('multi-front-view');
    const { w, h } = measureBox(parentEl, 0.62, 320);
    canvas = p.createCanvas(w, h);
    canvas.parent(parentEl);
    p.ellipseMode(p.CENTER);
    p.strokeCap(p.ROUND);
  };

  p.windowResized = function() {
    const { w, h } = measureBox(parentEl, 0.62, 320);
    p.resizeCanvas(w, h);
  };

  p.draw = function() {
    p.background(255);
    const dt = (p.deltaTime / 1000) * (multiPaused ? 0 : timeScale);

    // Heavy side down: +/2 - COM angle
    if (multiParams.omega < 0.1) {
      const comAngle = calculateMultiCentreOfMass(theta);
      const targetAngle = theta + (Math.PI/2 - comAngle);
      const angleDiff = targetAngle - theta;
      multiParams.angularVel += angleDiff * 0.05;
      multiParams.angularVel *= GRAVITY_DAMPING;
      theta += multiParams.angularVel * dt;
    } else {
      theta += multiParams.omega * dt;
      multiParams.angularVel = 0;
    }

    let vibrationX = 0, vibrationY = 0;
    if (!multiParams.isBalanced && multiParams.omega > 0.1) {
      let totalFx = 0, totalFy = 0;
      for (const m of multiParams.masses) {
        const angle = theta + m.phase;
        totalFx += m.m_g * m.r_mm * Math.cos(angle);
        totalFy += m.m_g * m.r_mm * Math.sin(angle);
      }
      const vibrationMag = Math.min(10, Math.hypot(totalFx, totalFy) * multiParams.omega * multiParams.omega / 20000);
      vibrationX = vibrationMag * Math.cos(theta);
      vibrationY = vibrationMag * Math.sin(theta);
    }

    p.push();
    p.translate(p.width/2 + vibrationX, p.height/2 + vibrationY);

    const margin = 24;
    const maxR = Math.max(multiParams.rotorRadius_mm, ...multiParams.masses.map(m => m.r_mm));
    const s = (Math.min(p.width, p.height) - 2*margin) / (2*maxR);

    // dashed 0° reference (rotating)
    const bodyLen = (Math.min(p.width, p.height) - 2*margin) / 2;
    dashedZeroRay(p, bodyLen, theta);

    p.noFill();
    p.stroke(0, 25);
    p.rectMode(p.CENTER);
    p.rect(0, 0, p.width - 2*margin, p.height - 2*margin, 8);
    p.stroke(0, 70);
    p.strokeWeight(2);
    p.circle(0, 0, 2 * multiParams.rotorRadius_mm * s);

    for (const m of multiParams.masses) {
      const ang = theta + m.phase;
      const x = Math.cos(ang) * m.r_mm * s;
      const y = Math.sin(ang) * m.r_mm * s;
      p.stroke(0, 100);
      drawArrow(p, 0, 0, x, y, 10, Math.PI/7, 2);
      p.noStroke();
      p.fill(...m.colour);
      p.circle(x, y, 12);
    }

    if (multiParams.isBalanced) {
      // Draw M first, then L (MR diagram will thus end with L closing)
      const bmM = multiParams.balanceMasses[1];
      const bmL = multiParams.balanceMasses[0];
      for (const bm of [bmM, bmL]) {
        const x = Math.cos(theta + bm.angle) * bm.r_mm * s;
        const y = Math.sin(theta + bm.angle) * bm.r_mm * s;
        p.stroke(colours.green[0], colours.green[1], colours.green[2], 100);
        drawArrow(p, 0, 0, x, y, 10, Math.PI/7, 2);
        p.noStroke();
        p.fill(...colours.green);
        p.circle(x, y, 10);
      }
    }

    p.fill(0);
    p.circle(0, 0, 4);
    p.pop();

    p.noStroke();
    p.fill(30);
    p.textSize(13);
    p.textAlign(p.LEFT, p.TOP);
    const rpm = (multiParams.omega * 60) / (2 * Math.PI);
    p.text(`Multi * FRONT (x-y)\nRPM: ${rpm.toFixed(0)}  Balance: ${multiParams.isBalanced ? 'ON' : 'OFF'}`, 10, 10);

    const statusEl = $('multi-status');
    if (statusEl) {
      const statusValue = statusEl.querySelector('.status-value');
      if (statusValue) {
        statusValue.textContent = multiParams.isBalanced ? 'Balanced' : 'Unbalanced';
        statusValue.className = 'status-value ' + (multiParams.isBalanced ? 'balanced' : 'unbalanced');
      }
    }
  };
};

/* -----------------------------------------------------------
   MULTI-PLANE - Side View
----------------------------------------------------------- */
const multiSideSketch = (p) => {
  let theta = 0;
  let parentEl, canvas;

  p.setup = function() {
    parentEl = $('multi-side-view');
    const { w, h } = measureBox(parentEl, 0.62, 320);
    canvas = p.createCanvas(w, h);
    canvas.parent(parentEl);
    p.strokeCap(p.ROUND);
  };

  p.windowResized = function() {
    const { w, h } = measureBox(parentEl, 0.62, 320);
    p.resizeCanvas(w, h);
  };

  p.draw = function() {
    p.background(255);
    const dt = (p.deltaTime / 1000) * (multiPaused ? 0 : timeScale);

    // Heavy side down
    if (multiParams.omega < 0.1) {
      const comAngle = calculateMultiCentreOfMass(theta);
      const targetAngle = theta + (Math.PI/2 - comAngle);
      const angleDiff = targetAngle - theta;
      multiParams.angularVel += angleDiff * 0.05;
      multiParams.angularVel *= GRAVITY_DAMPING;
      theta += multiParams.angularVel * dt;
    } else {
      theta += multiParams.omega * dt;
    }

    const margin = 24;
    const panelW = p.width - 2*margin;
    const panelH = p.height - 2*margin;

    p.push();
    p.translate(p.width/2, p.height/2);

    const maxR = Math.max(multiParams.rotorRadius_mm, ...multiParams.masses.map(m => m.r_mm));
    const zSpan = 2 * multiParams.shaftHalfLen_mm;
    const ySpan = 2 * maxR;
    const sx = panelW / zSpan;
    const sy = panelH / ySpan;
    const X = (zmm) => zmm * sx;
    const Y = (ymm) => ymm * sy;

    let vibrationY = 0;
    if (!multiParams.isBalanced && multiParams.omega > 0.1) {
      let totalFy = 0;
      for (const m of multiParams.masses) {
        const angle = theta + m.phase;
        totalFy += m.m_g * m.r_mm * Math.sin(angle);
      }
      vibrationY = Math.min(10, Math.abs(totalFy) * multiParams.omega * multiParams.omega / 20000);
    }

    p.noFill();
    p.stroke(0, 25);
    p.rectMode(p.CENTER);
    p.rect(0, 0, panelW, panelH, 8);

    p.stroke(0, 50);
    p.line(X(-multiParams.shaftHalfLen_mm), Y(0) + vibrationY * Math.sin(theta),
           X(multiParams.shaftHalfLen_mm),  Y(0) + vibrationY * Math.sin(theta));

    p.stroke(0, 120);
    p.line(X(-multiParams.shaftHalfLen_mm), Y(-maxR), X(-multiParams.shaftHalfLen_mm), Y(maxR));
    p.line(X(multiParams.shaftHalfLen_mm),  Y(-maxR), X(multiParams.shaftHalfLen_mm),  Y(maxR));

    // Balance plane markers
    const zL = posPctToZmm(10, multiParams.shaftHalfLen_mm);
    const zM = posPctToZmm(90, multiParams.shaftHalfLen_mm);
    p.stroke(colours.green[0], colours.green[1], colours.green[2], 60);
    p.strokeWeight(1);
    p.line(X(zL), Y(-maxR), X(zL), Y(maxR));
    p.line(X(zM), Y(-maxR), X(zM), Y(maxR));
    // Labels "L" and "M"
    p.noStroke();
    p.fill(30);
    p.textSize(12);
    p.textAlign(p.CENTER, p.TOP);
    p.text('L', X(zL), Y(maxR) - 16);
    p.text('M', X(zM), Y(maxR) - 16);

    for (const m of multiParams.masses) {
      const ang = theta + m.phase;
      const zmm = posPctToZmm(m.posPct, multiParams.shaftHalfLen_mm);
      const ymm = m.r_mm * Math.sin(ang);
      p.stroke(...m.colour);
      p.strokeWeight(3);
      drawArrow(p, X(zmm), Y(0) + vibrationY * Math.sin(theta), X(zmm), Y(ymm) + vibrationY * Math.sin(theta), 10, Math.PI/7, 3);
      p.noStroke();
      p.fill(...m.colour);
      p.circle(X(zmm), Y(ymm) + vibrationY * Math.sin(theta), 10);
    }

    if (multiParams.isBalanced) {
      for (const bm of multiParams.balanceMasses) {
        const zmm = posPctToZmm(bm.posPct, multiParams.shaftHalfLen_mm);
        const ymm = bm.r_mm * Math.sin(theta + bm.angle);
        p.stroke(...colours.green);
        p.strokeWeight(2);
        drawArrow(p, X(zmm), Y(0), X(zmm), Y(ymm), 8, Math.PI/7, 2);
        p.noStroke();
        p.fill(...colours.green);
        p.circle(X(zmm), Y(ymm), 8);
      }
    }

    p.pop();

    p.noStroke();
    p.fill(30);
    p.textSize(13);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Multi * SIDE (z-y)`, 10, 10);
  };
};

/* -----------------------------------------------------------
   MULTI-PLANE - MR Diagram (fixed scale, show 5 arrows: 3 masses, green M, green L closing)
----------------------------------------------------------- */
const multiMRSketch = (p) => {
  let theta = 0;
  let parentEl, canvas;

  p.setup = function() {
    parentEl = $('multi-mr-diagram');
    const { w, h } = measureBox(parentEl, 0.62, 320);
    canvas = p.createCanvas(w, h);
    canvas.parent(parentEl);
    p.strokeCap(p.ROUND);
  };

  p.windowResized = function() {
    const { w, h } = measureBox(parentEl, 0.62, 320);
    p.resizeCanvas(w, h);
  };

  p.draw = function() {
    p.background(255);
    const dt = (p.deltaTime / 1000) * (multiPaused ? 0 : timeScale);

    // Heavy side down
    if (multiParams.omega < 0.1) {
      const comAngle = calculateMultiCentreOfMass(theta);
      const targetAngle = theta + (Math.PI/2 - comAngle);
      const angleDiff = targetAngle - theta;
      multiParams.angularVel += angleDiff * 0.05;
      multiParams.angularVel *= GRAVITY_DAMPING;
      theta += multiParams.angularVel * dt;
    } else {
      theta += multiParams.omega * dt;
    }

    // Build: red, blue, orange, green M, green L
    const vectors = [];
    for (const m of multiParams.masses) {
      const MR = m.m_g * m.r_mm;
      const ang = theta + m.phase;
      vectors.push({ x: MR * Math.cos(ang), y: MR * Math.sin(ang), colour: m.colour, label: `Mass ${m.id}` });
    }
    if (multiParams.isBalanced) {
      const bmM = multiParams.balanceMasses[1];
      const bmL = multiParams.balanceMasses[0];
      const MR_M = bmM.m_g * bmM.r_mm;
      const MR_L = bmL.m_g * bmL.r_mm;
      vectors.push({ x: MR_M * Math.cos(theta + bmM.angle), y: MR_M * Math.sin(theta + bmM.angle), colour: colours.green, label: 'M' });
      vectors.push({ x: MR_L * Math.cos(theta + bmL.angle), y: MR_L * Math.sin(theta + bmL.angle), colour: colours.green, label: 'L' });
    }

    let totalX = 0, totalY = 0;
    for (const v of vectors) { totalX += v.x; totalY += v.y; }

    const margin = 28;
    const s = MR_MULTI_FIXED_SCALE;

    p.push();
    p.translate(p.width/2, p.height/2);

    p.noFill();
    p.stroke(0, 25);
    p.rectMode(p.CENTER);
    p.rect(0, 0, p.width - 2*margin, p.height - 2*margin, 8);

    // axes
    p.stroke(0, 40);
    p.line(-p.width, 0, p.width, 0);
    p.line(0, -p.height, 0, p.height);
    // rotating dashed 0° reference
    const mrLen = (p.width / 2) - margin;
    dashedZeroRay(p, mrLen, theta);

    p.strokeWeight(3);
    let cx = 0, cy = 0;
    for (const v of vectors) {
      p.stroke(...v.colour);
      const nx = cx + v.x * s;
      const ny = cy + v.y * s; // +y
      drawArrow(p, cx, cy, nx, ny, 12, Math.PI/7, 3);
      cx = nx; cy = ny;
    }

    // No black resultant when balanced; if unbalanced, show resultant
    if (!multiParams.isBalanced && (Math.abs(totalX) > 0.1 || Math.abs(totalY) > 0.1)) {
      p.stroke(0, 0, 0, 140);
      p.strokeWeight(2);
      drawArrow(p, 0, 0, totalX * s, totalY * s, 10, Math.PI/7, 2);
    }

    p.pop();

    p.noStroke();
    p.fill(30);
    p.textSize(13);
    p.textAlign(p.LEFT, p.TOP);
    const resultantMag = Math.sqrt(totalX*totalX + totalY*totalY);
    p.text(`Multi * MR Diagram\n|MR| = ${resultantMag.toFixed(0)} gmm`, 10, 10);
  };
};

/* -----------------------------------------------------------
   MULTI-PLANE - MRL Diagram (fixed scale, 4 arrows: red, blue, orange, green M closing; L is zero)
----------------------------------------------------------- */
const multiMRLSketch = (p) => {
  let theta = 0;
  let parentEl, canvas;

  p.setup = function() {
    parentEl = $('multi-mrl-diagram');
    const { w, h } = measureBox(parentEl, 0.62, 320);
    canvas = p.createCanvas(w, h);
    canvas.parent(parentEl);
    p.strokeCap(p.ROUND);
  };

  p.windowResized = function() {
    const { w, h } = measureBox(parentEl, 0.62, 320);
    p.resizeCanvas(w, h);
  };

  p.draw = function() {
    p.background(255);
    const dt = (p.deltaTime / 1000) * (multiPaused ? 0 : timeScale);

    // Heavy side down
    if (multiParams.omega < 0.1) {
      const comAngle = calculateMultiCentreOfMass(theta);
      const targetAngle = theta + (Math.PI/2 - comAngle);
      const angleDiff = targetAngle - theta;
      multiParams.angularVel += angleDiff * 0.05;
      multiParams.angularVel *= GRAVITY_DAMPING;
      theta += multiParams.angularVel * dt;
    } else {
      theta += multiParams.omega * dt;
    }

    // Reference at L
    const zL = posPctToZmm(multiParams.balanceMasses[0].posPct, multiParams.shaftHalfLen_mm);

    // Three MRL mass vectors
    const vectors = [];
    for (const m of multiParams.masses) {
      const MR = m.m_g * m.r_mm;
      const z  = posPctToZmm(m.posPct, multiParams.shaftHalfLen_mm);
      const L  = z - zL;
      const ang = theta + m.phase;
      vectors.push({ x: MR * L * Math.cos(ang), y: MR * L * Math.sin(ang), colour: m.colour });
    }

    // M plane MRL
    if (multiParams.isBalanced) {
      const bmM = multiParams.balanceMasses[1];
      const zM = posPctToZmm(bmM.posPct, multiParams.shaftHalfLen_mm);
      const L_M = zM - zL; // non-zero
      const MR_M = bmM.m_g * bmM.r_mm;
      vectors.push({ x: MR_M * L_M * Math.cos(theta + bmM.angle), y: MR_M * L_M * Math.sin(theta + bmM.angle), colour: colours.green });
    }

    let totalX = 0, totalY = 0;
    for (const v of vectors) { totalX += v.x; totalY += v.y; }

    const margin = 28;
    const s = MRL_MULTI_FIXED_SCALE;

    p.push();
    p.translate(p.width/2, p.height/2);

    p.noFill();
    p.stroke(0, 25);
    p.rectMode(p.CENTER);
    p.rect(0, 0, p.width - 2*margin, p.height - 2*margin, 8);

    // axes
    p.stroke(0, 40);
    p.line(-p.width, 0, p.width, 0);
    p.line(0, -p.height, 0, p.height);
    // rotating dashed 0° reference
    const mrlLen = (p.width / 2) - margin;
    dashedZeroRay(p, mrlLen, theta);

    p.strokeWeight(3);
    let cx = 0, cy = 0;
    for (const v of vectors) {
      p.stroke(...v.colour);
      const nx = cx + v.x * s;
      const ny = cy + v.y * s;
      drawArrow(p, cx, cy, nx, ny, 12, Math.PI/7, 3);
      cx = nx; cy = ny;
    }

    // Resultant (black) - show only when NOT balanced
    if (!multiParams.isBalanced && (Math.abs(totalX) > 0.1 || Math.abs(totalY) > 0.1)) {
      p.stroke(0, 0, 0, 200);
      drawArrow(p, 0, 0, totalX * s, totalY * s, 12, Math.PI/7, 2);
    }
    // When balanced, polygon closes via green M; no black resultant.

    p.pop();

    p.noStroke();
    p.fill(30);
    p.textSize(13);
    p.textAlign(p.LEFT, p.TOP);
    const resultantMag = Math.sqrt(totalX*totalX + totalY*totalY);
    p.text(`Multi * MRL Diagram (ref: L)\n|MRL| = ${resultantMag.toFixed(0)} gmm`, 10, 10);
  };
};

/* -----------------------------------------------------------
   Boot all p5 instances
----------------------------------------------------------- */
let p5_instances = [];

function boot() {
  p5_instances.forEach(instance => { if (instance && instance.remove) instance.remove(); });
  p5_instances = [];

  // Single
  p5_instances.push(new p5(singleFrontSketch));
  p5_instances.push(new p5(singleSideSketch));
  p5_instances.push(new p5(singleMRSketch));
  p5_instances.push(new p5(singleForcesSketch));

  // Multi
  p5_instances.push(new p5(multiFrontSketch));
  p5_instances.push(new p5(multiSideSketch));
  p5_instances.push(new p5(multiMRSketch));
  p5_instances.push(new p5(multiMRLSketch));

  updateBalanceDisplay();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
