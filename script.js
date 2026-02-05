
//canvas 
const canvas = document.getElementById("canvas");
console.log(canvas);
if (!canvas.getContext) {
  console.log("CANVAS IS NOT SUPPORTED PLEASE USE ANOTHER BROWSER");
} 
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();
canvas.width = 1280;
canvas.height = 720;

//canvas paintbrush properties
let colorBrush = "black";
ctx.strokeStyle = colorBrush;
ctx.fillStyle = colorBrush;
ctx.lineWidth = 15;
ctx.lineCap = "round"; //avoids weird lines, due to mousemove not being immediate and varying ys
let pan_zoom = false;
let zoomEfficient = true;
const viewportTransform = {
        x: 0,
        y: 0,
        scale: 1
      }

//variables to allow drawing
let x1, y1;
let isDraw = false;

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

  console.log("ENTERED DOT");
  let x = scaleX(e.offsetX);
  let y = scaleY(e.offsetY);
  ctx.beginPath();
  ctx.arc(x, y, ctx.lineWidth/2, 0, 2 * Math.PI);
  ctx.fill();

  let record = new Dot(colorBrush, ctx.lineWidth, x, y);
  paintHistory.push(record);

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
  paintHistory.forEach((e) => e.draw());
}

//takes all the paint history and redraws everything with transform and scale
function zoomWithQuality(){

}

//takes the current bitmap and zooms it
function zoomEfficiently(){

}