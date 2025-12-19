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

        //first control point
        if (i == 0) {
          splineVertex(x, y);
        }

        splineVertex(x, y);

        //last control point
        if (i == year.values.length) {
          splineVertex(x, y);
        }
      }
    endShape();
  }

    
  // let startY = 10;

  // //lines
  // for (let year of Object.values(years)) { 
  //   if (selectedYear && year != selectedYear) {
  //     continue;
  //   }
  //   strokeWeight(3);
  //   stroke(year.color);
  //   noFill();
  //   beginShape();
  //     for (let i = 0; i < year.values.length; i++) {
  //       let x = map(i, 0, year.values.length - 1, 0, width);
  //       let y = map (year.values[i], 0, year.highestValue, height, 0);

  //       //first control point
  //       if (i == 0) {
  //         splineVertex(x, y);
  //       }

  //       splineVertex(x, y);

  //       //last control point
  //       if (i == year.values.length) {
  //         splineVertex(x, y);
  //       }
  //     }
  //   endShape();
  // }

  // //labels
  // labelBoxes = [];
  // for (let year of Object.values(years)) {
  //   stroke(year.color);
  //   textAlign(LEFT, TOP);
  //   strokeWeight(1);

  //   let w = textWidth(year.label);
  //   let h = textAscent(year.label) + textDescent(year.label);

  //   labelBoxes.push({
  //     year: year,
  //     x: 10,
  //     y: startY,
  //     w: w,
  //     h: h
  //   });

  //   text(year.label, 10, startY);
  //   startY += 20;
  // }

  // noLoop();