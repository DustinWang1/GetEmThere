export default class level1 extends Phaser.Scene {

  constructor() {
    super({key: 'level1'});
  }
  
  preload() {
    this.load.image('background', './Assets/BG.png');
    this.load.audio('BGM', 'Assets/BGM.mp3');
    this.load.image('god', 'Assets/God eye.png');
    this.load.image('pupil', 'Assets/God pupil.png')
    this.load.image('popup', 'Assets/PopupBG.png');

  }

  create() {
    bg = this.add.image(game.canvas.width/2, game.canvas.height/2, 'background');
    music = this.sound.add('BGM', {loop: true, volume: .7});
    music.play();
  }

  update() {

  }
  
}