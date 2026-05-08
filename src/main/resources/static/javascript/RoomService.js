
const formElement = document.querySelector(".roomForm");
formElement.addEventListener("submit", submitForm)

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