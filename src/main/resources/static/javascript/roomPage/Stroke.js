import {ctx} from "./canvasState.js"
import Point from "./Point.js";

export default class Stroke{

    type = "STROKE";
    uuid;
    phase;
    brushColor;
    bucketColor;
    width;
    points = [];
    fill;

    constructor({uuid, phase, brushColor, bucketColor, width, fill}){
        this.uuid = uuid;
        this.phase = phase;
        this.brushColor = brushColor;
        this.bucketColor = bucketColor;
        this.width = width;
        this.fill = fill;
    }

    static fromJson(data) {
        const points = data.points.map(p => new Point(p.x, p.y));
        const stroke = new Stroke({
            uuid: data.uuid,
            phase: data.phase,
            brushColor : data.brushColor,
            bucketColor : data.bucketColor,
            width : data.width,
            fill : data.fill
        });

        stroke.points = points
        return stroke;
    }

    addPoint(point){
        this.points.push(point);
    }

    draw(context){
        if(this.points.length === 0){
            return;
        }

        context.save();
        context.strokeStyle = this.brushColor;
        context.lineWidth = this.width;

        const points = this.points;
        context.beginPath();

        context.moveTo(points[0].x, points[0].y);
        for(let i = 1; i < points.length; i++){
            const point = points[i];
            context.lineTo(point.x, point.y);
        }

        if(this.phase === "COMPLETE" && this.fill){
            context.fillStyle = this.bucketColor;
            context.fill();
            context.closePath();
        }
        context.stroke();
        context.restore();
    }

}