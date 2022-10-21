
import Phaser from 'phaser';
import Player from '../entities/Player';
//import Enemies from '../groups/Enemies';

import {getEnemyTypes} from '../types';

class Play extends Phaser.Scene
{

    constructor (config)
    {
        super('PlayScene');
        this.config = config;
    }

    create ()
    {
        const map = this.createMap();
        const layers = this.createLayers(map);
        const playerZones = this.getPlayerZones(layers.playerZones);
        const player = this.createPlayer(playerZones.start);
        const enemies = this.createEnemies(layers.enemySpawns);

        this.createPlayerColliders(player, {colliders: {
            platform_colliders: layers.platform_colliders
        }})

        this.createEnemyColliders(enemies, {colliders: {
            platform_colliders: layers.platform_colliders, player
        }})

        this.createEndOfLevel(playerZones.end, player);
        this.setupFollowupCameraOn(player);
    }

    createMap ()
    {
        const map = this.make.tilemap({key: 'map'});
        const tileset1 = map.addTilesetImage('main_lev_build_1', 'tiles-1');
        return map;
    }

    createLayers (map)
    {
        const tileset = map.getTileset('main_lev_build_1');
        const environment = map.createStaticLayer('environment', tileset);
        const platform_colliders = map.createStaticLayer('platform_colliders', tileset);
        const platforms = map.createStaticLayer('platforms', tileset);
        const playerZones = map.getObjectLayer('player_zones').objects;
        const enemySpawns = map.getObjectLayer('enemy_spawns');
        
        platform_colliders.setCollisionByProperty({collides: true});
        platform_colliders.setVisible(false);
        return {environment, platforms, platform_colliders, playerZones, enemySpawns};
    }

    createPlayer (start)
    {
        return new Player(this, start.x, start.y);
    }

    createEnemies (spawnLayer)
    {
        const enemyTypes = getEnemyTypes();
        // const enemies = new Enemies(this);
        // const enemyTypes = enemies.getTypes();
        
        // spawnLayer.objects.forEach(spawnPoint => {
        //     const enemy = new enemyTypes[spawnPoint.type](this, spawnPoint.x, spawnPoint.y);
        //     enemies.add(enemy);
        // })
        
        return spawnLayer.objects.map(spawnPoint => {
            const enemy = enemyTypes[spawnPoint.type];
            debugger;
            return new enemyTypes[spawnPoint.type](this, spawnPoint.x, spawnPoint.y);
        })

        //return enemies;
    }

    createPlayerColliders(player, { colliders })
    {
        player
            .addCollider(colliders.platform_colliders);
    }

    createEnemyColliders(enemies, { colliders })
    {
        enemies
            .addCollider(colliders.platform_colliders)
            .addCollider(colliders.player);
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
        const playerZones = playerZonesLayer;
        return {
            start: playerZones.find(zone => zone.name === 'startZone'),
            end: playerZones.find(zone => zone.name === 'endZone')
        }
    } 

    createEndOfLevel(end, player)
    {
        const endOfLevel = this.physics.add.sprite(end.x, end.y, 'end')
            .setAlpha(0)
            .setSize(5, 200)
            .setOrigin(0.5, 1);

        const eolOverlap = this.physics.add.overlap(player, endOfLevel, () => {
            eolOverlap.active = false;
            console.log('Player has won!');
        })
    }
}

export default Play;