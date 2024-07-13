class Character {
    constructor(x, y, health, radius, colour, velocity) {
        this.x = x;
        this.y = y;
        this.health = health;
        this.radius = radius;
        this.colour = colour;
        this.velocity = velocity;
    }

    drawCharacter() {   // all characters (player and enemies) will be circle
        CTX.beginPath();
        CTX.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        CTX.fillStyle = this.colour;
        CTX.fill();
    }

    updateCharacter() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }

    updateHealth(damage) {
        this.health -= damage;
    }
}

class Player extends Character {
    constructor(x, y, health, radius, colour, velocity) {
        super(x, y, health, radius, colour, velocity);
    }

    drawPlayer() {
        this.drawCharacter();
    }

    updatePlayer() {
        this.drawPlayer();
        this.updateCharacter();
    }
}

class Enemy extends Character {
    constructor(x, y, health, radius, colour, velocity, damage) {
        super(x, y, health, radius, colour, velocity);
        this.damage = damage;
    }

    drawEnemy() {
        this.drawCharacter();
    }

    updateEnemy() {
        this.drawEnemy();
        this.updateCharacter();
    }
}
