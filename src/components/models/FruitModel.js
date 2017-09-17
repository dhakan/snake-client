class FruitModel {

    /**
     * FruitModel constructor
     */
    constructor(data) {
        this._id = data.id;
        this._x = data.position.x;
        this._y = data.position.y;
        this._value = data.value;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get value() {
        return this._value;
    }
}

export default FruitModel;