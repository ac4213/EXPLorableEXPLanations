# Complete CSS Class Reference
## Explorable Explanations Framework

**Version:** 1.0
**Last Updated:** November 5, 2025
**Total Classes:** 150+

---

## Table of Contents

1. [Layout & Structure](#layout--structure)
2. [Content Presentation](#content-presentation)
3. [Control Panels & UI](#control-panels--ui)
4. [Sliders & Inputs](#sliders--inputs)
5. [Buttons & Button States](#buttons--button-states)
6. [Simulation Components](#simulation-components)
7. [Status & Feedback](#status--feedback)
8. [Practice Problems & Quizzes](#practice-problems--quizzes)
9. [Utility Classes](#utility-classes)
10. [CSS Variables](#css-variables)

---

## Layout & Structure

### Container Classes

#### `.content-section`
**File:** `main.css`
**Purpose:** Main content container with white background
**Properties:**
- Background: White
- Border radius: 8px
- Padding: 20px
- Box shadow: Standard elevation
- Margin bottom: 20px

**Usage:**
```html
<div class="content-section">
    <h2>Section Title</h2>
    <p>Content goes here...</p>
</div>
```

---

#### `.simulation-section`
**File:** `main.css`
**Purpose:** Alias for `.content-section`, used for simulation containers
**Properties:** Same as `.content-section`

---

#### `.simulation-container`
**File:** `simulations.css`
**Purpose:** Container for simulation sections with gray background
**Properties:**
- Background: `#f9f9f9`
- Border radius: 8px
- Padding: 20px
- Box shadow: `0 2px 5px rgba(0,0,0,0.1)`
- Margin: 20px 0

**Usage:**
```html
<div class="simulation-container">
    <h2>Interactive Simulation</h2>
    <!-- Controls and canvas here -->
</div>
```

---

#### `.container`
**File:** `main.css`
**Purpose:** Generic 2-column grid container
**Properties:**
- Display: Grid
- Grid columns: `1fr 1fr`
- Gap: 20px
- Responsive: Single column on screens < 900px

---

### Panel Classes

#### `.controls-panel`
**File:** `uicontrols.css`
**Purpose:** Horizontal flexbox panel for simulation controls
**Properties:**
- Background: `#f9f9f9`
- Border radius: 8px
- Padding: 12px 15px
- Display: Flex, wrap enabled
- Gap: 15px 20px
- Box shadow: Standard

**Usage:**
```html
<div class="controls-panel">
    <div class="slider-container">...</div>
    <div class="slider-container">...</div>
</div>
```

---

#### `.control-panel`
**File:** `simulations.css`
**Purpose:** Panel with white background (alternative to `.controls-panel`)
**Properties:**
- Background: White
- Border radius: 8px
- Padding: 15px
- Display: Flex, wrap enabled
- Box shadow: Standard

**Special:** Nested `.control-group` elements have gray background

---

#### `.sim-container`
**File:** `simulations.css`
**Purpose:** Horizontal layout with left panel and right content
**Properties:**
- Display: Flex
- Gap: 20px
- Align items: Flex-start
- Flex-wrap: Nowrap
- Overflow-x: Auto
- Responsive: Stacks vertically on tablets

**Usage:**
```html
<div class="sim-container">
    <div class="sim-left-panel">Canvas</div>
    <div class="sim-right-panel">Charts</div>
</div>
```

---

#### `.sim-left-panel`
**File:** `simulations.css`
**Purpose:** Left side panel in split layout
**Properties:**
- Flex: `0 0 auto`
- Min-width: 300px
- Responsive: Full width on mobile

---

#### `.sim-right-panel`
**File:** `simulations.css`
**Purpose:** Right side panel in split layout
**Properties:**
- Flex: `1 1 auto`
- Min-width: 300px
- Responsive: Full width on mobile

---

## Content Presentation

### Information Boxes

#### `.equation-box`
**File:** `main.css`
**Purpose:** Container for mathematical equations
**Properties:**
- Background: `#f9f9f9`
- Border-left: 4px solid golden
- Padding: 15px
- Margin: 15px 0
- Border radius: 0 4px 4px 0

**Usage:**
```html
<div class="equation-box">
    <p>\[F = ma\]</p>
    <p>Where:</p>
    <ul>
        <li>\(F\) = Force (N)</li>
        <li>\(m\) = Mass (kg)</li>
    </ul>
</div>
```

---

#### `.key-point`
**File:** `main.css`
**Purpose:** Highlight key insights and takeaways
**Properties:**
- Background: `#fff3cd` (light yellow)
- Border-left: 4px solid `#ffc107` (warning yellow)
- Padding: 15px
- Margin: 15px 0
- Border radius: 0 4px 4px 0

**Usage:**
```html
<div class="key-point">
    <p><strong>Core Insight:</strong> Main takeaway message...</p>
</div>
```

---

#### `.results-panel`
**File:** `main.css`
**Purpose:** Display simulation results (yellow variant)
**Properties:**
- Background: `#fff3cd`
- Border-left: 4px solid `#ffc107`
- Padding: 15px
- Margin: 15px 0
- Border radius: 0 4px 4px 0

---

#### `.results-panel-blue`
**File:** `main.css`
**Purpose:** Display information results (blue variant)
**Properties:**
- Background: `#e6f7ff`
- Border-left: 4px solid `#1890ff`
- Padding: 15px
- Margin: 15px 0

---

#### `.results-panel-green`
**File:** `main.css`
**Purpose:** Display success results (green variant)
**Properties:**
- Background: `#e6ffe6`
- Border-left: 4px solid `#52c41a`
- Padding: 15px
- Margin: 15px 0

---

#### `.info-box-golden`
**File:** `main.css`
**Purpose:** Golden info box with full border
**Properties:**
- Background: `#fffbeb`
- Border: 2px solid golden
- Padding: 15px
- Border radius: 8px
- Margin: 15px 0

---

#### `.info-box-blue`
**File:** `main.css`
**Purpose:** Blue info box variant
**Properties:**
- Background: `#e6f7ff`
- Border: 2px solid `#1890ff`
- Padding: 15px
- Border radius: 8px

---

#### `.info-box-green`
**File:** `main.css`
**Purpose:** Green info box variant
**Properties:**
- Background: `#e6ffe6`
- Border: 2px solid `#52c41a`
- Padding: 15px
- Border radius: 8px

---

### Note Boxes

#### `.iso-note`
**File:** `main.css`
**Purpose:** ISO standards and reference notes
**Properties:**
- Background: `#fff3cd`
- Border-left: 4px solid `#ffc107`
- Padding: 10px 15px
- Margin: 10px 0
- Font-size: 0.9em
- Border radius: 0 4px 4px 0

**Usage:**
```html
<div class="iso-note">
    <strong>ISO Standard:</strong> Reference information...
</div>
```

---

#### `.standard-note`
**File:** `main.css`
**Purpose:** Standard callout notes
**Properties:** Same as `.iso-note`

---

#### `.reference-note`
**File:** `main.css`
**Purpose:** Reference citations
**Properties:** Same as `.iso-note`

---

## Control Panels & UI

### Grid Layout Classes

#### `.controls-grid`
**File:** `uicontrols.css`
**Purpose:** Responsive grid for control sliders (default 3-column)
**Properties:**
- Display: Grid
- Grid columns: `repeat(auto-fit, minmax(230px, 1fr))`
- Gap: 15px
- Padding: 15px
- Background: `#f9f9f9`
- Border radius: 8px
- Box shadow: Standard
- Responsive: 2-col on tablets, 1-col on phones

**Usage:**
```html
<div class="controls-grid">
    <div class="slider-container">
        <label for="param1">Parameter 1:</label>
        <input type="range" id="param1" min="0" max="100" value="50">
        <span id="param1-value" class="value-display">50</span>
    </div>
    <!-- More sliders... -->
</div>
```

---

#### `.controls-grid-2col`
**File:** `uicontrols.css`
**Purpose:** 2-column grid variant (wider columns)
**Properties:**
- Grid columns: `repeat(auto-fit, minmax(300px, 1fr))`
- Other properties same as `.controls-grid`

---

#### `.controls-grid-3col`
**File:** `uicontrols.css`
**Purpose:** 3-column grid variant (narrower columns)
**Properties:**
- Grid columns: `repeat(auto-fit, minmax(200px, 1fr))`
- Other properties same as `.controls-grid`

---

#### `.controls-grid-white`
**File:** `uicontrols.css`
**Purpose:** Modifier for white background
**Properties:**
- Background: White

**Usage:**
```html
<div class="controls-grid controls-grid-white">
    <!-- Controls -->
</div>
```

---

### Control Components

#### `.control-group`
**File:** `simulations.css`
**Purpose:** Group related controls together
**Properties:**
- Display: Flex
- Flex-direction: Column
- Margin-right: 20px
- Max-width: 100%

---

#### `.control-group-enhanced`
**File:** `uicontrols.css`
**Purpose:** Enhanced control group with background and border
**Properties:**
- Background: `#f9f9f9`
- Padding: 15px
- Border-radius: 5px
- Border: 1px solid `#e0e0e0`
- Margin: 10px 0

**Special:** h4 elements have golden underline

**Usage:**
```html
<div class="control-group-enhanced">
    <h4>Mass Properties</h4>
    <div class="slider-container">...</div>
</div>
```

---

#### `.control-row`
**File:** `simulations.css`
**Purpose:** Horizontal row of controls
**Properties:**
- Display: Flex
- Align items: Center
- Gap: 10px
- Flex-wrap: Wrap
- Responsive: Stacks vertically on mobile

---

#### `.control-column`
**File:** `simulations.css`
**Purpose:** Vertical column in control layout
**Properties:**
- Flex: 1
- Min-width: 250px
- Max-width: 100%

---

#### `.section-inputs`
**File:** `uicontrols.css`
**Purpose:** Container for section-specific dimension inputs
**Properties:**
- Display: Flex
- Gap: 12px
- Align items: Center
- Margin: 6px 0 12px
- Flex-wrap: Wrap

**Usage:**
```html
<div class="section-inputs">
    <label>Width: <input type="number" value="100"></label>
    <label>Height: <input type="number" value="50"></label>
</div>
```

---

## Sliders & Inputs

### Slider Container Classes

#### `.slider-container`
**File:** `uicontrols.css`
**Purpose:** Container for individual slider control
**Properties:**
- Margin: 10px 0

**Structure:**
```html
<div class="slider-container">
    <label for="mass">Mass (kg):</label>
    <div class="slider-row">
        <input type="range" id="mass" min="0" max="100" value="50">
        <span id="mass-value" class="value-display">50</span>
    </div>
</div>
```

---

#### `.slider-row`
**File:** `uicontrols.css`
**Purpose:** Horizontal layout for slider + value display
**Properties:**
- Display: Flex
- Align items: Center
- Gap: 10px
- Flex-wrap: Wrap

---

#### `.slider-label`
**File:** `uicontrols.css`
**Purpose:** Label for slider in slider-row layout
**Properties:**
- Flex: `0 0 auto`
- Min-width: 80px
- Max-width: 120px
- Font-size: 0.95em

---

### Input Styling

#### `input[type="range"]`
**File:** `uicontrols.css`
**Purpose:** All range sliders
**Properties:**
- Appearance: None (custom styling)
- Height: 6px
- Border-radius: 3px
- Background: `#e0e0e0`
- Border: 1px solid `#d0d0d0`
- Accent-color: Golden (for native fill)
- Cursor: Pointer

**Thumb:**
- Width/Height: 20px
- Border-radius: 50%
- Background: Golden
- Border: 3px solid white
- Box-shadow: `0 2px 4px rgba(0,0,0,0.2)`
- Hover: Scales to 1.1x

**States:**
- Hover: Darker background
- Disabled: Gray with no-pointer cursor

---

#### `input[type="number"]`
**File:** `uicontrols.css`
**Purpose:** Number input fields
**Properties:**
- Width: 70px
- Padding: 4px 2px
- Border: 1px solid `#ddd`
- Border-radius: 3px
- Font-size: 0.9em
- Focus: Golden border with shadow

---

#### `input[type="checkbox"]`
**File:** `uicontrols.css`
**Purpose:** Custom styled checkboxes
**Properties:**
- Appearance: None (custom)
- Width/Height: 18px
- Border: 2px solid `#ddd`
- Border-radius: 3px
- Cursor: Pointer
- Checked: Golden background with ✓ symbol

---

#### `select`
**File:** `uicontrols.css`
**Purpose:** Dropdown menus
**Properties:**
- Padding: 8px 12px
- Font-size: 14px
- Border: 2px solid `#ddd`
- Border-radius: 5px
- Background: White
- Cursor: Pointer
- Hover: Golden border, cream background
- Focus: Golden glow effect

---

### Value Display Classes

#### `.value-display`
**File:** `main.css`
**Purpose:** Display live parameter values (small)
**Properties:**
- Font-size: 0.9em
- Color: `#666`
- Font-family: Monospace
- Margin-top: 3px

**Usage:**
```html
<span id="force-value" class="value-display">500 N</span>
```

---

#### `.value-display-large`
**File:** `main.css`
**Purpose:** Display live parameter values (large)
**Properties:**
- Font-size: 1.2em
- Color: `#333`
- Font-weight: Bold
- Font-family: Monospace

---

#### `.slider-value`
**File:** `uicontrols.css`
**Purpose:** Value display in slider row
**Properties:**
- Display: Inline-block
- Min-width: 60px
- Text-align: Right
- Font-family: Monospace

---

## Buttons & Button States

### Base Button Classes

#### `button`, `.control-button`
**File:** `uicontrols.css`
**Purpose:** All standard buttons
**Properties:**
- Min-width: 80px
- Padding: 10px 16px
- Background: Golden
- Border: None
- Border-radius: 8px
- Font-weight: Bold
- Font-size: 14px
- Cursor: Pointer
- Hover: Darker gold + lift effect
- Active: Pressed effect
- Disabled: Gray, no-pointer

**Usage:**
```html
<button id="start-btn">Start</button>
<button class="control-button">Reset</button>
```

---

### Button State Modifiers

#### `.active`, `.toggled`
**File:** `uicontrols.css`
**Purpose:** Active/selected button state
**Properties:**
- Background: Secondary golden
- Box-shadow: Inset shadow (pressed effect)
- Border: 2px solid link color

**Usage:**
```html
<button class="control-button active">Mode A</button>
<button class="control-button">Mode B</button>
```

---

#### `.paused`
**File:** `uicontrols.css`
**Purpose:** Paused state (red button)
**Properties:**
- Background: `#f44336` (red)
- Color: White
- Hover: Darker red

**Usage:**
```html
<button class="control-button paused" id="pause-btn">Pause</button>
```

---

#### `.playing`, `.running`
**File:** `uicontrols.css`
**Purpose:** Playing/running state (green button)
**Properties:**
- Background: `#4CAF50` (green)
- Color: White
- Hover: Darker green

**Usage:**
```html
<button class="control-button playing" id="play-btn">Playing</button>
```

---

#### `.muted`
**File:** `uicontrols.css`
**Purpose:** Muted/disabled appearance (but clickable)
**Properties:**
- Opacity: 0.45
- Pointer-events: None

---

### Special Button Classes

#### `.control-toggle-btn`
**File:** `uicontrols.css`
**Purpose:** Floating button to show/hide controls on mobile
**Properties:**
- Position: Fixed (bottom-right)
- Z-index: 1000
- Background: Golden
- Border-radius: 50px (pill shape)
- Box-shadow: Large elevation
- Hidden on desktop

**Usage:**
```html
<button class="control-toggle-btn">Toggle Controls</button>
```

---

#### `.restore-controls-btn`
**File:** `uicontrols.css`
**Purpose:** Button to restore hidden controls
**Properties:**
- Position: Fixed (bottom-left)
- Z-index: 1000
- Background: Green
- Color: White
- Border-radius: 50px

---

#### `.tab-button`
**File:** `simulations.css`
**Purpose:** Tab navigation buttons
**Properties:**
- Padding: 10px 20px
- Background: `#e0e0e0` (inactive)
- Border: None
- Border-radius: 5px 5px 0 0
- Cursor: Pointer
- Active: Golden background

**Usage:**
```html
<div class="tab-navigation">
    <button class="tab-button active">Tab 1</button>
    <button class="tab-button">Tab 2</button>
</div>
```

---

#### `.type-button`
**File:** `simulations.css`
**Purpose:** Type selector buttons (e.g., gear types, beam types)
**Properties:**
- Padding: 8px 15px
- Background: `#e0e0e0`
- Border: 2px solid transparent
- Border-radius: 5px
- Font-weight: 500
- Hover: Darker background
- Active: Golden with border shadow

**Usage:**
```html
<div class="type-selector">
    <button class="type-button active">Type A</button>
    <button class="type-button">Type B</button>
</div>
```

---

## Simulation Components

### Diagram & Legend Classes

#### `.diagram-legend`
**File:** `simulations.css`
**Purpose:** Container for simulation diagram legends
**Properties:**
- Display: Flex
- Flex-wrap: Wrap
- Gap: 15px
- Font-size: 0.9em
- Justify-content: Center
- Margin: 15px 0
- Padding: 10px
- Background: `rgba(255, 255, 255, 0.9)`
- Border-radius: 4px

**Usage:**
```html
<div class="diagram-legend">
    <div class="legend-item">
        <div class="legend-color" style="background-color: red;"></div>
        <span>Force</span>
    </div>
    <div class="legend-item">
        <div class="legend-color" style="background-color: blue;"></div>
        <span>Displacement</span>
    </div>
</div>
```

---

#### `.legend-item`
**File:** `simulations.css`
**Purpose:** Individual legend entry (color + label)
**Properties:**
- Display: Flex
- Gap: 5px
- Align items: Center

---

#### `.legend-color`
**File:** `simulations.css`
**Purpose:** Color indicator square in legend
**Properties:**
- Width: 20px
- Height: 20px
- Border-radius: 3px
- Border: 1px solid `#ddd`
- Flex-shrink: 0
- Responsive: 16px on mobile

---

### Simulation Wrapper Classes

#### `.simulation-wrapper`
**File:** `simulations.css`
**Purpose:** Standard gray wrapper for simulations
**Properties:**
- Background: `#f9f9f9`
- Border-radius: 8px
- Padding: 20px
- Margin: 20px 0
- Box-shadow: Standard

---

#### `.simulation-wrapper-white`
**File:** `simulations.css`
**Purpose:** White background variant
**Properties:**
- Background: White
- Border: 1px solid `#ddd`

---

#### `.simulation-wrapper-full`
**File:** `simulations.css`
**Purpose:** Full-width variant (no side padding)
**Properties:**
- Padding: 20px 0

---

### Canvas & Chart Classes

#### `.chart-container`, `.plot-container`
**File:** `simulations.css`
**Purpose:** Container for individual charts/plots
**Properties:**
- Flex: `1 1 auto`
- Min-width: 300px
- Background: White
- Border: 1px solid `#ddd`
- Border-radius: 4px
- Padding: 15px
- Margin: 10px 0

**Usage:**
```html
<div class="chart-container">
    <div id="TimeHistory"></div>
</div>
```

---

#### `.plots-grid`
**File:** `simulations.css`
**Purpose:** Grid layout for multiple plots
**Properties:**
- Display: Grid
- Grid columns: `repeat(auto-fit, minmax(300px, 1fr))`
- Gap: 15px
- Margin: 20px 0
- Responsive: Single column on mobile

**Usage:**
```html
<div class="plots-grid">
    <div class="plot-container">Plot 1</div>
    <div class="plot-container">Plot 2</div>
</div>
```

---

#### `.plots-flex`
**File:** `simulations.css`
**Purpose:** Flex layout for side-by-side plots
**Properties:**
- Display: Flex
- Gap: 15px
- Flex-wrap: Wrap
- Margin: 20px 0

---

#### `#sketch-holder`, `#react-visualizer`
**File:** `main.css`
**Purpose:** Common IDs for p5.js canvas holders
**Properties:**
- Width: 100%
- Height: Fit-content
- Position: Relative
- Border: 1px solid `#ddd`
- Border-radius: 4px
- Background: `#f9f9f9`
- Margin: 10px 0

---

#### `.sim-holder`
**File:** `uicontrols.css`
**Purpose:** Generic simulation holder class
**Properties:**
- Width: 100%
- Min-height: 400px
- Position: Relative
- Border: 1px solid `#ddd`
- Border-radius: 4px
- Background: `#f9f9f9`
- Overflow: Hidden

---

### Stage & Card Classes

#### `.stage-cards`, `.stress-stages`
**File:** `simulations.css`
**Purpose:** Container for stage/step cards
**Properties:**
- Display: Flex
- Gap: 15px
- Margin: 20px 0
- Flex-wrap: Wrap
- Responsive: Single column on mobile

**Usage:**
```html
<div class="stress-stages">
    <div class="stage-card">Stage 1</div>
    <div class="stage-card">Stage 2</div>
</div>
```

---

#### `.stage-card`
**File:** `simulations.css`
**Purpose:** Individual stage card
**Properties:**
- Flex: `1 1 200px`
- Background: White
- Border: 2px solid `#ddd`
- Border-radius: 8px
- Padding: 15px
- Box-shadow: Standard
- Hover: Enhanced shadow
- Active: Golden border

**Usage:**
```html
<div class="stage-card">
    <h4>Elastic Region <span class="chip chip-blue">Linear</span></h4>
    <p>Hooke's Law applies</p>
    <div id="elastic-canvas"></div>
</div>
```

---

### Type Selector Classes

#### `.type-selector`
**File:** `simulations.css`
**Purpose:** Container for type selection buttons
**Properties:**
- Display: Flex
- Gap: 10px
- Margin: 10px 0
- Flex-wrap: Wrap
- Justify-content: Center

**See `.type-button` above for button styling**

---

### Special Component Classes

#### `.failure-criteria-chart`
**File:** `simulations.css`
**Purpose:** Container for failure criteria visualization
**Properties:**
- Max-width: 600px
- Margin: 20px auto
- Padding: 15px
- Background: White
- Border: 2px solid `#ddd`
- Border-radius: 8px

---

#### `.stress-blocks-container`
**File:** `simulations.css`
**Purpose:** 3-column grid for stress blocks
**Properties:**
- Display: Grid
- Grid columns: `repeat(3, 1fr)`
- Gap: 15px
- Margin: 20px 0
- Responsive: 2-col on tablets, 1-col on phones

---

#### `.stress-block`
**File:** `simulations.css`
**Purpose:** Individual stress visualization block
**Properties:**
- Background: White
- Border: 2px solid `#ddd`
- Border-radius: 4px
- Padding: 15px
- Text-align: Center

---

### Grid & View Layout

#### `.simulation-grid`
**File:** `simulations.css`
**Purpose:** 2x2 grid for multiple simulation views
**Properties:**
- Display: Grid
- Grid columns: `repeat(2, 1fr)`
- Gap: 15px
- Margin-bottom: 20px
- Responsive: Single column on tablets

---

#### `.view-panel`
**File:** `simulations.css`
**Purpose:** Individual view panel in simulation grid
**Properties:**
- Background: White
- Border: 2px solid `#ddd`
- Border-radius: 8px
- Padding: 10px
- Min-height: 300px
- Position: Relative

---

#### `.view-title`
**File:** `simulations.css`
**Purpose:** Floating title label for view panels
**Properties:**
- Position: Absolute (top-right)
- Background: `rgba(255,255,255,0.9)`
- Padding: 3px 8px
- Border-radius: 3px
- Font-weight: Bold
- Font-size: 0.9em
- Z-index: 10

---

## Status & Feedback

### Status Display Classes

#### `.status-display`
**File:** `simulations.css`
**Purpose:** Container for status information
**Properties:**
- Background: `#f0f0f0`
- Border-radius: 8px
- Padding: 15px
- Margin-top: 20px

---

#### `.status-grid`
**File:** `simulations.css`
**Purpose:** Grid layout for multiple status items
**Properties:**
- Display: Grid
- Grid columns: `repeat(auto-fit, minmax(180px, 1fr))`
- Gap: 15px
- Responsive: Single column on mobile

---

#### `.status-item`
**File:** `simulations.css`
**Purpose:** Individual status item container
**Properties:**
- Background: White
- Padding: 10px
- Border-radius: 5px
- Border: 1px solid `#ddd`

---

#### `.status-label`
**File:** `simulations.css`
**Purpose:** Label for status item
**Properties:**
- Font-size: 0.9em
- Color: `#666`
- Margin-bottom: 5px

---

#### `.status-value`
**File:** `simulations.css`
**Purpose:** Value display for status item
**Properties:**
- Font-size: 1.2em
- Font-weight: Bold
- Color: `#333`

**Modifiers:**
- `.balanced`: Green color
- `.unbalanced`: Red color

---

### Status Text Classes

#### `.status-success`
**File:** `main.css`
**Purpose:** Success status text
**Properties:**
- Color: `#28a745` (green)
- Font-weight: Bold

**Usage:**
```html
<p class="status-success">✓ Calculation complete</p>
```

---

#### `.status-error`, `.status-failure`
**File:** `main.css`
**Purpose:** Error/failure status text
**Properties:**
- Color: `#dc3545` (red)
- Font-weight: Bold

---

#### `.status-warning`
**File:** `main.css`
**Purpose:** Warning status text
**Properties:**
- Color: `#ffc107` (yellow)
- Font-weight: Bold

---

#### `.status-info`
**File:** `main.css`
**Purpose:** Information status text
**Properties:**
- Color: `#17a2b8` (blue)
- Font-weight: Bold

---

#### `.status-balanced`
**File:** `main.css`
**Purpose:** Balanced system indicator
**Properties:**
- Color: `#28a745` (green)

---

#### `.status-unbalanced`
**File:** `main.css`
**Purpose:** Unbalanced system indicator
**Properties:**
- Color: `#dc3545` (red)

---

### Chip/Badge Classes

#### `.chip`
**File:** `main.css`
**Purpose:** Base chip/badge styling
**Properties:**
- Display: Inline-block
- Padding: 4px 12px
- Border-radius: 16px (pill shape)
- Font-size: 0.85em
- Font-weight: Bold
- Margin: 2px
- Hover: Scale to 1.05x

**Usage:**
```html
<span class="chip chip-blue">Elastic</span>
```

---

#### `.chip-blue`
**File:** `main.css`
**Properties:**
- Background: `#2196F3`
- Color: White

---

#### `.chip-red`
**File:** `main.css`
**Properties:**
- Background: `#f44336`
- Color: White

---

#### `.chip-green`
**File:** `main.css`
**Properties:**
- Background: `#4CAF50`
- Color: White

---

#### `.chip-gold`, `.chip-yellow`
**File:** `main.css`
**Properties:**
- Background: Golden
- Color: Dark text

---

#### `.chip-grey`, `.chip-gray`
**File:** `main.css`
**Properties:**
- Background: `#9e9e9e`
- Color: White

---

#### `.chip-orange`
**File:** `main.css`
**Properties:**
- Background: `#ff9800`
- Color: White

---

#### `.chip-purple`
**File:** `main.css`
**Properties:**
- Background: `#9c27b0`
- Color: White

---

## Practice Problems & Quizzes

### Practice Problem Classes

#### `.practice-problems`
**File:** `problems.css`
**Purpose:** Container for practice problem sections
**Properties:**
- Background: `#e6f7ff` (light blue)
- Border-left: 4px solid `#1890ff` (blue)
- Padding: 15px
- Margin: 15px 0
- Border-radius: 0 4px 4px 0

**Usage:**
```html
<div class="practice-problems">
    <h3>Problem 1: Calculate Force</h3>
    <p>Problem statement...</p>
    <p class="toggle-section" onclick="toggleSolution('sol1')">Show Solution</p>
    <div id="sol1" class="hidden">Solution...</div>
</div>
```

---

#### `.toggle-section`
**File:** `problems.css`
**Purpose:** Clickable text to toggle solution visibility
**Properties:**
- Cursor: Pointer
- Color: `#1890ff` (blue)
- Font-weight: Bold
- Display: Inline-block
- Padding: 5px 10px
- Background: `rgba(24, 144, 255, 0.1)`
- Border-radius: 4px
- Hover: Underline, darker background

---

#### `.hidden`
**File:** `problems.css`
**Purpose:** Hide solutions initially
**Properties:**
- Display: None

**When visible (inside `.practice-problems`):**
- Margin-top: 15px
- Padding: 15px
- Background: `#f0f8ff`
- Border-radius: 4px
- Border: 1px solid `#b3d9ff`

---

### Quiz Classes

#### `.quiz-container`
**File:** `quizzes.css`
**Purpose:** Main container for quiz sections
**Properties:**
- Background: `#e6ffe6` (light green)
- Border-left: 4px solid `#52c41a` (green)
- Border-radius: 0 8px 8px 0
- Padding: 20px
- Margin: 20px 0
- Box-shadow: Standard

**Important:** Do NOT add `id="quiz"` to this element. The ID is not used by any CSS or JavaScript and should be omitted.

**Usage:**
```html
<div class="content-section">
    <h2>Knowledge Check Quiz</h2>
    <div class="quiz-container">
        <!-- Quiz questions here -->
    </div>
</div>
```

---

#### `.quiz-question`
**File:** `quizzes.css`
**Purpose:** Individual quiz question container
**Properties:**
- Margin-bottom: 20px
- Padding-bottom: 15px
- Border-bottom: 1px solid `#b7eb8f`
- Last question: No border

---

#### `.quiz-options`
**File:** `quizzes.css`
**Purpose:** Container for radio button options
**Properties:**
- Display: Flex
- Flex-direction: Column
- Gap: 10px

**Label hover:**
- Background: `#d9f7be`

---

#### `#submit-quiz`
**File:** `quizzes.css`
**Purpose:** Quiz submit button
**Properties:**
- Background: `#52c41a` (green)
- Color: White
- Padding: 12px 24px
- Border-radius: 8px
- Font-weight: Bold
- Font-size: 16px
- Hover: Darker green

---

#### `#quiz-results`
**File:** `quizzes.css`
**Purpose:** Container for quiz results display
**Properties:**
- Margin-top: 20px
- Padding: 15px
- Background: `#f6ffed`
- Border-radius: 8px
- Border-left: 4px solid green
- Hidden when empty

---

#### `.feedback`
**File:** Generic, used in quizzes
**Purpose:** Feedback message after answer
**Properties:** Varies by context

---

#### `.quiz-correct`
**File:** `quizzes.css`
**Purpose:** Correct answer feedback
**Properties:**
- Color: `#28a745` (green)
- Font-weight: Bold

---

#### `.quiz-incorrect`
**File:** `quizzes.css`
**Purpose:** Incorrect answer feedback
**Properties:**
- Color: `#dc3545` (red)
- Font-weight: Bold

---

#### `.quiz-score`
**File:** `quizzes.css`
**Purpose:** Score display
**Properties:**
- Font-size: 1.2em
- Font-weight: Bold
- Color: `#237804` (dark green)
- Margin-top: 15px
- Padding: 10px
- Background: `#d9f7be`
- Border-radius: 4px
- Text-align: Center

---

## Utility Classes

### Responsive Utilities

#### `.hide-mobile`
**File:** `main.css`
**Purpose:** Hide element on mobile devices
**Breakpoint:** Hidden when width < 768px

**Usage:**
```html
<div class="hide-mobile">Desktop only content</div>
```

---

#### `.hide-desktop`
**File:** `main.css`
**Purpose:** Hide element on desktop
**Breakpoint:** Hidden when width > 768px

---

#### `.show-mobile`
**File:** `main.css`
**Purpose:** Show only on mobile
**Breakpoint:** Visible when width < 768px, hidden otherwise

---

### Tab Components

#### `.tab-navigation`
**File:** `simulations.css`
**Purpose:** Container for tab buttons
**Properties:**
- Display: Flex
- Gap: 10px
- Margin-bottom: 20px
- Flex-wrap: Wrap

---

#### `.tab-content`
**File:** `simulations.css`
**Purpose:** Content panel for tabs
**Properties:**
- Display: None (hidden by default)
- Active: Display block

**Usage:**
```html
<div class="tab-navigation">
    <button class="tab-button active">Tab 1</button>
    <button class="tab-button">Tab 2</button>
</div>
<div class="tab-content active">Content 1</div>
<div class="tab-content">Content 2</div>
```

---

### Table Classes

#### `.equation-table`
**File:** `main.css`
**Purpose:** Container for equation reference tables
**Properties:**
- Overflow-x: Auto
- Margin: 20px 0

**Table styling:**
- Border-collapse: Collapse
- Background: White
- Header: Golden background
- Rows: Alternating background, hover effect

---

### Typography & Special Elements

#### `.subtitle`
**File:** `main.css`
**Purpose:** Subtitle text in header
**Properties:**
- Font-style: Italic
- Font-size: 1.2em

---

#### `.small-caps`
**File:** `main.css`
**Purpose:** Small capitals text (used in footer)
**Properties:**
- Font-variant: Small-caps
- Font-size: 0.9em

---

## CSS Variables

### Color Variables

```css
:root {
    --primary-color: #ffd700;         /* Golden yellow */
    --secondary-color: #ffb300;       /* Darker gold */
    --text-color: #333;               /* Dark gray text */
    --background-color: #fffbeb;      /* Light cream */
    --link-color: #cc9900;            /* Gold links */
    --link-hover-color: #1c01b8;      /* Blue on hover */
    --section-bg: white;              /* Section background */
    --border-radius: 8px;             /* Standard radius */
    --box-shadow: 0 2px 5px rgba(0,0,0,0.1); /* Standard shadow */
    --transition-speed: 0.3s;         /* Animation speed */
}
```

### Usage in Custom CSS

```css
.my-custom-element {
    background-color: var(--primary-color);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    transition: all var(--transition-speed);
}
```

---

## Responsive Breakpoints

The framework uses these standard breakpoints:

| Breakpoint | Width | Purpose |
|------------|-------|---------|
| **320px** | ≤ 320px | Small phones |
| **576px** | ≤ 576px | Standard phones |
| **768px** | ≤ 768px | Tablets (portrait) |
| **900px** | ≤ 900px | Tablets (landscape) |
| **1025px** | ≥ 1025px | Desktop/laptop |
| **1200px** | ≥ 1200px | Large desktops |
| **1440px** | ≥ 1440px | Extra large desktops |

---

## Class Naming Conventions

### BEM-like Patterns

The framework loosely follows BEM (Block Element Modifier) principles:

**Block:** `.controls-grid`, `.stage-card`, `.diagram-legend`
**Element:** `.legend-item`, `.legend-color`, `.status-label`
**Modifier:** `.active`, `.paused`, `.playing`, `-blue`, `-white`

### Common Prefixes

- `.control-*` - Control panel and UI components
- `.slider-*` - Slider-related elements
- `.simulation-*` - Simulation containers
- `.status-*` - Status indicators
- `.quiz-*` - Quiz components
- `.chip-*` - Badge/chip variants
- `.info-box-*` - Info box variants

---

## Quick Reference: Most Common Classes

### Essential Layout
- `.content-section` - Main content container
- `.simulation-container` - Simulation section
- `.controls-grid` - 3-column slider grid

### Controls
- `.slider-container` - Individual slider
- `.slider-row` - Horizontal slider layout
- `.value-display` - Live value display
- `.control-button` - Standard button

### Content
- `.equation-box` - Math equations
- `.key-point` - Key insights
- `.results-panel` - Results display

### Simulation
- `.diagram-legend` - Color legend
- `.stage-card` - Stage/step cards
- `.type-button` - Type selector

### Status
- `.chip` + color - Status badges
- `.status-success/error` - Status text
- `.practice-problems` - Problem sections
- `.quiz-container` - Quiz sections

---

**Document Version:** 1.0
**Total Classes Documented:** 150+
**Last Updated:** November 5, 2025

---

*This reference is part of the Explorable Explanations framework documentation. For usage examples and patterns, see the [Lecture Creation Guide](LECTURE_CREATION_GUIDE.md).*
