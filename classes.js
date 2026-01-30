class Boundary {
    static width = 54;
    static height = 53;
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
    constructor({ position, velocity, image, frames = { max: 1 }}) {
        this.position = position
        this.img = image
        this.frames = frames
        
        this.img.onload = () => {
            this.width = this.img.width / this.frames.max
            this.height = this.img.height
        }
    }
    draw() {
        // draws character
        c.drawImage(
            this.img, 
            // crop of character
            0, // crop x start
            0, // crop y start
            this.img.width / this.frames.max, // crop width
            this.img.height, // crop height
            this.position.x, // location of character
            this.position.y,
            // location of character
            this.img.width / this.frames.max, // crop width
            this.img.height, // crop height
        )
    }
}