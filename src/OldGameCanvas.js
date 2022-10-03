import { useCallback, useEffect, useState } from 'react';
import Phaser from 'phaser';
import GridEngine from 'grid-engine';
import BootScene from './game/scenes/BootScene';
import GameScene from './game/scenes/GameScene';
import { calculateGameSize } from "./helpers/utils";
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
import GameUserInfo from './game/GameUserInfo';
import Gamepad from './game/Gamepad';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import DialogBox from "./game/DialogBox";
import AlertBox from "./game/AlertBox"
import Pause from "./game/Pause"
import HeroHealth from "./game/HeroHealth"



const { width, height, multiplier } = calculateGameSize();

function OldGameCanvas() {
  //handle game canvas
  const [game, setGame] = useState(null);
  //handle main menu
  const [isNavOpen, setIsNavOpen] = useState(false);

  //handle menssages box
  const [messages, setMessages] = useState([]);
  const [characterName, setCharacterName] = useState('');
  const [elementName, setElementName] = useState('');
  const [heroHealthStates, setHeroHealthStates] = useState(['full','full','half','empty']);

  const handleMessageIsDone = () => {
    const customEvent = new CustomEvent('dialog-finished');
    window.dispatchEvent(customEvent);
    setMessages([]);
    setCharacterName('');
    setElementName('');
    setIsNavOpen(false);
  };

  const handleAlertIsDone = useCallback(() => {
    const customEvent = new CustomEvent(`${characterName}-alert-finished`, {
      detail: {},
    });
    window.dispatchEvent(customEvent);
    setMessages([]);
    setCharacterName('');
    setElementName('');
  }, [characterName]);

  const handleAlertIsChanged = useCallback(() => {
    const customEvent = new CustomEvent(`${characterName}-alert-changed`, {
      detail: {},
    });
    window.dispatchEvent(customEvent);
    setMessages([]);
    setCharacterName('');
    setElementName('');
  }, [characterName]);
  
  useEffect(() => {
        // do this otherwise development hot-reload
        // will create a bunch of Phaser instances
        if (game) {
          return;
        }

    const phaserGame = new Phaser.Game({
      type: Phaser.AUTO,
      title: 'Metacemetery',
      parent: 'game-content',
      localStorageName: 'some-game-title',
      width,
      height,
      autoRound: true,
      pixelArt: true,
      scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH,
        mode: Phaser.Scale.ENVELOP,
      },
      scene: [
        BootScene,
        GameScene,
      ],
      physics: {
        default: 'arcade',
        arcade: {
          debug: true,
      }
      },
      plugins: {
        scene: [
          {
            key: 'gridEngine',
            plugin: GridEngine,
            mapping: 'gridEngine',
          },
        ],
        global: [{
          key: 'rexVirtualJoystick',
          plugin: VirtualJoystickPlugin,
          start: true
          },
        ]
      },
      backgroundColor: '#000000',
    });

    setGame(phaserGame);
    // window.phaserGame = game;
     
  }, [game]);


  useEffect(() => {
    const dialogBoxEventListener = ({ detail }) => {
      // TODO fallback
      setCharacterName(detail.elementName);
      setMessages( detail.text );
      setElementName( detail.name );
    };
    window.addEventListener('new-dialog', dialogBoxEventListener);
    window.addEventListener('new-alert', dialogBoxEventListener);
    return () => {
      window.removeEventListener('new-dialog', dialogBoxEventListener);
      window.removeEventListener('new-alert', dialogBoxEventListener);
    };
  }, [setCharacterName, setMessages, setElementName]);


  //To open and close the sidebar menu
  useEffect(() => {
    const menuBoxEventListener = ({ detail }) => {
      // TODO fallback
      setIsNavOpen(detail)
    };

    window.addEventListener('new-menu', menuBoxEventListener);
    return () => {
      window.removeEventListener('new-menu', menuBoxEventListener);
    };
  }, [setIsNavOpen]);



  const heroHealthEventListener = ({ detail }) => {
    setHeroHealthStates(detail.healthStates);
  };
  window.addEventListener('hero-health', heroHealthEventListener);

  return (
      <>
        <div style={{ width: '100vw', height: '100vh', overflow:'hidden', justifyContent:'center', alignItems:'center' }}>
          <div id="game-content">
            {/* this is where the game canvas will be rendered */}
          </div>
          {heroHealthStates.length > 0 && (
              <HeroHealth
                  gameSize={{
                    width,
                    height,
                    multiplier,
                  }}
                  healthStates={heroHealthStates}
              />
          )}
          {messages.length > 0 && elementName === 'dialog' && (
              <DialogBox
                  onDone={handleMessageIsDone}
                  characterName={characterName}
                  messages={messages}
                  
              />
          )}
          {(elementName === 'toCemetery' || elementName === 'toCrypt') && messages.length > 0 &&(
              <AlertBox
                  onDone={handleAlertIsDone}
                  onChanged={handleAlertIsChanged}
                  characterName={characterName}
                  messages={messages}
              />
          )}

          {isNavOpen &&
            <Pause
              onDone={handleMessageIsDone}
            />
          }
          
          <WalletMultiButton />
          <GameUserInfo/>
          <Gamepad/>

        </div>
      </>
  );
}


export default OldGameCanvas;
