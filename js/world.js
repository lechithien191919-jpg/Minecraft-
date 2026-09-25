import { BLOCK_TYPES, getBlockMaterial } from './blocks.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.blocks = new Map();
        this.generateFlatWorld();
    }

    getKey(x, y, z) {
        return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
    }

    generateFlatWorld() {
        // Tạo mặt sàn phẳng gọn gàng (Grass ở trên, Dirt và Stone ở dưới)
        for (let x = -4; x <= 4; x++) {
            for (let z = -4; z <= 4; z++) {
                this.addBlock(x, 0, z, BLOCK_TYPES.GRASS);
                this.addBlock(x, -1, z, BLOCK_TYPES.DIRT);
                this.addBlock(x, -2, z, BLOCK_TYPES.STONE);
            }
        }
    }

    addBlock(x, y, z, type) {
        const key = this.getKey(x, y, z);
        if (this.blocks.has(key)) return;

        const material = getBlockMaterial(type);
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(x, y, z);
        mesh.userData = { type: type };
        
        this.scene.add(mesh);
        this.blocks.set(key, mesh);
    }
}
