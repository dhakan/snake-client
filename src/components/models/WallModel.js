class WallModel {
    constructor(data) {
        this._id = data.id;
        this._x = data.position.x;
        this._y = data.position.y;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }
}

export default WallModel;