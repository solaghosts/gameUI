import { GameObjects, Input } from 'phaser';

//To load any map in any game scene
export const handleCreateMap = (scene) => {
    //Receive the data from the previous scene in scene scene
    const { mapKey } = scene.initData;
    const map = scene.make.tilemap({ key: mapKey });
    //create the representation image of each tileset json for that tilemap in the canvas
    var maptilesets = [];
    for (let i = 0; i < map.tilesets.length; i++){
        const mapTileset = map.addTilesetImage(map.tilesets[i].name);
        maptilesets.push(mapTileset)
    }

    // eslint-disable-next-line no-param-reassign
    scene.map = map;

};

export const handleCreateLayers = (scene) => {
    
    scene.elementsLayers = scene.add.group();
    for (let i = 0; i < scene.map.layers.length; i++) {
        //scene.layer = scene.map.createLayer(i, 'tileset', 0, 0);
        
        //Changed it because you need to create a layer for each tileset that you want to set in the game
        scene.layer = scene.map.createLayer(scene.map.layers[i].name, scene.map.tilesets, 0, 0);
        scene.layer.layer.properties.forEach((property) => {
            const { value, name } = property;
            if (name === 'type' && value === 'elements') {
                scene.elementsLayers.add(scene.layer);
            }
        });
    }

};

export const handleConfigureCamera = (scene) => {
    //Cameras follow the player
    scene.cameras.main.startFollow(scene.playerSprite, true);
    //with canvas scale to 1.0
    //scene.cameras.main.setFollowOffset(-16,-18);
    //With canvas scale to 1.3
    scene.cameras.main.setFollowOffset(35,10);
  };
  
export const handleConfigureGridEngine = (scene) => {
  
  const { position: initialPosition} = scene.initData.heroStatus;
  //create the animation of the walking with the spritesheet
  scene.gridEngineConfig = {
    characters: [
        {
            id: 'hero',
            sprite: scene.playerSprite,
            startPosition: initialPosition,
            //offsetY: 4,
        },
    ],
    numberOfDirections: 8,
  };
  
  //Add the grid engine config for the character movement in the tilemap inside the canvas
  scene.gridEngine.create(scene.map, scene.gridEngineConfig);
  
};

//to create the controls to handle the movement 
export const handleCreateControls = (scene) => {

    //Keyboards and clicks events
    scene.enterKey = scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.ENTER);
    scene.spaceKey = scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE);
    scene.qKey = scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.Q);
    scene.eKey = scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.E);
    scene.cursors = scene.input.keyboard.createCursorKeys();
    scene.wasd = scene.input.keyboard.addKeys({
        up: Input.Keyboard.KeyCodes.W,
        down: Input.Keyboard.KeyCodes.S,
        left: Input.Keyboard.KeyCodes.A,
        right: Input.Keyboard.KeyCodes.D,
    });
};




export const createInteractiveGameObject = (
    scene,
    x,
    y,
    width,
    height,
    name,
    isDebug = false,
    origin = { x: 0, y: 1 }
) => {
    const customCollider = new GameObjects.Rectangle(
        scene,
        x,
        y,
        width,
        height
    ).setOrigin(origin.x, origin.y);
    customCollider.name = name;
    customCollider.isCustomCollider = true;

    if (isDebug) {
        customCollider.setFillStyle(0x741B47);
    }

    scene.physics.add.existing(customCollider);
    customCollider.body.setAllowGravity(false);
    customCollider.body.setImmovable(true);

    return customCollider;
};

export const calculateGameSize = () => {
    let width = 400;
    let height = 224; // 16 * 14 = 224
    const multiplier = Math.min(Math.floor(window.innerWidth / 400), Math.floor(window.innerHeight / 224)) || 1;

    if (multiplier > 1) {
        width += Math.floor((window.innerWidth - width * multiplier) / (16 * multiplier)) * 16;
        height += Math.floor((window.innerHeight - height * multiplier) / (16 * multiplier)) * 16;
    }

    return { width, height, multiplier };
};


