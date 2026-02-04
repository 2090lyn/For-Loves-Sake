const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d'); // c = context

let currentMap = 'overworld';
let enterInitiated = false;
let activeDialogue = '';
let dialogueUntil = 0;

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
const boundaries = [];
const enterZones = [];

const offset = {
    x: -1198,
    y: -40
}


// ----------- Images + Sprites -----------
// dynamic map changing
let background = new Sprite({
    position: { x: -1198, y: -40 },
    image: new Image()
});

let foreground = new Sprite({
    position: { x: -1198, y: -40 },
    image: new Image()
});

// default map - main
background.img.src = './img/main.png';
foreground.img.src = './img/foreground.png';


// player
const playerDownImg = new Image(); playerDownImg.src = './img/playerDown.png'
const playerUpImg = new Image(); playerUpImg.src = './img/playerUp.png'
const playerLeftImg = new Image(); playerLeftImg.src = './img/playerLeft.png'
const playerRightImg = new Image(); playerRightImg.src = './img/playerRight.png'

const player = new Sprite ({
    position: {
        // check in files for the dimensions of char (eg 192x68)
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

// bokbok
const bokbokImg = new Image(); bokbokImg.src = './img/bokbok.png'

const bokbok = new Sprite({
    position: { x: 0, y: 0 },
    image: bokbokImg,
});

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

const movables = [background, ...boundaries, bokbok, foreground, ...enterZones];
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

function loadEnterZones({ data, columns, offset, gridOffset = { x: 0, y: 0 }, zoneTypes, targetArray }) {
    if (!data || !zoneTypes) return;
    const map2D = [];
    for (let i = 0; i < data.length; i += columns) {
        map2D.push(data.slice(i, columns + i));
    }

    map2D.forEach((row, i) => {
        row.forEach((tileSymbol, j) => {
            const action = zoneTypes[tileSymbol];
            if (!action) return;
            const zone = new Boundary({
                position: {
                    x: j * Boundary.width + offset.x + gridOffset.x,
                    y: i * Boundary.height + offset.y + gridOffset.y
                }
            });
            zone.action = action;
            zone.symbol = tileSymbol;
            targetArray.push(zone);
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

function getPlayerHitboxDimensions() {
    const fullWidth = player.width || (192 / 4);
    const fullHeight = player.height || 68;
    const width = Math.round(fullWidth * 0.6);
    const height = Math.round(fullHeight * 0.35);
    const offsetX = Math.round((fullWidth - width) / 2);
    const offsetY = Math.round(fullHeight - height - 4);
    return { fullWidth, fullHeight, width, height, offsetX, offsetY };
}

function getPlayerHitbox() {
    const dims = getPlayerHitboxDimensions();
    return {
        position: {
            x: player.position.x + dims.offsetX,
            y: player.position.y + dims.offsetY
        },
        width: dims.width,
        height: dims.height
    };
}

function isRectClear(worldX, worldY, {
    data,
    columns,
    rows,
    symbol,
    tileWidth,
    tileHeight,
    hitboxWidth,
    hitboxHeight,
    hitboxOffsetX,
    hitboxOffsetY
}) {
    if (!data || symbol === undefined) return true;
    const hbX = worldX + hitboxOffsetX;
    const hbY = worldY + hitboxOffsetY;
    const left = Math.floor(hbX / tileWidth);
    const right = Math.floor((hbX + hitboxWidth - 1) / tileWidth);
    const top = Math.floor(hbY / tileHeight);
    const bottom = Math.floor((hbY + hitboxHeight - 1) / tileHeight);
    for (let y = top; y <= bottom; y++) {
        for (let x = left; x <= right; x++) {
            if (x < 0 || y < 0 || x >= columns || y >= rows) {
                return false;
            }
            if (data[y * columns + x] === symbol) {
                return false;
            }
        }
    }
    return true;
}

function findNearestOpenTile(startX, startY, config) {
    const { columns, rows, tileWidth, tileHeight } = config;
    if (isRectClear(startX * tileWidth, startY * tileHeight, config)) {
        return { x: startX, y: startY };
    }
    const maxRadius = Math.max(columns, rows);
    for (let r = 1; r <= maxRadius; r++) {
        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
                if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
                const x = startX + dx;
                const y = startY + dy;
                if (x < 0 || y < 0 || x >= columns || y >= rows) continue;
                if (isRectClear(x * tileWidth, y * tileHeight, config)) {
                    return { x, y };
                }
            }
        }
    }
    return { x: startX, y: startY };
}

function loadMap(mapName, options = {}) {
    const mapConfig = maps[mapName];
    if (!mapConfig) return console.error(`Map "${mapName}" not found!`);

    currentMap = mapName;
    enterInitiated = true;
    if (gameStarted) {
        playBgm(mapConfig.bgm);
    }

    const grid = mapConfig.grid || {};
    const collisionsData = mapConfig.collisions?.data ?? mapConfig.collisions ?? [];
    const enterZonesData = mapConfig.enterZones?.data ?? mapConfig.enterZones ?? [];
    const collisionSymbol = mapConfig.collisions?.symbol ?? mapConfig.collisionSymbol;
    const enterZoneSymbol = mapConfig.enterZones?.symbol ?? mapConfig.enterZoneSymbol;
    const columns = grid.columns ?? mapConfig.columns;
    const rows = grid.rows ?? (columns ? (collisionsData.length / columns) : 0);
    const baseTileWidth = grid.tileSize?.width ?? mapConfig.tileSize?.width ?? Boundary.width;
    const baseTileHeight = grid.tileSize?.height ?? mapConfig.tileSize?.height ?? Boundary.height;
    let tileWidth = baseTileWidth;
    let tileHeight = baseTileHeight;
    if (grid.scale) {
        tileWidth = baseTileWidth * grid.scale;
        tileHeight = baseTileHeight * grid.scale;
    } else if (grid.imageSize && rows) {
        tileWidth = grid.imageSize.width / columns;
        tileHeight = grid.imageSize.height / rows;
    }
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

    const spawnType = options.spawnType ?? mapConfig.spawnType ?? 'screen';
    const spawn = options.spawn ?? mapConfig.spawn;
    if (spawn) {
        if (spawnType === 'screen') {
            player.position.x = spawn.x;
            player.position.y = spawn.y;
            offset = { ...(grid.offset || mapConfig.offset || { x: 0, y: 0 }) };
        } else {
            let spawnWorld;
            if (spawnType === 'tile') {
                const maxX = Math.max(0, (columns ?? 1) - 1);
                const maxY = Math.max(0, (rows ?? 1) - 1);
                const clampedX = Math.max(0, Math.min(spawn.x, maxX));
                const clampedY = Math.max(0, Math.min(spawn.y, maxY));
                spawnWorld = { x: clampedX * tileWidth, y: clampedY * tileHeight };
            } else {
                spawnWorld = { x: spawn.x, y: spawn.y };
            }
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

    // bokbok's placement in overworld
    if (currentMap === 'overworld') {
        const bokbokTile = { x: 33, y: 4 };
        bokbok.position.x = bokbokTile.x * tileWidth + offset.x + gridOffset.x;
        bokbok.position.y = bokbokTile.y * tileHeight + offset.y + gridOffset.y;
    }

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
    const enterZoneTypes = mapConfig.enterZones?.types;
    if (enterZoneTypes) {
        loadEnterZones({
            data: enterZonesData,
            columns,
            offset,
            gridOffset,
            zoneTypes: enterZoneTypes,
            targetArray: enterZones
        });
    } else if (enterZoneSymbol !== undefined) {
        loadBoundaries(
            enterZonesData,
            columns,
            enterZoneSymbol,
            offset,
            enterZones,
            gridOffset
        );
    }
    // bokbok interaction
    if (currentMap === 'overworld') {
        const bokbokZone = new Boundary({
            position: { x: bokbok.position.x, y: bokbok.position.y }
        });
        if (bokbok.width && bokbok.height) {
            bokbokZone.width = bokbok.width;
            bokbokZone.height = bokbok.height;
        }
        bokbokZone.action = {
            type: 'dialogue',
            text: 'Bokbok: Bawk bawk! Prove your love! BAWK!'
        };
        enterZones.push(bokbokZone);
    }

    // rebuild movables
    movables.length = 0;
    if (currentMap === 'overworld') {
        movables.push(background, ...boundaries, bokbok, foreground, ...enterZones);
    } else {
        movables.push(background, ...boundaries, foreground, ...enterZones);
    }

    enterInitiated = false;
}


// Dialogue
function showDialogue(text, duration = 2000) {
    activeDialogue = text;
    dialogueUntil = performance.now() + duration;
}

function drawDialogue() {
    if (!activeDialogue) return;
    if (performance.now() > dialogueUntil) {
        activeDialogue = '';
        return;
    }
    const padding = 16;
    const boxWidth = canvas.width - 80;
    const boxHeight = 60;
    const x = 40;
    const y = canvas.height - boxHeight - 30;
    c.fillStyle = 'rgba(0, 0, 0, 0.7)';
    c.fillRect(x, y, boxWidth, boxHeight);
    c.strokeStyle = 'white';
    c.lineWidth = 2;
    c.strokeRect(x, y, boxWidth, boxHeight);
    c.fillStyle = 'white';
    c.font = '16px monospace';
    c.textAlign = 'left';
    c.fillText(activeDialogue, x + padding, y + 36);
}


// fade transition
function transitionToMap(targetMap, options = {}) {
    if (enterInitiated) return;
    enterInitiated = true;
    keys.e.pressed = false;
    gsap.to('#fade', {
        opacity: 1,
        duration: 0.8,
        onComplete() {
            loadMap(targetMap, options);
            gsap.to('#fade', {
                opacity: 0,
                duration: 0.8,
                delay: 0.5,
            });
        }
    });
}

function handleZoneInteraction(zone) {
    const action = zone.action;
    if (!action) {
        const nextMap = currentMap === 'overworld' ? 'house' : 'overworld';
        transitionToMap(nextMap);
        return;
    }
    if (action.type === 'map') {
        transitionToMap(action.targetMap, { spawn: action.spawn, spawnType: action.spawnType });
        return;
    }
    if (action.type === 'dialogue') {
        showDialogue(action.text || '...');
    }
}

function animate() {
    const animationId = window.requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);
    const mapConfig = maps[currentMap];
    const foregroundAbovePlayer = mapConfig?.foregroundAbovePlayer !== false;
    background.draw();
    if (currentMap === 'overworld') {
        bokbok.draw();
    }
    player.draw();
    foreground.draw();

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
    let activeZone = null;
    for (let i = 0; i < enterZones.length; i++) {
        const zone = enterZones[i];
        if (rectangularCollision({
            rectangle1: player,
            rectangle2: zone
        })) {
            isOnEnterZone = true;
            activeZone = zone;
            break;
        }
    }
    if (isOnEnterZone && keys.e.pressed && !enterInitiated && activeZone) {
        handleZoneInteraction(activeZone);
        keys.e.pressed = false;
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
    drawDialogue();

let moving = true;
player.moving = false;
let didMove = false;

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
            didMove = true;
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
            didMove = true;
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
            didMove = true;
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
            didMove = true;
        }
    }

    if (gameStarted && didMove) {
        const now = performance.now();
        if (now - lastStepTime >= stepIntervalMs) {
            playFootstep();
            lastStepTime = now;
        }
    }
    
}

const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const bgm = document.getElementById('bgm');
const footstepSfx = document.getElementById('footstepSfx');
const muteButton = document.getElementById('muteButton');
const volumeSlider = document.getElementById('volumeSlider');
let isMuted = false;
const DEFAULT_VOLUME = 0.5;
const MUSIC_MIX = 0.25; // music quieter than SFX
const SFX_MIX = 0.7;
let userVolume = DEFAULT_VOLUME;
let gameStarted = false;
let lastStepTime = 0;
const stepIntervalMs = 350;

function applyVolume() {
    if (!bgm) return;
    bgm.volume = Math.min(1, userVolume * MUSIC_MIX);
    bgm.muted = isMuted;
    if (muteButton) {
        muteButton.textContent = isMuted ? 'Unmute' : 'Mute';
    }
}

function playBgm(src) {
    if (!bgm || !src) return;
    if (bgm.dataset.src === src) return;

    const startTrack = () => {
        bgm.src = src;
        bgm.dataset.src = src;
        bgm.loop = true;
        applyVolume();
        bgm.play().catch(() => {});
    };

    if (bgm.paused || !bgm.dataset.src) {
        startTrack();
        return;
    }

    gsap.to(bgm, {
        volume: 0,
        duration: 0.4,
        onComplete: () => {
            startTrack();
            gsap.to(bgm, { volume: Math.min(1, userVolume * MUSIC_MIX), duration: 0.6 });
        }
    });
}

function playFootstep() {
    if (!footstepSfx || isMuted) return;
    const step = footstepSfx.cloneNode();
    step.volume = Math.min(1, userVolume * SFX_MIX);
    step.play().catch(() => {});
}

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    gsap.set('#fade', { opacity: 1 });
    gsap.to('#startScreen', {
        opacity: 0,
        duration: 0.6,
        onComplete: () => {
            startScreen.classList.add('hidden');
            startScreen.style.opacity = '';
        }
    });
    loadMap('overworld');
    animate();
    playBgm(maps.overworld?.bgm);
    gsap.to('#fade', { opacity: 0, duration: 1, delay: 0.1 });
}

startButton.addEventListener('click', startGame);

if (muteButton) {
    muteButton.addEventListener('click', () => {
        isMuted = !isMuted;
        applyVolume();
    });
}

if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
        userVolume = Number(e.target.value);
        applyVolume();
    });
}

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
