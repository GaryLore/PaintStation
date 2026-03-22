const Color = Object.freeze({
  BLACK: 0,
  GRAY: 1,
  DARKRED: 2,
  RED: 3,
  ORANGE: 4,
  YELLOW: 5,
  GREEN: 6,
  TURQUOISE: 7,
  INDIGO: 8,
  PURPLE: 9,
  WHITE: 10,
  LIGHTGRAY: 11,
  BROWN: 12,
  PINK: 13,
  GOLD: 14,
  LIGHTYELLOW: 15,
  LIME: 16,
  PALETURQUOISE: 17,
  CADETBLUE: 18,
  LAVENDER: 19
});

const Colors = [
  { r: 0, g: 0, b: 0 },        // BLACK
  { r: 128, g: 128, b: 128 },  // GRAY
  { r: 139, g: 0, b: 0 },      // DARKRED
  { r: 255, g: 0, b: 0 },      // RED
  { r: 255, g: 165, b: 0 },    // ORANGE
  { r: 255, g: 255, b: 0 },    // YELLOW
  { r: 0, g: 128, b: 0 },      // GREEN
  { r: 64, g: 224, b: 208 },   // TURQUOISE
  { r: 75, g: 0, b: 130 },     // INDIGO
  { r: 128, g: 0, b: 128 },    // PURPLE
  { r: 255, g: 255, b: 255 },  // WHITE
  { r: 211, g: 211, b: 211 },  // LIGHTGRAY
  { r: 165, g: 42, b: 42 },    // BROWN
  { r: 255, g: 192, b: 203 },  // PINK
  { r: 255, g: 215, b: 0 },    // GOLD
  { r: 255, g: 255, b: 224 },  // LIGHTYELLOW
  { r: 0, g: 255, b: 0 },      // LIME
  { r: 175, g: 238, b: 238 },  // PALETURQUOISE
  { r: 95, g: 158, b: 160 },   // CADETBLUE
  { r: 230, g: 230, b: 250 }   // LAVENDER
];

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

    let color = Color[stringColor.toUpperCase()];
    const myImageData = ctxHidden.getImageData(0, 0, offscreen.width, offscreen.height);
    const pixels = myImageData.data;
    const size = myImageData.width * myImageData.height * 4;
    const cols = offscreen.width * 4;

    var denque = new Denque();
    let colorIndices = getColorIndicesForCoord(x, y, offscreen.width);
    let [r, g, b, a] = colorIndices;
    let point = new Pixel(x, y, r, pixels[r], pixels[g], pixels[b], pixels[a]);
    let temp = new Pixel(x, y, 0, Colors[color].r, Colors[color].g, Colors[color].b, 255);//used to compare just in case color is same as pixel selected

    //if its tehcnically the same color as the pixels selected, its always going to be color = color, since even when the neighbors color is changed, its changed to the exact same color,
    //due to this its needed that we break if its the exact same color, leading to a infinite while.
    if(point.isEqual(pixels, temp))
        return;

    pixels[r] = Colors[color].r;
    pixels[g] = Colors[color].g;
    pixels[b] = Colors[color].b;
    pixels[a] = 255;//originalyl had an error accessing Color.RBG[color].a because that doesnt exist so paint wasnt working

    let paintBucket = new Bucket(stringColor);
    paintBucket.addPoint(x - viewportTransformHidden.x ,y - viewportTransformHidden.y);
    denque.push(point);//point will still contain old colors in it even after update, which is ok because we want to compare old colors not new

    let colored = 0;
    let num = 0;
    let limit = 100000;
    while(!denque.isEmpty()){

        //pops node and assigns the new color
        let currPoint = denque.shift();

        const currIndex = currPoint.indexR;
        let neighborIndex;
        let neighbor;
        let x = currPoint.x;
        let y = currPoint.y;
        let tempX, tempY;

        //push up if equal color to original and not out of bounds
        neighborIndex = currIndex - cols;
        if(neighborIndex >= 0){
            tempX = x;
            tempY = y - 1;
            if(tempY >= 0){
                PushIFSameColor(tempX, tempY, neighbor, neighborIndex, currPoint);
            }
            /*
            if(num >= limit){
                break;
            }*/
        }
        //push right
        neighborIndex = currIndex + 4;
        if(neighborIndex < size){
            tempX = x + 1;
            tempY = y;
            if(tempX <= myImageData.width){
                PushIFSameColor(tempX, tempY, neighbor, neighborIndex, currPoint);
            }
            /*
            if(num >= limit){
                break;
            }*/
        }
        //push down
        neighborIndex = currIndex + cols;
        if(neighborIndex < size){
            tempX = x;
            tempY = y + 1;
            if(tempY <= myImageData.height){
                PushIFSameColor(tempX, tempY, neighbor, neighborIndex, currPoint);
            }
            /*
            if(num >= limit){
                break;
            }*/
        }
        //push left
        neighborIndex = currIndex - 4;
        if(neighborIndex >= 0){
            tempX = x - 1;
            tempY = y;
            if(tempX >= 0){
                PushIFSameColor(tempX, tempY, neighbor, neighborIndex, currPoint);
            }
            /*
            if(num >= limit){
                break;
            }*/
        }

        ++colored
        if(colored % 100 == 0){
            console.log(colored);
        }
    }
    paintHistory.push(paintBucket);
    //paintBucket.draw();

    //updates offScreen canvas with new painted pixels
    ctxHidden.putImageData(myImageData, 0, 0);

    function PushIFSameColor(x, y, neighbor, neighborIndex, currPoint) {
        neighbor = new Pixel(x, y, neighborIndex, pixels[neighborIndex], pixels[neighborIndex + 1], pixels[neighborIndex + 2], pixels[neighborIndex + 3]);//always store old color

        if (currPoint.isEqual(neighbor)) {
            denque.push(neighbor);
            paintBucket.addPoint(x - viewportTransformHidden.x ,y - viewportTransformHidden.y);
            num++;
            pixels[neighbor.indexR] = Colors[color].r;
            pixels[neighbor.indexR + 1] = Colors[color].g;
            pixels[neighbor.indexR + 2] = Colors[color].b;
            pixels[neighbor.indexR + 3] = 255;
        }
    }
}