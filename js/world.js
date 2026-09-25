import { BLOCK_TYPES, getBlockMaterial } from './blocks.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.blocks = new Map(); // Lưu trữ từng block theo tọa độ x, y, z
        this.generateChunkBlocks();
    }

    getKey(x, y, z) {
        return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
    }

    generateChunkBlocks() {
        // Tạo một khoảng rộng các khối block 1x1x1 tách biệt chuẩn phong cách Minecraft
        const size = 4; // Bán kính vùng đất
        for (let x = -size; x <= size; x++) {
            for (let z = -size; z <= size; z++) {
                // Tầng trên cùng là Cỏ
                this.createSingleBlock(x, 0, z, BLOCK_TYPES.GRASS);
                // Tầng giữa là Đất
                this.createSingleBlock(x, -1, z, BLOCK_TYPES.DIRT);
                // Tầng dưới đáy là Đá
                this.createSingleBlock(x, -2, z, BLOCK_TYPES.STONE);
                this.createSingleBlock(x, -3, z, BLOCK_TYPES.STONE);
            }
        }
        console.log(`🧱 Đã khởi tạo xong ${this.blocks.size} khối block riêng biệt.`);
    }

    createSingleBlock(x, y, z, type) {
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

