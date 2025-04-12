// Function to generate an involute curve for gear teeth profile

function generateInvolute(baseRadius, angle, numPoints) {
    let points = [];
    
    for (let i = 0; i < numPoints; i++) {
        // Parametric equation for the involute of a circle
        // t is the angle parameter, increasing from 0
        let t = i / (numPoints - 1) * Math.PI / 2;
        
        // The radius at angle t
        let r = baseRadius * Math.sqrt(1 + t * t);
        
        // The angle of the point on the involute
        let theta = angle + t;
        
        // Convert to Cartesian coordinates
        let x = r * Math.cos(theta);
        let y = r * Math.sin(theta);
        
        points.push({ x: x, y: y });
    }
    
    return points;
}

// Function to create a complete gear tooth profile based on involute curves
function createToothProfile(baseRadius, toothThickness, angle) {
    // Generate left and right involute curves
    let leftInvolute = generateInvolute(baseRadius, angle - toothThickness / 2, 20);
    let rightInvolute = generateInvolute(baseRadius, angle + toothThickness / 2, 20);
    
    // Combine the points to form a complete tooth profile
    let profile = [];
    
    // Add left involute (reversed)
    for (let i = leftInvolute.length - 1; i >= 0; i--) {
        profile.push(leftInvolute[i]);
    }
    
    // Add right involute
    for (let i = 0; i < rightInvolute.length; i++) {
        profile.push(rightInvolute[i]);
    }
    
    return profile;
}

// Function to create a complete gear with multiple teeth
function createGear(centerX, centerY, numTeeth, moduleSize, pressureAngle) {
    // Calculate gear parameters
    const pitchDiameter = numTeeth * moduleSize;
    const pitchRadius = pitchDiameter / 2;
    const baseRadius = pitchRadius * Math.cos(pressureAngle * Math.PI / 180);
    const addendum = moduleSize;
    const dedendum = 1.25 * moduleSize;
    const outerRadius = pitchRadius + addendum;
    const rootRadius = pitchRadius - dedendum;
    
    // Calculate tooth thickness at the pitch circle
    const toothThickness = (Math.PI * pitchDiameter) / (2 * numTeeth);
    
    // Create an array to store all teeth profiles
    let gearProfile = {
        center: { x: centerX, y: centerY },
        pitchRadius: pitchRadius,
        baseRadius: baseRadius,
        outerRadius: outerRadius,
        rootRadius: rootRadius,
        teeth: []
    };
    
    // Generate each tooth
    for (let i = 0; i < numTeeth; i++) {
        let angle = (i * 2 * Math.PI) / numTeeth;
        let toothProfile = createToothProfile(baseRadius, toothThickness / baseRadius, angle);
        gearProfile.teeth.push(toothProfile);
    }
    
    return gearProfile;
}

// Function to draw a gear on a canvas context
function drawGear(ctx, gear, rotation = 0) {
    ctx.save();
    
    // Translate to the gear center
    ctx.translate(gear.center.x, gear.center.y);
    
    // Apply rotation
    ctx.rotate(rotation);
    
    // Draw pitch circle (for reference)
    ctx.beginPath();
    ctx.arc(0, 0, gear.pitchRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(200, 0, 0, 0.5)';
    ctx.stroke();
    
    // Draw base circle (for reference)
    ctx.beginPath();
    ctx.arc(0, 0, gear.baseRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(0, 200, 0, 0.5)';
    ctx.stroke();
    
    // Draw root circle
    ctx.beginPath();
    ctx.arc(0, 0, gear.rootRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.fill();
    
    // Draw outer circle and teeth
    ctx.beginPath();
    
    // Start at the root circle
    ctx.moveTo(gear.rootRadius, 0);
    ctx.arc(0, 0, gear.rootRadius, 0, 2 * Math.PI);
    
    // Draw each tooth
    for (let tooth of gear.teeth) {
        ctx.beginPath();
        
        // Start with root circle at the tooth position
        let startAngle = Math.atan2(tooth[0].y, tooth[0].x);
        let endAngle = Math.atan2(tooth[tooth.length - 1].y, tooth[tooth.length - 1].x);
        
        // Draw arc along root circle from previous tooth to this tooth
        ctx.arc(0, 0, gear.rootRadius, startAngle, endAngle);
        
        // Draw the tooth profile
        for (let point of tooth) {
            ctx.lineTo(point.x, point.y);
        }
        
        // Close the tooth profile back to the root circle
        ctx.lineTo(gear.rootRadius * Math.cos(endAngle), gear.rootRadius * Math.sin(endAngle));
        
        ctx.fillStyle = 'rgba(150, 150, 150, 1)';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }
    
    // Draw center
    ctx.beginPath();
    ctx.arc(0, 0, gear.baseRadius * 0.2, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
    
    ctx.restore();
}

// Function to simulate the meshing of two gears
function simulateGearMeshing(canvas, gear1, gear2, animationSpeed) {
    const ctx = canvas.getContext('2d');
    let rotation1 = 0;
    let rotation2 = 0;
    
    // Calculate gear ratio based on number of teeth
    const ratio = gear2.teeth.length / gear1.teeth.length;
    
    function animate() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update rotations
        rotation1 += animationSpeed;
        rotation2 -= animationSpeed * ratio; // Opposite direction, scaled by ratio
        
        // Draw gears
        drawGear(ctx, gear1, rotation1);
        drawGear(ctx, gear2, rotation2);
        
        // Draw connecting line to show meshing point
        ctx.beginPath();
        ctx.moveTo(gear1.center.x, gear1.center.y);
        ctx.lineTo(gear2.center.x, gear2.center.y);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.stroke();
        
        // Continue animation
        requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
}

// Function to demonstrate the generation of an involute curve
function demonstrateInvoluteGeneration(canvas, baseRadius) {
    const ctx = canvas.getContext('2d');
    let angle = 0;
    
    function animate() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Center of the canvas
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Draw base circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'blue';
        ctx.stroke();
        
        // Increase the angle
        angle += 0.01;
        if (angle > 2 * Math.PI) {
            angle = 0;
        }
        
        // Draw the unwrapping string
        let tangentAngle = angle;
        let tangentX = centerX + baseRadius * Math.cos(tangentAngle);
        let tangentY = centerY + baseRadius * Math.sin(tangentAngle);
        
        // Calculate the length of unwrapped string
        let stringLength = baseRadius * angle;
        
        // Calculate the end point of the string (tangent to circle)
        let endX = tangentX + stringLength * Math.cos(tangentAngle + Math.PI/2);
        let endY = tangentY + stringLength * Math.sin(tangentAngle + Math.PI/2);
        
        // Draw the string
        ctx.beginPath();
        ctx.moveTo(tangentX, tangentY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'red';
        ctx.stroke();
        
        // Draw the point at the end of the string (involute point)
        ctx.beginPath();
        ctx.arc(endX, endY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
        
        // Draw the full involute curve
        ctx.beginPath();
        for (let t = 0; t <= angle; t += 0.05) {
            let r = baseRadius * Math.sqrt(1 + t * t);
            let theta = t;
            let x = centerX + r * Math.cos(theta);
            let y = centerY + r * Math.sin(theta);
            
            if (t === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.strokeStyle = 'green';
        ctx.stroke();
        
        // Add explanation text
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.fillText('Base Circle', centerX + baseRadius + 10, centerY);
        ctx.fillText('Unwrapping String', tangentX + 10, tangentY - 10);
        ctx.fillText('Involute Point', endX + 10, endY);
        ctx.fillText('Involute Curve', centerX + baseRadius * 1.5, centerY + baseRadius * 0.5);
        
        // Continue animation
        requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
}