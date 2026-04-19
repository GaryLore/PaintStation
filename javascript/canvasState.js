const canvas = document.getElementById("canvas");
console.log(canvas);
if (!canvas.getContext) {
  console.log("CANVAS IS NOT SUPPORTED PLEASE USE ANOTHER BROWSER");
} 
const ctx = canvas.getContext("2d");
canvas.width = 1280;
canvas.height = 720;

//fixes problem where if you resize browser the paint stroke isnt in the correct location
let rect = canvas.getBoundingClientRect();
window.addEventListener('resize', function() {
    rect = canvas.getBoundingClientRect();
});

const slider = document.getElementById("all_thickness");

const Tool = Object.freeze({
  BRUSH: 0,
  PANZOOM: 1,
});

const viewport = {
  x: 0,
  y: 0,
  scale: 1
};

const canvasState = {

  //allows drawing
  x1 : undefined,
  y1 : undefined,
  mouseDown : false,
  canDraw : false, 
  hasDrawn : false,
  tool : Tool.BRUSH, 
  viewportTransform : viewport,
  
  //handles history
  paintHistory : [],
  tempStroke : null,

  brush : {
    fill : false,
    color : "black",
    bucketColor :  "white",
    paintWidth : slider.valueAsNumber,
  },

  panZoom : {
    //allows pan & zoom
    GlobalOffsetX : 0,
    GlobalOffsetY : 0,
    previousX : undefined,
    previousY : undefined,
  },

  isPanning(){
     return this.tool == Tool.PANZOOM && this.mouseDown;
  },

  drawTo(x2,y2){
    ctx.lineTo(x2,y2);
    ctx.stroke();
  },

  /*
    we use scale functions instead of reassigning the width and height of the canvas according to the css 
    because we will be importing this to a server so we want the canvas height and width to be constant and not changing to the css which
    changes based on the screen size
  */
  scaleX(x){
    return (x/rect.width) * canvas.width;
  },

  scaleY(y){
    return (y/rect.height) * canvas.height;
  },

  render(){
    const viewportTransform = canvasState.viewportTransform;

    //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/restore
    ctx.save();
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(
      this.viewportTransform.scale,
      0,
      0,
      this.viewportTransform.scale,
      this.viewportTransform.x,
      this.viewportTransform.y
    );
    
    canvasState.paintHistory.forEach((paintObject) => paintObject.draw());
    this.drawBorder();
    ctx.restore();
  },

  drawBorder(){

    console.log("DRAW BORDER");
    ctx.fillStyle = "dimgray";

    ctx.beginPath();
    ctx.moveTo(-1920, -1080);
    ctx.lineTo(3200, -1080);
    ctx.lineTo(3200, 1800);
    ctx.lineTo(-1920, 1800);

    ctx.moveTo(-640, -360);
    ctx.lineTo(-640, 1080);
    ctx.lineTo(1920,1080);
    ctx.lineTo(1920, -360);

    ctx.fill();

  },

  reloadJustBorder(){
    ctx.save();
    ctx.setTransform(
      this.viewportTransform.scale,
      0,
      0,
      this.viewportTransform.scale,
      this.viewportTransform.x,
      this.viewportTransform.y
    );
    this.drawBorder();
    
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(canvasState.x1, canvasState.y1);
  }

};

ctx.strokeStyle = canvasState.brush.color;
ctx.fillStyle = canvasState.brush.bucketColor;
ctx.lineWidth = canvasState.brush.paintWidth;
//we set linecap and line join both to the same so the redraws with render are the same
ctx.lineCap = "round"; 
ctx.lineJoin = "round"; 
canvasState.render();

export {canvasState, Tool, canvas, ctx, rect, slider};