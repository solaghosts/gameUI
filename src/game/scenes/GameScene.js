import { Scene } from 'phaser';
import { 
    handleCreateMap,
    handleCreateControls,
    handleConfigureCamera,
    handleConfigureGridEngine,
    handleCreateLayers,
} from '../helpers/utils';

import { 
    handleCreateHero,
    handleHeroMovement,
    handleHeroSpriteMovement,
    handleHeroActionBox,
    handleHeroNpcDialog,
    handleHeroWeaponActions,
    handleHeroAttack
} from '../helpers/player';

import { 
    handleCreateEnemiesData,
    handleAddEnemies,
    handleEnemiesMovement,
    handleEnemiesSpriteMovement,
    handleEnemiesCanSeeHero,
    handleEnemiesAttack,
    handleEnemiessmoveRandomly,
} from '../helpers/enemies';

import { 
    handleNpcsSpriteMovement,
    handleAddNpcs,
    handleCreateNpcsData,
    handleNPCsmoveRandomly,
} from '../helpers/npcs';

import { 
    handleItemsSpriteMovement,
    handleItemsActions,
    handleCreateItemsData,
    handleCreateDialogElementsData,
    handleCreateTeleportsData,
} from '../helpers/items';

import { 
    handleCreateTilesData,
    handleAnimateTiles
} from '../helpers/tiles';

export default class GameScene extends Scene {
    constructor() {
        super('GameScene');
    }

    enterKey = {};
    spaceKey = {};
    cursors = {};
    wasd = {};
    isShowingDialog = false;
    isTeleporting = false;
    isAttacking = false;

    init(data) {
        this.initData = data;
    }


    getFramesForAnimation(assetKey, animation) {
        return this.anims.generateFrameNames(assetKey)
            .filter((frame) => {
                if (frame.frame.includes(`${assetKey}_${animation}`)) {
                    const parts = frame.frame.split(`${assetKey}_${animation}_`);
                    return Boolean(!Number.isNaN(Number.parseInt(parts[1], 10)));
                }

                return false;
            })
            .sort((a, b) => (a.frame < b.frame ? -1 : 1));
    }

    createPlayerIdleAnimation(assetKey, animationName) {
        this.anims.create({
            key: `${assetKey}_${animationName}`,
            frames: [
                { key: assetKey, frame: `${assetKey}_${animationName}_01` },
                { key: assetKey, frame: `${assetKey}_${animationName}_02` },
            ],
            frameRate: 5,
            repeat: -1,
            yoyo: true,
        });
    }

    createPlayerWalkingAnimation(assetKey, animationName) {
        this.anims.create({
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
    }

    createPlayerAttackAnimation(assetKey, animationName) {
        this.anims.create({
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
    }


    create() {
        
        // Create gaming controls
        handleCreateControls(this);

        // Map
        handleCreateMap(this);


        // Hero
        handleCreateHero(this);
        
        //Animate items
        handleItemsSpriteMovement(this);

        //To extract the data from all the layers in the tilemap (e.x. items, enemies, npcs, teleports, dialogElements, etc)
        handleCreateLayers(this);


        //to extract the enemies data from the tileset
        handleCreateEnemiesData(this);
        //to extract the Npcs data from the tileset
        handleCreateNpcsData(this);
        //to extract the item data from the tileset
        handleCreateItemsData(this);
        //to extract the object with dialogs data from the tileset
        handleCreateDialogElementsData(this);
        //to extract the teleport data from the tileset
        handleCreateTeleportsData(this);
        //to extract the tiles with animation data from tileset
        handleCreateTilesData(this);
        
        // Configure the main camera
        handleConfigureCamera(this);


        handleConfigureGridEngine(this);      

        //Handle actions when hero interact with any item in the game scene added in the tilemap
        handleItemsActions(this)

        //Add the enemies addeed in the tilemap with all their stats in the game scene
        handleAddEnemies(this)
        //Add the npc addeed in the tilemap with all their stats in the game scene
        handleAddNpcs(this)
        
        this.gridEngine.create(this.map, this.gridEngineConfig);

        //Handle movement ramdom of each NPC inside the game scene
        handleNPCsmoveRandomly(this)
        //Handle movement ramdom of each enemy inside the game scene
        handleEnemiessmoveRandomly(this)

        
        //enemy attack the hero and inflict damage, TODO: HOW MANY DAMAGE INFLICT EACH MONSTER
        handleEnemiesAttack(this)
        

        //Enemies can see the hero on the game scene
        handleEnemiesCanSeeHero(this)

        // Animations
        handleHeroSpriteMovement(this)
        handleEnemiesSpriteMovement(this)
        handleNpcsSpriteMovement(this)

        //generate a box in front of the hero player that move in any direction
        handleHeroActionBox(this);
        //Display a dialog box each time hero interact with a NPC
        handleHeroNpcDialog(this);

        //Handle all actions with the weapons like cut trees or move boxes
        handleHeroWeaponActions(this);

        //Handle when hero attack the enemy
        handleHeroAttack(this);

    }


    update(time, delta) {

        //To animate tiles in the game scene
        handleAnimateTiles(this, delta)
        //Move the hero and also get the attack function
        handleHeroMovement(this)
        //If enemy can see the hero, they will follow him
        handleEnemiesMovement(this)
    }
}
