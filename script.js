function updatePanning(e){
  const localX = e.offsetX;
  const localY = e.offsetY;

  let diffX = localX - previousX;
  let diffY = localY - previousY;

  //we scale it since pixels shown on screen and actual canvas dimensions are different
  //canvas is 1280x 720
  //so if we drag our mouse half way accross the canvas, we want to ensure 640 pixels are moved even if half of the canvas is more or less than 640 pixels
  const xDIFF = scaleX(diffX);
  viewportTransform.x += xDIFF;
  GlobalOffsetX += xDIFF / viewportTransform.scale; 

  const yDIFF = scaleY(diffY);
  viewportTransform.y += yDIFF;
  GlobalOffsetY += yDIFF / viewportTransform.scale;  

  //you have to divide it because when you zoom in and are very close and move by a certain amount of pixels, but realistically if it wasnt zoomed in that amount of pixels
  //you moved is actually be signficiantly less since irs proportional so we divide

  previousX = localX;
  previousY = localY;
}

function updateZooming(e){

  const change = e.deltaY * -0.001;
  const newScale = Math.max(Math.min(viewportTransform.scale + change, 5),0.25);

  viewportTransform.scale = newScale;
  ctx.lineWidth = paintWidth * viewportTransform.scale;
  
  //makes sure it zooms on the center, and stays there where you offset it
  
  const offsetX = canvas.width/2 - (canvas.width/2 - GlobalOffsetX )*viewportTransform.scale;  
  const offsetY = canvas.height/2 - (canvas.height/2 - GlobalOffsetY)*viewportTransform.scale; 

  viewportTransform.x = offsetX;
  viewportTransform.y = offsetY;

}

//event listeners
canvas.addEventListener("mousemove", function (e) {
  
  if(option == Options.PANZOOM && mouseDown){
    updatePanning(e);
    render();
  }
  else if(option == Options.BRUSH && isDraw){
    let x2, y2;
    mouseDrawing = true;
    x2 = scaleX(e.offsetX);
    y2 = scaleY(e.offsetY);

    //actual x and y may be different due to transformations
    let historyX = (x2 - viewportTransform.x) / viewportTransform.scale;
    let historyY = (y2 - viewportTransform.y) / viewportTransform.scale;
    tempStroke.addPoint(historyX,historyY);//keeping track of stroke history
    draw(x2,y2);

    //console.log(`X1 : ${x1} Y1 : ${y1}`)
    //console.log(`X1 HISTORY : ${historyX} Y1 HISTORY : ${historyY}`)
    x1 = x2;
    y1 = y2;
  }

});

canvas.addEventListener("wheel", function(e){
  if(option == Options.PANZOOM){
    updateZooming(e);
    render();
  }
});

canvas.addEventListener("mousedown", function (e) {
  if(option == Options.PANZOOM){
    mouseDown = true;
    previousX = e.offsetX
    previousY = e.offsetY
  }
  else if(option == Options.BRUSH){
    isDraw = true;
    x1 = scaleX(e.offsetX);
    y1 = scaleY(e.offsetY);

    ctx.beginPath();
    ctx.moveTo(x1,y1);

    if(fill){
      tempStroke = new Stroke(colorBrush, bucketColor, paintWidth, fill);
    }
    else{
      tempStroke = new Stroke(colorBrush, "", paintWidth, fill);
    }

    //actual x and y may be different due to transformations
    let historyX = (x1 - viewportTransform.x) / viewportTransform.scale;
    let historyY = (y1 - viewportTransform.y) / viewportTransform.scale;

    tempStroke.addPoint(historyX,historyY);//always creates stroke just in case, but this stroke may not be stored if its just a clik we do that by checcking length of points in tempStroke
  }

});

canvas.addEventListener("mouseup", function (e) {
  if(option == Options.PANZOOM){
    mouseDown = false;
  }
  else if(isDraw){
    recordStroke();
    if(fill){
      ctx.fill();
      ctx.closePath();
      ctx.stroke();
    }
  }
});

canvas.addEventListener("click", drawDot);

canvas.addEventListener('mouseleave', function (e) {

  //have to include this code as well because a stroke should be inputed to history if its finished, fixed glitch where it was accounted for if mouseLeave the canvas
  recordStroke();
  if(fill && tempStroke != null && tempStroke.points.length != 1){
      ctx.fill();
      ctx.closePath();
      ctx.stroke();
  }

  console.log("BEGIN PAINT HISTORY")
  paintHistory.forEach((e) => console.log("    ",e.constructor.name, e));
  console.log("END")
});


function recordStroke() {
  isDraw = mouseDown = false;

  if(tempStroke != null && tempStroke.points.length != 1){//length of one is always recorded just in case mouse starts to move
    paintHistory.push(tempStroke);
  }
  tempStroke = null;
}

//we use scale functions instead of reassigning the width and height of the canvas according to the css 
//because we will be importing this to a server so we want the canvas height and width to be constant and not changing to the css which
//changes based on the screen size
function scaleX(x){
  rect = canvas.getBoundingClientRect();
  return (x/rect.width) * canvas.width;
}

function scaleY(y){
  rect = canvas.getBoundingClientRect();
  return (y/rect.height) * canvas.height;
}

function draw(x2,y2){
  ctx.lineTo(x2,y2);
  ctx.stroke();
}

function drawDot(e){
  if(option == Options.BRUSH){
    //console.log("ENTERED DOT ", mouseDrawing);

    //only draws a dot if there has been no movement more efficient, than what i had before where a dot is placed whereever a click occurs without accounting for
    //if a stroke has been drawn
    if(!mouseDrawing){
      let x = scaleX(e.offsetX);
      let y = scaleY(e.offsetY);

      //const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      //const y = (e.clientY - rect.top) * (canvas.height / rect.height);

      //const x = (e.offsetX) * (canvas.width / rect.width);
      //const y = (e.offsetY) * (canvas.height / rect.height);
      //console.log("DOT ", x, " ", y);
      ctx.beginPath();
      ctx.arc(x, y, ctx.lineWidth/2, 0, 2 * Math.PI);
      ctx.fillStyle = colorBrush;//neccessary because fill i used to implement dot
      ctx.fill();

      ctx.fillStyle = bucketColor;

      //actual x and y may be different due to transformations
      let historyX = (x - viewportTransform.x) / viewportTransform.scale; // changing this
      let historyY = (y - viewportTransform.y) / viewportTransform.scale;

      let record = new Dot(colorBrush, paintWidth, historyX, historyY);
      paintHistory.push(record);
    }
    mouseDrawing = false;
  }

}

function render(){
  //save and restore is to put each paint settings back to normal after redrwaing everything which can change the paint settings
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
  paintHistory.forEach((e) => e.draw());
  ctx.restore();
}

function drawBorder(){

  ctx.fillStyle = "dimgray";
  ctx.fillRect(-1920, -1080, 5120, 2880);

  ctx.fillStyle = "white";
  ctx.fillRect(-640, -360, 2560, 1440);
}

