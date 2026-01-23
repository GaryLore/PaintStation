
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
ctx.strokeStyle = "orange";
ctx.lineWidth = 15;
ctx.lineCap = "round"; //avoids weird lines, due to mousemove not being immediate and varying ys

//variables to allow drawing
let x1, y1;
let isDraw = false;

//populate paintbrush options in html
populateColors();

canvas.addEventListener("mousemove", function (e) {

  let x2, y2;
  if(isDraw){
    x2 = scaleX(e.offsetX);
    y2 = scaleY(e.offsetY);
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
});

canvas.addEventListener("mouseup", function (e) {
  isDraw = false;
});

canvas.addEventListener("mouseclick", dot);

canvas.addEventListener('mouseleave', function (e) {
  isDraw = false;
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

function dot(){

}

function createColor(string){
  let square = document.createElement("div");
  let colors = document.getElementById("colors");
  square.setAttribute("id", string);
  square.style.backgroundColor = string;
  colors.appendChild(square);
}

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