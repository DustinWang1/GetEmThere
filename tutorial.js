

export default class Tutorial extends Phaser.Scene {

  constructor() {
    super({key: 'Tutorial'});
  }
  
  preload() {
    this.load.image('background', './Assets/BG.png');
    this.load.audio('BGM', 'Assets/BGM.mp3');
    this.load.image('god', 'Assets/God eye.png');
    this.load.image('pupil', 'Assets/God pupil.png')
    this.load.image('popup', 'Assets/PopupBG.png');

  }

  create() {
   this.createInitialObjects();     
   this.createStaticGameObjects();
  }

  update() {
    
  }

  createStaticGameObjects() {
    this.createGod();
    this.createPath();
  }

  createInitialObjects() {
    this.createBackground();
    this.createBGM();
  }

  createBackground() {
    this.add.image(this.game.canvas.width/2, this.game.canvas.height/2,'background'); 
  }

  createBGM() {
    this.music = this.sound.add('BGM', {loop: true, volume: .7});
    this.music.play();
  }

  createGod() {
    this.god = new God(this.game.canvas.width/2, this.game.canvas.height/6, this);
  }

  createPath() {
  }
  
}

class God {
  pupilRadiusinPixels = 5;
  constructor(x, y, scene) {
    this.scene = scene;
    this.eye = scene.add.image(x, y, 'god'); 
    this.pupil = scene.add.image(x, y, 'pupil');
    scene.events.on('update', this.update, this);
  }

  update() {
    if(this.mouseIsOverCanvas()) {
      this.pointPupilToCursor();
    }
  }

  pointPupilToCursor() {
    var point = this.calculateDeltaPoint(this.getAngleBetweenMouseAndEye(), this.pupilRadiusinPixels);
    this.pupil.x = this.eye.x + point.x;
    this.pupil.y = this.eye.y + point.y;
  }

  mouseIsOverCanvas() {
    return this.scene.game.input.isOver;
  }

  getAngleBetweenMouseAndEye() {
    var mouseX = this.scene.input.mousePointer.x;
    var mouseY = this.scene.input.mousePointer.y;
    var mousePoint = new Phaser.Math.Vector2(mouseX, mouseY);
    var eyePoint = new Phaser.Math.Vector2(this.eye.x, this.eye.y);
    return Phaser.Math.Angle.BetweenPoints(eyePoint, mousePoint)
  }

  calculateDeltaPoint(angle, radius) {
    return new Phaser.Math.Vector2(radius*Math.cos(angle), radius*Math.sin(angle));
  }
}
