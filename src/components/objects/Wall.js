import Phaser from 'phaser';

class Wall extends Phaser.Sprite {

    constructor(game, x, y) {
        super(game, x, y, 'wall');

        this.width = game.settings.GRID_SIZE;
        this.height = game.settings.GRID_SIZE;

        game.add.existing(this);
    }
}

export default Wall;