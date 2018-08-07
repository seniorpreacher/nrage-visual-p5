import {grid} from "./drawer.model.js";

class TankVersion {
    constructor(baseColor, midColor, darkColor) {
        this.turret = null;
        this.body = null;
        this.colors = {
            light: baseColor,
            midlight: midColor,
            dark: darkColor
        }
    }

    setImage(turretSVG, bodySVG) {
        const newStyle = `
            .light{fill: ${this.colors.light}}
            .midlight{fill: ${this.colors.midlight}}
            .dark{fill: ${this.colors.dark}}
        </style>`;

        loadImage('data:image/svg+xml;utf8,' + turretSVG.replace(/\n/g, '').replace('</style>', newStyle), (img) => {
            this.turret = img;
            this.turret._modified = true;
        });

        loadImage('data:image/svg+xml;utf8,' + bodySVG.replace(/\n/g, '').replace('</style>', newStyle), (img) => {
            this.body = img;
            this.body._modified = true;
        });
    }
}

export const versions = [
    new TankVersion('#ADA282', '#81785E', '#5C5042'),  // tan
    new TankVersion('#EF5350', '#E53935', '#B71C1C'),  // red
    new TankVersion('#AB47BC', '#8E24AA', '#4A148C'),  // purple
    new TankVersion('#5C6BC0', '#3949AB', '#1A237E'),  // dark blue
    new TankVersion('#64B5F6', '#2196F3', '#1565C0'),  // light blue
    new TankVersion('#26A69A', '#00897B', '#004D40'),  // teal
    new TankVersion('#9CCC65', '#7CB342', '#33691E'),  // green
    new TankVersion('#FFEE58', '#FDD835', '#F9A825'),  // yellow
    new TankVersion('#FFA726', '#FB8C00', '#E65100'),  // orange
    new TankVersion('#8D6E63', '#6D4C41', '#3E2723'),  // brown
    new TankVersion('#78909C', '#546E7A', '#263238'),  // orange
];

const settings = {
    rotatingSpeed: {
        body: 5,
        turret: 1,
    },
    movingSpeed: 3
};

export default class {
    constructor(col, row, versionId) {
        this.col = col;
        this.row = row;
        this.life = 100;
        this.isMoving = false;
        this.isBodyRotating = false;
        this.isTurretRotating = false;
        this.desiredDirection = false;
        this.position = grid.getCoordsForPosition(col, row);

        this.rotation = {
            body: 30,
            turret: 30
        };

        if (_.inRange(versionId, 0, versions.length - 1)) {
            this.version = versions[versionId];
        } else {
            this.version = _.sample(versions);
        }
    }

    _getCoordsForDirection(direction) {
        // https://www.redblobgames.com/grids/hexagons/#neighbors-offset
        let modifier;
        if (this.row % 2) {
            modifier = [[1, -1], [1, 0], [1, 1], [0, 1], [-1, 0], [0, -1]];
        } else {
            modifier = [[0, -1], [1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
        }

        const newCol = this.col + modifier[direction][0];
        const newRow = this.row + modifier[direction][1];

        if (!grid.isValidCoord(newCol, newRow)) {
            return {col: this.col, row: this.row}
        }

        return {col: newCol, row: newRow}
    }

    move(direction) {
        if (direction < 0 || direction > 5) {
            throw new Error('Invalid direction argument')
        }

        if (this.isBodyRotating || this.isTurretRotating || this.isMoving) {
            console.error('Another action is in action. Don\'t action more!');
            return;
        }

        this.desiredDirection = direction;
        this.desiredLocation = this._getCoordsForDirection(direction);
    }

    _isBodyPointToDirection(direction) {
        if (this.rotation.body < 0) {
            this.rotation.body += 360;
        }
        if (this.rotation.body > 360) {
            this.rotation.body -= 360;
        }
        let current = this.rotation.body % 360;
        return _.range(current - settings.rotatingSpeed.body - 2, current + settings.rotatingSpeed.body + 3).indexOf(30 + (direction * 60)) !== -1;
    }

    _getBodyRotationToDirection(direction) {
        const preCheck = (this.rotation.body % 360) + 360 - (30 + (direction * 60));
        if (preCheck < 180) {
            return -1 * settings.rotatingSpeed.body;
        } else if (preCheck > 540) {
            return settings.rotatingSpeed.body;
        }
        let current = (30 + (direction * 60)) - (this.rotation.body % 360);
        return current > 0 ? settings.rotatingSpeed.body : -1 * settings.rotatingSpeed.body;
    }

    _updateDetailsInDrawTick() {
        if (this.desiredDirection !== null) {
            if (!this._isBodyPointToDirection(this.desiredDirection)) {
                this.isBodyRotating = true;
                let bodyRotation = this._getBodyRotationToDirection(this.desiredDirection);
                this.rotation.body += bodyRotation;
                this.rotation.turret += bodyRotation;
            } else {
                this.isBodyRotating = false;
                this.rotation.body = (30 + (this.desiredDirection * 60));
                this.rotation.turret = (30 + (this.desiredDirection * 60));
                this.desiredDirection = null;
            }
            return;
        }

        if (!this.isBodyRotating && this.desiredLocation) {
            const desiredPosition = grid.getCoordsForPosition(this.desiredLocation.col, this.desiredLocation.row);
            if (this.position.x > desiredPosition.x - settings.movingSpeed && this.position.x < desiredPosition.x + settings.movingSpeed &&
                this.position.y > desiredPosition.y - settings.movingSpeed && this.position.y < desiredPosition.y + settings.movingSpeed) {

                this.isMoving = false;
                this.col = this.desiredLocation.col;
                this.row = this.desiredLocation.row;
                this.position.x = round(desiredPosition.x);
                this.position.y = round(desiredPosition.y);
                this.desiredLocation = null;
            } else {
                this.isMoving = true;

                const movingVector = createVector(desiredPosition.x - this.position.x, desiredPosition.y - this.position.y)
                    .normalize()
                    .mult(settings.movingSpeed);
                const newPosition = this.position.add(movingVector);
                this.position.x = newPosition.x;
                this.position.y = newPosition.y;
            }

        }
    }

    draw() {
        this._updateDetailsInDrawTick();

        this._drawTitle();
        this._drawBody();
        this._drawTurret();
    }

    _drawTitle() {
        push();
        strokeWeight(1);
        stroke(250, 250, 250, 80);
        fill(250, 250, 250, 60);
        rect(this.position.x - 15, this.position.y + 16, 30, 16);

        textSize(12);
        textAlign(CENTER);
        textStyle(BOLD);
        textFont('Roboto');
        fill(20, 20, 20);
        text(this.life + '%', this.position.x, this.position.y + 28);
        pop();
    }

    _drawBody() {
        if (!this.version.body) return;

        push();

        translate(this.position.x, this.position.y);
        rotate(radians(this.rotation.body));

        imageMode(CENTER);
        image(this.version.body, 0, 0, this.version.body.width / 2.5, this.version.body.height / 2.5);

        pop();
    }

    _drawTurret() {
        if (!this.version.turret) return;

        push();

        translate(this.position.x, this.position.y);
        rotate(radians(this.rotation.turret));

        imageMode(CENTER);
        image(this.version.turret, 0, 0, this.version.turret.width / 2.5, this.version.turret.height / 2.5);

        pop();
    }
}
