class Stroke{

    color;
    width;
    points = [];

    constructor(color, width){
        this.color = color;
        this.width = width;
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
        ctx.stroke();
    
    }

    drawHidden(){
        ctxHidden.strokeStyle = this.color;
        ctxHidden.fillStyle = this.color;
        ctxHidden.lineWidth = this.width;

        const points = this.points;
        ctxHidden.beginPath();
        ctxHidden.moveTo(points[0][0],points[0][1]);
        for(let i = 1; i < points.length; i++){
            const coord = points[i];
            ctxHidden.lineTo(coord[0], coord[1]);
        }
        ctxHidden.stroke();

    }
}