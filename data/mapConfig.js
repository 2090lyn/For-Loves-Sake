const maps = {
    overworld: {
        image: './img/main.png',
        foreground: './img/foreground.png',
        foregroundAbovePlayer: true,
        spawnType: 'world',
        spawn: { x: 1814, y: 366 },
        viewOffset: { x: 0, y: 0 },
        bgm: './audio/overworld.mp3',
        grid: {
            columns: 53,
            rows: 40,
            imageSize: { width: 2862, height: 2160 },
            tileSize: { width: 54, height: 54 },
            offset: { x: -1198, y: -40 }
        },
        collisions: { data: collisions, symbol: 1025 },
        enterZones: {
            data: enterZonesData,
            symbol: 1025,
            types: {
                1025: {
                    type: 'map',
                    targetMap: 'house',
                    spawnType: 'tile',
                    spawn: { x: 15, y: 14 }
                }
            }
        }
    },
    house: {
        image: './img/house.png',
        foreground: './img/foregroundHouse.png',
        foregroundAbovePlayer: true,
        spawnType: 'tile',
        spawn: { x: 13.5, y: 20 },
        viewOffset: { x: 0, y: 0 },
        bgm: './audio/house.mp3',
        grid: {
            columns: 34,
            rows: 25,
            imageSize: { width: 1632, height: 1200 },
            tileSize: { width: 16, height: 16 },
            scale: 3,
            offset: { x: 248, y: 72 }
        },
        collisions: { data: houseCollisions, symbol: 1544 },
        enterZones: {
            data: houseEnterZonesData,
            symbol: 1544,
            types: {
                1544: {
                    type: 'map',
                    targetMap: 'overworld',
                    spawnType: 'tile',
                    spawn: { x: 25, y: 17 }
                }
            }
        }
    }
};
