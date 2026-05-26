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

    draw(){
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = this.width;//already accounts for scale so no need to multiply this.width x scale

        ctx.beginPath();
        ctx.arc(this.point.x, this.point.y, ctx.lineWidth/2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }
}