import { Input } from 'phaser';
import { createInteractiveGameObject } from './utils';
import {
    SCENE_FADE_TIME,
} from '../components/constants';

//to extract the items data from the tileset
export const handleCreateItemsData = (scene) => {

    const {
        canPush: heroCanPush,
        haveSword: heroHaveSword,
    } = scene.initData.heroStatus;
    scene.dataLayer = scene.map.getObjectLayer('actions');
        scene.dataLayer.objects.forEach((data) => {
            const { properties, x, y } = data;

            properties.forEach((property) => {
                const { name, value } = property;

                if(name === "itemData"){
                    const [itemType] = value.split(':');

                        switch (itemType) {
                            case 'coin': {
                                const item = scene.physics.add
                                    .sprite(x, y, 'coin')
                                    .setDepth(1)
                                    .setOrigin(0, 1);

                                item.itemType = 'coin';
                                scene.itemsSprites.add(item);
                                item.anims.play('coin_idle');
                                break;
                            }

                            case 'heart_container': {
                                const item = scene.physics.add
                                    .sprite(x, y, 'heart_container')
                                    .setDepth(1)
                                    .setOrigin(0, 1);

                                item.itemType = 'heart_container';
                                scene.itemsSprites.add(item);
                                break;
                            }

                            case 'heart': {
                                const item = scene.physics.add
                                    .sprite(x, y, 'heart')
                                    .setDepth(1)
                                    .setOrigin(0, 1);

                                item.itemType = 'heart';
                                scene.itemsSprites.add(item);
                                item.anims.play('heart_idle');
                                break;
                            }

                            case 'sword': {
                                if (!heroHaveSword) {
                                    const item = scene.physics.add
                                        .sprite(x, y, 'sword')
                                        .setDepth(1)
                                        .setOrigin(0, 1);

                                    item.itemType = 'sword';
                                    scene.itemsSprites.add(item);
                                }

                                break;
                            }

                            case 'push': {
                                if (!heroCanPush) {
                                    const item = scene.physics.add
                                        .sprite(x, y, 'push')
                                        .setDepth(1)
                                        .setOrigin(0, 1);

                                    item.itemType = 'push';
                                    scene.itemsSprites.add(item);
                                }

                                break;
                            }

                            default: {
                                break;
                            }
                        }
                }
            });
        });


};

//to extract the Dialog Element data from the tileset
export const handleCreateDialogElementsData = (scene) => {

    const isDebugMode = scene.physics.config.debug;
    scene.dataLayer = scene.map.getObjectLayer('actions');
        scene.dataLayer.objects.forEach((data) => {
            const { properties, x, y } = data;

            properties.forEach((property) => {
                const { name, value } = property;

                if(name === "dialog"){
                    const customCollider = createInteractiveGameObject(
                        scene,
                        x,
                        y,
                        16,
                        16,
                        'dialog',
                        isDebugMode
                    );

                    scene.physics.add.overlap(scene.heroActionCollider, customCollider, (objA, objB) => {
                        if (scene.isShowingDialog) {
                            return;
                        }

                        if (Input.Keyboard.JustDown(scene.enterKey)) {
                            const characterName = value;
                            const customEvent = new CustomEvent('new-dialog', {
                                detail: {
                                    characterName,
                                },
                            });

                            window.dispatchEvent(customEvent);
                            const dialogBoxFinishedEventListener = () => {
                                window.removeEventListener(
                                    `${characterName}-dialog-finished`,
                                    dialogBoxFinishedEventListener
                                );

                                // just to consume the JustDown
                                Input.Keyboard.JustDown(scene.enterKey);
                                Input.Keyboard.JustDown(scene.spaceKey);

                                scene.time.delayedCall(100, () => {
                                    scene.isShowingDialog = false;
                                });
                            };
                            window.addEventListener(
                                `${characterName}-dialog-finished`,
                                dialogBoxFinishedEventListener
                            );

                            scene.isShowingDialog = true;
                        }
                    });
                }
            });
        });


};

//to extract the teleports data from the tileset
export const handleCreateTeleportsData = (scene) => {

    const isDebugMode = scene.physics.config.debug;
    const camera = scene.cameras.main;
    scene.dataLayer = scene.map.getObjectLayer('actions');
        scene.dataLayer.objects.forEach((data) => {
            const { properties, x, y } = data;

            properties.forEach((property) => {
                const { name, value } = property;

                if(name === "teleportTo"){
                    const customCollider = createInteractiveGameObject(
                        scene,
                        x,
                        y,
                        16,
                        16,
                        'teleport',
                        isDebugMode
                    );

                    const {
                        mapKey: teleportToMapKey,
                        x: teleportToX,
                        y: teleportToY,
                    } = extractTeleportDataFromTiled(value);

                    const overlapCollider = scene.physics.add.overlap(scene.playerSprite, customCollider, () => {
                        // camera.stopFollow();
                        scene.physics.world.removeCollider(overlapCollider);
                        const facingDirection = scene.gridEngine.getFacingDirection('hero');
                        camera.fadeOut(SCENE_FADE_TIME);
                        // scene.scene.pause();
                        scene.isTeleporting = true;
                        // scene.gridEngine.stopMovement('hero');

                        scene.time.delayedCall(
                            SCENE_FADE_TIME,
                            () => {
                                scene.isTeleporting = false;
                                scene.scene.restart({
                                    heroStatus: {
                                        position: { x: teleportToX, y: teleportToY },
                                        previousPosition: calculatePreviousTeleportPosition(scene),
                                        //frame: `hero_idle_${facingDirection}_01`,
                                        facingDirection,
                                        health: scene.playerSprite.health,
                                        maxHealth: scene.playerSprite.maxHealth,
                                        coin: scene.playerSprite.coin,
                                        canPush: scene.playerSprite.canPush,
                                        haveSword: scene.playerSprite.haveSword,
                                    },
                                    mapKey: teleportToMapKey,
                                });
                            }
                            
                        );
                    });
                }
            });
        });


};

//to extract the enemies data from the tileset
export const handleItemsSpriteMovement = (scene) => {

        // Items
        scene.itemsSprites = scene.add.group();
        if (!scene.anims.exists('heart_idle')) {
            scene.anims.create({
                key: 'heart_idle',
                frames: scene.getFramesForAnimation('heart', 'idle'),
                frameRate: 4,
                repeat: -1,
                yoyo: false,
            });
        }

        if (!scene.anims.exists('coin_idle')) {
            scene.anims.create({
                key: 'coin_idle',
                frames: scene.getFramesForAnimation('coin', 'idle'),
                frameRate: 4,
                repeat: -1,
                yoyo: false,
            });
        }
};
  


//to add actions to the items like heal, collect coin, get a weapon and so...
export const handleItemsActions = (scene) => {
scene.physics.add.overlap(scene.playerSprite, scene.itemsSprites, (objA, objB) => {
    const item = [objA, objB].find((obj) => obj !== scene.playerSprite);

    if (item.itemType === 'heart') {
        scene.playerSprite.restoreHealth(20);
        item.setVisible(false);
        item.destroy();
    }

    if (item.itemType === 'coin') {
        scene.playerSprite.collectCoin(1);
        item.setVisible(false);
        item.destroy();
    }

    if (item.itemType === 'heart_container') {
        scene.playerSprite.increaseMaxHealth(20);
        item.setVisible(false);
        item.destroy();
    }

    if (item.itemType === 'sword') {
        const customEvent = new CustomEvent('new-dialog', {
            detail: {
                characterName: item.itemType,
            },
        });
        window.dispatchEvent(customEvent);
        scene.isShowingDialog = true;
        const dialogBoxFinishedEventListener = () => {
            window.removeEventListener(
                `${item.itemType}-dialog-finished`,
                dialogBoxFinishedEventListener
            );

            scene.time.delayedCall(100, () => {
                scene.isShowingDialog = false;
            });
        };
        window.addEventListener(
            `${item.itemType}-dialog-finished`,
            dialogBoxFinishedEventListener
        );

        scene.playerSprite.haveSword = true;
        item.setVisible(false);
        item.destroy();
    }

    if (item.itemType === 'push') {
        const customEvent = new CustomEvent('new-dialog', {
            detail: {
                characterName: item.itemType,
            },
        });
        window.dispatchEvent(customEvent);
        scene.isShowingDialog = true;
        const dialogBoxFinishedEventListener = () => {
            window.removeEventListener(
                `${item.itemType}-dialog-finished`,
                dialogBoxFinishedEventListener
            );

            scene.time.delayedCall(100, () => {
                scene.isShowingDialog = false;
            });
        };
        window.addEventListener(
            `${item.itemType}-dialog-finished`,
            dialogBoxFinishedEventListener
        );

        scene.playerSprite.canPush = true;
        item.setVisible(false);
        item.destroy();
    }
});
}


export const calculatePreviousTeleportPosition = (scene) => {
    const currentPosition = scene.gridEngine.getPosition('hero');
        const facingDirection = scene.gridEngine.getFacingDirection('hero');

        switch (facingDirection) {

            case 'up-left': {
                return {
                    x: currentPosition.x + 1,
                    y: currentPosition.y,
                };
            }

            case 'down-left': {
                return {
                    x: currentPosition.x + 1,
                    y: currentPosition.y,
                };
            }

            case 'up-right': {
                return {
                    x: currentPosition.x - 1,
                    y: currentPosition.y,
                };
            }

            case 'down-right': {
                return {
                    x: currentPosition.x - 1,
                    y: currentPosition.y,
                };
            }

            case 'up': {
                return {
                    x: currentPosition.x,
                    y: currentPosition.y + 1,
                };
            }

            case 'right': {
                return {
                    x: currentPosition.x - 1,
                    y: currentPosition.y,
                };
            }

            case 'down': {
                return {
                    x: currentPosition.x,
                    y: currentPosition.y - 1,
                };
            }

            case 'left': {
                return {
                    x: currentPosition.x + 1,
                    y: currentPosition.y,
                };
            }

            default: {
                return {
                    x: currentPosition.x,
                    y: currentPosition.y,
                };
            }
        }
}

export const extractTeleportDataFromTiled = (data) => {

    const [mapKey, position] = data.trim().split(':');
    const [x, y] = position.split(',');

    return {
        mapKey,
        x: Number.parseInt(x, 10),
        y: Number.parseInt(y, 10),
    };
}
