
//Extract the data from the tileset and put then in the game in movement
export const getFramesForAnimation = (scene, assetKey, animation) => {
    return scene.anims.generateFrameNames(assetKey)
    .filter((frame) => {
        if (frame.frame.includes(`${assetKey}_${animation}`)) {
            const parts = frame.frame.split(`${assetKey}_${animation}_`);
            return Boolean(!Number.isNaN(Number.parseInt(parts[1], 10)));
        }

        return false;
    })
    .sort((a, b) => (a.frame < b.frame ? -1 : 1));
};


//Extract the json/img spritesheet of the character in the boot scene then and create a loop to show it in movement when is in idle position
export const createPlayerIdleAnimation = (scene, assetKey, animationName) => {
    scene.anims.create({
        key: `${assetKey}_${animationName}`,
        frames: [
            { key: assetKey, frame: `${assetKey}_${animationName}_01` },
            { key: assetKey, frame: `${assetKey}_${animationName}_02` },
        ],
        frameRate: 5,
        repeat: -1,
        yoyo: true,
    });
};

//Extract the json/img spritesheet of the character in the boot scene then and create a loop to show it in movement when is moving in certain direction
export const createPlayerWalkingAnimation = (scene, assetKey, animationName) => {
    scene.anims.create({
        key: `${assetKey}_${animationName}`,
        frames: [
            { key: assetKey, frame: `${assetKey}_${animationName}_01` },
            { key: assetKey, frame: `${assetKey}_${animationName.replace('walking', 'idle')}_01` },
            { key: assetKey, frame: `${assetKey}_${animationName}_02` },
        ],
        frameRate: 7,
        repeat: -1,
        yoyo: true,
    });
};

//Extract the json/img spritesheet of the character in the boot scene then and create a loop to show it in movement when is attacking
export const createPlayerAttackAnimation = (scene, assetKey, animationName) => {
    scene.anims.create({
        key: `${assetKey}_${animationName}`,
        frames: [
            { key: assetKey, frame: `${assetKey}_${animationName}_01` },
            { key: assetKey, frame: `${assetKey}_${animationName}_02` },
            { key: assetKey, frame: `${assetKey}_${animationName}_03` },

            { key: assetKey, frame: `${assetKey}_${animationName.replace('attack', 'idle')}_01` },
        ],
        frameRate: 16,
        repeat: 0,
        yoyo: false,
    });
};

