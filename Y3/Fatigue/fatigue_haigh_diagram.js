// Haigh Diagram Module

// Initialize Haigh Diagram plot
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

// Update Haigh Diagram plot with new parameters
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

// Generate data for the Haigh Diagram plot
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

// Update safety factors based on assessment point
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
    document.getElementById('point-stress-amplitude-value').textContent = pointStressAmplitude;
}

// Calculate safety factor for a given criterion
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

// Set up event listeners for the Haigh diagram controls
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