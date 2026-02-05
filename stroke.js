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
        
    }
}