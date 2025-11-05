# Interactive Lecture Creation Guide
## Explorable Explanations Framework

**Version:** 1.0
**Last Updated:** November 5, 2025
**Framework:** Explorable Explanations for Engineering Education

---

## Table of Contents

1. [Introduction](#introduction)
2. [Framework Overview](#framework-overview)
3. [Getting Started](#getting-started)
4. [HTML Template Structure](#html-template-structure)
5. [Common CSS Classes Reference](#common-css-classes-reference)
6. [Common JavaScript Assets](#common-javascript-assets)
7. [External Libraries](#external-libraries)
8. [Creating Interactive Simulations](#creating-interactive-simulations)
9. [Practice Problems & Quizzes](#practice-problems--quizzes)
10. [Best Practices](#best-practices)
11. [Examples & Patterns](#examples--patterns)
12. [Troubleshooting](#troubleshooting)

---

## Introduction

This guide provides comprehensive documentation for creating new interactive engineering lectures using the Explorable Explanations framework. The framework is designed to combine:

- **Theoretical Teaching Content** - Clear explanations with mathematical equations
- **Interactive Simulations** - Visual, explorable demonstrations using p5.js
- **Practice Problems** - Worked examples with toggle solutions
- **Knowledge Check Quizzes** - Multiple-choice assessments with instant feedback
- **Engineering Applications** - Real-world context and use cases

### Philosophy

The framework follows these principles:
1. **Consistency** - All lectures share the same structure and styling
2. **Accessibility** - Responsive design that works on all devices
3. **Interactivity** - Learning by exploration and experimentation
4. **Maintainability** - Common CSS classes and JavaScript functions
5. **Extensibility** - Easy to add new content without reinventing the wheel

---

## Framework Overview

### File Structure
```
/Y[1-3]/[TopicName]/
├── [TopicName].html          # Main lecture file
├── sketch.js (optional)       # Separate p5.js sketch file
└── assets/ (optional)         # Topic-specific images/data

/assets/
├── css/
│   ├── main.css              # Core styling (374 lines)
│   ├── problems.css          # Practice problem styles
│   ├── quizzes.css           # Quiz styles
│   ├── simulations.css       # Simulation layouts (393 lines)
│   └── uicontrols.css        # Control panels & buttons (782 lines)
└── common/
    ├── footer.js             # Automatic footer generation
    ├── problems.js           # Problem solution toggles
    └── quizzes.js            # Quiz functionality
```

### Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **HTML5** | Document structure | Latest |
| **CSS3** | Styling and layout | Latest |
| **JavaScript** | Interactivity | ES6+ |
| **p5.js** | Canvas-based simulations | 1.4.0+ |
| **MathJax** | LaTeX equation rendering | 3.2.0 |
| **Plotly** | Charts and graphs (optional) | Latest |
| **Numeric.js** | Matrix operations (optional) | 1.2.6 |

---

## Getting Started

### Step 1: Choose Your Topic

Identify the engineering concept you want to teach. Good topics for this framework:
- Have visual/spatial components
- Can be demonstrated through simulation
- Benefit from parameter exploration
- Include mathematical relationships

### Step 2: Plan Your Content

Every lecture follows this 6-section structure:

1. **Teaching Content** - Theory, equations, explanations
2. **Interactive Simulation(s)** - Visual demonstrations with controls
3. **Engineering Applications** - Real-world use cases
4. **Summary of Key Equations** - Quick reference of main formulas
5. **Practice Problems** - Worked examples with solutions
6. **Knowledge Check Quiz** - Multiple-choice assessment

### Step 3: Copy the Template

Start with the template structure (see next section) and customize for your topic.

---

## HTML Template Structure

### Basic Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Topic - Interactive Lecture</title>

    <!-- External CSS (always in this order) -->
    <link rel="stylesheet" href="/assets/css/main.css">
    <link rel="stylesheet" href="/assets/css/problems.css">
    <link rel="stylesheet" href="/assets/css/quizzes.css">
    <link rel="stylesheet" href="/assets/css/simulations.css">
    <link rel="stylesheet" href="/assets/css/uicontrols.css">

    <!-- MathJax for LaTeX equations -->
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6" defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.0/es5/tex-mml-chtml.js"></script>

    <!-- p5.js for interactive simulations -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>

    <!-- Page-specific styles (only if necessary) -->
    <style>
        /* Keep this minimal - use common classes when possible */
    </style>
</head>

<body>
    <!-- Header Section -->
    <header>
        <h1>Your Topic Title</h1>
        <p class="subtitle">Interactive Lecture & Simulation</p>
    </header>

    <!-- Section 1: Teaching Content -->
    <div class="content-section">
        <h2>Understanding [Your Topic]</h2>
        <p>Introduction paragraph...</p>

        <div class="key-point">
            <p><strong>Core Insight:</strong> Main takeaway message...</p>
        </div>

        <h3>Theory and Equations</h3>
        <p>Explanation text...</p>

        <div class="equation-box">
            <p>\[F = ma\]</p>
            <p>Where:</p>
            <ul>
                <li>\(F\) = Force (N)</li>
                <li>\(m\) = Mass (kg)</li>
                <li>\(a\) = Acceleration (m/s²)</li>
            </ul>
        </div>
    </div>

    <!-- Section 2: Interactive Simulation -->
    <div class="simulation-container">
        <h2>Interactive Simulation</h2>
        <p>Instructions for using the simulation...</p>

        <!-- Control Panel -->
        <div class="controls-panel">
            <div class="controls-grid">
                <div class="slider-container">
                    <label for="param1">Parameter 1:</label>
                    <input type="range" id="param1" min="0" max="100" value="50">
                    <span id="param1-value" class="value-display">50</span>
                </div>
            </div>
        </div>

        <!-- Canvas Holder -->
        <div id="sketch-holder"></div>

        <!-- Simulation Controls -->
        <div id="button-container">
            <button id="start-btn">Start</button>
            <button id="reset-btn">Reset</button>
        </div>
    </div>

    <!-- Section 3: Engineering Applications -->
    <div class="content-section">
        <h2>Engineering Applications</h2>
        <ul>
            <li><strong>Application 1:</strong> Description...</li>
            <li><strong>Application 2:</strong> Description...</li>
        </ul>
    </div>

    <!-- Section 4: Summary of Key Equations -->
    <div class="content-section">
        <h2>Summary of Key Equations</h2>
        <div class="key-point">
            <h3>Key Takeaways</h3>
            <ol>
                <li><strong>Equation 1:</strong> \(F = ma\)</li>
                <li><strong>Equation 2:</strong> Description...</li>
            </ol>
        </div>
    </div>

    <!-- Section 5: Practice Problems -->
    <div class="content-section">
        <h2>Practice Problems</h2>

        <div class="practice-problems">
            <h3>Problem 1: Title</h3>
            <p>Problem statement...</p>

            <p class="toggle-section" onclick="toggleSolution('solution1')">Show Solution</p>
            <div id="solution1" class="hidden">
                <p><strong>Solution:</strong></p>
                <p>Step-by-step solution...</p>
            </div>
        </div>
    </div>

    <!-- Section 6: Knowledge Check Quiz -->
    <div class="quiz-container">
        <h2>Knowledge Check Quiz</h2>

        <div class="quiz-question">
            <p><strong>Question 1:</strong> What is the formula for force?</p>
            <label><input type="radio" name="q1" value="a"> F = mv</label><br>
            <label><input type="radio" name="q1" value="b"> F = ma</label><br>
            <label><input type="radio" name="q1" value="c"> F = m/a</label><br>
            <p id="q1-feedback" class="feedback"></p>
        </div>

        <button id="submit-quiz">Submit Quiz</button>
        <div id="quiz-results"></div>
    </div>

    <!-- Footer (auto-generated) -->
    <footer>
        <script src="/assets/common/footer.js"></script>
    </footer>

    <!-- Common JavaScript Functions -->
    <script src="/assets/common/problems.js"></script>
    <script src="/assets/common/quizzes.js"></script>

    <!-- Page-specific JavaScript -->
    <script>
        // Your simulation code here
        document.getElementById('submit-quiz').addEventListener('click', function() {
            const answers = {
                q1: 'b'  // Correct answer
            };

            let score = 0;
            let totalQuestions = Object.keys(answers).length;
            let resultsHTML = '<h3>Quiz Results:</h3>';

            for (let question in answers) {
                const selectedOption = document.querySelector(`input[name="${question}"]:checked`);
                const correctAnswer = answers[question];

                if (selectedOption && selectedOption.value === correctAnswer) {
                    score++;
                    resultsHTML += `<p style="color: #28a745; font-weight: bold;">${question.toUpperCase()}: Correct! ✓</p>`;
                } else {
                    resultsHTML += `<p style="color: #dc3545; font-weight: bold;">${question.toUpperCase()}: Incorrect ✗</p>`;
                }
            }

            const percentage = ((score / totalQuestions) * 100).toFixed(0);
            resultsHTML = `<p style="font-size: 1.2em; font-weight: bold;">You scored ${score} out of ${totalQuestions} (${percentage}%)</p>` + resultsHTML;

            document.getElementById('quiz-results').innerHTML = resultsHTML;
        });
    </script>
</body>
</html>
```

---

## Common CSS Classes Reference

### Layout & Structure Classes

#### Container Classes
```css
.content-section        /* Main content container with white background */
.simulation-container   /* Container for simulation sections */
.simulation-section     /* Alternative to simulation-container */
.container             /* Generic grid container (2 columns) */
```

#### Panel Classes
```css
.controls-panel        /* Panel for simulation controls */
.sim-left-panel       /* Left side panel in split layout */
.sim-right-panel      /* Right side panel in split layout */
```

### Control & UI Classes

#### Grid Layouts for Controls
```css
.controls-grid         /* 3-column responsive grid (default) */
.controls-grid-2col    /* 2-column grid layout */
.controls-grid-3col    /* Explicit 3-column grid layout */
.controls-grid-white   /* Grid with white background */
```

**Usage Example:**
```html
<div class="controls-grid">
    <div class="slider-container">
        <label for="mass">Mass (kg):</label>
        <input type="range" id="mass" min="1" max="100" value="50">
        <span id="mass-value" class="value-display">50</span>
    </div>
    <div class="slider-container">
        <label for="velocity">Velocity (m/s):</label>
        <input type="range" id="velocity" min="0" max="50" value="25">
        <span id="velocity-value" class="value-display">25</span>
    </div>
</div>
```

#### Slider Container
```css
.slider-container      /* Container for individual slider control */
.slider-row           /* Horizontal row for slider + value display */
```

**Structure:**
```html
<div class="slider-container">
    <label for="parameter">Parameter Name:</label>
    <div class="slider-row">
        <input type="range" id="parameter" min="0" max="100" value="50">
        <span id="parameter-value" class="value-display">50</span>
    </div>
</div>
```

#### Button States (Modifiers)
```css
.control-button        /* Base button class */
.control-button.active /* Active/selected state */
.control-button.toggled /* Toggled state */
.control-button.paused  /* Paused state (red) */
.control-button.playing /* Playing state */
.control-button.running /* Running state */
.control-button.muted   /* Muted state */
```

**Usage Example:**
```html
<button class="control-button playing" id="pause-btn">Pause</button>
<button class="control-button active">Mode A</button>
<button class="control-button">Mode B</button>
```

#### Section Inputs
```css
.section-inputs        /* Container for section property inputs */
.section-selector      /* Dropdown for selecting sections */
.dimension-inputs      /* Container for dimension input fields */
```

### Content Presentation Classes

#### Information Boxes
```css
.equation-box          /* For displaying equations (gray with gold left border) */
.key-point            /* For highlighting key insights (yellow with warning border) */
```

#### Results Panels
```css
.results-panel         /* Default yellow results panel */
.results-panel-blue    /* Blue variant for information */
.results-panel-green   /* Green variant for success */
```

**Usage Example:**
```html
<div class="results-panel">
    <p><strong>Result:</strong> Force = 500 N</p>
</div>

<div class="results-panel-green">
    <p><strong>Success!</strong> Calculation completed.</p>
</div>
```

#### Info Box Variants
```css
.info-box-golden       /* Golden box with full border */
.info-box-blue         /* Blue info box */
.info-box-green        /* Green info box */
```

#### Note Boxes
```css
.iso-note             /* For ISO standards and references */
.standard-note        /* For standard notes */
.reference-note       /* For reference citations */
```

### Status & Feedback Classes

#### Status Text Colors
```css
.status-success        /* Green text, bold */
.status-error          /* Red text, bold */
.status-failure        /* Red text, bold (alias) */
.status-warning        /* Yellow text, bold */
.status-info          /* Blue text, bold */
.status-balanced       /* Green text (for balanced systems) */
.status-unbalanced     /* Red text (for unbalanced systems) */
```

**Usage Example:**
```html
<p class="status-success">✓ Equilibrium achieved</p>
<p class="status-error">✗ System unstable</p>
<p class="status-warning">⚠ Approaching critical value</p>
```

### Chip/Badge Classes

#### Base Chip
```css
.chip                  /* Base chip styling */
```

#### Chip Color Variants
```css
.chip-blue            /* Blue chip */
.chip-red             /* Red chip */
.chip-green           /* Green chip */
.chip-gold            /* Gold/yellow chip */
.chip-yellow          /* Yellow chip (alias) */
.chip-grey            /* Grey chip */
.chip-gray            /* Gray chip (alias) */
.chip-orange          /* Orange chip */
.chip-purple          /* Purple chip */
```

**Usage Example:**
```html
<span class="chip chip-blue">Elastic</span>
<span class="chip chip-red">Plastic</span>
<span class="chip chip-green">Fully Plastic</span>
```

### Simulation Component Classes

#### Diagram Legends
```css
.diagram-legend        /* Container for diagram legend */
.legend-item          /* Individual legend item */
.legend-color         /* Color indicator in legend */
```

**Structure:**
```html
<div class="diagram-legend">
    <div class="legend-item">
        <div class="legend-color" style="background-color: red;"></div>
        <span>Force Vector</span>
    </div>
    <div class="legend-item">
        <div class="legend-color" style="background-color: blue;"></div>
        <span>Displacement</span>
    </div>
</div>
```

#### Simulation Wrappers
```css
.simulation-wrapper       /* Default simulation container */
.simulation-wrapper-white /* White background variant */
.simulation-wrapper-full  /* Full-width variant */
```

#### Charts & Plots
```css
.chart-container          /* Container for charts */
.plot-container           /* Container for plots */
.plots-grid              /* Grid layout for multiple plots */
.plots-flex              /* Flex layout for plots */
```

#### Type Selectors
```css
.type-selector           /* Container for type selection buttons */
.type-button            /* Individual type button */
.type-button.active     /* Active type button */
```

**Usage Example:**
```html
<div class="type-selector">
    <button class="type-button active">Type A</button>
    <button class="type-button">Type B</button>
    <button class="type-button">Type C</button>
</div>
```

#### Stage & Step Cards
```css
.stage-cards             /* Container for stage cards */
.stress-stages           /* Container for stress stage cards */
.stage-card             /* Individual stage card */
```

**Usage Example:**
```html
<div class="stress-stages">
    <div class="stage-card">
        <h3>Stage 1: Elastic <span class="chip chip-blue">σ < σ_y</span></h3>
        <div id="stage1-canvas"></div>
    </div>
    <div class="stage-card">
        <h3>Stage 2: Yielding <span class="chip chip-orange">σ = σ_y</span></h3>
        <div id="stage2-canvas"></div>
    </div>
</div>
```

#### Special Components
```css
.failure-criteria-chart  /* For failure criteria visualizations */
.stress-blocks-container /* Container for stress blocks */
.stress-block           /* Individual stress block */
```

### Value Display Classes

```css
.value-display          /* Small monospace display (0.9em) */
.value-display-large    /* Large monospace display (1.2em, bold) */
```

**Usage Example:**
```html
<label for="force">Force:</label>
<input type="range" id="force" min="0" max="1000" value="500">
<span id="force-value" class="value-display">500 N</span>
```

### Responsive Utility Classes

```css
.hide-mobile           /* Hidden on screens < 768px */
.hide-desktop          /* Hidden on screens > 768px */
.show-mobile           /* Only visible on screens < 768px */
```

**Usage Example:**
```html
<div class="hide-mobile">
    <p>This detailed explanation only shows on desktop</p>
</div>

<div class="show-mobile">
    <p>Simplified explanation for mobile</p>
</div>
```

### Practice Problems & Quiz Classes

```css
.practice-problems     /* Container for practice problems */
.toggle-section       /* Clickable text to toggle solutions */
.hidden              /* Hides element (display: none) */

.quiz-container       /* Container for quiz section */
.quiz-question        /* Individual quiz question */
.feedback            /* Feedback message after answer */
.correct             /* Correct answer feedback (green) */
.incorrect           /* Incorrect answer feedback (red) */
```

---

## Common JavaScript Assets

### 1. Footer.js
**Location:** `/assets/common/footer.js`
**Purpose:** Automatically generates consistent footer across all pages

**Auto-generated content:**
- Copyright notice
- Institution information
- Navigation links: Home | About | About the Author | Contact
- Contact information

**Usage:** Simply include the script tag in your footer:
```html
<footer>
    <script src="/assets/common/footer.js"></script>
</footer>
```

No additional JavaScript required - footer content is automatically inserted.

---

### 2. Problems.js
**Location:** `/assets/common/problems.js`
**Purpose:** Common functions for practice problems

#### Available Functions

##### `toggleSolution(id)`
Toggles visibility of problem solutions.

**Parameters:**
- `id` (string) - The ID of the solution element to toggle

**Usage:**
```html
<p class="toggle-section" onclick="toggleSolution('solution1')">Show Solution</p>
<div id="solution1" class="hidden">
    <p><strong>Solution:</strong></p>
    <p>Step-by-step explanation...</p>
</div>
```

##### `checkNumericAnswer(userAnswer, correctAnswer, tolerance = 0.01)`
Checks if a numeric answer is within acceptable tolerance.

**Parameters:**
- `userAnswer` (number) - User's submitted answer
- `correctAnswer` (number) - Correct answer value
- `tolerance` (number) - Acceptable tolerance (default 1%)

**Returns:** Boolean (true if within tolerance)

**Usage:**
```javascript
const userInput = parseFloat(document.getElementById('answer-input').value);
const isCorrect = checkNumericAnswer(userInput, 500, 0.05); // 5% tolerance

if (isCorrect) {
    console.log("Correct!");
}
```

##### `displayFeedback(feedbackId, isCorrect, message = null)`
Displays color-coded feedback for problem answers.

**Parameters:**
- `feedbackId` (string) - ID of feedback element
- `isCorrect` (boolean) - Whether answer is correct
- `message` (string, optional) - Custom feedback message

**Usage:**
```javascript
displayFeedback('problem1-feedback', true, "Excellent! Your calculation is correct.");
displayFeedback('problem2-feedback', false, "Not quite. Check your units.");
```

##### `formatNumber(value, decimals = 2)`
Formats numbers for display with specified decimal places.

**Parameters:**
- `value` (number) - Number to format
- `decimals` (number) - Decimal places (default 2)

**Returns:** String

**Usage:**
```javascript
const pi = 3.14159265;
console.log(formatNumber(pi, 4)); // "3.1416"
console.log(formatNumber(1234.5678)); // "1234.57"
```

##### `parseUserInput(input)`
Parses user input, handling various formats.

**Parameters:**
- `input` (string) - User's input string

**Returns:** Number or null if invalid

**Usage:**
```javascript
parseUserInput("1,234.56");  // Returns 1234.56
parseUserInput("  500  ");   // Returns 500
parseUserInput("abc");       // Returns null
```

---

### 3. Quizzes.js
**Location:** `/assets/common/quizzes.js`
**Purpose:** Common functions for quizzes and assessments

#### Available Functions

##### `checkAnswer(questionName, correctAnswer, feedbackId)`
Checks a single quiz question and provides immediate feedback.

**Parameters:**
- `questionName` (string) - Name attribute of radio button group
- `correctAnswer` (string) - Correct answer value
- `feedbackId` (string) - ID of feedback element

**Usage:**
```html
<div class="quiz-question">
    <p><strong>Q1:</strong> What is 2 + 2?</p>
    <label><input type="radio" name="q1" value="a"> 3</label><br>
    <label><input type="radio" name="q1" value="b"> 4</label><br>
    <label><input type="radio" name="q1" value="c"> 5</label><br>
    <button onclick="checkAnswer('q1', 'b', 'q1-feedback')">Check</button>
    <p id="q1-feedback" class="feedback"></p>
</div>
```

##### `submitQuiz(questions, resultsId)`
Submits entire quiz and calculates score with detailed feedback.

**Parameters:**
- `questions` (Array) - Array of question objects: `[{name: 'q1', correctAnswer: 'b'}, ...]`
- `resultsId` (string) - ID of results display element

**Usage:**
```javascript
document.getElementById('submit-quiz').addEventListener('click', function() {
    const questions = [
        {name: 'q1', correctAnswer: 'b'},
        {name: 'q2', correctAnswer: 'c'},
        {name: 'q3', correctAnswer: 'a'}
    ];
    submitQuiz(questions, 'quiz-results');
});
```

**Automatic Features:**
- Calculates percentage score
- Shows which questions were correct/incorrect
- Provides encouraging feedback based on score
- Identifies unanswered questions

##### `resetQuiz(questionNames)`
Clears all quiz selections and feedback.

**Parameters:**
- `questionNames` (Array) - Array of question name attributes

**Usage:**
```javascript
document.getElementById('reset-quiz').addEventListener('click', function() {
    resetQuiz(['q1', 'q2', 'q3']);
});
```

##### `setupQuizQuestion(questionName, correctAnswer, feedbackId, buttonId)`
Adds event listener to a check answer button.

**Parameters:**
- `questionName` (string) - Name of radio button group
- `correctAnswer` (string) - Correct answer value
- `feedbackId` (string) - ID of feedback element
- `buttonId` (string) - ID of check button

**Usage:**
```javascript
// Call after DOM loads
setupQuizQuestion('q1', 'b', 'q1-feedback', 'check-q1');
```

---

## External Libraries

### Required Libraries

#### 1. MathJax (Version 3.2.0+)
**Purpose:** Renders LaTeX mathematical equations
**CDN:** `https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.0/es5/tex-mml-chtml.js`

**Include in `<head>`:**
```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.0/es5/tex-mml-chtml.js"></script>
```

**Usage in HTML:**
```html
<!-- Inline equation -->
<p>The formula is \(F = ma\) where force equals mass times acceleration.</p>

<!-- Display equation (centered block) -->
<p>\[E = mc^2\]</p>

<!-- Equation in equation-box -->
<div class="equation-box">
    <p>\[\sigma = \frac{F}{A}\]</p>
    <p>Where:</p>
    <ul>
        <li>\(\sigma\) = Stress (Pa)</li>
        <li>\(F\) = Force (N)</li>
        <li>\(A\) = Cross-sectional area (m²)</li>
    </ul>
</div>
```

**Common LaTeX Symbols:**
```latex
\alpha \beta \gamma \delta          % Greek letters
\sigma \tau \epsilon \omega         % More Greek
\frac{a}{b}                         % Fractions
\sqrt{x}                            % Square root
x^2  x_i                           % Superscript, subscript
\sum_{i=1}^{n}                      % Summation
\int_{a}^{b}                        % Integral
\vec{F}  \dot{x}  \ddot{x}         % Vectors, derivatives
\mathbf{M}  \mathbf{K}             % Bold matrices
\begin{bmatrix}                     % Matrix
  a & b \\
  c & d
\end{bmatrix}
```

---

#### 2. p5.js (Version 1.4.0+)
**Purpose:** Canvas-based interactive animations and simulations
**CDN:** `https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js`

**Include in `<head>`:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
```

**Basic Sketch Structure:**
```javascript
let sketch = new p5(function(p) {
    // Sketch variables
    let x = 0;
    let y = 0;

    // Setup runs once
    p.setup = function() {
        p.createCanvas(800, 600);
        p.background(255);
    };

    // Draw runs continuously
    p.draw = function() {
        p.background(255); // Clear canvas

        // Draw something
        p.fill(0);
        p.ellipse(x, y, 50, 50);

        // Update position
        x += 1;
        if (x > p.width) x = 0;
    };

}, 'sketch-holder'); // Attach to specific div
```

**Common p5.js Functions:**
```javascript
// Canvas
p.createCanvas(width, height)
p.background(color)
p.clear()

// Shapes
p.rect(x, y, width, height)
p.ellipse(x, y, width, height)
p.line(x1, y1, x2, y2)
p.point(x, y)
p.triangle(x1, y1, x2, y2, x3, y3)

// Styling
p.fill(r, g, b)          // Fill color
p.stroke(r, g, b)        // Stroke color
p.strokeWeight(weight)   // Line thickness
p.noFill()              // No fill
p.noStroke()            // No stroke

// Text
p.text(string, x, y)
p.textSize(size)
p.textAlign(p.CENTER, p.CENTER)

// Transforms
p.translate(x, y)
p.rotate(angle)
p.scale(factor)
p.push()  // Save transform state
p.pop()   // Restore transform state

// Math
p.map(value, start1, stop1, start2, stop2)
p.constrain(value, min, max)
p.dist(x1, y1, x2, y2)
p.random(min, max)

// Time
p.frameRate(fps)
p.frameCount  // Number of frames drawn
```

---

### Optional Libraries

#### 3. Plotly.js (Latest)
**Purpose:** Interactive charts and graphs
**CDN:** `https://cdn.plot.ly/plotly-latest.min.js`

**Usage:**
```javascript
// Create a line plot
const trace = {
    x: [0, 1, 2, 3, 4],
    y: [0, 1, 4, 9, 16],
    type: 'scatter',
    mode: 'lines+markers',
    name: 'y = x²'
};

const layout = {
    title: 'Parabola',
    xaxis: { title: 'x' },
    yaxis: { title: 'y' }
};

Plotly.newPlot('chart-container', [trace], layout);
```

**When to use:** Complex graphs, 3D plots, data visualization

---

#### 4. Numeric.js (Version 1.2.6)
**Purpose:** Matrix operations and numerical computation
**CDN:** `https://cdnjs.cloudflare.com/ajax/libs/numeric/1.2.6/numeric.min.js`

**Usage:**
```javascript
// Matrix multiplication
const A = [[1, 2], [3, 4]];
const B = [[5, 6], [7, 8]];
const C = numeric.dot(A, B);

// Eigenvalues and eigenvectors
const M = [[4, 1], [2, 3]];
const eig = numeric.eig(M);
console.log(eig.lambda.x);  // Eigenvalues
console.log(eig.E.x);       // Eigenvectors

// Solve linear system Ax = b
const b = [1, 2];
const x = numeric.solve(A, b);
```

**When to use:** MDOF vibrations, structural analysis, matrix problems

---

## Creating Interactive Simulations

### p5.js Simulation Pattern

#### 1. Setup Sliders
```javascript
function setupSliders() {
    // Mass slider
    document.getElementById("mass").addEventListener("input", function() {
        mass = parseFloat(this.value);
        document.getElementById("mass-value").textContent = mass.toFixed(1);
        needsRecalculation = true;
    });

    // Velocity slider
    document.getElementById("velocity").addEventListener("input", function() {
        velocity = parseFloat(this.value);
        document.getElementById("velocity-value").textContent = velocity.toFixed(1);
        needsRecalculation = true;
    });
}
```

#### 2. Setup Buttons
```javascript
function setupButtons() {
    document.getElementById("start-btn").addEventListener("click", function() {
        animating = !animating;
        this.textContent = animating ? "Stop" : "Start";
    });

    document.getElementById("reset-btn").addEventListener("click", function() {
        animating = false;
        t = 0;
        mass = 50;
        velocity = 25;
        // Reset slider UI
        document.getElementById("mass").value = mass;
        document.getElementById("velocity").value = velocity;
        document.getElementById("mass-value").textContent = mass.toFixed(1);
        document.getElementById("velocity-value").textContent = velocity.toFixed(1);
        needsRecalculation = true;
    });
}
```

#### 3. Main Sketch
```javascript
let sketch = new p5(function(p) {
    // Variables
    let mass = 50;
    let velocity = 25;
    let animating = false;
    let t = 0;
    let dt = 0.01;
    let needsRecalculation = true;

    p.setup = function() {
        p.createCanvas(800, 600);
        setupSliders();
        setupButtons();
        calculate();
    };

    p.draw = function() {
        p.background(255);

        // Recalculate if parameters changed
        if (needsRecalculation) {
            calculate();
            needsRecalculation = false;
        }

        // Update time if animating
        if (animating) {
            t += dt;
            if (t > tMax) t = 0;
        }

        // Draw visualization
        drawVisualization();
    };

    function calculate() {
        // Perform calculations based on current parameters
        const kineticEnergy = 0.5 * mass * velocity * velocity;
        console.log("KE =", kineticEnergy);
    }

    function drawVisualization() {
        // Draw current state
        p.fill(0);
        p.ellipse(400, 300, mass, mass);
    }

}, 'sketch-holder');
```

### Best Practices for Simulations

1. **Responsive Canvas Sizing**
   ```javascript
   p.setup = function() {
       let canvasWidth = Math.min(800, p.windowWidth - 40);
       p.createCanvas(canvasWidth, 600);
   };
   ```

2. **Use Instance Mode** (not global mode)
   - Always wrap in `new p5(function(p) {...})`
   - Use `p.` prefix for all p5 functions
   - Avoids conflicts with multiple sketches

3. **Separate Concerns**
   - Calculation functions separate from drawing
   - Use flags like `needsRecalculation` to avoid redundant computation

4. **Smooth Animation**
   - Use `requestAnimationFrame` timing (p5 handles this)
   - Keep draw() function fast (<16ms per frame for 60fps)

5. **User Feedback**
   - Show current parameter values
   - Provide visual feedback for button states
   - Include legends and labels

---

## Practice Problems & Quizzes

### Practice Problems Structure

```html
<div class="content-section">
    <h2>Practice Problems</h2>

    <!-- Problem 1 -->
    <div class="practice-problems">
        <h3>Problem 1: Calculate Force</h3>
        <p>A 10 kg mass accelerates at 5 m/s². What force is applied?</p>

        <p class="toggle-section" onclick="toggleSolution('solution1')">Show Solution</p>
        <div id="solution1" class="hidden">
            <p><strong>Solution:</strong></p>
            <p><strong>Given:</strong></p>
            <ul>
                <li>Mass: m = 10 kg</li>
                <li>Acceleration: a = 5 m/s²</li>
            </ul>
            <p><strong>Formula:</strong> \(F = ma\)</p>
            <p><strong>Calculation:</strong></p>
            <p>\[F = 10 \times 5 = 50 \text{ N}\]</p>
            <p><strong>Answer:</strong> F = 50 N</p>
        </div>
    </div>

    <!-- Problem 2 -->
    <div class="practice-problems">
        <h3>Problem 2: Calculate Acceleration</h3>
        <p>A 200 N force acts on a 25 kg object. Find the acceleration.</p>

        <p class="toggle-section" onclick="toggleSolution('solution2')">Show Solution</p>
        <div id="solution2" class="hidden">
            <p><strong>Solution:</strong></p>
            <p>Rearranging \(F = ma\) gives \(a = \frac{F}{m}\)</p>
            <p>\[a = \frac{200}{25} = 8 \text{ m/s}^2\]</p>
            <p><strong>Answer:</strong> a = 8 m/s²</p>
        </div>
    </div>
</div>

<!-- Include problems.js -->
<script src="/assets/common/problems.js"></script>
```

### Quiz Structure

```html
<div class="quiz-container">
    <h2>Knowledge Check Quiz</h2>

    <!-- Question 1 -->
    <div class="quiz-question">
        <p><strong>Question 1:</strong> Newton's second law states that:</p>
        <label><input type="radio" name="q1" value="a"> F = mv</label><br>
        <label><input type="radio" name="q1" value="b"> F = ma</label><br>
        <label><input type="radio" name="q1" value="c"> F = m/a</label><br>
        <label><input type="radio" name="q1" value="d"> F = a/m</label><br>
        <p id="q1-feedback" class="feedback"></p>
    </div>

    <!-- Question 2 -->
    <div class="quiz-question">
        <p><strong>Question 2:</strong> If force doubles and mass stays constant, acceleration:</p>
        <label><input type="radio" name="q2" value="a"> Stays the same</label><br>
        <label><input type="radio" name="q2" value="b"> Doubles</label><br>
        <label><input type="radio" name="q2" value="c"> Halves</label><br>
        <label><input type="radio" name="q2" value="d"> Quadruples</label><br>
        <p id="q2-feedback" class="feedback"></p>
    </div>

    <!-- Submit Button -->
    <button id="submit-quiz">Submit Quiz</button>
    <div id="quiz-results"></div>
</div>

<!-- Include quizzes.js -->
<script src="/assets/common/quizzes.js"></script>

<!-- Quiz JavaScript -->
<script>
document.getElementById('submit-quiz').addEventListener('click', function() {
    const answers = {
        q1: 'b',  // F = ma
        q2: 'b'   // Doubles
    };

    let score = 0;
    let totalQuestions = Object.keys(answers).length;
    let resultsHTML = '<h3>Quiz Results:</h3>';

    for (let question in answers) {
        const selectedOption = document.querySelector(`input[name="${question}"]:checked`);
        const correctAnswer = answers[question];

        if (selectedOption) {
            if (selectedOption.value === correctAnswer) {
                score++;
                resultsHTML += `<p style="color: #28a745; font-weight: bold;">${question.toUpperCase()}: Correct! ✓</p>`;
            } else {
                resultsHTML += `<p style="color: #dc3545; font-weight: bold;">${question.toUpperCase()}: Incorrect ✗</p>`;
            }
        } else {
            resultsHTML += `<p style="color: #333;">${question.toUpperCase()}: Not answered</p>`;
        }
    }

    const percentage = ((score / totalQuestions) * 100).toFixed(0);
    resultsHTML = `<p style="font-size: 1.2em; font-weight: bold;">You scored ${score} out of ${totalQuestions} (${percentage}%)</p>` + resultsHTML;

    document.getElementById('quiz-results').innerHTML = resultsHTML;
});
</script>
```

---

## Best Practices

### 1. CSS Usage

**DO:**
- ✅ Use common CSS classes from `/assets/css/` whenever possible
- ✅ Keep inline `<style>` blocks minimal (< 50 lines if absolutely necessary)
- ✅ Use CSS variables for colors: `var(--primary-color)`, `var(--text-color)`
- ✅ Follow mobile-first responsive design

**DON'T:**
- ❌ Duplicate styles that already exist in common CSS
- ❌ Use inline styles (`style=""` attribute) except for dynamic JavaScript
- ❌ Create page-specific classes for common patterns
- ❌ Override common classes unnecessarily

### 2. HTML Structure

**DO:**
- ✅ Follow the 6-section template structure
- ✅ Use semantic HTML5 tags (`<header>`, `<footer>`, `<section>`)
- ✅ Include all 5 CSS files in the same order
- ✅ Load MathJax before p5.js
- ✅ Put common JS at the end of `<body>`

**DON'T:**
- ❌ Skip sections (all 6 sections should be present)
- ❌ Change section order
- ❌ Load CSS/JS in random order
- ❌ Use deprecated HTML tags

### 3. JavaScript

**DO:**
- ✅ Use p5.js instance mode (not global mode)
- ✅ Separate setup, calculation, and drawing logic
- ✅ Add event listeners in setup functions
- ✅ Use meaningful variable names
- ✅ Include comments for complex calculations

**DON'T:**
- ❌ Use global p5 mode (conflicts with multiple sketches)
- ❌ Perform heavy calculations every frame
- ❌ Leave console.log() statements in production
- ❌ Use var (use const/let instead)

### 4. Mathematical Content

**DO:**
- ✅ Use LaTeX for all equations
- ✅ Define variables clearly after equations
- ✅ Use standard engineering notation
- ✅ Include units in all numerical values
- ✅ Show worked examples step-by-step

**DON'T:**
- ❌ Use plain text for equations (use LaTeX)
- ❌ Leave variables undefined
- ❌ Mix unit systems
- ❌ Skip intermediate steps in solutions

### 5. Simulations

**DO:**
- ✅ Provide clear instructions for using the simulation
- ✅ Include reset button
- ✅ Show current parameter values
- ✅ Add legends for color-coded elements
- ✅ Make canvas responsive

**DON'T:**
- ❌ Start animation automatically
- ❌ Hide parameter controls
- ❌ Use unclear color schemes
- ❌ Make canvas too small for mobile

### 6. Accessibility

**DO:**
- ✅ Use descriptive button labels
- ✅ Include alt text for images
- ✅ Use sufficient color contrast
- ✅ Make all interactive elements keyboard-accessible
- ✅ Test on mobile devices

**DON'T:**
- ❌ Rely solely on color for information
- ❌ Use tiny font sizes
- ❌ Make buttons too small to tap
- ❌ Assume desktop-only viewing

---

## Examples & Patterns

### Example 1: Simple Force-Acceleration Simulation

**Concept:** Visualize Newton's Second Law

```html
<!-- HTML Structure -->
<div class="simulation-container">
    <h2>Force and Acceleration</h2>
    <p>Adjust the mass and force to see how acceleration changes according to \(a = F/m\).</p>

    <div class="controls-panel">
        <div class="controls-grid-2col">
            <div class="slider-container">
                <label for="mass">Mass (kg):</label>
                <div class="slider-row">
                    <input type="range" id="mass" min="1" max="100" value="10">
                    <span id="mass-value" class="value-display">10</span>
                </div>
            </div>
            <div class="slider-container">
                <label for="force">Force (N):</label>
                <div class="slider-row">
                    <input type="range" id="force" min="0" max="500" value="50">
                    <span id="force-value" class="value-display">50</span>
                </div>
            </div>
        </div>
    </div>

    <div id="sketch-holder"></div>

    <div class="results-panel">
        <p><strong>Acceleration:</strong> <span id="acceleration-display">5.00</span> m/s²</p>
    </div>
</div>

<script>
let sketch = new p5(function(p) {
    let mass = 10;
    let force = 50;
    let position = 50;
    let velocity = 0;

    p.setup = function() {
        p.createCanvas(800, 200);
        setupControls();
    };

    p.draw = function() {
        p.background(255);

        // Calculate acceleration
        let acceleration = force / mass;
        document.getElementById('acceleration-display').textContent = acceleration.toFixed(2);

        // Update physics
        velocity += acceleration * 0.01;
        position += velocity;

        // Reset if off screen
        if (position > p.width) {
            position = 50;
            velocity = 0;
        }

        // Draw ground
        p.stroke(0);
        p.line(0, 150, p.width, 150);

        // Draw object
        p.fill(200, 100, 100);
        p.noStroke();
        p.rect(position, 130, 40, 40);

        // Draw force arrow
        p.stroke(255, 0, 0);
        p.strokeWeight(3);
        p.line(position + 40, 150, position + 40 + force/2, 150);
        p.triangle(
            position + 40 + force/2, 150,
            position + 40 + force/2 - 10, 145,
            position + 40 + force/2 - 10, 155
        );

        // Labels
        p.fill(0);
        p.noStroke();
        p.textAlign(p.LEFT);
        p.text('Force: ' + force + ' N', position + 40 + force/2 + 10, 145);
        p.text('Mass: ' + mass + ' kg', position + 5, 145);
    };

    function setupControls() {
        document.getElementById("mass").addEventListener("input", function() {
            mass = parseFloat(this.value);
            document.getElementById("mass-value").textContent = mass;
            resetAnimation();
        });

        document.getElementById("force").addEventListener("input", function() {
            force = parseFloat(this.value);
            document.getElementById("force-value").textContent = force;
            resetAnimation();
        });
    }

    function resetAnimation() {
        position = 50;
        velocity = 0;
    }

}, 'sketch-holder');
</script>
```

---

### Example 2: Stress-Strain Diagram with Stages

**Concept:** Show different material behavior regions

```html
<div class="simulation-container">
    <h2>Stress-Strain Behavior</h2>

    <div class="stress-stages">
        <div class="stage-card">
            <h3>Elastic Region <span class="chip chip-blue">Linear</span></h3>
            <p>Hooke's Law: \(\sigma = E\epsilon\)</p>
            <div id="elastic-canvas"></div>
        </div>

        <div class="stage-card">
            <h3>Yield Point <span class="chip chip-orange">Transition</span></h3>
            <p>Material begins to deform permanently</p>
            <div id="yield-canvas"></div>
        </div>

        <div class="stage-card">
            <h3>Plastic Region <span class="chip chip-red">Nonlinear</span></h3>
            <p>Permanent deformation occurs</p>
            <div id="plastic-canvas"></div>
        </div>
    </div>
</div>
```

---

### Example 3: Type Selector Pattern

**Concept:** Switch between different simulation modes

```html
<div class="simulation-container">
    <h2>Beam Loading Types</h2>

    <div class="type-selector">
        <button class="type-button active" data-type="cantilever">Cantilever</button>
        <button class="type-button" data-type="simply-supported">Simply Supported</button>
        <button class="type-button" data-type="fixed-fixed">Fixed-Fixed</button>
    </div>

    <div id="sketch-holder"></div>
</div>

<script>
let currentType = 'cantilever';

// Add event listeners to type buttons
document.querySelectorAll('.type-button').forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all buttons
        document.querySelectorAll('.type-button').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to clicked button
        this.classList.add('active');

        // Update current type
        currentType = this.dataset.type;

        // Update simulation
        updateSimulation();
    });
});

function updateSimulation() {
    // Change simulation based on currentType
    console.log('Switched to:', currentType);
}
</script>
```

---

## Troubleshooting

### Common Issues

#### 1. MathJax Not Rendering
**Problem:** Equations show as plain text
**Solution:**
- Ensure MathJax script is in `<head>`
- Check for JavaScript errors in console
- Verify LaTeX syntax (use `\[` for display, `\(` for inline)
- Try adding configuration:
```html
<script>
window.MathJax = {
  tex: {
    inlineMath: [['\\(', '\\)']],
    displayMath: [['\\[', '\\]']]
  }
};
</script>
```

#### 2. p5.js Canvas Not Showing
**Problem:** Blank where canvas should be
**Solution:**
- Check `'sketch-holder'` div ID matches
- Verify p5.js loaded before your sketch code
- Check browser console for errors
- Ensure `p.createCanvas()` called in `p.setup()`

#### 3. Sliders Not Updating
**Problem:** Sliders move but values don't change
**Solution:**
- Check event listener added after DOM loads
- Verify element IDs match
- Use `parseFloat()` or `parseInt()` on value
- Check for JavaScript errors

#### 4. CSS Classes Not Working
**Problem:** Styles not applied
**Solution:**
- Verify all 5 CSS files linked in correct order
- Check for typos in class names (case-sensitive)
- Inspect element in browser DevTools
- Clear browser cache

#### 5. Quiz Not Calculating Score
**Problem:** Submit button doesn't show results
**Solution:**
- Ensure `quizzes.js` loaded
- Check `name` attributes match answer keys
- Verify `quiz-results` div exists
- Check browser console for errors

---

## Appendix: CSS Variables Reference

```css
:root {
    --primary-color: #ffd700;         /* Golden yellow */
    --secondary-color: #ffb300;       /* Darker gold */
    --text-color: #333;               /* Dark gray text */
    --background-color: #fffbeb;      /* Light cream */
    --link-color: #cc9900;            /* Gold link */
    --link-hover-color: #1c01b8;      /* Blue on hover */
    --section-bg: white;              /* Section background */
    --border-radius: 8px;             /* Standard radius */
    --box-shadow: 0 2px 5px rgba(0,0,0,0.1); /* Standard shadow */
    --transition-speed: 0.3s;         /* Animation speed */
}
```

**Usage in custom CSS:**
```css
.my-custom-box {
    background-color: var(--section-bg);
    border: 2px solid var(--primary-color);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
}
```

---

## Appendix: Responsive Breakpoints

The framework uses these standard breakpoints:

```css
/* Extra Large Desktops */
@media (min-width: 1441px) { }

/* Large Desktops */
@media (min-width: 1201px) and (max-width: 1440px) { }

/* Standard Desktops */
@media (min-width: 901px) and (max-width: 1200px) { }

/* Tablets (Landscape) */
@media (min-width: 769px) and (max-width: 900px) { }

/* Tablets (Portrait) & Large Phones */
@media (min-width: 577px) and (max-width: 768px) { }

/* Standard Phones */
@media (min-width: 321px) and (max-width: 576px) { }

/* Small Phones */
@media (max-width: 320px) { }
```

---

## Appendix: Checklist for New Lectures

### Before You Start
- [ ] Topic selected and outlined
- [ ] Mathematical equations prepared
- [ ] Simulation concept designed
- [ ] Practice problems written
- [ ] Quiz questions drafted

### HTML Structure
- [ ] All 5 CSS files linked (correct order)
- [ ] MathJax and p5.js loaded
- [ ] Header with title and subtitle
- [ ] 6 sections present in correct order
- [ ] Footer with common JS included

### Teaching Content
- [ ] Clear introduction paragraph
- [ ] Key point box with main insight
- [ ] Equations in equation-box with LaTeX
- [ ] Variables defined with units
- [ ] Theory explained clearly

### Simulation
- [ ] Control panel with sliders
- [ ] Canvas holder div present
- [ ] Start/reset buttons
- [ ] Current values displayed
- [ ] Legend if using colors
- [ ] Instructions for user

### Engineering Applications
- [ ] At least 3-5 real-world applications
- [ ] Brief descriptions
- [ ] Industry context

### Summary
- [ ] Key equations listed
- [ ] Main concepts summarized
- [ ] 3-5 key takeaways

### Practice Problems
- [ ] 3-4 worked problems
- [ ] Toggle solutions work
- [ ] Step-by-step explanations
- [ ] Units included

### Quiz
- [ ] 5+ multiple choice questions
- [ ] Answer key correct
- [ ] Submit button works
- [ ] Feedback displays

### Testing
- [ ] Test on desktop (Chrome, Firefox)
- [ ] Test on mobile device
- [ ] All links work
- [ ] No console errors
- [ ] MathJax renders correctly
- [ ] Simulation responsive

---

## Support & Resources

### Documentation
- **MathJax:** https://www.mathjax.org/
- **p5.js:** https://p5js.org/reference/
- **Plotly:** https://plotly.com/javascript/
- **MDN Web Docs:** https://developer.mozilla.org/

### Internal Resources
- `CSS_REFACTORING_ANALYSIS.md` - Detailed CSS analysis
- `PROPOSED_CSS_ADDITIONS.md` - CSS class specifications
- `REFACTORING_CHECKLIST.md` - Implementation checklist
- `REFACTORING_SUMMARY.md` - Project summary

### Getting Help
For questions or bug reports, contact:
- **Email:** ac4213@coventry.ac.uk
- **Subject:** ExplExpl Website Feedback

---

**Document Version:** 1.0
**Last Updated:** November 5, 2025
**Maintained by:** Dr. Arnaldo Delli Carri, Coventry University

---

*This guide is part of the Explorable Explanations framework for engineering education. All content is designed to be accessible, interactive, and pedagogically sound.*
