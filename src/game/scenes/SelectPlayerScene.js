import { Scene } from 'phaser';

export default class SelectPlayerScene extends Scene {
    constructor() {
        super('SelectPlayerScene');
    }

    preload() {
        // TODO
    }

    create() {
        
        //const { width: gameWidth, height: gameHeight } = this.cameras.main;


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
                    this.scene.start('GameScene', {
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
                        tileset: "tilesets",
                    });
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
