class Util {

    // getHighestValue(data) {
    //     let highestValue = 0;
    //     for (let i = 0; i < data.length; i++) {
    //         if (data[i] > highestValue) {
    //             highestValue = data[i];
    //         }
    //     }
    //     return highestValue;
    // }

   drawGreenBox(type, daily) {
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
                    'pres' : '#999933',
                    'hum'  : '#5566ff',
                    'clouds' : '#f5f6fa',
                    'rain' : '#666688',
                    'vis' : '#aaaaff'
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
            for (const [dataType, data] of Object.entries(daily.data)) { 
                push();
                    strokeWeight(1.75);
                    stroke(colors[dataType]);
                    noFill();
                    beginShape();
                        for (i = 0; i < data.length; i++) {
                            let x = map(i, 0, data.length, boxConfig.x, boxConfig.x + boxConfig.w + 12);
                            let y = map(data[i], daily.ranges[dataType].min, daily.ranges[dataType].max, boxConfig.y, boxConfig.h + boxConfig.y);
                            vertex(x, y);

                            if (i !== 0 && i !== data.length - 1 && i % 2 === 0) {
                                textSize(5);
                                //stroke('#578feb')
                                text('|', boxConfig.x-1, boxConfig.h-6)
                            }
                        }
                    endShape();
                pop();
            }
        }
   }
    

}