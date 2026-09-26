export function createPlayerPhysics({ camera, world }) {
    const playerHeight = 1.7;
    const playerRadius = 0.3;

    function checkCollision(pos) {
        const pMinX = pos.x - playerRadius;
        const pMaxX = pos.x + playerRadius;
        const pMinY = pos.y - playerHeight;
        const pMaxY = pos.y;
        const pMinZ = pos.z - playerRadius;
        const pMaxZ = pos.z + playerRadius;
        
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
                    
                    const bMinX = bx - 0.5, bMaxX = bx + 0.5;
                    const bMinY = by - 0.5, bMaxY = by + 0.5;
                    const bMinZ = bz - 0.5, bMaxZ = bz + 0.5;
                    
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

    // Thử leo block (Step-up) khi đang đứng trên mặt đất
    function tryStepUp(currentPos, axis, step, isGrounded) {
        if (!isGrounded) return null;
        
        const tryPos = currentPos.clone();
        tryPos.y += 1.0;
        tryPos[axis] += step;
        
        if (!checkCollision(tryPos)) {
            const belowPos = tryPos.clone();
            belowPos.y -= 1.1;
            if (checkCollision(belowPos)) {
                return tryPos;
            }
        }
        return null;
    }

    return {
        playerHeight,
        playerRadius,
        checkCollision,
        tryStepUp
    };
}
