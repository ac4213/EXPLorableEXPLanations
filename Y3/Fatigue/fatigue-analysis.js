// fatigue-analysis.js - Complete refactored fatigue analysis module
// Author: Dr. Arnaldo Delli Carri
// Uses p5.js in instance mode for any canvas-based visualisations

// Material property database (expanded)
const materials = {
    'steel-1045': {
        name: 'Steel 1045 (Normalised)',
        sigmaF: 1120,  // Fatigue strength coefficient (MPa)
        b: -0.092,     // Fatigue strength exponent
        Su: 800,       // Ultimate tensile strength (MPa)
        Sy: 600        // Yield strength (MPa)
    },
    'steel-4340': {
        name: 'Steel 4340 (Tempered)',
        sigmaF: 1450,
        b: -0.085,
        Su: 1100,
        Sy: 950
    },
    'steel-316': {
        name: 'Stainless Steel 316',
        sigmaF: 950,
        b: -0.095,
        Su: 580,
        Sy: 290
    },
    'aluminum-2024': {
        name: 'Aluminium 2024-T3',
        sigmaF: 900,
        b: -0.102,
        Su: 485,
        Sy: 345
    },
    'aluminum-6061': {
        name: 'Aluminium 6061-T6',
        sigmaF: 750,
        b: -0.106,
        Su: 310,
        Sy: 275
    },
    'aluminum-7075': {
        name: 'Aluminium 7075-T6',
        sigmaF: 850,
        b: -0.11,
        Su: 550,
        Sy: 500
    },
    'titanium-6al4v': {
        name: 'Titanium Ti-6Al-4V',
        sigmaF: 1400,
        b: -0.085,
        Su: 1200,
        Sy: 1050
    },
    'titanium-pure': {
        name: 'Titanium (Pure)',
        sigmaF: 1100,
        b: -0.090,
        Su: 650,
        Sy: 550
    },
    'cast-iron-grey': {
        name: 'Grey Cast Iron',
        sigmaF: 720,
        b: -0.108,
        Su: 350,
        Sy: 280
    },
    'cast-iron-ductile': {
        name: 'Ductile Cast Iron',
        sigmaF: 850,
        b: -0.100,
        Su: 550,
        Sy: 380
    },
    'magnesium-az31': {
        name: 'Magnesium AZ31',
        sigmaF: 520,
        b: -0.125,
        Su: 290,
        Sy: 200
    },
    'copper-c11000': {
        name: 'Copper C11000',
        sigmaF: 480,
        b: -0.115,
        Su: 220,
        Sy: 70
    },
    'brass-360': {
        name: 'Brass 360',
        sigmaF: 550,
        b: -0.112,
        Su: 380,
        Sy: 150
    },
    'nickel-200': {
        name: 'Nickel 200',
        sigmaF: 680,
        b: -0.098,
        Su: 450,
        Sy: 240
    },
    'inconel-718': {
        name: 'Inconel 718',
        sigmaF: 1600,
        b: -0.082,
        Su: 1350,
        Sy: 1150
    }
};

// Global plot references
let stressTimePlot = null;
let snCurvePlot = null;
let haighDiagramPlot = null;
let damagePlot = null;

// S-N curve held materials state
let heldMaterials = [];
const materialColors = ['#1c01b8', '#ff0000', '#006e12', '#ff6600', '#9933ff', '#00cccc', '#cc9900', '#ff1493'];

// Initialise when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add a small delay to ensure all elements are rendered
    setTimeout(() => {
        try {
            initStressTimePlot();
            initSNCurvePlot();
            initHaighDiagram();
            initDamagePlot();
            
            setupStressTimeControls();
            setupSNCurveControls();
            setupHaighDiagramControls();
            setupDamageControls();
            
            // Setup quiz functionality
            setupQuiz();
            
            // Setup solution toggles
            setupSolutionToggles();
            
            console.log('All plots initialised successfully');
        } catch (error) {
            console.error('Error initialising plots:', error);
        }
    }, 100);
});

// ===== STRESS-TIME HISTORY MODULE =====
function initStressTimePlot() {
    const maxStress = parseFloat(document.getElementById('max-stress').value);
    const minStress = parseFloat(document.getElementById('min-stress').value);
    const frequency = parseFloat(document.getElementById('frequency').value);

    const data = generateStressTimeData(maxStress, minStress, frequency);
    const amplitude = (maxStress - minStress) / 2;
    const meanStress = (maxStress + minStress) / 2;
    const stressRatio = maxStress !== 0 ? minStress / maxStress : 0;

    Plotly.newPlot('stress-time-plot', [{
        x: data.time,
        y: data.stress,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#1c01b8', width: 2 },
        name: 'Stress'
    }, {
        x: [0, 10],
        y: [data.meanStress, data.meanStress],
        type: 'scatter',
        mode: 'lines',
        line: { color: '#cc9900', width: 2, dash: 'dash' },
        name: 'Mean'
    }], {
        xaxis: {
            title: 't (s)',
            range: [0, 10],
            dtick: 1
        },
        yaxis: {
            title: 'σ (MPa)',
            range: [Math.min(minStress, -50) - 50, Math.max(maxStress, 50) + 50]
        },
        paper_bgcolor: '#fffbeb',
        plot_bgcolor: 'white',
        margin: { l: 60, r: 40, t: 0, b: 150 },
        legend: {
            orientation: 'h',
            x: 0.5,
            xanchor: 'center',
            y: 1.15,
            yanchor: 'top'
        },
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 0.5,
            y: -0.50,
            xanchor: 'center',
            yanchor: 'top',
            text: `<b>Calculated Parameters:</b><br>σₐ = ${amplitude.toFixed(1)} MPa  |  σₘ = ${meanStress.toFixed(1)} MPa  |  R = ${isFinite(stressRatio) ? stressRatio.toFixed(2) : "∞"}`,
            showarrow: false,
            font: { size: 11, color: '#b38600' },
            bgcolor: '#fff3cd',
            bordercolor: '#ffc107',
            borderwidth: 2,
            borderpad: 6,
            width: 280
        }]
    }, {
        responsive: true,
        displayModeBar: false
    });
}

function updateStressTimePlot() {
    const maxStress = parseFloat(document.getElementById('max-stress').value);
    const minStress = parseFloat(document.getElementById('min-stress').value);
    const frequency = parseFloat(document.getElementById('frequency').value);

    const data = generateStressTimeData(maxStress, minStress, frequency);
    const amplitude = (maxStress - minStress) / 2;
    const meanStress = (maxStress + minStress) / 2;
    const stressRatio = maxStress !== 0 ? minStress / maxStress : 0;

    // Use Plotly.react instead of update to properly refresh the plot
    Plotly.react('stress-time-plot', [{
        x: data.time,
        y: data.stress,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#1c01b8', width: 2 },
        name: 'Stress'
    }, {
        x: [0, 10],
        y: [data.meanStress, data.meanStress],
        type: 'scatter',
        mode: 'lines',
        line: { color: '#cc9900', width: 2, dash: 'dash' },
        name: 'Mean'
    }], {
        title: { text: 'Stress vs. Time', font: { size: 16 }},
        xaxis: {
            title: 't (s)',
            range: [0, 10],
            dtick: 1
        },
        yaxis: {
            title: 'σ (MPa)',
            range: [Math.min(minStress, -50) - 50, Math.max(maxStress, 50) + 50]
        },
        paper_bgcolor: '#fffbeb',
        plot_bgcolor: 'white',
        margin: { l: 60, r: 40, t: 0, b: 150 },
        legend: {
            orientation: 'h',
            x: 0.5,
            xanchor: 'center',
            y: 1.15,
            yanchor: 'top'
        },
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 0.5,
            y: -0.50,
            xanchor: 'center',
            yanchor: 'top',
            text: `<b>Calculated Parameters:</b><br>σₐ = ${amplitude.toFixed(1)} MPa  |  σₘ = ${meanStress.toFixed(1)} MPa  |  R = ${isFinite(stressRatio) ? stressRatio.toFixed(2) : "∞"}`,
            showarrow: false,
            font: { size: 11, color: '#b38600' },
            bgcolor: '#fff3cd',
            bordercolor: '#ffc107',
            borderwidth: 2,
            borderpad: 6,
            width: 280
        }]
    }, {
        responsive: true,
        displayModeBar: false
    });
}

function generateStressTimeData(maxStress, minStress, frequency) {
    const amplitude = (maxStress - minStress) / 2;
    const meanStress = (maxStress + minStress) / 2;
    const time = [];
    const stress = [];
    
    const timeStep = 0.02;
    const duration = 10;
    
    for (let t = 0; t <= duration; t += timeStep) {
        time.push(t);
        stress.push(meanStress + amplitude * Math.sin(2 * Math.PI * frequency * t));
    }
    
    return { time, stress, meanStress, amplitude };
}

function setupStressTimeControls() {
    document.getElementById('max-stress').addEventListener('input', function() {
        const maxStress = parseFloat(this.value);
        const minStress = parseFloat(document.getElementById('min-stress').value);
        if (minStress >= maxStress) {
            document.getElementById('min-stress').value = maxStress - 10;
            document.getElementById('min-stress-value').textContent = maxStress - 10;
        }
        document.getElementById('max-stress-value').textContent = maxStress;
        // Reset dropdown when slider is manually adjusted
        document.getElementById('loading-type-preset').value = '';
        updateStressTimePlot();
    });

    document.getElementById('min-stress').addEventListener('input', function() {
        const minStress = parseFloat(this.value);
        const maxStress = parseFloat(document.getElementById('max-stress').value);
        if (minStress >= maxStress) {
            document.getElementById('max-stress').value = minStress + 10;
            document.getElementById('max-stress-value').textContent = minStress + 10;
        }
        document.getElementById('min-stress-value').textContent = minStress;
        // Reset dropdown when slider is manually adjusted
        document.getElementById('loading-type-preset').value = '';
        updateStressTimePlot();
    });

    document.getElementById('frequency').addEventListener('input', function() {
        document.getElementById('frequency-value').textContent = this.value;
        updateStressTimePlot();
    });

    // Loading type preset dropdown
    document.getElementById('loading-type-preset').addEventListener('change', function() {
        const selectedType = this.value;

        if (selectedType === 'fully-reversed') {
            const maxStress = parseFloat(document.getElementById('max-stress').value);
            const amplitude = Math.abs(maxStress);
            document.getElementById('max-stress').value = amplitude;
            document.getElementById('min-stress').value = -amplitude;
            document.getElementById('max-stress-value').textContent = amplitude;
            document.getElementById('min-stress-value').textContent = -amplitude;
            updateStressTimePlot();
        } else if (selectedType === 'zero-to-max') {
            const maxStress = parseFloat(document.getElementById('max-stress').value);
            document.getElementById('min-stress').value = 0;
            document.getElementById('min-stress-value').textContent = 0;
            updateStressTimePlot();
        } else if (selectedType === 'fluctuating-tension') {
            document.getElementById('max-stress').value = 300;
            document.getElementById('min-stress').value = 100;
            document.getElementById('max-stress-value').textContent = 300;
            document.getElementById('min-stress-value').textContent = 100;
            updateStressTimePlot();
        } else if (selectedType === 'fluctuating-compression') {
            document.getElementById('max-stress').value = -100;
            document.getElementById('min-stress').value = -300;
            document.getElementById('max-stress-value').textContent = -100;
            document.getElementById('min-stress-value').textContent = -300;
            updateStressTimePlot();
        }

        // Dropdown stays on selected option (no reset)
    });
}

// ===== S-N CURVE MODULE (WITH SCALE TOGGLE) =====
function initSNCurvePlot() {
    const fatigueStrength = parseFloat(document.getElementById('fatigue-strength').value);
    const fatigueExponent = parseFloat(document.getElementById('fatigue-exponent').value);
    const useLogLog = document.getElementById('log-log-scale').checked;

    const data = generateSNCurveDataLog(fatigueStrength, fatigueExponent);

    // Calculate proper Y-axis range
    const minStress = Math.min(...data.stressAmplitude.filter(s => s > 0));
    const maxStress = Math.max(...data.stressAmplitude);

    // Configure Y-axis based on scale selection
    const yaxisConfig = useLogLog ? {
        title: 'σ<sub>a</sub> (MPa)',
        type: 'log',
        range: [Math.log10(minStress * 0.5), Math.log10(maxStress * 1.5)],
        showgrid: true,
        gridcolor: '#e0e0e0',
        tickformat: '.0f'
    } : {
        title: 'σ<sub>a</sub> (MPa)',
        type: 'linear',
        range: [0, maxStress * 1.1],
        showgrid: true,
        gridcolor: '#e0e0e0'
    };

    const plotTitle = useLogLog ?
        '(Log-Log Scale - Straight Line)' :
        '(Semi-Log Scale - Curved Line)';

    // Calculate endurance limits for annotation
    const enduranceLimit1e3 = fatigueStrength * Math.pow(2 * 1e3, fatigueExponent);
    const enduranceLimit1e6 = fatigueStrength * Math.pow(2 * 1e6, fatigueExponent);

    // Prepare traces: held materials + current material
    const traces = [];

    // Add held materials
    heldMaterials.forEach((mat, index) => {
        const matData = generateSNCurveDataLog(mat.sigmaF, mat.b);
        traces.push({
            x: matData.cycles,
            y: matData.stressAmplitude,
            type: 'scatter',
            mode: 'lines',
            line: { color: materialColors[index % materialColors.length], width: 2, dash: 'dot' },
            name: mat.name
        });
    });

    // Add current material curve
    traces.push({
        x: data.cycles,
        y: data.stressAmplitude,
        type: 'scatter',
        mode: 'lines',
        line: { color: materialColors[heldMaterials.length % materialColors.length], width: 3 },
        name: 'Current Material'
    });

    Plotly.newPlot('sn-curve-plot', traces, {
        title: { text: plotTitle, font: { size: 16 }},
        xaxis: {
            title: 'N (cycles)',
            type: 'log',
            range: [2, 8], // 10^2 to 10^8
            showgrid: true,
            gridcolor: '#e0e0e0',
            tickmode: 'linear',
            tick0: 2,
            dtick: 1,
            tickformat: '',
            tickvals: [2, 3, 4, 5, 6, 7, 8],
            ticktext: ['10²', '10³', '10⁴', '10⁵', '10⁶', '10⁷', '10⁸']
        },
        yaxis: yaxisConfig,
        paper_bgcolor: '#fffbeb',
        plot_bgcolor: 'white',
        margin: { l: 70, r: 40, t: 50, b: 90 },
        showlegend: heldMaterials.length > 0,
        legend: {
            orientation: 'v',
            x: 1.02,
            y: 1,
            xanchor: 'left',
            yanchor: 'top'
        },
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 0.5,
            y: -0.2,
            xanchor: 'center',
            yanchor: 'top',
            text: `<b>Endurance Limits:</b><br>At 10³ cycles: ${enduranceLimit1e3.toFixed(0)} MPa  |  At 10⁶ cycles: ${enduranceLimit1e6.toFixed(0)} MPa`,
            showarrow: false,
            font: { size: 11, color: '#b38600' },
            bgcolor: '#fff3cd',
            bordercolor: '#ffc107',
            borderwidth: 2,
            borderpad: 6
        }]
    }, {
        responsive: true,
        displayModeBar: false
    });

    console.log(`S-N curve initialised (${useLogLog ? 'log-log' : 'semi-log'} scale)`);
}

function updateSNCurvePlot() {
    const fatigueStrength = parseFloat(document.getElementById('fatigue-strength').value);
    const fatigueExponent = parseFloat(document.getElementById('fatigue-exponent').value);
    const useLogLog = document.getElementById('log-log-scale').checked;

    const data = generateSNCurveDataLog(fatigueStrength, fatigueExponent);

    // Calculate proper Y-axis range for all materials
    let allStresses = [...data.stressAmplitude];
    heldMaterials.forEach(mat => {
        const matData = generateSNCurveDataLog(mat.sigmaF, mat.b);
        allStresses = allStresses.concat(matData.stressAmplitude);
    });

    const minStress = Math.min(...allStresses.filter(s => s > 0));
    const maxStress = Math.max(...allStresses);

    // Configure Y-axis based on scale selection
    const yaxisConfig = useLogLog ? {
        title: 'σ<sub>a</sub> (MPa)',
        type: 'log',
        range: [Math.log10(minStress * 0.5), Math.log10(maxStress * 1.5)],
        showgrid: true,
        gridcolor: '#e0e0e0',
        tickformat: '.0f'
    } : {
        title: 'σ<sub>a</sub> (MPa)',
        type: 'linear',
        range: [0, maxStress * 1.1],
        showgrid: true,
        gridcolor: '#e0e0e0'
    };

    const plotTitle = useLogLog ?
        '(Log-Log Scale - Straight Line)' :
        '(Semi-Log Scale - Curved Line)';

    // Calculate endurance limits for annotation
    const enduranceLimit1e3 = fatigueStrength * Math.pow(2 * 1e3, fatigueExponent);
    const enduranceLimit1e6 = fatigueStrength * Math.pow(2 * 1e6, fatigueExponent);

    // Prepare traces: held materials + current material
    const traces = [];

    // Add held materials
    heldMaterials.forEach((mat, index) => {
        const matData = generateSNCurveDataLog(mat.sigmaF, mat.b);
        traces.push({
            x: matData.cycles,
            y: matData.stressAmplitude,
            type: 'scatter',
            mode: 'lines',
            line: { color: materialColors[index % materialColors.length], width: 2, dash: 'dot' },
            name: mat.name
        });
    });

    // Add current material curve
    traces.push({
        x: data.cycles,
        y: data.stressAmplitude,
        type: 'scatter',
        mode: 'lines',
        line: { color: materialColors[heldMaterials.length % materialColors.length], width: 3 },
        name: 'Current Material'
    });

    // Use Plotly.react with appropriate scale
    Plotly.react('sn-curve-plot', traces, {
        title: { text: plotTitle, font: { size: 16 }},
        xaxis: {
            title: 'N (cycles)',
            type: 'log',
            range: [2, 8], // 10^2 to 10^8
            showgrid: true,
            gridcolor: '#e0e0e0',
            tickmode: 'linear',
            tick0: 2,
            dtick: 1,
            tickformat: '',
            tickvals: [2, 3, 4, 5, 6, 7, 8],
            ticktext: ['10²', '10³', '10⁴', '10⁵', '10⁶', '10⁷', '10⁸']
        },
        yaxis: yaxisConfig,
        paper_bgcolor: '#fffbeb',
        plot_bgcolor: 'white',
        margin: { l: 70, r: 40, t: 50, b: 90 },
        showlegend: heldMaterials.length > 0,
        legend: {
            orientation: 'v',
            x: 1.02,
            y: 1,
            xanchor: 'left',
            yanchor: 'top'
        },
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 0.5,
            y: -0.2,
            xanchor: 'center',
            yanchor: 'top',
            text: `<b>Endurance Limits:</b><br>At 10³ cycles: ${enduranceLimit1e3.toFixed(0)} MPa  |  At 10⁶ cycles: ${enduranceLimit1e6.toFixed(0)} MPa`,
            showarrow: false,
            font: { size: 11, color: '#b38600' },
            bgcolor: '#fff3cd',
            bordercolor: '#ffc107',
            borderwidth: 2,
            borderpad: 6
        }]
    }, {
        responsive: true,
        displayModeBar: false
    });

    console.log(`S-N curve updated (${useLogLog ? 'log-log' : 'semi-log'} scale)`);
}

function generateSNCurveDataLog(fatigueStrength, fatigueExponent) {
    const cycles = [];
    const stressAmplitude = [];
    
    // Generate points from 10^2 to 10^8 cycles
    for (let logN = 2; logN <= 8; logN += 0.1) {
        const N = Math.pow(10, logN);
        cycles.push(N);
        
        // Basquin's equation: σₐ = σ'f(2N)^b
        // This will appear as a straight line on log-log plot
        // and as a curve on semi-log plot
        const stress = fatigueStrength * Math.pow(2 * N, fatigueExponent);
        
        // Only include positive stress values
        if (stress > 1) {  // Minimum value for log scale
            stressAmplitude.push(stress);
        } else {
            stressAmplitude.push(1); // Minimum value to avoid log(0) issues
        }
    }
    
    return { cycles, stressAmplitude };
}

function generateSNCurveDataLinear(fatigueStrength, fatigueExponent) {
    // Alternative implementation using log values directly for x-axis
    const logCycles = [];
    const stressAmplitude = [];
    
    for (let logN = 2; logN <= 8; logN += 0.05) {
        logCycles.push(logN);
        const N = Math.pow(10, logN);
        const stress = fatigueStrength * Math.pow(2 * N, fatigueExponent);
        stressAmplitude.push(Math.max(1, stress));
    }
    
    return { logCycles, stressAmplitude };
}

function generateSNCurveData(fatigueStrength, fatigueExponent) {
    // Wrapper function for compatibility
    return generateSNCurveDataLog(fatigueStrength, fatigueExponent);
}

function generateSNCurveDataLinear(fatigueStrength, fatigueExponent) {
    const logCycles = [];
    const stressAmplitude = [];
    
    // Generate points using log values directly for x-axis
    for (let logN = 2; logN <= 8; logN += 0.05) {
        logCycles.push(logN);
        
        const N = Math.pow(10, logN);
        const stress = fatigueStrength * Math.pow(2 * N, fatigueExponent);
        stressAmplitude.push(Math.max(0.1, stress));
    }
    
    return { logCycles, stressAmplitude };
}

function generateSNCurveData(fatigueStrength, fatigueExponent) {
    // Wrapper function for compatibility
    return generateSNCurveDataLog(fatigueStrength, fatigueExponent);
}

function holdCurrentMaterial() {
    const selectedMaterial = document.getElementById('material-preset').value;
    if (selectedMaterial && materials[selectedMaterial]) {
        const material = materials[selectedMaterial];

        // Check if material is already held
        const isHeld = heldMaterials.some(mat => mat.name === material.name);
        if (!isHeld) {
            heldMaterials.push({
                name: material.name,
                sigmaF: material.sigmaF,
                b: material.b
            });
            updateSNCurvePlot();
            console.log('Material held:', material.name);
        }
    } else {
        // Hold current slider values
        const fatigueStrength = parseFloat(document.getElementById('fatigue-strength').value);
        const fatigueExponent = parseFloat(document.getElementById('fatigue-exponent').value);
        const materialName = `Custom (σ'f=${fatigueStrength}, b=${fatigueExponent})`;

        const isHeld = heldMaterials.some(mat => mat.name === materialName);
        if (!isHeld) {
            heldMaterials.push({
                name: materialName,
                sigmaF: fatigueStrength,
                b: fatigueExponent
            });
            updateSNCurvePlot();
            console.log('Custom material held');
        }
    }
}

function resetHeldMaterials() {
    heldMaterials = [];
    updateSNCurvePlot();
    console.log('Held materials reset');
}

function setupSNCurveControls() {
    // Fatigue strength slider
    document.getElementById('fatigue-strength').addEventListener('input', function() {
        document.getElementById('fatigue-strength-value').textContent = this.value;
        updateSNCurvePlot();
    });

    // Fatigue exponent slider
    document.getElementById('fatigue-exponent').addEventListener('input', function() {
        document.getElementById('fatigue-exponent-value').textContent = this.value;
        updateSNCurvePlot();
    });

    // Scale toggle checkbox
    document.getElementById('log-log-scale').addEventListener('change', function() {
        updateSNCurvePlot();
        console.log('Scale changed to:', this.checked ? 'log-log' : 'semi-log');
    });

    // Hold material button
    document.getElementById('hold-material').addEventListener('click', function() {
        holdCurrentMaterial();
    });

    // Reset button
    document.getElementById('reset-materials').addEventListener('click', function() {
        resetHeldMaterials();
    });

    // Material dropdown handler
    document.getElementById('material-preset').addEventListener('change', function() {
        const selectedMaterial = this.value;
        if (selectedMaterial && materials[selectedMaterial]) {
            const material = materials[selectedMaterial];

            // Update sliders
            document.getElementById('fatigue-strength').value = material.sigmaF;
            document.getElementById('fatigue-exponent').value = material.b;

            // Update slider display values
            document.getElementById('fatigue-strength-value').textContent = material.sigmaF;
            document.getElementById('fatigue-exponent-value').textContent = material.b;

            // Update S-N curve with animation
            updateSNCurvePlot();

            // Also update Haigh diagram material properties if needed
            if (material.Su && material.Sy) {
                document.getElementById('ultimate-strength').value = material.Su;
                document.getElementById('yield-strength').value = material.Sy;
                document.getElementById('ultimate-strength-value').textContent = material.Su;
                document.getElementById('yield-strength-value').textContent = material.Sy;

                // Calculate approximate endurance limit (typically 0.35-0.5 of Su for steels)
                const enduranceLimit = material.sigmaF * Math.pow(2 * 1e6, material.b);
                document.getElementById('endurance-limit-input').value = Math.round(enduranceLimit);
                document.getElementById('endurance-limit-input-value').textContent = Math.round(enduranceLimit);

                updateHaighDiagram();
            }

            console.log('Material selected:', material.name);
        }
    });
}

// ===== HAIGH DIAGRAM MODULE =====
function initHaighDiagram() {
    const ultimateStrength = parseFloat(document.getElementById('ultimate-strength').value);
    const yieldStrength = parseFloat(document.getElementById('yield-strength').value);
    const enduranceLimit = parseFloat(document.getElementById('endurance-limit-input').value);
    const pointMeanStress = parseFloat(document.getElementById('point-mean-stress').value);
    const pointStressAmplitude = parseFloat(document.getElementById('point-stress-amplitude').value);

    const data = generateHaighDiagramData(ultimateStrength, yieldStrength, enduranceLimit);
    const intercepts = calculateLoadLineIntercepts(pointMeanStress, pointStressAmplitude, ultimateStrength, yieldStrength, enduranceLimit);

    // Calculate load line extending to plot boundary
    const maxPlotX = ultimateStrength * 1.1;
    const maxPlotY = Math.max(enduranceLimit, yieldStrength) * 1.1;
    const slope = pointMeanStress > 0 ? pointStressAmplitude / pointMeanStress : 0;
    const loadLineEndX = Math.min(maxPlotX, maxPlotY / slope);

    const traces = [{
        x: data.goodman.x,
        y: data.goodman.y,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#ff0000ff', width: 2 },
        name: 'Goodman'
    }, {
        x: data.gerber.x,
        y: data.gerber.y,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#006e12ff', width: 2 },
        name: 'Gerber'
    }, {
        x: data.soderberg.x,
        y: data.soderberg.y,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#0099ffff', width: 2 },
        name: 'Soderberg'
    }, {
        x: data.yield.x,
        y: data.yield.y,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#000000ff', width: 2, dash: 'dash' },
        name: 'Yield Line'
    }];

    // Add load line if point is not at origin
    if (pointMeanStress > 0 || pointStressAmplitude > 0) {
        traces.push({
            x: [0, loadLineEndX],
            y: [0, slope * loadLineEndX],
            type: 'scatter',
            mode: 'lines',
            line: { color: '#9933ff', width: 1.5 },
            name: 'Load Line',
            showlegend: true
        });
    }

    // Add intercept markers
    const interceptX = [];
    const interceptY = [];
    const interceptColors = [];
    const interceptNames = [];

    if (intercepts.goodman) {
        interceptX.push(intercepts.goodman.x);
        interceptY.push(intercepts.goodman.y);
        interceptColors.push('#ff0000');
        interceptNames.push('Goodman');
    }
    if (intercepts.gerber) {
        interceptX.push(intercepts.gerber.x);
        interceptY.push(intercepts.gerber.y);
        interceptColors.push('#006e12');
        interceptNames.push('Gerber');
    }
    if (intercepts.soderberg) {
        interceptX.push(intercepts.soderberg.x);
        interceptY.push(intercepts.soderberg.y);
        interceptColors.push('#0099ff');
        interceptNames.push('Soderberg');
    }

    if (interceptX.length > 0) {
        traces.push({
            x: interceptX,
            y: interceptY,
            type: 'scatter',
            mode: 'markers',
            marker: {
                symbol: 'x',
                size: 12,
                color: interceptColors,
                line: { width: 2 }
            },
            name: 'Intercepts',
            showlegend: false,
            hovertemplate: interceptNames.map((name, i) =>
                `${name} intercept<br>σₘ: ${interceptX[i].toFixed(1)} MPa<br>σₐ: ${interceptY[i].toFixed(1)} MPa<extra></extra>`
            )
        });
    }

    // Add assessment point last so it appears on top
    traces.push({
        x: [pointMeanStress],
        y: [pointStressAmplitude],
        type: 'scatter',
        mode: 'markers',
        marker: { color: '#aa00aaff', size: 12 },
        name: 'Assessment Point'
    });

    // Calculate safety factors for annotation
    const goodmanSF = calculateGoodmanSF(pointMeanStress, pointStressAmplitude, enduranceLimit, ultimateStrength);
    const gerberSF = calculateGerberSF(pointMeanStress, pointStressAmplitude, enduranceLimit, ultimateStrength);
    const soderbergSF = calculateSoderbergSF(pointMeanStress, pointStressAmplitude, enduranceLimit, yieldStrength);

    Plotly.newPlot('haigh-diagram', traces, {
        xaxis: {
            title: 'Mean Stress (MPa)',
            range: [0, ultimateStrength * 1.1],
            constrain: 'domain',
            constraintoward: 'left'
        },
        yaxis: {
            title: 'Stress Amplitude (MPa)',
            range: [0, Math.max(enduranceLimit, yieldStrength) * 1.1],
            scaleanchor: 'x',
            scaleratio: 1,
            constrain: 'domain',
            constraintoward: 'bottom'
        },
        paper_bgcolor: '#fffbeb',
        plot_bgcolor: 'white',
        margin: { l: 50, r: 20, t: 30, b: 50 },
        height: 500,
        legend: {
            orientation: 'h',
            x: 0.5,
            xanchor: 'center',
            y: 1.05,
            yanchor: 'top',
            font: { size: 9 }
        },
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 0.5,
            y: 0.75,
            xanchor: 'center',
            yanchor: 'top',
            text: `<b>SF:</b> Goodman: ${goodmanSF.toFixed(2)} | Gerber: ${gerberSF.toFixed(2)} | Soderberg: ${soderbergSF.toFixed(2)}`,
            showarrow: false,
            font: { size: 9, color: '#b38600' },
            bgcolor: '#fff3cd',
            bordercolor: '#ffc107',
            borderwidth: 1,
            borderpad: 3
        }]
    }, {
        responsive: true,
        displayModeBar: false
    });
}

function updateHaighDiagram() {
    const ultimateStrength = parseFloat(document.getElementById('ultimate-strength').value);
    const yieldStrength = parseFloat(document.getElementById('yield-strength').value);
    const enduranceLimit = parseFloat(document.getElementById('endurance-limit-input').value);
    const pointMeanStress = parseFloat(document.getElementById('point-mean-stress').value);
    const pointStressAmplitude = parseFloat(document.getElementById('point-stress-amplitude').value);

    const data = generateHaighDiagramData(ultimateStrength, yieldStrength, enduranceLimit);
    const intercepts = calculateLoadLineIntercepts(pointMeanStress, pointStressAmplitude, ultimateStrength, yieldStrength, enduranceLimit);

    // Calculate load line extending to plot boundary
    const maxPlotX = ultimateStrength * 1.1;
    const maxPlotY = Math.max(enduranceLimit, yieldStrength) * 1.1;
    const slope = pointMeanStress > 0 ? pointStressAmplitude / pointMeanStress : 0;
    const loadLineEndX = Math.min(maxPlotX, maxPlotY / slope);

    const traces = [{
        x: data.goodman.x,
        y: data.goodman.y,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#ff0000ff', width: 2 },
        name: 'Goodman'
    }, {
        x: data.gerber.x,
        y: data.gerber.y,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#006e12ff', width: 2 },
        name: 'Gerber'
    }, {
        x: data.soderberg.x,
        y: data.soderberg.y,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#0099ffff', width: 2 },
        name: 'Soderberg'
    }, {
        x: data.yield.x,
        y: data.yield.y,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#000000ff', width: 2, dash: 'dash' },
        name: 'Yield Line'
    }];

    // Add load line if point is not at origin
    if (pointMeanStress > 0 || pointStressAmplitude > 0) {
        traces.push({
            x: [0, loadLineEndX],
            y: [0, slope * loadLineEndX],
            type: 'scatter',
            mode: 'lines',
            line: { color: '#9933ff', width: 1.5 },
            name: 'Load Line',
            showlegend: true
        });
    }

    // Add intercept markers
    const interceptX = [];
    const interceptY = [];
    const interceptColors = [];
    const interceptNames = [];

    if (intercepts.goodman) {
        interceptX.push(intercepts.goodman.x);
        interceptY.push(intercepts.goodman.y);
        interceptColors.push('#ff0000');
        interceptNames.push('Goodman');
    }
    if (intercepts.gerber) {
        interceptX.push(intercepts.gerber.x);
        interceptY.push(intercepts.gerber.y);
        interceptColors.push('#006e12');
        interceptNames.push('Gerber');
    }
    if (intercepts.soderberg) {
        interceptX.push(intercepts.soderberg.x);
        interceptY.push(intercepts.soderberg.y);
        interceptColors.push('#0099ff');
        interceptNames.push('Soderberg');
    }

    if (interceptX.length > 0) {
        traces.push({
            x: interceptX,
            y: interceptY,
            type: 'scatter',
            mode: 'markers',
            marker: {
                symbol: 'x',
                size: 12,
                color: interceptColors,
                line: { width: 2 }
            },
            name: 'Intercepts',
            showlegend: false,
            hovertemplate: interceptNames.map((name, i) =>
                `${name} intercept<br>σₘ: ${interceptX[i].toFixed(1)} MPa<br>σₐ: ${interceptY[i].toFixed(1)} MPa<extra></extra>`
            )
        });
    }

    // Add assessment point last so it appears on top
    traces.push({
        x: [pointMeanStress],
        y: [pointStressAmplitude],
        type: 'scatter',
        mode: 'markers',
        marker: { color: '#aa00aaff', size: 12 },
        name: 'Assessment Point'
    });

    // Calculate safety factors for annotation
    const goodmanSF = calculateGoodmanSF(pointMeanStress, pointStressAmplitude, enduranceLimit, ultimateStrength);
    const gerberSF = calculateGerberSF(pointMeanStress, pointStressAmplitude, enduranceLimit, ultimateStrength);
    const soderbergSF = calculateSoderbergSF(pointMeanStress, pointStressAmplitude, enduranceLimit, yieldStrength);

    Plotly.react('haigh-diagram', traces, {
        xaxis: {
            title: 'Mean Stress (MPa)',
            range: [0, ultimateStrength * 1.1],
            constrain: 'domain',
            constraintoward: 'left'
        },
        yaxis: {
            title: 'Stress Amplitude (MPa)',
            range: [0, Math.max(enduranceLimit, yieldStrength) * 1.1],
            scaleanchor: 'x',
            scaleratio: 1,
            constrain: 'domain',
            constraintoward: 'bottom'
        },
        paper_bgcolor: '#fffbeb',
        plot_bgcolor: 'white',
        margin: { l: 50, r: 20, t: 30, b: 50 },
        height: 500,
        legend: {
            orientation: 'h',
            x: 0.5,
            xanchor: 'center',
            y: 1.05,
            yanchor: 'top',
            font: { size: 9 }
        },
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 0.5,
            y: 0.75,
            xanchor: 'center',
            yanchor: 'top',
            text: `<b>SF:</b> Goodman: ${goodmanSF.toFixed(2)} | Gerber: ${gerberSF.toFixed(2)} | Soderberg: ${soderbergSF.toFixed(2)}`,
            showarrow: false,
            font: { size: 9, color: '#b38600' },
            bgcolor: '#fff3cd',
            bordercolor: '#ffc107',
            borderwidth: 1,
            borderpad: 3
        }]
    }, {
        responsive: true,
        displayModeBar: false
    });
}

function generateHaighDiagramData(ultimateStrength, yieldStrength, enduranceLimit) {
    const meanStress = [];
    const goodmanLine = [];
    const gerberLine = [];
    const soderbergLine = [];
    const yieldLine = [];
    
    for (let sm = 0; sm <= ultimateStrength; sm += ultimateStrength / 50) {
        meanStress.push(sm);
        
        // Goodman line
        goodmanLine.push(Math.max(0, enduranceLimit * (1 - sm / ultimateStrength)));
        
        // Gerber parabola
        gerberLine.push(Math.max(0, enduranceLimit * (1 - Math.pow(sm / ultimateStrength, 2))));
        
        // Soderberg line
        soderbergLine.push(Math.max(0, enduranceLimit * (1 - sm / yieldStrength)));
        
        // Yield line
        yieldLine.push(Math.max(0, yieldStrength - sm));
    }
    
    return {
        goodman: { x: meanStress, y: goodmanLine },
        gerber: { x: meanStress, y: gerberLine },
        soderberg: { x: meanStress, y: soderbergLine },
        yield: { x: meanStress, y: yieldLine }
    };
}

function calculateGoodmanSF(sm, sa, Se, Sut) {
    if (sa === 0 && sm === 0) return Infinity;
    return 1 / (sa/Se + sm/Sut);
}

function calculateGerberSF(sm, sa, Se, Sut) {
    if (sa === 0 && sm === 0) return Infinity;
    // Quadratic formula for Gerber
    const a = Math.pow(sm/Sut, 2);
    const b = 0;
    const c = sa/Se - 1;
    if (a === 0) return Se/sa;
    const discriminant = b*b - 4*a*c;
    if (discriminant < 0) return 0;
    return (-b + Math.sqrt(discriminant))/(2*a);
}

function calculateSoderbergSF(sm, sa, Se, Sy) {
    if (sa === 0 && sm === 0) return Infinity;
    return 1 / (sa/Se + sm/Sy);
}

// Calculate intercepts of load line with criterion lines
function calculateLoadLineIntercepts(pointMeanStress, pointStressAmplitude, ultimateStrength, yieldStrength, enduranceLimit) {
    const intercepts = {
        goodman: null,
        gerber: null,
        soderberg: null
    };

    // If point is at origin, no intercepts
    if (pointMeanStress === 0 && pointStressAmplitude === 0) {
        return intercepts;
    }

    // Load line slope: m = σ_a / σ_m
    const slope = pointStressAmplitude / pointMeanStress;

    // Goodman intercept: σ_a = S_e * (1 - σ_m/S_ut) and σ_a = slope * σ_m
    // slope * σ_m = S_e * (1 - σ_m/S_ut)
    // slope * σ_m = S_e - (S_e/S_ut) * σ_m
    // σ_m * (slope + S_e/S_ut) = S_e
    // σ_m = S_e / (slope + S_e/S_ut)
    const sm_goodman = enduranceLimit / (slope + enduranceLimit/ultimateStrength);
    const sa_goodman = slope * sm_goodman;
    if (sm_goodman >= 0 && sm_goodman <= ultimateStrength && sa_goodman >= 0) {
        intercepts.goodman = { x: sm_goodman, y: sa_goodman };
    }

    // Gerber intercept: σ_a = S_e * (1 - (σ_m/S_ut)²) and σ_a = slope * σ_m
    // slope * σ_m = S_e * (1 - (σ_m/S_ut)²)
    // slope * σ_m = S_e - S_e * (σ_m²/S_ut²)
    // S_e * (σ_m²/S_ut²) + slope * σ_m - S_e = 0
    // Quadratic: a*x² + b*x + c = 0 where x = σ_m
    const a = enduranceLimit / (ultimateStrength * ultimateStrength);
    const b = slope;
    const c = -enduranceLimit;
    const discriminant = b*b - 4*a*c;
    if (discriminant >= 0) {
        const sm_gerber = (-b + Math.sqrt(discriminant)) / (2*a);
        const sa_gerber = slope * sm_gerber;
        if (sm_gerber >= 0 && sm_gerber <= ultimateStrength && sa_gerber >= 0) {
            intercepts.gerber = { x: sm_gerber, y: sa_gerber };
        }
    }

    // Soderberg intercept: σ_a = S_e * (1 - σ_m/S_y) and σ_a = slope * σ_m
    // slope * σ_m = S_e * (1 - σ_m/S_y)
    // slope * σ_m = S_e - (S_e/S_y) * σ_m
    // σ_m * (slope + S_e/S_y) = S_e
    const sm_soderberg = enduranceLimit / (slope + enduranceLimit/yieldStrength);
    const sa_soderberg = slope * sm_soderberg;
    if (sm_soderberg >= 0 && sm_soderberg <= yieldStrength && sa_soderberg >= 0) {
        intercepts.soderberg = { x: sm_soderberg, y: sa_soderberg };
    }

    return intercepts;
}

function setupHaighDiagramControls() {
    document.getElementById('ultimate-strength').addEventListener('input', function() {
        const ultimateStrength = parseFloat(this.value);
        const yieldStrength = parseFloat(document.getElementById('yield-strength').value);
        if (yieldStrength > ultimateStrength) {
            document.getElementById('yield-strength').value = ultimateStrength;
            document.getElementById('yield-strength-value').textContent = ultimateStrength;
        }
        document.getElementById('ultimate-strength-value').textContent = ultimateStrength;
        updateHaighDiagram();
    });
    
    document.getElementById('yield-strength').addEventListener('input', function() {
        const yieldStrength = parseFloat(this.value);
        const ultimateStrength = parseFloat(document.getElementById('ultimate-strength').value);
        if (yieldStrength > ultimateStrength) {
            document.getElementById('ultimate-strength').value = yieldStrength;
            document.getElementById('ultimate-strength-value').textContent = yieldStrength;
        }
        document.getElementById('yield-strength-value').textContent = yieldStrength;
        updateHaighDiagram();
    });
    
    document.getElementById('endurance-limit-input').addEventListener('input', function() {
        const enduranceLimit = parseFloat(this.value);
        const yieldStrength = parseFloat(document.getElementById('yield-strength').value);
        const ultimateStrength = parseFloat(document.getElementById('ultimate-strength').value);

        // If endurance limit exceeds yield strength, increase yield strength to match
        if (enduranceLimit > yieldStrength) {
            document.getElementById('yield-strength').value = enduranceLimit;
            document.getElementById('yield-strength-value').textContent = enduranceLimit;

            // If yield strength now exceeds ultimate strength, increase ultimate strength to match
            if (enduranceLimit > ultimateStrength) {
                document.getElementById('ultimate-strength').value = enduranceLimit;
                document.getElementById('ultimate-strength-value').textContent = enduranceLimit;
            }
        }

        document.getElementById('endurance-limit-input-value').textContent = this.value;
        updateHaighDiagram();
    });
    
    document.getElementById('point-mean-stress').addEventListener('input', function() {
        document.getElementById('point-mean-stress-value').textContent = this.value;
        updateHaighDiagram();
    });
    
    document.getElementById('point-stress-amplitude').addEventListener('input', function() {
        document.getElementById('point-stress-amplitude-value').textContent = this.value;
        updateHaighDiagram();
    });
}

// ===== CUMULATIVE DAMAGE MODULE (COMPLETELY REWRITTEN) =====
function initDamagePlot() {
    updateDamagePlot();
}

function updateDamagePlot() {
    const stressAmp1 = parseFloat(document.getElementById('stress-amp-1').value);
    const cycles1 = parseFloat(document.getElementById('cycles-1').value);
    const stressAmp2 = parseFloat(document.getElementById('stress-amp-2').value);
    const cycles2 = parseFloat(document.getElementById('cycles-2').value);
    const stressAmp3 = parseFloat(document.getElementById('stress-amp-3').value);
    const cycles3 = parseFloat(document.getElementById('cycles-3').value);
    
    // Use default material properties for damage calculation
    const sigmaF = 1020;  // Fatigue strength coefficient (MPa)
    const b = -0.092;     // Fatigue strength exponent
    
    // Calculate cycles to failure for each stress level
    const cyclesTo1 = calculateCyclesToFailure(stressAmp1, sigmaF, b);
    const cyclesTo2 = calculateCyclesToFailure(stressAmp2, sigmaF, b);
    const cyclesTo3 = calculateCyclesToFailure(stressAmp3, sigmaF, b);
    
    // Calculate damage fractions
    const damage1 = cycles1 / cyclesTo1;
    const damage2 = cycles2 / cyclesTo2;
    const damage3 = cycles3 / cyclesTo3;
    const totalDamage = damage1 + damage2 + damage3;
    
    // Create ring chart (donut chart) for Palmgren-Miner damage accumulation
    // Build segments: each loading block + remaining capacity
    const labels = [];
    const values = [];
    const colors = [];
    const textInfo = [];

    // Add each loading block
    if (damage1 > 0) {
        labels.push(`Block 1<br>${stressAmp1} MPa<br>${cycles1.toLocaleString()} cycles`);
        values.push(damage1);
        colors.push('#4BC0C0'); // Teal
        textInfo.push(`${(damage1 * 100).toFixed(1)}%`);
    }

    if (damage2 > 0) {
        labels.push(`Block 2<br>${stressAmp2} MPa<br>${cycles2.toLocaleString()} cycles`);
        values.push(damage2);
        colors.push('#FFCE56'); // Yellow
        textInfo.push(`${(damage2 * 100).toFixed(1)}%`);
    }

    if (damage3 > 0) {
        labels.push(`Block 3<br>${stressAmp3} MPa<br>${cycles3.toLocaleString()} cycles`);
        values.push(damage3);
        colors.push('#FF6384'); // Pink
        textInfo.push(`${(damage3 * 100).toFixed(1)}%`);
    }

    // Add remaining capacity (or over-damage if total > 1)
    const remaining = 1 - totalDamage;
    if (remaining > 0) {
        labels.push('Remaining Capacity');
        values.push(remaining);
        colors.push('#E8E8E8'); // Light gray
        textInfo.push(`${(remaining * 100).toFixed(1)}%`);
    } else if (totalDamage > 1) {
        // Show over-damage in red
        labels.push('Over-Damage<br>(FAILURE!)');
        values.push(totalDamage - 1);
        colors.push('#DC3545'); // Red
        textInfo.push(`+${((totalDamage - 1) * 100).toFixed(1)}%`);
    }

    const trace = {
        labels: labels,
        values: values,
        type: 'pie',
        hole: 0.5, // Creates the ring/donut effect
        marker: {
            colors: colors,
            line: { color: 'white', width: 2 }
        },
        text: textInfo,
        textposition: 'auto',
        textinfo: 'label+percent',
        hovertemplate: '<b>%{label}</b><br>Damage: %{value:.3f}<br>%{percent}<extra></extra>',
        direction: 'clockwise',
        sort: false
    };

    // Determine status and color for center annotation
    let statusColor, statusLabel;
    if (totalDamage >= 1.0) {
        statusLabel = 'FAILURE';
        statusColor = '#DC3545'; // Red
    } else if (totalDamage >= 0.7) {
        statusLabel = 'WARNING';
        statusColor = '#FFC107'; // Amber
    } else {
        statusLabel = 'SAFE';
        statusColor = '#28A745'; // Green
    }

    // Calculate remaining life percentage
    const remainingLife = Math.max(0, (1 - totalDamage) * 100);

    // Build comprehensive center text with results - using multiple annotations for better styling
    const layout = {
        showlegend: true,
        legend: {
            orientation: 'v',
            x: 1.1,
            y: 0.5
        },
        paper_bgcolor: '#fffbeb',
        plot_bgcolor: 'white',
        margin: { l: 20, r: 180, t: 50, b: 20 },
        annotations: [
            // Status label at top
            {
                font: { size: 18, color: statusColor },
                showarrow: false,
                text: `<b>${statusLabel}</b>`,
                x: 0.5,
                y: 0.65,
                xanchor: 'center',
                yanchor: 'middle'
            },
            // Total damage value
            {
                font: { size: 11, color: '#333' },
                showarrow: false,
                text: 'Total Damage (D):',
                x: 0.5,
                y: 0.55,
                xanchor: 'center',
                yanchor: 'middle'
            },
            {
                font: { size: 20, color: statusColor },
                showarrow: false,
                text: `<b>${totalDamage.toFixed(3)}</b>`,
                x: 0.5,
                y: 0.5,
                xanchor: 'center',
                yanchor: 'middle'
            },
            // Remaining life
            {
                font: { size: 11, color: '#333' },
                showarrow: false,
                text: 'Remaining Life:',
                x: 0.5,
                y: 0.4,
                xanchor: 'center',
                yanchor: 'middle'
            },
            {
                font: { size: 16, color: statusColor },
                showarrow: false,
                text: `<b>${remainingLife.toFixed(1)}%</b>`,
                x: 0.5,
                y: 0.35,
                xanchor: 'center',
                yanchor: 'middle'
            }
        ],
        height: 400
    };

    Plotly.react('damage-plot', [trace], layout, {
        responsive: true,
        displayModeBar: false
    });
}

function calculateCyclesToFailure(stressAmplitude, sigmaF, b) {
    // Basquin's equation: σₐ = σ'f(2Nf)^b
    // Rearranged: Nf = (σₐ/σ'f)^(1/b) / 2
    if (stressAmplitude <= 0) return Infinity;
    return Math.pow(stressAmplitude / sigmaF, 1 / b) / 2;
}

function setupDamageControls() {
    const damageInputs = [
        'stress-amp-1', 'cycles-1',
        'stress-amp-2', 'cycles-2',
        'stress-amp-3', 'cycles-3'
    ];
    
    damageInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', function() {
            document.getElementById(id + '-value').textContent = this.value;
            updateDamagePlot();
        });
    });
}

// ===== QUIZ FUNCTIONALITY =====
function setupQuiz() {
    document.getElementById('submit-quiz').addEventListener('click', function() {
        const answers = {
            q1: 'a',  // 100 MPa
            q2: 'b',  // R = -1
            q3: 'c',  // Steel
            q4: 'c',  // D = 1.0
            q5: 'c'   // Soderberg
        };
        
        let score = 0;
        let feedback = '<h3>Quiz Results:</h3>';
        
        for (let question in answers) {
            const selectedOption = document.querySelector(`input[name="${question}"]:checked`);
            if (selectedOption) {
                if (selectedOption.value === answers[question]) {
                    score++;
                    feedback += `<p style="color: #155724;">Question ${question.substring(1)}: Correct! ✓</p>`;
                } else {
                    feedback += `<p style="color: #721c24;">Question ${question.substring(1)}: Incorrect. ✗</p>`;
                }
            } else {
                feedback += `<p style="color: #856404;">Question ${question.substring(1)}: No answer selected.</p>`;
            }
        }
        
        feedback += `<p style="font-weight: bold; font-size: 1.2em;">Your score: ${score}/5`;
        if (score === 5) feedback += ' - Excellent!';
        else if (score >= 3) feedback += ' - Good work!';
        else feedback += ' - Keep practising!';
        feedback += '</p>';
        
        const resultsDiv = document.getElementById('quiz-results');
        resultsDiv.innerHTML = feedback;
        resultsDiv.classList.remove('hidden');
    });
}

// ===== SOLUTION TOGGLE FUNCTIONALITY =====
function toggleSolution(id) {
    const solution = document.getElementById(id);
    const toggleElement = solution.previousElementSibling;
    
    if (solution.classList.contains('hidden')) {
        solution.classList.remove('hidden');
        toggleElement.textContent = 'Hide Solution';
    } else {
        solution.classList.add('hidden');
        toggleElement.textContent = 'Show Solution';
    }
}

function setupSolutionToggles() {
    // Make toggle function globally available
    window.toggleSolution = toggleSolution;
}