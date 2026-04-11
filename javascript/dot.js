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
        ctx.lineWidth = this.width;//already accounts for scale so no need to multiply this.width x scale

        ctx.beginPath();
        ctx.arc(this.x, this.y, ctx.lineWidth/2, 0, 2 * Math.PI);
        ctx.fill();
    }
}