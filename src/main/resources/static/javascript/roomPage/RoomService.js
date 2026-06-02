import PaintRequest from "./PaintRequest.js";
import Stroke from "./Stroke.js";
import Dot from "./Dot.js";
import {canvasState, ctx} from "./canvasState.js"

const userID = sessionStorage.getItem("USER_ID");
const roomName = sessionStorage.getItem("ROOM_NAME");
const USERNAME = await getName();

const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const socketURL = `${protocol}//${window.location.host}/ws`;
const stompClient = new StompJs.Client({
    brokerURL: socketURL,
    debug: console.log
});

stompClient.onConnect = (frame) => {
    console.log("PLEASE WORK");
    console.log('Connected: ' + frame);
    stompClient.subscribe(
        `/topic/room/${roomName}`,
        loadPaintObjects,
        {userID : userID}
    );
    console.log(`SUBSCRIBED TO : /topic/room/${roomName}`);
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
                console.log("PAINT OBJECT WITH END : ", paintObject);
                canvasState.paintHistory.push(paintObject);
                paintObject = optimizePaintHistory(paintObject);//could return null
            }
        }
        else if (type === "DOT") {
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

    canvasState.writeHistory();
    const completeFillStroke = new Stroke({
        uuid : paintObject.uuid,
        phase : "COMPLETE",
        brushColor : paintObject.brushColor,
        bucketColor : paintObject.bucketColor,
        width : paintObject.width,
        fill : paintObject.fill
    });

    const completeStrokeUUID = completeFillStroke.uuid;

    let paintList = canvasState.paintHistory;
    let indexOfFirstStroke = undefined;
    for (let i = paintList.length - 1; i >= 0; i--) {

        let paintObjectInQuestion = paintList[i];
        if(completeStrokeUUID === paintObjectInQuestion.uuid && paintObjectInQuestion.phase === "START"){
            indexOfFirstStroke = i;
            break;
        }
    }
    //needed because sometimes end stroke arrives before start stroke, so we dont create a stroke thatt will have no points
    //which will generate an error
    if(indexOfFirstStroke === undefined){
        //console.log("COULDNT find first stroke");
        return null;
    }

    for(let i = indexOfFirstStroke; i !== paintList.length; ++i){

        let strokeToAppend = paintList[i];
        if(completeStrokeUUID === strokeToAppend.uuid){
            //console.log("equal stroke");
            for (let j = 0; j < strokeToAppend.points.length; j++) {
                //console.log("Point beign added");
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
        destination: `/app/room/${roomName}`,
        body: JSON.stringify(paintRequest)
    });
}

async function getName() {
    const response = await fetch(`/api/username`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({roomName: roomName, userID})
    });

    return response.text();
}

export {sendPaintObjects}