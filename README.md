Solaghosts Game UI

## Phaser 3 + React 17 Top-Down game + Solana Wallet Adapter React + Anchor

Set of actions to interact with the game UI and the player's wallet on the Solana Blockchain.

## New Game
Read the user's wallet
Check if there are any playable character, solaghost, boo token or lair. 
If there are any of them there, create a unique vault for that user on the Solana blockchain. 
Ask the user for permission to deposit their assets there.
Create a save data file and deposit it in the user's vault

## Load Game
Check if the user already has a game vault.
If there is a vault, check the save data file and read the data from there

##Run Game
Select the playable character from the user's vault. (Playable characters are NFTs. The spritesheet of each character (img & json) is in an offchain uri within the Metaplex standard offchain uri). 
Read the save file data to place the character in the corresponding location, with the corresponding missions and objectives in progress or completed.
Start game. 

##Playable Characters
Character's attributes will be onchain (as PDA seeds). These attributes will be modified according to certain factors such as upgrade stats, equip stuff, and so on.
Characters will have HP, MP, Attack, Defense, Speed and Luck. Characters will have a slot to equip head, chest, foot, hand, and accessory items. Those slots will increment the stats of the character AKA PDA seeds. 
Those items will be NFTs as well (semifungible according to the Metaplex standard) and will need to be stored in the user vault in order to be used as interactive objects inside the game. 

##Battle System
Battle will be turn based just like old and classic rpgs games in a one to one battle or up to three enemies. 
Enemies will be displayed on the regular field and, if character and enemy collide, will provoke and enter a new battle. 
Ghosts equipped will add special attacks to each playable character that will do more or less damage according to different parameters/enemies.Or increase the chance of receiving items
After each battle, there is a chance that enemies will drop an item that will have an effect on the character, such as increasing their health level, their attack level, an asset for their lairs, etc.

##Lairs
Each player can have its own lair. This will be an NFT, whose data will be displayed as an additional json within the offchain metadata json.
In lairs, players will be able to put their ghosts to rest and receive tokens in compensation for it. (betting system)
Players will be able to modify the appearance of their lairs. Modify its size, add different elements, etc. Some assets will be just decorative, but others will influence the NFT's staking ability.

##Missions and Rewards

##Staking



