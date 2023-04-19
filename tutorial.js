export default class Tutorial extends Phaser.Scene {

  TileLength = 32;
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
   this.blocks = this.add.group();
   this.blockPath = new Phaser.Curves.Path();
   this.createInitialObjects();     
   this.createStaticGameObjects();
   this.createAnimations();
   this.setInitialBlockPath();
   this.addBlock();
   this.setInputs();
  }

  update() {
  }

  updateBlockPaths() {
    //algorithm
  }

  setInputs() {
    this.input.on("gameobjectdown", this.onObjectClicked);
    this.input.on("gameobjectdown", this.updateBlockPaths);
  }

  setInitialBlockPath() {
    //TODO set to actual algorithm
    this.initialPath = new Phaser.Curves.Path().splineTo([63.75 + 16, 191.87 + 16, 100+16, 191.87+16]);
    this.initialPath.curves[0].points.shift();
  }

  createStaticGameObjects() {
    this.createGod();
    this.createTimePath();
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

  createTimePath() {
    this.map = this.make.tilemap({key: 'map'});
    this.tileset = this.map.addTilesetImage('PathTiles', 'tiles');
    this.staticPaths = this.map.createLayer('Static', this.tileset, 0, 32);
    this.switches = this.add.group();
    this.createSwitches()
  }
  
  tiledObjectIsSwitch(object) {
    var TypeProperty = object.properties.findIndex((property) => {return property.name === "Type"});
    return object.properties[TypeProperty].value === "Switch";
  }

  onObjectClicked(pointer, gameObject) {
    if(gameObject instanceof Switch) {
      gameObject.onClick();
      this.scene.events.emit('switched', this.blockPath);
    }
    
  }

  addBlock() {
    this.blocks.add(new Block(this, this.initialPath,"Red", this.map.getObjectLayer('Objects').objects));
  }

  createSwitches() {
    this.map.getObjectLayer('Objects').objects.forEach((tempSwitch) => {
      if(this.tiledObjectIsSwitch(tempSwitch)) {
        this.switches.add(new Switch(tempSwitch, this)); 
      }
    });
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
  constructor(scene, path, colorString, objects) {
    super(scene, path, 0, 0, 'BlockPeople', 0);
    this.ObjectLayerObjects = objects;
    this.color = colorString;
    this.scene = scene;
    this.setInitialPosition();
    this.setTextureFrame();
    scene.add.existing(this);
    this.anims.play(this.color + "Block");
    scene.events.on('switched', this.handleSwitch);
    this.startFollow({
      positionOnPath: true,
      duration: 5000,
    });
  }

  setInitialPosition() {
    var startTile = this.getStartTile()
    this.x = startTile.x + this.scene.TileLength/2;
    this.y = startTile.y + this.scene.TileLength/2;
    this.path.startPoint.x = startTile.x + this.scene.TileLength/2;
    this.path.startPoint.y = startTile.y + this.scene.TileLength/2;
  }

  updatePath(map) {
    console.log(this.x, this.y);
    if(this.switchAtWorldXY(new Phaser.Math.Vector2(this.x, this.y)) !== false) return;
    var initialTile = map.getTileAtWorldXY(this.x, this.y);
    var currentLoc = new Phaser.Math.Vector2(initialTile.pixelX + 16, initialTile.pixelY + 48);
    var newPath = [];
    while(this.isOnPathOrSwitch(currentLoc, map)) {
        newPath.push(new Phaser.Math.Vector2(currentLoc.x, currentLoc.y));
        currentLoc = this.getNextTileLocation(currentLoc, map);
    }
    newPath.push(new Phaser.Math.Vector2(currentLoc.x, currentLoc.y));
    var p = new Phaser.Curves.Path().splineTo(newPath)
    p.curves[0].points.shift();
    for(var i = 0; i < newPath.length; i++) {
      this.scene.add.circle(newPath[i].x, newPath[i].y, 2, '0xff0000');
    }
    this.setPath(p);
  }

  isOnPathOrSwitch(currentLoc, map) { 
    if(map.getTileAtWorldXY(currentLoc.x, currentLoc.y) === null) {
      return this.switchAtWorldXY(currentLoc) !== false;
    } else {
      return true;
    }
  }

  switchAtWorldXY(currentLoc) {
   for(var i = 0; i < this.scene.switches.children.entries.length; i++) {
    var switchObject = this.scene.switches.children.entries[i];
    if(currentLoc.x - switchObject.x > -16 && currentLoc.x - switchObject.x < 16) {
      if(currentLoc.y - switchObject.y > -16 && currentLoc.y - switchObject.y < 16) {
        return switchObject;
      }
    }
   }
   return false;
  }

  getNextTileLocation(currentLoc, map) {
    var switchObject = this.switchAtWorldXY(currentLoc);
    var frameOrType;
    if(switchObject === false) {
      var tile = map.getTileAtWorldXY(currentLoc.x, currentLoc.y); 
      frameOrType = tile.properties.Type;
    } else {
      frameOrType = switchObject.switchOptions[switchObject.currentSwitchOptionsIndex];
    }
    var delta = this.getDeltaPointFollowPath(frameOrType);
    return new Phaser.Math.Vector2(currentLoc.x + delta.x, currentLoc.y + delta.y);
  }

  getDeltaPointFollowPath(tileType) {
    switch(tileType) {
      case "Start":
      case 0:
        return new Phaser.Math.Vector2(32, 0);
      case "Horizontal":
      case 1:
        return new Phaser.Math.Vector2(32, 0);
      case "Vertical":
      case 2:
        //TODO Check for rotated path
        return new Phaser.Math.Vector2(0, -32);
      case "TopRight":
      case 3:
        return new Phaser.Math.Vector2(32, 0);
      case "LeftTop":
      case 4:
        return new Phaser.Math.Vector2(0, -32);
      case "BottomRight":
      case 5:
        return new Phaser.Math.Vector2(32, 0);
      case "LeftBottom":
      case 6:
        return new Phaser.Math.Vector2(0, 32);
    }
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

  handleSwitch(path) {
    //Decide whether or not to update path based on position in path
    console.log('event received');
  }

  updateSwitch(path) {
    //update based on path
  }

  objectIsStartTile(object) {
    var TypeProperty = object.properties.findIndex((property) => {return property.name === "Type"});
    return object.properties[TypeProperty].value === "Start";
  }
}
