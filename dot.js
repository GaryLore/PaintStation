class Dot{

    color;
    width;
    x;
    y;

    constructor(color, width, x, y){
        this.color = color;
        this.width = width;
        this.x = x;
        this.y = y;
    }

    draw(){
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = this.width;

        ctx.beginPath();
        ctx.arc(this.x, this.y, ctx.lineWidth/2, 0, 2 * Math.PI);
        ctx.fill();
    }

}