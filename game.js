import Tutorial from "./tutorial.js";
import Level1 from "./level1.js";
var config = {
  width: 448,
  height: 320,
  type: Phaser.AUTO,
  autoCenter: true,
  zoom: 2.5,
  pixelArt: true,
  scene: [Tutorial, Level1]
};

export var game = new Phaser.Game(config);