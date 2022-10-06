import { Math as PhaserMath } from 'phaser';
import {
    ENEMY_AI_TYPE,
} from '../components/constants';

import { 
    getFramesForAnimation,
} from '../helpers/animations';

//to extract the enemies data from the tileset
export const handleCreateEnemiesData = (scene) => {

    scene.enemiesData = [];
    scene.dataLayer = scene.map.getObjectLayer('actions');
        scene.dataLayer.objects.forEach((data) => {
            const { properties, x, y } = data;

            properties.forEach((property) => {
                const { name, value } = property;

                if(name === "enemyData"){
                    const [enemyType, enemyAI, speed, health] = value.split(':');
                    scene.enemiesData.push({
                        x,
                        y,
                        speed: Number.parseInt(speed, 10),
                        enemyType,
                        enemySpecies: getEnemySpecies(enemyType),
                        enemyAI,
                        enemyName: `${enemyType}_${scene.enemiesData.length}`,
                        health: Number.parseInt(health, 10),
                    });
                }
            });
        });

};
  
//To add the enemies added in the tileset to the game scene with all their stats
export const handleAddEnemies = (scene) => {

    scene.enemiesSprites = scene.add.group();
    scene.enemiesData.forEach((enemyData, index) => {
        const { enemySpecies, enemyType, x, y, enemyName, speed, enemyAI, health } = enemyData;
        const enemy = scene.physics.add.sprite(0, 0, enemyType, `${enemySpecies}_idle_01`);
        enemy.setTint(getEnemyColor(enemyType));
        enemy.name = enemyName;
        enemy.enemyType = enemyType;
        enemy.enemySpecies = enemySpecies;
        enemy.enemyAI = enemyAI;
        enemy.speed = speed;
        enemy.health = health;
        enemy.isAttacking = false;
        enemy.updateFollowHeroPosition = true;
        enemy.lastKnowHeroPosition = { x: 0, y: 0 };
        enemy.body.setSize(14, 14);
        enemy.body.setOffset(9, 21);
        scene.enemiesSprites.add(enemy);
        enemy.takeDamage = (damage, isSpaceJustDown) => {
            if (isSpaceJustDown) {
                enemy.health -= damage;

                if (enemy.health < 0) {
                    enemy.setVisible(false);
                    const position = scene.gridEngine.getPosition(enemy.name);
                    spawnItem(scene, {
                        x: position.x * 16,
                        y: position.y * 16,
                    });
                    scene.gridEngine.setPosition(enemy.name, { x: 1, y: 1 });
                    enemy.destroy();
                } else {
                    scene.tweens.add({
                        targets: enemy,
                        alpha: 0,
                        ease: PhaserMath.Easing.Elastic.InOut,
                        duration: 70,
                        repeat: 1,
                        yoyo: true,
                    });
                }
            }
        };

        if (!scene.anims.exists(`${enemySpecies}_idle`)) {
            scene.anims.create({
                key: `${enemySpecies}_idle`,
                frames: getFramesForAnimation(scene, enemySpecies, 'idle'),
                frameRate: 8,
                repeat: -1,
                yoyo: false,
            });
        }

        if (!scene.anims.exists(`${enemySpecies}_attack`)) {
            scene.anims.create({
                key: `${enemySpecies}_attack`,
                frames: getFramesForAnimation(scene, enemySpecies, 'attack'),
                frameRate: 12,
                repeat: 0,
                yoyo: false,
            });
        }

        if (!scene.anims.exists(`${enemySpecies}_walking`)) {
            scene.anims.create({
                key: `${enemySpecies}_walking`,
                frames: getFramesForAnimation(scene, enemySpecies, 'walking'),
                frameRate: 8,
                repeat: -1,
                yoyo: false,
            });
        }

        if (!scene.anims.exists(`${enemySpecies}_die`)) {
            scene.anims.create({
                key: `${enemySpecies}_die`,
                frames: getFramesForAnimation(scene, enemySpecies, 'die'),
                frameRate: 8,
                repeat: 0,
                yoyo: false,
            });
        }

        enemy.anims.play(`${enemySpecies}_idle`);
        enemy.on('animationcomplete', (animation) => {
            if (animation.key.includes('attack')) {
                enemy.anims.play(`${enemySpecies}_idle`);
            }
        });

        scene.gridEngineConfig.characters.push({
            id: enemyName,
            sprite: enemy,
            startPosition: { x: x / 16, y: (y / 16) - 1 },
            speed,
            //offsetY: -4,
        });

    });

}

//Handle movement ramdom to each enemy inside the game scene
export const handleEnemiessmoveRandomly = (scene) => {
    
    scene.enemiesData.forEach((enemyData) => {
        const {
            enemyName,
        } = enemyData;

        scene.gridEngine.moveRandomly(enemyName, 1000, 4);
    });

}

//handle enemy movement when see the hero (?)
export const handleEnemiesMovement = (scene) => {

    scene.enemiesSprites.getChildren().forEach((enemy) => {
        enemy.canSeeHero = enemy.body.embedded;
        if (!enemy.canSeeHero && enemy.isFollowingHero) {
            enemy.isFollowingHero = false;
            scene.gridEngine.setSpeed(enemy.name, enemy.speed);
            scene.gridEngine.moveRandomly(enemy.name, 1000, 4);
        }
    });
}

//To handle if hero is on the range vision of the enemy and if is so, enemy will follow the hero
export const handleEnemiesCanSeeHero = (scene) => {

    //if hero is close to the enemy range vision, enemy will follow the hero in the game scene
    scene.physics.add.overlap(scene.heroPresenceCollider, scene.enemiesSprites, (objA, objB) => {
        const enemy = [objA, objB].find((obj) => obj !== scene.heroPresenceCollider);

        if (enemy.canSeeHero && enemy.enemyAI === ENEMY_AI_TYPE) {
            enemy.isFollowingHero = true;
            if (enemy.updateFollowHeroPosition) {
                const facingDirection = scene.gridEngine.getFacingDirection('hero');
                const heroPosition = scene.gridEngine.getPosition('hero');
                const heroBackPosition = getBackPosition(facingDirection, heroPosition);

                if (
                    enemy.lastKnowHeroPosition.x !== heroBackPosition.x
                    || enemy.lastKnowHeroPosition.y !== heroBackPosition.y
                ) {
                    const enemyPosition = scene.gridEngine.getPosition(enemy.name);
                    enemy.lastKnowHeroPosition = heroBackPosition;

                    if (
                        heroBackPosition.x === enemyPosition.x
                        && heroBackPosition.y === enemyPosition.y
                    ) {
                        enemy.updateFollowHeroPosition = false;
                        // TODO can attack I guess
                        return;
                    }

                    enemy.updateFollowHeroPosition = false;
                    scene.time.delayedCall(1000, () => {
                        enemy.updateFollowHeroPosition = true;
                    });

                    scene.gridEngine.setSpeed(enemy.name, Math.ceil(enemy.speed * 1.5));
                    scene.gridEngine.moveTo(enemy.name, heroBackPosition, {
                        NoPathFoundStrategy: 'CLOSEST_REACHABLE',
                    });
                }
            }
        }

        enemy.canSeeHero = enemy.body.embedded;
    });
}

//To handle the damage the enemy inflict to the hero when attack him
export const handleEnemiesAttack = (scene) => { 
    scene.physics.add.overlap(scene.heroObjectCollider, scene.enemiesSprites, (objA, objB) => {
        const enemy = [objA, objB].find((obj) => obj !== scene.heroObjectCollider);
        if (enemy.isAttacking || scene.gridEngine.isMoving(enemy.name)) {
            return;
        }

        enemy.anims.play(`${enemy.enemySpecies}_attack`);
        scene.playerSprite.takeDamage(10);
        enemy.isAttacking = true;
        scene.time.delayedCall(
            getEnemyAttackSpeed(enemy.enemyType),
            () => {
                enemy.isAttacking = false;
            }
        );
    });
}

//to handle hero sprite animations
export const handleEnemiesSpriteMovement = (scene) => {

    scene.gridEngine.movementStarted().subscribe(({ charId, direction }) => {
        const enemy = scene.enemiesSprites.getChildren().find((enemySprite) => enemySprite.name === charId);
        if (enemy) {
            enemy.anims.play(`${enemy.enemySpecies}_walking`);
        }
    });

    scene.gridEngine.movementStopped().subscribe(({ charId, direction }) => {
        const enemy = scene.enemiesSprites.getChildren().find((enemySprite) => enemySprite.name === charId);
        if (enemy) {
            enemy.anims.play(`${enemy.enemySpecies}_idle`, true);
        }
    });
    
    scene.gridEngine.directionChanged().subscribe(({ charId, direction }) => {
        const enemy = scene.enemiesSprites.getChildren().find((enemySprite) => enemySprite.name === charId);
        if (enemy) {
            enemy.anims.play(`${enemy.enemySpecies}_idle`);
        }
    });
};

//To get the enemy specie. I don't see any utility to scene function for now. CHECK LATER!!!!!!!!!!1
export const getEnemySpecies = (enemyType) => {

    if (enemyType.includes('slime')) {
        return 'slime';
    }

    return 'slime';
}


export const getEnemyAttackSpeed = (enemyType) => {
    if (enemyType.includes('red')) {
        return 2000;
    }

    if (enemyType.includes('green')) {
        return 3000;
    }

    if (enemyType.includes('yellow')) {
        return 4000;
    }

    return 5000;
}

export const getEnemyColor = (enemyType) => {
    if (enemyType.includes('red')) {
        return 0xF1374B;
    }

    if (enemyType.includes('green')) {
        return 0x2BBD6E;
    }

    if (enemyType.includes('yellow')) {
        return 0xFFFF4F;
    }

    return 0x00A0DC;
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

export const getBackPosition = (facingDirection, position) => {

    switch (facingDirection) {
        case 'up-left':
            return {
                ...position,
                x: position.x + 1,
            };
        case 'down-left':
            return {
                ...position,
                x: position.x + 1,
            };
        case 'up-right':
            return {
                ...position,
                x: position.x - 1,
            };
        case 'down-right':
            return {
                ...position,
                x: position.x - 1,
            };
        case 'up':
            return {
                ...position,
                y: position.y + 1,
            };
        case 'right':
            return {
                ...position,
                x: position.x - 1,
            };
        case 'down':
            return {
                ...position,
                y: position.y - 1,
            };
        case 'left':
            return {
                ...position,
                x: position.x + 1,
            };
        default:
            return position;
    }
}
    