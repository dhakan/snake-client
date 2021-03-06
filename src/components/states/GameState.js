import Phaser from 'phaser';

import Player from '../objects/Player';
import Fruit from '../objects/Fruit';
import Wall from '../objects/Wall';

import NetworkHandler from 'src/components/objects/NetworkHandler';

class GameState extends Phaser.State {

    _createStageBorder(color) {
        const canvas = document.querySelector('canvas');
        canvas.style.border = `10px solid ${color}`;
    }

    _setCountdownValue(value) {
        const countdown = document.querySelector('.countdown');
        countdown.innerHTML = value;
    }

    _renderPlayers(players) {
        for (const player of this._players) {
            player.destroy();
        }

        this._players = [];

        for (const playerModel of players) {
            const player = new Player(playerModel, this.game);

            this._players.push(player);

            if (playerModel.id === this._networkHandler.id) {
                this._createStageBorder(playerModel.color);
            }
        }
    }

    _renderCourse() {
        this.game.stage.setBackgroundColor(this._course.settings.backgroundColor);
        this.game.scale.setGameSize(
            this._course.settings.world.width,
            this._course.settings.world.height
        );

        for (const wall of this._walls) {
            wall.kill();
        }

        this._walls = [];

        for (const wallModel of this._course.walls) {
            const wall = new Wall(this.game, wallModel.x, wallModel.y);

            this._walls.push(wall);
        }
    }

    _killFruits() {
        for (const fruit of this._fruits) {
            fruit.kill();
        }

        this._fruits = [];
    }

    init(networkHandler) {
        this._networkHandler = networkHandler;
        this._currentDirection = null;
        this._players = [];
        this._fruits = [];
        this._course = null;
        this._walls = [];
        this._keys = {};
    }

    /**
     * NOTE: Called by the Phaser engine
     * Preloads the game
     */
    preload() {
        this.game.load.image('fruit', 'images/fruit.png');
        this.game.load.image('snake', 'images/snake.png');
        this.game.load.image('banana', 'images/banana.png');
        this.game.load.image('red', 'images/red.png');
        this.game.load.image('wall', 'images/wall.gif');

        this.game.load.audio('stage', ['audio/stage.mp3']);
        this.game.load.audio('fruit_collected', ['audio/fruit_collected.mp3']);
        this.game.load.audio('death', ['audio/death.mp3']);
        this.game.load.audio('reduction', ['audio/reduction.mp3']);
    }

    /**
     * NOTE: Called by the Phaser engine
     * Creates the game
     */
    create() {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.stage.setBackgroundColor(this.game.settings.BACKGROUND_COLOR);
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

        this._networkHandler.emitClientLoaded();

        // this._networkHandler.on(NetworkHandler.events.CONNECTED, () => {
        //     console.log('you connected')
        //     this._networkHandler.emitClientLoaded();
        // });

        this._networkHandler.on(NetworkHandler.events.ROOM_STATE, payload => {
            console.log('Game round initiated', payload)
            this._currentDirection = null;
            this._oldDirection = null;
            this._course = payload.course;
    
            this._killFruits();
            this._renderPlayers(payload.players);
            this._renderCourse();
        });

        // this._networkHandler.on(NetworkHandler.events.GAME_ROUND_INITIATED, payload => {
        // });

        // this._networkHandler.on(NetworkHandler.events.GAME_ROUND_COUNTDOWN, countdownValue => {
        //     this._setCountdownValue(countdownValue);
        // });

        this._networkHandler.on(NetworkHandler.events.GAME_STATE, gameState => {
            this._killFruits();

            for (const fruitModel of gameState.fruits) {
                this._spawnFruit(fruitModel);
            }

            this._renderPlayers(gameState.players);
        });

        const fruitCollectedSfx = this.game.add.audio('fruit_collected');
        const deathSfx = this.game.add.audio('death');
        const reductionSfx = this.game.add.audio('reduction');
        
        this._networkHandler.on(NetworkHandler.events.FRUIT_COLLECTED, () => {
            fruitCollectedSfx.play()
        })
        
        this._networkHandler.on(NetworkHandler.events.PLAYER_DIED, () => {
            deathSfx.play()
        })
        
        this._networkHandler.on(NetworkHandler.events.PLAYER_REDUCTION, () => {
            reductionSfx.play()
        })
        
        const music = this.game.add.audio('stage');
        music.loopFull();

        this._addKeyListeners();
    }

    /**
     * Spawns a fruit on a random grid position.
     */
    _spawnFruit(fruitModel) {
        const fruit = new Fruit(this.game, fruitModel.x, fruitModel.y, fruitModel.value);

        this._fruits.push(fruit);
    }

    _detectCollisions() {
        for (let fruit of this._fruits) {
            this.game.physics.arcade.collide(this._player, fruit);
        }
    }

    /**
     * NOTE: Called by the Phaser engine
     * Updates the game
     */
    update() {
    }

    /**
     * NOTE: Called by the Phaser engine
     * Renders the game
     */
    render() {
    }

    _onPlayerAction(event) {
        switch (event.keyCode) {
            case this._keys.KEY_UP.keyCode:
                this._currentDirection = this.game.settings.playerActions.UP;
                break;
            case this._keys.KEY_DOWN.keyCode:
                this._currentDirection = this.game.settings.playerActions.DOWN;
                break;
            case this._keys.KEY_LEFT.keyCode:
                this._currentDirection = this.game.settings.playerActions.LEFT;
                break;
            case this._keys.KEY_RIGHT.keyCode:
                this._currentDirection = this.game.settings.playerActions.RIGHT;
                break;
            case this._keys.KEY_SPACEBAR.keyCode:
                this._networkHandler.sendPlayerAction(this.game.settings.playerActions.INVERSE);
                break;
        }

        if (this._currentDirection) {
            this._networkHandler.sendPlayerAction(this._currentDirection);
            this._currentDirection = null;
        }
    }

    _addKeyListeners() {
        this._keys = {
            KEY_SPACEBAR: this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
            KEY_UP: this.game.input.keyboard.addKey(Phaser.Keyboard.UP),
            KEY_DOWN: this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN),
            KEY_LEFT: this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
            KEY_RIGHT: this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
        };

        const keys = [
            this._keys.KEY_SPACEBAR,
            this._keys.KEY_UP,
            this._keys.KEY_DOWN,
            this._keys.KEY_LEFT,
            this._keys.KEY_RIGHT
        ];

        keys.forEach(key => key.onDown.add(this._onPlayerAction.bind(this)));
    }
}

export default GameState;
