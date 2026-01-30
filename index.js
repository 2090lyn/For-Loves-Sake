const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d'); // c = context

canvas.width = 1280
canvas.height = 720

const collisionsMap = []
for (let i = 0; i < collisions.length; i+=53) {
    collisionsMap.push(collisions.slice(i, 53 + i));
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

const img = new Image()
img.src = './img/main.png'
console.log(img);

const playerImg = new Image()
playerImg.src = './img/playerDown.png'


const player = new Sprite ({
    position: {
        // check in files for the dimensions of char (eg 192x58)
        x: canvas.width / 2 - (192 / 4) / 2,
        y: canvas.height / 2 - 68 / 2,
    },
    image: playerImg,
    frames: {
        max: 4
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
    image: img
})

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false 
    },
    s: {
        pressed: false 
    },
    d: {
        pressed: false 
    }
}

const movables = [background, ...boundaries];
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
    player.draw();
let moving = true;

// Moves character + collision detection
    if (keys.w.pressed) {
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
    }
})