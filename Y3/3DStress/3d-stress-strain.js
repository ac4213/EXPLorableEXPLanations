// ============================================================
/* 3D Stress–Strain Interactive (p5 + Plotly)
   Latest adjustments:
   - Flat colours (no lighting) so arrows render the same from any view
   - Global arrow scale knob (STRESS_ARROW_SCALE) for all stress arrows
   - Reference frame axes from cube centre with live "x/y/z" labels
   - NORMAL stresses: tension starts on face and points outward;
                      compression tip sits on face and points inward
                      (axis-coloured: x red, y blue, z green)
   - SHEAR stresses: centred on face (midpoint at face centre) always;
                     colours are plane mixes:
                        τ_xy -> purple, τ_yz -> cyan, τ_xz -> yellow
   - Isotropic only (no material radios)
   - Mohr's circle preserved as perfect circles (equal axis scaling)
   - Accurate symmetric 3×3 eigensolver (Jacobi)
*/
// ============================================================

// ------------------------------
// Tunables
// ------------------------------
const STRESS_ARROW_SCALE = 6.0; // ← master scale for ALL stress arrows (normal + shear). Tweak this.

// ------------------------------
// Global state
// ------------------------------
let cube;
let angle = 0;
let angleY = 0; // Store Y rotation for manual control
let angleX = 0; // Store X rotation for manual control
let autoRotate = true; // control autorotation
let showPrincipal = false;
let showFailure   = false;
let showDeformation = true; // controlled by #show-deformation if present
const materialModel = 'isotropic'; // fixed

// Stress components with default values (MPa)
let stressComponents = {
  xx: 50,
  yy: 30,
  zz: 10,
  xy: 15,
  yz: 5,
  xz: 10
};

// Principal stresses (values in MPa; directions unit vectors)
let principalStresses = {
  s1: 0, s2: 0, s3: 0,
  v1: null, v2: null, v3: null
};

// Failure criteria results
let failureCriteria = {
  tresca:  { value: 0, status: 'Safe' },
  vonMises:{ value: 0, status: 'Safe' }
};

// Yield strength for isotropic example (MPa)
const materialProperties = {
  isotropic: { yieldStrength: 110 }
};

// ------------------------------
// p5: setup & draw
// ------------------------------
function setup() {
  const canvas = createCanvas(800, 400, WEBGL);
  canvas.parent('sketch-holder');

  cube = new StressCube();
  setupControls();

  calculatePrincipalStresses();
  calculateFailureCriteria();
  updateDisplay();
}

function draw() {
  background(240);

  // FLAT look: disable lighting entirely so fills/lines are constant
  noLights();

  // Orbit-like rotation
  if (mouseIsPressed && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    // User is dragging - update stored angles based on mouse position
    angleY = map(mouseX, 0, width, -PI, PI);
    angleX = map(mouseY, 0, height, PI, -PI);
    rotateY(angleY);
    rotateX(angleX);
  } else if (autoRotate) {
    // Auto-rotation mode - continuously increment angle
    angle += 0.01;
    angleY = angle;
    angleX = sin(angle * 0.5) * 0.5;
    rotateY(angleY);
    rotateX(angleX);
  } else {
    // Rotation stopped - maintain last known angles (from dragging or auto-rotation)
    rotateY(angleY);
    rotateX(angleX);
  }

  cube.display();
}

// ------------------------------
// Stress cube class
// ------------------------------
class StressCube {
  constructor() {
    this.size = 100;
    this.deformationScale = 0.002; // visualisation-only scale
  }

  display() {
    push();

    // 0) Reference axes (draw first so cube lines sit on top)
    //this.drawReferenceAxes();

    // 1) Base cube (wireframe)
    stroke(200);
    noFill();
    box(this.size);

    // 2) Deformed edges (toggle)
    if (showDeformation) {
      const deformation = this.calculateDeformation();
      stroke(0);
      noFill();
      beginShape(LINES);
      for (let i = 0; i < 8; i++) {
        for (let j = i + 1; j < 8; j++) {
          if (this.isEdge(i, j)) {
            const v1 = deformation[i];
            const v2 = deformation[j];
            vertex(v1.x, v1.y, v1.z);
            vertex(v2.x, v2.y, v2.z);
          }
        }
      }
      endShape();
    }

    // 3) Stress arrows + overlays
    this.drawStressArrows();

    if (showPrincipal) this.drawPrincipalStresses();
    if (showFailure)   this.drawFailureCriteria();

    pop();
  }

  drawReferenceAxes() {
    // Draw x (red), y (blue), z (green) axes from the centre with labels
    const h = this.size / 2;
    const L = h * 0.75; // axis length inside cube

    const drawAxis = (dirVec, col, label) => {
      const p = createVector(0,0,0);
      const q = p5.Vector.mult(dirVec.copy().normalize(), L);

      // axis line + small head
      this._drawArrowFromTo(p, q, 10, 4, col, 2);

      // label at a tad beyond the tip so it doesn't overlap
      push();
      const labelOffset = p5.Vector.mult(dirVec.copy().normalize(), 12);
      const pos = p5.Vector.add(q, labelOffset);
      translate(pos.x, pos.y, pos.z);
      noStroke();
      fill(col[0], col[1], col[2]);
      textSize(14);
      textAlign(LEFT, CENTER);
      text(label, 0, 0);
      pop();
    };

    // x: red, y: blue, z: green
    drawAxis(createVector( 1, 0, 0), [255, 0, 0],  'x');
    drawAxis(createVector( 0, 1, 0), [  0, 96,255], 'y');
    drawAxis(createVector( 0, 0, 1), [  0,176,  0], 'z');
  }

  calculateDeformation() {
    const h = this.size / 2;
    const base = [
      createVector(-h, -h, -h), // 0
      createVector( h, -h, -h), // 1
      createVector( h,  h, -h), // 2
      createVector(-h,  h, -h), // 3
      createVector(-h, -h,  h), // 4
      createVector( h, -h,  h), // 5
      createVector( h,  h,  h), // 6
      createVector(-h,  h,  h)  // 7
    ];

    const v = [];
    for (let i = 0; i < base.length; i++) {
      const p = base[i];
      // normal strain (very simplified visualisation)
      const xDe = p.x * (1 + stressComponents.xx * this.deformationScale);
      const yDe = p.y * (1 + stressComponents.yy * this.deformationScale);
      const zDe = p.z * (1 + stressComponents.zz * this.deformationScale);

      // shear "sliding" visualisation (not physical)
      const xy = p.y * stressComponents.xy * this.deformationScale;
      const yz = p.z * stressComponents.yz * this.deformationScale;
      const xz = p.z * stressComponents.xz * this.deformationScale;

      v.push(createVector(
        xDe + xy + xz,
        yDe + xy + yz,
        zDe + xz + yz
      ));
    }
    return v;
  }

  isEdge(i, j) {
    const edges = [
      [0,1],[1,2],[2,3],[3,0], // back
      [4,5],[5,6],[6,7],[7,4], // front
      [0,4],[1,5],[2,6],[3,7]  // connect
    ];
    for (const e of edges) {
      if ((e[0] === i && e[1] === j) || (e[0] === j && e[1] === i)) return true;
    }
    return false;
  }

  // ------------- Arrow helpers ----------------
  _drawArrowFromTo(p, q, headLen = 12, headRad = 5, col = [0,0,0], weight = 2) {
    // Draws a 3D arrow from point p to point q
    const dir = p5.Vector.sub(q, p);
    const L = dir.mag();
    if (L < 1e-6) return;

    const d = dir.copy().normalize();
    const tip = q.copy();

    // shaft
    push();
    stroke(col[0], col[1], col[2]);
    strokeWeight(weight);
    line(p.x, p.y, p.z, tip.x, tip.y, tip.z);

    // head as a cone-like fan
    const baseCenter = p5.Vector.add(tip, p5.Vector.mult(d, -headLen));
    const arbitrary = (Math.abs(d.x) < 0.9) ? createVector(1,0,0) : createVector(0,1,0);
    let u = d.copy().cross(arbitrary).normalize();
    let v = d.copy().cross(u).normalize();

    noStroke();
    fill(col[0], col[1], col[2]);
    beginShape(TRIANGLES);
    const segs = 12;
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * TWO_PI;
      const a1 = ((i + 1) / segs) * TWO_PI;
      const b0 = p5.Vector.add(baseCenter,
        p5.Vector.add(p5.Vector.mult(u, headRad * Math.cos(a0)), p5.Vector.mult(v, headRad * Math.sin(a0))));
      const b1 = p5.Vector.add(baseCenter,
        p5.Vector.add(p5.Vector.mult(u, headRad * Math.cos(a1)), p5.Vector.mult(v, headRad * Math.sin(a1))));
      vertex(tip.x, tip.y, tip.z);
      vertex(b0.x, b0.y, b0.z);
      vertex(b1.x, b1.y, b1.z);
    }
    endShape();
    pop();
  }

  _lenFrom(val, max = 100, base = 20, cap = 1.5) {
    return STRESS_ARROW_SCALE * base * constrain(Math.abs(val) / max, 0, cap);
  }

  // ------------- Stress arrows ----------------
  drawStressArrows() {
    const h = this.size / 2;

    // --- NORMAL STRESSES ---
    const drawNormalFace = (faceCenter, outwardDir, val, colorArr) => {
      const L = this._lenFrom(val, 100, 22, 1.5);
      const d = outwardDir.copy().normalize();

      if (val >= 0) {
        // Tension: start = surface, tip = start + L * outward
        const start = faceCenter.copy();
        const tip   = p5.Vector.add(start, p5.Vector.mult(d, L));
        this._drawArrowFromTo(start, tip, 12, 5, colorArr, 2);
      } else if (val < 0) {
        // Compression: tip = surface, start = tip + L * outward
        const tip   = faceCenter.copy();
        const start = p5.Vector.add(tip, p5.Vector.mult(d, L));
        this._drawArrowFromTo(start, tip, 12, 5, colorArr, 2);
      }
    };

    // σ_xx on x-faces (red)
    drawNormalFace(createVector( h, 0, 0), createVector( 1, 0, 0), stressComponents.xx, [255, 0, 0]);
    drawNormalFace(createVector(-h, 0, 0), createVector(-1, 0, 0), stressComponents.xx, [255, 0, 0]);

    // σ_yy on y-faces (blue)
    drawNormalFace(createVector(0,  h, 0), createVector(0,  1, 0), stressComponents.yy, [0, 96, 255]);
    drawNormalFace(createVector(0, -h, 0), createVector(0, -1, 0), stressComponents.yy, [0, 96, 255]);

    // σ_zz on z-faces (green)
    drawNormalFace(createVector(0, 0,  h), createVector(0, 0,  1), stressComponents.zz, [0, 176, 0]);
    drawNormalFace(createVector(0, 0, -h), createVector(0, 0, -1), stressComponents.zz, [0, 176, 0]);

    // --- SHEAR STRESSES ---
    const drawShearOnFace = (faceCenter, shearDir, val, colorArr) => {
      const L = this._lenFrom(val, 50, 20, 1.5);
      const d = shearDir.copy().normalize();

      // Arrows from mid - L/2 to mid + L/2, showing shear direction
      const midPt = faceCenter.copy();
      const start = p5.Vector.add(midPt, p5.Vector.mult(d, -L/2));
      const tip   = p5.Vector.add(midPt, p5.Vector.mult(d,  L/2));
      this._drawArrowFromTo(start, tip, 10, 4, colorArr, 2);
    };

    // τ_xy (purple) on +x, -x, +y, -y faces
    drawShearOnFace(createVector( h, 0, 0), createVector(0,  1, 0), stressComponents.xy, [255, 0, 255]);
    drawShearOnFace(createVector(-h, 0, 0), createVector(0, -1, 0), stressComponents.xy, [255, 0, 255]);
    drawShearOnFace(createVector(0,  h, 0), createVector( 1, 0, 0), stressComponents.xy, [255, 0, 255]);
    drawShearOnFace(createVector(0, -h, 0), createVector(-1, 0, 0), stressComponents.xy, [255, 0, 255]);

    // τ_yz (cyan) on +y, -y, +z, -z faces
    drawShearOnFace(createVector(0,  h, 0), createVector(0, 0,  1), stressComponents.yz, [0, 255, 255]);
    drawShearOnFace(createVector(0, -h, 0), createVector(0, 0, -1), stressComponents.yz, [0, 255, 255]);
    drawShearOnFace(createVector(0, 0,  h), createVector(0,  1, 0), stressComponents.yz, [0, 255, 255]);
    drawShearOnFace(createVector(0, 0, -h), createVector(0, -1, 0), stressComponents.yz, [0, 255, 255]);

    // τ_xz (yellow) on +x, -x, +z, -z faces
    drawShearOnFace(createVector( h, 0, 0), createVector(0, 0,  1), stressComponents.xz, [204, 170, 0]);
    drawShearOnFace(createVector(-h, 0, 0), createVector(0, 0, -1), stressComponents.xz, [204, 170, 0]);
    drawShearOnFace(createVector(0, 0,  h), createVector( 1, 0, 0), stressComponents.xz, [204, 170, 0]);
    drawShearOnFace(createVector(0, 0, -h), createVector(-1, 0, 0), stressComponents.xz, [204, 170, 0]);
  }

  drawPrincipalStresses() {
    const h = this.size / 2;
    if (!principalStresses.v1 || !principalStresses.v2 || !principalStresses.v3) return;

    push();
    strokeWeight(3);
    stroke(255, 128, 0);
    fill(255, 128, 0, 100);

    const length = h * 0.8;
    const drawPrincipal = (value, direction) => {
      const d = createVector(direction[0], direction[1], direction[2]).normalize();
      const p1 = p5.Vector.mult(d,  length);
      const p2 = p5.Vector.mult(d, -length);
      line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);

      push();
      translate(p1.x, p1.y, p1.z);
      noStroke();
      sphere(5);
      pop();
    };

    drawPrincipal(principalStresses.s1, principalStresses.v1);
    drawPrincipal(principalStresses.s2, principalStresses.v2);
    drawPrincipal(principalStresses.s3, principalStresses.v3);
    pop();
  }

  drawFailureCriteria() {
    push();
    const h = this.size / 2;
    const vm = failureCriteria.vonMises.value;
    const yieldStr = materialProperties.isotropic.yieldStrength;

    if (vm > yieldStr) {
      stroke(255, 0, 0, 150);
      strokeWeight(4);
      noFill();
      box(this.size + 20);
    } else {
      stroke(0, 255, 0, 150);
      strokeWeight(2);
      noFill();
      box(this.size + 10);
    }
    pop();
  }
}

// ------------------------------
// UI controls setup
// ------------------------------
function setupControls() {
  // Sliders
  const sliders = [
    { id: 'sigma-xx', component: 'xx' },
    { id: 'sigma-yy', component: 'yy' },
    { id: 'sigma-zz', component: 'zz' },
    { id: 'tau-xy',   component: 'xy' },
    { id: 'tau-yz',   component: 'yz' },
    { id: 'tau-xz',   component: 'xz' }
  ];

  sliders.forEach(({ id, component }) => {
    const slider = document.getElementById(id);
    if (!slider) return;
    slider.addEventListener('input', function() {
      stressComponents[component] = parseFloat(this.value);
      document.getElementById(`${id}-value`).textContent = this.value;
      recalculateAndUpdate();
    });
  });

  // Buttons
  const resetBtn = document.getElementById('reset-view');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => { angle = 0; });
  }

  const rotationBtn = document.getElementById('toggle-rotation');
  if (rotationBtn) {
    rotationBtn.addEventListener('click', () => {
      autoRotate = !autoRotate;
      rotationBtn.textContent = autoRotate ? 'Stop Rotation' : 'Start Rotation';
    });
  }

  const principalBtn = document.getElementById('toggle-principal');
  if (principalBtn) {
    principalBtn.addEventListener('click', () => {
      showPrincipal = !showPrincipal;
      principalBtn.textContent = showPrincipal ? 'Hide Principal Stresses' : 'Show Principal Stresses';
    });
  }

  // Checkbox
  const defCheck = document.getElementById('show-deformation');
  if (defCheck) {
    // Set initial state to checked
    defCheck.checked = true;
    showDeformation = true;
    
    defCheck.addEventListener('change', function() {
      showDeformation = this.checked;
    });
  }
}

// ------------------------------
// Stress calculations
// ------------------------------
function calculatePrincipalStresses() {
  const s = stressComponents;
  const A = [
    [s.xx, s.xy, s.xz],
    [s.xy, s.yy, s.yz],
    [s.xz, s.yz, s.zz]
  ];

  const { eigenvalues, eigenvectors } = jacobiEigenvalues(A);
  eigenvalues.sort((a, b) => b - a); // descending

  principalStresses.s1 = eigenvalues[0];
  principalStresses.s2 = eigenvalues[1];
  principalStresses.s3 = eigenvalues[2];
  principalStresses.v1 = eigenvectors[0];
  principalStresses.v2 = eigenvectors[1];
  principalStresses.v3 = eigenvectors[2];
}

// Jacobi eigenvalue algorithm for symmetric 3x3
function jacobiEigenvalues(A, maxIter = 100, tol = 1e-10) {
  const n = 3;
  let V = [[1,0,0],[0,1,0],[0,0,1]]; // identity
  let B = A.map(row => [...row]);     // copy

  for (let iter = 0; iter < maxIter; iter++) {
    // Find largest off-diagonal
    let maxVal = 0, p = 0, q = 1;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(B[i][j]) > maxVal) {
          maxVal = Math.abs(B[i][j]);
          p = i; q = j;
        }
      }
    }
    if (maxVal < tol) break;

    // Compute rotation angle
    const theta = 0.5 * Math.atan2(2 * B[p][q], B[q][q] - B[p][p]);
    const c = Math.cos(theta);
    const s = Math.sin(theta);

    // Apply rotation to B
    const Bpq = B[p][q];
    B[p][p] = c*c*B[p][p] - 2*s*c*Bpq + s*s*B[q][q];
    B[q][q] = s*s*B[p][p] + 2*s*c*Bpq + c*c*B[q][q];
    B[p][q] = B[q][p] = 0;

    for (let k = 0; k < n; k++) {
      if (k !== p && k !== q) {
        const Bkp = B[k][p];
        const Bkq = B[k][q];
        B[k][p] = B[p][k] = c*Bkp - s*Bkq;
        B[k][q] = B[q][k] = s*Bkp + c*Bkq;
      }
    }

    // Update eigenvectors
    for (let k = 0; k < n; k++) {
      const Vkp = V[k][p];
      const Vkq = V[k][q];
      V[k][p] = c*Vkp - s*Vkq;
      V[k][q] = s*Vkp + c*Vkq;
    }
  }

  const eigenvalues = [B[0][0], B[1][1], B[2][2]];
  const eigenvectors = [[V[0][0],V[1][0],V[2][0]],
                         [V[0][1],V[1][1],V[2][1]],
                         [V[0][2],V[1][2],V[2][2]]];
  return { eigenvalues, eigenvectors };
}

// Failure criteria
function calculateFailureCriteria() {
  const { s1, s2, s3 } = principalStresses;
  const yieldStrength = materialProperties.isotropic.yieldStrength;

  // Tresca (Maximum Shear Stress)
  const maxShear = Math.max(Math.abs(s1 - s2), Math.abs(s2 - s3), Math.abs(s3 - s1)) / 2;
  failureCriteria.tresca.value = maxShear * 2;
  failureCriteria.tresca.status = (maxShear * 2 >= yieldStrength) ? 'Fail' : 'Safe';

  // Von Mises
  const vm = Math.sqrt(0.5 * ((s1 - s2)**2 + (s2 - s3)**2 + (s3 - s1)**2));
  failureCriteria.vonMises.value = vm;
  failureCriteria.vonMises.status = (vm >= yieldStrength) ? 'Fail' : 'Safe';
}

// ------------------------------
// Display update
// ------------------------------
function updateDisplay() {
  // Stress matrix
  const matrixElement = document.getElementById('stress-matrix');
  if (matrixElement) {
    matrixElement.innerHTML = `[${stressComponents.xx.toFixed(1).padStart(6)} ${stressComponents.xy.toFixed(1).padStart(6)} ${stressComponents.xz.toFixed(1).padStart(6)}]
[${stressComponents.xy.toFixed(1).padStart(6)} ${stressComponents.yy.toFixed(1).padStart(6)} ${stressComponents.yz.toFixed(1).padStart(6)}]
[${stressComponents.xz.toFixed(1).padStart(6)} ${stressComponents.yz.toFixed(1).padStart(6)} ${stressComponents.zz.toFixed(1).padStart(6)}] MPa`;
  }

  // Principal stresses
  const principalElement = document.getElementById('principal-stresses');
  if (principalElement) {
    principalElement.innerHTML = `<p style="margin: 3px 0;"><strong>σ₁:</strong> ${principalStresses.s1.toFixed(1)} MPa</p>
<p style="margin: 3px 0;"><strong>σ₂:</strong> ${principalStresses.s2.toFixed(1)} MPa</p>
<p style="margin: 3px 0;"><strong>σ₃:</strong> ${principalStresses.s3.toFixed(1)} MPa</p>`;
  }

  // Principal directions
  const directionsElement = document.getElementById('principal-directions');
  if (directionsElement && principalStresses.v1 && principalStresses.v2 && principalStresses.v3) {
    const v1 = principalStresses.v1;
    const v2 = principalStresses.v2;
    const v3 = principalStresses.v3;
    directionsElement.innerHTML = `[${v1[0].toFixed(3).padStart(7)} ${v1[1].toFixed(3).padStart(7)} ${v1[2].toFixed(3).padStart(7)}]
[${v2[0].toFixed(3).padStart(7)} ${v2[1].toFixed(3).padStart(7)} ${v2[2].toFixed(3).padStart(7)}]
[${v3[0].toFixed(3).padStart(7)} ${v3[1].toFixed(3).padStart(7)} ${v3[2].toFixed(3).padStart(7)}]`;
  }

  // Failure criteria
  const failureElement = document.getElementById('failure-criteria');
  if (failureElement) {
    failureElement.innerHTML = `<p style="margin: 5px 0;"><strong>Tresca:</strong> ${failureCriteria.tresca.value.toFixed(1)} MPa - <span class="${failureCriteria.tresca.status === 'Safe' ? 'safe' : 'fail'}">${failureCriteria.tresca.status}</span></p>
<p style="margin: 5px 0;"><strong>Von Mises:</strong> ${failureCriteria.vonMises.value.toFixed(1)} MPa - <span class="${failureCriteria.vonMises.status === 'Safe' ? 'safe' : 'fail'}">${failureCriteria.vonMises.status}</span></p>`;
  }

  // Mohr's circles
  createMohrCirclePlot();
}

// Plotly Mohr's circles: keep circular
function createMohrCirclePlot() {
  const mohrCircleElement = document.getElementById('mohr-circle-3d');
  if (!mohrCircleElement) return;

  const centers = [
    (principalStresses.s1 + principalStresses.s2) / 2,
    (principalStresses.s2 + principalStresses.s3) / 2,
    (principalStresses.s3 + principalStresses.s1) / 2
  ];

  const radii = [
    Math.abs(principalStresses.s1 - principalStresses.s2) / 2,
    Math.abs(principalStresses.s2 - principalStresses.s3) / 2,
    Math.abs(principalStresses.s3 - principalStresses.s1) / 2
  ];

  const circle1Points = generateCirclePoints(centers[0], radii[0], 180);
  const circle2Points = generateCirclePoints(centers[1], radii[1], 180);
  const circle3Points = generateCirclePoints(centers[2], radii[2], 180);

  const trace1 = { x: circle1Points.x, y: circle1Points.y, mode: 'lines', name: 'σ₁—σ₂' };
  const trace2 = { x: circle2Points.x, y: circle2Points.y, mode: 'lines', name: 'σ₂—σ₃' };
  const trace3 = { x: circle3Points.x, y: circle3Points.y, mode: 'lines', name: 'σ₃—σ₁' };

  const layout = {
    title: "3D Mohr's Circles",
    xaxis: { title: 'Normal Stress (MPa)', zeroline: true },
    yaxis: {
      title: 'Shear Stress (MPa)',
      zeroline: true,
      scaleanchor: 'x',  // ← equal scaling
      scaleratio: 1
    },
    showlegend: true,
    margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
    height: 380,
    autosize: true
  };

  Plotly.newPlot(mohrCircleElement, [trace1, trace2, trace3], layout, { responsive: true, displayModeBar: false });
}

// Circle points helper
function generateCirclePoints(center, radius, numPoints) {
  const x = [], y = [];
  for (let i = 0; i <= numPoints; i++) {
    const a = (i / numPoints) * 2 * Math.PI;
    x.push(center + radius * Math.cos(a));
    y.push(            radius * Math.sin(a));
  }
  return { x, y };
}

// Recalculate & refresh all outputs
function recalculateAndUpdate() {
  calculatePrincipalStresses();
  calculateFailureCriteria();
  updateDisplay();
}

// ------------------------------
// Solution toggle for practice problems
// ------------------------------
function toggleSolution(id) {
  const solution = document.getElementById(id);
  const button = solution.previousElementSibling;
  
  if (solution.style.display === "none" || solution.style.display === "") {
    solution.style.display = "block";
    button.textContent = "Hide Solution";
  } else {
    solution.style.display = "none";
    button.textContent = "Show Solution";
  }
}

// ------------------------------
// On load: initialise everything
// ------------------------------
window.onload = function () {
  // Sync slider readouts
  const setVal = (id, v) => {
    const element = document.getElementById(id);
    if (element) element.textContent = v;
  };
  
  setVal('sigma-xx-value', stressComponents.xx);
  setVal('sigma-yy-value', stressComponents.yy);
  setVal('sigma-zz-value', stressComponents.zz);
  setVal('tau-xy-value',   stressComponents.xy);
  setVal('tau-yz-value',   stressComponents.yz);
  setVal('tau-xz-value',   stressComponents.xz);

  // Status colours
  const style = document.createElement('style');
  style.innerHTML = `
    .safe { color: green; font-weight: bold; }
    .fail { color: red;   font-weight: bold;  }
  `;
  document.head.appendChild(style);

  // Initial compute/plot
  recalculateAndUpdate();
  
  // Quiz functionality
  const quizBtn = document.getElementById('submit-quiz');
  if (quizBtn) {
    quizBtn.addEventListener('click', function() {
      const answers = {
        q1: 'c', // Diagonal elements represent shear stresses is FALSE
        q2: 'c', // Distortion energy reaches critical value
        q3: 'd', // Isotropic requires fewest constants
        q4: 'b', // Principal stresses are eigenvalues
        q5: 'a'  // Max shear = (200-50)/2 = 75 MPa
      };
      
      let score = 0;
      let feedback = '<h3>Quiz Results:</h3>';
      
      for (let question in answers) {
        const selectedOption = document.querySelector(`input[name="${question}"]:checked`);
        if (selectedOption) {
          if (selectedOption.value === answers[question]) {
            score++;
            feedback += `<p>Question ${question.substring(1)}: Correct! ✓</p>`;
          } else {
            feedback += `<p>Question ${question.substring(1)}: Incorrect. ✗</p>`;
          }
        } else {
          feedback += `<p>Question ${question.substring(1)}: No answer selected. ✗</p>`;
        }
      }
      
      feedback += `<p><strong>Your score: ${score}/5</strong></p>`;
      
      const resultsDiv = document.getElementById('quiz-results');
      if (resultsDiv) {
        resultsDiv.innerHTML = feedback;
        resultsDiv.classList.remove('hidden');
      }
    });
  }
};