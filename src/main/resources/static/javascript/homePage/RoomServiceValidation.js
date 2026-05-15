

const enter_username_div_error = document.getElementById("enter_username_error");
const enter_password_div_error = document.getElementById("enter_password_error");

const create_roomName_div_error = document.getElementById("create_roomname_error")
const create_username_div_error = document.getElementById("create_username_error");
const create_password_div_error = document.getElementById("create_password_error");

function enterRoomClientValidation(username, password){

    let valid = true
    enter_username_div_error.classList.add("hidden");
    enter_password_div_error.classList.add("hidden");

    if(username.length < 1 || username.length > 10){
        enter_username_div_error.classList.remove("hidden");
        enter_username_div_error.textContent = "length must be at least 1 character and at most 10 characters";
        valid = false;
    }

    if(password.length > 64){
        enter_password_div_error.classList.remove("hidden");
        enter_password_div_error.textContent = "length must be a max of 64 characters";
        valid = false;
    }

    return valid;
}

function createRoomClientValidation(roomName, ownerName, password){

    let valid = true
    create_roomName_div_error.classList.add("hidden");
    create_username_div_error.classList.add("hidden");
    create_password_div_error.classList.add("hidden");

    if(roomName.length < 5 || roomName.length > 25){
        create_roomName_div_error.classList.remove("hidden");
        create_roomName_div_error.textContent = "length must be at least 5 character and at most 25 characters";
        valid = false;
    }
    else if(!is_alphanumeric_and_spaces(roomName)){
        create_roomName_div_error.classList.remove("hidden");
        create_roomName_div_error.textContent = "Must only contain letters, numbers and spaces";
        valid = false;
    }

    if(ownerName.length < 1 || ownerName.length > 10){
        create_username_div_error.classList.remove("hidden");
        create_username_div_error.textContent = "length must be at least 1 character and at most 10 characters";
        valid = false;
    }

    if(password.length > 64){
        create_password_div_error.classList.remove("hidden");
        create_password_div_error.textContent = "length must be a max of 64 characters";
        valid = false;
    }

    return valid;
}

function serverValidation(){

}

function is_alphanumeric_and_spaces(name){
    return /^[a-zA-Z0-9 ]+$/.test(name);
}

export {enterRoomClientValidation, createRoomClientValidation}