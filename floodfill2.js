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

const backtrack = new Map();
backtrack.set(0,5);
backtrack.set(1,7);
backtrack.set(2,7);
backtrack.set(3,1);
backtrack.set(4,1);
backtrack.set(5,3);
backtrack.set(6,3);
backtrack.set(7,5);

let flagError = false;

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
    const myImageData = ctxHidden.getImageData(0, 0, WIDTH, HEIGHT);
    const pixels = myImageData.data;
    const cols = WIDTH * 4;
    const visited = new Uint8Array(myImageData.width * myImageData.height);

    var denque = new Denque();
    let colorIndices = getColorIndicesForCoord(x, y, WIDTH);
    let [r, g, b, a] = colorIndices;
    let startPixel = new Pixel(x, y, r, pixels[r], pixels[g], pixels[b], pixels[a]);
    let temp = new Pixel(x, y, 0, Colors[color].r, Colors[color].g, Colors[color].b, 255);//used to compare just in case color is same as pixel selected

    //if its tehcnically the same color as the pixels selected, its always going to be color = color, since even when the neighbors color is changed, its changed to the exact same color,
    //due to this its needed that we break if its the exact same color, leading to a infinite while., also if its touching the edge it doesnt work as intended
    if(startPixel.isEqual(temp) || isEdge(startPixel))
        return;


    let paintBucket = new Bucket(stringColor);
    let shapeIndex = 0;
    denque.push(startPixel);//point will still contain old colors in it even after update, which is ok because we want to compare old colors not new

    //this is not the traditional way of implementing flood fill, we will not change color of pixels
    ErrorHistory = [];
    console.log("----------      IN BFS ALGORITHM        ----------");
    while(!denque.isEmpty()){

        let current = denque.shift();

        //console.log("POINT IN BFS   ", current);
        let x = current.x;
        let y = current.y;

        try {
            let adj = neighbors(current, x, y);
            const len = adj.length;
            for (let i = 0; i < len; i++){
                const node = adj[i];          
                if (!isVisited(node)) {      
                    denque.push(node);        
                    setVisited(node);        
                }
            }
        } catch (err){
            canvas.classList.add("error");
            setTimeout(() => { canvas.classList.remove("error"); }, 3000);

            let R = 0 ,G = 0 ,B = 0 ,A = 255;
            for(let i = 4; i != pixels.length; i = i + 4){
                let [r, g, b, a] = [pixels[i],pixels[i+1],pixels[i+2],pixels[i+3]];
                if(R != r || G != g || B != b || A != a){
                    console.log(`R:${R}, r:${r}, G:${G}, g:${g}, B:${B}, b:${b}, A:${A}, a:${a}`);
                    console.log("THIS PIXEL IS DIFFERENT", i);
                    let y = Math.floor(i / (2560 * 4));
                    let x = Math.floor((i % (2560 * 4))/4);
                    console.log("(", x, ",", y, ")");
                    //break;
                }

            }
            console.log(pixels);
            return;
        }
    }

    paintHistory.push(paintBucket);

    function neighbors(current,x,y){

        let neighborIndex, neighborX, neighborY;
        let neighbors = [];
        let currIndex = current.indexR;

        //up
        neighborIndex = currIndex - cols;
        neighborX = x;
        neighborY = y - 1;
        if(neighborY >= 0){
            pushIfSameColor(neighborX, neighborY, neighborIndex, current, neighbors, 5);
        }

        //right
        neighborIndex = currIndex + 4;
        neighborX = x + 1;
        neighborY = y;
        if(neighborX < WIDTH){
            pushIfSameColor(neighborX, neighborY, neighborIndex, current, neighbors, 7);
        }

        //down
        neighborIndex = currIndex + cols;
        neighborX = x;
        neighborY = y + 1;
        if(neighborY < HEIGHT){
            pushIfSameColor(neighborX, neighborY, neighborIndex, current, neighbors, 1);
        }

        //left
        neighborIndex = currIndex - 4;
        neighborX = x - 1;
        neighborY = y;
        if(neighborX >= 0){
            pushIfSameColor(neighborX, neighborY, neighborIndex, current, neighbors, 3);
        }

        return neighbors;
    }

    function pushIfSameColor(neighborX, neighborY, neighborIndex, current, neighbors, dir) {
        let neighbor = new Pixel(neighborX, neighborY, neighborIndex, pixels[neighborIndex], pixels[neighborIndex + 1], pixels[neighborIndex + 2], pixels[neighborIndex + 3]);
        //console.log("CHECK IF PIXEL ACCESS IS WORKING : ", pixels[neighborIndex] )
        //checks if same color and not edge
        if (current.isEqual(neighbor) && !isEdge(neighbor)) {
            neighbors.push(neighbor);
        }
        else if(!isVisited(neighbor)){//means we have found an outline of a shape
            Moore(neighbor, dir);
            if(flagError){

            }
        }
    }

    function setVisited(p){
        visited[p.y * WIDTH + p.x] = 1;
    }

    function isVisited(p){
        return visited[p.y * WIDTH + p.x] === 1;
    }

       function Moore(start, dir){

        console.log("----------      IN MOORE TRACING ALGORITHM        ----------");
        const t0 = performance.now();
        /*
        enter is pixel that it enters from
        start is the first boundary pixel
        dir is the pixel from perspective of the current pixel where the backtrack pixel is
        using moores neighboorhood
        */

        let dx, dy;
        const directions = [
            [-1, -1],   //P1 0 we will use zero indexing to not make code complex
            [0, -1],    //P2 1
            [1, -1],    //P3 2
            [1, 0],     //P4 3
            [1, 1],     //P5 4
            [0, 1],     //P6 5
            [-1, 1],    //P7 6
            [-1, 0]     //P8 7
        ];

        let B = [] //outline of shape
        const s = [start.x,start.y]
        B.push(s);
        setVisited(start);
        let p = s, pIndex = start.indexR; //current boundary pixel
        let currentDir = (dir + 1) % 8
        console.log(currentDir);
        dx = directions[currentDir][0]; dy = directions[currentDir][1]; //zero indexed
        let c = [p[0] + dx, p[1] + dy], cIndex = pIndex + (dx * 4) + (dy * cols);

        let num = 0;
        let dirCount = 1;
        while(!isSame(c,s)){

            //console.log("C : " , c);
            //console.log("C INDEX : ", cIndex);
            if(isBorder(c, cIndex)){
                dirCount = 1;
                //console.log("FIRST IF");
                B.push(c);
                p = c; pIndex = cIndex;

                //console.log("           X : ", p[0], " Y : ", p[1]);

                //we backtrack the pixel then move counterclockwise one
                //no point in just going backtrack and not moving clockwise one
                //since the next iteration will obviously not be border so thats wasting
                //efficiency since we will have to rotate it anyway

                //gets the correct backtrack direction
                currentDir = backtrack.get(currentDir);
                //console.log("After TERNARY : ", currentDir);
                dx = directions[currentDir][0]; dy = directions[currentDir][1];
                c = [p[0] + dx, p[1] + dy]; cIndex = pIndex + (dx * 4) + (dy * cols);
            }
            else{

                if(dirCount == 10){
                    console.log("OVER 8");
                    ErrorHistory.push(new Error(p[0] - viewportTransformHidden.x, p[1] - viewportTransformHidden.y));
                    return;
                }
                //advances current pixel c to next clockwise pixel in M(p)
                currentDir = (currentDir + 1) % 8;
                dx = directions[currentDir][0]; dy = directions[currentDir][1];
                c = [p[0] + dx, p[1] + dy]; cIndex = pIndex + (dx * 4) + (dy * cols);

                dirCount++;
            }
             //console.log("DIRECTION: ", currentDir);

             num++;
             if(num > 3686400){
                console.log("minor error");
                console.log(shapeIndex);
                throw new Error("Something went wrong");
             }
             
        }
        const t1 = performance.now();
        console.log(`       Moore Tracing Algorithm took ${(t1 - t0).toFixed(3)} ms`);

         /*
            special case where it only advances one pixel and back, due to pixels connected of length two
            this happens because the pixels arent perfectly alligned to where each stroke is drawn causing, causing a few pixels of the same color
            to be created. 
        */
        if(B.length != 2){
            paintBucket.createShape();
            const offsetX = viewportTransformHidden.x;
            const offsetY = viewportTransformHidden.y;
            for (let i = 0; i < B.length; i++) {
                const point = B[i];
                const x = point[0];
                const y = point[1];

                paintBucket.addPoint(shapeIndex, x - offsetX + 0.5, y - offsetY + 0.5);
            }
            ++shapeIndex;
        }

    } 
    function isSame(p1, p2){
        if(p1[0] == p2[0] && p1[1] == p2[1])
            return true;
        return false;
    }

    function isBorder(p, index){
        let currPixel = new Pixel(p[0], p[1], index, pixels[index], pixels[index + 1], pixels[index + 2], pixels[index + 3]);
        //console.log(currPixel);
        //console.log(startPixel);
        if(!startPixel.isEqual(currPixel) && !isVisited(currPixel)){//if color is not equal then it must be the border of some object
            setVisited(currPixel);
            return true;
        }
        else if(!startPixel.isEqual(currPixel) && isVisited(currPixel)){
            console.log("encountered same pixel while rotating");
            return false;
        }
        else if(isEdge(currPixel)){
            setVisited(currPixel);
            return true;
        }
        return false;

    }

    function isEdge(p){
        const x = p.x;
        const y = p.y;

        if(x == 0 || x == WIDTH - 1 || y == 0 || y == HEIGHT - 1){
            return true;
        }
        return false;
    }
}



