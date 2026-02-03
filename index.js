const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d'); // c = context

let currentMap = 'overworld';
let enterInitiated = false;

// batte activation 
// gsap.to('#fade', {
//     opacity: 1,
//     repeat: 3,
//     duration: .4,
//     yoyo: true
// })

canvas.width = 1280
canvas.height = 720

// // ----------- Collisions + Enter Zones -----------
// // main map
// const collisionsMap = []
// for (let i = 0; i < collisions.length; i+=53) {
//     collisionsMap.push(collisions.slice(i, 53 + i));
// }

// const enterZonesMap = []
// for (let i = 0; i < enterZonesData.length; i+=53) {
//     enterZonesMap.push(enterZonesData.slice(i, 53 + i));
// }

const boundaries = [];
const enterZones = [];

// const boundaries = [];
const offset = {
    x: -1198,
    y: -40
}
// collisionsMap.forEach((row, i) => {
//     row.forEach((symbol, j) => {
//         if (symbol === 1025) { // ensure comparison works
//             boundaries.push(
//                 new Boundary({
//                     position: {
//                         x: j * Boundary.width + offset.x,
//                         y: i * Boundary.height + offset.y
//                     }
//                 })
//             )
//         }
//     })
// });

// const enterZones = [];

// enterZonesMap.forEach((row, i) => {
//     row.forEach((symbol, j) => {
//         if (symbol === 1025) { // ensure comparison works
//             enterZones.push(
//                 new Boundary({
//                     position: {
//                         x: j * Boundary.width + offset.x,
//                         y: i * Boundary.height + offset.y
//                     }
//                 })
//             )
//         }
//     })
// });



// ----------- Images + Sprites -----------
// main map
let background = new Sprite({
    position: { x: -1198, y: -40 },
    image: new Image()
});

let foreground = new Sprite({
    position: { x: -1198, y: -40 },
    image: new Image()
});

background.img.src = './img/main.png';
foreground.img.src = './img/foreground.png';




// // house map
// const imgHouse = new Image(); imgHouse.src = './img/house.png'

// player
const playerDownImg = new Image(); playerDownImg.src = './img/playerDown.png'
const playerUpImg = new Image(); playerUpImg.src = './img/playerUp.png'
const playerLeftImg = new Image(); playerLeftImg.src = './img/playerLeft.png'
const playerRightImg = new Image(); playerRightImg.src = './img/playerRight.png'

const player = new Sprite ({
    position: {
        // check in files for the dimensions of char (eg 192x58)
        x: canvas.width / 2 - (192 / 4) / 2,
        y: canvas.height / 2 - 68 / 2,
    },
    image: playerDownImg,
    frames: {
        max: 4
    },
    sprites: {
        up: playerUpImg,
        left: playerLeftImg,
        right: playerRightImg,
        down: playerDownImg
    }
})

// ----------------------------------------------

const keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false },
    e: { pressed: false }
}

// const dungeonDoorImg = new Image()
// dungeonDoorImg.src = './img/dungeonDoor.png'

// const doors = [
//     new Sprite({
//         position: {
//             x: canvas.width / 2,
//             y: canvas.height / 2
//         },
//         image: dungeonDoorImg,
//         frameRate: 10
//     })
// ]

// dungeonDoorImg.onload = () => {
//     doors.width = dungeonDoorImg.width;
//     doors.height = dungeonDoorImg.height;
// }
// doors.moving = true;

const movables = [background, ...boundaries, foreground, ...enterZones];
function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
        rectangle1.position.x + rectangle1.width >=  rectangle2.position.x && 
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y
    )
}

// function switchtoHouseMap() {
//     console.log('switched to house map');
//     currentMap = 'house';
//     background.img = imgHouse;
//     background.position = {
//         x: 0,
//         y: 0
//     }
//     foreground.img = null;
//     boundaries.length = 0;
// }

function loadBoundaries(data, columns, symbol, offset, targetArray, gridOffset = { x: 0, y: 0 }) {
    // Convert 1D array to 2D map
    const map2D = [];
    for (let i = 0; i < data.length; i += columns) {
        map2D.push(data.slice(i, columns + i));
    }

    // Iterate over each tile
    map2D.forEach((row, i) => {
        row.forEach((tileSymbol, j) => {
            if (tileSymbol === symbol) {
                targetArray.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width + offset.x + gridOffset.x,
                            y: i * Boundary.height + offset.y + gridOffset.y
                        }
                    })
                );
            }
        });
    });
}


function setSpriteImage(sprite, src) {
    if (!src) return;
    const nextImage = new Image();
    nextImage.onload = () => {
        sprite.img = nextImage;
        sprite.width = nextImage.width / sprite.frames.max;
        sprite.height = nextImage.height;
    };
    nextImage.src = src;
}

function loadMap(mapName) {
    const mapConfig = maps[mapName];
    if (!mapConfig) return console.error(`Map "${mapName}" not found!`);

    currentMap = mapName;
    enterInitiated = true;

    const grid = mapConfig.grid || {};
    const collisionsData = mapConfig.collisions?.data ?? mapConfig.collisions ?? [];
    const enterZonesData = mapConfig.enterZones?.data ?? mapConfig.enterZones ?? [];
    const collisionSymbol = mapConfig.collisions?.symbol ?? mapConfig.collisionSymbol;
    const enterZoneSymbol = mapConfig.enterZones?.symbol ?? mapConfig.enterZoneSymbol;
    const columns = grid.columns ?? mapConfig.columns;
    const rows = grid.rows ?? (columns ? (collisionsData.length / columns) : 0);
    const tileWidth = grid.tileSize?.width ?? mapConfig.tileSize?.width ?? (grid.imageSize && rows ? (grid.imageSize.width / columns) : Boundary.width);
    const tileHeight = grid.tileSize?.height ?? mapConfig.tileSize?.height ?? (grid.imageSize && rows ? (grid.imageSize.height / rows) : Boundary.height);
    Boundary.width = tileWidth;
    Boundary.height = tileHeight;

    const playerWidth = player.width ?? (192 / 4);
    const playerHeight = player.height ?? 68;
    const centeredPlayer = {
        x: canvas.width / 2 - playerWidth / 2,
        y: canvas.height / 2 - playerHeight / 2
    };

    const viewOffset = mapConfig.viewOffset || { x: 0, y: 0 };
    let offset = { x: 0, y: 0 };
    const gridOffset = mapConfig.gridOffset ?? (grid.imageSize && rows
        ? {
            x: (grid.imageSize.width - (tileWidth * columns)) / 2,
            y: (grid.imageSize.height - (tileHeight * rows)) / 2
        }
        : { x: 0, y: 0 });
    const spawnType = mapConfig.spawnType || 'screen';
    if (mapConfig.spawn) {
        if (spawnType === 'screen') {
            player.position.x = mapConfig.spawn.x;
            player.position.y = mapConfig.spawn.y;
            offset = { ...(grid.offset || mapConfig.offset || { x: 0, y: 0 }) };
        } else {
            const spawnWorld = (spawnType === 'tile')
                ? { x: mapConfig.spawn.x * tileWidth, y: mapConfig.spawn.y * tileHeight }
                : { x: mapConfig.spawn.x, y: mapConfig.spawn.y };
            offset = {
                x: centeredPlayer.x - spawnWorld.x,
                y: centeredPlayer.y - spawnWorld.y
            };
            player.position.x = centeredPlayer.x;
            player.position.y = centeredPlayer.y;
        }
    } else {
        player.position.x = centeredPlayer.x;
        player.position.y = centeredPlayer.y;
        offset = { ...(grid.offset || mapConfig.offset || { x: 0, y: 0 }) };
    }
    offset = {
        x: offset.x + viewOffset.x,
        y: offset.y + viewOffset.y
    };

    // swap images
    setSpriteImage(background, mapConfig.image);
    background.position = { ...offset };

    setSpriteImage(foreground, mapConfig.foreground);
    foreground.position = { ...offset };

    // reset arrays
    boundaries.length = 0;
    enterZones.length = 0;

    // reload collisions
    loadBoundaries(
        collisionsData,
        columns,
        collisionSymbol,
        offset,
        boundaries,
        gridOffset
    );

    // reload enter zones
    loadBoundaries(
        enterZonesData,
        columns,
        enterZoneSymbol,
        offset,
        enterZones,
        gridOffset
    );

    // rebuild movables
    movables.length = 0;
    movables.push(background, ...boundaries, foreground, ...enterZones);

    enterInitiated = false;
}

function animate() {
    const animationId = window.requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);
    const mapConfig = maps[currentMap];
    const foregroundAbovePlayer = mapConfig?.foregroundAbovePlayer !== false;
    background.draw();
    if (!foregroundAbovePlayer) {
        foreground.draw();
    }
    player.draw();
    if (foregroundAbovePlayer) {
        foreground.draw();
    }

    // draw boundaries/zones last so they stay visible
    boundaries.forEach(boundary => {
        boundary.draw(background.position);
    });

    enterZones.forEach(enterZone => {
        enterZone.draw();
    });

    // doors.forEach(door => {
    //     door.draw();
    // })

    // enter zone detection
    let isOnEnterZone = false;
    for (let i = 0; i < enterZones.length; i++) {
        const zone = enterZones[i];
        if (rectangularCollision({
            rectangle1: player,
            rectangle2: zone
        })) {
            isOnEnterZone = true;
            if (keys.e.pressed && !enterInitiated) {
                console.log('Transitioning to new map!');
                enterInitiated = true;
                keys.e.pressed =false;

                const nextMap = currentMap === 'overworld' ? 'house' : 'overworld';
                gsap.to('#fade', {
                    opacity: 1,
                    duration: 0.8,
                    onComplete() {
                        loadMap(nextMap);
                        gsap.to('#fade', {
                            opacity: 0,
                            duration: 0.8,
                            delay: 0.5,
                        })
                    }
                })
            }
            keys.e.pressed =false;
            break;
        }
    }
    // E to interact w/ enter zone
    if (isOnEnterZone) {
        // E key icon
        c.fillStyle = 'white';
        c.fillRect(canvas.width / 2 - 60, canvas.height - 85, 25, 25);
        c.fillStyle = '#2c3e50';
        c.font = 'bold 16px monospace';
        c.textAlign = 'center';
        c.fillText('E', canvas.width / 2 - 47.5, canvas.height - 65);
        
        // Text
        c.fillStyle = 'white';
        c.font = '16px monospace';
        c.fillText('interact', canvas.width / 2 + 10, canvas.height - 70);
    }

let moving = true;
player.moving = false;

    if (enterInitiated) {
        return;
    }


// Moves character + collision detection
    if (keys.w.pressed) {
        player.moving = true;
        player.img = player.sprites.up;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (rectangularCollision({
                rectangle1: player, 
                rectangle2: {...boundary, 
                    position: {
                        x: boundary.position.x,
                        y: boundary.position.y + 3
                    }
                }   
            })) {
                moving = false;
                break;
            }
        }
        if (moving) {
            movables.forEach((movable) => {
                movable.position.y += 3
            }) 
        } // moves character
    } if (keys.s.pressed) {
        player.moving = true;
        player.img = player.sprites.down;
        for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (rectangularCollision({
            rectangle1: player, 
            rectangle2: {...boundary, 
                position: {
                    x: boundary.position.x,
                    y: boundary.position.y - 3
                }
            }   
        })) {
                moving = false;
                break;
            }
        }
        if (moving) {movables.forEach(movable => {
                movable.position.y -= 3;
            })
        }
    } if (keys.a.pressed) {
        player.moving = true;
        player.img = player.sprites.left;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (rectangularCollision({
                rectangle1: player, 
                rectangle2: {...boundary, 
                    position: {
                        x: boundary.position.x + 3,
                        y: boundary.position.y
                    }
                }   
            })) {
                moving = false;
                break;
            }
        }
        if (moving) {
            movables.forEach(movable => {
                movable.position.x += 3;
            })
        }
    } if (keys.d.pressed) {
        player.moving = true;   
        player.img = player.sprites.right;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (rectangularCollision({
                rectangle1: player, 
                rectangle2: {...boundary, 
                    position: {
                        x: boundary.position.x - 3,
                        y: boundary.position.y
                    }
                }   
            })) {
                moving = false;
                break;
            }
        }
        if (moving) {
            movables.forEach(movable => {
                movable.position.x -= 3;
            })
        }
    }
    
}

animate();
loadMap('overworld');

let lastKey = '';
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break;
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break;
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break;
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break;
        case 'e':
            keys.e.pressed = true
            lastKey = 'e'
            break;
    }
})

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 's':
            keys.s.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
        case 'e':
            keys.e.pressed = false;
            break;
    }
})
