import {canvasState, Tool, canvas, ctx, slider} from "./canvasState.js"

const trashCan = document.getElementsByClassName("header__icon-btn--trash")[0];
trashCan.addEventListener("click", function(){
  const debug = false;  

  if(!debug){
    canvasState.paintHistory = [];
  }

  canvasState.render();
});

const save = document.getElementsByClassName("header__icon-btn--save")[0];
save.addEventListener("click", function(){
  const link = document.createElement('a');
  link.download = 'Drawing.png';
  link.href = canvas.toDataURL()
  link.click();
});

const homePage = document.getElementsByClassName("header__icon-btn--homepage")[0];
homePage.addEventListener("click", function (){
  window.location.href = "/";
});

const magnify = document.querySelector('[data-tool="pan-zoom"]');
magnify.addEventListener("click", function(){
  canvasState.tool = Tool.PANZOOM;
  canvasState.brush.fill = false;

  this.classList.add('paint__tool--selected');
  canvas.classList.add('paint__canvas--pan-zoom');

  brush.classList.remove('paint__tool--selected');
  bucket.classList.remove('paint__tool--selected');
  canvas.classList.remove('paint__canvas--brush');
});

const brush = document.querySelector('[data-tool="brush"]');
brush.addEventListener("click", function(){
  canvasState.tool = Tool.BRUSH;

  this.classList.add('paint__tool--selected');
  canvas.classList.add('paint__canvas--brush');

  magnify.classList.remove('paint__tool--selected');
  canvas.classList.remove('paint__canvas--pan-zoom');
});

const bucket = document.querySelector('[data-tool="bucket"]');
bucket.addEventListener("click", function(){
  if(canvasState.tool !== Tool.BRUSH)
    return

  canvasState.brush.fill = !canvasState.brush.fill;
  this.classList.toggle("paint__tool--selected", canvasState.brush.fill);
});

const title = document.getElementsByClassName("header__title")[0];
title.addEventListener("click", function(){
  canvasState.render();
  canvasState.writeHistory();
});

slider.addEventListener("change", function (){
  canvasState.brush.paintWidth = slider.valueAsNumber;
  ctx.lineWidth = canvasState.brush.paintWidth * canvasState.viewportTransform.scale;
});

function createColor(color){
  const palette = document.getElementById("all_colors");

  const swatch = document.createElement("button");
  const swatchInner = document.createElement("div");

  swatch.classList.add("paint__swatch");
  swatch.id = color;
  swatch.setAttribute("aria-label", `${color} color`);

  swatchInner.classList.add("paint__swatch-inner");
  swatchInner.style.backgroundColor = color;

  swatch.append(swatchInner);
  palette.append(swatch);
}

function createOptions(index, color){
  let palette = document.querySelector(".paint__color-choices");

  let swatch = document.createElement("button");
  let swatchInner = document.createElement("div");

  swatch.classList.add("paint__choice-swatch");
  swatch.setAttribute("id", index);

  swatchInner.classList.add("paint__choice-swatch-inner")
  swatchInner.style.backgroundColor = color;

  swatch.appendChild(swatchInner);
  palette.appendChild(swatch);

  return [swatch, swatchInner];
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

const ColorTarget = Object.freeze({
  BRUSH: 1,
  BUCKET: 2,
});

let selectedColorTarget = ColorTarget.BRUSH;
const [brushSquare, innerBrushSquare] = createOptions("1", "black");
const [bucketSquare, innerBucketSquare] = createOptions("2", "white");
brushSquare.classList.add("paint__choice-swatch--selected");

brushSquare.addEventListener("click", function(){
  selectedColorTarget = ColorTarget.BRUSH;;
  bucketSquare.classList.remove("paint__choice-swatch--selected");
  this.classList.add("paint__choice-swatch--selected");
});

bucketSquare.addEventListener("click", function(){
  selectedColorTarget = ColorTarget.BUCKET;
  brushSquare.classList.remove("paint__choice-swatch--selected");
  this.classList.add("paint__choice-swatch--selected");
});

let colorOptions = document.getElementById("all_colors");
colorOptions.addEventListener("click", setBrushColors);

function setBrushColors(event) {
  if (event.target.tagName !== "BUTTON" || event.target === event.currentTarget) {
    return;
  }

  const color = event.target.id;

  if (selectedColorTarget === ColorTarget.BRUSH) {
    canvasState.brush.color = color;
    innerBrushSquare.style.backgroundColor = color;
    ctx.strokeStyle = color;
  } else if (selectedColorTarget === ColorTarget.BUCKET) {
    canvasState.brush.bucketColor = color;
    innerBucketSquare.style.backgroundColor = color;
    ctx.fillStyle = color;
  }
}