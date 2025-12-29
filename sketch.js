let now = new Date().toLocaleString();
let years;
let font;
let daily;
let celestial;

let serverUrl = "http://localhost:3000/weather/";
const urlParams = new URLSearchParams(window.location.search);

let type = urlParams.get("type");
let yearColors = ["#ff2200", "#f5f6fa", "#45936b", "#9966ff"];

let labelBoxes = [];
let selectedYear = JSON.parse(localStorage.getItem("selectedYear")) || [];

let supplementalDataBoxes = [];
let selectedSupplementalData =
  JSON.parse(localStorage.getItem("selectedSupplementalData")) || [];

let biggestBoys = [];
let runnersUp = [];

let util = new Util();

//TODO comfort dot
//24hr temp range can be historic low - historic high for that day - you can't get that from open-meteo, but you can get it from this api: https://dev.meteostat.net/api/point/daily.html#example
//TODO audo detect location? No, allow the user to enter a zip or address
//TODO show progress of sun and mooon in their procession across the sky

async function setup() {
  createCanvas(1200, 400);

  font = await loadFont("/assets/Antonio-Regular.ttf");
  background(0);

  fetch(serverUrl + "year?type=" + type)
    .then(r => r.json())
    .then(y => {
      years = y;
      let i = 0;
      for (const year of Object.keys(years.years)) {
        years.years[year].color = yearColors[i];
        i++;
      }
    });

  fetch(serverUrl + "last24hrs")
    .then(r => r.json())
    .then(d => {
      daily = d;
    });

  fetch(`${serverUrl}sun-moon`)
    .then(r => r.json())
    .then(c => {
      celestial = c;
    })
}

function draw() {
  background(0);
  stroke("red");
  noFill();
  rect(1, 1, width - 1, height - 1);

  if (!years) {
    drawLoadingIcon();
  }

  if (years && font) {
    textFont(font);

    drawDaily();

    drawDataLabels();

    drawCumulative();

    topLeftText();

    noLoop();
    timeStamp();
  } 

  if (daily) {
    if (selectedYear.length == 0) {
      drawGreenBox(type, daily, selectedSupplementalData);
    }
  }

  if (celestial) {
    drawCelestial()
  }
}

function drawLoadingIcon() {
  push();
  translate(width / 2, height / 2);
  rotate(frameCount * 0.1);
  noFill();
  stroke(255);
  strokeWeight(4);
  arc(0, 0, 40, 40, 0, PI * 1.5);
  pop();
}

function yearString(yearLabel, yearData) {
  let out =
    "TI" +
    yearLabel.slice(-2) +
    "-BV" +
    yearData.biggest.value +
    "-T" +
    yearData.total;

  if (yearData.numberOfRains) {
    out += "-NOR" + yearData.numberOfRains;
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
        selectedYear = selectedYear.filter((v) => v !== box.year);
      }

      localStorage.setItem("selectedYear", JSON.stringify(selectedYear));
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
        selectedSupplementalData = selectedSupplementalData.filter(
          (v) => v !== box.dataType
        );
      }
      localStorage.setItem(
        "selectedSupplementalData",
        JSON.stringify(selectedSupplementalData)
      );
      redraw();
      return;
    }
  }
}

function drawGreenBox(type, daily, selected) {
  let boxConfig = {};
  let colors = null;

  switch (type) {
    case "rain":
      boxConfig = {
        x: 200,
        y: 10,
        w: 300,
        h: 100,
      };
      colors = {
        temp: "#ff5555",
        pres: "#7ce839ff",
        hum: "#5a7dfcff",
        clouds: "#f5f6fa",
        rain: "#666688",
        vis: "#21dffcff",
      };
      break;
    case "temp":
      boxConfig = {
        x: 720,
        y: 290,
        w: 250,
        h: 90,
      };
      break;
  }

  fill(0, 0, 0, 100);
  stroke("red");
  rect(boxConfig.x, boxConfig.y, boxConfig.w, boxConfig.h);

  if (type == "rain") {
    if (daily.error) {
      push();
      textSize(32);
      fill("red");
      noStroke();
      textAlign(LEFT, TOP);
      text("ERROR", boxConfig.x + 20, boxConfig.y + 20);
      pop();
      return;
    }

    let labelX = boxConfig.x + boxConfig.w + 10;
    let startingLabelY = boxConfig.y;

    for (const [dataType, data] of Object.entries(daily.data)) {
      if (selected.length > 0 && !selected.includes(dataType)) {
        continue;
      }
      
      push();
      strokeWeight(1.75);
      stroke(colors[dataType]);
      noFill();
      beginShape();
      for (i = 0; i < data.length; i++) {
        if (daily.ranges[dataType].min > 0 || daily.ranges[dataType].max > 0) {
          let x = map(
            i,
            0,
            data.length,
            boxConfig.x + 1,
            boxConfig.x + boxConfig.w + 11
          );
          let y = map(
            data[i],
            daily.ranges[dataType].min,
            daily.ranges[dataType].max,
            boxConfig.h + boxConfig.y - 2,
            boxConfig.y + 2
          );
          vertex(x, y);

          if (i !== 0 && i !== data.length - 1 && i % 2 === 0) {
            textSize(5);
            //stroke('#578feb')
            text("|", x - 1, boxConfig.h + 3);
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
        h: textAscent(dataType) + textDescent(dataType),
      });
      startingLabelY += 18;
      pop();
    }
  }

  if (type == 'temp') {
    let startX = boxConfig.x + 5;
    let startY = boxConfig.y + 15;

    let minX = boxConfig.x + 5;
    let maxX = minX + (boxConfig.w - 10);

    for (const year of Object.values(years.years)) {
      pop();
        stroke(year.color);
        let endX = map(year.ranges.max, year.ranges.min, year.ranges.max, minX, maxX);
        line(minX, startY, (minX + year.ranges.spread) * 1.2, startY);
        startY += boxConfig.h * 0.23;
      push();
    }
  }
}

function drawDaily() {
  //daily
  for (const [yearLabel, yearData] of Object.entries(years.years)) {
    if (selectedYear.length > 0 && !selectedYear.includes(String(yearLabel))) {
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
      let x = map(i, 0, Object.keys(yearData.data).length - 1, 1, width - 2);
      let y = map(
        value,
        years.globalRange.min,
        years.globalRange.max,
        height - 2,
        2
      );

      if (date === yearData.biggest.date) {
        biggestBoys.push({
          year: yearLabel,
          x: x,
          y: y,
          color: yearData.color,
          string: value + "-" + date,
        });
      }

      if (yearData.runnersUp.some((o) => o.date === date)) {
        runnersUp.push({
          x: x,
          y: y,
          year: yearLabel,
          value: value,
          color: yearData.color,
          string: value + "-" + date,
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
  push();
  let startY = 10;
  labelBoxes = [];
  for (const [yearLabel, yearData] of Object.entries(years.years)) {
    stroke(yearData.color);
    fill(yearData.color);
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
      h: h,
    });

    text(yearString(yearLabel, yearData), 10, startY);

    if (selectedYear.includes(yearLabel)) {
      circle(
        x + textWidth(yearString(yearLabel, yearData)) + 7,
        startY + 10,
        8
      );
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
  let startingYDescent = 200;
  for (let i = 0; i < biggestBoys.length; i++) {
    if (
      selectedYear.length > 0 &&
      !selectedYear.includes(String(biggestBoys[i].year))
    ) {
      continue;
    }
    stroke(biggestBoys[i].color);
    fill(biggestBoys[i].color);
    textAlign(CENTER, TOP);
    textSize(21);
    strokeWeight(0.01);
    if (type == "rain") {
      text(biggestBoys[i].string, biggestBoys[i].x, biggestBoys[i].y);
    } else {
      text(
        biggestBoys[i].string,
        biggestBoys[i].x,
        biggestBoys[i].y + startingYDescent
      );
      strokeWeight(2);
      line(
        biggestBoys[i].x,
        biggestBoys[i].y,
        biggestBoys[i].x,
        biggestBoys[i].y + startingYDescent
      );
      startingYDescent +=
        textAscent(biggestBoys[i].string) + textDescent(biggestBoys[i].string);
    }
  }

  for (let i = 0; i < runnersUp.length; i++) {
    if (
      selectedYear.length > 0 &&
      !selectedYear.includes(String(runnersUp[i].year))
    ) {
      continue;
    }
    let biggest = years.years[runnersUp[i].year].biggest.value;
    stroke(runnersUp[i].color);
    fill(runnersUp[i].color);
    if (type == "rain") {
      //textSize(14);
      textSize(map(runnersUp[i].value, biggest * 0.75, biggest, 9, 20));
      text(runnersUp[i].string, runnersUp[i].x, runnersUp[i].y);
    } else {
      strokeWeight(1);
      let mapped = map(runnersUp[i].value, 0, biggest, 5, 26);
      line(
        runnersUp[i].x,
        runnersUp[i].y,
        runnersUp[i].x,
        runnersUp[i].y - mapped
      );
    }
  }
}

function timeStamp() {
  stroke("black");
  fill('black');
  textAlign(RIGHT);
  text(
    now,
    width - textWidth(now) + 130,
    height - (textAscent(now) + textDescent(now)) - 1
  );
}

function drawCelestial() {
  push();
  let x = 600;
  let startingCelestialY = 40;

  //sun
  drawCelestialLine('sun', x, startingCelestialY);
  
  //moon
  startingCelestialY += 40;
  drawCelestialLine('moon', x, startingCelestialY);
  pop();
}

function drawCelestialLine(body, x, y) {
  let celestialConfig = {
    sun: {
      lineBaseColor: '#44494bff',
      lineUpColor: '#3ab0efff',
      bodyUpStrokeColor: '#fbff02ff',
      bodyUpFillColor: '#f7fb1eff',
      bodyDownStrokeColor: '#8d8866ff',
      bodyDownFillColor: '#47463fff'
    },
    moon: {
      lineBaseColor: '#6a7276ff',
      lineUpColor: '#cad6dcff',
      bodyUpStrokeColor: '#9394a8ff',
      bodyUpFillColor: '#d8d9efff',
      bodyDownStrokeColor: '#62636fff',
      bodyDownFillColor: '#414248ff'
    }
  };
  let lineLength = 300; console.log(celestialConfig);

  push();
    //baseline
    stroke(celestialConfig[body].lineBaseColor);
    strokeWeight(4);
    line(x, y, x + lineLength, y);

    //rise, set, current position marker positions
    let riseX = map(convertTimeStringToMins(celestial.data[body].rise), 0, 1440, x, x + lineLength);
    let setX = map(convertTimeStringToMins(celestial.data[body].set), 0, 1440, x, x + lineLength);
    let currentX = map(convertTimeStringToMins(new Date().toTimeString().slice(0, 5)), 0, 1440, x, x + lineLength);

    //up sky
    stroke(celestialConfig[body].lineUpColor);
    noFill();
    line(riseX, y, setX - 3, y);

    strokeWeight(1);
    text('|', riseX + 2, y - 10);
    text('|', setX - 2, y-10);

    //current position
    if (currentX >= riseX && currentX <= setX) {
      stroke(celestialConfig[body].bodyUpStrokeColor);
      fill(celestialConfig[body].bodyUpFillColor);
    } else {
      stroke(celestialConfig[body].bodyDownStrokeColor);
      fill(celestialConfig[body].bodyDownStrokeColor);
    }
    circle(currentX, y, 20);
  pop();
}

function convertTimeStringToMins(time) {
  let [h, m] = time.split(':').map(Number);
  return (h * 60) + m;
}