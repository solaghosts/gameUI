
//To load any map in any game scene
export const handleCreateMap = (scene) => {
    //Receive the data from the previous scene in the next scene
    const { mapKey } = scene.initData;
    const map = scene.make.tilemap({ key: mapKey });
    //create the representation image of each tileset json for that tilemap in the canvas
    var maptilesets = [];
    for (let i = 0; i < map.tilesets.length; i++){
        const mapTileset = map.addTilesetImage(map.tilesets[i].name);
        maptilesets.push(mapTileset)
    }

    // eslint-disable-next-line no-param-reassign
    //To use the scene.map variable in the functions above.
    return scene.map = map;

};

//This function read and add the data of each layer in the json, using the tilesets with the img of the tiles as reference. 
export const handleCreateLayers = (scene) => {

    scene.elementsLayers = scene.add.group();
    for (let i = 0; i < scene.map.layers.length; i++) {
        //Changed it because you need to create a layer for each tileset that you want to set in the game
        scene.layer = scene.map.createLayer(scene.map.layers[i].name, scene.map.tilesets, 0, 0);
        scene.elementsLayers.add(scene.layer);
    }
};

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
