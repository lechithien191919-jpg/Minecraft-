import { BLOCK_TYPES, getBlockMaterial } from './blocks.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.blocks = new Map(); // Lưu trữ vị trí các block: "x,y,z" -> mesh
        this.blockSize = 1;
        this.chunkSize = 10; // Kích thước map 10x10 block cho v0.1 gọn nhẹ
    }

    generate() {
        // Tạo mặt đất phẳng đơn giản cho v0.1
        const geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);

        for (let x = -this.chunkSize; x < this.chunkSize; x++) {
            for (let z = -this.chunkSize; z < this.chunkSize; z++) {
                // Đặt lớp đất/đá ở dưới
                this.addBlock(x, -1, z, BLOCK_TYPES.DIRT);
                // Đặt lớp cỏ ở trên cùng
                this.addBlock(x, 0, z, BLOCK_TYPES.GRASS);
                
                // Thêm vài cục đá ngẫu nhiên làm cảnh
                if ((x * 3 + z * 7) % 11 === 0) {
                    this.addBlock(x, 1, z, BLOCK_TYPES.STONE);
                }
            }
        }
    }

    addBlock(x, y, z, type) {
        const key = `${x},${y},${z}`;
        if (this.blocks.has(key)) return;

        const material = getBlockMaterial(type);
        const geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(x, y, z);
        mesh.userData = { x, y, z, type };
        
        this.scene.add(mesh);
        this.blocks.set(key, mesh);
    }

    removeBlock(mesh) {
        if (!mesh) return;
        const { x, y, z } = mesh.userData;
        const key = `${x},${y},${z}`;
        
        this.scene.remove(mesh);
        this.blocks.delete(key);
    }

    getBlockAt(x, y, z) {
        const key = `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
        return this.blocks.get(key) || null;
    }
}
