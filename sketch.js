// let years = {
//   'redLine' : new Year('#ff2200', 'Red Line'),
//   'purpleLine' : new Year('#9966ff', 'Purple Line'),
//   'blueLine' : new Year('#999933', 'Blue Line'),
//   'yellowLine' : new Year('#ffaa00', 'Yellow Line')
// };  

let yearColors = ['#ff2200', '#9966ff', '#999933', '#ffaa00']

let years;
let labelBoxes = [];

let selectedYear = null;

async function setup() {
  createCanvas(1200, 400);
  background(0);
  loadJSON('http://localhost:3000/weather/year?type=rain', dataIsLoaded);
}

function dataIsLoaded(data) {
  years = data;
  let i = 0;
  for (const year of Object.keys(years.years)) {
    years.years[year].color = yearColors[i];
    i++;
  }
}

function draw() {
  background(0);
  if (!years) {
    push()
      translate(width / 2, height / 2);
      rotate(frameCount * 0.1);
      noFill();
      stroke(255);
      strokeWeight(4);
      arc(0, 0, 40, 40, 0, PI * 1.5);
    pop()
  }

  if (years) {
    for (const [yearLabel, yearData] of Object.entries(years.years)) {
      if (selectedYear && yearLabel != selectedYear) {
        console.log('continuing');
        continue;
      }

      strokeWeight(3);
      stroke(yearData.color);
      noFill();
      beginShape();
        i = 0;
        for (const [date, value] of Object.entries(yearData.data)) {
          let x = map(i, 0, Object.keys(yearData.data).length - 1, 0, width);
          let y = map(value, -0.01, yearData.biggest.value, height, 0);
          
          //first control point
          if (i == 0) {
            splineVertex(x, y);
          }

          splineVertex(x, y);

          //last control point
          if (i == Object.keys(yearData.data).length) {
            splineVertex(x, y);
          }

          i++;
        }
      endShape();
    }
    noLoop();
  } 

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