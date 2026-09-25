import { BLOCK_TYPES, getBlockMaterial } from './blocks.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.blocks = new Map(); // Lưu trữ danh sách các block theo tọa độ x,y,z
        this.generateTerrain();
    }

    // Tạo khóa định danh cho từng block
    getKey(x, y, z) {
        return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
    }

    // Tạo một vùng địa hình phẳng 3D trực quan
    generateTerrain() {
        const radius = 3; // Tạo bãi đất rộng 7x7 ô
        for (let x = -radius; x <= radius; x++) {
            for (let z = -radius; z <= radius; z++) {
                // Tầng trên cùng là Cỏ (Grass)
                this.createBlock(x, 0, z, BLOCK_TYPES.GRASS);
                // Tầng giữa là Đất (Dirt)
                this.createBlock(x, -1, z, BLOCK_TYPES.DIRT);
                // Tầng dưới đáy là Đá (Stone)
                this.createBlock(x, -2, z, BLOCK_TYPES.STONE);
            }
        }
        console.log(`🌍 Terrain generated successfully. Total 3D blocks: ${this.blocks.size}`);
    }

    // Hàm dựng mesh 3D và đưa vào Scene
    createBlock(x, y, z, type) {
        const key = this.getKey(x, y, z);
        if (this.blocks.has(key)) return;

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = getBlockMaterial(type);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(x, y, z);
        mesh.userData = { x, y, z, type };

        this.scene.add(mesh);
        this.blocks.set(key, mesh);
    }
}
