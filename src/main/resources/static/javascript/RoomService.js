
const formElement = document.querySelector(".roomForm");
formElement.addEventListener("submit", submitForm)
const roomsListElement = document.querySelector(".roomsList");
document.addEventListener("DOMContentLoaded", loadRooms);

const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const socketURL = `${protocol}//${window.location.host}/load-rooms`;
const stompClient = new StompJs.Client({brokerURL: socketURL});

stompClient.onConnect = (frame) => {
    //setConnected(true);
    console.log('Connected: ' + frame);
    stompClient.subscribe('/topic/update', (updateRoomData) => {
        console.log("SOCKET DATA : ")
        const updateData = JSON.parse(updateRoomData.body);
        console.log(updateData);
        updateRooms(updateData);
    });
};

stompClient.onWebSocketError = (error) => {
    console.error('Error with websocket', error);
};

stompClient.onStompError = (frame) => {
    console.error('Broker reported error: ' + frame.headers['message']);
    console.error('Additional details: ' + frame.body);
};

//activates connection
stompClient.activate();

async function submitForm(event) {
    event.preventDefault();
    const formData = new FormData(formElement);
    const data = Object.fromEntries(formData);
    console.log(data);

    const response = await fetch("/api/room/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const {roomID, playerID, owner, players} = await response.json();

    console.log("ROOM ID : ", roomID);
    console.log("PLAYER ID : ", playerID);
    console.log("OWNER : ", owner);
    console.log("PLAYERS : ", players);
}

async function loadRooms(){

    const response = await fetch("/api/room/load");
    const data = await response.json();

    clearRooms();

    //array of rooms
    const rooms = data.rooms;
    for(let room of rooms){
        addRoom(room.name)
    }

    console.log(data);
}

function updateRooms(roomData){

    const action = roomData.action;
    const roomName = roomData.name;

    if(action === "INSERT"){
        addRoom(roomName);
    }
    else if(action === "DELETE"){
        deleteRoom(roomName);
    }
}

function addRoom(roomName){
    const newRoomDiv = document.createElement("div")
    newRoomDiv.classList.add("roomCard");
    console.log(roomName);
    newRoomDiv.textContent = roomName;
    newRoomDiv.setAttribute('name', roomName);
    roomsListElement.appendChild(newRoomDiv);
}

function deleteRoom(roomName) {

    const tempRoom = document.querySelector('[${roomName}]');

    //tempRoom.remove();
    //for internet explorer support
    tempRoom.parentNode.removeChild(tempRoom);

}

function clearRooms(){

    //internet explorer support
    while (roomsListElement.firstChild) {
        roomsListElement.removeChild(roomsListElement.firstChild);
    }
}