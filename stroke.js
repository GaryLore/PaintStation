class Stroke{

    color;
    width;
    points = [];
    fill;

    constructor(color, width, fill){
        this.color = color;
        this.width = width;
        this.fill = fill;
    }

    addPoint(x,y){
        let point = [x,y];
        this.points.push(point);
    }

    draw(){

        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = this.width;

        const points = this.points;
        ctx.beginPath();
        ctx.moveTo(points[0][0],points[0][1]);
        for(let i = 1; i < points.length; i++){
            const coord = points[i];
            ctx.lineTo(coord[0], coord[1]);
        }

        if(this.fill){
            ctx.fill();
            ctx.closePath();
        }
        ctx.stroke();

    }

}