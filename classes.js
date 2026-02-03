class Boundary {
    static width = 54;
    static height = 54;
    constructor({ position }) {
        this.position = position
        this.width = Boundary.width
        this.height = Boundary.height
    }
    draw() {
        c.fillStyle = 'rgba(255, 0, 0, 0)';
        c.fillRect(
            this.position.x,
            this.position.y,
            this.width,
            this.height
        )
    }
}

class Sprite {
    constructor({ position, velocity, image, frames = { max: 1 }, sprites}) {
        this.position = position
        this.img = image
        this.frames = {...frames, val: 0, elapsed: 0}
        this.sprites = sprites

        this.img.onload = () => {
            this.width = this.img.width / this.frames.max
            this.height = this.img.height
        }
        this.moving = false;
    }
    draw() {
        // draws character
        c.drawImage(
            this.img, 
            // crop of character
            this.frames.val * this.img.width / this.frames.max, // crop x start
            0, // crop y start
            this.img.width / this.frames.max, // crop width
            this.img.height, // crop height
            this.position.x, // location of character
            this.position.y,
            // location of character
            this.img.width / this.frames.max, // crop width
            this.img.height, // crop height
        )
        if (!this.moving) return;

        if (this.frames.max > 1) {
            this.frames.elapsed++;
        }
        if (this.frames.elapsed % 10 === 0) {
            if (this.frames.val < this.frames.max - 1) this.frames.val++;
            else this.frames.val = 0;
        }
    }
}
