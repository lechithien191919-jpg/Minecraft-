export function createPlayerPhysics({ camera, world }) {
    const playerRadius = 0.35;
    const playerHeight = 1.7;

    function checkCollision(pos) {
        // Kiểm tra hộp bao quanh nhân vật tại vị trí pos (pos là vị trí mắt camera)
        const feetY = pos.y - playerHeight;
        const minX = pos.x - playerRadius;
        const maxX = pos.x + playerRadius;
        const minZ = pos.z - playerRadius;
        const maxZ = pos.z + playerRadius;
        const minY = feetY;
        const maxY = pos.y;

        const startX = Math.floor(minX);
        const endX = Math.floor(maxX);
        const startY = Math.floor(minY);
        const endY = Math.floor(maxY);
        const startZ = Math.floor(minZ);
        const endZ = Math.floor(maxZ);

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                for (let z = startZ; z <= endZ; z++) {
                    if (world.has(x, y, z)) {
                        return true; // Có va chạm
                    }
                }
            }
        }
        return false;
    }

    return {
        playerRadius,
        playerHeight,
        checkCollision
    };
}
