
import Phaser from 'phaser';
import Player from '../entities/Player';
import Enemies from '../groups/Enemies';
import Collectable from '../collectables/Collectable';
import Collectables from '../groups/Collectables';
import Hud from '../hud';
import EventEmitter from '../events/Emitter';

import initAnims from '../anims/index';

class Play extends Phaser.Scene
{

    constructor (config)
    {
        super('PlayScene');
        this.config = config;
    }

    create ({gameStatus})
    {
        this.score = 0;
        this.hud = new Hud(this, 0, 0);

        this.playBgMusic();

        const map = this.createMap();
        initAnims(this.anims);

        const layers = this.createLayers(map);
        const playerZones = this.getPlayerZones(layers.playerZones);
        const player = this.createPlayer(playerZones.start);
        const enemies = this.createEnemies(layers.enemySpawns, layers.platform_colliders);
        const collectables = this.createCollectables(layers.collectables);

        this.createBG(map);

        this.createPlayerColliders(player, {colliders: {
            platform_colliders: layers.platform_colliders,
            projectiles: enemies.getProjectiles(),
            collectables,
            traps: layers.traps
        }})

        this.createEnemyColliders(enemies, {colliders: {
            platform_colliders: layers.platform_colliders, player
        }})

        this.createBackButton();
        this.createEndOfLevel(playerZones.end, player);
        this.setupFollowupCameraOn(player);

        if(gameStatus === 'PLAYER_LOSE') {return;}
        this.createGameEvents()
    }

    finishDrawing (pointer, layer)
    {
        this.line.x2 = pointer.worldX;
        this.line.y2 = pointer.worldY;
        
        this.graphics.clear();
        this.graphics.strokeLineShape(this.line);
        
        this.tileHits = layer.getTilesWithinShape(this.line);

        if (this.tileHits.length > 0)
        {
            this.tileHits.forEach(tile =>{
                tile.index !== -1 && tile.setCollision(true);
            })
        }

        this.drawDebug(layer);

        this.plotting = false;
    }

    playBgMusic(){
        if(this.sound.get('theme')) { return; }
        this.sound.add('theme', {loop: true, volume: 0.03}).play();
    }

    createMap ()
    {
        const map = this.make.tilemap({key: `level_${this.getCurrentLevel()}`});
        const tileset1 = map.addTilesetImage('main_lev_build_1', 'tiles-1');
        const tileset2 = map.addTilesetImage('bg_spikes_tileset', 'bg-spikes-tileset');
        return map;
    }

    createLayers (map)
    {
        const tileset = map.getTileset('main_lev_build_1');
        const tilesetBg = map.getTileset('bg_spikes_tileset');
        
        map.createStaticLayer('distance', tilesetBg).setDepth(-13);

        const platform_colliders = map.createStaticLayer('platform_colliders', tileset);
        const environment = map.createStaticLayer('environment', tileset).setDepth(-2);
        const platforms = map.createStaticLayer('platforms', tileset);
        const playerZones = map.getObjectLayer('player_zones');
        const enemySpawns = map.getObjectLayer('enemy_spawns');
        const collectables = map.getObjectLayer('collectables');
        const traps = map.createStaticLayer('traps', tileset);
        
        platform_colliders.setCollisionByProperty({collides: true});
        platform_colliders.setVisible(false);
        traps.setCollisionByExclusion(-1)

        return {
            environment,
            platforms,
            platform_colliders,
            playerZones,
            enemySpawns,
            collectables,
            traps
        };
    }

    createBG(map){
        const bgObject = map.getObjectLayer('distance_bg').objects[0];
        this.spikesImage = this.add.tileSprite(bgObject.x, bgObject.y, this.config.width, bgObject.height, 'bg-spikes-dark')
            .setOrigin(0, 1)
            .setDepth(-10)
            .setScrollFactor(0, 1)

        this.skyImage = this.add.tileSprite(0, 0, this.config.width, 180, 'sky-play')
            .setOrigin(0, 0)
            .setDepth(-11)
            .setScale(1.1)
            .setScrollFactor(0, 1)
    }

    createBackButton(){
        const btn = this.add.image(this.config.rightBottomCorner.x, this.config.rightBottomCorner.y, 'back')
            .setOrigin(1)
            .setScrollFactor(0)
            .setScale(2)
            .setInteractive();

        btn.on('pointerup', () => {
            this.scene.start('MenuScene');
        })
    }

    createGameEvents(){
        EventEmitter.on('PLAYER_LOSE', () => {
            this.scene.restart({gameStatus: 'PLAYER_LOSE'});
        })
    }

    createCollectables(collectableLayer){
        const collectables = new Collectables(this).setDepth(-1);

        collectables.addFromLayer(collectableLayer);
        collectables.playAnimation('diamond-shine');

        return collectables;
    }

    createPlayer (start)
    {
        return new Player(this, start.x, start.y);
    }

    createEnemies (spawnLayer, platform_colliders)
    {
        const enemies = new Enemies(this);
        const enemyTypes = enemies.getTypes();

        spawnLayer.objects.forEach(spawnPoint => {
            const enemy = new enemyTypes[spawnPoint.properties[0].value](this, spawnPoint.x, spawnPoint.y);
            enemy.setPlatformColliders(platform_colliders);
            enemies.add(enemy);
        })

        return enemies;
    }

    onCollect(entity, collectable){
        this.score += collectable.score;
        this.hud.updateScoreboard(this.score);
        collectable.disableBody(true, true);
    }

    onPlayerCollision (enemy, player)
    {
        player.takesHit(enemy);
    }

    createPlayerColliders(player, { colliders })
    {
        player
            .addCollider(colliders.platform_colliders)
            .addCollider(colliders.projectiles, this.onHit)
            .addCollider(colliders.traps, this.onHit)
            .addOverlap(colliders.collectables, this.onCollect, this)
    }

    onHit (entity, source)
    {
        entity.takesHit(source);
    }

    createEnemyColliders(enemies, { colliders })
    {
        enemies
            .addCollider(colliders.platform_colliders)
            .addCollider(colliders.player, this.onPlayerCollision)
            .addCollider(colliders.player.projectiles, this.onHit)
            .addOverlap(colliders.player.meleeWeapon, this.onHit);
    }

    setupFollowupCameraOn(player)
    {
        const { height, width, mapOffset, zoomFactor } = this.config;
        this.physics.world.setBounds(0, 0, width + mapOffset, height + 200);
        this.cameras.main.setBounds(0, 0, width + mapOffset, height).setZoom(zoomFactor);
        this.cameras.main.startFollow(player);
    }

    getPlayerZones(playerZonesLayer)
    {
        const playerZones = playerZonesLayer.objects;
        return {
            start: playerZones.find(zone => zone.name === 'startZone'),
            end: playerZones.find(zone => zone.name === 'endZone')
        }
    } 

    getCurrentLevel(){
        return this.registry.get('level') || 1;
    }

    createEndOfLevel(end, player)
    {
        const endOfLevel = this.physics.add.sprite(end.x, end.y, 'end')
            .setAlpha(0)
            .setSize(5, 200)
            .setOrigin(0.5, 1);

        const eolOverlap = this.physics.add.overlap(player, endOfLevel, () => {
            eolOverlap.active = false;

            if(this.registry.get('level') === this.config.lastLevel){
                this.scene.start('CreditsScene');
                return;
            }

            this.registry.inc('level', 1);
            this.registry.inc('unlocked-levels', 1);
            this.scene.restart({gameStatus: 'LEVEL_COMPLETED'})
        })
    }

    update(){
        this.spikesImage.tilePositionX = this.cameras.main.scrollX * 0.3;
        this.skyImage.tilePositionX = this.cameras.main.scrollX * 0.1;
    }
}

export default Play;