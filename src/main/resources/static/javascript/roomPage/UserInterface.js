import {canvasState, Tool, canvas, ctx, slider} from "./canvasState.js"

const trashCan = document.getElementsByClassName("trash")[0];
trashCan.addEventListener("click", function(){
  const debug = false;  

  if(!debug){
    canvasState.paintHistory = [];
  }

  canvasState.render();
});

const magnify = document.getElementsByClassName("zoom")[0];
magnify.addEventListener("click", function(){

  canvasState.tool = Tool.PANZOOM;
  this.classList.add('selected');
  canvas.classList.add('optionPanZoom');

  brush.classList.remove('selected');
  canvas.classList.remove('optionBrush');
  bucket.classList.remove('selected');
  canvasState.brush.fill = false;

});

const brush = document.getElementsByClassName("brush")[0];
brush.addEventListener("click", function(){

  canvasState.tool = Tool.BRUSH;
  this.classList.add('selected');
  canvas.classList.add('optionBrush');

  magnify.classList.remove('selected');
  canvas.classList.remove('optionPanZoom');
});

const bucket = document.getElementsByClassName("bucket")[0];
bucket.addEventListener("click", function(){

  if(canvasState.tool === Tool.BRUSH)
    canvasState.brush.fill = !canvasState.brush.fill;

  if(canvasState.brush.fill){
    this.classList.add('selected');
  }
  else{
    this.classList.remove('selected');
  }

});

const title = document.getElementsByClassName("title")[0];
title.addEventListener("click", function(){
  //canvasState.render();
  canvasState.writeHistory();
});

slider.addEventListener("change", function (){
  canvasState.brush.paintWidth = slider.valueAsNumber;
  ctx.lineWidth = canvasState.brush.paintWidth * canvasState.viewportTransform.scale;
});

function createColor(string){
  let square = document.createElement("div");
  let colors = document.getElementById("all_colors");
  let inner = document.createElement("div");
  square.setAttribute("id", string);
  inner.style.backgroundColor = string;
  square.appendChild(inner);
  colors.appendChild(square);
}

function createOptions(num, string){
  let square = document.createElement("div");
  let colors = document.querySelector(".choices");
  let inner = document.createElement("div");
  square.setAttribute("id", num);
  inner.style.backgroundColor = string;
  square.appendChild(inner);
  colors.appendChild(square);

  return [square, inner];
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

//populate paintbrush options in html
populateColors();
const blackColor = document.getElementById("black");
blackColor.classList.add("selected");

const ColorTarget = Object.freeze({
  BRUSH: 1,
  BUCKET: 2,
});

let selectedColorTarget = ColorTarget.BRUSH;
const [brushSquare, innerBrushSquare] = createOptions("1", "black");
const [bucketSquare, innerBucketSquare] = createOptions("2", "white");
brushSquare.classList.add("selected");

brushSquare.addEventListener("click", function(){
  selectedColorTarget = ColorTarget.BRUSH;;
  bucketSquare.classList.remove("selected");
  this.classList.add("selected");
});

bucketSquare.addEventListener("click", function(){
  selectedColorTarget = ColorTarget.BUCKET;
  brushSquare.classList.remove("selected");
  this.classList.add("selected");
});

let colorOptions = document.getElementById("all_colors");
colorOptions.addEventListener("click", setBrushColors);

function setBrushColors(e){
  if(e.target.tagName === "DIV" && e.target !== e.currentTarget){

      if(selectedColorTarget === ColorTarget.BRUSH){
        canvasState.brush.color = e.target.id;
        innerBrushSquare.style.backgroundColor = canvasState.brush.color;
        ctx.strokeStyle = canvasState.brush.color;
      }
      else if(selectedColorTarget === ColorTarget.BUCKET){
        canvasState.brush.bucketColor = e.target.id;
        innerBucketSquare.style.backgroundColor = canvasState.brush.bucketColor;
        ctx.fillStyle = canvasState.brush.bucketColor;
      }
    }
}