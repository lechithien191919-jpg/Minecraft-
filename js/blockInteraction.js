export function createBlockInteraction({ 
    scene, camera, world, getBlockMeshes, raycaster, 
    getPlayer, getBlockHitbox // 👈 Nhận callback
}) {

    function getTargetBlock() {
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const blockMeshes = getBlockMeshes();
        const intersects = raycaster.intersectObjects(blockMeshes);

        if (intersects.length > 0) {
            const hit = intersects[0];
            if (hit.distance < 6) {
                return {
                    mesh: hit.object,
                    point: hit.point,
                    normal: hit.face.normal,
                    position: hit.object.position
                };
            }
        }
        return null;
    }

    function breakBlock() {
        try {
            console.log('[BREAK] called'); // 👈 Log tạm 1
            
            const target = getTargetBlock();
            console.log('[BREAK] target =', target); // 👈 Log tạm 2
            
            if (!target) {
                console.log('[BREAK] no target, return false'); // 👈 Log tạm 3
                return false;
            }

            const { x, y, z } = target.position;
            const success = world.removeBlock(x, y, z);
            if (success) {
                console.log(`⛏️ Đã đập block tại (${x}, ${y}, ${z})`);
            }
            return success;
        } catch (e) {
            console.error('[blockInteraction] breakBlock error:', e);
            return false;
        }
    }

    function placeBlock(blockType) {
        try {
            const target = getTargetBlock();
            if (!target) return false;

            const normal = target.normal;
            const pos = target.position;
            const newX = Math.round(pos.x + normal.x);
            const newY = Math.round(pos.y + normal.y);
            const newZ = Math.round(pos.z + normal.z);

            if (world.has(newX, newY, newZ)) return false;

            // Lấy giá trị runtime an toàn qua callback
            const player = getPlayer ? getPlayer() : null;
            const blockHitbox = getBlockHitbox ? getBlockHitbox() : null;

            if (player && blockHitbox) {
                const blockMinX = newX - 0.5, blockMaxX = newX + 0.5;
                const blockMinY = newY - 0.5, blockMaxY = newY + 0.5;
                const blockMinZ = newZ - 0.5, blockMaxZ = newZ + 0.5;

                const pMinX = player.position.x - blockHitbox.playerRadius;
                const pMaxX = player.position.x + blockHitbox.playerRadius;
                const pMinY = player.position.y - blockHitbox.playerHeight;
                const pMaxY = player.position.y;
                const pMinZ = player.position.z - blockHitbox.playerRadius;
                const pMaxZ = player.position.z + blockHitbox.playerRadius;

                const intersectX = (pMinX < blockMaxX) && (pMaxX > blockMinX);
                const intersectY = (pMinY < blockMaxY) && (pMaxY > blockMinY);
                const intersectZ = (pMinZ < blockMaxZ) && (pMaxZ > blockMinZ);

                if (intersectX && intersectY && intersectZ) {
                    const blockTopY = newY + 0.5;
                    const feetY = player.position.y - blockHitbox.playerHeight;
                    
                    if (Math.abs(feetY - blockTopY) < 0.15 && player.velocity.y <= 0.1) {
                        player.position.y = blockTopY + blockHitbox.playerHeight;
                        player.velocity.y = 0;
                        player.isGrounded = true;
                    } else {
                        return false; 
                    }
                }
            }

            const added = world.addBlock(newX, newY, newZ, blockType);
            if (added) {
                console.log(`📦 Đã đặt block loại ${blockType} tại (${newX}, ${newY}, ${newZ})`);
                return true;
            }
            return false;
        } catch (e) {
            console.error('[blockInteraction] placeBlock error:', e);
            return false;
        }
    }

    return {
        breakBlock,
        placeBlock
    };
}

