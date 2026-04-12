const trashCan = document.getElementsByClassName("trash")[0];
trashCan.addEventListener("click", function(){
  const debug = false;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if(!debug){
    paintHistory = [];
  }

});

const magnify = document.getElementsByClassName("zoom")[0];
magnify.addEventListener("click", function(){

  option = Options.PANZOOM;
  this.classList.add('selected');
  canvas.classList.add('optionPanZoom');

  brush.classList.remove('selected');
  canvas.classList.remove('optionBrush');

});

const brush = document.getElementsByClassName("brush")[0];
brush.addEventListener("click", function(){

  option = Options.BRUSH;
  this.classList.add('selected');
  canvas.classList.add('optionBrush');

  magnify.classList.remove('selected');
  canvas.classList.remove('optionPanZoom');
});

const bucket = document.getElementsByClassName("bucket")[0];
bucket.addEventListener("click", function(){

  fill = !fill;

  if(fill){
    this.classList.add('selected');
    canvas.classList.add('optionBucket');
  }
  else{
    this.classList.remove('selected');
    canvas.classList.remove('optionBucket');
  }

});

const title = document.getElementsByClassName("title")[0];
title.addEventListener("click", function(){
  render();
});

const slider = document.getElementById("all_thickness");
slider.addEventListener("change", function (){
  paintWidth = slider.valueAsNumber;
  ctx.lineWidth = paintWidth * viewportTransform.scale;
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

let choice = 1;
const [brushSquare, innerBrushSquare] = createOptions("1", "black");
const [bucketSquare, innerBucketSquare] = createOptions("2", "white");
brushSquare.classList.add("selected");


brushSquare.addEventListener("click", function(){
  choice = 1;
  bucketSquare.classList.remove("selected");
  this.classList.add("selected");
});

bucketSquare.addEventListener("click", function(){
  choice = 2;
  brushSquare.classList.remove("selected");
  this.classList.add("selected");
});

let colorOptions = document.getElementById("all_colors");
colorOptions.addEventListener("click", setBrushColors);

function setBrushColors(e){
  if(e.target.tagName === "DIV" && e.target !== e.currentTarget){

      console.log("entered boss");
      console.log(colorBrush);

      if(choice == 1){
        colorBrush = e.target.id;
        innerBrushSquare.style.backgroundColor = colorBrush;
        ctx.strokeStyle = colorBrush;
      }
      else if(choice == 2){
        bucketColor = e.target.id;;
        innerBucketSquare.style.backgroundColor = bucketColor
        ctx.fillStyle = bucketColor;
      }
    }
}