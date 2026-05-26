export default class PaintRequest{
    userID;
    type;
    object;

    constructor(userID, type, object) {
        this.userID = userID;
        this.type = type;
        this.object = object;
    }
}