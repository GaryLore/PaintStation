import {enterRoomClientValidation, createRoomClientValidation, handleCreateRoomServerErrors, handleEnterRoomServerErrors, resetCreateRoomErrors, resetEnterRoomErrors} from "./LobbyServiceValidation.js";

const createFormElement = document.querySelector("#createRoom");
createFormElement.addEventListener("submit", submitCreateForm)

const enterFormElement = document.querySelector("#enterRoom");
enterFormElement.addEventListener("submit", submitEnterForm)

const roomsListElement = document.querySelector(".roomsList");
document.addEventListener("DOMContentLoaded", loadRooms);
document.addEventListener("click", showEnterForm);

document.querySelector('.close-btn').addEventListener('click', closeModal);
function closeModal(){
    modalElement.classList.remove("show")
}

const modalElement =document.getElementById("model_container");
let roomSelectedName = "";

const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const socketURL = `${protocol}//${window.location.host}/ws`;
const stompClient = new StompJs.Client({brokerURL: socketURL});

stompClient.onConnect = (frame) => {
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

function PrintData(roomID, playerID, owner, players) {

    console.log("ROOM ID : ", roomID);
    console.log("PLAYER ID : ", playerID);
    console.log("OWNER : ", owner);
    console.log("PLAYERS : ", players);
}

async function submitCreateForm(event) {

    event.preventDefault();
    const formData = new FormData(createFormElement);
    const data = Object.fromEntries(Array.from(formData).map(([k,v]) => [k, v.trim()]));

    resetCreateRoomErrors();
    let clientValidation = createRoomClientValidation(data.roomName, data.ownerName, data.password);

    if(!clientValidation){
        return;
    }

    try {

        const response = await fetch("/api/room/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if(!response.ok){
            await handleCreateRoomServerErrors(response);
            return;
        }

        const {roomID, playerID, owner, players} = await response.json();

        //storing session so second js file can access this
        sessionStorage.setItem('USER_ID', playerID);
        sessionStorage.setItem('ROOM_ID', roomID);

        PrintData(roomID, playerID, owner, players);

        window.location.href = "/room.html";
    }
    catch (exception) {
        console.error(exception);
    }

}

function showEnterForm(event){

    if (event.target.matches('.roomCard')){
        roomSelectedName = event.target.getAttribute("name");
        modalElement.classList.add("show")
    }
}

async function submitEnterForm(event) {

    event.preventDefault();
    const formData = new FormData(enterFormElement);

    const roomName = roomSelectedName;
    const username = formData.get('username').trim();
    const password = formData.get('password').trim();

    resetEnterRoomErrors();
    let clientValidation = enterRoomClientValidation(username, password);

    if(!clientValidation){
        return;
    }

    try {
        const response = await fetch(`/api/room/${encodeURI(roomName)}/join`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username, password})
        });

        if(!response.ok){
            await handleEnterRoomServerErrors(response);
            return;
        }

        const {roomID, playerID, owner, players} = await response.json();

        sessionStorage.setItem('USER_ID', playerID);
        sessionStorage.setItem('ROOM_ID', roomID);
        PrintData(roomID, playerID, owner, players);

        // enter room
        window.location.href = "/room.html";
    }
    catch (exception) {
        console.error(exception);
    }
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

