const enter_username_div_error = document.getElementById("enter_username_error");
const enter_password_div_error = document.getElementById("enter_password_error");
const enter_div_error = document.getElementById("enter_error");

const create_roomName_div_error = document.getElementById("create_roomname_error")
const create_username_div_error = document.getElementById("create_username_error");
const create_password_div_error = document.getElementById("create_password_error");

const errorClass = "error--hidden";


function enterRoomClientValidation(username, password){

    let valid = true

    if(username.length < 1 || username.length > 10){
        showError(enter_username_div_error, "Must be between 1 and 10 characters");
        valid = false;
    }

    if(password.length > 64){
        showError(enter_password_div_error, "Must be a max of 64 characters" )
        valid = false;
    }

    return valid;
}

function createRoomClientValidation(roomName, ownerName, password){

    let valid = true

    if(roomName.length < 5 || roomName.length > 25){
        showError(create_roomName_div_error, "Must be between 5 and 25 characters");
        valid = false;
    }
    else if(!is_alphanumeric_and_spaces(roomName)){
        showError(create_roomName_div_error, "Must only contain letters, numbers and spaces");
        valid = false;
    }

    if(ownerName.length < 1 || ownerName.length > 10){
        showError(create_username_div_error, "Must be between 1 and 10 characters");
        valid = false;
    }

    if(password.length > 64){
        showError(create_password_div_error, "Must be a max of 64 characters");
        valid = false;
    }

    return valid;
}

async function handleCreateRoomServerErrors(response) {

    const status = response.status;

    if(status === 409){
        const errorMessage = await response.text();
        showError(create_roomName_div_error, errorMessage);
    }
    else if(status === 400){

        const errors = await response.json();
        console.log(errors);

        if (errors.roomName) {
            showError(create_roomName_div_error, errors.roomName);
        }
        if (errors.ownerName) {//ownerName is username in this case
            showError(create_username_div_error, errors.ownerName);
        }
        if (errors.password) {
            showError(create_password_div_error, errors.password);
        }
    }
}

async function handleEnterRoomServerErrors(response) {

    const status = response.status;

    if (status === 400) {

        const errors = await response.json();
        console.log(errors);

        if (errors.username) {
            showError(enter_username_div_error, errors.username);
        }
        if (errors.password) {
            showError(enter_password_div_error, errors.password);
        }
        return;
    }

    const errorMessage = await response.text();
    console.log(errorMessage);
    if (status === 409) {
        showError(enter_username_div_error, errorMessage);
    }
    else if(status === 403){
        showError(enter_div_error, errorMessage);//change this one
    }
    else if(status === 401){
        showError(enter_password_div_error, errorMessage);
    }
    else if(status === 404){
        showError(enter_div_error, errorMessage);//change this one
    }
}

function is_alphanumeric_and_spaces(name){

    return /^[a-zA-Z0-9 ]+$/.test(name);
}

function showError(div, string) {

    div.classList.remove(errorClass);
    div.textContent = string;
}

function resetEnterRoomErrors() {

    enter_username_div_error.classList.add(errorClass);
    enter_password_div_error.classList.add(errorClass);
    enter_div_error.classList.add(errorClass);
}


function resetCreateRoomErrors() {

    create_roomName_div_error.classList.add(errorClass);
    create_username_div_error.classList.add(errorClass);
    create_password_div_error.classList.add(errorClass);
}

export {enterRoomClientValidation, createRoomClientValidation, handleCreateRoomServerErrors, handleEnterRoomServerErrors, resetCreateRoomErrors, resetEnterRoomErrors}