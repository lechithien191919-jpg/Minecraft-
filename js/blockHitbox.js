export function createBlockHitbox({ world, playerRadius = 0.3, playerHeight = 1.7 }) {
    
    // Kiểm tra va chạm AABB tổng quát giữa player và thế giới block
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

    // Thuật toán Leo block thông minh theo Phương án B:
    // - Cao 1 block (<= 1.0): Cho phép step-up trèo lên.
    // - Cao từ 2 block trở lên: Chặn đứng hoàn toàn.
    // - Đứng trên 1 block mà bên cạnh là 2 block: Vẫn cho phép lướt qua nếu khoảng trống hợp lệ.
    function tryStepUp(currentPos, axis, step, isGrounded) {
        if (!isGrounded) return null;
        
        // Thử nhấc vị trí lên 1 block (chiều cao bước nhảy tối đa cho phép là 1 tầng)
        const tryPos = currentPos.clone();
        tryPos.y += 1.0;
        tryPos[axis] += step;
        
        // Nếu vị trí nhấc lên không vướng đầu/trần
        if (!checkCollision(tryPos)) {
            // Kiểm tra xem phía dưới chân ở vị trí mới có block đỡ hay không
            const belowPos = tryPos.clone();
            belowPos.y -= 1.1;
            if (checkCollision(belowPos)) {
                return tryPos; // Thỏa mãn leo lên block 1 tầng thành công!
            }
        }
        return null; // Quá cao (>= 2 block) hoặc không có chỗ đứng -> Chặn lại
    }

    // Kiểm tra xem vị trí đặt block có đè lên người chơi không
    function isPlayerIntersectingBlock(playerPos, bx, by, bz) {
        const pMinX = playerPos.x - playerRadius;
        const pMaxX = playerPos.x + playerRadius;
        const pMinY = playerPos.y - playerHeight;
        const pMaxY = playerPos.y;
        const pMinZ = playerPos.z - playerRadius;
        const pMaxZ = playerPos.z + playerRadius;

        const bMinX = bx - 0.5, bMaxX = bx + 0.5;
        const bMinY = by - 0.5, bMaxY = by + 0.5;
        const bMinZ = bz - 0.5, bMaxZ = bz + 0.5;

        return (pMaxX > bMinX && pMinX < bMaxX &&
                pMaxY > bMinY && pMinY < bMaxY &&
                pMaxZ > bMinZ && pMinZ < bMaxZ);
    }

    return {
        playerHeight,
        playerRadius,
        checkCollision,
        tryStepUp,
        isPlayerIntersectingBlock
    };
}
