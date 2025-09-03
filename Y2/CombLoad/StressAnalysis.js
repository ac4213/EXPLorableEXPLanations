// Global variables for sketches
let axialSketch, shearSketch, bendingSketch, torsionSketch, combinedSketch;

// Stress Analysis Interactive Simulations
// All units in SI (N, m, Pa) with display conversion to engineering units (kN, mm, MPa)

// Common colours for consistency
const colours = {
    background: '#f5f5f5',
    material: '#E3E3E3',
    shaded: 'rgba(76, 139, 245, 0.25)',
    shadedEdge: '#4C8BF5',
    shearCurve: '#2ECC71',  // green
    bendingMoment: '#ff4400',
    normalForce: '#00bbff',
    twistingTorque: '#ffaa00',
    shearForce: '#64ff64',
    load: '#111',
    neutral: '#808080',
    text: '#333333',
    grid: '#e0e0e0',
    infinitesimal: '#ffffff',
    axis: '#444',
    dashed: '#888',
    stress: '#E84C3D',
    tension: '#ff6b6b',
    compression: '#4ecdc4',
    arrow: '#333333',
    subtleDashed: '#777'
};

// Draw straight arrow with flexible arrowhead and optional centering
// options.headAt: "start" or "end" (default "end")
// options.centered: true/false (default false)
function drawArrow(p, x1, y1, x2, y2, colour = colours.normalForce, type = "force", options = {}) {
    const headAt = options.headAt || "end";
    const centered = options.centered || false;

    let startX = x1, startY = y1;
    let endX = x2, endY = y2;

    if (centered) {
        // Compute midpoint
        let midX = (x1 + x2) / 2;
        let midY = (y1 + y2) / 2;
        startX = midX - (x2 - x1)/2;
        startY = midY - (y2 - y1)/2;
        endX = midX + (x2 - x1)/2;
        endY = midY + (y2 - y1)/2;
    }

    // Determine arrowhead position
    let arrowTipX = (headAt === "start") ? startX : endX;
    let arrowTipY = (headAt === "start") ? startY : endY;

    p.push();
    p.stroke(colour);
    p.fill(colour);

    if (type === "force") {
        // Draw line
        p.line(startX, startY, endX, endY);

        // Draw arrowhead
        let angle = p.atan2(endY - startY, endX - startX);
        if (headAt === "start") angle += Math.PI;
        p.push();
        p.translate(arrowTipX, arrowTipY);
        p.rotate(angle);
        p.triangle(0, 0, -10, -5, -10, 5);
        p.pop();
    }

    p.pop();
}



// Helper function to draw dashed line
function drawDashedLine(p, x1, y1, x2, y2, dashLength = 5, col = colours.dashed, w = 1) {
    p.push();
    p.stroke(col); 
    p.strokeWeight(w);
    p.drawingContext.setLineDash([dashLength, dashLength]);
    p.line(x1, y1, x2, y2);
    p.drawingContext.setLineDash([]);
    p.pop();
}

// Midpoint-origin single-headed arrow
function drawMidpointArrow(p, xMid, yMid, dx, dy, length, headSide='positive', col=colours.shearCurve){
    const mag = Math.hypot(dx,dy) || 1;
    const ux = dx/mag, uy = dy/mag;
    const half = length/2;
    const xA = xMid - ux*half, yA = yMid - uy*half; // one end
    const xB = xMid + ux*half, yB = yMid + uy*half; // other end
    const tail = (headSide==='positive') ? {x:xA,y:yA} : {x:xB,y:yB};
    const head = (headSide==='positive') ? {x:xB,y:yB} : {x:xA,y:yA};
    drawArrow(p, tail.x, tail.y, head.x, head.y, col);
}

// Axial Stress Simulation
function createAxialSketch(p) {
    let axialForce = 50000; // N
    let crossArea;   // mm²
    let rodLength = 300;
    let rodHeight = Math.sqrt(crossArea);

    p.setup = function() {
        let canvas = p.createCanvas(800, 400);
        canvas.parent('sketch-holder-axial');

        // Initialize from sliders
        axialForce = Number(document.getElementById('axialForce').value) * 1000;
        crossArea = Number(document.getElementById('crossArea').value);
        rodHeight = Math.sqrt(crossArea);

        // Slider elements
        const axialSlider = document.getElementById('axialForce');
        const crossSlider = document.getElementById('crossArea');
        const axialVal = document.getElementById('axialForceVal');
        const crossVal = document.getElementById('crossAreaVal');

        // Event listeners
        axialSlider.addEventListener('input', function() {
            axialForce = Number(this.value) * 1000;
            axialVal.textContent = this.value;
        });
        crossSlider.addEventListener('input', function() {
            crossArea = Number(this.value);
            crossVal.textContent = this.value;
        });
    };

    p.draw = function() {
        p.background(colours.background);

        rodHeight = Math.sqrt(crossArea);
        let stress = axialForce / crossArea; // N/mm² = MPa

        // Max stress for arrow scaling
        let axialMax = Number(document.getElementById('axialForce').max) * 1000;
        let crossAreaMin = Number(document.getElementById('crossArea').min);
        let maxStress = Math.abs(axialMax / crossAreaMin);

        // Draw fixed support
        p.push();
        p.translate(100, p.height / 2);
        p.fill(100);
        p.rect(-20, -80, 20, 160);
        for (let y = -80; y <= 80; y += 10) {
            p.stroke(60);
            p.line(-20, y, -30, y + 10);
        }

        // Draw rod
        p.fill(colours.material);
        p.stroke(0);
        p.rect(0, -rodHeight / 2, rodLength, rodHeight);

        // Draw load arrow at rod end
        p.push();
        p.strokeWeight(3);
        if (axialForce < 0) {
            drawArrow(p, rodLength + 200, 0, rodLength + 100, 0, colours.load, "force", { headAt: "end" }); // compression
        } else if (axialForce > 0) {
            drawArrow(p, rodLength + 100, 0, rodLength + 200, 0, colours.load, "force", { headAt: "end" }); // tension
        }
        p.fill(colours.text);
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.text(`N = ${(axialForce / 1000).toFixed(0)} kN`, rodLength + 150, -15);
        p.pop();

        // Force arrows along rod
        let numArrows = Math.max(3, Math.floor(rodHeight / 10));
        let baseX = rodLength + 20; // anchor at rod tip

        for (let i = 0; i < numArrows; i++) {
            let y = -rodHeight / 2 + (i + 0.5) * (rodHeight / numArrows);

            // Map stress magnitude to arrow length
            let arrowLength = p.map(Math.abs(stress), 0, maxStress, 15, 200);

            if (stress < 0) {
                // Compression: arrowhead at rod tip
                drawArrow(p, baseX, y, baseX + arrowLength, y, colours.normalForce, "force", { headAt: "start" });
            } else if (stress > 0) {
                // Tension: arrowhead at rod tip
                drawArrow(p, baseX, y, baseX + arrowLength, y, colours.normalForce, "force", { headAt: "end" });
            }
        }

        // Draw infinitesimal
        p.push();
        p.fill(colours.infinitesimal);
        p.rectMode(p.CENTER);
        //on-body
        p.rect(rodLength*0.95,0,7,7);
        //zoomed-in
        p.rect(450,130,70,70);
        //draw text
        p.fill(colours.text);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(14);
        p.text(`infinitesimal`, 450, 76);
        p.strokeWeight(3)
        //draw stress arrows
        let arrowLength = p.map(Math.abs(stress), 0, maxStress, 15, 200);
        if (stress < 0) {
            // Compression: arrowhead at rod tip
            drawArrow(p, 450+40, 130, 450+40 + arrowLength, 130, colours.normalForce, "force", { headAt: "start" });
            drawArrow(p, 450-40, 130, 450-40 - arrowLength, 130, colours.normalForce, "force", { headAt: "start" });
        } else if (stress > 0) {
            // Tension: arrowhead at rod tip
            drawArrow(p, 450-40, 130, 450-40 - arrowLength, 130, colours.normalForce, "force", { headAt: "end" });
            drawArrow(p, 450+40, 130, 450+40 + arrowLength, 130, colours.normalForce, "force", { headAt: "end" });
        }
        p.pop();

        // Display calculations
        p.fill(colours.text);
        p.noStroke();
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(14);
        p.text(`Axial Force: ${(axialForce / 1000).toFixed(0)} kN`, 50, 30);
        p.text(`Cross-sectional Area: ${crossArea.toFixed(0)} mm²`, 50, 50);
        p.text(`Stress: σ = N/A = ${stress.toFixed(1)} MPa`, 50, 70);
    };
}

// Shear Stress Simulation
function createShearSketch(p) {


function Irect(b,h){ return b*Math.pow(h,3)/12; }

function rawPartsFor(type){
    if(type==='rectangular'){
        const b= +document.getElementById('rect_b').value;
        const h= +document.getElementById('rect_h').value;
        return [ { b, h, y: 0 } ];
    }
    if(type==='t-section'){
        const bf=+document.getElementById('t_bf').value;
        const tf=+document.getElementById('t_tf').value;
        const tw=+document.getElementById('t_tw').value;
        const hw=+document.getElementById('t_hw').value;
        return [
            { b: bf, h: tf, y: -(hw/2 + tf/2) }, // top flange
            { b: tw, h: hw, y: 0 }               // web
        ];
    }
    if(type==='i-section'){
        const bf=+document.getElementById('i_bf').value;
        const tf=+document.getElementById('i_tf').value;
        const tw=+document.getElementById('i_tw').value;
        const hw=+document.getElementById('i_hw').value;
        return [
            { b: bf, h: tf, y: -(hw/2 + tf/2) }, // top flange
            { b: tw, h: hw, y: 0 },              // web
            { b: bf, h: tf, y:  (hw/2 + tf/2) }  // bottom flange
        ];
    }
    return [];
}

function sectionProps(raw){
    let A=0, Ay=0;
    for(const r of raw){ const a=r.b*r.h; A+=a; Ay+=a*r.y; }
    const yNA = Ay/A; // mm

    let I=0;
    const parts = raw.map(r=>{
        const y0 = r.y - yNA;
        I += Irect(r.b, r.h) + r.b*r.h*y0*y0;
        return { b:r.b, h:r.h, y:y0 };
    });

    const yTop = Math.min(...parts.map(r=>r.y - r.h/2));
    const yBot = Math.max(...parts.map(r=>r.y + r.h/2));
    const H = yBot - yTop;

    return { A, yNA, I, parts, yTop, yBot, H };
}

function breadthAtY(parts, y){
    let b=0;
    for(const r of parts){
        const top=r.y - r.h/2, bot=r.y + r.h/2;
        if(y>=top-1e-9 && y<=bot+1e-9) b = Math.max(b, r.b);
    }
    return b;
}

function QAbove_withCentroid(parts, y){
    let Q=0, A=0, Ay=0;
    for(const r of parts){
        const top=r.y - r.h/2, bot=r.y + r.h/2;
        if(y < bot){
            const yClipTop = Math.max(y, top);
            const hClip = Math.max(0, bot - yClipTop);
            if(hClip > 0){
                const Aclip = r.b * hClip;
                const yc = yClipTop + hClip/2;
                Q += Aclip * yc; // about NA
                A += Aclip;
                Ay += Aclip * yc;
            }
        }
    }
    const yCentroid = (A>0) ? Ay/A : null;
    return { Q, AclipTotal: A, yCentroid };
}

function importantLevels(parts){
    const edges=[];
    for(const r of parts){ edges.push(r.y - r.h/2, r.y + r.h/2); }
    const uniq=[];
    edges.forEach(v=>{ if(!uniq.some(u=>Math.abs(u-v)<1e-6)) uniq.push(v); });
    if(!uniq.some(u=>Math.abs(u)<1e-6)) uniq.push(0);
    uniq.sort((a,b)=>a-b);
    return uniq;
}

    // --- End local helpers ---

    let V = 130e3; // N
    let sectionType = 'rectangular';

    p.setup = function() {
        let canvas = p.createCanvas(800, 400);
        canvas.parent('sketch-holder-shear');

        // UI bindings
        const shearSlider = document.getElementById('shearForce');
        const shearVal = document.getElementById('shearForceVal');
        shearSlider.addEventListener('input', e => {
            V = Number(e.target.value) * 1000; // kN → N
            shearVal.textContent = e.target.value;
        });

        const sel = document.getElementById('shearSection');
        sel.addEventListener('change', () => {
            sectionType = sel.value;
            document.querySelectorAll('.section-inputs').forEach(d=>d.style.display='none');
            document.getElementById(sectionType+'-inputs').style.display='flex';
        });
        sel.dispatchEvent(new Event('change'));

        // dimension inputs and cut slider: redraw handled by p5 loop
        document.querySelectorAll('input[type="number"]').forEach(inp => {
            inp.addEventListener('input', ()=>{});
        });
        
        // Cut slider event listener for readout update
        document.getElementById('cutSlider').addEventListener('input', ()=>{});
    };

    p.draw = function(){
        p.background(colours.background);

        // Build geometry and properties
        const raw = rawPartsFor(sectionType);
        const props = sectionProps(raw);
        const parts = props.parts;
        const tauScale = 3; // [px/MPa] - reduced for 800px width

        // Layout coordinates for 800x400 canvas
        const X_SECTION = 250;         // x of cross-section centre
        const X_DIST_ORIGIN = 400;     // x of distribution origin (τ=0, y=0)
        const BOTTOM_BLOCK_X = 75;    // y of zoomed infinitesimal centre
        const BOTTOM_BLOCK_Y = 250;    // y of zoomed infinitesimal centre

        // y mapping: scale to fit 400px height
        const yScale = 1.2;
        const y2px = y => (p.height * 0.5) + (y * yScale); // NA at canvas centre

        // === LEFT: Cross-section ===
        p.push();
        p.translate(X_SECTION, p.height*0.5);
        p.fill(colours.material); 
        p.stroke(colours.axis); 
        p.strokeWeight(2);
        for(const r of parts){
            p.rect(-r.b/2 * yScale, (r.y - r.h/2) * yScale, r.b * yScale, r.h * yScale);
        }
        // Neutral axis (y=0)
        const maxWidth = Math.max(...parts.map(r=>r.b)) * yScale;
        drawDashedLine(p, -maxWidth/2 - 20, 0, maxWidth/2 + 20, 0, 6, colours.subtleDashed, 1);
        p.pop();

        // Applied shear force arrow (downward at top centre)
        const topPix = props.yTop * yScale;
        drawArrow(p, X_SECTION, y2px(topPix) - 25, X_SECTION, y2px(topPix)+10, colours.load);
        p.noStroke(); 
        p.fill(colours.text); 
        p.textAlign(p.CENTER, p.BOTTOM);
        p.text(`V = ${(V/1000).toFixed(0)} kN`, X_SECTION, y2px(topPix) - 30);

        // === CUT visualisation ===
        const slider = document.getElementById('cutSlider');
        const cutPct = Number(slider.value)/100; // 0 top → 1 bottom
        const yCut = props.yTop + props.H * cutPct;    // mm, measured from NA
        document.getElementById('cutReadout').textContent = `Cut @ y = ${yCut.toFixed(1)} mm`;
        // Draw cut line across section
        drawDashedLine(p, X_SECTION - 80, y2px(yCut), X_SECTION + 80, y2px(yCut), 4, colours.shadedEdge, 1.5);

        // Shade the area ABOVE the cut and mark its centroid
        p.push();
        p.translate(X_SECTION, p.height * 0.5);
        p.noStroke(); 
        p.fill(colours.shaded);
        for(const r of parts){
            const top = r.y - r.h/2, bot = r.y + r.h/2;
            if(yCut < bot){
                const yClipTop = Math.max(yCut, top);
                const hClip = Math.max(0, bot - yClipTop);
                if(hClip > 0){
                    p.rect(-r.b/2 * yScale, yClipTop * yScale, r.b * yScale, hClip * yScale);
                }
            }
        }
        const { Q:Qcut, AclipTotal:Aclip, yCentroid:yc_shaded } = QAbove_withCentroid(parts, yCut);
        if(Aclip>0){
            p.fill(colours.shadedEdge); 
            p.noStroke();
            p.circle(0, yc_shaded * yScale, 4);
        }
        p.pop();

        // === RIGHT: τ—y distribution ===
        const originX = X_DIST_ORIGIN, originY = y2px(0);
        p.stroke(colours.axis); 
        p.strokeWeight(1.5);
        // y-axis
        p.line(originX, y2px(props.yTop), originX, y2px(props.yBot));
        // τ-axis
        p.line(originX, originY, originX + 180, originY);
        p.noStroke(); 
        p.fill(colours.text);
        p.textAlign(p.LEFT, p.CENTER); 
        p.text('τ (MPa)', originX + 185, originY - 8);
        p.textAlign(p.RIGHT, p.TOP); 
        p.text('y', originX - 5, y2px(props.yTop) - 15);

        // Compute τ(y) and draw curve
        const samples = [];
        const nSamples = Math.max(60, Math.floor(props.H/4));
        for(let i=0;i<=nSamples;i++){
            const y = props.yTop + props.H * (i/nSamples); // mm
            const t = breadthAtY(parts, y);
            const { Q } = QAbove_withCentroid(parts, y);
            const tau = (t>0) ? (V * Q) / (props.I * t) : 0; // MPa
            samples.push({ y, tau });
        }
        p.noFill(); 
        p.stroke(colours.shearCurve); 
        p.strokeWeight(3);
        p.beginShape();
        for(const s of samples){
            const x = originX + s.tau * tauScale;
            const y = y2px(s.y);
            p.vertex(x, y);
        }
        p.endShape();

        // Mark τ at the cut line
        {
            const tCut = breadthAtY(parts, yCut);
            const { Q:Qy } = QAbove_withCentroid(parts, yCut);
            const tauCut = (tCut>0) ? (V*Qy)/(props.I*tCut) : 0;
            const xCut = originX + tauCut * tauScale;
            const yCutPx = y2px(yCut);
            p.fill(colours.shearCurve); 
            p.noStroke();
            p.circle(xCut, yCutPx, 6);
            // dashed guides to axes
            drawDashedLine(p, originX, yCutPx, xCut, yCutPx, 4, colours.dashed, 1);
            drawDashedLine(p, xCut, yCutPx, xCut, originY, 4, colours.dashed, 1);
            // label
            p.noStroke(); 
            p.fill(colours.text); 
            p.textAlign(p.LEFT, p.BOTTOM);
            p.text(`τ = ${tauCut.toFixed(2)} MPa`, xCut + 5, yCutPx - 4);
        }

        // === Construction lines ===
        const levels = importantLevels(parts);
        const secRightX = X_SECTION + (Math.max(...parts.map(r=>r.b)) * yScale)/2 + 8;
        for(const yLvl of levels){
            const ySec = y2px(yLvl);
            drawDashedLine(p, secRightX, ySec, originX, ySec, 6, colours.dashed, 1);
            p.noStroke(); 
            p.fill(colours.text); 
            p.textAlign(p.RIGHT, p.CENTER);
            if (Math.abs(yLvl) < 1e-6) p.text('NA', originX - 8, ySec);
        }

        // === Small infinitesimal on section ===
        p.push();
        p.translate(X_SECTION, p.height * 0.5);
        p.stroke(0); 
        p.strokeWeight(1); 
        p.fill(255);
        p.rect(-4, -4, 8, 8);
        p.pop();

        // === Zoomed infinitesimal with shear arrows ===
        const t0 = breadthAtY(parts, 0);
        const { Q:Q0 } = QAbove_withCentroid(parts, 0);
        const tau0 = (t0>0) ? (V*Q0)/(props.I*t0) : 0; // MPa
        const arrowLen = Math.min(50, Math.abs(tau0) * 2.5);

        const blockW = 60, blockH = 60;
        const cx = BOTTOM_BLOCK_X;
        const cy = BOTTOM_BLOCK_Y;
        p.stroke(0); 
        p.fill(255);
        p.rect(cx - blockW/2, cy - blockH/2, blockW, blockH);

        // four complementary shear arrows
        if(arrowLen > 5) {
            // Right face: down
            drawMidpointArrow(p, cx + blockW/2+10, cy, 0, 1, arrowLen, 'positive', colours.shearCurve);
            // Left face: up
            drawMidpointArrow(p, cx - blockW/2-10, cy, 0, 1, arrowLen, 'negative', colours.shearCurve);
            // Top face: right
            drawMidpointArrow(p, cx, cy - blockH/2-10, 1, 0, arrowLen, 'positive', colours.shearCurve);
            // Bottom face: left
            drawMidpointArrow(p, cx, cy + blockH/2+10, 1, 0, arrowLen, 'negative', colours.shearCurve);
        }

        p.noStroke(); 
        p.fill(colours.text); 
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(12);
        p.text(`Infinitesimal at NA`, cx, cy - blockH/2 - 35);
        p.text(`τ(0) = ${tau0.toFixed(2)} MPa`, cx, cy + blockH/2 + 35);

        // Display section properties
        p.fill(colours.text);
        p.noStroke();
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(12);
        p.text(`Section: ${sectionType}`, 20, 30);
        p.text(`Area: ${props.A.toFixed(0)} mm²`, 20, 50);
        p.text(`I: ${(props.I/1e6).toFixed(1)} × 10⁶ mm⁴`, 20, 70);
        p.text(`V: ${(V/1000).toFixed(0)} kN`, 20, 90);
    };
    
    p.windowResized = function() {
        p.resizeCanvas(800, 400);
    };
}

// Bending Stress Simulation
function createBendingSketch() {
  const sketch = (p) => {
    // -------- Canvas & layout --------
    const PAD = 18;
    const W = 980;
    const H = 460;
    const COL_BEAM_W = 430;                 // beam (left)
    const COL_DIST_W = 140;                 // distribution (middle)
    const COL_SECT_W = W - (COL_BEAM_W + COL_DIST_W) - 3 * PAD; // cross-section (right)

    const TOP_ROW_H_FRAC = 0.62;
    const topRowH = Math.floor((H - 2 * PAD) * TOP_ROW_H_FRAC);
    const zoomRowH = (H - 2 * PAD) - topRowH - 12;

    const X_BEAM = PAD;
    const X_DIST = X_BEAM + COL_BEAM_W + PAD;
    const X_SECT = X_DIST + COL_DIST_W + PAD;

    // -------- Colours (UK spelling) --------
    const RED   = [200, 40, 40];      // moment & stress
    const STEEL = [60, 60, 60];       // outlines
    const NA_DASH = [7, 6];

    // -------- Physics & scales --------
    const L = 2.0; // beam length [m]

    // ONE CONSTANT VISUAL SCALE for the whole sketch:
    // choose a "worst case" max total section height to map to ~90% of the top row.
    // Adjust these if you later change the input extremes.
    const MAX_SECTION_H_MM = 360; // encompass extremes of all sliders (rect & T)
    const PX_PER_M = (topRowH * 0.9) / (MAX_SECTION_H_MM / 1000);  // constant
    const PX_PER_MM = PX_PER_M / 1000;

    // Arrow scales (visual only)
    const stressArrowScale = 5e-7;     // px per Pa for arrows (constant)
    const zoomArrowBoost   = 1.35;     // slightly larger arrows in zoom
    const Mscale           = 6e-4;   // px per (N·m) for M(x) diagram

    // -------- DOM controls (bending‑only) --------
    let elF, elSec;
    let elRectB, elRectH;
    let elTbf, elTtf, elTtw, elThw;
    let elX, elY;
    let spF, spX, spY;
    let rowRect, rowT;

    // -------- Helpers --------
    const N = (kN) => kN * 1000.0;
    const mmToM = (mm) => mm / 1000.0;
    const sigma = (M, yFromNA, I) => (M * yFromNA) / I; // Pa

    function getRectProps(b_mm, h_mm) {
      const b = mmToM(b_mm), h = mmToM(h_mm);
      const A = b * h;
      const yc = h / 2;                           // from top
      const I = (b * Math.pow(h, 3)) / 12;
      return { type: "rect", A, yc, I, h, b,
               // store mm too for convenience with constant PX_PER_MM
               b_mm: b_mm, h_mm: h_mm };
    }

    function getTProps(bf_mm, tf_mm, tw_mm, hw_mm) {
      const bf = mmToM(bf_mm), tf = mmToM(tf_mm);
      const tw = mmToM(tw_mm), hw = mmToM(hw_mm);
      const h = tf + hw;

      const Af = bf * tf, Aw = tw * hw, A = Af + Aw;
      // centroid from top:
      const yc = (Af * (tf / 2) + Aw * (tf + hw / 2)) / A;

      // I about centroidal horizontal axis
      const If = (bf * Math.pow(tf, 3)) / 12 + Af * Math.pow(yc - tf / 2, 2);
      const Iw = (tw * Math.pow(hw, 3)) / 12 + Aw * Math.pow((tf + hw / 2) - yc, 2);

      return { type: "t", A, yc, I: (If + Iw), h, b: bf, // b = flange width for labels
               bf, tf, tw, hw,
               bf_mm: bf_mm, tf_mm: tf_mm, tw_mm: tw_mm, hw_mm: hw_mm };
    }

    function drawArrow(x1, y1, x2, y2, head = 8) {
      p.line(x1, y1, x2, y2);
      const a = Math.atan2(y2 - y1, x2 - x1);
      p.push(); p.translate(x2, y2); p.rotate(a);
      if (p.dist(x1,y1,x2,y2) > head) {
        p.triangle(-head, -head * 0.6, -head, head * 0.6, 0, 0);
      }
      p.pop();
    }

    function drawEncastre(x, y, hPix) {
      p.push();
      p.stroke(...STEEL); p.strokeWeight(2);
      p.line(x - 18, y - hPix / 2 - 10, x - 18, y + hPix / 2 + 10);
      for (let yy = y - hPix / 2 - 10; yy <= y + hPix / 2 + 10; yy += 8) {
        p.line(x - 24, yy, x - 12, yy + 8);
      }
      p.pop();
    }

    function draw10pxSquare(cx, cy) {
      p.push();
      p.strokeWeight(1);
      p.fill(255);
      p.rectMode(p.CENTER);
      p.rect(cx, cy, 10, 10);
      p.pop();
    }

    // ---------- Beam (left) ----------
    function drawBeamAndMoment(FkN, props, xm, yFrac, yTopPx) {
      const beamPxH = props.h * PX_PER_M;
      const yMid = yTopPx + beamPxH / 2;

      const beamInnerPad = 24;
      const beamPxL = COL_BEAM_W - beamInnerPad * 2 - 40;
      const beamX0 = X_BEAM + beamInnerPad;

      // Beam body
      p.push();
      p.fill(235); p.stroke(...STEEL); p.strokeWeight(2);
      p.rect(beamX0, yTopPx, beamPxL, beamPxH);
      p.pop();

      // Encastre
      drawEncastre(beamX0, yMid, beamPxH);

      // NA
      p.push();
      p.stroke(...STEEL); p.strokeWeight(1.5);
      p.drawingContext.setLineDash(NA_DASH);
      p.line(beamX0 - 12, yTopPx + props.yc * PX_PER_M, beamX0 + beamPxL + 12, yTopPx + props.yc * PX_PER_M);
      p.drawingContext.setLineDash([]);
      p.pop();

      // Tip force
      const FN = N(FkN);
      const len = p.constrain(Math.log10(Math.max(1, Math.abs(FN))) * 14, 12, 90) * 0.9;
      const xTip = beamX0 + beamPxL + 10;
      const yTop = yTopPx - 20;
      const dir = FN >= 0 ? 1 : -1;
      p.push();
      p.stroke(0); p.fill(0); p.strokeWeight(2);
      drawArrow(xTip, yTop, xTip, yTop + dir * len, 9);
      p.noStroke(); p.fill(0); p.textAlign(p.LEFT, p.CENTER);
      p.text(`${FkN.toFixed(0)} kN`, xTip + 8, yTop - 6 + dir * len * 0.5);
      p.pop();

      // Position marker + small square
      const x_px = beamX0 + p.constrain(xm / L, 0, 1) * beamPxL;
      const ySelPx = p.lerp(yTopPx, yTopPx + beamPxH, (yFrac + 1) / 2);
      draw10pxSquare(x_px, ySelPx);

      // Length label
      p.push();
      p.stroke(120); p.strokeWeight(1);
      const yDim = yTopPx + beamPxH + 36;
      drawArrow(beamX0, yDim, beamX0 + beamPxL, yDim, 7);
      drawArrow(beamX0 + beamPxL, yDim, beamX0, yDim, 7);
      p.noStroke(); p.fill(0); p.textAlign(p.CENTER, p.TOP);
      p.text(`L = ${L.toFixed(2)} m`, beamX0 + beamPxL / 2, yDim + 6);
      p.pop();

      // M(x) diagram under beam
      const baseY = yTopPx + beamPxH + 10;
      p.push();
      p.stroke(...RED); p.strokeWeight(2);
      p.line(beamX0, baseY, beamX0 + beamPxL, baseY);
      p.noFill(); p.beginShape();
      for (let i = 0; i <= 100; i++) {
        const frac = i / 100, x_m = frac * L, M = FN * (L - x_m);
        const yOff = -M * Mscale;
        p.vertex(beamX0 + frac * beamPxL, baseY + yOff);
      }
      p.endShape();
      p.line(beamX0, baseY, beamX0, baseY - FN * L * Mscale);
      p.noStroke(); p.fill(...RED);
      p.textAlign(p.LEFT, p.TOP);
      p.text('M(x) = F (L − x)', beamX0, baseY + 6);
      const M0 = FN * L;
      p.text(`M(0) = ${(M0 / 1000).toFixed(1)} kN·m`, beamX0 + 4, baseY - M0 * Mscale - 16);
      p.textAlign(p.RIGHT, p.TOP); p.text('M(L) = 0', beamX0 + beamPxL, baseY + 6);
      p.pop();

      return { ySelPx: ySelPx };
    }

    // ---------- Distribution (middle) ----------
    function drawDistribution(FkN, props, xm, yTopPx) {
      const FN = N(FkN);
      const Mx = FN * (L - xm);
      const I  = props.I;

      const xMid = X_DIST + Math.floor(COL_DIST_W * 0.52);
      const yNA  = yTopPx + props.yc * PX_PER_M;
      const hPx  = props.h * PX_PER_M;
      //const maxArrow = 90;

      // NA (dashed)
      p.push();
      p.stroke(...STEEL); p.strokeWeight(1.5);
      p.drawingContext.setLineDash(NA_DASH);
      p.line(X_DIST - 14, yNA, X_DIST + COL_DIST_W + 14, yNA);
      p.drawingContext.setLineDash([]);
      p.pop();

      // central vertical σ=0 axis across full section height
      p.push(); p.stroke(0); p.strokeWeight(1);
      p.line(xMid, yTopPx, xMid, yTopPx + hPx);
      p.pop();

      // discrete arrows (linear distribution)
      const nBands = 11;
      for (let i = 0; i <= nBands; i++) {
        const t = i / nBands;
        const yFromTop_m = props.h * t;
        const sig = sigma(Mx, yFromTop_m - props.yc, I); // Pa
        const yy  = yTopPx + yFromTop_m * PX_PER_M;
        const mag = Math.abs(sig) * stressArrowScale;
        const sgn = Math.sign(sig);
        p.push();
        p.stroke(...RED); p.fill(...RED); p.strokeWeight(1.6);
        if (sgn <= 0) drawArrow(xMid, yy, xMid + mag, yy, 7);
        else          drawArrow(xMid, yy, xMid - mag, yy, 7);
        p.pop();
      }

      // continuous curve
      p.push();
      p.noFill(); p.stroke(...RED); p.strokeWeight(2);
      p.beginShape();
      for (let i = 0; i <= 120; i++) {
        const t = i / 120;
        const yFromTop_m = props.h * t;
        const sig = sigma(-Mx, yFromTop_m - props.yc, I);
        const yy  = yTopPx + yFromTop_m * PX_PER_M;
        const xOff = sig * stressArrowScale;
        p.vertex(xMid + xOff, yy);
      }
      p.endShape();
      p.pop();

      // title
      p.push();
      p.fill(0); p.textAlign(p.CENTER, p.BOTTOM);
      p.text('Stress distribution', xMid, yTopPx - 8);
      p.pop();
    }

    // ---------- Cross‑section (right) ----------
    function drawSection(props, yTopPx, yFrac) {
      const cx = X_SECT + Math.floor(COL_SECT_W * 0.45);
      const yNA = yTopPx + props.yc * PX_PER_M;

      // outlines
      p.push();
      p.fill(245); p.stroke(...STEEL); p.strokeWeight(2);
      if (props.type === "rect") {
        const w = props.b_mm * PX_PER_MM, h = props.h_mm * PX_PER_MM;
        p.rect(cx - w / 2, yTopPx, w, h);
      } else {
        const wf = props.bf_mm * PX_PER_MM, tf = props.tf_mm * PX_PER_MM;
        const ww = props.tw_mm * PX_PER_MM, hw = props.hw_mm * PX_PER_MM;
        p.rect(cx - wf / 2, yTopPx, wf, tf);          // flange (top)
        p.rect(cx - ww / 2, yTopPx + tf, ww, hw);      // web
      }
      p.pop();

      // NA
      p.push();
      p.stroke(120); p.strokeWeight(1.5);
      p.drawingContext.setLineDash(NA_DASH);
      p.line(X_SECT + 70, yNA, X_SECT + 270, yNA);
      p.drawingContext.setLineDash([]);
      p.noStroke(); p.textAlign(p.CENTER,p.BOTTOM);
      p.text('NA', X_SECT+70, yNA);
      p.pop();

      // infinitesimal 10 px square (mid‑width)
      const ySelPx = p.lerp(yTopPx, yTopPx + props.h * PX_PER_M, (yFrac + 1) / 2);
      draw10pxSquare(cx, ySelPx);

      // title
      p.push();
      p.fill(0); p.textAlign(p.CENTER, p.BOTTOM);
      p.text('Cross‑section', cx, yTopPx - 8);
      p.pop();

      return { ySelPx };
    }

    // ---------- Zoomed element (bottom) ----------
    function drawZoom(FkN, xm, props, ySelPx, yTopPx) {
      const FN = N(FkN), Mx = FN * (L - xm), I = props.I;

      const zx = PAD, zw = W - 2 * PAD;
      const zy = PAD + topRowH + 12;
      const zh = zoomRowH;

      const eSize = Math.min(zh * 0.5, 120);
      const ex = zx + zw * 0.5;
      const ey = zy + zh / 2;
      p.push();
      p.fill(252); p.stroke(...STEEL); p.strokeWeight(2);
      p.rectMode(p.CENTER); p.rect(ex, ey, eSize, eSize);
      p.pop();

      const yFromTop_m = (ySelPx - yTopPx) / PX_PER_M;
      const sigPa = sigma(Mx, yFromTop_m - props.yc, I);
      const mag = p.constrain(Math.abs(sigPa) * stressArrowScale * zoomArrowBoost, 0, zw * 0.32);
      const sgn = Math.sign(sigPa);

      p.push();
      p.stroke(...RED); p.fill(...RED); p.strokeWeight(2);
      if (sgn <= 0) {
        drawArrow(ex + eSize / 2, ey, ex + eSize / 2 + mag, ey, 9);
        drawArrow(ex - eSize / 2, ey, ex - eSize / 2 - mag, ey, 9);
      } else {
        drawArrow(ex + eSize / 2 + mag, ey, ex + eSize / 2, ey, 9);
        drawArrow(ex - eSize / 2 - mag, ey, ex - eSize / 2, ey, 9);
      }
      p.pop();

      p.push();
      p.noStroke(); p.fill(0);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text(`σ = ${(sigPa / 1e6).toFixed(2)} MPa`, ex + eSize / 2 + 10, ey - 6);
      p.textAlign(p.CENTER, p.TOP);
      p.text('Zoomed infinitesimal element', ex, zy + 8);
      p.pop();
    }

    // ---------- UI sync ----------
    function updateVisibility() {
      const sel = elSec?.value || 'rectangular';
      if (rowRect) rowRect.style.display = (sel === 'rectangular') ? 'flex' : 'none';
      if (rowT)    rowT.style.display    = (sel === 't-section')  ? 'flex' : 'none';
    }
    function updateReadouts(FkN, x_m, yFrac) {
      if (spF) spF.textContent = FkN.toFixed(0);
      if (spX) spX.textContent = x_m.toFixed(2);
      if (spY) spY.textContent = yFrac.toFixed(2);
    }

    // ---------- p5 lifecycle ----------
    p.setup = () => {
      const cnv = p.createCanvas(W, H);
      cnv.parent('sketch-holder-bending');

      // hook bending‑only DOM (these must exist in your bending controls)
      elF     = document.getElementById('bendingForce');
      elSec   = document.getElementById('bendingSection');  // "rectangular" | "t-section"
      elRectB = document.getElementById('bend_rect_b');
      elRectH = document.getElementById('bend_rect_h');
      elTbf   = document.getElementById('bend_t_bf');
      elTtf   = document.getElementById('bend_t_tf');
      elTtw   = document.getElementById('bend_t_tw');
      elThw   = document.getElementById('bend_t_hw');
      elX     = document.getElementById('bendX');
      elY     = document.getElementById('bendY');

      spF = document.getElementById('bendingForceVal');
      spX = document.getElementById('bendXVal');
      spY = document.getElementById('bendYVal');

      rowRect = document.getElementById('bend-rect-inputs');
      rowT    = document.getElementById('bend-t-inputs');

      // keep visibility in sync
      elSec?.addEventListener('input', updateVisibility);
      elSec?.addEventListener('change', updateVisibility);
      updateVisibility();
    };

    p.draw = () => {
      p.background(255);

      // read controls (continuous draw means we don't need listeners to trigger redraw)
      const FkN = Number(elF?.value ?? 10);
      const xm  = p.constrain(Number(elX?.value ?? 0.30), 0, L);
      const yFr = p.constrain(Number(elY?.value ?? -1.0), -1, 1);

      const sel = elSec?.value ?? 'rectangular';

      // section props
      let props;
      if (sel === 't-section') {
        const bf = Number(elTbf?.value ?? 140);
        const tf = Number(elTtf?.value ?? 30);
        const tw = Number(elTtw?.value ?? 20);
        const hw = Number(elThw?.value ?? 160);
        props = getTProps(bf, tf, tw, hw);
      } else {
        const b = Number(elRectB?.value ?? 120);
        const h = Number(elRectH?.value ?? 200);
        props = getRectProps(b, h);
      }

      updateReadouts(FkN, xm, yFr);

      // vertical placement: align by TOP fibre for all three panels
      // because scale is constant, varying h WILL change pixel height
      const yTopPx = PAD + Math.floor((topRowH - props.h * PX_PER_M) / 2);

      // draw the three aligned panels
      const { ySelPx } = drawSection(props, yTopPx, yFr);    // draw right first for dimensions confidence
      drawBeamAndMoment(FkN, props, xm, yFr, yTopPx);        // left
      // bottom zoom
      drawZoom(FkN, xm, props, ySelPx, yTopPx);
      drawDistribution(FkN, props, xm, yTopPx);              // middle
    };
  };

  if (window.__bendingP5__) { try { window.__bendingP5__.remove(); } catch(e){} }
  window.__bendingP5__ = new p5(sketch);
}

// Torsion Stress Simulation
function createTorsionSketch(p) {

    // --- Local helpers moved into this sketch ---

function drawDoubleArrow(p, x1, y1, x2, y2, headSize = 8) {
    p.push();
    
    // Draw the main line
    p.line(x1, y1, x2, y2);
    
    // Calculate angle of the arrow
    const angle = p.atan2(y2 - y1, x2 - x1);
    
    // Calculate positions for the two arrowheads
    // First head at the end point
    // Second head slightly behind the first
    const headSpacing = headSize * 0.8; // Space between the two heads
    
    // First arrowhead (at the tip)
    p.push();
    p.translate(x2, y2);
    p.rotate(angle);
    p.noStroke();
    p.triangle(3, 0, -headSize, -headSize * 0.6, -headSize, headSize * 0.6);
    p.pop();
    
    // Second arrowhead (behind the first)
    const x2_second = x2 - headSpacing * p.cos(angle);
    const y2_second = y2 - headSpacing * p.sin(angle);
    
    p.push();
    p.translate(x2_second, y2_second);
    p.rotate(angle);
    p.noStroke();
    p.triangle(3, 0, -headSize, -headSize * 0.6, -headSize, headSize * 0.6);
    p.pop();
    
    p.pop();
}

    // --- End local helpers ---

    let T = 5; // kN·m
    let sectionType = 'solid';
    let D=200; // mm for solid
    let Do=200; // mm for hollow
    let Di=160; // mm for hollow (inner diameter)
    let elementR = 1; // 0=center, 1=edge (controlled by slider)
    
    p.setup = function() {
        let canvas = p.createCanvas(800, 400);
        canvas.parent('sketch-holder-torsion');
        
        // UI bindings
        const torqueSlider = document.getElementById('torTorque');
        const torqueVal = document.getElementById('torTorqueVal');
        torqueSlider.addEventListener('input', function() {
            T = parseFloat(this.value);
            torqueVal.textContent = T.toFixed(1);
        });

        // Infinitesimal element radial position slider (0=center → 1=edge)
        const elemPosSlider = document.getElementById('torElementPos');
        const elemPosVal = document.getElementById('torElementPosVal');
        if (elemPosSlider && elemPosVal) {
            const updateElemPos = () => {
                elementR = parseFloat(elemPosSlider.value);
                // keep within [0,1]
                if (!isFinite(elementR)) elementR = 0;
                elementR = Math.max(0, Math.min(1, elementR));
                elemPosVal.textContent = elementR.toFixed(2);
            };
            elemPosSlider.addEventListener('input', updateElemPos);
            // initialize readout
            updateElemPos();
        }

        
        const sectionSelect = document.getElementById('torSection');
        sectionSelect.addEventListener('change', function() {
            sectionType = this.value;
            document.getElementById('torSolidDims').style.display = 
                sectionType === 'solid' ? 'flex' : 'none';
            document.getElementById('torHollowDims').style.display = 
                sectionType === 'hollow' ? 'flex' : 'none';
        });
        
        // Solid diameter input
        document.getElementById('torD').addEventListener('input', function() {
            D = parseFloat(this.value);
        });
        
        // Hollow dimensions inputs
        document.getElementById('torDo').addEventListener('input', function() {
            Do = parseFloat(this.value);
        });
        
        document.getElementById('torThk').addEventListener('input', function() {
            const thickness = parseFloat(this.value);
            Di = Math.max(0, Do - 2 * thickness);
        });
        
        // Initialize visibility
        sectionSelect.dispatchEvent(new Event('change'));
    };
    
    p.draw = function() {
        p.background(colours.background);
        
        // Calculate section properties
        let J, outerRadius, innerRadius = 0;
        
        if (sectionType === 'solid') {
            outerRadius = D / 2; // mm
            J = Math.PI * Math.pow(D/1000, 4) / 32; // m^4
        } else {
            outerRadius = Do / 2; // mm
            innerRadius = Di / 2; // mm
            J = Math.PI * (Math.pow(Do/1000, 4) - Math.pow(Di/1000, 4)) / 32; // m^4
        }
        
        // Dynamic scaling based on current diameter - NO CLAMPING
        const maxDiameter = sectionType === 'solid' ? D : Do;
                
        // Convert torque to N·m
        const T_Nm = T * 1000;
        
        // Calculate maximum shear stress
        const tau_max = Math.abs(T_Nm * (outerRadius/1000)) / J; // Pa
        const tau_max_MPa = tau_max / 1e6;
        
        // Layout - beam moved more to the left
        const beamCenterY = 150;
        const beamX = 50; // Moved left from 100
        const sectionCenterX = 380; // Adjusted
        const distCenterX = 620; // Adjusted
        
        // === LEFT: Beam with double-headed torque arrow ===
        p.push();
        p.translate(beamX, beamCenterY);
        
        // Draw beam (height scales with diameter)
        const beamHeight = maxDiameter;
        const beamWidth = 180;
        p.fill(colours.material);
        p.stroke(0);
        p.strokeWeight(2);
        p.rect(0, -beamHeight/2, beamWidth, beamHeight);
        
        // Draw fixed support
        p.fill(100);
        p.rect(-20, -beamHeight/2 - 10, 20, beamHeight + 20);
        for (let y = -beamHeight/2 - 10; y <= beamHeight/2 + 10; y += 8) {
            p.stroke(60);
            p.line(-20, y, -30, y + 8);
        }
        
        // Draw double-headed torque arrow
        p.push();
        p.strokeWeight(3);
        p.stroke(colours.load);
        p.fill(colours.load);
        
        if (T > 0) {
            // Positive torque: -->> (anticlockwise viewed from right)
            // Top arrow pointing right
            drawDoubleArrow(p, beamWidth-5, 0, beamWidth-50, 0, headSize = 8);
            //drawArrow(p, beamWidth + 20, -beamHeight/4, beamWidth + 20 + arrowLength, -beamHeight/4, colours.load);
            
        } else if (T < 0) {
            // Negative torque: <<-- (clockwise viewed from right)
            // Top arrow pointing left
            drawDoubleArrow(p, beamWidth-50, 0, beamWidth-5, 0, headSize = 8);
        }
        p.pop();
        
        // Label
        p.fill(colours.text);
        p.noStroke();
        p.textAlign(p.RIGHT, p.TOP);
        p.text(`T = ${T.toFixed(1)} kN·m`, beamWidth-5 , - 30);
        
        p.pop();
        
        // === CENTER: Cross-section with MANY shear flow arrows ===
        p.push();
        p.translate(sectionCenterX, beamCenterY);
        
        // Draw cross-section
        p.noFill();
        p.stroke(0);
        p.strokeWeight(2);
        p.ellipse(0, 0, 2 * outerRadius, 2 * outerRadius);
        
        if (sectionType === 'hollow') {
            p.ellipse(0, 0, 2 * innerRadius, 2 * innerRadius);
        }
        
        // Draw small element on section at chosen radius on 0° line
        const elemX = elementR * outerRadius;
        const elemY = 0;
        const isVoidHere = (sectionType === 'hollow' && (elementR * outerRadius) < innerRadius);
        p.fill(isVoidHere ? 240 : colours.infinitesimal);
        p.stroke(isVoidHere ? 150 : 0);
        p.strokeWeight(1);
        p.rectMode(p.CENTER);
        p.rect(elemX, elemY, 10, 10);
        
        // Draw 0° diameter line (for reference to right panel)
        p.stroke(120);
        p.strokeWeight(1);
        drawDashedLine(p, -outerRadius, 0, outerRadius, 0, 4, colours.dashed);
        
        // Draw MANY concentric circles of shear flow arrows
        const numCircles = sectionType === 'solid' ? 4 : Math.floor((outerRadius - innerRadius) / 10);
        const numArrowsPerCircle = 24;
        
        for (let ring = 1; ring <= numCircles; ring++) {
            let r_mm;
            if (sectionType === 'solid') {
                r_mm = (ring / numCircles) * outerRadius;
            } else {
                r_mm = innerRadius + (ring / numCircles) * (outerRadius - innerRadius);
            }
            
            const r_px = r_mm;
            const tau_r = Math.abs(T_Nm * (r_mm/1000)) / J; // Pa
            const tau_r_MPa = tau_r / 1e6;
            
            // Arrow length proportional to local stress
            const arrowLength = p.map(tau_r_MPa, 0, Math.max(tau_max_MPa, 1), 2, 30);
            
            for (let i = 0; i < numArrowsPerCircle; i++) {
                const angle = (i / numArrowsPerCircle) * p.TWO_PI;
                const x = r_px * p.cos(angle);
                const y = r_px * p.sin(angle);
                
                // Tangential direction (perpendicular to radius)
                const tangentAngle = angle + p.HALF_PI * Math.sign(T);
                
                const dx = arrowLength * p.cos(tangentAngle);
                const dy = arrowLength * p.sin(tangentAngle);
                
                p.push();
                p.stroke(colours.twistingTorque);
                p.strokeWeight(1.5);
                drawArrow(p, x - dx/2, y - dy/2, x + dx/2, y + dy/2, colours.twistingTorque);
                p.pop();
            }
        }
        
        // Section title
        p.fill(colours.text);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.text('Cross-section', 0, - outerRadius - 30);
        
        p.pop();
        
        // === RIGHT: Cross-section with 35° diameter and shear distribution along it ===
        p.push();
        p.translate(distCenterX, beamCenterY);
        
        // Draw cross-section outline
        p.noFill();
        p.stroke(180);
        p.strokeWeight(2);
        p.ellipse(0, 0, 2 * outerRadius, 2 * outerRadius);
        if (sectionType === 'hollow') {
            p.ellipse(0, 0, 2 * innerRadius, 2 * innerRadius);
        }
        
        // Draw 0° diameter line (for reference to right panel)
        p.stroke(120);
        p.strokeWeight(1);
        drawDashedLine(p, -outerRadius, 0, outerRadius, 0, 4, colours.dashed);

        // Draw 35° diameter line
        const cos35 = p.cos(p.radians(-35));
        const sin35 = p.sin(p.radians(-35));
        p.stroke(colours.axis);
        p.strokeWeight(2);
        p.line(
            -outerRadius * cos35,
            -outerRadius * sin35,
            outerRadius * cos35,
            outerRadius * sin35
        );
        
        // Draw shear stress arrows along the 35° diameter
        const numArrows = 20;
        const arrowPositions = [];
        
        for (let i = -numArrows/2; i <= numArrows/2; i++) {
            const r_frac = (i / (numArrows/2)); // -1 to 1
            const r_mm = Math.abs(r_frac) * outerRadius;
            
            // Skip hollow interior
            if (sectionType === 'hollow' && r_mm < innerRadius) continue;
            
            const x = r_frac * outerRadius * cos35;
            const y = r_frac * outerRadius * sin35;
            
            const tau_r = Math.abs(T_Nm * (r_mm/1000)) / J; // Pa
            const tau_r_MPa = tau_r / 1e6;
            
            // Perpendicular to diameter (for shear arrows)
            // Arrow points perpendicular to the 35° line
            const perpAngle = p.radians(-35) + p.HALF_PI;
            
            // Arrow length proportional to stress at this radius
            const arrowLength = tau_r_MPa*20
            
            const dx = arrowLength * p.cos(perpAngle) * Math.sign(T) * Math.sign(r_frac);
            const dy = arrowLength * p.sin(perpAngle) * Math.sign(T) * Math.sign(r_frac);
            
            if (arrowLength > 10) {
                p.push();
                p.stroke(colours.twistingTorque);
                p.strokeWeight(1.5);
                drawArrow(p, x, y, x + dx, y + dy, colours.twistingTorque);
                p.pop();
                
                // Store arrow tip position for connecting line
                arrowPositions.push({x: x + dx, y: y + dy});
            }
        }
        
        // Connect arrow tips with orange line (shows linear distribution)
        if (arrowPositions.length > 1) {
            p.push();
            p.stroke(colours.twistingTorque);
            p.strokeWeight(2);
            p.noFill();
            p.beginShape();
            for (let pos of arrowPositions) {
                p.vertex(pos.x, pos.y);
            }
            p.endShape();
            p.pop();
        }
        
        // Labels
        p.fill(colours.text);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.text('τ along 35° diameter', 0, -outerRadius - 30);
        
        p.pop();
        
        // === BOTTOM: Zoomed infinitesimal element ===
        p.push();
        p.translate(400, 320);
        
        const blockSize = 60;
        
        // Draw element
        p.fill(255);
        p.stroke(0);
        p.strokeWeight(2);
        p.rect(-blockSize/2, -blockSize/2, blockSize, blockSize);
        
        // Calculate stress at chosen radius
        let r_elem = elementR * outerRadius;
        let inVoid = false;
        if (sectionType === 'hollow' && r_elem < innerRadius) {
            // inside hollow region → no material → no stress
            inVoid = true;
            r_elem = 0;
        }
        const tau_elem = Math.abs(T_Nm * (r_elem/1000)) / (J || 1); // Pa safeguard J>0
        const tau_elem_MPa = tau_elem / 1e6;
        
        // Arrow length proportional to stress
        const arrowLen = p.map(Math.abs(tau_elem_MPa), 0, 50, 0, 100);
        
        if (T !== 0 && !inVoid) {
            // Four complementary shear arrows (orange like in other sketches)
            const sign = Math.sign(T);
            
            // Top face - rightward for positive T
            drawMidpointArrow(p, 0, -blockSize/2 - 10, sign, 0, arrowLen, 
                sign > 0 ? 'positive' : 'negative', colours.twistingTorque);
            
            // Bottom face - leftward for positive T
            drawMidpointArrow(p, 0, blockSize/2 + 10, -sign, 0, arrowLen, 
                sign > 0 ? 'positive' : 'negative', colours.twistingTorque);
            
            // Right face - downward for positive T
            drawMidpointArrow(p, blockSize/2 + 10, 0, 0, sign, arrowLen, 
                sign < 0 ? 'positive' : 'negative', colours.twistingTorque);
            
            // Left face - upward for positive T
            drawMidpointArrow(p, -blockSize/2 - 10, 0, 0, -sign, arrowLen, 
                sign < 0 ? 'positive' : 'negative', colours.twistingTorque);
        }
        
        // Labels
        p.fill(colours.text);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.text('Infinitesimal', 0, blockSize/2 + 25);
        p.text(`τ = ${tau_elem_MPa.toFixed(2)} MPa`, 0, blockSize/2 + 55);
        
        p.pop();
        
        // Display calculations
        p.fill(colours.text);
        p.noStroke();
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(12);
        p.text(`Section: ${sectionType}`, 20, 300);
        if (sectionType === 'solid') {
            p.text(`D = ${D.toFixed(0)} mm`, 20, 320);
            p.text(`J = ${(J * 1e12).toFixed(2)} × 10⁻¹² m⁴`, 20, 340);
        } else {
            p.text(`Do = ${Do.toFixed(0)} mm, Di = ${Di.toFixed(0)} mm`, 20, 320);
            p.text(`J = ${(J * 1e12).toFixed(2)} × 10⁻¹² m⁴`, 20, 340);
        }
        p.text(`τ_max = ${tau_max_MPa.toFixed(2)} MPa`, 20, 360);
    };
    
    p.windowResized = function() {
        p.resizeCanvas(800, 400);
    };
}

// Initialize all sketches when the page loads
window.addEventListener('load', function() {
    // Create p5 instances for each simulation
    axialSketch = new p5(createAxialSketch);
    shearSketch = new p5(createShearSketch);
    bendingSketch = new p5(createBendingSketch);
    torsionSketch = new p5(createTorsionSketch);
});