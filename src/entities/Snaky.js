
import Enemy from './Enemy';
import initAnims from './anims/snakyAnims';

class Snaky extends Enemy
{
    constructor(scene, x, y)
    {
        super(scene, x, y, 'snaky');
        initAnims(scene.anims);
    }
    
    init(){
        super.init();
        this.speed = 50;

        this.setSize(12, 45);
        this.setOffset(10, 15);
    }

    update (time, delta)
    {
        super.update(time, delta);

        if (!this.active) { return; }

        if (this.isPlayingAnims('snaky-hurt')) { return; }

        this.play('snaky-idle', true);
    }

    takesHit(source)
    {
        super.takesHit(source);
        this.play('snaky-hurt', true);
    }
}

export default Snaky;