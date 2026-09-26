export function createBlockInteraction({ scene, camera, world, getBlockMeshes, raycaster, player, blockHitbox }) {

    function placeBlock(selectedType) {
        try {
            // Guard: blockHitbox phải có
            if (!blockHitbox || typeof blockHitbox.playerHeight !== 'number') {
                console.error('[placeBlock] blockHitbox chưa được truyền vào!');
                return false;
            }
            
            const screenCenter = new THREE.Vector2(0, 0);
            raycaster.setFromCamera(screenCenter, camera);
            
            const meshes = getBlockMeshes();
            const intersects = raycaster.intersectObjects(meshes, false);
            
            if (!intersects || intersects.length === 0) return false;
            
            const hit = intersects[0];
            if (!hit || !hit.object || !hit.object.userData || !hit.face) return false;
            
            const targetMesh = hit.object;
            const ud = targetMesh.userData;
            
            // Lấy normal world space
            const worldNormal = hit.face.normal.clone().applyQuaternion(targetMesh.quaternion);
            const nx = Math.abs(worldNormal.x) > 0.5 ? Math.sign(worldNormal.x) : 0;
            const ny = Math.abs(worldNormal.y) > 0.5 ? Math.sign(worldNormal.y) : 0;
            const nz = Math.abs(worldNormal.z) > 0.5 ? Math.sign(worldNormal.z) : 0;
            
            const bx = ud.x + nx;
            const by = ud.y + ny;
            const bz = ud.z + nz;
            
            // Check ô đích đã có block chưa
            if (world.has(bx, by, bz)) return false;
            
            // === CHECK INTERSECTION VỚI PLAYER (trước khi đặt) ===
            let autoLiftY = null;
            
            if (player && blockHitbox) {
                const h = blockHitbox.playerHeight;
                const r = blockHitbox.playerRadius;
                
                const feetY = player.position.y - h;
                const headY = player.position.y;
                
                const pMinX = player.position.x - r;
                const pMaxX = player.position.x + r;
                const pMinZ = player.position.z - r;
                const pMaxZ = player.position.z + r;
                
                const bMinX = bx - 0.5, bMaxX = bx + 0.5;
                const bMinY = by - 0.5, bMaxY = by + 0.5;
                const bMinZ = bz - 0.5, bMaxZ = bz + 0.5;
                
                const overlapX = pMaxX > bMinX && pMinX < bMaxX;
                const overlapZ = pMaxZ > bMinZ && pMinZ < bMaxZ;
                const overlapY = headY > bMinY && feetY < bMaxY;
                
                if (overlapX && overlapZ && overlapY) {
                    const blockTopY = bMaxY;
                    
                    if (blockTopY <= feetY + 0.1) {
                        // Block nằm dưới chân → auto-lift (feature xây cột)
                        autoLiftY = blockTopY + h;
                    } else {
                        // Block đè lên thân/đầu → reject an toàn
                        console.warn(`⚠️ Block tại (${bx}, ${by}, ${bz}) đè lên thân player!`);
                        return false;
                    }
                }
            }
            
            // === ĐẶT BLOCK (sau khi đã check an toàn) ===
            const newMesh = world.addBlock(bx, by, bz, selectedType);
            if (!newMesh) return false;
            
            // === AUTO-LIFT nếu đặt dưới chân ===
            if (autoLiftY !== null && player) {
                player.position.y = autoLiftY;
                player.velocity.y = 0;
                player.isGrounded = true;
                console.log(`✅ Đặt block và tự động nâng player lên y=${autoLiftY.toFixed(2)}`);
            } else {
                console.log(`✅ Đặt ${selectedType} tại (${bx}, ${by}, ${bz})`);
            }
            
            return true;
        } catch (e) {
            console.error('[placeBlock] error:', e);
            return false;
        }
    }

    return {
        placeBlock
    };
}
