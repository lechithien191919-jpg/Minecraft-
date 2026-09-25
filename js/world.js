import { BLOCK_TYPES, getBlockMaterial } from './blocks.js';
import { TerrainGenerator } from './terrain.js';

export class World {
    constructor(scene, seed = 42) {
        this.scene = scene;
        this.blocks = new Map(); // Lưu trữ block theo khóa "x,y,z"
        
        // Khởi tạo và sinh địa hình từ Seed
        this.terrainGen = new TerrainGenerator(seed);
        this.terrainGen.generateWorld(this);
    }

    getKey(x, y, z) {
        return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
    }

    // Tạo block trực tiếp không qua kiểm tra phức tạp (dùng khi sinh map)
    createBlockDirect(x, y, z, type) {
        const material = getBlockMaterial(type);
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(x, y, z);
        mesh.userData = { type: type };
        
        this.scene.add(mesh);
        this.blocks.set(this.getKey(x, y, z), mesh);
    }

    // Thêm block (khi người chơi đặt block)
    addBlock(x, y, z, type) {
        const key = this.getKey(x, y, z);
        if (this.blocks.has(key)) return; // Đã có block ở đây thì không đặt đè

        this.createBlockDirect(x, y, z, type);
    }

    // Xóa block (khi người chơi đập block)
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

    // Lấy thông tin block tại tọa độ
    getBlockAt(x, y, z) {
        const key = this.getKey(x, y, z);
        return this.blocks.get(key) || null;
    }
}
