// Cumulative Damage Module

// Initialize Damage plot
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

// Update Damage plot with new parameters
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

// Generate data for the Damage plot
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

// Calculate cycles to failure for a given stress amplitude
function calculateCyclesToFailure(stressAmplitude, sigmaF, b) {
    // Basquin's equation: σa = σ'f (2Nf)^b
    // Rearranged to solve for Nf
    return Math.pow(stressAmplitude / sigmaF, 1 / b) / 2;
}

// Update damage results display
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

// Set up event listeners for the damage controls
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