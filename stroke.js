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


        ctx.beginPath();
        this.points.forEach((coordinate, index) => {
            if(index == 0){
                ctx.moveTo(coordinate[0],coordinate[1]);
            }
            else{
                ctx.lineTo(coordinate[0],coordinate[1]);
            }
        })
        ctx.stroke();
    }
}