const CANVAS = document.getElementById("gameScreen");
const HEALTH_INFO = document.getElementById("healthInfo");
const HEALTH_LEFT = document.getElementById("healthLeft");
const HEALTH_PTS = document.getElementById("healthPoints");
const SCORE_TAG = document.getElementById("scoreTag");
const SCORE = document.getElementById("scoreNum");
const POINTS = document.getElementById("points");
const START_GAME_UI = document.getElementById("startGameUI");
const START_GAME_BTN = document.getElementById("startGameBtn");
const CANV_HEIGHT = innerHeight;
const CANV_WIDTH = innerWidth;
const MIDDLE_X = CANV_WIDTH / 2;
const MIDDLE_Y = CANV_HEIGHT / 2;
const CTX = CANVAS.getContext("2d");
const PLAYER_HEALTH = 100;
const ENEMY_HEALTH = 100;
const PLAYER_RAD = 30;
const ENEMY_RAD = 30;
const BULLET_RAD = 5;
const BLOOD_RAD = 2;
const PLAYER_COL = "blue";
const ENEMY_COL = "green";
const BULLET_COL = "white";
const BLOOD_COL = "red";
const BULLET_DMG = 20;
const ENEMY_DMG = 5;
const PLAYER_SPD = 5;

CANVAS.width = CANV_WIDTH;
CANVAS.height = CANV_HEIGHT;

var animationId;
var score;
var mouseHold;
var cursorX;
var cursorY;
var enemyInterval;
var playerHitInterval;
var bulletInterval;
var endGameInterval;
var gameOver;

let PLAYER = new Player(MIDDLE_X, MIDDLE_Y, PLAYER_HEALTH, PLAYER_RAD, PLAYER_COL, {x:0,y:0});;
let BULLETS = [];
let ENEMIES = [];
let BLOOD = [];
let KEYS = [];

function init() {
    HEALTH_LEFT.style.width = "25%";
    HEALTH_PTS.innerHTML = "100 HP";
    PLAYER = new Player(MIDDLE_X, MIDDLE_Y, PLAYER_HEALTH, PLAYER_RAD, PLAYER_COL, {x:0,y:0});
    BULLETS = [];
    ENEMIES = [];
    BLOOD = [];
    KEYS = [];
    score = 0;
    SCORE.innerHTML = score;
    POINTS.innerHTML = score;
    mouseHold = false;
    gameOver = false;
}

function animate() {
    animationId = requestAnimationFrame(animate);
    CTX.clearRect(0, 0, CANV_WIDTH, CANV_HEIGHT);
    PLAYER.updatePlayer();
    console.log(PLAYER.health);

    if ((PLAYER.y - PLAYER.radius <= 0 && PLAYER.velocity.y != PLAYER_SPD) || (PLAYER.y + PLAYER.radius >= CANVAS.height && PLAYER.velocity.y != -PLAYER_SPD)) PLAYER.velocity.y = 0;
    if ((PLAYER.x - PLAYER.radius <= 0 && PLAYER.velocity.x != PLAYER_SPD) || (PLAYER.x + PLAYER.radius >= CANVAS.width && PLAYER.velocity.x != -PLAYER_SPD)) PLAYER.velocity.x = 0;

    BLOOD.forEach((blood, bloodIndex) => {
        if (blood.alpha <= 0) {
            BLOOD.splice(bloodIndex, 1);
        }
        else {
            blood.updateBlood();
        }
    });
    BULLETS.forEach((bullet, bulletIndex) => {
        bullet.updateBullet();

        if (bullet.x + bullet.radius < 0 || bullet.x - bullet.radius > CANVAS.width ||
            bullet.y + bullet.radius < 0 || bullet.y - bullet.radius > CANVAS.height) { 
            setTimeout(() => {
                BULLETS.splice(bulletIndex, 1);
            }, 0);
        }
    });
    ENEMIES.forEach((enemy, enemyIndex) => { 
        enemy.updateEnemy();
        angle = Math.atan2(PLAYER.y - enemy.y, PLAYER.x - enemy.x);                            
        enemy.velocity.x = Math.cos(angle);
        enemy.velocity.y = Math.sin(angle);
       
        BULLETS.forEach((bullet, bulletIndex) => {
            let enemBullDist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);

            if (enemBullDist - ENEMY_RAD - BULLET_RAD + 5 < 0.00001) {
                let velocity;

                score += bullet.damage;
                SCORE.innerHTML = score;

                enemy.updateHealth(bullet.damage);
                for (let i = 0; i < enemy.radius * 2; i++) {
                    let x;
                    let y;

                    if (bullet.x - enemy.x == 0) x = (Math.random() - 0.5) * 1.5;
                    else x = ((bullet.x - enemy.x) / Math.abs(bullet.x - enemy.x)) * (Math.random() * 1.5);
                    if (bullet.y - enemy.y == 0) y = (Math.random() - 0.5) * 1.5;
                    else y = ((bullet.y - enemy.y) / Math.abs(bullet.y - enemy.y)) * (Math.random() * 1.5);
                    velocity = {x: x, y: y};
                   
                    BLOOD.push(new Blood(bullet.x + x*12, bullet.y + y*12, BLOOD_COL, velocity, BLOOD_RAD, 1));
                }
                setTimeout(() => {  // to prevent flashes when enemy dissappear
                    BULLETS.splice(bulletIndex, 1);
                    if (enemy.health <= 0) {
                        for (let i = 0; i < enemy.radius * 3; i++) {
                            let x = (Math.random() - 0.5) * 2;
                            let y = (Math.random() - 0.5) * 2;        
                            velocity = {x: x, y: y};
                            BLOOD.push(new Blood(enemy.x + x*20, enemy.y + y*20, BLOOD_COL, velocity, BLOOD_RAD * 2, 1));
                        }
                        ENEMIES.splice(enemyIndex, 1);
                    }
                }, 0);
            }
        });
    });

}

function spawnEnemies() {
    enemyInterval = setInterval(() => {
        console.log("enemy")
        var angle;
        var velocity;
        let x = Math.random() < 0.5 ? -ENEMY_RAD : CANVAS.width + ENEMY_RAD;    // spawn from left : spawn from right
        let y = Math.random() < 0.5 ? -ENEMY_RAD : CANVAS.height + ENEMY_RAD;   // spawn from top : spawn from bottom

        if (Math.random() < 0.5) y = Math.random() * CANVAS.height;      // reassign y so it spawns somewhere on y axis
        else x = Math.random() * CANVAS.width;                     // reassign x so it spawns somewhere on x axis
        angle = Math.atan2(PLAYER.y - y, PLAYER.x - x);                              
        velocity = {x: Math.cos(angle), y: Math.sin(angle)};                          

        
        ENEMIES.push(new Enemy(x, y, ENEMY_HEALTH, ENEMY_RAD, ENEMY_COL, velocity, ENEMY_DMG));
    }, 1000);
}

function playerHit() {
    playerHitInterval = setInterval(() => {
        ENEMIES.forEach(enemy => {
            let playEnemDist = Math.hypot(PLAYER.x - enemy.x, PLAYER.y - enemy.y);

            if (playEnemDist - ENEMY_RAD - PLAYER_RAD < 0.00001) {
                PLAYER.updateHealth(enemy.damage);
                enemy.x -= enemy.velocity.x;
                enemy.y -= enemy.velocity.y;
                HEALTH_LEFT.style.width = PLAYER.health * 0.25 + '%';
                if (PLAYER.health < 0) HEALTH_PTS.innerHTML = "0 HP";
                else HEALTH_PTS.innerHTML = PLAYER.health + " HP";
                if (PLAYER.health <= 0) {
                    cancelAnimationFrame(animationId);
                    gameOver = true;
                    POINTS.innerHTML = score;
                    START_GAME_UI.style.display = "flex";
                }
            }
        });
    }, 500);
}

function shootBullets() {
    bulletInterval = setInterval(() => {
        if (mouseHold) {
            console.log(cursorX, cursorY, PLAYER.x, PLAYER.y);
            var angle = Math.atan2(cursorY - PLAYER.y, cursorX - PLAYER.x);       
            console.log("angle: " + angle);   
            var cosAng = Math.cos(angle);
            console.log("cosAng: " + cosAng);
            var sinAng = Math.sin(angle);
            console.log("sinAng: " + sinAng);
            var velocity = {x: cosAng * 20, y: sinAng * 20};     
            console.log("Vel: " + velocity.x + " " + velocity.y);                       
               
            BULLETS.push(new Bullet(PLAYER.x + PLAYER.radius * cosAng, PLAYER.y + PLAYER.radius * sinAng, BULLET_COL, velocity, BULLET_DMG, BULLET_RAD));   
        }
    }, 200);
}

function endGame() {
    endGameInterval = setInterval(() => {
        if (gameOver) {
            clearInterval(enemyInterval);
            clearInterval(playerHitInterval);
            clearInterval(bulletInterval);
            clearInterval(endGameInterval);
            START_GAME_BTN.innerHTML = "RESTART GAME";
            console.log(enemyInterval, playerHitInterval, bulletInterval, endGameInterval);
        }
    }, 1000);
}

addEventListener("mousedown", () => {
    mouseHold = true;
});

addEventListener("mouseup", () => {
    mouseHold = false;
});

addEventListener("mousemove", (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
});

addEventListener("keydown", (event) => {
    switch (event.code) {
        case "KeyW":
            if (PLAYER.y - PLAYER.radius > 0) {
                PLAYER.velocity.y = -PLAYER_SPD;
                /*window.scrollBy({
                    top: -40,
                    left: 0,
                    behavior: "smooth"
                });*/ 
            }
            break;           
        case "KeyA":
            if (PLAYER.x - PLAYER.radius > 0) {
                PLAYER.velocity.x = -PLAYER_SPD;
                /*window.scrollBy({
                    top: 0,
                    left: -40,
                    behavior: "smooth"
                });*/
            }
            break;
        case "KeyS":
            if (PLAYER.y + PLAYER.radius < CANVAS.height) {
                PLAYER.velocity.y = PLAYER_SPD;
                /*window.scrollBy({
                    top: 40,
                    left: 0,
                    behavior: "smooth"
                }); */
            }
            break;
        case "KeyD":
            if (PLAYER.x + PLAYER.radius < CANVAS.width) {
                PLAYER.velocity.x = PLAYER_SPD;
                /*window.scrollBy({
                    top: 0,
                    left: 40,
                    behavior: "smooth"
                }); */
            }
            break;
        default:
            break;
    }
});

addEventListener("keyup", (event) => {
    switch (event.code) {
        case "KeyW":
            if (PLAYER.velocity.y == -PLAYER_SPD) PLAYER.velocity.y = 0;
            break;           
        case "KeyA":
            if (PLAYER.velocity.x == -PLAYER_SPD) PLAYER.velocity.x = 0;
            break;
        case "KeyS":
            if (PLAYER.velocity.y == PLAYER_SPD) PLAYER.velocity.y = 0;
            break;
        case "KeyD":
            if (PLAYER.velocity.x == PLAYER_SPD) PLAYER.velocity.x = 0;
            break;
        default:
            break;
    }
});

START_GAME_BTN.addEventListener("click", () => {
    init();
    animate();
    spawnEnemies();
    shootBullets();
    playerHit();
    endGame();

    START_GAME_UI.style.display = "none";
    SCORE_TAG.style.display = "block";
    HEALTH_INFO.style.display = "block";
});
