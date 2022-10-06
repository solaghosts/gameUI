import { Input, Math as PhaserMath } from 'phaser';
import { createInteractiveGameObject } from './utils';
import {
    ATTACK_DELAY_TIME,
    BOX_INDEX,
    BUSH_INDEX,
    SCENE_FADE_TIME,
} from '../components/constants';

import { 
    createPlayerIdleAnimation,
    createPlayerWalkingAnimation,
    createPlayerAttackAnimation,
} from '../helpers/animations';


//To create the hero inside the canvas in each scene
export const handleCreateHero = (scene) => {
    //Destructure data from player in the scene
    const { 
    frame: initialFrame,
    health: heroHealth,
    maxHealth: heroMaxHealth,
    coin: heroCoin,
    canPush: heroCanPush,
    haveSword: heroHaveSword,
    } = scene.initData.heroStatus;
    const isDebugMode = scene.physics.config.debug;

    //create the player image in the canvas in the initial position of img coordenates 0 in X and 0 in Y
    scene.playerSprite = scene.physics.add
    .sprite(0, 0, 'hero', initialFrame)
    .setDepth(1);

    //Set the size of the character inside the canvas
    scene.playerSprite.body.setSize(16, 16);
    //Set the body size of the character exaclty inside a tile (16x16) per movement. 
    scene.playerSprite.body.setOffset(8, 16);

    //?????
    scene.playerSprite.health = heroHealth;
    scene.playerSprite.maxHealth = heroMaxHealth;
    scene.playerSprite.coin = heroCoin;
    scene.playerSprite.canPush = heroCanPush;
    scene.playerSprite.haveSword = heroHaveSword;

    updateHeroHealthUi(calculateHeroHealthStates(scene));
    updateHeroCoinUi(heroCoin);

    //To restore health when heart is founded
    scene.playerSprite.restoreHealth = (restore) => {
            scene.playerSprite.health = Math.min(scene.playerSprite.health + restore, scene.playerSprite.maxHealth);
            updateHeroHealthUi(calculateHeroHealthStates(scene));
    };
    //To increase the max number of hearts when find a new big heart
    scene.playerSprite.increaseMaxHealth = (increase) => {
            scene.playerSprite.maxHealth += increase;
            updateHeroHealthUi(calculateHeroHealthStates(scene));
    };
    //To collect coins in the UI of the screen
    scene.playerSprite.collectCoin = (coinQuantity) => {
            scene.playerSprite.coin = Math.min(scene.playerSprite.coin + coinQuantity, 999);
            updateHeroCoinUi(scene.playerSprite.coin);
    };
    //To take damage if the enemy attack the player
    scene.playerSprite.takeDamage = (damage) => {
        scene.time.delayedCall(
            180,
            () => {
                scene.playerSprite.health -= damage;
                    //Go to the game over screen if life get to zero
                    if (scene.playerSprite.health <= 0) {
                        //To restore to Zero the money and full the life, scene WILL CHANGE!!!!
                        updateHeroHealthUi([]);
                        updateHeroCoinUi(null);
                        scene.time.delayedCall(
                            SCENE_FADE_TIME,
                            () => {
                                scene.isTeleporting = false;
                                scene.scene.start('GameOverScene');
                            }
                        );
                    //Take damage if the enemy attack the player and add effect to the player to show the damage
                    } else {
                        updateHeroHealthUi(calculateHeroHealthStates(scene));
                        scene.tweens.add({
                            targets: scene.playerSprite,
                            alpha: 0,
                            ease: PhaserMath.Easing.Elastic.InOut,
                            duration: 70,
                            repeat: 1,
                            yoyo: true,
                        });
                    }
                }
        );
    };

    //Create the action that happen when player an enemy collides
    scene.heroActionCollider = createInteractiveGameObject(
        scene,
        scene.playerSprite.x + 9,
        scene.playerSprite.y + 36,
        14, //before was 14
        8, //before was 8
        'attack',
        isDebugMode
    );
    //Create a big presence square that let enemies notes when a player is close. Or to do stuff when player is inside a range
    scene.heroPresenceCollider = createInteractiveGameObject(
        scene,
        scene.playerSprite.x + 16,
        scene.playerSprite.y + 20,
        176, // TODO
        176, // TODO
        'presence',
        isDebugMode,
        { x: 0.5, y: 0.5 }
    );
    //Create the action that happen when player and item/object, teleport or dialog data collides
    scene.heroObjectCollider = createInteractiveGameObject(
        scene,
        scene.playerSprite.x + 16,
        scene.playerSprite.y + 16,
        16,
        16,
        'object',
        isDebugMode,
        { x: 0.5, y: 0.5 }
    );

        // idle animation (to show the character in movement when is in idle position AKA doing nothing)
        createPlayerIdleAnimation(scene, 'hero', 'idle_up');
        createPlayerIdleAnimation(scene, 'hero', 'idle_right');
        createPlayerIdleAnimation(scene, 'hero', 'idle_down');
        createPlayerIdleAnimation(scene, 'hero', 'idle_left');
        //diagonal idle
        createPlayerIdleAnimation(scene, 'hero', 'idle_up-left');
        createPlayerIdleAnimation(scene, 'hero', 'idle_up-right');
        createPlayerIdleAnimation(scene, 'hero', 'idle-left');
        createPlayerIdleAnimation(scene, 'hero', 'idle-right');

        // Create the sprite movement animation using the spritesheet aka the png files
        createPlayerWalkingAnimation(scene, 'hero', 'walking_up');
        createPlayerWalkingAnimation(scene, 'hero', 'walking_right');
        createPlayerWalkingAnimation(scene, 'hero', 'walking_down');
        createPlayerWalkingAnimation(scene, 'hero', 'walking_left');
        //diagonal movement
        createPlayerWalkingAnimation(scene, 'hero', 'walking_up-left');
        createPlayerWalkingAnimation(scene, 'hero', 'walking_up-right');
        createPlayerWalkingAnimation(scene, 'hero', 'walking_down-left');
        createPlayerWalkingAnimation(scene, 'hero', 'walking_down-right');

        // Create the sprite attack animation using the spritesheet aka the png files
        createPlayerAttackAnimation(scene, 'hero', 'attack_up', 12, 0, false);
        createPlayerAttackAnimation(scene, 'hero', 'attack_right', 12, 0, false);
        createPlayerAttackAnimation(scene, 'hero', 'attack_down', 12, 0, false);
        createPlayerAttackAnimation(scene, 'hero', 'attack_left', 12, 0, false);

        scene.playerSprite.on('animationcomplete', (animation, animationFrame) => {
            if (animation.key.includes('attack')) {
                scene.isAttacking = false;
            }
        });

        scene.playerSprite.on('animationstop', (animation, animationFrame) => {
            if (animation.key.includes('attack')) {
                scene.isAttacking = false;
            }
        });
    
};

//to move the characters 
export const handleHeroMovement = (scene) => {
    
    //to bind the sword attack
    scene.isSpaceJustDown = Input.Keyboard.JustDown(scene.spaceKey);
    //if user is moving, speaking or teleporting, don't do anything
    if (
        scene.isTeleporting
        || scene.isAttacking 
        || scene.isShowingDialog
    ) {
        return;
    }
    //If user is not moving, user have an sword an the key bidding attack is pressed, attack in the current direction
    if (
        //!scene.gridEngine.isMoving('hero') TODO: REMOVE TO ATTACK WHILE RUNNING BUT WITHOUT LOST THE ATTACK ANIMATION 
        scene.isSpaceJustDown
        && scene.playerSprite.haveSword
    ) {
        const facingDirection = scene.gridEngine.getFacingDirection('hero');
        scene.playerSprite.anims.play(`hero_attack_${facingDirection}`);
        scene.isAttacking = true;
        return;
    }
    //move the character in the current direction with the key binding of grid engine
    scene.heroActionCollider.update();
        if ((scene.cursors.left.isDown && scene.cursors.up.isDown) || (scene.wasd.up.isDown && scene.wasd.left.isDown)) {
          scene.gridEngine.move('hero', "up-left");
        } else if ((scene.cursors.left.isDown && scene.cursors.down.isDown ) || (scene.wasd.down.isDown && scene.wasd.left.isDown)) {
          scene.gridEngine.move('hero', "down-left");
        } else if ((scene.cursors.right.isDown && scene.cursors.up.isDown ) || (scene.wasd.up.isDown && scene.wasd.right.isDown)) {
          scene.gridEngine.move('hero', "up-right");
        } else if ((scene.cursors.right.isDown && scene.cursors.down.isDown) || (scene.wasd.down.isDown && scene.wasd.right.isDown)) {
          scene.gridEngine.move('hero', "down-right");
        } else if (scene.cursors.left.isDown || scene.wasd.left.isDown) {
            scene.gridEngine.move('hero', 'left');
        } else if (scene.cursors.right.isDown || scene.wasd.right.isDown) {
            scene.gridEngine.move('hero', 'right');
        } else if (scene.cursors.up.isDown || scene.wasd.up.isDown) {
            scene.gridEngine.move('hero', 'up');
        } else if (scene.cursors.down.isDown || scene.wasd.down.isDown) {
            scene.gridEngine.move('hero', 'down');

        }
    
};  

//to handle hero sprite animations
export const handleHeroSpriteMovement = (scene) => {
    const { 
        facingDirection
        } = scene.initData.heroStatus;
    //To add animation to the iddle position of the character    
    scene.playerSprite.anims.play(`hero_idle_${facingDirection}`);

    scene.gridEngine.movementStarted().subscribe(({ charId, direction }) => {
        if (charId === 'hero') {
            scene.playerSprite.anims.play(`hero_walking_${direction}`);
        }
    });

    scene.gridEngine.movementStopped().subscribe(({ charId, direction }) => {
        if (charId === 'hero') {
            scene.playerSprite.anims.play(`hero_idle_${direction}`);
            //scene.playerSprite.anims.stop();
            //scene.playerSprite.setFrame(getStopFrame(direction, charId));
        }
    });
    
    scene.gridEngine.directionChanged().subscribe(({ charId, direction }) => {
        if (charId === 'hero') {
            scene.playerSprite.setFrame(getStopFrame(direction, charId));
        }
    });
};

//to handle hero attack box collide
export const handleHeroActionBox = (scene) => {

    scene.heroActionCollider.update = () => {
        const facingDirection = scene.gridEngine.getFacingDirection('hero');
        scene.heroPresenceCollider.setPosition(
            scene.playerSprite.x + 16,
            scene.playerSprite.y + 20
        );

        scene.heroObjectCollider.setPosition(
            scene.playerSprite.x + 16,
            scene.playerSprite.y + 20
        );

        switch (facingDirection) {
            case 'up-left': {
                scene.heroActionCollider.setSize(8, 14);
                scene.heroActionCollider.body.setSize(8, 14);
                scene.heroActionCollider.setX(scene.playerSprite.x);
                scene.heroActionCollider.setY(scene.playerSprite.y + 21);
                break;
            }

            case 'up-right': {
                scene.heroActionCollider.setSize(8, 14);
                scene.heroActionCollider.body.setSize(8, 14);
                scene.heroActionCollider.setX(scene.playerSprite.x + 24);
                scene.heroActionCollider.setY(scene.playerSprite.y + 21);
                break;
            }

            case 'down-left': {
                scene.heroActionCollider.setSize(8, 14);
                scene.heroActionCollider.body.setSize(8, 14);
                scene.heroActionCollider.setX(scene.playerSprite.x);
                scene.heroActionCollider.setY(scene.playerSprite.y + 21);
                break;
            }

            case 'down-right': {
                scene.heroActionCollider.setSize(8, 14);
                scene.heroActionCollider.body.setSize(8, 14);
                scene.heroActionCollider.setX(scene.playerSprite.x + 24);
                scene.heroActionCollider.setY(scene.playerSprite.y + 21);
                break;
            }

            case 'down': {
                scene.heroActionCollider.setSize(14, 8);
                scene.heroActionCollider.body.setSize(14, 8);
                scene.heroActionCollider.setX(scene.playerSprite.x + 9);
                scene.heroActionCollider.setY(scene.playerSprite.y + 36);
                break;
            }

            case 'up': {
                scene.heroActionCollider.setSize(14, 8);
                scene.heroActionCollider.body.setSize(14, 8);
                scene.heroActionCollider.setX(scene.playerSprite.x + 9);
                scene.heroActionCollider.setY(scene.playerSprite.y + 12);
                break;
            }

            case 'left': {
                scene.heroActionCollider.setSize(8, 14);
                scene.heroActionCollider.body.setSize(8, 14);
                scene.heroActionCollider.setX(scene.playerSprite.x);
                scene.heroActionCollider.setY(scene.playerSprite.y + 21);
                break;
            }

            case 'right': {
                scene.heroActionCollider.setSize(8, 14);
                scene.heroActionCollider.body.setSize(8, 14);
                scene.heroActionCollider.setX(scene.playerSprite.x + 24);
                scene.heroActionCollider.setY(scene.playerSprite.y + 21);
                break;
            }

            default: {
                break;
            }
        }
    };
};

//To show the dialog box if hero interact with the NPC
export const handleHeroNpcDialog = (scene) => {

    scene.physics.add.overlap(scene.heroActionCollider, scene.npcSprites, (objA, objB) => {
        if (scene.isShowingDialog) {
            return;
        }

        const npc = [objA, objB].find((obj) => obj !== scene.heroActionCollider);

        if (Input.Keyboard.JustDown(scene.enterKey)) {
            if (scene.gridEngine.isMoving(npc.texture.key)) {
                return;
            }

            const characterName = npc.texture.key;
            const customEvent = new CustomEvent('new-dialog', {
                detail: {
                    characterName,
                },
            });

            window.dispatchEvent(customEvent);
            const dialogBoxFinishedEventListener = () => {
                window.removeEventListener(`${characterName}-dialog-finished`, dialogBoxFinishedEventListener);
                scene.gridEngine.moveRandomly(characterName);

                // just to consume the JustDown
                Input.Keyboard.JustDown(scene.enterKey);
                Input.Keyboard.JustDown(scene.spaceKey);

                scene.time.delayedCall(100, () => {
                    scene.isShowingDialog = false;
                    const { delay, area } = scene.npcsKeys.find((npcData) => npcData.npcKey === characterName);
                    scene.gridEngine.moveRandomly(characterName, delay, area);
                });
            };
            window.addEventListener(`${characterName}-dialog-finished`, dialogBoxFinishedEventListener);

            scene.isShowingDialog = true;
            const facingDirection = scene.gridEngine.getFacingDirection('hero');
            scene.gridEngine.stopMovement(characterName);
            npc.setFrame(getStopFrame(getOppositeDirection(facingDirection), characterName));
        }
    });
}

//To generate the actions with the weapon like cut grass or move blocks
export const handleHeroWeaponActions = (scene) => {
    scene.physics.add.overlap(scene.heroActionCollider, scene.elementsLayers, (objA, objB) => {
        const tile = [objA, objB].find((obj) => obj !== scene.heroActionCollider);

        // Handles attack
        if (tile?.index > 0 && !tile.wasHandled) {
            switch (tile.index) {
                case BUSH_INDEX: {
                    if (scene.isAttacking) {
                        tile.wasHandled = true;

                        scene.time.delayedCall(
                            ATTACK_DELAY_TIME,
                            () => {
                                tile.setVisible(false);
                                spawnItem(scene, {
                                    x: tile.pixelX,
                                    y: tile.pixelY,
                                });
                                tile.destroy();
                            }
                        );
                    }

                    break;
                }

                case BOX_INDEX: {
                    if (scene.playerSprite.canPush && scene.isAttacking) {
                        const newPosition = calculatePushTilePosition(scene);
                        const canBePushed = scene.map.layers.every((layer) => {
                            const t = layer.tilemapLayer.getTileAtWorldXY(
                                newPosition.x,
                                newPosition.y
                            );

                            return !t?.properties?.ge_collide;
                        });

                        if (canBePushed && !tile.isMoved) {
                            tile.isMoved = true;
                            scene.tweens.add({
                                targets: tile,
                                pixelX: newPosition.x,
                                pixelY: newPosition.y,
                                ease: 'Power2', // PhaserMath.Easing
                                duration: 700,
                                onComplete: () => {
                                    tile.setVisible(false);
                                    const newTile = tile.layer.tilemapLayer.putTileAt(
                                        BOX_INDEX,
                                        newPosition.x / 16,
                                        newPosition.y / 16,
                                        true
                                    );

                                    newTile.properties = {
                                        ...tile.properties,
                                    };
                                    newTile.isMoved = true;
                                    tile.destroy();
                                },
                            });
                        }
                    }

                    break;
                }

                default: {
                    break;
                }
            }
        }
    });

}

//To calculate how many hearts the player will have it
export const handleHeroAttack = (scene) => {

    scene.physics.add.overlap(scene.heroActionCollider, scene.enemiesSprites, (objA, objB) => {
        const enemy = [objA, objB].find((obj) => obj !== scene.heroActionCollider);

        // Handles attack
        if (scene.isAttacking) {
            const isSpaceJustDown = scene.isSpaceJustDown;
            scene.time.delayedCall(
                ATTACK_DELAY_TIME,
                () => {
                    enemy.takeDamage(25, isSpaceJustDown);
                }
            );
        }
    });
}

//To calculate how many hearts the player will have it
export const calculateHeroHealthState = (health) => {
    if (health > 10) {
        return 'full';
    }

    if (health > 0) {
        return 'half';
    }

    return 'empty';
}

//To calculate how many hearts the player will have it
export const calculateHeroHealthStates = (scene) => {
    return Array.from({ length: scene.playerSprite.maxHealth / 20 })
        .fill(null).map(
            (v, index) => calculateHeroHealthState(
                Math.max(scene.playerSprite.health - (20 * index), 0)
            )
        );
}

//To update the hero hearts UI in the screen when take it damage
export const updateHeroHealthUi = (healthStates) => {
    const customEvent = new CustomEvent('hero-health', {
        detail: {
            healthStates,
        },
    });

    window.dispatchEvent(customEvent);
}
//To update the hero coin in the screen when get coins
export const updateHeroCoinUi = (heroCoins) => {
    const customEvent = new CustomEvent('hero-coin', {
        detail: {
            heroCoins,
        },
    });

    window.dispatchEvent(customEvent);
}


export const calculatePushTilePosition= (scene) => {
    const facingDirection = scene.gridEngine.getFacingDirection('hero');
    const position = scene.gridEngine.getPosition('hero');

    switch (facingDirection) {
        case 'up':
            return {
                x: position.x * 16,
                y: (position.y - 2) * 16,
            };

        case 'right':
            return {
                x: (position.x + 2) * 16,
                y: position.y * 16,
            };

        case 'down':
            return {
                x: position.x * 16,
                y: (position.y + 2) * 16,
            };

        case 'left':
            return {
                x: (position.x - 2) * 16,
                y: position.y * 16,
            };

        default:
            return {
                x: position.x * 16,
                y: position.y * 16,
            };
    }
}

//TO ADD PROBABILITY WHEN ITEM IS FOUND IT!!! THIS IS IMPORTANT. CHECK LATER!!!!!
export const spawnItem = (scene, position) => {

    const isDebugMode = scene.physics.config.debug;
    const itemChance = PhaserMath.Between(1, isDebugMode ? 2 : 5);

    if (itemChance === 1) {
        const itemType = PhaserMath.Between(1, 2);

        if (itemType === 1) {
            const item = scene.physics.add
                .sprite(position.x, position.y, 'heart')
                .setDepth(1)
                .setOrigin(0, 0);
            item.itemType = 'heart';
            scene.itemsSprites.add(item);
            item.anims.play('heart_idle');
        } else if (itemType === 2) {
            const item = scene.physics.add
                .sprite(position.x, position.y, 'coin')
                .setDepth(1)
                .setOrigin(0, 0);
            item.itemType = 'coin';
            scene.itemsSprites.add(item);
            item.anims.play('coin_idle');
        }
    }

}

export const getOppositeDirection = (direction) => {

    switch (direction) {
        case 'up-left':
            return 'right';
        case 'up-right':
            return 'left';
        case 'down-left':
            return 'right';
        case 'down-right':
            return 'left';
        case 'up':
            return 'down';
        case 'right':
            return 'left';
        case 'down':
            return 'up';
        case 'left':
            return 'right';
        default:
            return null;
    }
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

//(IDK WHY I MADE THIS CODE, BUT ITS NOT IN USE RIGHT NOW) To generate the actions with the weapon like cut grass or move blocks
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

