export function createPlayerPhysics({ camera, world }) {
    const playerHeight = 1.7;
    const playerRadius = 0.3; // Bán kính va chạm ngang của player

    // Hàm checkCollision chuẩn True AABB Float Intersection
    function checkCollision(pos) {
        // AABB của player (pos.y là ĐỈNH ĐẦU)
        const pMinX = pos.x - playerRadius;
        const pMaxX = pos.x + playerRadius;
        const pMinY = pos.y - playerHeight;
        const pMaxY = pos.y;
        const pMinZ = pos.z - playerRadius;
        const pMaxZ = pos.z + playerRadius;
        
        // Quét các block trong vùng phủ
        const startX = Math.floor(pMinX);
        const endX   = Math.floor(pMaxX);
        const startY = Math.floor(pMinY);
        const endY   = Math.floor(pMaxY);
        const startZ = Math.floor(pMinZ);
        const endZ   = Math.floor(pMaxZ);
        
        for (let bx = startX; bx <= endX; bx++) {
            for (let by = startY; by <= endY; by++) {
                for (let bz = startZ; bz <= endZ; bz++) {
                    if (!world.has(bx, by, bz)) continue;
                    
                    // AABB của block (block là 1x1x1, tâm ở (bx,by,bz))
                    const bMinX = bx - 0.5, bMaxX = bx + 0.5;
                    const bMinY = by - 0.5, bMaxY = by + 0.5;
                    const bMinZ = bz - 0.5, bMaxZ = bz + 0.5;
                    
                    // True AABB overlap (dùng strict inequality để tránh chạm biên)
                    if (pMaxX > bMinX && pMinX < bMaxX &&
                        pMaxY > bMinY && pMinY < bMaxY &&
                        pMaxZ > bMinZ && pMinZ < bMaxZ) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    return {
        playerHeight,
        playerRadius,
        checkCollision
    };
}

