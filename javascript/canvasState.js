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

//canvas paintbrush properties
const Options = Object.freeze({
  BRUSH: 0,
  PANZOOM: 1,
});

let fill = false;
let colorBrush = "black";
let bucketColor = "white";
let option = Options.BRUSH;
let paintWidth = slider.valueAsNumber;

ctx.strokeStyle = colorBrush;
ctx.fillStyle = bucketColor;
ctx.lineWidth = paintWidth;
//we set linecap and line join both to the same so the redraws with render are the same
ctx.lineCap = "round"; 
ctx.lineJoin = "round"; 

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