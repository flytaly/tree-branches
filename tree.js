import * as dat from 'dat.gui';

const MAX_BRANCHES = 500_000;

export function randomBetween(low, high) {
    return Math.random() * (high - low) + low;
}

function calcNextAngles(angle) {
    let angleMax = angle + Math.PI / 4;
    let angleMin = angle - Math.PI / 4;
    let angleDiff = randomBetween(0, angleMax - angleMin - Math.PI / 16);
    let angle1 = angleMax - angleDiff / 2;
    let angle2 = angleMin + angleDiff / 2;
    return { angle1, angle2 };
}

export class Tree {
    /**
     * @arg {Object} props
     * @arg {Object} props.params
     * @arg {()=>void} props.onParamsChange
     * @arg {CanvasRenderingContext2D} props.context
     * @arg {bool} props.withGui
     * */
    constructor({ context, params, onParamsChange, withGui } = {}) {
        this.params = {
            finalLength: 10,
            minLenReduction: 0.7,
            maxLenReduction: 0.9,
            minWeightReduction: 0.6,
            maxWeightReduction: 0.8,
            color: '#1e1e1e',
            ...(params ? params : {}),
        };
        this.onParamsChange = onParamsChange;
        this.count = 0;
        this.context = context;
        if (withGui) {
            this.initDatGui();
        }
    }

    line(x0, y0, x1, y1) {
        this.context.beginPath();
        this.context.moveTo(x0, y0);
        this.context.lineTo(x1, y1);
        this.context.stroke();
    }

    initDatGui() {
        this.gui = new dat.GUI();
        this.gui.add(this.params, 'finalLength', 3, 40).onFinishChange(this.onParamsChange);
        this.gui.add(this.params, 'minLenReduction', 0.3, 0.9).onFinishChange(this.onParamsChange);
        this.gui.add(this.params, 'maxLenReduction', 0.3, 0.95).onFinishChange(this.onParamsChange);
        this.gui.add(this.params, 'minWeightReduction', 0.2, 1.0).onFinishChange(this.onParamsChange);
        this.gui.addColor(this.params, 'color').onFinishChange(this.onParamsChange);
    }

    /** @arg {[number, number]} startPoint */
    drawTree(startPoint) {
        this.params.count = 0;
        let endpoint = [startPoint[0], startPoint[1] - 50];
        let length = randomBetween(90, 120);
        let weight = randomBetween(20, 35);
        this.context.lineWidth = weight;
        this.context.strokeStyle = this.params.color;
        this.line(startPoint[0], startPoint[1], endpoint[0], endpoint[1]);
        let branchAngle = Math.PI / 2;
        this.branch(endpoint, weight, length, branchAngle);
    }

    branch(startPoint, weight, length, angle) {
        this.count++;
        if (this.count > MAX_BRANCHES) {
            console.log('Too many branches', this.count);
            return;
        }
        // 𝑥1=𝑥+𝑛cos𝜃
        // 𝑦1=𝑦+𝑛sin𝜃
        let x1 = startPoint[0] + length * Math.cos(angle);
        let y1 = startPoint[1] - length * Math.sin(angle);
        let endpoint = [x1, y1];

        this.context.lineWidth = weight;
        this.line(startPoint[0], startPoint[1], endpoint[0], endpoint[1]);

        const { angle1, angle2 } = calcNextAngles(angle);

        let newWeight = randomBetween(weight * this.params.minWeightReduction, weight * this.params.maxWeightReduction);
        let newLength = randomBetween(length * this.params.minLenReduction, length * this.params.maxLenReduction);

        if (newLength < this.params.finalLength) {
            return;
        }

        this.branch(endpoint, newWeight, newLength, angle1);
        this.branch(endpoint, newWeight, newLength, angle2);
    }
}
