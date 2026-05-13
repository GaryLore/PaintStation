import "./UserInterface.js";
import {canvasState, Tool, canvas, ctx, rect} from "./canvasState.js"
import Stroke from "./stroke.js";
import Dot from "./dot.js";

function withinPanZoomLimit(x,y, scale){

  const leftBorder = (0 - x) / scale; 
  const topBorder = (0 - y) / scale; 
  const rightBorder = (canvas.width - x) / scale; 
  const bottomBorder = (canvas.height - y) / scale; 

  const leftMax = canvasState.worldBounds.x;
  const rightMax = canvasState.worldBounds.x + canvasState.worldBounds.width;
  const topMax = canvasState.worldBounds.y;
  const bottomMax = canvasState.worldBounds.y + canvasState.worldBounds.height;

  return leftBorder >= leftMax && topBorder >= topMax && rightBorder <= rightMax && bottomBorder <= bottomMax;
}

function drawingAllowedHere(x,y){

  const topBorder = canvasState.drawBounds.y;
  const bottomBorder = canvasState.drawBounds.y + canvasState.drawBounds.height;
  const leftBorder = canvasState.drawBounds.x;
  const rightBorder = canvasState.drawBounds.x + canvasState.drawBounds.width;

  return x > leftBorder && x < rightBorder && y > topBorder && y < bottomBorder;
}

function updatePanning(event){

  const viewportTransform = canvasState.viewportTransform;

  const localX = event.offsetX;
  const localY = event.offsetY;

  const diffX = localX - canvasState.panZoom.previousX;
  const diffY = localY - canvasState.panZoom.previousY;

  //we scale it since pixels shown on screen and actual canvas dimensions are different
  //canvas is 1280x 720
  //so if we drag our mouse half way accross the canvas, we want to ensure 640 pixels are moved even if half of the canvas is more or less than 640 pixels
  const scaledDIFFX = canvasState.scaleX(diffX);
  const scaledDIFFY = canvasState.scaleY(diffY);
  const tempX = viewportTransform.x + scaledDIFFX;
  const tempY = viewportTransform.y + scaledDIFFY;

  if(withinPanZoomLimit(tempX, tempY, viewportTransform.scale)){
    
    viewportTransform.x = tempX;
    viewportTransform.y = tempY;

    //you have to divide it because when you zoom in and are very close and move by a certain amount of pixels, but realistically if it wasnt zoomed in that amount of pixels
    //you moved is actually be signficiantly less since irs proportional so we divide
    canvasState.panZoom.GlobalOffsetX += scaledDIFFX / viewportTransform.scale; 
    canvasState.panZoom.GlobalOffsetY += scaledDIFFY / viewportTransform.scale;  

    canvasState.panZoom.previousX = localX;
    canvasState.panZoom.previousY = localY;

  }
}

function updateZooming(event){

  const viewportTransform = canvasState.viewportTransform;

  const change = event.deltaY * -0.001;
  const newScale = Math.max(Math.min(viewportTransform.scale + change, 5),0.25);
  
  //makes sure it zooms on the center, and stays there where you offset it
  const offsetX = canvas.width/2 - (canvas.width/2 - canvasState.panZoom.GlobalOffsetX )*newScale;  
  const offsetY = canvas.height/2 - (canvas.height/2 - canvasState.panZoom.GlobalOffsetY)*newScale; 

  if(withinPanZoomLimit(offsetX, offsetY, newScale)){
    viewportTransform.scale = newScale;
    viewportTransform.x = offsetX;
    viewportTransform.y = offsetY;
    ctx.lineWidth = canvasState.brush.paintWidth * viewportTransform.scale;

    console.log("SCALE : ", viewportTransform.scale, " (",viewportTransform.x,viewportTransform.y,")");
  }
}

canvas.addEventListener("mousemove", function (event) {

  if(canvasState.isPanning()){
    console.log("IF has entered");
    updatePanning(event);
    canvasState.render();
  }
  else if(canvasState.canDraw){

    const viewportTransform = canvasState.viewportTransform;
    const x2 = canvasState.scaleX(event.offsetX);
    const y2 = canvasState.scaleY(event.offsetY);
    const worldX = (x2 - viewportTransform.x) / viewportTransform.scale;
    const worldY = (y2 - viewportTransform.y) / viewportTransform.scale;

    if(drawingAllowedHere(worldX, worldY)){

      canvasState.hasDrawn = true;

      canvasState.drawTo(x2,y2);
      canvasState.x1 = x2;
      canvasState.y1 = y2;
      canvasState.reloadJustBorder();

      //actual x and y may be different due to transformations
      canvasState.tempStroke.addPoint(worldX,worldY);
    }
    else{
      recordStroke();
    }
  }

});

canvas.addEventListener("wheel", function(event){
  if(canvasState.tool == Tool.PANZOOM){
    updateZooming(event);
    canvasState.render();
  }
});

canvas.addEventListener("mousedown", function (event) {
  canvasState.mouseDown = true;
  if(canvasState.tool == Tool.PANZOOM){
    canvasState.panZoom.previousX = event.offsetX
    canvasState.panZoom.previousY = event.offsetY
  }
  else if(canvasState.tool == Tool.BRUSH){
    startBrushStroke(event);//always creates stroke just in case, but this stroke may not be stored if its just a clik we do that by checcking length of points in tempStroke
  }

});

window.addEventListener("mouseup", function (event) {
  canvasState.mouseDown = false;
  if(canvasState.canDraw){
    recordStroke();
    if(canvasState.brush.fill){
      canvasState.render();
    }
  }
});

canvas.addEventListener("click", drawDot);
function drawDot(event){

  console.log(`(${canvasState.scaleX(event.offsetX)},${canvasState.scaleY(event.offsetY)})`);

  const viewportTransform = canvasState.viewportTransform;
  let x = canvasState.scaleX(event.offsetX);
  let y = canvasState.scaleY(event.offsetY);
  const worldX = (x - viewportTransform.x) / viewportTransform.scale; 
  const worldY = (y - viewportTransform.y) / viewportTransform.scale;

  if(canvasState.tool == Tool.BRUSH && !canvasState.hasDrawn && drawingAllowedHere(worldX, worldY)){    

    ctx.beginPath();
    ctx.arc(x, y, ctx.lineWidth/2, 0, 2 * Math.PI);
    ctx.fillStyle = canvasState.brush.color;//neccessary because fill i used to implement dot
    ctx.fill();
    ctx.fillStyle = canvasState.brush.bucketColor;

    canvasState.reloadJustBorder();

    const colorBrush = canvasState.brush.color;
    const paintWidth = canvasState.brush.paintWidth;

    let record = new Dot(colorBrush, paintWidth, worldX, worldY);
    canvasState.paintHistory.push(record);

  }
  canvasState.hasDrawn = false;

}

canvas.addEventListener('mouseleave', function (event) {  
  recordStroke();
  console.log("BEGIN PAINT HISTORY")
  canvasState.paintHistory.forEach((paintObject) => console.log("    ",paintObject.constructor.name, paintObject));
  console.log("END")
});

canvas.addEventListener('mouseenter', function (event) {
  console.log(canvasState.mouseDown);
  if(canvasState.mouseDown && canvasState.tool == Tool.BRUSH){
      startBrushStroke(event);
  }
  
});

function startBrushStroke(event) {

  const viewportTransform = canvasState.viewportTransform;

  canvasState.x1 = canvasState.scaleX(event.offsetX);
  canvasState.y1 = canvasState.scaleY(event.offsetY);
  let worldX = (canvasState.x1 - viewportTransform.x) / viewportTransform.scale;
  let worldY = (canvasState.y1 - viewportTransform.y) / viewportTransform.scale;

  if(drawingAllowedHere(worldX,worldY)){
    canvasState.canDraw = true;

    ctx.beginPath();
    ctx.moveTo(canvasState.x1, canvasState.y1);

    const color = canvasState.brush.color;
    const bucketColor = canvasState.brush.bucketColor;
    const width = canvasState.brush.paintWidth;

    if (canvasState.brush.fill) {
      const fill = true;
      canvasState.tempStroke = new Stroke(color, bucketColor, width, fill);
    }
    else {
      const fill = false;
      canvasState.tempStroke = new Stroke(color, "", width, fill);
    }

    canvasState.tempStroke.addPoint(worldX, worldY);

  }
}


function recordStroke() {
  canvasState.canDraw = false;
  
  if(hasStrokeBeenDrawn()){
    canvasState.paintHistory.push(canvasState.tempStroke);

    if(canvasState.brush.fill){
      canvasState.render();
  }
  }
  
  canvasState.tempStroke = null;
}

function hasStrokeBeenDrawn() {
  //length of one is always recorded just in case mouse starts to move, we only record if its an actual stroke
  return canvasState.tempStroke != null && canvasState.tempStroke.points.length != 1;
}

//hasStrokeBeenDrawn may be able to be replaced by hasDrawn however the code might need to be changed a bit, just a reminder for future Me





