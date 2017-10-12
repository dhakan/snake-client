import Phaser from 'phaser';

import GameState from '../states/GameState';

class Game extends Phaser.Game {

    /**
     * Game constructor
     */
    constructor(settings, networkHandler) {
        super(0, 0, Phaser.AUTO, 'content', null);
        this.settings = settings;
        this.state.add('GameState', GameState, false);
        this.state.start('GameState', true, false, networkHandler);
    }

    // /**
    //  * Generate random position based on grid size.
    //  */
    // getRandomGridPosition() {
    //     const randomValueInRange = this.rnd.integerInRange(0, constants.world.WIDTH - constants.GRID_SIZE),
    //         result = Math.round(randomValueInRange / constants.GRID_SIZE) * constants.GRID_SIZE;
    //
    //     return result;
    // }
}

export default Game;