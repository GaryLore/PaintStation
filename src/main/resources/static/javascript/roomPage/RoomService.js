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
    //console.log(data);
    const username = data.user;

    //console.log("username : ", username);
    //console.log("USERNAME : ", USERNAME);

    if(username !== USERNAME) {

        let paintObject;
        const type = data.type;

        if (type === "STROKE") {

            paintObject = Stroke.fromJson(data.object);

            if(paintObject.phase === "END" && paintObject.fill){
                paintObject = optimizePaintHistory(paintObject);

            }
        } else if (type === "DOT") {
            paintObject = Dot.fromJson(data.object);
        }

        if(paintObject != null) {
            canvasState.paintHistory.push(paintObject);
            drawObject(paintObject);
        }
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
        if(UUID === paintObjectInQuestion.uuid && paintObjectInQuestion.phase === "START"){
            indexOfFirstStroke = i;
            break;
        }
    }

    //needed because sometimes end stroke arrives before start stroke, so we dont create a stroke thatt will have no points
    //which will generate an error
    if(indexOfFirstStroke === undefined){
        return null;
    }

    for(let i = indexOfFirstStroke; i !== paintList.length; ++i){

        let strokeToAppend = paintList[i];
        if(UUID === strokeToAppend.uuid){

            for (let j = 0; j < strokeToAppend.points.length; j++) {
                completeFillStroke.addPoint(strokeToAppend.points[j]);
            }

            paintList.splice(i,1);
            --i; //necessary account for array shift to not skip elements
        }
    }

    return completeFillStroke;
}

function sendPaintObjects(paintType, paintObject){

    const paintRequest = new PaintRequest(userID, paintType, paintObject);
    const payload = JSON.stringify(paintRequest);
    const bytes = new TextEncoder().encode(payload).length;

    //console.log(paintRequest);
    //console.log("PAINT REQUEST KB : ", bytes/1024);

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