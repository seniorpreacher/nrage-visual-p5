import {hex} from "./drawer.model.js";

const FILL_COLOR = [220, 220, 220, 20];
const STROKE_COLOR = [220, 220, 220, 60];

class Cell {
    constructor(grid, coordX, coordY, cellSize, xOffset, yOffset) {
        this.grid = grid;
        this.coordX = coordX;
        this.coordY = coordY;
        this.cellSize = cellSize;
        this.xOffset = xOffset;
        this.yOffset = yOffset;

        const newCoords = grid.getCoordsForPosition(coordX, coordY);

        this.x = newCoords.x;
        this.y = newCoords.y;
    }

    draw() {
        stroke(STROKE_COLOR);
        fill(FILL_COLOR);

        hex(this.x, this.y, this.cellSize);
    }
}

export default class {
    constructor(width, height, cellSize, xOffset, yOffset) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.xOffset = xOffset;
        this.yOffset = yOffset;

        this.cells = [];

        _.range(this.width).forEach((col) => {
            _.range(this.height).forEach((row) => {
                this.cells.push(new Cell(this, col, row, cellSize, xOffset, yOffset));
            })
        });
    }

    draw() {
        this.cells.forEach((cell) => cell.draw());
    }

    getCoordsForPosition(col, row) {
        let coords = {x: null, y: null};

        if (row % 2 === 0) {
            coords.x = col * this.cellSize * 2 + this.xOffset;
        } else {
            coords.x = col * this.cellSize * 2 + this.cellSize + this.xOffset;
        }

        coords.y = row * this.cellSize * 1.7 + this.yOffset;
        return new p5.Vector(coords.x, coords.y);
    }

    isValidCoord(col, row) {
        return (col >= 0 && col < this.width) && (row >= 0 && row < this.height);
    }
}
