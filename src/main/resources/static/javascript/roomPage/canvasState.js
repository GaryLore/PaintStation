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
  skewingX: 0,
  skewingY: 0,
  scale: 1
};

const WORLD_BOUNDS = {
  x: -1920,
  y: -1080,
  width: 5120,
  height: 2880,
};

const DRAW_Bounds = {
  x: -640,
  y: -360,
  width: 2560,
  height: 1440,
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
  worldBounds : WORLD_BOUNDS,
  drawBounds : DRAW_Bounds,

  //socket settings
  buffer: undefined,
  bufferPreviousPoint: undefined,
  
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
     return this.tool === Tool.PANZOOM && this.mouseDown;
  },

  drawTo(x2,y2){
    ctx.beginPath()
    ctx.moveTo(this.x1, this.y1);
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
    ctx.save();
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.setTransformCanvas();
    canvasState.paintHistory.forEach((paintObject) => paintObject.draw());
    this.drawBorder();
    ctx.restore();
  },

  setTransformCanvas(){
    ctx.resetTransform();
    ctx.setTransform(
        this.viewportTransform.scale,
        this.viewportTransform.skewingX,
        this.viewportTransform.skewingY,
        this.viewportTransform.scale,
        this.viewportTransform.x,
        this.viewportTransform.y
    );
  },

  drawBorder(){
    ctx.fillStyle = "dimgray";

    const {
      x: outerX,
      y: outerY,
      width: outerWidth,
      height: outerHeight
    } = this.worldBounds;

    ctx.beginPath();
    ctx.moveTo(outerX, outerY);
    ctx.lineTo(outerX + outerWidth, outerY);
    ctx.lineTo(outerX + outerWidth, outerY + outerHeight);
    ctx.lineTo(outerX, outerY + outerHeight);

    const {
      x: innerX,
      y: innerY,
      width: innerWidth,
      height: innerHeight
    } = this.drawBounds;

    ctx.moveTo(innerX, innerY);
    ctx.lineTo(innerX, innerY + innerHeight);
    ctx.lineTo(innerX + innerWidth, innerY + innerHeight);
    ctx.lineTo(innerX + innerWidth, innerY);

    ctx.fill();
  },


  reloadJustBorder(){
    ctx.save();
    ctx.setTransform(
      this.viewportTransform.scale,
      this.viewportTransform.skewingX,
      this.viewportTransform.skewingY,
      this.viewportTransform.scale,
      this.viewportTransform.x,
      this.viewportTransform.y
    );
    this.drawBorder();
    ctx.restore();
  },

  writeHistory(){
    console.log("BEGIN PAINT HISTORY");
    this.paintHistory.forEach((paintObject) => console.log("    ",paintObject.constructor.name, paintObject));
    console.log("END");
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