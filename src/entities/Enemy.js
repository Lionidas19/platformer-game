
import Phaser from 'phaser';

import collidable from '../mixins/collidable';

class Enemy extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y, key)
    {
        super(scene, x, y, key);
        
        this.config = scene.config;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Mixins
        Object.assign(this, collidable);

        this.init();
        this.initEvents();
    }

    init()
    {
        this.gravity = 500;
        this.speed = 100;
        this.timeFromLastTurn = 0;
        this.maxPatrolDistance = 500;
        this.currentPatrolDistance = 0;

        this.health = 40;
        this.damage = 10;
        
        this.platformCollidersLayer = null
        this.rayGraphics = this.scene.add.graphics({lineStyle: {width: 2, color: 0xaa00aa}});

        this.body.setGravityY(this.gravity);
        this.setSize(20, 45);
        this.setOffset(6, 20)
        this.setCollideWorldBounds(true);
        this.setImmovable(true);
        this.setOrigin(0.5, 1);
        this.setVelocityX(this.speed);
    }

    initEvents()
    {
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    }

    update (time, delta)
    {
        this.patrol(time);
    }

    patrol (time, delta)
    {
        if (!this.body || !this.body.onFloor()) { return; }

        this.currentPatrolDistance += Math.abs(this.body.deltaX());

        const { ray, hasHit } = this.raycast(this.body, this.platformCollidersLayer, { precision: 1, steepness: 0.1});

        if ((!hasHit || this.currentPatrolDistance >= this.maxPatrolDistance) && this.timeFromLastTurn + 100 < time)
        {
            this.setFlipX(!this.flipX);
            this.setVelocityX(this.speed = -this.speed);
            this.timeFromLastTurn = time;
            this.currentPatrolDistance = 0;
        }

        if(this.config.debug && ray)
        {
            this.rayGraphics.clear();
            this.rayGraphics.strokeLineShape(ray);
        }
    }

    setPlatformColliders (platform_colliders)
    {
        this.platformCollidersLayer = platform_colliders;
    }

    takesHit(source)
    {
        this.health -= source.damage;

        source.setActive(false);
        source.setVisible(false);
        
        if (this.health <= 0)
        {
            console.log('Enemy is terminated');
        }
    }
}

export default Enemy;