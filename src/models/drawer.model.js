import Grid from "./grid.model.js";
import Background from "./background.model.js";
import {versions as tankVersions} from "./tank.model.js";
import Tank from "./tank.model.js";

export const objects = [];
export const assets = {};

export let bg, grid;

export function preload() {
    httpGet('assets/tank-turret.svg', (turretSVG) => {
        assets['tank-turret'] = turretSVG;
        httpGet('assets/tank-body.svg', (bodySVG) => {
            assets['tank-body'] = bodySVG;

            tankVersions.forEach((version) => {
                version.setImage(turretSVG, bodySVG);
            });
        });
    });
}

export function setup() {
    createCanvas(displayWidth, displayHeight);
    bg = new Background();
    grid = new Grid(30, 20, 30, 40, 40);


    objects.push(new Tank(3, 3, 0));
}

export function draw() {
    bg.draw();
    //background(20, 150, 150);

    grid.draw();

    drawObjects(objects);

    if (keyIsDown(69) /* E */) {
        _.last(objects).move(0);
    }
    if (keyIsDown(68) /* D */) {
        _.last(objects).move(1);
    }
    if (keyIsDown(88) /* X */) {
        _.last(objects).move(2);
    }
    if (keyIsDown(89) /* Y */) {
        _.last(objects).move(3);
    }
    if (keyIsDown(65) /* A */) {
        _.last(objects).move(4);
    }
    if (keyIsDown(87) /* W */) {
        _.last(objects).move(5);
    }
}

export function polygon(x, y, radius, npoints) {
    const angle = TWO_PI / npoints;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        const sx = x + cos(a) * radius;
        const sy = y + sin(a) * radius;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

export function polygonOf(pg, x, y, radius, npoints) {
    const angle = TWO_PI / npoints;
    pg.beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        const sx = x + cos(a) * radius;
        const sy = y + sin(a) * radius;
        pg.vertex(sx, sy);
    }
    pg.endShape(CLOSE);
    return pg;
}

export function hex(x, y, radius) {
    push();
    translate(x, y);
    rotate(radians(30));
    polygon(0, 0, radius, 6);
    pop();
}

function drawObjects(objects) {
    objects.forEach(obj => {
        if (_.isFunction(obj.draw)) {
            obj.draw();
        }
    })
}