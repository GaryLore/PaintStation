const canvas = document.getElementById("canvas");
console.log(canvas);
if (!canvas.getContext) {
  console.log("CANVAS IS NOT SUPPORTED PLEASE USE ANOTHER BROWSER");
}

const ctx = canvas.getContext("2d");
canvas.width = 1280;
canvas.height = 720;
const snapshotCanvas = new OffscreenCanvas(canvas.width, canvas.height);
const snapshot_ctx = snapshotCanvas.getContext("2d");

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

const snapshot_viewport = {
  x: canvas.width/4,
  y: canvas.height/4,
  skewingX: 0,
  skewingY: 0,
  scale: 1/2
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
  snapshotViewportTransform : snapshot_viewport,
  worldBounds : WORLD_BOUNDS,
  drawBounds : DRAW_Bounds,

  //socket settings
  buffer: undefined,
  bufferPreviousPoint: undefined,
  
  //handles history
  snapshotImage: null,
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

  render(context){
    context.save();
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    if(context === ctx) {
      this.setTransformCanvas();
    }
    else{
      this.setTransformSnapshotCanvas();
    }
    //load snapshot if there is one
    if(this.snapshotImage) {
      console.log("Snapshot drawn");
      context.drawImage(this.snapshotImage, canvasState.drawBounds.x, canvasState.drawBounds.y, canvasState.drawBounds.width, canvasState.drawBounds.height);//change magic numbers
    }
    canvasState.paintHistory.forEach((paintObject) => paintObject.draw(context));
    canvasState.drawBorder(context);
    context.restore();
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

  setTransformSnapshotCanvas(){
    snapshot_ctx.resetTransform();
    snapshot_ctx.setTransform(
        this.snapshotViewportTransform.scale,
        this.snapshotViewportTransform.skewingX,
        this.snapshotViewportTransform.skewingY,
        this.snapshotViewportTransform.scale,
        this.snapshotViewportTransform.x,
        this.snapshotViewportTransform.y
    );
  },

  drawBorder(context){
    context.fillStyle = "dimgray";

    const {
      x: outerX,
      y: outerY,
      width: outerWidth,
      height: outerHeight
    } = this.worldBounds;

    context.beginPath();
    context.moveTo(outerX, outerY);
    context.lineTo(outerX + outerWidth, outerY);
    context.lineTo(outerX + outerWidth, outerY + outerHeight);
    context.lineTo(outerX, outerY + outerHeight);

    const {
      x: innerX,
      y: innerY,
      width: innerWidth,
      height: innerHeight
    } = this.drawBounds;

    context.moveTo(innerX, innerY);
    context.lineTo(innerX, innerY + innerHeight);
    context.lineTo(innerX + innerWidth, innerY + innerHeight);
    context.lineTo(innerX + innerWidth, innerY);

    context.fill();
  },


  reloadJustBorder(context){
    context.save();
    context.setTransform(
      this.viewportTransform.scale,
      this.viewportTransform.skewingX,
      this.viewportTransform.skewingY,
      this.viewportTransform.scale,
      this.viewportTransform.x,
      this.viewportTransform.y
    );
    this.drawBorder(context);
    context.restore();
  },

  writeHistory(){
    console.log("BEGIN PAINT HISTORY");
    console.log("HISTORY LENGTH: ", this.paintHistory.length);
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
snapshot_ctx.lineCap = "round";
snapshot_ctx.lineJoin = "round";

canvasState.render(ctx);

export {canvasState, Tool, canvas, snapshotCanvas, ctx, snapshot_ctx, rect, slider};