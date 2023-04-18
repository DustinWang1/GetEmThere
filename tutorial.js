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
    this.load.spritesheet('BlockPeople', 'Assets/BlockPeople.png', {frameWidth: 32, frameHeight: 32});
    this.load.tilemapTiledJSON('map', 'Assets/TutorialMap.tmj');
  }

  create() {
   this.createInitialObjects();     
   this.createStaticGameObjects();
   this.createAnimations();
   this.setInputs();
   this.testBlock();
  }

  update() {
    
  }

  setInputs() {
    this.input.on("gameobjectdown", this.onObjectClicked);
  }

  createStaticGameObjects() {
    this.createGod();
    this.createPath();
  }

  createInitialObjects() {
    this.createBackground();
    this.createBGM();
  }

  createAnimations() {
    this.anims.create({
      key: 'RedBlock',
      frameRate: 1,
      frames: this.anims.generateFrameNumbers('BlockPeople', {start:0, end:2}),
      repeat: -1
    });

    this.anims.create({
      key: 'BlueBlock',
      frameRate: 1,
      frames: this.anims.generateFrameNumbers('BlockPeople', {start:3, end:5}),
      repeat: -1
    });

    this.anims.create({
      key: 'GreenBlock',
      frameRate: 1,
      frames: this.anims.generateFrameNumbers('BlockPeople', {start:6, end:8}),
      repeat: -1
    });

    this.anims.create({
      key: 'YellowBlock',
      frameRate: 1,
      frames: this.anims.generateFrameNumbers('BlockPeople', {start:9, end:11}),
      repeat: -1
    });
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

  onObjectClicked(pointer, gameObject) {
    gameObject.onClick();
  }

  testBlock() {
    //TODO add objectlayer("Objects").objects as parameter to call
    //this.block = new Block(this, "Red", );
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
    this.setInitialOrientation();
    this.setSwitchOptions();
    this.setInteractive();
    scene.add.existing(this);
  }

  setInitialOrientation() {
    this.setFrame(this.getInitialFrameFromTiledObject());
  }

  getInitialFrameFromTiledObject() {
    var index = this.object.properties.findIndex((property) => {return property.name === "initialFrame"});
    this.currentSwitchOptionsIndex = 0;
    return this.object.properties[index].value;
  }

  onClick() {
    if(this.currentSwitchOptionsIndex === this.switchOptions.length - 1) {
      this.currentSwitchOptionsIndex = 0;
      this.setFrame(this.switchOptions[this.currentSwitchOptionsIndex]);
    } else {
      this.currentSwitchOptionsIndex += 1;
      this.setFrame(this.switchOptions[this.currentSwitchOptionsIndex]);
    }
  }
  
  setSwitchOptions() {
    this.switchOptions = [4, 1];
  }
}

class Block extends Phaser.GameObjects.PathFollower {
  followSpeed = 5000;
  //TODO Change the start and end tiles to objects so that we can access them easily
  //TODO set the object layer name to just Objects for clarity. Adjust scene.createPath() accordingly.
  constructor(scene, colorString, objects) {
    super(scene, 0, 0, new Phaser.Curves.Path(), 'BlockPeople', 0);
    this.ObjectLayerObjects = objects;
    this.color = colorString;
    this.scene = scene;
    this.setInitialPosition();
    this.setPath();
    this.anims.play(this.color+'block');
    this.setTextureFrame();
  }

  setInitialPosition() {
    var startTile = this.getStartTile()
    this.x = startTile.x;
    this.y = startTile.y;
  }

  setFollowedPath(path) {
    //TODO set duration to length of the path divided by follow speed
    this.setPath(path, {duration: followSpeed});
  }

  setTextureFrame() {
    switch(this.color) {
      case "Red":
        this.setFrame(0);
        break;
      case "Blue":
        this.setFrame(3);
        break;
      case "Green":
        this.setFrame(6);
        break;
      case "Yellow":
        this.setFrame(9);
        break;
    }
  }

  getStartTile() {
    for(var i = 0; i < this.ObjectLayerObjects.length; i++) {
      if(this.objectIsStartTile(this.ObjectLayerObjects[i])) {
        return this.ObjectLayerObjects[i];
      }
    }
  }

  objectIsStartTile(object) {
    var TypeProperty = object.properties.findIndex((property) => {return property.name === "Type"});
    return object.properties[TypeProperty].value === "Start";
  }
}
