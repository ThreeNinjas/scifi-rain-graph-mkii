let years;
let font;
let daily;


let serverUrl = 'http://localhost:3000/weather/';
const urlParams = new URLSearchParams(window.location.search);

let type = urlParams.get('type');
let yearColors = ['#ff2200', '#f5f6fa', '#45936b', '#9966ff']

let labelBoxes = [];
let selectedYear = [];

let supplementalDataBoxes = [];
let selectedSupplementalData = [];

let biggestBoys = [];
let runnersUp = [];

let util = new Util();

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

function draw() {
  background(0);

  if (!years) {
    drawLoadingIcon();
  }

  if (years && font) {
    textFont(font);
    
    drawDaily();

    drawDataLabels();

    drawCumulative();

    topLeftText();

    if (selectedYear.length == 0) {
      drawGreenBox(type, daily, selectedSupplementalData);
    }

    noLoop();
  } 

}

function drawLoadingIcon() {
  push()
      translate(width / 2, height / 2);
      rotate(frameCount * 0.1);
      noFill();
      stroke(255);
      strokeWeight(4);
      arc(0, 0, 40, 40, 0, PI * 1.5);
    pop()
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
      if (!selectedYear.includes(box.year)) {
        selectedYear.push(box.year);
      } else {
        selectedYear = selectedYear.filter(v => v !== box.year);
      }


      // if (box.year == selectedYear) {
      //   selectedYear = null;
      // } else {
      //   selectedYear = box.year;
      // }
      
      redraw();
      return;
    }
  }

  for (let box of supplementalDataBoxes) {
     if (
      mouseX >= box.x &&
      mouseX <= box.x + box.w &&
      mouseY >= box.y &&
      mouseY <= box.y + box.h
    ) {
      if (!selectedSupplementalData.includes(box.dataType)) {
        selectedSupplementalData.push(box.dataType);
      } else {
        selectedSupplementalData = selectedSupplementalData.filter(v => v !== box.dataType);
      }
      redraw();
      return;
    }
  }
}

function drawGreenBox(type, daily, selected) {
    let boxConfig = {};
    let colors = null;

    switch (type) {
        case 'rain':
            boxConfig = {
                x: 200,
                y: 10,
                w: 300,
                h: 100,
            };
            colors = {
                'temp' : '#ff5555',
                'pres' : '#7ce839ff',
                'hum'  : '#5a7dfcff',
                'clouds' : '#f5f6fa',
                'rain' : '#666688',
                'vis' : '#21dffcff'
            };
            break;  
        case 'temp':
            boxConfig = {
                x: 700,
                y: 250,
                w: 250,
                h: 125,
            };
            break;
    }

    fill('black'); 
    stroke('red')
    rect(boxConfig.x, boxConfig.y, boxConfig.w, boxConfig.h);
    
    if (type == 'rain') {
        if (daily.error) {
            push();
                textSize(32);
                fill('red');
                noStroke();
                textAlign(LEFT, TOP);
                text('ERROR', boxConfig.x + 20, boxConfig.y + 20);
            pop();
            return;
        }

        let labelX = boxConfig.x + boxConfig.w + 10;
        let startingLabelY = boxConfig.y;

        for (const [dataType, data] of Object.entries(daily.data)) { 
            if (selected.length > 0 && !selected.includes(dataType)) {
                continue;
            }
                console.log('doing it');
                push();
                strokeWeight(1.75);
                stroke(colors[dataType]);
                noFill();
                beginShape();
                    for (i = 0; i < data.length; i++) {
                        if (daily.ranges[dataType].min > 0 || daily.ranges[dataType].max > 0) {
                            let x = map(i, 0, data.length, boxConfig.x, boxConfig.x + boxConfig.w + 12);
                            let y = map(data[i], daily.ranges[dataType].min, daily.ranges[dataType].max, boxConfig.h + boxConfig.y, boxConfig.y);
                            vertex(x, y);

                            if (i !== 0 && i !== data.length - 1 && i % 2 === 0) {
                            textSize(5);
                            //stroke('#578feb')
                            text('|', x-1, boxConfig.h+3)
                        }
                        }
                        
                        
                    }
                endShape();
            pop();
        }

        for (const [dataType, data] of Object.entries(daily.data)) {
            push();
                //labels
                textAlign(LEFT, TOP);
                fill(colors[dataType]);
                
                noStroke();
                

                if (selected.includes(dataType)) {
                    textSize(14);
                    circle(labelX + textWidth(dataType) + 7, startingLabelY + 10, 8);
                } else {
                    textSize(12);
                }
                text(dataType, labelX, startingLabelY);
                supplementalDataBoxes.push({
                dataType: dataType,
                x: labelX,
                y: startingLabelY,
                w: textWidth(dataType),
                h: textAscent(dataType) + textDescent(dataType)
              });
                startingLabelY += 18;
            pop();


            
        }
    }
}

function drawDaily() {
  //daily
    for (const [yearLabel, yearData] of Object.entries(years.years)) {
      if (selectedYear.length > 0 &&  !selectedYear.includes(String(yearLabel))) {
        continue;
      } 

      //draw daily data
      push();
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
              year: yearLabel,
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
      pop();
    }
}

function topLeftText() {
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

      let x = 10;

      labelBoxes.push({
        year: String(yearLabel),
        x: x,
        y: startY,
        w: w,
        h: h
      });
      
      text(yearString(yearLabel, yearData), 10, startY);

      if (selectedYear.includes(yearLabel)) {
        circle(x + textWidth(yearString(yearLabel, yearData)) + 7, startY + 10, 8);
      }
      startY += 20;
    }
    pop();
}

function drawCumulative() {
  for (const [yearLabel, yearData] of Object.entries(years.years)) {
      if (selectedYear.length > 0 && !selectedYear.includes(yearLabel)) {
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
}

function drawDataLabels() {
  //label our outstanding days
    for (let i = 0; i < biggestBoys.length; i++) {
      if (selectedYear.length > 0 && !selectedYear.includes(String(biggestBoys[i].year))) {
        continue;
      } 
      stroke(biggestBoys[i].color);
      fill(biggestBoys[i].color);
      textAlign(CENTER, TOP);
      textSize(19);
      strokeWeight(0.01)
      text(biggestBoys[i].string, biggestBoys[i].x, biggestBoys[i].y);
    }
   
    for (let i = 0; i < runnersUp.length; i++) {
      if (selectedYear.length > 0 &&  !selectedYear.includes(String(runnersUp[i].year))) {
        continue;
      }
      let biggest = years.years[runnersUp[i].year].biggest.value;
      stroke(runnersUp[i].color);
      fill(runnersUp[i].color);
      if (type == 'rain') {
        //textSize(14);
        textSize(map(runnersUp[i].value, biggest*0.75, biggest, 12, 19));
        text(runnersUp[i].string, runnersUp[i].x, runnersUp[i].y);
      } else {
        strokeWeight(1);
        let mapped = map(runnersUp[i].value, 0, biggest, 5, 26)
        line(runnersUp[i].x, runnersUp[i].y, runnersUp[i].x, runnersUp[i].y-mapped);
      }
    }
}