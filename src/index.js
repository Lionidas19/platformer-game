
import Phaser, { Scene } from "phaser";

import PlayScene from './scenes/Play';
import PreloadScene from './scenes/Preload';
import MenuScene from "./scenes/Menu";
import LevelsScene from "./scenes/Levels";
import CreditsScene from "./scenes/Credits";

const MAP_WIDTH = 1600;

const WIDTH = document.body.offsetWidth;
const HEIGHT = 600;
const ZOOM_FACTOR = 1.5;

const SHARED_CONFIG = {
  mapOffset: MAP_WIDTH > WIDTH ? MAP_WIDTH - WIDTH : 60,
  width: WIDTH,
  height: HEIGHT, 
  zoomFactor: ZOOM_FACTOR,
  degub: true,
  leftTopCorner: {
    x: (WIDTH - (WIDTH / ZOOM_FACTOR)) / 2,
    y: (HEIGHT - (HEIGHT / ZOOM_FACTOR)) / 2
  },
  rightTopCorner: {
    x: (WIDTH / ZOOM_FACTOR) + ((WIDTH - (WIDTH / ZOOM_FACTOR)) / 2),
    y: (HEIGHT - (HEIGHT / ZOOM_FACTOR)) / 2
  },
  rightBottomCorner: {
    x: (WIDTH / ZOOM_FACTOR) + ((WIDTH - (WIDTH / ZOOM_FACTOR)) / 2),
    y: (HEIGHT / ZOOM_FACTOR) + ((HEIGHT - (HEIGHT / ZOOM_FACTOR)) / 2)
  },
  lastLevel: 2
}

const Scenes = [PreloadScene, MenuScene, LevelsScene, PlayScene, CreditsScene];
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
