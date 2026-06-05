import PaintRequest from "./PaintRequest.js";
import Stroke from "./Stroke.js";
import Dot from "./Dot.js";
import {canvasState, ctx} from "./canvasState.js"

const userID = sessionStorage.getItem("USER_ID");
const roomName = sessionStorage.getItem("ROOM_NAME");
const playersListElement = document.querySelector(".players");
const userCountElement = document.getElementById("userCount");
let USERNAME, PLAYERS;

const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const socketURL = `${protocol}//${window.location.host}/ws`;
const stompClient = new StompJs.Client({
    brokerURL: socketURL,
    /*debug: console.log*/
});

stompClient.onConnect = (frame) => {
    console.log("PLEASE WORK");
    console.log('Connected: ' + frame);
    stompClient.subscribe(
        `/topic/room/${roomName}`,
        websocketHandling,
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
    window.location.href = "/";
};

await init();
//activates connection
stompClient.activate();

function websocketHandling(responseData){
    console.log("WEBSOCKET HANDLING RAN");
    const data = JSON.parse(responseData.body)
    const type = data.type;

    switch (type) {
        case "PLAYER_UPDATE":
            const action = data.action;

            //checking USERNAME isnt yours fixes duplicate data when user subscribes and init() and websocketHandling() both run
            if(action === "ADD" && USERNAME !== data.user){
               PLAYERS.push(data.user);
               addPlayer(data.user);
            }
            else if(action === "REMOVE"){
                const indexToRemove = PLAYERS.indexOf(data.user);
                PLAYERS.splice(indexToRemove,1);
                removePlayer(data.user);
            }
            userCountElement.innerText = `🟢 ${PLAYERS.length} Online`
            break;
        case "MESSAGE":
            break;
        default:
            const username = data.user;
            if(username !== USERNAME) {
                let paintObject;
                const type = data.type;

                if (type === "STROKE") {
                    paintObject = Stroke.fromJson(data.object);

                    if(paintObject.phase === "END" && paintObject.fill){
                        //console.log("PAINT OBJECT WITH END : ", paintObject);
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
                    canvasState.reloadJustBorder();
                }
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

async function init(){
    const response = await fetch("/api/paint/init", {
        method : "POST",
        headers : {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({roomName, userID})
    })

    if(!response.ok){
        return;
    }

    const {username, players} = await response.json();
    USERNAME = username;
    PLAYERS = players;

    for(const player of PLAYERS){
        addPlayer(player);
    }

    userCountElement.innerText = `🟢 ${PLAYERS.length} Online`
}

function addPlayer(player){
    const playerDiv = document.createElement("div")
    playerDiv.classList.add("playerCard");
    if(player === USERNAME){
        playerDiv.classList.add("you");
    }
    playerDiv.textContent = player;
    playerDiv.setAttribute('name', player);
    playersListElement.appendChild(playerDiv);
}

function removePlayer(player){
    const playerDiv = document.querySelector(`div[name="${player}"]`);
    playerDiv?.remove();
}
export {sendPaintObjects}