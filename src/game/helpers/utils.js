import { GameObjects, Input } from 'phaser';


export const handleConfigureCamera = (scene) => {
    //Cameras follow the player
    scene.cameras.main.startFollow(scene.playerSprite, true);
    //with canvas scale to 1.0
    //scene.cameras.main.setFollowOffset(-16,-18);
    //With canvas scale to 1.3
    scene.cameras.main.setFollowOffset(35,10);
    //with canvas scale to 0
    //scene.cameras.main.setFollowOffset(-16,-16);
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
  
};

//For some reason is neccesary separate the create grid engine from the config grid engine. 
export const handleGridEngine = (scene) => {
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


