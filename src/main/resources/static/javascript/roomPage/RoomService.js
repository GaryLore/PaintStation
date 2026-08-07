import PaintRequest from "./PaintRequest.js";
import Stroke from "./Stroke.js";
import Dot from "./Dot.js";
import {canvasState, ctx} from "./canvasState.js"

const roomName = sessionStorage.getItem("ROOM_NAME");
const username = sessionStorage.getItem("USERNAME");
const playersListElement = document.querySelector(".chat__players");
const userCountElement = document.getElementById("userCount");
const messageContainerElement = document.querySelector(".chat__messages");
const messageInputElement = document.getElementById("messageInput");
const chatFormElement = document.getElementById("chatForm");
chatFormElement.addEventListener("submit", sendMessage);
const messagePopAudio = new Audio("../../audio/MessagePop.mp3");
messagePopAudio.volume = 0.25;
let PLAYERS;

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
        `/topic/room/${roomName}/paint`,
        paintSocketHandling
    );
    stompClient.subscribe(
        `/topic/room/${roomName}/chat`,
        chatSocketHandling
    )
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

function chatSocketHandling(responseData){
    const data = JSON.parse(responseData.body)
    const name = data.username;
    const text = data.text;
    messagePopAudio.play();
    loadMessage(name, text);
    scrollDown();
}

function loadMessage(name, text){
    const messageDiv = document.createElement("div")

    messageDiv.classList.add("message")
    if(name === username){
        messageDiv.classList.add("senderMessage");
        messageDiv.textContent = text;
    }
    else{
        messageDiv.classList.add("receiverMessage");

        const nameDiv = document.createElement("div")
        const textDiv = document.createElement("div")

        nameDiv.textContent = name;
        textDiv.textContent = text;

        nameDiv.classList.add("messageName");
        textDiv.classList.add("messageText");

        messageDiv.appendChild(nameDiv);
        messageDiv.appendChild(textDiv);
    }
    messageContainerElement.appendChild(messageDiv);
}

function scrollDown(){
    messageContainerElement.scrollTop = messageContainerElement.scrollHeight;
}

function sendMessage(event){
    event.preventDefault();
    const text = messageInputElement.value;

    console.log("MESSAGE GONNA BE SENT [", text, "]");
    if(text.length <= 100 && /\S/.test(text)) {
        stompClient.publish({
            destination: `/app/room/${roomName}/chat`,
            body: text//JSON.stringify(text)
        });

        messageInputElement.value = "";
    }
    else if(text.length > 100){
        messageInputElement.placeholder = "Message Can't Be Over 100 characters"
        setTimeout(() => {
            messageInputElement.placeholder = "Type your message...";
        }, 2000);
    }
    messageInputElement.value = "";
}

function paintSocketHandling(responseData){
    const data = JSON.parse(responseData.body)
    const type = data.type;

    switch (type) {
        case "PLAYER_UPDATE":
            const action = data.action;

            if(action === "ADD"){
               PLAYERS.push(data.user);
               addPlayer(data.user);
            }
            else if(action === "REMOVE"){
                const indexToRemove = PLAYERS.indexOf(data.user);
                PLAYERS.splice(indexToRemove,1);
                removePlayer(data.user);
            }
            userCountElement.innerText = `${PLAYERS.length} Online`
            break;
        default:
            const USERNAME = data.user;
            if(username !== USERNAME) {
                let paintObject;

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
    const paintRequest = new PaintRequest(paintType, paintObject);
    const payload = JSON.stringify(paintRequest);
    const bytes = new TextEncoder().encode(payload).length;

    //console.log(paintRequest);
    //console.log("PAINT REQUEST KB : ", bytes/1024);

    stompClient.publish({
        destination: `/app/room/${roomName}/paint`,
        body: JSON.stringify(paintRequest)
    });
}

async function init(){
    const response = await fetch("/api/paint/init", {
        method : "POST",
        headers : {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({roomName, username})
    })

    if(!response.ok){
        console.error(response);
        return;
    }

    const roomTitle = document.getElementsByClassName("header__title")[0];
    roomTitle.textContent = `🎨 ${roomName}`;

    const {players} = await response.json();
    PLAYERS = players;

    for(const player of PLAYERS){
        addPlayer(player);
    }

    userCountElement.innerText = `${PLAYERS.length} Online`;
}

function addPlayer(player){
    const playerDiv = document.createElement("div")
    playerDiv.classList.add("player-card");
    if(player === username){
        playerDiv.classList.add("player-card--you");
    }
    playerDiv.textContent = player;
    playerDiv.setAttribute('data-name', player);
    playersListElement.appendChild(playerDiv);
}

function removePlayer(player){
    const playerDiv = document.querySelector(`div[data-name="${player}"]`);
    playerDiv?.remove();
}
export {sendPaintObjects}