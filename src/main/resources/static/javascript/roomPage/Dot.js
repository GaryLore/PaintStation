import {ctx} from "./canvasState.js"
import Point from "./Point.js";

export default class Dot{

    type = "DOT";
    color;
    width;
    point;

    constructor({color, width, point}){
        this.color = color;
        this.width = width;
        this.point = point;
    }

    static fromJson(data) {
        return new Dot({
            color : data.color,
            width : data.width,
            point : new Point(data.point.x, data.point.y)
        });
    }

    draw(context){
        context.save();
        context.strokeStyle = this.color;
        context.fillStyle = this.color;
        context.lineWidth = this.width;//already accounts for scale so no need to multiply this.width x scale

        context.beginPath();
        context.arc(this.point.x, this.point.y, context.lineWidth/2, 0, 2 * Math.PI);
        context.fill();
        context.restore();
    }
}