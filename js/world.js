import { BLOCK_TYPES, getBlockMaterial } from './blocks.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.blocks = new Map();
        this.generateTerrain();
    }

    getKey(x, y, z) {
        return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
    }

    generateTerrain() {
        const radius = 2; // Tạo bãi đất vừa phải, gọn gàng, không quá tải mobile
        for (let x = -radius; x <= radius; x++) {
            for (let z = -radius; z <= radius; z++) {
                this.createBlock(x, 0, z, BLOCK_TYPES.GRASS);
                this.createBlock(x, -1, z, BLOCK_TYPES.DIRT);
                this.createBlock(x, -2, z, BLOCK_TYPES.STONE);
            }
        }
        console.log(`🌍 Đã tạo xong ${this.blocks.size} khối block riêng biệt.`);
    }

    createBlock(x, y, z, type) {
        const key = this.getKey(x, y, z);
        if (this.blocks.has(key)) return;

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = getBlockMaterial(type);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(x, y, z);
        this.scene.add(mesh);
        this.blocks.set(key, mesh);
    }
}
