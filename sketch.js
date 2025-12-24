let years;
let font;
let daily;

let serverUrl = 'http://localhost:3000/weather/';
const urlParams = new URLSearchParams(window.location.search);

let type = urlParams.get('type');
let yearColors = ['#ff2200', '#f5f6fa', '#45936b', '#9966ff']

let labelBoxes = [];
let selectedYear = null;

let util = new Util();

//TODO past 24 hours
//TODO range bars
//TODO comfort dot

async function setup() {
  createCanvas(1200, 400);
  font = await loadFont('/assets/Antonio-Regular.ttf');
  background(0);
  
  Promise.all([
    fetch(serverUrl+'year?type='+type).then(r => r.json()),
    fetch(serverUrl+'last24hrs').then(r => r.json()),
  ]).then(([y, d]) => {
    years = y;
    daily = d;

    let i = 0;
  for (const year of Object.keys(years.years)) {
    years.years[year].color = yearColors[i];
    i++;
  }
  });

  
    
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

  if (years && font) {
    textFont(font);

    let biggestBoys = [];
    let runnersUp = [];
    //daily
    for (const [yearLabel, yearData] of Object.entries(years.years)) {
      if (selectedYear && String(yearLabel) != String(selectedYear)) {
        continue;
      } 

      strokeWeight(3);
      stroke(yearData.color);
      noFill();
      beginShape();
        i = 0;
        for (const [date, value] of Object.entries(yearData.data)) {
          let x = map(i, 0, Object.keys(yearData.data).length - 1, 0, width);
          let y = map(value, years.globalRange.min, years.globalRange.max, height - 0.5, 10);
          
          if (date === yearData.biggest.date) {
            biggestBoys.push({
              x: x,
              y: y,
              color: yearData.color,
              string: value + '-' + date
            });
          }

          if (yearData.runnersUp.some(o => o.date === date)) {
            runnersUp.push({
              x: x,
              y: y,
              year: yearLabel,
              value: value,
              color: yearData.color,
              string: value + '-' + date
            });
          }

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

    //label our outstanding days
    for (let i = 0; i < biggestBoys.length; i++) {
      stroke(biggestBoys[i].color);
      fill(biggestBoys[i].color);
      textAlign(CENTER, TOP);
      textSize(19);
      strokeWeight(0.01)
      text(biggestBoys[i].string, biggestBoys[i].x, biggestBoys[i].y);
    }
   
    for (let i = 0; i < runnersUp.length; i++) {
      let biggest = years.years[runnersUp[i].year].biggest.value;
      stroke(runnersUp[i].color);
      fill(runnersUp[i].color);
      if (type == 'rain') {
        textSize(14);
        text(runnersUp[i].string, runnersUp[i].x, runnersUp[i].y);
      } else {
        strokeWeight(1);
        let mapped = map(runnersUp[i].value, 0, biggest, 5, 26)
        line(runnersUp[i].x, runnersUp[i].y, runnersUp[i].x, runnersUp[i].y-mapped);
      }
    }

    //cumulative
    for (const [yearLabel, yearData] of Object.entries(years.years)) {
      if (selectedYear && String(yearLabel) != String(selectedYear)) {
        continue;
      } 

      strokeWeight(1);
      stroke(yearData.color);
      noFill();
      beginShape();
        i = 0;
        let runningTotal = 0;
        for (const [date, value] of Object.entries(yearData.data)) {
          runningTotal = runningTotal + value;
          let x = map(i, 0, Object.keys(yearData.data).length - 1, 0, width);
          let y = map(runningTotal, 0, years.globalTotalMax, height - 0.5, 10);

          //first control point
          if (i == 0) {
            splineVertex(x, y);
          }

          splineVertex(x, y);

          //last control point
          if (i == Object.keys(yearData.data).length - 1) {
            splineVertex(x, y);
          }

          i++;
        }
      endShape();
    }

  

    //top left text
    push()
    let startY = 10;
    labelBoxes = []
    for (const [yearLabel, yearData] of Object.entries(years.years)) {
      stroke(yearData.color);
      fill(yearData.color)
      textAlign(LEFT, TOP);
      textSize(17);
      strokeWeight(0);

      let w = textWidth(yearString(yearLabel, yearData));
      let h = textAscent(yearLabel) + textDescent(yearLabel);

      labelBoxes.push({
        year: String(yearLabel),
        x: 10,
        y: startY,
        w: w,
        h: h
      });
      
      text(yearString(yearLabel, yearData), 10, startY);
      startY += 20;
    }
    pop();

    //24hours
    if (!selectedYear) {
      util.drawGreenBox(type, daily);
    }

    noLoop();
  } 

}

function yearString(yearLabel, yearData) {
  let out = 'TI'+yearLabel.slice(-2)+'-BV'+yearData.biggest.value+'-T'+yearData.total;

  if (yearData.numberOfRains) {
    out += '-NOR'+yearData.numberOfRains;
  }
  return out;
}

function mousePressed() {
  for (let box of labelBoxes) {
    if (
      mouseX >= box.x &&
      mouseX <= box.x + box.w &&
      mouseY >= box.y &&
      mouseY <= box.y + box.h
    ) {
      if (box.year == selectedYear) {
        selectedYear = null;
      } else {
        selectedYear = box.year;
      }
      
      redraw();
      return;
    }
  }
}