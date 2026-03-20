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
        ctx.lineWidth = this.width;

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
        ctx.stroke();

    }

}