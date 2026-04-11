//canvas 
const canvas = document.getElementById("canvas");
console.log(canvas);
if (!canvas.getContext) {
  console.log("CANVAS IS NOT SUPPORTED PLEASE USE ANOTHER BROWSER");
} 
const ctx = canvas.getContext("2d");
let rect = canvas.getBoundingClientRect();
canvas.width = 1280;
canvas.height = 720;

//fixes problem where if you resize browser the paint stroke isnt in the correct location
window.addEventListener('resize', function() {
    rect = canvas.getBoundingClientRect();
});

//canvas paintbrush properties
let fill = false;
const Options = Object.freeze({
  BRUSH: 0,
  PANZOOM: 1,
});

let colorBrush = "black";
let bucketColor = "white";
let option = Options.BRUSH;
ctx.strokeStyle = colorBrush;
ctx.fillStyle = bucketColor;
let paintWidth = slider.valueAsNumber;
ctx.lineWidth = paintWidth;
//we set linecap and line join both to the same so the redraws with render are the same
ctx.lineCap = "round"; //avoids weird lines, due to mousemove not being immediate and varying ys
ctx.lineJoin = "round"; //avoids weird lines when redrawing, since when redrwaing from history theire is only one end ctx.stroke() and a bunch of .Lineto, default is 

//pan and zoom features
let mouseDown = false;
let GlobalOffsetX = 0, GlobalOffsetY = 0;
const viewportTransform = {
        x: 0,
        y: 0,
        scale: 1
      };
let previousX = 0, previousY = 0;

//variables to allow drawing
let x1, y1;
let isDraw = false;//checks if drawing is allowed
let mouseDrawing = false;//checks if there has been actual movement to draw


//History
let paintHistory = [];
let tempStroke = null;