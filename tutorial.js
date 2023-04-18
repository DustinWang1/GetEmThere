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
   this.createInitialObjects();     
   this.createStaticGameObjects();
   this.createAnimations();
   this.setInputs();
   this.blocks = this.add.group();
   this.addBlock();
  }

  update() {
    this.updateBlockPaths();
  }

  updateBlockPaths() {
    this.blocks.children.entries.forEach((block) => {
      block.updatePath(this.map);
    });
  }

  setInputs() {
    this.input.on("gameobjectdown", this.onObjectClicked);
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
    gameObject.onClick();
  }

  addBlock() {
    this.blocks.add(new Block(this, "Red", this.map.getObjectLayer('Objects').objects));
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
  constructor(scene, colorString, objects) {
    super(scene, 0, 0, new Phaser.Curves.Path(), 'BlockPeople', 0);
    this.ObjectLayerObjects = objects;
    this.color = colorString;
    this.scene = scene;
    this.setInitialPosition();
    this.setTextureFrame();
    scene.add.existing(this);
    this.anims.play(this.color + "Block");
  }

  setInitialPosition() {
    var startTile = this.getStartTile()
    this.x = startTile.x + this.scene.TileLength/2;
    this.y = startTile.y + this.scene.TileLength/2;
  }

  updatePath(map) {
    /*
    if block is on top of switch return

    while (next tile is path or switch) 

      push NextTileLocationToPath;
      getNextTileLocation();
      set Next Tile to get Tile at world XY
    
    push one more time to follow into circle;

    */
    if(this.switchAtWorldXY(new Phaser.Math.Vector2(this.x, this.y)) !== false) return;
    var initialTile = map.getTileAtWorldXY(this.x, this.y);
    var currentLoc = new Phaser.Math.Vector2(initialTile.x + this.scene.TileLength/2, initialTile.y+this.scene.TileLength/2);
    var path = [];
    while(this.isOnPathOrSwitch(currentLoc, map)) {
        path.push(currentLoc.x, currentLoc.y);
        currentLoc = this.getNextTileLocation(currentLoc, map);
    }
    path.push(currentLoc.x, currentLoc.y);
    console.log(path);
    this.setPath(path);
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
    if(currentLoc.x - switchObject.x > 0 && currentLoc.x - switchObject.x < this.scene.TileLength) {
      if(currentLoc.y - switchObject.y > 0 && currentLoc.y - switchObject.y < this.scene.TileLength) {
        return switchObject;
      }
    }
   }
   return false;
  }

  getNextTileLocation(currentLoc, map) {
    var switchObject = switchAtWorldXY(currentLoc);
    var frameOrType;
    if(switchObject === false) {
      var tile = map.getTileAtWorldXY(currentLoc.x, currentLoc.y); 
      var TypePropertyIndex = tile.properties.findIndex((property) => {return property.name === "Type"});
      frameOrType = tile.properties[TypePropertyIndex].value;
    } else {
      frameOrType = switchObject.switchOptions[switchObject.currentSwitchOptionsIndex];
    }
    return this.getDeltaPointFollowPath(frameOrType);
    
  }

  getDeltaPointFollowPath(tileType) {
    switch(tileType) {
      case "Start" || 0:
        return new Phaser.Math.Vector2(32, 0);
      case "Horizontal" | 1:
        return new Phaser.Math.Vector2(32, 0);
      case "Vertical" || 2:
        //TODO Check for rotated path
        return new Phaser.Math.Vector2(0, -32);
      case "TopRight" || 3:
        return new Phaser.Math.Vector2(32, 0);
      case "LeftTop" || 4:
        return new Phaser.Math.Vector2(0, -32);
      case "BottomRight" || 5:
        return new Phaser.Math.Vector2(32, 0);
      case "LeftBottom" || 6:
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

  objectIsStartTile(object) {
    var TypeProperty = object.properties.findIndex((property) => {return property.name === "Type"});
    return object.properties[TypeProperty].value === "Start";
  }
}
