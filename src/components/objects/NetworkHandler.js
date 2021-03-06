import io from "socket.io-client";
import EventEmitter from "eventemitter3";

import utils from "src/components/utils/utils";

import PlayerModel from "src/components/models/PlayerModel";
import FruitModel from "src/components/models/FruitModel";
import CourseModel from "src/components/models/CourseModel";

const YOU_CONNECTED = "you-connected";

class NetworkHandler extends EventEmitter {
  /**
   * NetworkHandler constructor
   */
  constructor() {
    super();

    this._socket = null;
    this._messages = null;

    this._players = [];
    this._fruits = [];
    this._walls = [];
  }

  get id() {
    return this._socket.id;
  }

  _onConnected(payload) {
    console.log("YOU_CONNECTED");

    this._messages = payload.settings.messages;

    this._socket.on(
      this._messages.ROOM_STATE,
      this._onRoomStateReceived.bind(this)
    );
    // this._socket.on(this._messages.GAME_ROUND_INITIATED, this._onGameRoundInitiated.bind(this));
    this._socket.on(
      this._messages.GAME_ROUND_COUNTDOWN,
      this._onGameRoundCountdown.bind(this)
    );
    this._socket.on(
      this._messages.GAME_STATE,
      this._onGameStateReceived.bind(this)
    );
    this._socket.on(
      this._messages.FRUIT_COLLECTED,
      this._onFruitCollected.bind(this)
    );
    this._socket.on(
      this._messages.PLAYER_DIED,
      this._onPlayerDied.bind(this)
    );
    this._socket.on(
      this._messages.PLAYER_REDUCTION,
      this._onPlayerReduction.bind(this)
    );

    this.emit(NetworkHandler.events.CONNECTED, payload);
  }

  _createPlayers(players) {
    this._players = [];

    for (const player of players) {
      this._players.push(new PlayerModel(player));
    }
  }

  _createCourse(course) {
    this._course = new CourseModel(course);
  }

  _onRoomStateReceived(payload) {
    console.log("ROOM_STATE!");

    this._createPlayers(payload.players);
    this._createCourse(payload.course);

    this.emit(NetworkHandler.events.ROOM_STATE, {
      players: this._players,
      course: this._course,
    });
  }

  _onFruitCollected() {
    console.log('FRUIT_COLLECTED')
    this.emit(NetworkHandler.events.FRUIT_COLLECTED);
  }

  _onPlayerDied() {
    console.log('PLAYER_DIED')
    this.emit(NetworkHandler.events.PLAYER_DIED);
  }
  
  _onPlayerReduction() {
    console.log('PLAYER_REDUCTION')
    this.emit(NetworkHandler.events.PLAYER_REDUCTION);
  }

  // _onGameRoundInitiated(payload) {
  //     console.log('GAME_ROUND_INITIATED!');

  //     this._createPlayers(payload.players);
  //     this._createCourse(payload.course);

  //     this.emit(NetworkHandler.events.GAME_ROUND_INITIATED, {
  //         players: this._players,
  //         course: this._course,
  //     });
  // }

  _onGameRoundCountdown(payload) {
    this.emit(NetworkHandler.events.GAME_ROUND_COUNTDOWN, payload);
  }

  _onGameStateReceived(payload) {
    console.log("GAME STATE!");

    const fruits = payload.fruits;

    this._createPlayers(payload.players);

    this._fruits = [];

    for (const fruit of fruits) {
      this._fruits.push(new FruitModel(fruit));
    }

    this.emit(NetworkHandler.events.GAME_STATE, {
      players: this._players,
      fruits: this._fruits,
    });
  }

  connect() {
    if (utils.SERVER_HOST) {
      this._socket = io(utils.SERVER_HOST);
    } else {
      this._socket = io();
    }

    this._socket.on(YOU_CONNECTED, this._onConnected.bind(this));
  }

  sendPlayerAction(input) {
    this._socket.emit(this._messages.PLAYER_ACTION, input);
  }

  emitClientLoaded() {
    this._socket.emit(this._messages.CLIENT_LOADED);
  }
}

NetworkHandler.events = {
  CONNECTED: "on-connected",
  ROOM_STATE: "on-room-state",
  GAME_ROUND_INITIATED: "on-game-round-initiated",
  GAME_ROUND_COUNTDOWN: "on-game-round-countdown",
  GAME_STATE: "on-game-state",
  FRUIT_COLLECTED: "on-fruit-collected",
  PLAYER_DIED: "player-died",
};

export default NetworkHandler;
