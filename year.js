class Year {
    constructor(color, label) {
        let out = {
            values: Array.from({length: 365
            }, () => Math.floor(Math.random() * 101)),
            color: color,
            label: label
        };

        out.highestValue = this.getHighestValue(out.values); 

        return out;
    }

    getHighestValue(data) {
        let highestValue = 0;
        for (let i = 0; i < data.length; i++) {
            if (data[i] > highestValue) {
                highestValue = data[i];
            }
        }
        return highestValue;
    }
}