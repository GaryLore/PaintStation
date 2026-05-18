import {ctx} from "./canvasState.js"
import Point from "./Point.js";

export default class Stroke{

    type = "STROKE";
    phase;
    brushColor;
    bucketColor;
    width;
    points = [];
    fill;

    constructor(phase, brushColor, bucketColor, width, fill){
        this.phase = phase;
        this.brushColor = brushColor;
        this.bucketColor = bucketColor;
        this.width = width;
        this.fill = fill;
    }

    static fromJson(data) {
        const points = data.points.map(p => new Point(p.x, p.y));
        const stroke = new Stroke(data.phase, data.brushColor, data.bucketColor, data.width, data.fill);
        stroke.points = points
        return stroke;
    }

    addPoint(point){
        this.points.push(point);
    }

    draw(){

        ctx.save();
        ctx.strokeStyle = this.brushColor;
        ctx.lineWidth = this.width;

        const points = this.points;
        ctx.beginPath();
        ctx.moveTo(points[0].x,points[0].y);
        for(let i = 1; i < points.length; i++){
            const point = points[i];
            ctx.lineTo(point.x, point.y);
        }

        if(this.phase === "COMPLETE" && this.fill){
            ctx.fillStyle = this.bucketColor;
            ctx.fill();
            ctx.closePath();
        }
        ctx.stroke();
        ctx.restore();
    }

}