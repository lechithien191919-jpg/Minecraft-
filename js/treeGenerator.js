import { BLOCK_TYPES } from './blocks.js';

export class TreeGenerator {
    constructor(world, spawnRadius = 8.0) {
        this.world = world;
        this.spawnRadius = spawnRadius;
        this.trees = [];
    }

    // Kiểm tra khoảng cách tối thiểu giữa các cây để không bị chồng chéo
    isValidPosition(x, z, minDistance, existingTrees) {
        // Tránh khu vực spawn quanh gốc tọa độ (0,0)
        const distFromSpawn = Math.sqrt(x * x + z * z);
        if (distFromSpawn < this.spawnRadius) {
            console.log(`[TREE DEBUG] Bỏ qua vị trí gần spawn: x=${x}, z=${z} (Khoảng cách: ${distFromSpawn.toFixed(1)})`);
            return false;
        }

        for (let tree of existingTrees) {
            const dx = tree.x - x;
            const dz = tree.z - z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            if (distance < minDistance) {
                return false;
            }
        }
        return true;
    }

    // Hàm sinh danh sách cây ngẫu nhiên trên mặt đất
    generateTrees(count = 15, minDistance = 5.0, minX = -12, maxX = 12, minZ = -22, maxZ = 2) {
        console.log(`[TREE DEBUG] Bắt đầu sinh ${count} cây với khoảng cách tối thiểu ${minDistance}...`);
        let generatedCount = 0;
        let attempts = 0;
        const maxAttempts = count * 10;

        while (generatedCount < count && attempts < maxAttempts) {
            attempts++;
            
            // Random tọa độ X, Z trong phạm vi mặt đất
            const x = Math.floor(minX + Math.random() * (maxX - minX));
            const z = Math.floor(minZ + Math.random() * (maxZ - minZ));

            if (!this.isValidPosition(x, z, minDistance, this.trees)) {
                continue;
            }

            // Mặt đất ở độ y = -1, nên gốc cây bắt đầu từ y = 0 lên đến y = 3
            const trunkHeight = 3;
            let canSpawn = true;

            // Kiểm tra xem vị trí đó đã có block nào chưa
            for (let y = 0; y < trunkHeight; y++) {
                if (this.world.has(x, y, z)) {
                    canSpawn = false;
                    break;
                }
            }

            if (canSpawn) {
                // Tiến hành trồng cây (Thân gỗ + Lá)
                this.buildTree(x, 0, z, trunkHeight);
                this.trees.push({ x, z });
                generatedCount++;
                console.log(`[CASE TREE] [VOXEL SPAWN] Đã trồng cây thứ ${generatedCount} tại tọa độ: (${x}, 0, ${z})`);
            }
        }

        console.log(`[TREE DEBUG] Hoàn tất! Tổng số cây đã sinh thành công: ${generatedCount}`);
    }

    // Hàm dựng hình khối cây (Thân gỗ + Tán lá)
    buildTree(x, baseY, z, height) {
        // 1. Dựng thân cây (WOOD)
        for (let y = 0; y < height; y++) {
            this.world.addBlock(x, baseY + y, z, BLOCK_TYPES.WOOD);
        }

        // 2. Dựng tán lá quanh đỉnh thân (LEAVES)
        const leafCenterY = baseY + height;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                for (let dy = 0; dy <= 1; dy++) {
                    // Không đè lên khối thân ở tầng lá dưới cùng
                    if (dx === 0 && dz === 0 && dy === 0) continue;
                    
                    const lx = x + dx;
                    const ly = leafCenterY + dy;
                    const lz = z + dz;

                    if (!this.world.has(lx, ly, lz)) {
                        this.world.addBlock(lx, ly, lz, BLOCK_TYPES.LEAVES);
                    }
                }
            }
        }
    }
        }
