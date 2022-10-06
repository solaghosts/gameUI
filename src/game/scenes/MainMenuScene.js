import { Scene } from 'phaser';

export default class MainMenuScene extends Scene {
    constructor() {
        super('MainMenuScene');
    }

    preload() {
        // TODO
    }

    create() {
        //Add the background img to the scene
        this.add.image(0, 0, 'main_menu_background')
            .setScale(1.2)
            .setDepth(0)
            .setOrigin(0, 0);

        const customEvent = new CustomEvent('menu-items', {
            detail: {
                menuItems: ['New Game', 'Load Game', 'Options'],
                menuPosition: 'center',
            },
        });

        window.dispatchEvent(customEvent);
        
        const gameMenuSelectedEventListener = ({ detail }) => {
            switch (detail.selectedItem) {
                case 'New Game': {
                    this.scene.start('SelectPlayerScene')
                    /*this.scene.start('GameScene', {
                        heroStatus: {
                            position: { x: 4, y: 3 },
                            previousPosition: { x: 4, y: 3 },
                            //frame: 'hero_idle_down_01',
                            facingDirection: 'down',
                            health: 60,
                            maxHealth: 60,
                            coin: 0,
                            canPush: false,
                            haveSword: false,
                        },
                        mapKey: 'home_page_city_house_01',
                    });*/
                    break;
                }

                case 'exit': {
                    window.location.reload();
                    break;
                }

                case 'settings': {
                    break;
                }

                default: {
                    break;
                }
            }

            window.removeEventListener(
                'menu-item-selected',
                gameMenuSelectedEventListener
            );
        };

        window.addEventListener(
            'menu-item-selected',
            gameMenuSelectedEventListener
        );
    }
}
