import "./userInterface.js";
import {canvasState, Tool, render, canvas, ctx, rect} from "./canvasState.js"
import Stroke from "./stroke.js";
import Dot from "./dot.js";

//ignore function
function withinPanLimit(x,y, scale){

  const defaultWidth = canvas.width, defaultHeight = canvas.height;
  const maxWidth = 5120, maxHeight = 2880;
  
  const width = defaultWidth / scale;
  const height = defaultHeight / scale;

  const leftBorder = width + (x - defaultWidth)*scale;

  if(leftBorder >= -1920){
    return true;
  }
  console.log("NOT IN LIMIT");
  return false;
}

function updatePanning(e){

  const viewportTransform = canvasState.viewportTransform;

  const localX = e.offsetX;
  const localY = e.offsetY;

  const diffX = localX - canvasState.previousX;
  const diffY = localY - canvasState.previousY;

  //we scale it since pixels shown on screen and actual canvas dimensions are different
  //canvas is 1280x 720
  //so if we drag our mouse half way accross the canvas, we want to ensure 640 pixels are moved even if half of the canvas is more or less than 640 pixels
  const scaledDIFFX = scaleX(diffX);
  const scaledDIFFY = scaleY(diffY);
  const tempX = viewportTransform.x + scaledDIFFX;
  const tempY = viewportTransform.y + scaledDIFFY;

  //ignore short circuit true, not finished feature;
  if(true || withinPanLimit(tempX, tempY, viewportTransform.scale)){
    
    viewportTransform.x = tempX;
    viewportTransform.y = tempY;

    //you have to divide it because when you zoom in and are very close and move by a certain amount of pixels, but realistically if it wasnt zoomed in that amount of pixels
    //you moved is actually be signficiantly less since irs proportional so we divide
    canvasState.GlobalOffsetX += scaledDIFFX / viewportTransform.scale; 
    canvasState.GlobalOffsetY += scaledDIFFY / viewportTransform.scale;  

    canvasState.previousX = localX;
    canvasState.previousY = localY;

    console.log("SCALE : ", viewportTransform.scale, " (",viewportTransform.x,viewportTransform.y,")");
  }
}

function updateZooming(event){

  const viewportTransform = canvasState.viewportTransform;

  const change = event.deltaY * -0.001;
  const newScale = Math.max(Math.min(viewportTransform.scale + change, 5),0.25);

  viewportTransform.scale = newScale;
  ctx.lineWidth = canvasState.paintWidth * viewportTransform.scale;
  
  //makes sure it zooms on the center, and stays there where you offset it
  
  const offsetX = canvas.width/2 - (canvas.width/2 - canvasState.GlobalOffsetX )*viewportTransform.scale;  
  const offsetY = canvas.height/2 - (canvas.height/2 - canvasState.GlobalOffsetY)*viewportTransform.scale; 

  viewportTransform.x = offsetX;
  viewportTransform.y = offsetY;

  console.log(viewportTransform.scale);
}

canvas.addEventListener("mousemove", function (event) {

  const viewportTransform = canvasState.viewportTransform;
  
  if(canvasState.isPanning()){
    console.log("IF has entered");
    updatePanning(event);
    render();
  }
  else if(canvasState.canDraw){
    let x2, y2;
    canvasState.hasDrawn = true;
    x2 = scaleX(event.offsetX);
    y2 = scaleY(event.offsetY);
    draw(x2,y2);

    canvasState.x1 = x2;
    canvasState.y1 = y2;

    //actual x and y may be different due to transformations
    let historyX = (x2 - viewportTransform.x) / viewportTransform.scale;
    let historyY = (y2 - viewportTransform.y) / viewportTransform.scale;
    canvasState.tempStroke.addPoint(historyX,historyY);
  }

});

canvas.addEventListener("wheel", function(event){
  if(canvasState.tool == Tool.PANZOOM){
    updateZooming(event);
    render();
  }
});

canvas.addEventListener("mousedown", function (event) {
  if(canvasState.tool == Tool.PANZOOM){
    canvasState.mouseDown = true;
    canvasState.previousX = event.offsetX
    canvasState.previousY = event.offsetY
  }
  else if(canvasState.tool == Tool.BRUSH){
    const viewportTransform = canvasState.viewportTransform;

    canvasState.canDraw = true;
    canvasState.x1 = scaleX(event.offsetX);
    canvasState.y1 = scaleY(event.offsetY);

    ctx.beginPath();
    ctx.moveTo(canvasState.x1, canvasState.y1);

    const color = canvasState.colorBrush;
    const bucketColor = canvasState.bucketColor;
    const width = canvasState.paintWidth;

    if(canvasState.fill){
      const fill = true;
      canvasState.tempStroke = new Stroke(color, bucketColor, width, fill);
    }
    else{
      const fill = false;
      canvasState.tempStroke = new Stroke(color, bucketColor, width, fill);
    }

    let historyX = (canvasState.x1 - viewportTransform.x) / viewportTransform.scale;
    let historyY = (canvasState.y1 - viewportTransform.y) / viewportTransform.scale;
    canvasState.tempStroke.addPoint(historyX,historyY);//always creates stroke just in case, but this stroke may not be stored if its just a clik we do that by checcking length of points in tempStroke
  }

});

canvas.addEventListener("mouseup", function (event) {
  if(canvasState.tool == Tool.PANZOOM){
    canvasState.mouseDown = false;
  }
  else if(canvasState.canDraw){
    recordStroke();
    if(canvasState.fill){
      ctx.fill();
      ctx.closePath();
      ctx.stroke();
    }
  }
});

canvas.addEventListener("click", drawDot);
function drawDot(event){
  if(canvasState.tool == Tool.BRUSH){
    const viewportTransform = canvasState.viewportTransform;
    
    //only makes dot if there has been nothing drawn
    if(!canvasState.hasDrawn){
      let x = scaleX(event.offsetX);
      let y = scaleY(event.offsetY);

      ctx.beginPath();
      ctx.arc(x, y, ctx.lineWidth/2, 0, 2 * Math.PI);
      ctx.fillStyle = canvasState.colorBrush;//neccessary because fill i used to implement dot
      ctx.fill();

      ctx.fillStyle = canvasState.bucketColor;

      const historyX = (x - viewportTransform.x) / viewportTransform.scale; 
      const historyY = (y - viewportTransform.y) / viewportTransform.scale;
      const colorBrush = canvasState.colorBrush;
      const paintWidth = canvasState.paintWidth;

      let record = new Dot(colorBrush, paintWidth, historyX, historyY);
      canvasState.paintHistory.push(record);
    }
    canvasState.hasDrawn = false;
  }

}

canvas.addEventListener('mouseleave', function (event) {
  //have to include this code as well because a stroke should be inputed to history if its finished, fixed glitch where it was accounted for if mouseLeave the canvas
  if(canvasState.fill && hasStrokeBeenDrawn()){
      ctx.fill();
      ctx.closePath();
      ctx.stroke();
  }
  recordStroke();

  console.log("BEGIN PAINT HISTORY")
  canvasState.paintHistory.forEach((paintObject) => console.log("    ",paintObject.constructor.name, paintObject));
  console.log("END")
});


function recordStroke() {
  canvasState.canDraw = canvasState.mouseDown = false;

  
  if(hasStrokeBeenDrawn()){
    canvasState.paintHistory.push(canvasState.tempStroke);
  }
  canvasState.tempStroke = null;
}

function hasStrokeBeenDrawn() {
  //length of one is always recorded just in case mouse starts to move, we only record if its an actual stroke
  return canvasState.tempStroke != null && canvasState.tempStroke.points.length != 1;
}

function draw(x2,y2){
  ctx.lineTo(x2,y2);
  ctx.stroke();
}

/*
  we use scale functions instead of reassigning the width and height of the canvas according to the css 
  because we will be importing this to a server so we want the canvas height and width to be constant and not changing to the css which
  changes based on the screen size
*/

function scaleX(x){
  return (x/rect.width) * canvas.width;
}

function scaleY(y){
  return (y/rect.height) * canvas.height;
}





