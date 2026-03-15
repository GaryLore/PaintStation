class Bucket{

    color;
    points = [];

    constructor(color){
        this.color = color;
    }

    addPoint(x,y){
        let point = [x,y];
        this.points.push(point);
    }

    draw(){
        ctx.imageSmoothingEnabled = false
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = this.width;

        this.points.forEach((coordinate) => {
            ctx.fillRect(coordinate[0],coordinate[1],2,2);
        });

    }

    drawHidden(){
        ctxHidden.imageSmoothingEnabled = false
        ctxHidden.strokeStyle = this.color;
        ctxHidden.fillStyle = this.color;
        ctxHidden.lineWidth = this.width;

        this.points.forEach((coordinate) => {
            ctxHidden.fillRect(coordinate[0],coordinate[1],2,2);
        });

    }
}