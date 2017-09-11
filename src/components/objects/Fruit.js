import Phaser from 'phaser';

const ASSET_VALUE_MAP = {
    '1': 'fruit',
    '2': 'banana',
    '3': 'red'
}

class Fruit extends Phaser.Sprite {

    /**
     * Fruit constructor
     * @param {Phaser.Game} game the game by which to spawn the player
     */
    constructor(game, x, y, value) {
        super(game, x, y, ASSET_VALUE_MAP[value]);

        this.width = game.settings.GRID_SIZE;
        this.height = game.settings.GRID_SIZE;
        this.game.physics.enable(this);
        this.body.onCollide = new Phaser.Signal();
        this.addOnCollisionListener(this._handleCollision, this);

        game.add.existing(this);
    }

    _handleCollision() {
        this.kill();
    }

    addOnCollisionListener(callback) {
        this.body.onCollide.add(callback, this);
    }
}

export default Fruit;