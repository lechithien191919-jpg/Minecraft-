import { BLOCK_TYPES } from './blocks.js';

export class TerrainGenerator {
    constructor(seed = 12345) {
        this.seed = seed;
        this.worldWidth = 32;  // Kích thước chiều rộng map
        this.worldDepth = 32;  // Kích thước chiều sâu map
        this.maxHeight = 6;    // Độ cao tối đa của đồi
    }

    // Hàm tạo số ngẫu nhiên giả lập dựa trên seed (Pseudo-random)
    pseudoRandom(x, z) {
        let n = Math.sin(x * 12.9898 + z * 78.233 + this.seed) * 43758.5453;
        return n - Math.floor(n);
    }

    // Hàm tạo nhiễu đơn giản (Value Noise) cho địa hình mượt mà
    getNoise(x, z) {
        const intX = Math.floor(x);
        const intZ = Math.floor(z);
        const fracX = x - intX;
        const fracZ = z - intZ;

        // 4 góc của ô lưới
        const v00 = this.pseudoRandom(intX, intZ);
        const v10 = this.pseudoRandom(intX + 1, intZ);
        const v01 = this.pseudoRandom(intX, intZ + 1);
        const v11 = this.pseudoRandom(intX + 1, intZ + 1);

        // Nội suy mượt (Smoothstep)
        const ix0 = v00 * (1 - fracX) + v10 * fracX;
        const ix1 = v01 * (1 - fracX) + v11 * fracX;

        return ix0 * (1 - fracZ) + ix1 * fracZ;
    }

    // Tính độ cao cột block tại tọa độ (x, z)
    getHeight(x, z) {
        let scale = 0.1;
        let height = Math.floor(this.getNoise(x * scale, z * scale) * this.maxHeight);
        return Math.max(1, height); // Đảm bảo độ cao tối thiểu là 1
    }

    // Sinh toàn bộ dữ liệu khối cho thế giới
    generateWorld(worldInstance) {
        const halfW = Math.floor(this.worldWidth / 2);
        const halfD = Math.floor(this.worldDepth / 2);

        for (let x = -halfW; x < halfW; x++) {
            for (let z = -halfD; z < halfD; z++) {
                const surfaceHeight = this.getHeight(x, z);

                // Xây dựng cột block từ dưới lên trên theo phân tầng
                for (let y = 0; y <= surfaceHeight; y++) {
                    let blockType = BLOCK_TYPES.STONE; // Sâu nhất là đá

                    if (y === surfaceHeight) {
                        blockType = BLOCK_TYPES.GRASS; // Lớp bề mặt là Cỏ
                    } else if (y >= surfaceHeight - 2) {
                        blockType = BLOCK_TYPES.DIRT;  // Ngay dưới cỏ là Đất
                    }

                    worldInstance.createBlockDirect(x, y, z, blockType);
                }
            }
        }
    }
}
