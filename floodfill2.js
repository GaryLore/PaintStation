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
    let startPixel = new Pixel(x, y, r, pixels[r], pixels[g], pixels[b], pixels[a]);
    let temp = new Pixel(x, y, 0, Colors[color].r, Colors[color].g, Colors[color].b, 255);//used to compare just in case color is same as pixel selected

    //if its tehcnically the same color as the pixels selected, its always going to be color = color, since even when the neighbors color is changed, its changed to the exact same color,
    //due to this its needed that we break if its the exact same color, leading to a infinite while.
    if(startPixel.isEqual(pixels, temp))
        return;

    pixels[r] = Colors[color].r;
    pixels[g] = Colors[color].g;
    pixels[b] = Colors[color].b;
    pixels[a] = 255;//originalyl had an error accessing Color.RBG[color].a because that doesnt exist so paint wasnt working

    let paintBucket = new Bucket(stringColor);
    let shapeIndex = 0;
    denque.push(startPixel);//point will still contain old colors in it even after update, which is ok because we want to compare old colors not new


    //this is not the traditional way of implementing flood fill, we will not change color of pixels

    let i = 0;
    while(!denque.isEmpty()){

        let current = denque.shift();

        console.log("POINT IN BFS   ", current);
        let x = current.x;
        let y = current.y;

        let adj = neighbors(current, x, y);
        adj.forEach((adjacent) => {

            if(!isVisited(adjacent)){
                denque.push(adjacent);
                setVisited(adjacent);
            }

        });

        if(i % 100 == 0){
            console.log(i);
        }

        ++i;
    }

    paintHistory.push(paintBucket);

    function neighbors(current,x,y){

        let neighborIndex, neighborX, neighborY;
        let neighbors = [];
        let currIndex = current.r;

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

        console.log("FIRST DIRECTION : ", dir);
        /*
        enter is pixel that it enters from
        start is the first boundary pixel
        dir is the pixel from perspective of the current pixel where the backtrack pixel is
        using moores neighboorhood
        */

        let dx, dy;
        const directions = [
            [-1, -1],   //P1
            [0, -1],    //P2
            [1, -1],    //P3
            [1, 0],     //P4
            [1, 1],     //P5
            [0, 1],     //P6
            [-1, 1],    //P7
            [-1, 0]     //P8
        ];

        let B = [] //outline of shape
        let s = [start.x,start.y]
        console.log("S : ", start);
        B.push(s);
        let p = s, pIndex = start.indexR; //current boundary pixel
        console.log("P : ", p);
        let currentDir = (dir + 1 > 8) ? 1 : dir + 1;
        console.log(currentDir);
        dx = directions[currentDir - 1][0]; dy = directions[currentDir - 1][1]; //zero indexed
        let c = [p[0] + dx, p[1] + dy], cIndex = pIndex + (dx * 4) + (dy * cols);
        console.log("C BEFORE WHILE : ", c);

        let num = 0;
        while(!isSame(c,s)){

            console.log("C : " , c);
            if(isBorder(c, cIndex)){
                console.log("FIRST IF");
                B.push(c);
                p = c; pIndex = c;

                //we backtrack the pixel then move counterclockwise one
                //no point in just going backtrack and not moving clockwise one
                //since the next iteration will obviously not be border so thats wasting
                //efficiency since we will have to rotate it anyway

                //currDir + 4 reverses the dir, plus 1 to rotate it once, and plus 1 because its 
                //1 based index not 0
                console.log("BEFORE TERNARY : ", currentDir);
                currentDir = (currentDir + 5 > 8) ? (currentDir + 5) % 9 + 1 : currentDir + 5;//error here
                console.log("After TERNARY : ", currentDir);
                dx = directions[currentDir - 1][0]; dy = directions[currentDir - 1][1];
                c = [p[0] + dx, p[1] + dy]; cIndex = pIndex + (dx * 4) + (dy * cols);
            }
            else{
                console.log("ELSE");
                //advances current pixel c to next clockwise pixel in M(p)
                currentDir = (dir + 1 > 8) ? 1 : dir + 1;
                dx = directions[currentDir - 1][0]; dy = directions[currentDir - 1][1];
                c = [p[0] + dx, p[1] + dy]; cIndex = pIndex + (dx * 4) + (dy * cols);
            }
             console.log("DIRECTION: ", currentDir);

             num++;
             if(num > 10){
                break;
             }
        }

        paintBucket.createShape();
        B.forEach((point) => {
            paintBucket.addPoint(shapeIndex, point[0], point[1]);
        });
        ++shapeIndex;

    } 
    function isSame(p1, p2){
        if(p1[0] == p2[0] && p1[1] == p2[1])
            return true;
        return false;
    }

    function isBorder(p, index){

        let currPixel = new Pixel(p[0], p[1], index, pixels[index], pixels[index + 1], pixels[index + 2], pixels[index + 3]);
        console.log(currPixel);
        console.log(startPixel);
        if(!startPixel.isEqual(currPixel)){//if color is not equal then it must be the border of some object
            setVisited(p);
            return true;
        }
        else if(p[0] == 0 || p[0] == myImageData.width || p[1] == 0 || p[1] == myImageData.height){
            setVisited(p);
            return true;
        }
        return false;

    }
}



