const Colors = Object.freeze({
  BLACK:        { r: 0,   g: 0,   b: 0 },
  GRAY:         { r: 128, g: 128, b: 128 },
  DARKRED:      { r: 139, g: 0,   b: 0 },
  RED:          { r: 255, g: 0,   b: 0 },
  ORANGE:       { r: 255, g: 165, b: 0 },
  YELLOW:       { r: 255, g: 255, b: 0 },
  GREEN:        { r: 0,   g: 128, b: 0 },
  TURQUOISE:    { r: 64,  g: 224, b: 208 },
  INDIGO:       { r: 75,  g: 0,   b: 130 },
  PURPLE:       { r: 128, g: 0,   b: 128 },
  WHITE:        { r: 255, g: 255, b: 255 },
  LIGHTGRAY:    { r: 211, g: 211, b: 211 },
  BROWN:        { r: 165, g: 42,  b: 42 },
  PINK:         { r: 255, g: 192, b: 203 },
  GOLD:         { r: 255, g: 215, b: 0 },
  LIGHTYELLOW:  { r: 255, g: 255, b: 224 },
  LIME:         { r: 0,   g: 255, b: 0 },
  PALETURQUOISE:{ r: 175, g: 238, b: 238 },
  CADETBLUE:    { r: 95,  g: 158, b: 160 },
  LAVENDER:     { r: 230, g: 230, b: 250 }
});

class Pixel {

    //contain indexes of the colors not the actual color values
    constructor(x, y, indexR, red, green, blue, alpha){
        this.x = x;
        this.y = y;
        this.indexR = indexR;
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }

    isEqual(object){
        return object instanceof Pixel && this.red == object.red && this.green == object.green  && this.blue == object.blue && this.alpha == object.alpha;
    }
}

const getColorIndicesForCoord = (x, y, width) => {
  const red = y * (width * 4) + x * 4;
  return [red, red + 1, red + 2, red + 3];
};

function floodFillBFS(x, y, stringColor){

    let color = stringColor.toUpperCase();
    const myImageData = ctxHidden.getImageData(0, 0, offscreen.width, offscreen.height);
    const pixels = myImageData.data;
    const size = myImageData.width * myImageData.height * 4;
    const cols = offscreen.width * 4;

    var denque = new Denque();
    let colorIndices = getColorIndicesForCoord(x, y, offscreen.width);
    let [r, g, b, a] = colorIndices;
    let point = new Pixel(x, y, r, pixels[r], pixels[g], pixels[b], pixels[a]);
    let temp = new Pixel(x, y, 0, ColorRGB[color].r, ColorRGB[color].g, ColorRGB[color].b, 255);//used to compare just in case color is same as pixel selected

    //if its tehcnically the same color as the pixels selected, its always going to be color = color, since even when the neighbors color is changed, its changed to the exact same color,
    //due to this its needed that we break if its the exact same color, leading to a infinite while.
    if(point.isEqual(pixels, temp))
        return;

    pixels[r] = ColorRGB[color].r;
    pixels[g] = ColorRGB[color].g;
    pixels[b] = ColorRGB[color].b;
    pixels[a] = 255;//originalyl had an error accessing Color.RBG[color].a because that doesnt exist so paint wasnt working

    let paintBucket = new Bucket(stringColor);
    denque.push(point);//point will still contain old colors in it even after update, which is ok because we want to compare old colors not new


    //this is not the traditional way of implementing flood fill, we will not change color of pixels
    while(!denque.isEmpty()){

        let current = denque.shift();

        let x = currPoint.x;
        let y = currPoint.y;

        let adj = neighbors(current, x, y);
        adj.forEach((adjacent) => {

            if(!isVisited(adjacent)){
                denque.push(adjacent);
                setVisited(adjacent);
            }

        });


    }

    function neighbors(current,x,y){

        let neighborIndex, neighborX, neighborY;
        let neighbors = [];

        //up
        neighborIndex = currIndex + cols;
        neighborX = x;
        neighborY = y - 1;
        if(neighborY >= 0){
            pushIfSameColor(neighborX, neighborY, neighborIndex, current, neighbors, 6);
        }

        //right
        neighborIndex = currIndex + 4;
        neighborX = x + 1;
        neighborY = y;
        if(neighborX >= myImageData.width){
            pushIfSameColor(neighborX, neighborY, neighborIndex, current, neighbors, 8);
        }

        //down
        neighborIndex = currIndex - cols;
        neighborX = x;
        neighborY = y + 1;
        if(neighborY <= myImageData.height){
            pushIfSameColor(neighborX, neighborY, neighborIndex, current, neighbors, 2);
        }

        //left
        neighborIndex = currIndex - 4;
        neighborX = x - 1;
        neighborY = y;
        if(neighborX >= 0){
            pushIfSameColor(neighborX, neighborY, neighborIndex, current, neighbors, 4);
        }

        return neighbors;
    }

    function pushIfSameColor(neighborX, neighborY, neighborIndex, current, neighbors, dir) {
        let neighbor = new Pixel(neighborX, neighborY, neighborIndex, pixels[neighborIndex], pixels[neighborIndex + 1], pixels[neighborIndex + 2], pixels[neighborIndex + 3]);
        if (sameColor(current, neighbor)) {
            neighbors.push(neighbor);
        }
        else if(!isVisited(neighbor)){//means we have found an outline of a shape
            Moore(current, neighbor, dir);
        }
    }

    function setVisited(p){
        pixels[p.indexR + 3] = 0; 
    }

    function isVisited(p){
        return pixels[p.indexR + 3] == 0;
    }

    function sameColor(current, neighbor){
        return current.isEqual(neighbor);
    }

    
    function Moore(enter, start, dir){

        /*
        enter is pixel that it enters from
        start is the first boundary pixel
        dir is the pixel from perspective of the current pixel where the backtrack pixel is
        using moores neighboorhood
        */

        let B = [] //outline of shape
        let s = [start.x,start.y]
        B.push(s);
        let p = s; //current boundary pixel
        

    } 
}