

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
    this.load.image('tiles', 'Assets/PathTiles.png');
    this.load.spritesheet('tilesheet', 'Assets/PathTiles.png',{frameWidth: 32, frameHeight: 32});
    this.load.tilemapTiledJSON('map', 'Assets/TutorialMap.tmj');
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
    this.map = this.make.tilemap({key: 'map'});
    this.tileset = this.map.addTilesetImage('PathTiles', 'tiles');
    this.staticPaths = this.map.createLayer('Static', this.tileset, 0, 32);
    this.switches = this.add.group();
    this.map.getObjectLayer('Switch').objects.forEach((tempSwitch) => {
      if(this.tiledObjectIsSwitch(tempSwitch)) {
        this.switches.add(new Switch(tempSwitch, this)); 
      }
    });
    
  }
  
  tiledObjectIsSwitch(object) {
    var TypeProperty = object.properties.findIndex((property) => {return property.name === "Type"});
    return object.properties[TypeProperty].value === "Switch";
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

class Switch extends Phaser.GameObjects.Sprite {
  constructor(TiledObject, scene) {
    super(scene, TiledObject.x + (16), TiledObject.y + (16), 'tilesheet', 1);
    this.object = TiledObject;
    this.setInitialOrientation(TiledObject);
    scene.add.existing(this);
  }

  setInitialOrientation() {
    this.setFrame(this.getInitialFrameFromTiledObject());
  }

  getInitialFrameFromTiledObject() {
    var index = this.object.properties.findIndex((property) => {return property.name === "initialFrame"});
    return this.object.properties[index].value;
  }
}
