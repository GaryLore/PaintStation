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

const ColorRGB = [
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
    constructor(red, green, blue, alpha){
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }

    isEqual(DATA, object){
        console.log("RED:", 
        "this =", DATA[this.red], 
        "object =", DATA[object.red]
        );

        console.log("GREEN:", 
        "this =", DATA[this.green], 
        "object =", DATA[object.green]
        );

        console.log("BLUE:", 
        "this =", DATA[this.blue], 
        "object =", DATA[object.blue]
        );

        console.log("ALPHA:", 
        "this =", DATA[this.alpha], 
        "object =", DATA[object.alpha]
        );
        
        return object instanceof Pixel && DATA[this.red] == DATA[object.red] && DATA[this.green] == DATA[object.green] && DATA[this.blue] == DATA[object.blue] && DATA[this.alpha] == DATA[object.alpha];
    }
}

const getColorIndicesForCoord = (x, y, width) => {
  const red = y * (width * 4) + x * 4;
  return [red, red + 1, red + 2, red + 3];
};

function floodFillBFS(x, y, color){

    const myImageData = ctxHidden.getImageData(0, 0, offscreen.width, offscreen.height);
    const pixels = myImageData.data;
    const size = myImageData.width * myImageData.height * 4;
    const cols = offscreen.width * 4;

    queue = [];
    let colorIndices = getColorIndicesForCoord(x, y, offscreen.width);
    let [r, g, b, a] = colorIndices;
    let point = new Pixel(r, g, b, a);
    queue.push(point);

    while(queue.length != 0){

        //pops node and assigns the new color
        let currPoint = queue.shift();
        console.log(currPoint);
        [r, g, b, a] = [currPoint.red, currPoint.blue, currPoint.green, currPoint.alpha];
        pixels[r] = ColorRGB[color].r;
        pixels[g] = ColorRGB[color].g;
        pixels[b] = ColorRGB[color].b;
        pixels[a] = ColorRGB[color].a;

        const currIndex = r;
        let neighborIndex;
        let neighbor;

        //push up if equal color to original and not out of bounds
        neighborIndex = currIndex - cols;
        if(neighborIndex >= 0){
            console.log("IF ENTERED");
            PushIFSameColor(neighbor, neighborIndex, currPoint);
        }
        //push right
        neighborIndex = currIndex + 4;
        if(neighborIndex < size){
            PushIFSameColor(neighbor, neighborIndex, currPoint);
        }
        //push down
        neighborIndex = currIndex + cols;
        if(neighborIndex < size){
            PushIFSameColor(neighbor, neighborIndex, currPoint);
        }
        //push left
        neighborIndex = currIndex - 4;
        if(neighborIndex >= 0){
            PushIFSameColor(neighbor, neighborIndex, currPoint);
        }

    }

    //updates offScreen canvas with new painted pixels
    ctxHidden.putImageData(myImageData, myImageData.width, myImageData.height);

    function PushIFSameColor(neighbor, neighborIndex, currPoint) {
        neighbor = new Pixel(neighborIndex, neighborIndex + 1, neighborIndex + 2, neighborIndex + 3);
        if (currPoint.isEqual(neighbor)) {
            console.log("SECOND IF ENTERED");
            queue.push(neighbor);
        }
    }
}