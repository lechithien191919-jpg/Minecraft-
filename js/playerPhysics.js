/**
 * playerPhysics.js — Quản lý va chạm và thông số vật lý của Player (1.5 block)
 */

export function createPlayerPhysics(config) {
    const { camera, world } = config;

    // AABB MVP cho Player (Chiều cao 1.5 block)
    const playerBox = {
        width: 0.6,
        height: 1.5,
        depth: 0.6
    };

    const eyeHeight = 1.25; // Tầm mắt chuẩn cho chiều cao 1.5 block

    function getBoxAt(x, y, z) {
        return {
            minX: x - playerBox.width / 2,
            maxX: x + playerBox.width / 2,
            minY: y - eyeHeight,
            maxY: y + (playerBox.height - eyeHeight),
            minZ: z - playerBox.depth / 2,
            maxZ: z + playerBox.depth / 2
        };
    }

    function getPlayerAABB() {
        return getBoxAt(camera.position.x, camera.position.y, camera.position.z);
    }

    // Kiểm tra va chạm với các block trong thế giới
    function checkCollision(targetPos) {
        const box = getBoxAt(targetPos.x, targetPos.y, targetPos.z);

        const startX = Math.floor(box.minX);
        const endX = Math.floor(box.maxX);
        const startY = Math.floor(box.minY);
        const endY = Math.floor(box.maxY);
        const startZ = Math.floor(box.minZ);
        const endZ = Math.floor(box.maxZ);

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                for (let z = startZ; z <= endZ; z++) {
                    if (world.has(x, y, z)) {
                        const blockBox = {
                            minX: x - 0.5, maxX: x + 0.5,
                            minY: y - 0.5, maxY: y + 0.5,
                            minZ: z - 0.5, maxZ: z + 0.5
                        };

                        if (
                            box.minX < blockBox.maxX && box.maxX > blockBox.minX &&
                            box.minY < blockBox.maxY && box.maxY > blockBox.minY &&
                            box.minZ < blockBox.maxZ && box.maxZ > blockBox.minZ
                        ) {
                            return true; // Có va chạm
                        }
                    }
                }
            }
        }
        return false;
    }

    return {
        playerBox,
        eyeHeight,
        getPlayerAABB,
        checkCollision
    };
}
