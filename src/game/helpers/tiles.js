import { Math as PhaserMath } from 'phaser';
import {
    ATTACK_DELAY_TIME,
    BOX_INDEX,
    BUSH_INDEX,
    SCENE_FADE_TIME,
} from '../components/constants';

//to animate tiles in the gameScene.
export const handleCreateTilesData = (scene) => {

    //TODO This is only reading the animations on the first tileset!!!!

    scene.animatedTiles = [];
    //To get all the tiles with animation in the first tileset ONLY!
    const tileData = scene.map.tilesets[0].tileData
    //For each individual tile with animation in the tilemap
    for (let tileid in tileData) {
        //check if any of them is on the actual game scene
        //first check in any of the layers
        scene.map.layers.forEach(layer  => {
            layer.data.forEach(tileRow => {
                tileRow.forEach(tile => {
                    if (tile.index - scene.map.tilesets[0].firstgid === parseInt(tileid)) {
                        scene.animatedTiles.push({
                            tile,
                            tileAnimationData: tileData[tileid].animation,
                            firstgid:scene.map.tilesets[0].firstgid,
                            elapsedTime:0,
                         });
                     }
                })
            })
        })
    }
};

export const handleAnimateTiles = (scene, delta) => {
    scene.animatedTiles.forEach(tile => {
        
        //TO DO: CHECK FIRST IF THERE ARE ANIMATED TILES IN THE SCENE AND IF NOT, RETURN
        if (!tile.tileAnimationData) return;
        let animationDuration = tile.tileAnimationData[0].duration * tile.tileAnimationData.length
        tile.elapsedTime += delta;
        tile.elapsedTime %= animationDuration
        const animatonFrameIndex = Math.floor(tile.elapsedTime / tile.tileAnimationData[0].duration);
        tile.tile.index = tile.tileAnimationData[animatonFrameIndex].tileid + tile.firstgid 
    });
    
};



//To generate the actions with the weapon like cut grass or move blocks
export const handleUpdate = (scene) => {
    
 
    //Create a collision action when user presence collider box collides with current tilemaplayers
    scene.physics.add.overlap(scene.heroPresenceCollider, scene.elementsLayers, (objA, objB) => {
        const tile = [objA, objB].find((obj) => obj !== scene.heroPresenceCollider);
        
        // Handles attack
        if (tile.index === 784 ) {
            scene.animatedTiles.forEach((animatedTile) => {
                let tileAnimationIndexs = animatedTile.tileData.map(a => a.tileid);
                for (let i = 0; i < tileAnimationIndexs.length; i++){

                    //animatedTile.tile.index=tileAnimationIndexs[i];
                }
            })
            //Object.values(scene.animatedTiles)[1].index= ++demo 
            //tile.index=428 

        }

                
        
    });

}
