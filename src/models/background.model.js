export default class {
    constructor() {
        push();
        noStroke();

        this.grass = this.generateGrass();
        pop();
    }

    draw() {
        image(this.grass, 0, 0, windowWidth, windowHeight);
    }

    generateGrass() {
        const pixel = {
            width: 4,
            height: 4,
        };

        const grass = createImage(windowWidth, windowHeight);
        grass.loadPixels();

        colorMode(HSB);
        _.range(0, windowWidth, pixel.width).forEach((x) => {
            _.range(0, windowHeight, pixel.height).forEach((y) => {
                const color = this.setFillColorForPosition(x, y);
                _.range(x, x + pixel.width).forEach((_x) => {
                    _.range(y, y + pixel.height).forEach((_y) => {
                        grass.set(_x, _y, color);
                    })
                });
            })
        });
        colorMode(RGB);
        grass.updatePixels();

        return grass;
    }

    setFillColorForPosition(x, y) {
        const rand = noise(0.01 * x, 0.01 * y);

        return color(
            map(rand, 0, 1, 128, 50),
            map(rand, 0, 1, 50, 60),
            map(rand, 0, 1, 40, 60),
            1
        )
    }
}
