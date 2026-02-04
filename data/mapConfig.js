const maps = {
    overworld: {
        image: './img/main.png',
        foreground: './img/foreground.png',
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
                1025: { // to house
                    type: 'map',
                    targetMap: 'house',
                    spawnType: 'tile'
                }
            }
        }
    },
    house: {
        image: './img/house.png',
        foreground: './img/foregroundHouse.png',
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
                1542: { // toilet fart
                    type: 'sfx',
                    sfx: './audio/house-interact-a.wav'
                },
                1543: { // duck
                    type: 'sfx',
                    sfx: './audio/duck.mp3'
                },
                1544: { // to overworld
                    type: 'map',
                    targetMap: 'overworld',
                    spawnType: 'tile',
                    spawn: { x: 25, y: 17 }
                },
                1545: { // tp space
                    type: 'map',
                    targetMap: 'space',
                    spawnType: 'screen',
                    spawn: { x:0, y:0 }
                },
                1546: { // to ping pong
                    type: 'map',
                    targetMap: 'pingPong',
                    spawnType: 'screen',
                    spawn: { x:0, y:0 }
                }
            }
        }
    },
    space: {
        backgroundColor: '#000',
        foreground: null,
        spawnType: 'screen',
        spawn: { x: 610, y: 520 },
        collisions: { data: [], symbol: 1 },
        enterZones: { data: [], types: {} },
        bgm: './audio/arena.mp3'
    },
    pingPong: {
        mode: 'pong',
        backgroundColor: '#000',
        foreground: null,
        spawnType: 'screen',
        spawn: { x: 0, y: 0 },
        grid: {
            columns: 1,
            rows: 1,
            tileSize: { width: 1, height: 1 }
        },
        returnTo: {
            map: 'house',
            spawnType: 'tile',
            spawn: { x: 19, y: 20 }
        },
        collisions: { data: [], symbol: 1 },
        enterZones: { data: [], types: {} },
        bgm: './audio/arena.mp3'
    }
};
