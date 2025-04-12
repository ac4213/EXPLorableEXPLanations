// Global variables for simulations
let stressTimePlot, snCurvePlot, haighDiagramPlot, damagePlot;

// Material property database
const materials = {
    'steel-1045': {
        name: 'Steel 1045',
        sigmaF: 1120, // Fatigue strength coefficient (MPa)
        b: -0.092,    // Fatigue strength exponent
        Su: 800,      // Ultimate tensile strength (MPa)
        Sy: 600       // Yield strength (MPa)
    },
    'aluminum-7075': {
        name: 'Aluminum 7075',
        sigmaF: 850,
        b: -0.11,
        Su: 550,
        Sy: 500
    },
    'titanium-alloy': {
        name: 'Titanium Alloy',
        sigmaF: 1400,
        b: -0.085,
        Su: 1200,
        Sy: 1050
    },
    'cast-iron': {
        name: 'Cast Iron',
        sigmaF: 720,
        b: -0.108,
        Su: 350,
        Sy: 280
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all simulations and plots
    initStressTimePlot();
    initSNCurvePlot();
    initHaighDiagram();
    initDamagePlot();
    
    // Set up event listeners for all sliders and buttons
    setupStressTimeControls();
    setupSNCurveControls();
    setupHaighDiagramControls();
    setupDamageControls();
});

// Stress-Time History Plot
function initStressTimePlot() {
    const maxStress = parseFloat(document.getElementById('max-stress').value);
    const minStress = parseFloat(document.getElementById('min-stress').value);
    const frequency = parseFloat(document.getElementById('frequency').value);
    
    updateStressParams(maxStress, minStress);
    
    // Generate data for plot
    const data = generateStressTimeData(maxStress, minStress, frequency);
    
    // Create initial plot
    stressTimePlot = Plotly.newPlot('stress-time-plot', [{
        x: data.time,
        y: data.stress,
        type: 'scatter',
        mode: 'lines',
        line: {
            color: 'blue',
            width: 2
        },
        name: 'Stress'
    }, {
        x: [0, 10],
        y: [data.meanStress, data.meanStress],
        type: 'scatter',
        mode: 'lines',
        line: {
            color: 'red',
            width: 1,
            dash: 'dash'
        },
        name: 'Mean Stress'
    }], {
        title: 'Stress vs. Time',
        xaxis: {
            title: 'Time (s)',
            range: [0, 10]
        },
        yaxis: {
            title: 'Stress (MPa)',
            range: [Math.min(minStress, -50) - 50, Math.max(maxStress, 50) + 50]
        },
        legend: {
            orientation: 'h',
            y: -0.2
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
}

function updateStressTimePlot() {
    const maxStress = parseFloat(document.getElementById('max-stress').value);
    const minStress = parseFloat(document.getElementById('min-stress').value);
    const frequency = parseFloat(document.getElementById('frequency').value);
    
    updateStressParams(maxStress, minStress);
    
    // Generate data for updated plot
    const data = generateStressTimeData(maxStress, minStress, frequency);
    
    // Update plot data
    Plotly.update('stress-time-plot', {
        x: [data.time, [0, 10]],
        y: [data.stress, [data.meanStress, data.meanStress]]
    }, {
        yaxis: {
            range: [Math.min(minStress, -50) - 50, Math.max(maxStress, 50) + 50]
        }
    });
}

function generateStressTimeData(maxStress, minStress, frequency) {
    const amplitude = (maxStress - minStress) / 2;
    const meanStress = (maxStress + minStress) / 2;
    const time = [];
    const stress = [];
    
    // Generate data points for 5 cycles
    const timeStep = 0.05;
    const duration = 10;  // seconds
    
    for (let t = 0; t <= duration; t += timeStep) {
        time.push(t);
        stress.push(amplitude * Math.sin(2 * Math.PI * frequency * t) + meanStress);
    }
    
    return {
        time: time,
        stress: stress,
        meanStress: meanStress,
        amplitude: amplitude
    };
}

function updateStressParams(maxStress, minStress) {
    const amplitude = (maxStress - minStress) / 2;
    const meanStress = (maxStress + minStress) / 2;
    const stressRatio = minStress / maxStress;
    
    document.getElementById('stress-amplitude').textContent = amplitude.toFixed(1);
    document.getElementById('mean-stress-value').textContent = meanStress.toFixed(1);
    document.getElementById('stress-ratio').textContent = isFinite(stressRatio) ? stressRatio.toFixed(2) : "∞";
    
    document.getElementById('max-stress-value').textContent = maxStress;
    document.getElementById('min-stress-value').textContent = minStress;
    document.getElementById('frequency-value').textContent = document.getElementById('frequency').value;
}

function setupStressTimeControls() {
    // Set up event listeners for the sliders
    document.getElementById('max-stress').addEventListener('input', function() {
        const maxStress = parseFloat(this.value);
        const minStress = parseFloat(document.getElementById('min-stress').value);
        
        // Ensure min stress is less than max stress
        if (minStress >= maxStress) {
            document.getElementById('min-stress').value = maxStress - 10;
        }
        
        updateStressTimePlot();
    });
    
    document.getElementById('min-stress').addEventListener('input', function() {
        const minStress = parseFloat(this.value);
        const maxStress = parseFloat(document.getElementById('max-stress').value);
        
        // Ensure min stress is less than max stress
        if (minStress >= maxStress) {
            document.getElementById('max-stress').value = minStress + 10;
        }
        
        updateStressTimePlot();
    });
    
    document.getElementById('frequency').addEventListener('input', function() {
        updateStressTimePlot();
    });
    
    // Set up preset buttons
    document.getElementById('fully-reversed').addEventListener('click', function() {
        const amplitude = parseFloat(document.getElementById('stress-amplitude').textContent);
        document.getElementById('max-stress').value = amplitude;
        document.getElementById('min-stress').value = -amplitude;
        updateStressTimePlot();
    });
    
    document.getElementById('zero-to-max').addEventListener('click', function() {
        const maxStress = parseFloat(document.getElementById('max-stress').value);
        document.getElementById('min-stress').value = 0;
        updateStressTimePlot();
    });
    
    document.getElementById('fluctuating-tension').addEventListener('click', function() {
        const maxStress = parseFloat(document.getElementById('max-stress').value);
        document.getElementById('min-stress').value = 0.5 * maxStress;
        updateStressTimePlot();
    });
    
    document.getElementById('fluctuating-compression').addEventListener('click', function() {
        const minStress = parseFloat(document.getElementById('min-stress').value);
        document.getElementById('max-stress').value = 0.5 * minStress;
        updateStressTimePlot();
    });
}

// S-N Curve Plot
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

function updateEnduranceLimits(fatigueStrength, fatigueExponent) {
    // Calculate endurance limits at 10^6 and 10^7 cycles
    const enduranceLimit1e6 = fatigueStrength * Math.pow(2 * 1e6, fatigueExponent);
    const enduranceLimit1e7 = fatigueStrength * Math.pow(2 * 1e7, fatigueExponent);
    
    document.getElementById('endurance-limit').textContent = enduranceLimit1e6.toFixed(0);
    document.getElementById('long-endurance-limit').textContent = enduranceLimit1e7.toFixed(0);
    
    document.getElementById('fatigue-strength-value').textContent = fatigueStrength;
    document.getElementById('fatigue-exponent-value').textContent = fatigueExponent;
}

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

// Haigh Diagram
function initHaighDiagram() {
    const ultimateStrength = parseFloat(document.getElementById('ultimate-strength').value);
    const yieldStrength = parseFloat(document.getElementById('yield-strength').value);
    const enduranceLimit = parseFloat(document.getElementById('endurance-limit-input').value);
    const pointMeanStress = parseFloat(document.getElementById('point-mean-stress').value);
    const pointStressAmplitude = parseFloat(document.getElementById('point-stress-amplitude').value);
    
    // Generate data for Haigh diagram
    const data = generateHaighDiagramData(ultimateStrength, yieldStrength, enduranceLimit);
    
    // Create initial plot
    haighDiagramPlot = Plotly.newPlot('haigh-diagram', [{
        x: data.goodman.x,
        y: data.goodman.y,
        type: 'scatter',
        mode: 'lines',
        line: {
            color: 'blue',
            width: 2
        },
        name: 'Goodman'
    }, {
        x: data.gerber.x,
        y: data.gerber.y,
        type: 'scatter',
        mode: 'lines',
        line: {
            color: 'green',
            width: 2
        },
        name: 'Gerber'
    }, {
        x: data.soderberg.x,
        y: data.soderberg.y,
        type: 'scatter',
        mode: 'lines',
        line: {
            color: 'red',
            width: 2
        },
        name: 'Soderberg'
    }, {
        x: data.yield.x,
        y: data.yield.y,
        type: 'scatter',
        mode: 'lines',
        line: {
            color: 'black',
            width: 2,
            dash: 'dash'
        },
        name: 'Yield Line'
    }, {
        x: [pointMeanStress],
        y: [pointStressAmplitude],
        type: 'scatter',
        mode: 'markers',
        marker: {
            color: 'purple',
            size: 10
        },
        name: 'Assessment Point'
    }], {
        title: 'Haigh Diagram',
        xaxis: {
            title: 'Mean Stress (MPa)',
            range: [0, ultimateStrength * 1.1]
        },
        yaxis: {
            title: 'Stress Amplitude (MPa)',
            range: [0, Math.max(enduranceLimit, yieldStrength) * 1.1]
        },
        legend: {
            orientation: 'h',
            y: -0.2
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
    
    updateSafetyFactors(pointMeanStress, pointStressAmplitude, ultimateStrength, yieldStrength, enduranceLimit);
}

function updateHaighDiagram() {
    const ultimateStrength = parseFloat(document.getElementById('ultimate-strength').value);
    const yieldStrength = parseFloat(document.getElementById('yield-strength').value);
    const enduranceLimit = parseFloat(document.getElementById('endurance-limit-input').value);
    const pointMeanStress = parseFloat(document.getElementById('point-mean-stress').value);
    const pointStressAmplitude = parseFloat(document.getElementById('point-stress-amplitude').value);
    
    // Generate data for updated Haigh diagram
    const data = generateHaighDiagramData(ultimateStrength, yieldStrength, enduranceLimit);
    
    // Update plot data
    Plotly.update('haigh-diagram', {
        x: [data.goodman.x, data.gerber.x, data.soderberg.x, data.yield.x, [pointMeanStress]],
        y: [data.goodman.y, data.gerber.y, data.soderberg.y, data.yield.y, [pointStressAmplitude]]
    }, {
        xaxis: {
            range: [0, ultimateStrength * 1.1]
        },
        yaxis: {
            range: [0, Math.max(enduranceLimit, yieldStrength) * 1.1]
        }
    });
    
    updateSafetyFactors(pointMeanStress, pointStressAmplitude, ultimateStrength, yieldStrength, enduranceLimit);
}

function generateHaighDiagramData(ultimateStrength, yieldStrength, enduranceLimit) {
    const meanStress = [];
    const goodmanLine = [];
    const gerberLine = [];
    const soderbergLine = [];
    const yieldLine = [];
    
    // Generate data points for Haigh diagram
    for (let sm = 0; sm <= ultimateStrength; sm += ultimateStrength / 50) {
        meanStress.push(sm);
        
        // Goodman line
        goodmanLine.push(enduranceLimit * (1 - sm / ultimateStrength));
        
        // Gerber line
        gerberLine.push(enduranceLimit * (1 - Math.pow(sm / ultimateStrength, 2)));
        
        // Soderberg line
        soderbergLine.push(enduranceLimit * (1 - sm / yieldStrength));
        
        // Yield line
        yieldLine.push(yieldStrength - sm);
    }
    
    return {
        goodman: {
            x: meanStress,
            y: goodmanLine
        },
        gerber: {
            x: meanStress,
            y: gerberLine
        },
        soderberg: {
            x: meanStress,
            y: soderbergLine
        },
        yield: {
            x: meanStress,
            y: yieldLine
        }
    };
}

function updateSafetyFactors(meanStress, stressAmplitude, ultimateStrength, yieldStrength, enduranceLimit) {
    // Calculate safety factors for each criterion
    
    // Goodman safety factor
    const goodmanSF = calculateSafetyFactor(
        meanStress, stressAmplitude,
        function(sm) { return enduranceLimit * (1 - sm / ultimateStrength); }
    );
    
    // Gerber safety factor
    const gerberSF = calculateSafetyFactor(
        meanStress, stressAmplitude,
        function(sm) { return enduranceLimit * (1 - Math.pow(sm / ultimateStrength, 2)); }
    );
    
    // Soderberg safety factor
    const soderbergSF = calculateSafetyFactor(
        meanStress, stressAmplitude,
        function(sm) { return enduranceLimit * (1 - sm / yieldStrength); }
    );
    
    document.getElementById('goodman-sf').textContent = goodmanSF.toFixed(2);
    document.getElementById('gerber-sf').textContent = gerberSF.toFixed(2);
    document.getElementById('soderberg-sf').textContent = soderbergSF.toFixed(2);
    
    document.getElementById('ultimate-strength-value').textContent = ultimateStrength;
    document.getElementById('yield-strength-value').textContent = yieldStrength;
    document.getElementById('endurance-limit-input-value').textContent = enduranceLimit;
    document.getElementById('point-mean-stress-value').textContent = meanStress;
    document.getElementById('point-stress-amplitude-value').textContent = stressAmplitude;
}

function calculateSafetyFactor(meanStress, stressAmplitude, curveFunction) {
    // Approximate safety factor by finding the intersection of the line from origin
    // to the assessment point with the failure curve
    
    if (meanStress === 0) {
        return stressAmplitude > 0 ? curveFunction(0) / stressAmplitude : Infinity;
    }
    
    const slope = stressAmplitude / meanStress;
    let sf = 1.0;
    
    // Simple bisection method to find where the line intersects the curve
    let lowerSF = 0.1;
    let upperSF = 10.0;
    
    for (let i = 0; i < 20; i++) {  // 20 iterations should be sufficient for precision
        sf = (lowerSF + upperSF) / 2;
        const sm = sf * meanStress;
        const sa = sf * stressAmplitude;
        const curveValue = curveFunction(sm);
        
        if (Math.abs(curveValue - sa) < 0.1) {
            break;
        } else if (curveValue > sa) {
            lowerSF = sf;
        } else {
            upperSF = sf;
        }
    }
    
    return sf;
}

function setupHaighDiagramControls() {
    // Set up event listeners for the sliders
    document.getElementById('ultimate-strength').addEventListener('input', function() {
        const ultimateStrength = parseFloat(this.value);
        const yieldStrength = parseFloat(document.getElementById('yield-strength').value);
        
        // Ensure yield strength is less than ultimate strength
        if (yieldStrength > ultimateStrength) {
            document.getElementById('yield-strength').value = ultimateStrength;
        }
        
        updateHaighDiagram();
    });
    
    document.getElementById('yield-strength').addEventListener('input', function() {
        const yieldStrength = parseFloat(this.value);
        const ultimateStrength = parseFloat(document.getElementById('ultimate-strength').value);
        
        // Ensure yield strength is less than ultimate strength
        if (yieldStrength > ultimateStrength) {
            document.getElementById('ultimate-strength').value = yieldStrength;
        }
        
        updateHaighDiagram();
    });
    
    document.getElementById('endurance-limit-input').addEventListener('input', function() {
        updateHaighDiagram();
    });
    
    document.getElementById('point-mean-stress').addEventListener('input', function() {
        updateHaighDiagram();
    });
    
    document.getElementById('point-stress-amplitude').addEventListener('input', function() {
        updateHaighDiagram();
    });
}

// Cumulative Damage Plot
function initDamagePlot() {
    const stressAmp1 = parseFloat(document.getElementById('stress-amp-1').value);
    const cycles1 = parseFloat(document.getElementById('cycles-1').value);
    const stressAmp2 = parseFloat(document.getElementById('stress-amp-2').value);
    const cycles2 = parseFloat(document.getElementById('cycles-2').value);
    const stressAmp3 = parseFloat(document.getElementById('stress-amp-3').value);
    const cycles3 = parseFloat(document.getElementById('cycles-3').value);
    
    // Generate data for damage plot
    const data = generateDamagePlotData(stressAmp1, cycles1, stressAmp2, cycles2, stressAmp3, cycles3);
    
    // Create initial plot
    damagePlot = Plotly.newPlot('damage-plot', [{
        values: data.damageValues,
        labels: data.damageLabels,
        type: 'pie',
        hole: 0.3,
        textinfo: 'label+percent',
        marker: {
            colors: data.damageColors
        },
        textfont: {
            size: 14
        }
    }], {
        title: 'Fatigue Damage Distribution',
        margin: {
            l: 40,
            r: 40,
            t: 50,
            b: 40
        }
    }, {
        responsive: true
    });
    
    updateDamageResults(data.totalDamage);
}

function updateDamagePlot() {
    const stressAmp1 = parseFloat(document.getElementById('stress-amp-1').value);
    const cycles1 = parseFloat(document.getElementById('cycles-1').value);
    const stressAmp2 = parseFloat(document.getElementById('stress-amp-2').value);
    const cycles2 = parseFloat(document.getElementById('cycles-2').value);
    const stressAmp3 = parseFloat(document.getElementById('stress-amp-3').value);
    const cycles3 = parseFloat(document.getElementById('cycles-3').value);
    
    // Generate data for updated damage plot
    const data = generateDamagePlotData(stressAmp1, cycles1, stressAmp2, cycles2, stressAmp3, cycles3);
    
    // Update plot data
    Plotly.update('damage-plot', {
        values: [data.damageValues],
        labels: [data.damageLabels],
        marker: {
            colors: [data.damageColors]
        }
    }, {});
    
    updateDamageResults(data.totalDamage);
}

function generateDamagePlotData(stressAmp1, cycles1, stressAmp2, cycles2, stressAmp3, cycles3) {
    // Calculate cycles to failure for each stress level using Basquin equation
    // Assuming material properties (using steel-1045 as default)
    const sigmaF = 1120;  // Fatigue strength coefficient (MPa)
    const b = -0.092;     // Fatigue strength exponent
    
    const cyclesTo1 = calculateCyclesToFailure(stressAmp1, sigmaF, b);
    const cyclesTo2 = calculateCyclesToFailure(stressAmp2, sigmaF, b);
    const cyclesTo3 = calculateCyclesToFailure(stressAmp3, sigmaF, b);
    
    // Calculate damage fractions
    const damage1 = cycles1 / cyclesTo1;
    const damage2 = cycles2 / cyclesTo2;
    const damage3 = cycles3 / cyclesTo3;
    const totalDamage = damage1 + damage2 + damage3;
    const remainingLife = Math.max(0, 1 - totalDamage);
    
    // Prepare data for pie chart
    const damageValues = [damage1, damage2, damage3];
    const damageLabels = [
        'Block 1: ' + stressAmp1 + ' MPa',
        'Block 2: ' + stressAmp2 + ' MPa',
        'Block 3: ' + stressAmp3 + ' MPa'
    ];
    
    if (remainingLife > 0) {
        damageValues.push(remainingLife);
        damageLabels.push('Remaining Life');
    }
    
    // Colors for the pie chart
    const damageColors = ['#FF6384', '#36A2EB', '#FFCE56'];
    if (remainingLife > 0) {
        damageColors.push('#4BC0C0');
    }
    
    return {
        damageValues: damageValues,
        damageLabels: damageLabels,
        damageColors: damageColors,
        totalDamage: totalDamage
    };
}

function calculateCyclesToFailure(stressAmplitude, sigmaF, b) {
    // Basquin's equation: σa = σ'f (2Nf)^b
    // Rearranged to solve for Nf
    return Math.pow(stressAmplitude / sigmaF, 1 / b) / 2;
}

function updateDamageResults(totalDamage) {
    document.getElementById('total-damage').textContent = totalDamage.toFixed(2);
    document.getElementById('remaining-life').textContent = Math.max(0, (1 - totalDamage) * 100).toFixed(0) + '%';
    
    const statusElement = document.getElementById('damage-status');
    if (totalDamage >= 1) {
        statusElement.textContent = 'Failure Expected';
        statusElement.style.color = '#FF6384';  // Red
    } else if (totalDamage >= 0.7) {
        statusElement.textContent = 'Warning';
        statusElement.style.color = '#FFCE56';  // Yellow
    } else {
        statusElement.textContent = 'Safe';
        statusElement.style.color = '#4BC0C0';  // Green
    }
    
    document.getElementById('stress-amp-1-value').textContent = document.getElementById('stress-amp-1').value;
    document.getElementById('cycles-1-value').textContent = document.getElementById('cycles-1').value;
    document.getElementById('stress-amp-2-value').textContent = document.getElementById('stress-amp-2').value;
    document.getElementById('cycles-2-value').textContent = document.getElementById('cycles-2').value;
    document.getElementById('stress-amp-3-value').textContent = document.getElementById('stress-amp-3').value;
    document.getElementById('cycles-3-value').textContent = document.getElementById('cycles-3').value;
}

function setupDamageControls() {
    // Set up event listeners for the sliders
    document.getElementById('stress-amp-1').addEventListener('input', function() {
        updateDamagePlot();
    });
    
    document.getElementById('cycles-1').addEventListener('input', function() {
        updateDamagePlot();
    });
    
    document.getElementById('stress-amp-2').addEventListener('input', function() {
        updateDamagePlot();
    });
    
    document.getElementById('cycles-2').addEventListener('input', function() {
        updateDamagePlot();
    });
    
    document.getElementById('stress-amp-3').addEventListener('input', function() {
        updateDamagePlot();
    });
    
    document.getElementById('cycles-3').addEventListener('input', function() {
        updateDamagePlot();
    });
}