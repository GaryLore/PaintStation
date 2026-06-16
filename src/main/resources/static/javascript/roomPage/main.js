import "./UserInterface.js";
import {canvas, canvasState, ctx, Tool} from "./canvasState.js"
import {sendPaintObjects} from "./RoomService.js";
import Stroke from "./Stroke.js";
import Dot from "./Dot.js";
import Point from "./Point.js";

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

    //console.log("SCALE : ", viewportTransform.scale, " (",viewportTransform.x,viewportTransform.y,")");
  }
}

canvas.addEventListener("wheel", function(event){
  if(canvasState.tool === Tool.PANZOOM){
    updateZooming(event);
    canvasState.render();
  }
});

canvas.addEventListener("mousedown", function (event) {
  canvasState.mouseDown = true;
  if(canvasState.tool === Tool.PANZOOM){
    canvasState.panZoom.previousX = event.offsetX
    canvasState.panZoom.previousY = event.offsetY
  }
  else if(canvasState.tool === Tool.BRUSH){
    startBrushStroke(event);//always creates stroke just in case, but this stroke may not be stored if its just a clik we do that by checcking length of points in tempStroke
  }
});

canvas.addEventListener("mousemove", function (event) {

  if(canvasState.isPanning()){
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
      const point = new Point(worldX,worldY);
      canvasState.tempStroke.addPoint(point);//tempstroke may be null because of canvas enter once it is left check this later

      if(canvasState.buffer != null) {
        canvasState.buffer.addPoint(point);
        canvasState.bufferPreviousPoint = point;
      }
      else{
        const StrokeParameters = {
          uuid : canvasState.tempStroke.uuid,
          phase : "MIDDLE",
          brushColor : canvasState.brush.color,
          bucketColor: canvasState.brush.fill ? canvasState.brush.bucketColor : "",
          width : canvasState.brush.paintWidth,
          fill : canvasState.brush.fill
        };

        canvasState.buffer = new Stroke(StrokeParameters);
        /*
          may result in glitch but coneptually to connect lines
          for example p1 p2 p3 p4 p5 all these are connected in one line
          p6 p7 p8 p9 all these are connected as well but p5 and p6 arnt so there is a gap this fixes the problem
          by now the second line containing p5 p6 p8 p9
        */
        canvasState.buffer.addPoint(canvasState.bufferPreviousPoint);
        canvasState.buffer.addPoint(point);
      }
    }
    else{
      recordStroke();
    }
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
  //console.log(`(${canvasState.scaleX(event.offsetX)},${canvasState.scaleY(event.offsetY)})`);

  const viewportTransform = canvasState.viewportTransform;
  let x = canvasState.scaleX(event.offsetX);
  let y = canvasState.scaleY(event.offsetY);
  const worldX = (x - viewportTransform.x) / viewportTransform.scale; 
  const worldY = (y - viewportTransform.y) / viewportTransform.scale;

  if(canvasState.tool === Tool.BRUSH && !canvasState.hasDrawn && drawingAllowedHere(worldX, worldY)){
    ctx.beginPath();
    ctx.arc(x, y, ctx.lineWidth/2, 0, 2 * Math.PI);
    ctx.fillStyle = canvasState.brush.color;//neccessary because fill i used to implement dot
    ctx.fill();
    ctx.fillStyle = canvasState.brush.bucketColor;
    canvasState.reloadJustBorder();

    let record = new Dot({
      color : canvasState.brush.color,
      width : canvasState.brush.paintWidth,
      point : new Point(worldX,worldY)
    });
    sendPaintObjects("DOT", record);
    canvasState.paintHistory.push(record);
  }
  canvasState.hasDrawn = false;
}

canvas.addEventListener('mouseleave', function (event) {  
  recordStroke();
});

canvas.addEventListener('mouseenter', function (event) {
  if(canvasState.mouseDown && canvasState.tool === Tool.BRUSH){
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

    const StrokeParameters = {
      uuid : self.crypto.randomUUID(),
      phase : "COMPLETE",
      brushColor : canvasState.brush.color,
      bucketColor: canvasState.brush.fill ? canvasState.brush.bucketColor : "",
      width : canvasState.brush.paintWidth,
      fill : canvasState.brush.fill
    };

    canvasState.tempStroke = new Stroke(StrokeParameters);
    StrokeParameters.phase = "START";
    canvasState.buffer = new Stroke(StrokeParameters);

    const point = new Point(worldX,worldY);
    canvasState.tempStroke.addPoint(point);
    canvasState.buffer.addPoint(point);
  }
}

function recordStroke() {
  canvasState.canDraw = false;
  
  if(hasStrokeBeenDrawn()){
    if(canvasState.tempStroke.fill){
      ctx.save()
      canvasState.setTransformCanvas()
      canvasState.tempStroke.draw();
      canvasState.reloadJustBorder();
      ctx.restore();
      canvasState.paintHistory.push(canvasState.tempStroke);
    }
    /*
      before i was sending two packets at the same time, but now i just combined it into one
      originanly a middle packet and right after a end packet with no points inside
      no if its a middle packet with points inside we convert it to an end packet and we only
      send one packet, so now we dont have problems with packets arriving in wrong order causing a glitch.
      possible flush buffer was called from timer right before so we just send a endstroke to indicate its done
     */
    if(canvasState.buffer == null) {
      const endStroke = new Stroke({
        uuid: canvasState.tempStroke.uuid,
        phase: "END",
        brushColor: canvasState.tempStroke.brushColor,
        bucketColor: canvasState.tempStroke.bucketColor,
        width: canvasState.tempStroke.width,
        fill: canvasState.tempStroke.fill
      });
      canvasState.paintHistory.push(endStroke);
      sendPaintObjects("STROKE", endStroke);
    }
    else{
      canvasState.buffer.phase = "END";
      flushBuffer();
    }
  }
  canvasState.tempStroke = null;
}

function hasStrokeBeenDrawn() {
  //length of one is always recorded just in case mouse starts to move, we only record if its an actual stroke
  return canvasState.tempStroke != null && canvasState.tempStroke.points.length !== 1;
}
//hasStrokeBeenDrawn may be able to be replaced by hasDrawn however the code might need to be changed a bit, just a reminder for future Me

function flushBuffer() {
  if (canvasState.buffer == null || canvasState.buffer.points.length < 2){
    return;
  }

  sendPaintObjects("STROKE", canvasState.buffer);

  if(!canvasState.buffer.fill) {
    canvasState.paintHistory.push(canvasState.buffer);
  }

  canvasState.buffer = null;
}

setInterval(flushBuffer, 50);


