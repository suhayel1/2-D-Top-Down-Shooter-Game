class movingObj {  // not all projectiles are same shape
    constructor(x, y, colour, velocity) {
        this.x = x;
        this.y = y;
        this.colour = colour;
        this.velocity = velocity;
    }

    drawObj() {
        CTX.beginPath();
        this.shapeOption();
        CTX.fillStyle = this.colour;
        CTX.fill();
    }

    updateObj() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }

    shapeOption() {}
}

class Projectile extends movingObj {
    constructor(x, y, colour, velocity, damage) {
        super(x, y, colour, velocity);
        this.damage = damage;
    }

    drawProjectile() {
        this.drawObj();
    }

    updateProjectile() {
        this.updateObj();
    }

    shapeOption() {
        this.shapeOption();
    }
}

class Particle extends movingObj {
    constructor(x, y, colour, velocity) {
        super(x, y, colour, velocity);
    }

    drawParticle() {
        this.drawObj();
    }

    updateParticle() {
        this.updateObj();
    }

    shapeOption() {
        this.shapeOption();
    }
}

class Blood extends Particle {
    constructor(x, y, colour, velocity, radius, alpha) {
        super(x, y, colour, velocity);
        this.radius = radius;
        this.alpha = alpha;
    }

    drawBlood() {
        CTX.save();
        CTX.globalAlpha = this.alpha;
        this.drawParticle();
        CTX.restore();
    }

    updateBlood() {
        this.drawBlood();
        this.velocity.x *= 0.99;    //friction applied
        this.velocity.y *= 0.99;
        this.updateParticle();
        this.alpha -= 0.025;
    }

    shapeOption() {
        CTX.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
    }
}

class Bullet extends Projectile {
    constructor(x, y, colour, velocity, damage, radius) {
        super(x, y, colour, velocity, damage);
        this.radius = radius;
    }

    drawBullet() {
        this.drawProjectile();
    }

    updateBullet() {
        this.drawBullet();
        this.updateProjectile();
    }

    shapeOption() {
        CTX.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
    }
}
