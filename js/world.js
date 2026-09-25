import { BLOCK_TYPES, getBlockMaterial } from './blocks.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.blocks = new Map(); // Lưu trữ block theo tọa độ "x,y,z"
        
        // Tạo lại mặt phẳng cơ bản ổn định để test
        this.generateFlatWorld();
    }

    getKey(x, y, z) {
        return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
    }

    generateFlatWorld() {
        // Tạo một lớp nền phẳng ổn định (ví dụ sàn đá/cỏ rộng 10x10)
        for (let x = -5; x <= 5; x++) {
            for (let z = -5; z <= 5; z++) {
                this.addBlock(x, 0, z, BLOCK_TYPES.GRASS);
                this.addBlock(x, -1, z, BLOCK_TYPES.DIRT);
                this.addBlock(x, -2, z, BLOCK_TYPES.STONE);
            }
        }
    }

    addBlock(x, y, z, type) {
        const key = this.getKey(x, y, z);
        if (this.blocks.has(key)) return; // Đã có block thì bỏ qua

        const material = getBlockMaterial(type);
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(x, y, z);
        mesh.userData = { type: type };
        
        this.scene.add(mesh);
        this.blocks.set(key, mesh);
    }

    removeBlock(mesh) {
        if (!mesh || !mesh.parent) return;
        
        const x = mesh.position.x;
        const y = mesh.position.y;
        const z = mesh.position.z;
        const key = this.getKey(x, y, z);

        this.scene.remove(mesh);
        mesh.geometry.dispose();
        
        this.blocks.delete(key);
    }

    getBlockAt(x, y, z) {
        const key = this.getKey(x, y, z);
        return this.blocks.get(key) || null;
    }
}
