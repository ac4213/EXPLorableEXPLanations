// S-N Curve Module

// Initialize S-N Curve plot
function initSNCurvePlot() {
    const fatigueStrength = parseFloat(document.getElementById('fatigue-strength').value);
    const fatigueExponent = parseFloat(document.getElementById('fatigue-exponent').value);
    
    // Generate data for S-N curve
    const data = generateSNCurveData(fatigueStrength, fatigueExponent);
    
    // Create initial plot
    snCurvePlot = Plotly.newPlot('sn-curve-plot', [{
        x: data.cycles,
        y: data.stressAmplitude,
        type: 'scatter',
        mode: 'lines',
        line: {
            color: 'blue',
            width: 2
        },
        name: 'S-N Curve'
    }], {
        title: 'S-N Curve',
        xaxis: {
            title: 'Number of Cycles (N)',
            type: 'log',
            range: [2, 8],  // 10^2 to 10^8 cycles
            tickvals: [2, 3, 4, 5, 6, 7, 8],
            ticktext: ['10²', '10³', '10⁴', '10⁵', '10⁶', '10⁷', '10⁸']
        },
        yaxis: {
            title: 'Stress Amplitude (MPa)',
            range: [0, Math.max(fatigueStrength, 800)]
        },
        margin: {
            l: 60,
            r: 40,
            t: 50,
            b: 80
        }
    }, {
        responsive: true
    });
    
    updateEnduranceLimits(fatigueStrength, fatigueExponent);
}

// Update S-N Curve plot with new parameters
function updateSNCurvePlot() {
    const fatigueStrength = parseFloat(document.getElementById('fatigue-strength').value);
    const fatigueExponent = parseFloat(document.getElementById('fatigue-exponent').value);
    
    // Generate data for updated S-N curve
    const data = generateSNCurveData(fatigueStrength, fatigueExponent);
    
    // Update plot data
    Plotly.update('sn-curve-plot', {
        x: [data.cycles],
        y: [data.stressAmplitude]
    }, {
        yaxis: {
            range: [0, Math.max(fatigueStrength, 800)]
        }
    });
    
    updateEnduranceLimits(fatigueStrength, fatigueExponent);
}

// Generate data for the S-N Curve plot
function generateSNCurveData(fatigueStrength, fatigueExponent) {
    const cycles = [];
    const stressAmplitude = [];
    
    // Generate data points for S-N curve
    for (let logN = 2; logN <= 8; logN += 0.1) {
        const N = Math.pow(10, logN);
        cycles.push(logN);
        
        // Basquin's equation
        const stress = fatigueStrength * Math.pow(2 * N, fatigueExponent);
        stressAmplitude.push(stress);
    }
    
    return {
        cycles: cycles,
        stressAmplitude: stressAmplitude
    };
}

// Update displayed endurance limits based on parameters
function updateEnduranceLimits(fatigueStrength, fatigueExponent) {
    // Calculate endurance limits at 10^6 and 10^7 cycles
    const enduranceLimit1e6 = fatigueStrength * Math.pow(2 * 1e6, fatigueExponent);
    const enduranceLimit1e7 = fatigueStrength * Math.pow(2 * 1e7, fatigueExponent);
    
    document.getElementById('endurance-limit').textContent = enduranceLimit1e6.toFixed(0);
    document.getElementById('long-endurance-limit').textContent = enduranceLimit1e7.toFixed(0);
    
    document.getElementById('fatigue-strength-value').textContent = fatigueStrength;
    document.getElementById('fatigue-exponent-value').textContent = fatigueExponent;
}

// Set up event listeners for the S-N curve controls
function setupSNCurveControls() {
    // Set up event listeners for the sliders
    document.getElementById('fatigue-strength').addEventListener('input', function() {
        updateSNCurvePlot();
    });
    
    document.getElementById('fatigue-exponent').addEventListener('input', function() {
        updateSNCurvePlot();
    });
    
    // Set up material preset buttons
    document.getElementById('steel-1045').addEventListener('click', function() {
        const material = materials['steel-1045'];
        document.getElementById('fatigue-strength').value = material.sigmaF;
        document.getElementById('fatigue-exponent').value = material.b;
        updateSNCurvePlot();
    });
    
    document.getElementById('aluminum-7075').addEventListener('click', function() {
        const material = materials['aluminum-7075'];
        document.getElementById('fatigue-strength').value = material.sigmaF;
        document.getElementById('fatigue-exponent').value = material.b;
        updateSNCurvePlot();
    });
    
    document.getElementById('titanium-alloy').addEventListener('click', function() {
        const material = materials['titanium-alloy'];
        document.getElementById('fatigue-strength').value = material.sigmaF;
        document.getElementById('fatigue-exponent').value = material.b;
        updateSNCurvePlot();
    });
    
    document.getElementById('cast-iron').addEventListener('click', function() {
        const material = materials['cast-iron'];
        document.getElementById('fatigue-strength').value = material.sigmaF;
        document.getElementById('fatigue-exponent').value = material.b;
        updateSNCurvePlot();
    });
}