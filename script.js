
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
let pan_zoom = false;
let zoomEfficient = true;
const viewportTransform = {
        x: 0,
        y: 0,
        scale: 1
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
let paintHistory = []
let tempStroke = null;


//event listeners
canvas.addEventListener("mousemove", function (e) {

  let x2, y2;
  if(isDraw){
    mouseDrawing = true;
    x2 = scaleX(e.offsetX);
    y2 = scaleY(e.offsetY);
    tempStroke.addPoint(x2,y2);//keeping track of stroke history
    draw(x2,y2);
    console.log(`X1 : ${x1} Y1 : ${y1}`)
    console.log(`X2 : ${x2} Y2 : ${y2}`)
  }
  x1 = x2;
  y1 = y2;
});

canvas.addEventListener("mousedown", function (e) {
  isDraw = true;
  x1 = scaleX(e.offsetX);
  y1 = scaleY(e.offsetY);

  tempStroke = new Stroke(colorBrush, ctx.lineWidth);
  tempStroke.addPoint(x1,y1);
});

canvas.addEventListener("mouseup", function (e) {
  isDraw = false;
  paintHistory.push(tempStroke);
  tempStroke = null;
});

canvas.addEventListener("click", dot);

canvas.addEventListener('mouseleave', function (e) {
  isDraw = false;

  console.log("BEGIN PAINT HISTORY")
  paintHistory.forEach((e) => console.log("    ",e.constructor.name, e));
  
  console.log("END")
});


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
  console.log("ENTERED DOT ", mouseDrawing);

  //only draws a dot if there has been no movement more efficient, than what i had before where a dot is placed whereever a click occurs without accounting for
  //if a stroke has been drawn
  if(!mouseDrawing){
    let x = scaleX(e.offsetX);
    let y = scaleY(e.offsetY);
    ctx.beginPath();
    ctx.arc(x, y, ctx.lineWidth/2, 0, 2 * Math.PI);
    ctx.fill();
    let record = new Dot(colorBrush, ctx.lineWidth, x, y);
    paintHistory.push(record);
  }
  mouseDrawing = false;

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
  paintHistory.forEach((e) => e.draw());
  ctx.restore();
}

//takes all the paint history and redraws everything with transform and scale
function zoomWithQuality(){

}

//takes the current bitmap and zooms it
function zoomEfficiently(){

}