// Stress-Time History Module

// Initialize Stress-Time plot
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

// Update Stress-Time plot with new parameters
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

// Generate data for the Stress-Time plot
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

// Update displayed stress parameters based on slider values
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

// Set up event listeners for the stress-time controls
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