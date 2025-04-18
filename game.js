const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 720,
  backgroundColor: '#222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let bullets;
let enemies;
let lastFired = 0;
let score = 0;
let scoreText;
let gameOver = false;

function preload() {
  this.load.image('player', 'https://labs.phaser.io/assets/sprites/player.png');
  this.load.image('bullet', 'https://labs.phaser.io/assets/sprites/bullets/bullet11.png');
  this.load.image('enemy', 'https://labs.phaser.io/assets/sprites/ufo.png');
  this.load.image('explosion', 'https://labs.phaser.io/assets/particles/yellow.png');
}

function create() {
  player = this.physics.add.sprite(240, 650, 'player').setScale(0.5).setCollideWorldBounds(true);

  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 10
  });

  enemies = this.physics.add.group();

  this.time.addEvent({
    delay: 1000,
    callback: spawnEnemy,
    callbackScope: this,
    loop: true
  });

  scoreText = this.add.text(10, 10, 'Score: 0', { font: '20px Arial', fill: '#fff' });

  cursors = this.input.keyboard.createCursorKeys();

  // Touch control
  this.input.on('pointerdown', () => {
    shoot.call(this);
  });

  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);
  this.physics.add.collider(enemies, player, () => endGame.call(this), null, this);
}

function update(time, delta) {
  if (gameOver) return;

  if (cursors.left.isDown) {
    player.setVelocityX(-300);
  } else if (cursors.right.isDown) {
    player.setVelocityX(300);
  } else {
    player.setVelocityX(0);
  }

  if (cursors.space.isDown && time > lastFired) {
    shoot.call(this);
    lastFired = time + 400;
  }

  enemies.children.iterate((enemy) => {
    if (enemy && enemy.y > 720) {
      endGame.call(this);
    }
  });
}

function shoot() {
  const bullet = bullets.get(player.x, player.y - 20);
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.velocity.y = -400;
    bullet.setCollideWorldBounds(true);
    bullet.body.onWorldBounds = true;
    bullet.body.world.on('worldbounds', function(body) {
      if (body.gameObject === bullet) {
        bullet.disableBody(true, true);
      }
    });
  }
}

function spawnEnemy() {
  const x = Phaser.Math.Between(50, 430);
  const enemy = enemies.create(x, 0, 'enemy').setScale(0.6);
  enemy.setVelocityY(100);
}

function hitEnemy(bullet, enemy) {
  bullet.disableBody(true, true);
  enemy.disableBody(true, true);

  const explosion = this.add.particles('explosion').createEmitter({
    x: enemy.x,
    y: enemy.y,
    speed: { min: -100, max: 100 },
    scale: { start: 0.5, end: 0 },
    lifespan: 300,
    quantity: 10
  });

  this.time.delayedCall(300, () => explosion.stop());

  score += 10;
  scoreText.setText('Score: ' + score);
}

function endGame() {
  gameOver = true;
  this.add.text(120, 360, 'Game Over', { fontSize: '32px', fill: '#fff' });
}
