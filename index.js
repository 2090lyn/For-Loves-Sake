const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d'); // c = context

canvas.width = 1280
canvas.height = 720

const collisionsMap = []
for (let i = 0; i < collisions.length; i+=53) {
    collisionsMap.push(collisions.slice(i, 53 + i));
}

const enterZonesMap = []
for (let i = 0; i < enterZonesData.length; i+=53) {
    enterZonesMap.push(enterZonesData.slice(i, 53 + i));
}


const boundaries = [];
const offset = {
    x: -1198,
    y: -40
}
collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025) { // ensure comparison works
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
        }
    })
});

const enterZones = [];

enterZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025) { // ensure comparison works
            enterZones.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
        }
    })
});

const img = new Image()
img.src = './img/main.png'

const foregroundImg = new Image()
foregroundImg.src = './img/foreground.png'

const playerDownImg = new Image()
playerDownImg.src = './img/playerDown.png'

const playerUpImg = new Image()
playerUpImg.src = './img/playerUp.png'

const playerLeftImg = new Image()
playerLeftImg.src = './img/playerLeft.png'

const playerRightImg = new Image()
playerRightImg.src = './img/playerRight.png'


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

const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y 
    },
    image: img
})

const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y 
    },
    image: foregroundImg
})

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

function animate() {
    window.requestAnimationFrame(animate);
    background.draw();
    boundaries.forEach(boundary => {
        boundary.draw(background.position);
    })

    enterZones.forEach(enterZone => {
        enterZone.draw();
    })

    player.draw();
    foreground.draw();

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
            if (keys.e.pressed) {
                console.log('Transitioning to new map!')
                keys.e.pressed =false;
            }
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