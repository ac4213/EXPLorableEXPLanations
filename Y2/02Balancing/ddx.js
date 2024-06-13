let table;
let vectors = [];

function setup() {
  createCanvas(400, 400);
  
  // Create a new table and add some data
  table = createElement('table');
  let row = createElement('tr');
  row.parent(table);
  createElement('th', 'X').parent(row);
  createElement('th', 'Y').parent(row);
  
  for(let i = 0; i < 5; i++) {
    row = createElement('tr');
    row.parent(table);
    let x = createElement('td', random(width)).parent(row);
    let y = createElement('td', random(height)).parent(row);
    vectors.push(createVector(x.elt.innerHTML, y.elt.innerHTML));
  }
}

function draw() {
  background(220);
  
  // Draw the vectors
  strokeWeight(2);
  for(let i = 0; i < vectors.length; i++) {
    line(0, 0, vectors[i].x, vectors[i].y);
  }
}
