//canvas 
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

//canvas paintbrush properties
const Options = Object.freeze({
  BRUSH: 0,
  PANZOOM: 1,
});

const viewport = {
        x: 0,
        y: 0,
        scale: 1
      };

const canvasState = {
  //brush settings
  fill : false,
  colorBrush : "black",
  bucketColor :  "white",
  option : Options.BRUSH,
  paintWidth : slider.valueAsNumber,

  //handles history
  paintHistory : [],
  tempStroke : null,

  //allows drawing
  x1 : undefined,
  y1 : undefined,
  isDraw : false, //checks if drawing is allowed
  mouseDrawing : false, //has there been any actual movement to draw

  //allows pan & zoom
  mouseDown : false,
  GlobalOffsetX : 0,
  GlobalOffsetY : 0,
  viewportTransform : viewport,
  previousX : 0,
  previousY : 0
};

ctx.strokeStyle = canvasState.colorBrush;
ctx.fillStyle = canvasState.bucketColor;
ctx.lineWidth = canvasState.paintWidth;
//we set linecap and line join both to the same so the redraws with render are the same
ctx.lineCap = "round"; 
ctx.lineJoin = "round"; 

function render(){
  //save and restore is to put each paint settings back to normal after redrwaing everything which can change the paint settings
  const viewportTransform = canvasState.viewportTransform;

  ctx.save();
  ctx.resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(
    viewportTransform.scale,
    0,
    0,
    viewportTransform.scale,
    viewportTransform.x,
    viewportTransform.y
  );

  drawBorder();
  canvasState.paintHistory.forEach((e) => e.draw());
  ctx.restore();
}

function drawBorder(){
  ctx.fillStyle = "dimgray";
  ctx.fillRect(-1920, -1080, 5120, 2880);

  ctx.fillStyle = "white";
  ctx.fillRect(-640, -360, 2560, 1440);
}

export {canvasState, Options, render, canvas, ctx, rect, slider};