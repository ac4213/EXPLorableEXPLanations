// Mass object constructor
function Mass(x, y, wdth, hght) {
    this.x = x;
    this.y = y;
    this.wdth = wdth;
    this.hght = hght;
    this.baseY = y; // Remember the base position
    
    // Move the mass based on the calculated displacement
    this.move = function(y, reset) {
        if (reset) {
            this.y = this.baseY;
            this.display();
        } else {
            // Apply a scaling factor for better visualization but allow unrestricted motion
            const scaleFactor = 500; // Larger scaling factor for more visible motion
            let normalizedY = y * scaleFactor;
            
            // No limits on displacement - allow mass to move out of view if needed
            this.y = this.baseY - normalizedY;
            this.display();
        }
    };
    
    // Display the mass and connecting elements
    this.display = function() {
        push();
        
        // Find the spring connection points - center of mass to ground
        const springX = this.x;
        const springLength = this.y - 30; // Distance from mass center to ground
        
        // Draw ground (thick line)
        stroke(0);
        strokeWeight(3);
        line(20, height - 30, width - 20, height - 30);
        
        // Draw spring from mass to ground
        this.drawSpring(springX - 20, this.y, springX - 20, height - 30);
        
        // Draw damper from mass to ground
        if (mypars.c > 0) {
            this.drawDamper(springX + 20, this.y, springX + 20, height - 30);
        }
        
        // Draw the mass (rectangle)
        rectMode(CENTER);
        stroke(0);
        strokeWeight(1);
        fill(100, 100, 200);
        rect(this.x, this.y, this.wdth, this.hght, 5); // Rounded corners
        
        // Add mass label
        fill(0);
        textAlign(CENTER, CENTER);
        text("m", this.x, this.y);
        
        pop();
    };
    
    // Draw a spring between two points
    this.drawSpring = function(x1, y1, x2, y2) {
        push();
        stroke(0);
        strokeWeight(2);
        
        // For a vertical spring, ensure x1 = x2
        // This forces the spring to be perfectly vertical
        x2 = x1;
        
        // Calculate spring geometry
        const totalLength = y2 - y1; // Total vertical distance
        const stemLength = totalLength * 0.2; // Length of each straight stem (20% of total length)
        const coilLength = totalLength - (2 * stemLength); // Length of coiled section (60% of total)
        const coilSegments = 8; // Number of coil segments
        const coilSegmentLength = coilLength / coilSegments;
        const coilWidth = 10; // Width of coil
        
        // Start point (at mass)
        let x = x1;
        let y = y1;
        
        // Draw straight stem from mass
        line(x, y, x, y + stemLength);
        y += stemLength;
        
        // Draw coils - start at center
        let coilDirection = 1;
        for (let i = 0; i < coilSegments; i++) {
            // Calculate coil point
            const coilX = x + coilWidth * coilDirection;
            const coilY = y + coilSegmentLength;
            
            // Draw line to next coil point
            line(x, y, coilX, coilY);
            
            // Update position
            x = coilX;
            y = coilY;
            
            // Reverse coil direction
            coilDirection *= -1;
        }
        
        // Return to center line
        line(x, y, x1, y);
        x = x1;
        
        // Draw straight stem to ground
        line(x, y, x, y2);
        
        pop();
    };
    
    // Draw a damper between two points
    this.drawDamper = function(x1, y1, x2, y2) {
        push();
        stroke(0);
        strokeWeight(2);
        
        // Calculate damper geometry
        const totalLength = dist(x1, y1, x2, y2);
        const cylinderLength = totalLength * 0.4; // Length of cylinder
        const cylinderWidth = 12; // Width of cylinder
        
        // Calculate unit vector from p1 to p2
        const dx = (x2 - x1) / totalLength;
        const dy = (y2 - y1) / totalLength;
        
        // Calculate perpendicular unit vector
        const px = -dy;
        const py = dx;
        
        // Calculate points along the damper
        const pistionRodTop = x1;
        const pistionRodTopY = y1;
        
        const cylinderTop = x1 + dx * totalLength * 0.3;
        const cylinderTopY = y1 + dy * totalLength * 0.3;
        
        const cylinderBottom = cylinderTop + dx * cylinderLength;
        const cylinderBottomY = cylinderTopY + dy * cylinderLength;
        
        // Draw piston rod (top part)
        line(pistionRodTop, pistionRodTopY, cylinderTop, cylinderTopY);
        
        // Draw cylinder top
        line(cylinderTop + px * cylinderWidth/2, cylinderTopY + py * cylinderWidth/2,
             cylinderTop - px * cylinderWidth/2, cylinderTopY - py * cylinderWidth/2);
        
        // Draw cylinder sides
        line(cylinderTop + px * cylinderWidth/2, cylinderTopY + py * cylinderWidth/2, 
             cylinderBottom + px * cylinderWidth/2, cylinderBottomY + py * cylinderWidth/2);
        line(cylinderTop - px * cylinderWidth/2, cylinderTopY - py * cylinderWidth/2,
             cylinderBottom - px * cylinderWidth/2, cylinderBottomY - py * cylinderWidth/2);
        
        // Draw cylinder bottom
        line(cylinderBottom + px * cylinderWidth/2, cylinderBottomY + py * cylinderWidth/2,
             cylinderBottom - px * cylinderWidth/2, cylinderBottomY - py * cylinderWidth/2);
        
        // Draw piston rod (bottom part)
        line(cylinderBottom, cylinderBottomY, x2, y2);
        
        pop();
    };
}

// Function to draw static elements on the canvas
function drawStaticElements() {
    push();
    fill(0);
    textSize(16);
    textAlign(CENTER);
    text("SDOF System", width/2, 30);
    
    // Draw system type
    textSize(12);
    let systemTypeColor;
    if (UNDERDAMPED) {
        systemTypeColor = color(0, 0, 255); // Blue for underdamped
    } else if (!UNDERDAMPED && !OVERDAMPED) {
        systemTypeColor = color(0, 128, 0); // Green for critically damped
    } else {
        systemTypeColor = color(255, 0, 0); // Red for overdamped
    }
    
    fill(systemTypeColor);
    text(document.getElementById('system-type').textContent, width/2, 50);
    
    pop();
}// Global variables
var cnv, cnvx, cnvy; // Canvas variables
var bgdRGB = [245, 245, 245]; // Light gray background color
var themass; // The mass object in the simulation
var mypars; // Mass and simulation parameters
var results; // Calculation results
var counter = 0; // Animation counter
var yMass = 250; // Initial mass position (centered vertically)
var UNDERDAMPED = false; 
var OVERDAMPED = false; // System state flags
var TIMEHISTORY, FRFAMP, FRFPHASE; // Chart containers
var forcingEnabled = false; // Toggle for forcing

// Setup function - initializes the simulation
function setup() {
    // Create canvas and position it in the designated container
    cnv = createCanvas(200, 500);
    cnv.parent('sketch-holder');
    cnvx = cnv.position().x;
    cnvy = cnv.position().y;
    background(bgdRGB[0], bgdRGB[1], bgdRGB[2]);
    
    // Initialize chart containers
    TIMEHISTORY = document.getElementById('TimeHistory');
    FRFAMP = document.getElementById('FRFamp');
    FRFPHASE = document.getElementById('FRFphase');
    
    // Connect UI controls to the simulation
    connectUIControls();
    
    // Initialize parameters based on slider values
    mypars = {
        m: parseFloat(document.getElementById('mass-slider').value),
        k: parseFloat(document.getElementById('stiffness-slider').value),
        c: parseFloat(document.getElementById('damping-slider').value),
        F0: forcingEnabled ? 1 : 0, // Default forcing amplitude when enabled
        ff: parseFloat(document.getElementById('frequency-slider').value),
        Ttot: 2 // Total simulation time
    };
    
    // Initialize the mass object and position it
    themass = new Mass(0.5 * width, yMass, 80, 40); // Smaller mass for better visibility
    themass.display();
    
    // Calculate initial results
    results = calculateSystem();
    
    // Update system info display
    updateSystemInfo();
    
    // Set up the animation
    var fps = 60;
    frameRate(fps);
    angleMode(DEGREES);
}

// Draw function - called repeatedly to animate the simulation
function draw() {
    // Reset the counter if we've reached the end of the results
    if (counter === results.Y.length - 1) {
        counter = 0;
        results = calculateSystem();
        themass.move(0, true); // Reset the mass position
    }
    
    // Clear the background and redraw
    background(bgdRGB[0], bgdRGB[1], bgdRGB[2]);
    
    // Draw static elements (ground line)
    drawStaticElements();
    
    // Move the mass to the next position
    themass.move(results.Y[counter], false);
    
    // Increment the counter
    counter++;
}

// Function to connect UI controls to the simulation
function connectUIControls() {
    // Get slider elements
    const massSlider = document.getElementById('mass-slider');
    const stiffnessSlider = document.getElementById('stiffness-slider');
    const dampingSlider = document.getElementById('damping-slider');
    const freqSlider = document.getElementById('frequency-slider');
    const forcingToggle = document.getElementById('forcing-toggle');
    
    // Add event listeners to update the simulation when sliders change
    massSlider.addEventListener('input', updateParameters);
    stiffnessSlider.addEventListener('input', updateParameters);
    dampingSlider.addEventListener('input', updateParameters);
    freqSlider.addEventListener('input', updateParameters);
    
    // Add event listener for forcing toggle
    if (forcingToggle) {
        forcingToggle.addEventListener('change', function() {
            forcingEnabled = this.checked;
            updateParameters();
        });
    }
    
    // Add special handling for damping slider to visualize critical damping
    if (dampingSlider) {
        dampingSlider.addEventListener('input', function() {
            const mass = parseFloat(massSlider.value);
            const stiffness = parseFloat(stiffnessSlider.value);
            const damping = parseFloat(this.value);
            
            // Calculate critical damping
            const criticalDamping = 2 * Math.sqrt(stiffness * mass);
            
            // Update critical damping marker if it exists
            const criticalMarker = document.getElementById('critical-damping-marker');
            if (criticalMarker) {
                // Calculate position as percentage of slider range
                const percentage = ((criticalDamping - this.min) / (this.max - this.min)) * 100;
                criticalMarker.style.left = `${percentage}%`;
            }
            
            // Update damping ratio display
            const dampingRatio = damping / criticalDamping;
            if (dampingRatio < 0.98) {
                this.className = "underdamped";
            } else if (dampingRatio > 0.98 && dampingRatio < 1.02) {
                this.className = "critical";
            } else {
                this.className = "overdamped";
            }
            
            updateParameters();
        });
        
        // Trigger once to setup initial state
        dampingSlider.dispatchEvent(new Event('input'));
    }
}

// Function to update parameters when sliders or toggle changes
function updateParameters() {
    // Update the parameters
    mypars = {
        m: parseFloat(document.getElementById('mass-slider').value),
        k: parseFloat(document.getElementById('stiffness-slider').value),
        c: parseFloat(document.getElementById('damping-slider').value),
        F0: forcingEnabled ? 5000 : 0, // Fixed forcing amplitude when enabled
        ff: parseFloat(document.getElementById('frequency-slider').value),
        Ttot: mypars.Ttot
    };
    
    // Recalculate the system with new parameters
    results = calculateSystem();
    counter = 0;
    
    // Update system info display
    updateSystemInfo();
}

// Function to update system information based on parameters
function updateSystemInfo() {
    const mass = parseFloat(document.getElementById('mass-slider').value);
    const stiffness = parseFloat(document.getElementById('stiffness-slider').value);
    const damping = parseFloat(document.getElementById('damping-slider').value);
    
    // Calculate natural frequency
    const omegaN = Math.sqrt(stiffness / mass);
    const fn = omegaN / (2 * Math.PI);
    
    // Calculate critical damping
    const criticalDamping = 2 * Math.sqrt(stiffness * mass);
    
    // Calculate damping ratio
    const dampingRatio = damping / criticalDamping;
    
    // Calculate damped natural frequency
    const omegaD = omegaN * Math.sqrt(1 - Math.min(1, Math.pow(dampingRatio, 2)));
    const fd = omegaD / (2 * Math.PI);
    
    // Determine system type
    let systemType = "Undamped";
    if (damping > 0) {
        if (dampingRatio < 0.98) {
            systemType = "Underdamped";
        } else if (dampingRatio > 0.98 && dampingRatio < 1.02) {
            systemType = "Critically Damped";
        } else {
            systemType = "Overdamped";
        }
    }
    
    // Update the display
    document.getElementById('natural-freq').textContent = fn.toFixed(2);
    document.getElementById('damped-freq').textContent = fd.toFixed(2);
    document.getElementById('damping-ratio').textContent = dampingRatio.toFixed(3);
    document.getElementById('critical-damping').textContent = criticalDamping.toFixed(2);
    document.getElementById('system-type').textContent = systemType;
    
    // Update frequency slider max value based on natural frequency
    // Set max to 3 times the natural frequency for better visualization
    document.getElementById('frequency-slider').max = Math.max(20, Math.ceil(fn * 3));
}

// Main calculation function for the SDOF system
function calculateSystem() {
    // Get current parameters
    const m = mypars.m;
    const k = mypars.k;
    const c = mypars.c;
    const F0 = mypars.F0;
    const ff = mypars.ff;
    const Ttot = mypars.Ttot;
    
    // Calculate critical damping and damping ratio
    const ccrit = 2 * Math.sqrt(k * m);
    const zeta = c / ccrit;
    
    // Determine system type
    UNDERDAMPED = (zeta < 0.98);
    var CRITICALLY_DAMPED = (zeta >= 0.98 && zeta <= 1.02);
    OVERDAMPED = (zeta > 1.02);
    
    // Calculate frequencies
    const wn = Math.sqrt(k / m);        // Natural frequency (rad/s)
    const fn = wn / (2 * Math.PI);      // Natural frequency (Hz)
    const wd = wn * Math.sqrt(Math.max(0, 1 - Math.pow(zeta, 2))); // Damped natural frequency (rad/s)
    const fd = wd / (2 * Math.PI);      // Damped natural frequency (Hz)
    
    // Calculate period and determine simulation parameters
    const T = UNDERDAMPED ? 1 / fd : 4 / fn; // Period (use longer period for non-underdamped)
    const Ncycles = Math.max(2, Math.round(Ttot / T)); // Number of cycles in simulation
    const fs = 100 * (UNDERDAMPED ? fd : fn); // Sampling frequency (Hz)
    const dt = 1 / fs;                  // Time step (s)
    
    // Initialize simulation variables
    const A = 1;                        // Initial condition amplitude
    const B = 0;                        // Initial condition phase (for underdamped)
    const C = Math.sqrt(Math.pow(A, 2) + Math.pow(B, 2)); // Combined amplitude
    const wf = 2 * Math.PI * ff;        // Forcing frequency (rad/s)
    
    // Arrays to store simulation results
    let t = [0];                        // Time points
    let Y = [0];                        // Displacement
    let envelope = [0];                 // Envelope of response
    let perY = [0];                     // First period of response
    
    // Simulation variables
    let ii = 0;
    let tt = 0;
    let YYn = 0;
    let ee = 0;
    const wn2 = Math.pow(wn, 2);
    const wf2 = Math.pow(wf, 2);
    
    // Calculate response based on system type
    if (UNDERDAMPED) {
        // Underdamped system response
        while (t[t.length - 1] < Ttot) {
            tt = ii * dt;
            
            // Transient (homogeneous) response
            YYn = A * Math.exp(-zeta * wn * tt) * Math.cos(wd * tt) + 
                 B * Math.exp(-zeta * wn * tt) * Math.sin(wd * tt);
            
            // Envelope
            ee = C * Math.exp(-zeta * wn * tt);
            
            // Steady-state (particular) response for forced vibration
            let YYp = 0;
            if (F0 > 0) {
                const aa = F0 * (m * (wn2 - wf2)) / (Math.pow(m, 2) * Math.pow((wn2 - wf2), 2) + wn2 * Math.pow(c, 2));
                const bb = F0 * (c * wf) / (Math.pow(m, 2) * Math.pow((wn2 - wf2), 2) + wn2 * Math.pow(c, 2));
                YYp = aa * Math.cos(wf * tt) + bb * Math.sin(wf * tt);
            }
            
            // Total response
            t.push(tt);
            Y.push(YYn + YYp);
            envelope.push(ee);
            
            // Store first period for visualization
            if (t[t.length - 1] <= T) {
                perY.push(YYn);
            }
            
            ii++;
        }
    } else if (OVERDAMPED) {
        // Overdamped system response
        const r1 = (-c + Math.sqrt(Math.pow(c, 2) - 4 * m * k)) / (2 * m);
        const r2 = (-c - Math.sqrt(Math.pow(c, 2) - 4 * m * k)) / (2 * m);
        
        // Constants for overdamped solution with initial condition x(0) = A, x'(0) = 0
        const C1 = (A * r2) / (r2 - r1);
        const C2 = (A * r1) / (r1 - r2);
        
        while (t[t.length - 1] < Ttot) {
            tt = ii * dt;
            
            // Transient response for overdamped system
            YYn = C1 * Math.exp(r1 * tt) + C2 * Math.exp(r2 * tt);
            
            // Steady-state response for forced vibration
            let YYp = 0;
            if (F0 > 0) {
                const amp = F0 / k / Math.sqrt(Math.pow(1 - Math.pow(wf/wn, 2), 2) + Math.pow(2 * zeta * wf/wn, 2));
                const phase = Math.atan2(2 * zeta * wf/wn, 1 - Math.pow(wf/wn, 2));
                YYp = amp * Math.cos(wf * tt - phase);
            }
            
            t.push(tt);
            Y.push(YYn + YYp);
            
            ii++;
        }
    } else {
        // Critically damped system response
        const r = -c / (2 * m); // Equal roots for characteristic equation
        
        while (t[t.length - 1] < Ttot) {
            tt = ii * dt;
            
            // Transient response for critically damped with initial displacement A and zero velocity
            YYn = A * Math.exp(r * tt) * (1 - r * tt);
            
            // Steady-state response for forced vibration
            let YYp = 0;
            if (F0 > 0) {
                const amp = F0 / k / Math.sqrt(Math.pow(1 - Math.pow(wf/wn, 2), 2) + Math.pow(2 * zeta * wf/wn, 2));
                const phase = Math.atan2(2 * zeta * wf/wn, 1 - Math.pow(wf/wn, 2));
                YYp = amp * Math.cos(wf * tt - phase);
            }
            
            t.push(tt);
            Y.push(YYn + YYp);
            
            ii++;
        }
    }
    
    // Remove initial zero values
    t.splice(0, 1);
    Y.splice(0, 1);
    if (envelope.length > 1) envelope.splice(0, 1);
    if (perY.length > 1) perY.splice(0, 1);
    
    // Reset counter and mass position
    counter = 0;
    themass.move(0, true);
    
    // Calculate frequency response function (FRF)
    const farr = [];
    const FRFamp = [];
    const FRFphase = [];
    const df = 0.05;
    let r, thisAMP, thisPHASE;
    
    for (ii = 0; ii < 500; ii++) {
        farr[ii] = ii * df;
        r = farr[ii] > 0 ? wn / (2 * Math.PI * farr[ii]) : 999; // Avoid division by zero
        
        // Calculate FRF amplitude in m/N
        FRFamp[ii] = 1 / k / Math.sqrt(Math.pow(1 - Math.pow(r, 2), 2) + Math.pow(2 * zeta * r, 2));
        
        // Calculate FRF phase
        FRFphase[ii] = Math.atan2((2 * zeta * r), (1 - Math.pow(r, 2))) * 180 / Math.PI - 180;
    }
    
    // Calculate current amplitude and phase at the forcing frequency
    r = ff > 0 ? wn / (2 * Math.PI * ff) : 999;
    thisAMP = 1 / k / Math.sqrt(Math.pow(1 - Math.pow(r, 2), 2) + Math.pow(2 * zeta * r, 2));
    thisPHASE = Math.atan2((2 * zeta * r), (1 - Math.pow(r, 2))) * 180 / Math.PI - 180;
    
    // Compile results
    const res = {
        ccrit: ccrit,
        zeta: zeta,
        wn: wn,
        fn: fn,
        wd: wd,
        fd: fd,
        T: T,
        Ncycles: Ncycles,
        fs: fs,
        dt: dt,
        A: A,
        B: B,
        t: t,
        Y: Y,
        perY: perY,
        env: envelope.length > 1 ? envelope : [],
        farr: farr,
        FRFamp: FRFamp,
        FRFphase: FRFphase,
        thisAMP: thisAMP,
        thisPHASE: thisPHASE
    };
    
    // Plot the time history chart
    const THdata = [
        {
            x: res.t,
            y: res.Y,
            text: "signal",
            line: {
                width: 2,
                color: "blue",
                shape: "spline"
            }
        }
    ];
    
    // Add envelope if available
    if (res.env.length > 0) {
        THdata.push({
            x: res.t,
            y: res.env,
            text: "envelope",
            line: {
                width: 1,
                color: "orange",
                shape: "spline"
            }
        });
        
        // Add negative envelope
        THdata.push({
            x: res.t,
            y: res.env.map(val => -val),
            text: "envelope",
            line: {
                width: 1,
                color: "orange",
                shape: "spline"
            }
        });
    }
    
    // Create array of tick values for time history
    const tvals = Array.from({length: Ncycles}, (_, i) => i * T);
    
    // Set chart height - taller when in free vibration
    const theheight = forcingEnabled ? 150 : 400;
    
    // Chart layout for time history
    const THlayout = {
        height: theheight,
        font: { size: 10 },
        showlegend: false,
        title: 'Time Response',
        xaxis: {
            title: 'Time [s]',
            range: [0, Ttot],
            tickmode: "array",
            tickvals: tvals,
            tickformat: ".2f",
            hoverformat: ".2f"
        },
        yaxis: {
            title: 'Displacement [m]',
            // No fixed range - will auto-scale to show entire plot
            hoverformat: ".3f"
        },
        margin: {
            l: 50,
            t: 30,
            r: 10,
            b: 40,
            pad: 0
        }
    };
    
    // Plot options
    const plotopts = {
        showLink: false,
        displayModeBar: false
    };
    
    // Create time history plot
    Plotly.newPlot(TIMEHISTORY, THdata, THlayout, plotopts);
    
    // If forcing is enabled, create FRF plots
    if (forcingEnabled) {
        // Amplitude FRF data
        const FRFAMPdata = [
            {
                x: res.farr,
                y: res.FRFamp,
                line: {
                    width: 2,
                    color: "blue"
                }
            },
            {
                x: [ff],
                y: [res.thisAMP],
                mode: 'markers',
                marker: {
                    size: 10,
                    color: "red"
                }
            }
        ];
        
        // Amplitude FRF layout
        const FRFAMPlayout = {
            height: 200,
            font: { size: 10 },
            showlegend: false,
            title: 'Frequency Response Function - Amplitude',
            xaxis: {
                title: 'Frequency [Hz]',
                range: [0, 20], // Fixed x-axis range
                tickformat: ".2f",
                hoverformat: ".2f"
            },
            yaxis: {
                title: 'Amplitude [m/N]',
                // No fixed range - will auto-scale to show entire plot
                tickformat: ".3e",
                hoverformat: ".3e"
            },
            margin: {
                l: 50,
                t: 30,
                r: 10,
                b: 40,
                pad: 0
            }
        };
        
        // Phase FRF data
        const FRFPHASEdata = [
            {
                x: res.farr,
                y: res.FRFphase,
                line: {
                    width: 2,
                    color: "blue"
                }
            },
            {
                x: [ff],
                y: [res.thisPHASE],
                mode: 'markers',
                marker: {
                    size: 10,
                    color: "red"
                }
            }
        ];
        
        // Phase FRF layout
        const FRFPHASElayout = {
            height: 150,
            font: { size: 10 },
            showlegend: false,
            title: 'Frequency Response Function - Phase',
            xaxis: {
                title: 'Frequency [Hz]',
                range: [0, 20], // Fixed x-axis range
                tickformat: ".2f",
                hoverformat: ".2f"
            },
            yaxis: {
                title: 'Phase [deg]',
                // No fixed range - will auto-scale to show entire plot
                tickmode: "array",
                tickvals: [0, -45, -90, -135, -180],
                tickformat: "f",
                hoverformat: ".2f"
            },
            margin: {
                l: 50,
                t: 30,
                r: 10,
                b: 40,
                pad: 0
            }
        };
        
        // Create FRF plots
        Plotly.newPlot(FRFAMP, FRFAMPdata, FRFAMPlayout, plotopts);
        Plotly.newPlot(FRFPHASE, FRFPHASEdata, FRFPHASElayout, plotopts);
    } else {
        // If no forcing, clear the FRF plots
        Plotly.purge(FRFAMP);
        Plotly.purge(FRFPHASE);
    }
    
    return res;
}