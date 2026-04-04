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
        ctx.lineWidth = 2;//to avoid pixel problems do to pixel allignment generating a slightly different color

        const shapes = this.shapes;
        ctx.beginPath();
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];

            //first accesses the [point] then x or y with the next bracket
            ctx.moveTo(shape[0][0], shape[0][1]);
            for (let j = 1; j < shape.length; j++) {
                const coord = shape[j];
                ctx.lineTo(coord[0], coord[1]);
            }
        }
        ctx.fill();
        //ctx.strokeStyle = '#000000';
        ctx.stroke();
    }

    drawHidden(){
        
        ctxHidden.imageSmoothingEnabled = false
        ctxHidden.strokeStyle = this.color;
        ctxHidden.fillStyle = this.color;
        ctxHidden.lineWidth = 2;

        //used to use forEach function however this is more efficient 
        const shapes = this.shapes;
        ctxHidden.beginPath();
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];

            //first accesses the [point] then x or y with the next bracket
            ctxHidden.moveTo(shape[0][0], shape[0][1]);

            for (let j = 1; j < shape.length; j++) {
                const coord = shape[j];
                ctxHidden.lineTo(coord[0], coord[1]);
            }
        }
        ctxHidden.fill();
        //ctxHidden.strokeStyle = '#DAA520';
        //ctxHidden.strokeStyle = '#000000';
        ctxHidden.stroke();// if you include this there is tehcnically less directions over 8, however each time you paint the same line drawn gets smaller
        
    }

}