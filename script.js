
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
let colorBrush = "black";
ctx.strokeStyle = colorBrush;
ctx.fillStyle = colorBrush;
ctx.lineWidth = 15;
//we set linecap and line join both to the same so the redraws with render are the same
ctx.lineCap = "round"; //avoids weird lines, due to mousemove not being immediate and varying ys
ctx.lineJoin = "round"; //avoids weird lines when redrawing, since when redrwaing from history theire is only one end ctx.stroke() and a bunch of .Lineto, default is 

//pan and zoom features
let pan_zoom = false;
let zoomEfficient = true;
let mouseDown = false;
const viewportTransform = {
        x: 0,
        y: 0,
        scale: 1
      }
let previousX = 0, previousY = 0;

function updatePanning(e){
  const localX = e.offsetX;
  const localY = e.offsetY;

  let diffX = localX - previousX;
  let diffY = localY - previousY;

  //we scale it since pixels shown on screen and actual canvas dimensions are different
  //canvas is 1280x 720
  //so if we drag our mouse half way accross the canvas, we want to ensure 640 pixels are moved even if half of the canvas is more or less than 640 pixels
  viewportTransform.x += scaleX(diffX);
  viewportTransform.y += scaleY(diffY);

  previousX = localX;
  previousY = localY;
}

function updateZooming(e){

  const change = e.deltaY * -0.001;
  const newScale = Math.max(Math.min(viewportTransform.scale + change, 5),0.1);
  viewportTransform.scale = newScale;

  const offsetX = (canvas.width * newScale - canvas.width)/2
  const offsetY = (canvas.height * newScale - canvas.height)/2

  viewportTransform.x = -offsetX;
  viewportTransform.y = -offsetY;
}

//variables to allow drawing
let x1, y1;
let isDraw = false;//checks if drawing is allowed
let mouseDrawing = false;//checks if there has been actual movement to draw

//populate paintbrush options in html
populateColors();
let colorOptions = document.getElementById("all_colors");
colorOptions.addEventListener("click", function (e){

  console.log("entered boss");
  if(e.target.tagName === "DIV"){
    console.log("entered boss");
    colorBrush = e.target.id;
    ctx.strokeStyle = colorBrush;
    ctx.fillStyle = colorBrush;
  }
});

const trashCan = document.getElementsByClassName("trash")[0];
trashCan.addEventListener("click", function(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

const magnify = document.getElementsByClassName("zoom")[0];
magnify.addEventListener("click", function(){
  pan_zoom = true;
});

const brush = document.getElementsByClassName("brush")[0];
brush.addEventListener("click", function(){
  pan_zoom = false;
});

const title = document.getElementsByClassName("title")[0];
title.addEventListener("click", function(){
  render();
});

//other paint features
const slider = document.getElementById("all_thickness");
slider.addEventListener("change", function (){
  console.log("hello");
  ctx.lineWidth = slider.value;
});

//History
let paintHistory = [];
let tempStroke = null;

//event listeners
canvas.addEventListener("mousemove", function (e) {
  
  if(pan_zoom & mouseDown){
    updatePanning(e);
    render();
  }
  else if(isDraw){
    let x2, y2;
    mouseDrawing = true;
    x2 = scaleX(e.offsetX);
    y2 = scaleY(e.offsetY);

    //actual x and y may be different due to transformations
    let historyX = x2 - viewportTransform.x;
    let historyY = y2 - viewportTransform.y;
    tempStroke.addPoint(historyX,historyY);//keeping track of stroke history
    draw(x2,y2);
    //console.log(`X1 : ${x1} Y1 : ${y1}`)
    //console.log(`X2 : ${x2} Y2 : ${y2}`)
    x1 = x2;
    y1 = y2;
  }

});

canvas.addEventListener("wheel", function(e){
  console.log("SCROLL");
  if(pan_zoom){
    updateZooming(e);
    render();
  }
});

canvas.addEventListener("mousedown", function (e) {
  if(pan_zoom){
    mouseDown = true;
    previousX = e.offsetX
    previousY = e.offsetY
  }
  else{
    isDraw = true;
    x1 = scaleX(e.offsetX);
    y1 = scaleY(e.offsetY);

    tempStroke = new Stroke(colorBrush, ctx.lineWidth);

    //actual x and y may be different due to transformations
    let historyX = x1 - viewportTransform.x;
    let historyY = y1 - viewportTransform.y;

    tempStroke.addPoint(historyX,historyY);
  }
});

canvas.addEventListener("mouseup", function (e) {
  if(pan_zoom){
    mouseDown = false;
  }
  else if(isDraw){

    //may put this in
    /* 
    let x2, y2;
    mouseDrawing = true;
    x2 = scaleX(e.offsetX);
    y2 = scaleY(e.offsetY);
    tempStroke.addPoint(x2,y2);//keeping track of stroke history
    draw(x2,y2);
    //console.log(`X1 : ${x1} Y1 : ${y1}`)
    //console.log(`X2 : ${x2} Y2 : ${y2}`)
    x1 = x2;
    y1 = y2;
    */
    


    recordStroke();
  }
});

canvas.addEventListener("click", dot);

canvas.addEventListener('mouseleave', function (e) {

  //have to include this code as well because a stroke should be inputed to history if its finished, fixed glitch where it was accounted for if mouseLeave the canvas
  recordStroke();

  console.log("BEGIN PAINT HISTORY")
  paintHistory.forEach((e) => console.log("    ",e.constructor.name, e));
  
  console.log("END")
});


function recordStroke() {
  isDraw = mouseDown = false;

  if(tempStroke != null)
    paintHistory.push(tempStroke);
  else
    console.log("SOMETHING NULL WAS FOR SOME REASON ")

  tempStroke = null;
}

//we use scale functions instead of reassigning the width and height of the canvas according to the css 
//because we will be importing this to a server so we want the canvas height and width to be constant and not changing to the css which
//changes based on the screen size
function scaleX(x){
  return (x/rect.width) * canvas.width;
}

function scaleY(y){
  return (y/rect.height) * canvas.height;
}

function draw(x2,y2){
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();
}

function dot(e){
  if(!pan_zoom){
    console.log("ENTERED DOT ", mouseDrawing);

    //only draws a dot if there has been no movement more efficient, than what i had before where a dot is placed whereever a click occurs without accounting for
    //if a stroke has been drawn
    if(!mouseDrawing){
      let x = scaleX(e.offsetX);
      let y = scaleY(e.offsetY);
      ctx.beginPath();
      ctx.arc(x, y, ctx.lineWidth/2, 0, 2 * Math.PI);
      ctx.fill();

      //actual x and y may be different due to transformations
      let historyX = x - viewportTransform.x;
      let historyY = y - viewportTransform.y;
      let record = new Dot(colorBrush, ctx.lineWidth, historyX, historyY);
      paintHistory.push(record);
    }
    mouseDrawing = false;
  }

}

function createColor(string){
  let square = document.createElement("div");
  let colors = document.getElementById("all_colors");
  let inner = document.createElement("div");
  square.setAttribute("id", string);
  inner.style.backgroundColor = string;
  square.appendChild(inner);
  colors.appendChild(square);
}

//populates colors in html
function populateColors(){
  createColor("black");
  createColor("gray");
  createColor("darkred");
  createColor("red");
  createColor("orange");
  createColor("yellow");
  createColor("green");
  createColor("turquoise");
  createColor("indigo");
  createColor("purple");
  createColor("white");
  createColor("lightgray");
  createColor("brown");
  createColor("pink");
  createColor("gold");
  createColor("lightyellow");
  createColor("lime");
  createColor("paleturquoise");
  createColor("cadetblue");
  createColor("lavender");
}

function render(){
  //save and restore is to put each paint settings back to normal after redrwaing everything which can change the paint settings
  ctx.save();
  ctx.resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.setTransform(
    viewportTransform.scale,
    0,
    0,
    viewportTransform.scale,
    viewportTransform.x,
    viewportTransform.y
  );
  paintHistory.forEach((e) => e.draw());
  ctx.restore();
}


//takes all the paint history and redraws everything with transform and scale
function zoomWithQuality(){

}

//takes the current bitmap and zooms it
function zoomEfficiently(){

}