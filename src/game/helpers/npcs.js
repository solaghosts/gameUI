
import {
    NPC_MOVEMENT_RANDOM,
} from '../components/constants';

import { 
    createPlayerWalkingAnimation,
} from '../helpers/animations';

//to extract the enemies data from the tileset
export const handleCreateNpcsData = (scene) => {

    scene.npcsKeys = [];
    scene.dataLayer = scene.map.getObjectLayer('actions');
        scene.dataLayer.objects.forEach((data) => {
            const { properties, x, y } = data;

            properties.forEach((property) => {
                const { name, value } = property;

                if(name === "npcData"){
                    const {
                        facingDirection,
                        movementType,
                        npcKey,
                        delay,
                        area,
                    } = extractNpcDataFromTiled(value);

                    scene.npcsKeys.push({
                        facingDirection,
                        movementType,
                        npcKey,
                        delay,
                        area,
                        x,
                        y,
                    });
                }
            });
        });


};
  
//To add the NPCs to the game scene with all their stats added in the tileset
export const handleAddNpcs = (scene) => {
    
    scene.npcSprites = scene.add.group();
    scene.npcsKeys.forEach((npcData) => {
        const { npcKey, x, y, facingDirection = 'down' } = npcData;
        const npc = scene.physics.add.sprite(0, 0, npcKey, `${npcKey}_idle_${facingDirection}_01`);
        npc.body.setSize(14, 14);
        //npc.body.setOffset(9, 13);
        scene.npcSprites.add(npc);

        // Create the sprite movement animation using the spritesheet aka the png files
        createPlayerWalkingAnimation(scene, npcKey, 'walking_up');
        createPlayerWalkingAnimation(scene, npcKey, 'walking_right');
        createPlayerWalkingAnimation(scene, npcKey, 'walking_down');
        createPlayerWalkingAnimation(scene, npcKey, 'walking_left');
        //diagonal movement
        createPlayerWalkingAnimation(scene, npcKey, 'walking_up-left');
        createPlayerWalkingAnimation(scene, npcKey, 'walking_up-right');
        createPlayerWalkingAnimation(scene, npcKey, 'walking_down-left');
        createPlayerWalkingAnimation(scene, npcKey, 'walking_down-right');

        scene.gridEngineConfig.characters.push({
            id: npcKey,
            sprite: npc,
            startPosition: { x: x / 16, y: (y / 16) - 1 },
            speed: 1,
            offsetY: 4,
        });
        
    });

}

//Handle movement ramdom to each NPC inside the game scene
export const handleNPCsmoveRandomly = (scene) => {
    
    scene.npcsKeys.forEach((npcData) => {
        const {
            movementType,
            npcKey,
            delay,
            area,
        } = npcData;

        if (movementType === NPC_MOVEMENT_RANDOM) {
            scene.gridEngine.moveRandomly(npcKey, delay, area);
        }
    });

}

//to handle hero sprite animations
export const handleNpcsSpriteMovement = (scene) => {

    scene.gridEngine.movementStarted().subscribe(({ charId, direction }) => {
        const npc = scene.npcSprites.getChildren().find((npcSprite) => npcSprite.texture.key === charId);
        if (npc) {
            npc.anims.play(`${charId}_walking_${direction}`);
            return;
        }
    });

    scene.gridEngine.movementStopped().subscribe(({ charId, direction }) => {
        const npc = scene.npcSprites.getChildren().find((npcSprite) => npcSprite.texture.key === charId);
        if (npc) {
            npc.anims.stop();
            npc.setFrame(getStopFrame(direction, charId));
            return;
        }
    });
    
    scene.gridEngine.directionChanged().subscribe(({ charId, direction }) => {
        const npc = scene.npcSprites.getChildren().find((npcSprite) => npcSprite.texture.key === charId);
        if (npc) {
            npc.setFrame(getStopFrame(direction, charId));
            return;
        }
    });
    
};

export const extractNpcDataFromTiled = (data) => {
    const [npcKey, config] = data.trim().split(':');
    const [movementType, delay, area, direction] = config.split(';');

    return {
        npcKey,
        movementType,
        facingDirection: direction,
        delay: Number.parseInt(delay, 10),
        area: Number.parseInt(area, 10),
    };
}


export const getStopFrame = (direction, spriteKey) => {

    switch (direction) {
        case 'up-left':
            return `${spriteKey}_idle_left_01`;
        case 'up-right':
            return `${spriteKey}_idle_right_01`;
        case 'down-left':
            return `${spriteKey}_idle_left_01`;
        case 'down-right':
            return `${spriteKey}_idle_right_01`;
        case 'up':
            return `${spriteKey}_idle_up_01`;
        case 'right':
            return `${spriteKey}_idle_right_01`;
        case 'down':
            return `${spriteKey}_idle_down_01`;
        case 'left':
            return `${spriteKey}_idle_left_01`;
        default:
            return null;
    }
}