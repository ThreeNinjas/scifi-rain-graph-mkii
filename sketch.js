let years = {
  'redLine' : new Year('red', 'Red Line'),
  'purpleLine' : new Year('purple', 'Purple Line'),
  'blueLine' : new Year('blue', 'Blue Line'),
  'yellowLine' : new Year('yellow', 'Yellow Line')
};  

let labelBoxes = [];

let selectedYear = null;

function setup() {
  createCanvas(600, 400);
}

function draw() {
  console.log(selectedYear);
  background(0);

  let startY = 10;

  //lines
  for (let year of Object.values(years)) { 
    if (selectedYear && year != selectedYear) {
      continue;
    }
    strokeWeight(3);
    stroke(year.color);
    noFill();
    beginShape();
      for (let i = 0; i < year.values.length; i++) {
        let x = map(i, 0, year.values.length - 1, 0, width);
        let y = map (year.values[i], 0, year.highestValue, height, 0);
        vertex(x, y);
      }
    endShape();
  }

  //labels
  labelBoxes = [];
  for (let year of Object.values(years)) {
    stroke(year.color);
    textAlign(LEFT, TOP);
    strokeWeight(1);

    let w = textWidth(year.label);
    let h = textAscent(year.label) + textDescent(year.label);

    labelBoxes.push({
      year: year,
      x: 10,
      y: startY,
      w: w,
      h: h
    });

    text(year.label, 10, startY);
    startY += 20;
  }

  noLoop();
}

function mousePressed() {
  for (let box of labelBoxes) {
    if (
      mouseX >= box.x &&
      mouseX <= box.x + box.w &&
      mouseY >= box.y &&
      mouseY <= box.y + box.h
    ) {
      if (box.year === selectedYear) {
        console.log('me!')
        selectedYear = null;
      } else {
        selectedYear = box.year;
      }
      
      redraw();
    }
  }
}