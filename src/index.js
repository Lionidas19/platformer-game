
import Phaser, { Scene } from "phaser";

import PlayScene from './scenes/Play';
import PreloadScene from './scenes/Preload';

const MAP_WIDTH = 1600;

const WIDTH = document.body.offsetWidth;
const HEIGHT = 600;

const SHARED_CONFIG = {
  mapOffset: MAP_WIDTH > WIDTH ? MAP_WIDTH - WIDTH : 60,
  width: WIDTH,
  height: HEIGHT, 
  zoomFactor: 1.5,
  degub: false
}

const Scenes = [PreloadScene , PlayScene];
const createScene = Scene => new Scene(SHARED_CONFIG)
const initScenes = () => Scenes.map(createScene)

const config = {
  type: Phaser.AUTO,
  pixaelArt: true,
  ...SHARED_CONFIG,
  physics: {
    default: 'arcade',
    arcade: {
      debug: SHARED_CONFIG.degub
      //gravity: { y: 400 }
    }
  },
  scene: initScenes()
};

new Phaser.Game(config);
