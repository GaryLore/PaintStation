import PaintRequest from "./PaintRequest.js";
import Stroke from "./Stroke.js";
import Dot from "./Dot.js";
import {canvasState} from "./canvasState.js"

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
    const username = data.user;

    //console.log("username : ", username);
    //console.log("USERNAME : ", USERNAME);

    if(username !== USERNAME) {

        let paintObject;
        const type = data.type;

        if (type === "STROKE") {
            paintObject = Stroke.fromJson(data.object);
        } else if (type === "DOT") {
            paintObject = Dot.fromJson(data.object);
        }
        canvasState.paintHistory.push(paintObject);
        //console.log(paintObject);
        paintObject.draw();
    }
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