import WallModel from './WallModel';

class CourseModel {
    constructor(data) {
        this._settings = data.settings;
        this._walls = [];

        for (const wall of data.walls) {
            this._walls.push(new WallModel(wall));
        }
    }

    get settings () {
        return this._settings;
    }

    get walls () {
        return this._walls;
    }
}

export default CourseModel;