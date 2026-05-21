import PaintRequest from "./PaintRequest.js";
import Stroke from "./Stroke.js";
import Dot from "./Dot.js";
import {canvasState, ctx} from "./canvasState.js"

const userID = sessionStorage.getItem("USER_ID");
const roomID = sessionStorage.getItem("ROOM_ID");
const USERNAME = await getName();

const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const socketURL = `${protocol}//${window.location.host}/paint`;
const stompClient = new StompJs.Client({brokerURL: socketURL});

stompClient.onConnect = (frame) => {
    console.log("PLEASE WORK");
    console.log('Connected: ' + frame);
    stompClient.subscribe(`/topic/paint/${roomID}`, loadPaintObjects);
    console.log(`SUBSCRIBED TO : /topic/paint/${roomID}`);
};

stompClient.onWebSocketError = (error) => {
    console.error('Error with websocket', error);
};

stompClient.onStompError = (frame) => {
    console.error('Broker reported error: ' + frame.headers['message']);
    console.error('Additional details: ' + frame.body);
};

stompClient.onWebSocketClose = (event) => {
    console.error("WebSocket closed", event);
};

//activates connection
stompClient.activate();

function loadPaintObjects(responseData) {

    const data = JSON.parse(responseData.body)
    console.log(data);
    const username = data.user;

    //console.log("username : ", username);
    //console.log("USERNAME : ", USERNAME);

    if(username !== USERNAME) {

        let paintObject;
        const type = data.type;

        if (type === "STROKE") {

            paintObject = Stroke.fromJson(data.object);
            //console.log(data.object.phase);
            //console.log(paintObject);
            if(paintObject.phase === "END" && paintObject.fill){
                console.log("BEGIN PAINT HISTORY");
                canvasState.paintHistory.forEach((paintObject) => console.log("    ",paintObject.constructor.name, paintObject));
                console.log("END");
                paintObject = optimizePaintHistory(paintObject);

            }
        } else if (type === "DOT") {
            paintObject = Dot.fromJson(data.object);
        }
        canvasState.paintHistory.push(paintObject);

        console.log("BEGIN PAINT HISTORY");
        canvasState.paintHistory.forEach((paintObject) => console.log("    ",paintObject.constructor.name, paintObject));
        console.log("END");
        //console.log(paintObject);
        drawObject(paintObject);
    }
}

function drawObject(object){
    ctx.save()
    canvasState.setTransformCanvas();
    object.draw();
    ctx.restore()
}

function optimizePaintHistory(paintObject){

    const completeFillStroke = new Stroke(
        "COMPLETE",
        paintObject.uuid,
        paintObject.brushColor,
        paintObject.bucketColor,
        paintObject.width,
        paintObject.fill
    );

    const UUID = completeFillStroke.uuid;

    let paintList = canvasState.paintHistory;
    let indexOfFirstStroke = undefined;
    for (let i = paintList.length - 1; i >= 0; i--) {

        let paintObjectInQuestion = paintList[i];
        if(UUID === paintObject.uuid && paintObjectInQuestion.phase === "START"){
            indexOfFirstStroke = i;
            break;
        }
    }

    if(indexOfFirstStroke === undefined){
        console.log("ERROR finding beginning stroke for fill stroke that has reached its end");
    }

    for(let i = indexOfFirstStroke; i !== paintList.length; ++i){

        let strokeToAppend = paintList[i];
        if(UUID === strokeToAppend.uuid){

            strokeToAppend.points.forEach(p => completeFillStroke.addPoint(p));
            paintList.splice(i,1);
            --i; //necessary account for array shift to not skip elements
        }
    }

    return completeFillStroke;
}

function conditionToDelete(stroke, uuid) {

    return stroke.uuid === uuid;
}

function sendPaintObjects(paintType, paintObject){

    const paintRequest = new PaintRequest(userID, paintType, paintObject);
    console.log(paintRequest);

    const payload = JSON.stringify(paintRequest);
    const bytes = new TextEncoder().encode(payload).length;

    console.log("PAINT REQUEST KB : ", bytes/1024);

    stompClient.publish({
        destination: `/app/paint/${roomID}`,
        body: JSON.stringify(paintRequest)
    });
}

async function getName() {
    const response = await fetch(`/api/username`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({roomID, userID})
    });

    return response.text();
}

export {sendPaintObjects}