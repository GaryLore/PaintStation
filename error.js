class Error{

    color;
    width;
    x;
    y;

    constructor(x, y){
        this.color = "#800000";
        this.width = 2;
        this.x = x;
        this.y = y;
    }

    draw(){
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = this.width;//already accounts for scale so no need to multiply this.width x scale

        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
        ctx.stroke();
    }

    drawHidden(){
        ctxHidden.strokeStyle = this.color;
        ctxHidden.fillStyle = this.color;
        ctxHidden.lineWidth = this.width;//already accounts for scale so no need to multiply this.width x scale

        ctxHidden.beginPath();
        ctxHidden.arc(this.x, this.y, 10, 0, 2 * Math.PI);
        ctxHidden.stroke();
    }

}