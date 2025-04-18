let player;
let bullets;
let enemies;
let score = 0;
let scoreText;
let lastFired = 0;

const BULLET_SPEED = 500;
const ENEMY_SPEED = 100;

class MyGame extends Phaser.Scene {
    constructor() {
        super();
    }

    preload() {
        this.load.image('player', 'assets/player.png');
        this.load.image('bullet', 'assets/blaster.png');
        this.load.image('enemy', 'assets/ufo.png');
        this.load.image('explosion', 'assets/explosion.png');
    }

    create() {
        // Player setup
        player = this.physics.add.image(400, 550, 'player').setCollideWorldBounds(true);

        // Bullet group
        bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 10
        });

        // Enemy group
        enemies = this.physics.add.group();
        this.spawnEnemy();

        // Score
        scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#ffffff' });

        // Collider
        this.physics.add.overlap(bullets, enemies, this.hitEnemy, null, this);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on('pointerdown', this.shoot, this);
    }

    update(time) {
        // Player movement
        if (this.cursors.left.isDown) {
            player.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            player.setVelocityX(200);
        } else {
            player.setVelocityX(0);
        }

        // Fire with space
        if (this.cursors.space.isDown && time > lastFired + 300) {
            this.shoot();
            lastFired = time;
        }

        // Enemies
        enemies.children.iterate((enemy) => {
            if (enemy && enemy.y > 600) {
                enemy.disableBody(true, true);
                this.spawnEnemy(); // Respawn if off screen
            }
        });
    }

    shoot() {
        const bullet = bullets.get(player.x, player.y - 20);

        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.body.velocity.y = -BULLET_SPEED;

            bullet.once('animationcomplete', () => {
                bullets.killAndHide(bullet);
            });
        }
    }

    spawnEnemy() {
        const x = Phaser.Math.Between(50, 750);
        const enemy = enemies.create(x, 0, 'enemy');
        enemy.setVelocityY(ENEMY_SPEED);
    }

    hitEnemy(bullet, enemy) {
        if (!bullet.active || !enemy.active) return;

        bullet.disableBody(true, true);
        enemy.disableBody(true, true);

        // Explosion
        const explosion = this.add.particles('explosion
