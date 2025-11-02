/* ===================================================================
   BALANCING OF ROTATING MASSES - Interactive Simulation

   This simulation demonstrates single-plane and multi-plane balancing
   of rotating systems. It visualizes mass-radius products (MR),
   centrifugal forces, and bearing reactions.

   Units: mass in grams (g), radius in mm, angles in radians
   =================================================================== */

/* -------------------------------------------------------------------
   GLOBAL CONFIGURATION
   ------------------------------------------------------------------- */
let timeScale = 1;                    // Animation speed multiplier
const SLOWMO_SCALE = 0.15;            // Slow motion speed
const GRAVITY_DAMPING = 0.95;         // Damping for gravity settling animation

// Visualization scale factors (pixels per unit)
const MR_FIXED_SCALE = 0.2;           // For single-plane MR diagram (px per g·mm)
const FORCE_FIXED_SCALE = 0.004;      // For forces & reactions (px per g·mm·rad²/s²)
const MR_MULTI_FIXED_SCALE = 0.02;    // For multi-plane MR diagram (px per g·mm)
const MRL_MULTI_FIXED_SCALE = 0.0001; // For multi-plane MRL diagram (px per g·mm²)

// Pause states (shared across all canvases in each mode)
let singlePaused = false;
let multiPaused = false;

// Color palette for masses and balance weights
const colours = {
  red:    [220, 60, 60],
  blue:   [20, 120, 255],
  orange: [255, 140, 0],
  green:  [40, 170, 40],
  gray:   [120, 120, 120],
  purple: [150, 50, 200],
};

/* -------------------------------------------------------------------
   UTILITY FUNCTIONS
   ------------------------------------------------------------------- */

// Convert degrees to radians
const deg2rad = d => (d * Math.PI) / 180;

// Convert radians to degrees
const rad2deg = r => (r * 180) / Math.PI;

// Normalize angle to [0, 2π)
const normAngRad = r => {
  let a = r % (2 * Math.PI);
  if (a < 0) a += 2 * Math.PI;
  return a;
};

// Get DOM element by ID
const $ = (id) => document.getElementById(id);

// Convert axial position percentage to z-coordinate in mm
function posPctToZmm(pct, halfLen) {
  const clamped = Math.max(0, Math.min(100, pct));
  return -halfLen + (2 * halfLen) * (clamped / 100);
}

// Measure canvas dimensions based on parent element
function measureBox(parentEl, aspect = 0.62, minH = 300) {
  const w = parentEl?.clientWidth || 600;
  const h = Math.max(minH, Math.floor(w * aspect));
  return { w, h };
}

/* -------------------------------------------------------------------
   DRAWING UTILITIES
   ------------------------------------------------------------------- */

// Draw a dashed reference ray rotating with the body (0° = +x axis)
function dashedZeroRay(p, len, thetaRad) {
  p.push();
  p.rotate(thetaRad);
  p.stroke(120);
  p.strokeWeight(1.5);
  p.drawingContext.setLineDash([6, 6]);
  p.line(0, 0, len, 0);
  p.drawingContext.setLineDash([]);
  p.pop();
}

// Draw an arrow from (x1,y1) to (x2,y2) with arrowhead
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

/* -------------------------------------------------------------------
   SINGLE-PLANE PARAMETERS & STATE

   Single-plane (static) balancing corrects unbalance in one plane.
   The center of mass is displaced from the rotation axis, causing
   centrifugal forces during rotation.
   ------------------------------------------------------------------- */

const singleParams = {
  omega: 0,                           // Angular velocity (rad/s)
  rotorRadius_mm: 110,                // Rotor disc radius (mm)
  isBalanced: false,                  // Balance applied flag
  balanceMass_g: 0,                   // Balance mass (g)
  balanceRadius_mm: 80,               // Balance mass radius (mm)
  balanceAngle: Math.PI,              // Balance mass angle (rad)
  masses: [                           // Unbalanced masses
    { m_g: 60, r_mm: 60, phase: deg2rad(0),   posPct: 50, colour: 'red' },
    { m_g: 80, r_mm: 80, phase: deg2rad(60),  posPct: 50, colour: 'blue' },
    { m_g: 50, r_mm: 50, phase: deg2rad(120), posPct: 50, colour: 'orange' },
  ],
};

// Default values for reset
const SINGLE_DEFAULTS = {
  rpm: 0,
  mass_g: 0,
  radius_mm: 0,
  balanceRadius_mm: singleParams.balanceRadius_mm,
  balanceAngle: Math.PI,
  isBalanced: false
};

/* -------------------------------------------------------------------
   MULTI-PLANE PARAMETERS & STATE

   Multi-plane (dynamic) balancing corrects both force and moment
   unbalance. Masses at different axial positions create both a net
   force and a net moment about the bearing plane.
   ------------------------------------------------------------------- */

const multiParams = {
  omega: 0,                           // Angular velocity (rad/s)
  shaftHalfLen_mm: 220,              // Half-length of shaft (mm)
  rotorRadius_mm: 120,               // Rotor disc radius (mm)
  isBalanced: false,                 // Balance applied flag
  masses: [                          // Unbalanced masses at various axial positions
    { id: 1, m_g: 60, r_mm: 60, posPct: 25, colour: colours.red,    phase: 0 },
    { id: 2, m_g: 80, r_mm: 80, posPct: 50, colour: colours.blue,   phase: Math.PI/3 },
    { id: 3, m_g: 50, r_mm: 50, posPct: 75, colour: colours.orange, phase: 2*Math.PI/3 },
  ],
  // Correction planes at 10% (L) and 90% (M) along shaft
  balanceMasses: [
    { plane: 'L', posPct: 10, m_g: 0, r_mm: 80, angle: 0, colour: colours.green },
    { plane: 'M', posPct: 90, m_g: 0, r_mm: 80, angle: 0, colour: colours.green },
  ],
  equilibriumAngle: 0,               // Target angle for gravity settling
  angularVel: 0,                     // Angular velocity for settling animation
};

// Default values for reset
const MULTI_DEFAULTS = {
  rpm: 0,
  isBalanced: false,
  rotorRadius_mm: multiParams.rotorRadius_mm,
  shaftHalfLen_mm: multiParams.shaftHalfLen_mm,
  masses: JSON.parse(JSON.stringify(multiParams.masses)),
  balanceMasses: JSON.parse(JSON.stringify(multiParams.balanceMasses)),
};

/* -------------------------------------------------------------------
   BALANCING CALCULATIONS
   ------------------------------------------------------------------- */

/**
 * Calculate single-plane balance mass and angle
 *
 * For static balance, we need: Σ(m·r) = 0
 * The balance mass is placed 180° opposite to the resultant MR vector.
 */
function calculateSingleBalance() {
  let MRx = 0, MRy = 0;

  // Sum all mass-radius products as vectors
  for (const m of singleParams.masses) {
    const MR = m.m_g * m.r_mm;
    MRx += MR * Math.cos(m.phase);
    MRy += MR * Math.sin(m.phase);
  }

  const MR_mag = Math.hypot(MRx, MRy);
  const MR_ang = Math.atan2(MRy, MRx);

  // Balance mass = MR_resultant / radius, placed 180° opposite
  if (!singleParams.balanceRadius_mm) singleParams.balanceRadius_mm = 80;
  singleParams.balanceMass_g = MR_mag / singleParams.balanceRadius_mm;
  singleParams.balanceAngle = (MR_ang + Math.PI) % (2 * Math.PI);
}

/**
 * Calculate multi-plane balance masses
 *
 * For dynamic balance, we need both:
 * 1. Force balance: Σ(m·r) = 0
 * 2. Moment balance: Σ(m·r·L) = 0  (where L is distance from reference plane)
 *
 * Using plane L as reference, we solve for two balance masses at L and M.
 */
function calculateMultiBalance() {
  const zL = posPctToZmm(multiParams.balanceMasses[0].posPct, multiParams.shaftHalfLen_mm);
  const zM = posPctToZmm(multiParams.balanceMasses[1].posPct, multiParams.shaftHalfLen_mm);
  const LB = zM - zL; // Distance between balance planes

  let MRx = 0, MRy = 0;     // Force vectors
  let MRLx = 0, MRLy = 0;   // Moment vectors (about L)

  // Sum contributions from all masses
  for (const m of multiParams.masses) {
    const MR = m.m_g * m.r_mm;
    const z = posPctToZmm(m.posPct, multiParams.shaftHalfLen_mm);
    const L = z - zL; // Distance from plane L

    MRx += MR * Math.cos(m.phase);
    MRy += MR * Math.sin(m.phase);
    MRLx += MR * L * Math.cos(m.phase);
    MRLy += MR * L * Math.sin(m.phase);
  }

  // Solve simultaneous equations:
  // MR_L + MR_M = -MR_total
  // MR_M * LB = -MRL_total  (MR_L is at reference, so its moment is 0)
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

/**
 * Calculate center of mass angle for multi-plane system
 * Used for gravity settling animation at low/zero RPM
 */
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

/**
 * Calculate total force and moment for multi-plane system
 * Returns { force_N, moment_Nm, MRx, MRy, MRLx, MRLy }
 */
function calculateMultiForceAndMoment(theta, includeBalance = true) {
  const zL = posPctToZmm(multiParams.balanceMasses[0].posPct, multiParams.shaftHalfLen_mm);

  let MRx = 0, MRy = 0;     // For force calculation
  let MRLx = 0, MRLy = 0;   // For moment calculation (about L)

  // Sum contributions from masses
  for (const m of multiParams.masses) {
    const MR = m.m_g * m.r_mm;
    const ang = theta + m.phase;
    const z = posPctToZmm(m.posPct, multiParams.shaftHalfLen_mm);
    const L = z - zL;

    MRx += MR * Math.cos(ang);
    MRy += MR * Math.sin(ang);
    MRLx += MR * L * Math.cos(ang);
    MRLy += MR * L * Math.sin(ang);
  }

  // Include balance masses if requested
  if (includeBalance && multiParams.isBalanced) {
    for (const bm of multiParams.balanceMasses) {
      const MR = bm.m_g * bm.r_mm;
      const ang = theta + bm.angle;
      const z = posPctToZmm(bm.posPct, multiParams.shaftHalfLen_mm);
      const L = z - zL;

      MRx += MR * Math.cos(ang);
      MRy += MR * Math.sin(ang);
      MRLx += MR * L * Math.cos(ang);
      MRLy += MR * L * Math.sin(ang);
    }
  }

  const MR_mag = Math.hypot(MRx, MRy);
  const MRL_mag = Math.hypot(MRLx, MRLy);

  // Convert to physical units:
  // Force: F = MR * ω² (g·mm → N: divide by 1,000,000)
  // Moment: M = MRL * ω² (g·mm² → Nm: divide by 1,000,000,000)
  const force_N = (MR_mag / 1000) * (multiParams.omega ** 2) / 1000;
  const moment_Nm = (MRL_mag / 1000) * (multiParams.omega ** 2) / 1000000;

  return { force_N, moment_Nm, MRx, MRy, MRLx, MRLy };
}

/**
 * Update balance mass display in UI
 */
function updateBalanceDisplay() {
  // Single-plane display
  const singleBalanceEl = $('single-balance-mass');
  const singleAngleEl = $('single-balance-angle');
  if (singleBalanceEl && singleAngleEl) {
    if (singleParams.isBalanced) {
      singleBalanceEl.textContent = singleParams.balanceMass_g.toFixed(1) + ' g';
      singleAngleEl.textContent = ((rad2deg(singleParams.balanceAngle) + 360) % 360).toFixed(0) + ' °';
    } else {
      singleBalanceEl.textContent = '-- g';
      singleAngleEl.textContent = '-- ';
    }
  }

  // Multi-plane display
  const planeAEl = $('multi-balance-a');
  const planeBEl = $('multi-balance-b');
  if (planeAEl && planeBEl) {
    if (multiParams.isBalanced) {
      const angleL = (rad2deg(multiParams.balanceMasses[0].angle) + 360) % 360;
      const angleM = (rad2deg(multiParams.balanceMasses[1].angle) + 360) % 360;
      planeAEl.textContent = `L: ${multiParams.balanceMasses[0].m_g.toFixed(1)} g @ ${angleL.toFixed(0)}°`;
      planeBEl.textContent = `M: ${multiParams.balanceMasses[1].m_g.toFixed(1)} g @ ${angleM.toFixed(0)}°`;
    } else {
      planeAEl.textContent = 'L: -- g @ -- ';
      planeBEl.textContent = 'M: -- g @ -- ';
    }
  }
}

/* -------------------------------------------------------------------
   GRAVITY SETTLING ANIMATION

   When RPM is low/zero, the system settles with the heavy side down.
   This calculates the target equilibrium angle and animates towards it.
   ------------------------------------------------------------------- */

/**
 * Calculate and apply gravity settling for single-plane system
 * @param {number} theta - Current rotation angle
 * @param {number} dt - Time delta
 * @returns {number} - New theta value
 */
function applySingleGravitySettling(theta, dt) {
  // Calculate resultant MR vector (including balance if applied)
  let Rx = 0, Ry = 0;

  for (const m of singleParams.masses) {
    const MR = m.m_g * m.r_mm;
    Rx += MR * Math.cos(m.phase);
    Ry += MR * Math.sin(m.phase);
  }

  if (singleParams.isBalanced) {
    const MRb = singleParams.balanceMass_g * singleParams.balanceRadius_mm;
    Rx += MRb * Math.cos(singleParams.balanceAngle);
    Ry += MRb * Math.sin(singleParams.balanceAngle);
  }

  const alpha0 = Math.atan2(Ry, Rx);

  // Target angle puts the resultant at -90° (pointing down)
  const targetAngle = (isFinite(alpha0) && (Math.abs(Rx) + Math.abs(Ry) > 1e-6))
    ? (Math.PI/2 - alpha0)
    : 0;

  // Smoothly interpolate towards target
  const diff = Math.atan2(Math.sin(targetAngle - theta), Math.cos(targetAngle - theta));
  const settleRate = 2.0;
  return theta + diff * Math.min(1, dt * settleRate);
}

/**
 * Calculate and apply gravity settling for multi-plane system
 * @param {number} theta - Current rotation angle
 * @param {number} dt - Time delta
 * @returns {number} - New theta value
 */
function applyMultiGravitySettling(theta, dt) {
  const comAngle = calculateMultiCentreOfMass(theta);
  const targetAngle = theta + (Math.PI/2 - comAngle);
  const angleDiff = targetAngle - theta;

  multiParams.angularVel += angleDiff * 0.05;
  multiParams.angularVel *= GRAVITY_DAMPING;

  return theta + multiParams.angularVel * dt;
}

/* -------------------------------------------------------------------
   UI CONTROL HELPERS
   ------------------------------------------------------------------- */

/**
 * Update slow-mo button label
 */
function updateSlowmoLabel(id) {
  const el = $(id);
  if (el) el.textContent = timeScale !== 1 ? 'Slow-mo: ON' : 'Slow-mo';
}

/**
 * Update balance button label
 */
function updateBalanceLabel(id, balanced) {
  const el = $(id);
  if (el) el.textContent = balanced ? 'Remove Balance' : 'Apply Balance';
}

/**
 * Bind range slider and number input to synchronize and call onChange
 */
function bindRangeNumber(rangeId, numberId, onChange) {
  const rng = $(rangeId);
  const num = $(numberId);
  if (!rng || !num) return;

  const apply = (val) => {
    rng.value = String(val);
    num.value = String(val);
    onChange(Number(val));
  };

  rng.addEventListener('input', e => apply(e.target.value));
  num.addEventListener('input', e => apply(e.target.value));

  // Initialize with current value
  apply(rng.value);
}

/**
 * Set form value and trigger change event
 */
function setFormValue(id, value) {
  const e = $(id);
  if (e) {
    e.value = String(value);
    e.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

/**
 * Auto-unapply balance when mass parameters change
 */
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

/* -------------------------------------------------------------------
   SINGLE-PLANE CONTROL WIRING
   ------------------------------------------------------------------- */

/**
 * Reset single-plane simulation to default values
 */
function resetSingle() {
  singleParams.omega = 0;
  singleParams.isBalanced = SINGLE_DEFAULTS.isBalanced;

  const DEF = [
    { m_g: 60, r_mm: 60, phase: 0,   posPct: 50 },
    { m_g: 80, r_mm: 80, phase: 60,  posPct: 50 },
    { m_g: 50, r_mm: 50, phase: 120, posPct: 50 },
  ];

  singleParams.masses.forEach((m, i) => {
    m.m_g = DEF[i].m_g;
    m.r_mm = DEF[i].r_mm;
    m.phase = deg2rad(DEF[i].phase);
    m.posPct = DEF[i].posPct;
  });

  singleParams.balanceMass_g = 0;
  singleParams.balanceRadius_mm = SINGLE_DEFAULTS.balanceRadius_mm;
  singleParams.balanceAngle = SINGLE_DEFAULTS.balanceAngle;

  // Reset UI controls
  setFormValue('single-rpm', 0);
  setFormValue('single-rpm-value', 0);

  for (let i = 1; i <= 3; i++) {
    setFormValue(`single-mass${i}`, DEF[i-1].m_g);
    setFormValue(`single-mass${i}-value`, DEF[i-1].m_g);
    setFormValue(`single-radius${i}`, DEF[i-1].r_mm);
    setFormValue(`single-radius${i}-value`, DEF[i-1].r_mm);
    setFormValue(`single-angle${i}`, DEF[i-1].phase);
    setFormValue(`single-angle${i}-value`, DEF[i-1].phase);
    setFormValue(`single-position${i}`, 50);
    setFormValue(`single-position${i}-value`, 50);
  }

  updateBalanceLabel('single-apply', singleParams.isBalanced);
  updateSlowmoLabel('single-slowmo');
}

/**
 * Wire up single-plane control panel
 */
function wireSingleControls() {
  // RPM control
  bindRangeNumber('single-rpm', 'single-rpm-value', (rpm) => {
    singleParams.omega = (rpm * 2 * Math.PI) / 60;
  });

  // Mass controls (3 masses)
  for (let i = 1; i <= 3; i++) {
    bindRangeNumber(`single-mass${i}`, `single-mass${i}-value`,
      (v) => { singleParams.masses[i-1].m_g = v; autoUnapplySingleBalance(); });

    bindRangeNumber(`single-radius${i}`, `single-radius${i}-value`,
      (v) => { singleParams.masses[i-1].r_mm = v; autoUnapplySingleBalance(); });

    bindRangeNumber(`single-angle${i}`, `single-angle${i}-value`,
      (v) => { singleParams.masses[i-1].phase = deg2rad(v); autoUnapplySingleBalance(); });

    // Position controls (disabled for single-plane)
    const posSlider = $(`single-position${i}`);
    const posNumber = $(`single-position${i}-value`);
    if (posSlider && posNumber) {
      const syncPos = (val) => {
        singleParams.masses.forEach(m => m.posPct = val);
        posSlider.value = val;
        posNumber.value = val;
      };
      posSlider.addEventListener('input', (e) => syncPos(+e.target.value));
      posNumber.addEventListener('input', (e) => syncPos(+e.target.value));
      syncPos(50);
      posSlider.disabled = true;
      posNumber.disabled = true;
    }
  }

  // Balance button
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

  // Pause button
  const pauseBtn = $('single-pause');
  if (pauseBtn && !pauseBtn._bound) {
    pauseBtn._bound = true;
    pauseBtn.addEventListener('click', () => {
      singlePaused = !singlePaused;
      pauseBtn.textContent = singlePaused ? 'Resume' : 'Pause';
    });
  }

  // Slow-mo button
  const slowmoBtn = $('single-slowmo');
  if (slowmoBtn && !slowmoBtn._bound) {
    slowmoBtn._bound = true;
    updateSlowmoLabel('single-slowmo');
    slowmoBtn.addEventListener('click', () => {
      timeScale = (timeScale === 1 ? SLOWMO_SCALE : 1);
      updateSlowmoLabel('single-slowmo');
    });
  }

  // Reset button
  const resetBtn = $('single-reset');
  if (resetBtn && !resetBtn._bound) {
    resetBtn._bound = true;
    resetBtn.addEventListener('click', resetSingle);
  }
}

/* -------------------------------------------------------------------
   MULTI-PLANE CONTROL WIRING
   ------------------------------------------------------------------- */

/**
 * Reset multi-plane simulation to default values
 */
function resetMulti() {
  multiParams.omega = 0;
  multiParams.isBalanced = MULTI_DEFAULTS.isBalanced;
  multiParams.rotorRadius_mm = MULTI_DEFAULTS.rotorRadius_mm;
  multiParams.shaftHalfLen_mm = MULTI_DEFAULTS.shaftHalfLen_mm;
  multiParams.masses = JSON.parse(JSON.stringify(MULTI_DEFAULTS.masses));
  multiParams.balanceMasses = JSON.parse(JSON.stringify(MULTI_DEFAULTS.balanceMasses));
  multiParams.angularVel = 0;

  // Reset UI controls
  setFormValue('multi-rpm', 0);
  setFormValue('multi-rpm-value', 0);

  for (let i = 0; i < 3; i++) {
    const m = multiParams.masses[i];
    const idx = i + 1;
    setFormValue(`multi-mass${idx}`, m.m_g);
    setFormValue(`multi-mass${idx}-value`, m.m_g);
    setFormValue(`multi-radius${idx}`, m.r_mm);
    setFormValue(`multi-radius${idx}-value`, m.r_mm);
    setFormValue(`multi-position${idx}`, m.posPct);
    setFormValue(`multi-position${idx}-value`, m.posPct);
    setFormValue(`multi-angle${idx}`, Math.round((rad2deg(m.phase) + 360) % 360));
    setFormValue(`multi-angle${idx}-value`, Math.round((rad2deg(m.phase) + 360) % 360));
  }

  updateBalanceLabel('multi-apply', multiParams.isBalanced);
  updateBalanceDisplay();
}

/**
 * Wire up multi-plane control panel
 */
function wireMultiControls() {
  // RPM control (does NOT auto-remove balance)
  bindRangeNumber('multi-rpm', 'multi-rpm-value', (rpm) => {
    multiParams.omega = (rpm * 2 * Math.PI) / 60;
  });

  // Mass controls (3 masses with position controls)
  for (let i = 1; i <= 3; i++) {
    bindRangeNumber(`multi-mass${i}`, `multi-mass${i}-value`,
      v => { multiParams.masses[i-1].m_g = v; autoUnapplyMultiBalance(); });

    bindRangeNumber(`multi-radius${i}`, `multi-radius${i}-value`,
      v => { multiParams.masses[i-1].r_mm = v; autoUnapplyMultiBalance(); });

    bindRangeNumber(`multi-position${i}`, `multi-position${i}-value`,
      v => { multiParams.masses[i-1].posPct = v; autoUnapplyMultiBalance(); });

    bindRangeNumber(`multi-angle${i}`, `multi-angle${i}-value`,
      v => { multiParams.masses[i-1].phase = normAngRad(deg2rad(v)); autoUnapplyMultiBalance(); });
  }

  // Balance button
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

  // Pause button
  const pauseBtn = $('multi-pause');
  if (pauseBtn && !pauseBtn._bound) {
    pauseBtn._bound = true;
    pauseBtn.addEventListener('click', () => {
      multiPaused = !multiPaused;
      pauseBtn.textContent = multiPaused ? 'Resume' : 'Pause';
    });
  }

  // Slow-mo button
  const slowmoBtn = $('multi-slowmo');
  if (slowmoBtn && !slowmoBtn._bound) {
    slowmoBtn._bound = true;
    updateSlowmoLabel('multi-slowmo');
    slowmoBtn.addEventListener('click', () => {
      timeScale = (timeScale === 1 ? SLOWMO_SCALE : 1);
      updateSlowmoLabel('multi-slowmo');
    });
  }

  // Reset button
  const resetBtn = $('multi-reset');
  if (resetBtn && !resetBtn._bound) {
    resetBtn._bound = true;
    resetBtn.addEventListener('click', resetMulti);
  }
}

/* ===================================================================
   P5.JS SKETCH DEFINITIONS
   =================================================================== */

/* -------------------------------------------------------------------
   SINGLE-PLANE: FRONT VIEW (x-y plane)

   Shows rotating disc with masses, balance weight, and resultant.
   Includes vibration animation when unbalanced at high RPM.
   ------------------------------------------------------------------- */
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

    // Update rotation angle (gravity settling at low RPM, constant rotation at high RPM)
    if (singleParams.omega < 0.1) {
      theta = applySingleGravitySettling(theta, dt);
    } else {
      theta += singleParams.omega * dt;
    }

    // Calculate vibration (unbalanced centrifugal force causes oscillation)
    let vibrationX = 0, vibrationY = 0;
    if (!singleParams.isBalanced && singleParams.omega > 0.1) {
      let MRx = 0, MRy = 0;
      for (const m of singleParams.masses) {
        const MR = m.m_g * m.r_mm;
        MRx += MR * Math.cos(theta + m.phase);
        MRy += MR * Math.sin(theta + m.phase);
      }
      const vibrationMag = Math.min(10, Math.hypot(MRx, MRy) / 1000);
      const phi = Math.atan2(MRy, MRx);
      vibrationX = vibrationMag * Math.cos(phi);
      vibrationY = vibrationMag * Math.sin(phi);
    }

    // Center coordinate system and apply vibration
    p.push();
    p.translate(p.width/2 + vibrationX, p.height/2 + vibrationY);

    const margin = 24;
    const maxR = Math.max(singleParams.rotorRadius_mm, ...singleParams.masses.map(m => m.r_mm));
    const s = (Math.min(p.width, p.height) - 2*margin) / (2*maxR);

    // Draw rotating reference line (0° = +x axis in body frame)
    const bodyLen = (Math.min(p.width, p.height) - 2*margin) / 2;
    dashedZeroRay(p, bodyLen, theta);

    // Draw rotor disc
    p.noFill();
    p.stroke(0, 60);
    p.strokeWeight(2);
    p.circle(0, 0, 2 * singleParams.rotorRadius_mm * s);

    // Draw masses with colored lines to center
    singleParams.masses.forEach((m) => {
      const x = (m.r_mm * s) * Math.cos(theta + m.phase);
      const y = (m.r_mm * s) * Math.sin(theta + m.phase);
      const col = (m.colour === 'red' ? colours.red :
                   m.colour === 'blue' ? colours.blue : colours.orange);

      // Line from center to mass
      p.stroke(...col);
      p.strokeWeight(2);
      p.line(0, 0, x, y);

      // Mass circle (size proportional to mass)
      const dotSize = m.m_g * 24 / 150;
      p.noStroke();
      p.fill(...col);
      if (dotSize > 0) p.circle(x, y, dotSize);
    });

    // Draw balance mass if applied
    if (singleParams.isBalanced) {
      const bx = (singleParams.balanceRadius_mm * s) * Math.cos(theta + singleParams.balanceAngle);
      const by = (singleParams.balanceRadius_mm * s) * Math.sin(theta + singleParams.balanceAngle);

      p.stroke(...colours.green);
      p.strokeWeight(2);
      p.line(0, 0, bx, by);

      // Balance mass circle (size proportional to mass)
      const dotSize = singleParams.balanceMass_g * 24 / 150;
      p.noStroke();
      p.fill(...colours.green);
      if (dotSize > 0) p.circle(bx, by, dotSize);
    }

    // Draw radial spokes
    p.stroke(0, 20);
    for (let i = 0; i < 8; i++) {
      const a = theta + (i * Math.PI) / 4;
      p.line(0, 0,
             Math.cos(a) * singleParams.rotorRadius_mm * s,
             Math.sin(a) * singleParams.rotorRadius_mm * s);
    }

    // Center hub
    p.fill(0);
    p.circle(0, 0, 4);
    p.pop();

    // Label
    p.noStroke();
    p.fill(30);
    p.textSize(13);
    p.textAlign(p.LEFT, p.TOP);
    const rpm = (singleParams.omega * 60) / (2 * Math.PI);
    p.text(`Single * FRONT (x-y)\nRPM: ${rpm.toFixed(0)}  Balance: ${singleParams.isBalanced ? 'ON' : 'OFF'}`, 10, 10);

    // Update status display
    const statusEl = $('single-status');
    if (statusEl) {
      const statusValue = statusEl.querySelector('.status-value');
      if (statusValue) {
        statusValue.textContent = singleParams.isBalanced ? 'Balanced' : 'Unbalanced';
        statusValue.className = 'status-value ' + (singleParams.isBalanced ? 'balanced' : 'unbalanced');
      }
    }

    // Update total force display
    const forceEl = $('single-force');
    if (forceEl) {
      let MRx = 0, MRy = 0;
      for (const m of singleParams.masses) {
        const MR = m.m_g * m.r_mm;
        MRx += MR * Math.cos(theta + m.phase);
        MRy += MR * Math.sin(theta + m.phase);
      }
      if (singleParams.isBalanced) {
        const MRb = singleParams.balanceMass_g * singleParams.balanceRadius_mm;
        MRx += MRb * Math.cos(theta + singleParams.balanceAngle);
        MRy += MRb * Math.sin(theta + singleParams.balanceAngle);
      }
      const MR_mag = Math.hypot(MRx, MRy);
      const force_N = (MR_mag / 1000) * (singleParams.omega ** 2) / 1000;
      forceEl.textContent = force_N.toFixed(2) + ' N';
    }
  };
};

/* -------------------------------------------------------------------
   SINGLE-PLANE: SIDE VIEW (z-y plane)

   Shows shaft with masses projected onto vertical plane.
   Demonstrates vertical oscillation when unbalanced.
   ------------------------------------------------------------------- */
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

    // Update rotation angle
    if (singleParams.omega < 0.1) {
      theta = applySingleGravitySettling(theta, dt);
    } else {
      theta += singleParams.omega * dt;
    }

    // Vertical vibration
    let vibrationY = 0;
    if (!singleParams.isBalanced && singleParams.omega > 0.1) {
      const avgMR = singleParams.masses.reduce((acc, m) => acc + m.m_g * m.r_mm, 0);
      vibrationY = Math.min(15, (avgMR * singleParams.omega * singleParams.omega) / 10000) * Math.sin(theta);
    }

    const leftX = 60;
    const rightX = p.width - 60;
    const centerX = (leftX + rightX) / 2;
    const midY = p.height / 2;

    // Draw shaft
    p.stroke(0, 60);
    p.strokeWeight(4);
    p.line(leftX, midY + vibrationY, rightX, midY + vibrationY);

    // Draw bearings
    p.stroke(0, 120);
    p.strokeWeight(3);
    p.line(leftX, midY - 30, leftX, midY + 30);
    p.line(rightX, midY - 30, rightX, midY + 30);

    const s_side = (p.height - 60) / (2 * Math.max(1, singleParams.rotorRadius_mm));

    // Draw masses (vertical projection only, no arrowheads)
    for (const m of singleParams.masses) {
      const ymm = m.r_mm * Math.sin(theta + m.phase);
      const col = (m.colour === 'red' ? colours.red :
                   m.colour === 'blue' ? colours.blue : colours.orange);

      p.stroke(...col);
      p.strokeWeight(3);
      p.line(centerX, midY + vibrationY, centerX, midY + vibrationY + ymm * s_side);

      // Mass circle (size proportional to mass)
      const dotSize = m.m_g * 24 / 150;
      p.noStroke();
      p.fill(...col);
      if (dotSize > 0) p.circle(centerX, midY + vibrationY + ymm * s_side, dotSize);
    }

    // Draw balance mass if applied
    if (singleParams.isBalanced) {
      const by = s_side * singleParams.balanceRadius_mm * Math.sin(theta + singleParams.balanceAngle);
      p.stroke(...colours.green);
      p.strokeWeight(3);
      p.line(centerX, midY, centerX, midY - by);

      // Balance mass circle (size proportional to mass)
      const dotSize = singleParams.balanceMass_g * 24 / 150;
      p.noStroke();
      p.fill(...colours.green);
      if (dotSize > 0) p.circle(centerX, midY - by, dotSize);
    }

    // Label
    p.noStroke();
    p.fill(30);
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Single * SIDE (z-y)`, 10, 10);
  };
};

/* -------------------------------------------------------------------
   SINGLE-PLANE: MR POLYGON DIAGRAM

   Vector diagram showing mass-radius products tip-to-tail.
   Resultant should be zero when balanced.
   ------------------------------------------------------------------- */
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

    // Update rotation angle
    if (singleParams.omega < 0.1) {
      theta = applySingleGravitySettling(theta, dt);
    } else {
      theta += singleParams.omega * dt;
    }

    // Build vector list (tip-to-tail)
    const vectors = [];
    singleParams.masses.forEach((m, i) => {
      const MR = m.m_g * m.r_mm;
      const col = (m.colour === 'red' ? colours.red :
                   m.colour === 'blue' ? colours.blue : colours.orange);
      vectors.push({
        x: MR * Math.cos(theta + m.phase),
        y: MR * Math.sin(theta + m.phase),
        colour: col,
        label: `m${i+1}`
      });
    });

    // Add balance vector if applied
    if (singleParams.isBalanced) {
      const MR_bal = singleParams.balanceMass_g * singleParams.balanceRadius_mm;
      vectors.push({
        x: MR_bal * Math.cos(theta + singleParams.balanceAngle),
        y: MR_bal * Math.sin(theta + singleParams.balanceAngle),
        colour: colours.green,
        label: 'Balance'
      });
    }

    let totalX = 0, totalY = 0;
    for (const v of vectors) {
      totalX += v.x;
      totalY += v.y;
    }

    const margin = 28;
    const s = MR_MULTI_FIXED_SCALE;

    p.push();
    p.translate(p.width/2, p.height/2);

    // Draw bounding box
    p.noFill();
    p.stroke(0, 25);
    p.rectMode(p.CENTER);
    p.rect(0, 0, p.width - 2*margin, p.height - 2*margin, 8);

    // Draw axes
    p.stroke(0, 40);
    p.line(-p.width, 0, p.width, 0);
    p.line(0, -p.height, 0, p.height);

    // Draw rotating reference line
    const mrLen = (p.width / 2) - margin;
    dashedZeroRay(p, mrLen, theta);

    // Draw tip-to-tail vector polygon
    let cx = 0, cy = 0;
    for (const v of vectors) {
      p.stroke(...v.colour);
      p.strokeWeight(3);
      const nx = cx + v.x * s;
      const ny = cy + v.y * s;
      drawArrow(p, cx, cy, nx, ny, 10, Math.PI/7, 3);
      cx = nx;
      cy = ny;
    }

    // Draw resultant if unbalanced
    const resMag = Math.hypot(totalX, totalY);
    const EPS = 1e-2;
    if (!singleParams.isBalanced && resMag > EPS) {
      p.stroke(0);
      p.strokeWeight(3);
      drawArrow(p, 0, 0, cx, cy, 12, Math.PI/7, 3);
    }

    p.pop();

    // Label
    p.noStroke();
    p.fill(30);
    p.textSize(13);
    p.textAlign(p.LEFT, p.TOP);
    const resultantMag = Math.sqrt(totalX*totalX + totalY*totalY);
    p.text(`Single * MR Diagram\n|MR| = ${resultantMag.toFixed(0)} g·mm`, 10, 10);
  };
};

/* -------------------------------------------------------------------
   SINGLE-PLANE: FORCES & REACTIONS

   Isometric view showing centrifugal forces at masses and
   reaction forces at bearings. Reactions should be zero when balanced.
   ------------------------------------------------------------------- */
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

    // Update rotation angle
    if (singleParams.omega < 0.1) {
      theta = applySingleGravitySettling(theta, dt);
    } else {
      theta += singleParams.omega * dt;
    }

    // Calculate resultant force (including balance mass)
    let Fx = 0, Fy = 0;
    for (const m of singleParams.masses) {
      const MR = m.m_g * m.r_mm;
      Fx += MR * Math.cos(theta + m.phase);
      Fy += MR * Math.sin(theta + m.phase);
    }
    if (singleParams.isBalanced) {
      const MRb = singleParams.balanceMass_g * singleParams.balanceRadius_mm;
      Fx += MRb * Math.cos(theta + singleParams.balanceAngle);
      Fy += MRb * Math.sin(theta + singleParams.balanceAngle);
    }

    // Isometric projection helper
    const iso = (x, y, z) => {
      const k = 0.5;
      const X = x + k * z;
      const Y = -y + k * z * 0.5;
      return [X, Y];
    };

    p.push();
    const margin = 20;
    p.translate(margin + (p.width - 2*margin)/2, margin + (p.height - 2*margin)/2);

    // Draw shaft
    const supOffset = 180;
    p.stroke(0, 40);
    p.strokeWeight(2);
    const [sx1, sy1] = iso(-supOffset, 0, 0);
    const [sx2, sy2] = iso(supOffset, 0, 0);
    p.line(sx1, sy1, sx2, sy2);

    // Draw bearing supports
    const drawSupport = (x) => {
      const [a, b] = iso(x, 0, 0);
      p.stroke(0);
      p.fill(230);
      p.rectMode(p.CENTER);
      p.rect(a, b + 20, 18, 12, 3);
    };
    drawSupport(-supOffset);
    drawSupport(supOffset);

    // Draw centrifugal forces at masses
    const scaleF = FORCE_FIXED_SCALE;
    for (const m of singleParams.masses) {
      const MR = m.m_g * m.r_mm * (singleParams.omega ** 2);
      const fx = MR * Math.cos(theta + m.phase);
      const fy = MR * Math.sin(theta + m.phase);
      const [mx, my] = iso(0, 0, 0);
      const [tx, ty] = iso(fx * scaleF, fy * scaleF, 0);
      const col = (m.colour === 'red' ? colours.red :
                   m.colour === 'blue' ? colours.blue : colours.orange);
      p.stroke(...col);
      p.strokeWeight(2.5);
      drawArrow(p, mx, my, tx, ty, 8, Math.PI/8, 2);
    }

    // Draw balance mass force if applied
    if (singleParams.isBalanced) {
      const MR_bal = singleParams.balanceMass_g * singleParams.balanceRadius_mm * (singleParams.omega ** 2);
      const fx_bal = MR_bal * Math.cos(theta + singleParams.balanceAngle);
      const fy_bal = MR_bal * Math.sin(theta + singleParams.balanceAngle);
      const [mx, my] = iso(0, 0, 0);
      const [tx, ty] = iso(fx_bal * scaleF, fy_bal * scaleF, 0);
      p.stroke(...colours.green);
      p.strokeWeight(2.5);
      drawArrow(p, mx, my, tx, ty, 8, Math.PI/8, 2);
    }

    // Draw reaction forces at bearings (split equally, opposite to resultant)
    const FRx = -Fx * (singleParams.omega ** 2);
    const FRy = -Fy * (singleParams.omega ** 2);
    const [rxLx, rxLy] = iso(-supOffset, 0, 0);
    const [rxRx, rxRy] = iso(supOffset, 0, 0);
    const [rLtx, rLty] = iso(rxLx + 0.5 * FRx * scaleF, 0.5 * FRy * scaleF, 0);
    const [rRtx, rRty] = iso(rxRx + 0.5 * FRx * scaleF, 0.5 * FRy * scaleF, 0);

    p.stroke(...colours.green);
    p.strokeWeight(2.5);
    drawArrow(p, rxLx, rxLy, rLtx, rLty, 8, Math.PI/8, 2);
    drawArrow(p, rxRx, rxRy, rRtx, rRty, 8, Math.PI/8, 2);

    p.pop();

    // Label
    p.noStroke();
    p.fill(30);
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Single * Forces & Reactions (isometric)`, 10, 10);
  };
};

/* -------------------------------------------------------------------
   MULTI-PLANE: FRONT VIEW (x-y plane)

   Shows rotating disc with multiple masses at different axial positions.
   Balance masses appear at planes L and M when balanced.
   ------------------------------------------------------------------- */
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

    // Update rotation angle (gravity settling or constant rotation)
    if (multiParams.omega < 0.1) {
      theta = applyMultiGravitySettling(theta, dt);
    } else {
      theta += multiParams.omega * dt;
      multiParams.angularVel = 0;
    }

    // Calculate vibration
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

    // Draw rotating reference line
    const bodyLen = (Math.min(p.width, p.height) - 2*margin) / 2;
    dashedZeroRay(p, bodyLen, theta);

    // Draw radial spokes
    p.noFill();
    p.stroke(0, 20);
    for (let i = 0; i < 8; i++) {
      const a = theta + (i * Math.PI) / 4;
      p.line(0, 0,
             Math.cos(a) * singleParams.rotorRadius_mm * s,
             Math.sin(a) * singleParams.rotorRadius_mm * s);
    }

    // Draw rotor disc
    p.stroke(0, 70);
    p.strokeWeight(2);
    p.circle(0, 0, 2 * multiParams.rotorRadius_mm * s);

    // Draw masses with colored lines to center
    for (const m of multiParams.masses) {
      const ang = theta + m.phase;
      const x = Math.cos(ang) * m.r_mm * s;
      const y = Math.sin(ang) * m.r_mm * s;

      p.stroke(...m.colour);
      p.strokeWeight(2);
      p.line(0, 0, x, y);

      // Mass circle (size proportional to mass)
      const dotSize = m.m_g * 24 / 150;
      p.noStroke();
      p.fill(...m.colour);
      if (dotSize > 0) p.circle(x, y, dotSize);
    }

    // Draw balance masses if applied
    if (multiParams.isBalanced) {
      const bmM = multiParams.balanceMasses[1];
      const bmL = multiParams.balanceMasses[0];
      for (const bm of [bmM, bmL]) {
        const x = Math.cos(theta + bm.angle) * bm.r_mm * s;
        const y = Math.sin(theta + bm.angle) * bm.r_mm * s;

        p.stroke(...colours.green);
        p.strokeWeight(2);
        p.line(0, 0, x, y);

        // Balance mass circle (size proportional to mass)
        const dotSize = bm.m_g * 24 / 150;
        p.noStroke();
        p.fill(...colours.green);
        if (dotSize > 0) p.circle(x, y, dotSize);
      }
    }

    // Center hub
    p.fill(0);
    p.circle(0, 0, 4);
    p.pop();

    // Label
    p.noStroke();
    p.fill(30);
    p.textSize(13);
    p.textAlign(p.LEFT, p.TOP);
    const rpm = (multiParams.omega * 60) / (2 * Math.PI);
    p.text(`Multi * FRONT (x-y)\nRPM: ${rpm.toFixed(0)}  Balance: ${multiParams.isBalanced ? 'ON' : 'OFF'}`, 10, 10);

    // Update status display
    const statusEl = $('multi-status');
    if (statusEl) {
      const statusValue = statusEl.querySelector('.status-value');
      if (statusValue) {
        statusValue.textContent = multiParams.isBalanced ? 'Balanced' : 'Unbalanced';
        statusValue.className = 'status-value ' + (multiParams.isBalanced ? 'balanced' : 'unbalanced');
      }
    }

    // Update force and moment displays
    const forceEl = $('multi-force');
    const momentEl = $('multi-moment');
    if (forceEl || momentEl) {
      const { force_N, moment_Nm } = calculateMultiForceAndMoment(theta, true);
      if (forceEl) forceEl.textContent = force_N.toFixed(2) + ' N';
      if (momentEl) momentEl.textContent = moment_Nm.toFixed(3) + ' Nm';
    }
  };
};

/* -------------------------------------------------------------------
   MULTI-PLANE: SIDE VIEW (z-y plane)

   Shows shaft with masses at different axial positions.
   Balance planes L and M are marked with vertical lines.
   ------------------------------------------------------------------- */
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

    // Update rotation angle
    if (multiParams.omega < 0.1) {
      theta = applyMultiGravitySettling(theta, dt);
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

    // Calculate vibration
    let vibrationY = 0;
    if (!multiParams.isBalanced && multiParams.omega > 0.1) {
      let totalFy = 0;
      for (const m of multiParams.masses) {
        const angle = theta + m.phase;
        totalFy += m.m_g * m.r_mm * Math.sin(angle);
      }
      vibrationY = Math.min(10, Math.abs(totalFy) * multiParams.omega * multiParams.omega / 20000);
    }

    // Draw shaft
    p.stroke(0, 50);
    p.line(X(-multiParams.shaftHalfLen_mm), Y(0) + vibrationY * Math.sin(theta),
           X(multiParams.shaftHalfLen_mm), Y(0) + vibrationY * Math.sin(theta));

    // Draw bearings
    p.stroke(0, 120);
    p.line(X(-multiParams.shaftHalfLen_mm), Y(-maxR/2), X(-multiParams.shaftHalfLen_mm), Y(maxR/2));
    p.line(X(multiParams.shaftHalfLen_mm), Y(-maxR/2), X(multiParams.shaftHalfLen_mm), Y(maxR/2));

    // Draw balance plane markers (L and M)
    const zL = posPctToZmm(10, multiParams.shaftHalfLen_mm);
    const zM = posPctToZmm(90, multiParams.shaftHalfLen_mm);
    p.stroke(...colours.green, 60);
    p.strokeWeight(2);
    p.line(X(zL), Y(-maxR), X(zL), Y(maxR));
    p.line(X(zM), Y(-maxR), X(zM), Y(maxR));

    // Labels for balance planes
    p.noStroke();
    p.fill(...colours.green);
    p.textSize(14);
    p.textAlign(p.CENTER, p.TOP);
    p.textStyle(p.BOLD);
    p.text('L', X(zL), Y(maxR) - 16);
    p.text('M', X(zM), Y(maxR) - 16);
    p.textStyle(p.NORMAL);

    // Draw masses (no arrowheads)
    for (const m of multiParams.masses) {
      const ang = theta + m.phase;
      const zmm = posPctToZmm(m.posPct, multiParams.shaftHalfLen_mm);
      const ymm = m.r_mm * Math.sin(ang);

      p.stroke(...m.colour);
      p.strokeWeight(3);
      p.line(X(zmm), Y(0) + vibrationY * Math.sin(theta),
             X(zmm), Y(ymm) + vibrationY * Math.sin(theta));

      // Mass circle (size proportional to mass)
      const dotSize = m.m_g * 24 / 150;
      p.noStroke();
      p.fill(...m.colour);
      if (dotSize > 0) p.circle(X(zmm), Y(ymm) + vibrationY * Math.sin(theta), dotSize);
    }

    // Draw balance masses if applied
    if (multiParams.isBalanced) {
      for (const bm of multiParams.balanceMasses) {
        const zmm = posPctToZmm(bm.posPct, multiParams.shaftHalfLen_mm);
        const ymm = bm.r_mm * Math.sin(theta + bm.angle);

        p.stroke(...colours.green);
        p.strokeWeight(2);
        p.line(X(zmm), Y(0), X(zmm), Y(ymm));

        // Balance mass circle (size proportional to mass)
        const dotSize = bm.m_g * 24 / 150;
        p.noStroke();
        p.fill(...colours.green);
        if (dotSize > 0) p.circle(X(zmm), Y(ymm), dotSize);
      }
    }

    p.pop();

    // Label
    p.noStroke();
    p.fill(30);
    p.textSize(13);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Multi * SIDE (z-y)`, 10, 10);
  };
};

/* -------------------------------------------------------------------
   MULTI-PLANE: MR DIAGRAM

   Vector polygon showing mass-radius products.
   Should close when balanced (5 vectors: 3 masses + 2 balance).
   ------------------------------------------------------------------- */
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

    // Update rotation angle
    if (multiParams.omega < 0.1) {
      theta = applyMultiGravitySettling(theta, dt);
    } else {
      theta += multiParams.omega * dt;
    }

    // Build vector list: 3 masses, then M plane, then L plane (closing)
    const vectors = [];
    for (const m of multiParams.masses) {
      const MR = m.m_g * m.r_mm;
      const ang = theta + m.phase;
      vectors.push({
        x: MR * Math.cos(ang),
        y: MR * Math.sin(ang),
        colour: m.colour,
        label: `Mass ${m.id}`
      });
    }

    if (multiParams.isBalanced) {
      const bmM = multiParams.balanceMasses[1];
      const bmL = multiParams.balanceMasses[0];
      const MR_M = bmM.m_g * bmM.r_mm;
      const MR_L = bmL.m_g * bmL.r_mm;
      vectors.push({
        x: MR_M * Math.cos(theta + bmM.angle),
        y: MR_M * Math.sin(theta + bmM.angle),
        colour: colours.green,
        label: 'M'
      });
      vectors.push({
        x: MR_L * Math.cos(theta + bmL.angle),
        y: MR_L * Math.sin(theta + bmL.angle),
        colour: colours.green,
        label: 'L'
      });
    }

    let totalX = 0, totalY = 0;
    for (const v of vectors) {
      totalX += v.x;
      totalY += v.y;
    }

    const margin = 28;
    const s = MR_MULTI_FIXED_SCALE;

    p.push();
    p.translate(p.width/2, p.height/2);

    // Draw bounding box
    p.noFill();
    p.stroke(0, 25);
    p.rectMode(p.CENTER);
    p.rect(0, 0, p.width - 2*margin, p.height - 2*margin, 8);

    // Draw axes
    p.stroke(0, 40);
    p.line(-p.width, 0, p.width, 0);
    p.line(0, -p.height, 0, p.height);

    // Draw rotating reference line
    const mrLen = (p.width / 2) - margin;
    dashedZeroRay(p, mrLen, theta);

    // Draw vector polygon
    p.strokeWeight(3);
    let cx = 0, cy = 0;
    for (const v of vectors) {
      p.stroke(...v.colour);
      const nx = cx + v.x * s;
      const ny = cy + v.y * s;
      drawArrow(p, cx, cy, nx, ny, 12, Math.PI/7, 3);
      cx = nx;
      cy = ny;
    }

    // Draw resultant if unbalanced
    if (!multiParams.isBalanced && (Math.abs(totalX) > 0.1 || Math.abs(totalY) > 0.1)) {
      p.stroke(0, 0, 0, 140);
      p.strokeWeight(2);
      drawArrow(p, 0, 0, totalX * s, totalY * s, 10, Math.PI/7, 2);
    }

    p.pop();

    // Label
    p.noStroke();
    p.fill(30);
    p.textSize(13);
    p.textAlign(p.LEFT, p.TOP);
    const resultantMag = Math.sqrt(totalX*totalX + totalY*totalY);
    p.text(`Multi * MR Diagram\n|MR| = ${resultantMag.toFixed(0)} g·mm`, 10, 10);
  };
};

/* -------------------------------------------------------------------
   MULTI-PLANE: MRL DIAGRAM (Moment about plane L)

   Vector polygon showing moment contributions (MR × distance from L).
   Should close when balanced (4 vectors: 3 masses + M plane).
   L plane has zero moment since it's the reference.
   ------------------------------------------------------------------- */
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

    // Update rotation angle
    if (multiParams.omega < 0.1) {
      theta = applyMultiGravitySettling(theta, dt);
    } else {
      theta += multiParams.omega * dt;
    }

    // Reference at plane L
    const zL = posPctToZmm(multiParams.balanceMasses[0].posPct, multiParams.shaftHalfLen_mm);

    // Build MRL vector list
    const vectors = [];
    for (const m of multiParams.masses) {
      const MR = m.m_g * m.r_mm;
      const z = posPctToZmm(m.posPct, multiParams.shaftHalfLen_mm);
      const L = z - zL; // Distance from plane L
      const ang = theta + m.phase;
      vectors.push({
        x: MR * L * Math.cos(ang),
        y: MR * L * Math.sin(ang),
        colour: m.colour
      });
    }

    // Add M plane contribution (L plane has zero moment as it's the reference)
    if (multiParams.isBalanced) {
      const bmM = multiParams.balanceMasses[1];
      const zM = posPctToZmm(bmM.posPct, multiParams.shaftHalfLen_mm);
      const L_M = zM - zL;
      const MR_M = bmM.m_g * bmM.r_mm;
      vectors.push({
        x: MR_M * L_M * Math.cos(theta + bmM.angle),
        y: MR_M * L_M * Math.sin(theta + bmM.angle),
        colour: colours.green
      });
    }

    let totalX = 0, totalY = 0;
    for (const v of vectors) {
      totalX += v.x;
      totalY += v.y;
    }

    const margin = 28;
    const s = MRL_MULTI_FIXED_SCALE;

    p.push();
    p.translate(p.width/2, p.height/2);

    // Draw bounding box
    p.noFill();
    p.stroke(0, 25);
    p.rectMode(p.CENTER);
    p.rect(0, 0, p.width - 2*margin, p.height - 2*margin, 8);

    // Draw axes
    p.stroke(0, 40);
    p.line(-p.width, 0, p.width, 0);
    p.line(0, -p.height, 0, p.height);

    // Draw rotating reference line
    const mrlLen = (p.width / 2) - margin;
    dashedZeroRay(p, mrlLen, theta);

    // Draw vector polygon
    p.strokeWeight(3);
    let cx = 0, cy = 0;
    for (const v of vectors) {
      p.stroke(...v.colour);
      const nx = cx + v.x * s;
      const ny = cy + v.y * s;
      drawArrow(p, cx, cy, nx, ny, 12, Math.PI/7, 3);
      cx = nx;
      cy = ny;
    }

    // Draw resultant if unbalanced
    if (!multiParams.isBalanced && (Math.abs(totalX) > 0.1 || Math.abs(totalY) > 0.1)) {
      p.stroke(0, 0, 0, 200);
      drawArrow(p, 0, 0, totalX * s, totalY * s, 12, Math.PI/7, 2);
    }

    p.pop();

    // Label
    p.noStroke();
    p.fill(30);
    p.textSize(13);
    p.textAlign(p.LEFT, p.TOP);
    const resultantMag = Math.sqrt(totalX*totalX + totalY*totalY);
    p.text(`Multi * MRL Diagram (ref: L)\n|MRL| = ${resultantMag.toFixed(0)} g·mm²`, 10, 10);
  };
};

/* ===================================================================
   INITIALIZATION
   =================================================================== */

let p5_instances = [];

/**
 * Boot all p5.js sketch instances
 */
function boot() {
  // Remove existing instances
  p5_instances.forEach(instance => {
    if (instance && instance.remove) instance.remove();
  });
  p5_instances = [];

  // Create single-plane sketches
  p5_instances.push(new p5(singleFrontSketch));
  p5_instances.push(new p5(singleSideSketch));
  p5_instances.push(new p5(singleMRSketch));
  p5_instances.push(new p5(singleForcesSketch));

  // Create multi-plane sketches
  p5_instances.push(new p5(multiFrontSketch));
  p5_instances.push(new p5(multiSideSketch));
  p5_instances.push(new p5(multiMRSketch));
  p5_instances.push(new p5(multiMRLSketch));

  updateBalanceDisplay();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}