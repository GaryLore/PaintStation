class Bucket{

    color;
    shapes = [];

    constructor(color){
        this.color = color;
    }

    addPoint(shapeIndex,x,y){
        let point = [x,y];
        this.shapes[shapeIndex].push(point);
    }

    createShape(){
        this.shapes.push([]);
    }

    draw(){
        ctx.imageSmoothingEnabled = false
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = 1;

        ctx.beginPath();
        this.shapes.forEach((shape) => {

            shape.forEach((coordinate, index) => {
            if(index == 0){
                ctx.moveTo(coordinate[0],coordinate[1]);
            }
            else{
                ctx.lineTo(coordinate[0],coordinate[1]);
            }
            });
            
        })
        ctx.fill();
        ctx.stroke();
    }

    drawHidden(){
        ctxHidden.imageSmoothingEnabled = false
        ctxHidden.strokeStyle = this.color;
        ctxHidden.fillStyle = this.color;
        ctxHidden.lineWidth = 1;

        ctxHidden.beginPath();
        this.shapes.forEach((shape) => {

            shape.forEach((coordinate, index) => {
            if(index == 0){
                ctxHidden.moveTo(coordinate[0],coordinate[1]);
            }
            else{
                ctxHidden.lineTo(coordinate[0],coordinate[1]);
            }
            });
            
        })
        ctxHidden.fill();
        ctxHidden.stroke();
    }

}