export function createBlockInteraction({ scene, camera, world, getBlockMeshes, raycaster }) {
    // --- 1. GET TARGET BLOCK (Raycast chuẩn 5 trường từ tâm camera) ---
    function getTargetBlock() {
        try {
            const screenCenter = new THREE.Vector2(0, 0);
            raycaster.setFromCamera(screenCenter, camera);
            
            const meshes = getBlockMeshes();
            const intersects = raycaster.intersectObjects(meshes, false);

            if (!intersects || intersects.length === 0) {
                return null;
            }

            const hit = intersects[0];
            if (!hit || !hit.object || !hit.object.userData) {
                return null;
            }

            return {
                mesh: hit.object,
                type: hit.object.userData.type || 'unknown',
                position: new THREE.Vector3(hit.object.userData.x, hit.object.userData.y, hit.object.userData.z),
                normal: hit.face ? hit.face.normal.clone() : new THREE.Vector3(0, 1, 0),
                distance: hit.distance
            };
        } catch (e) {
            console.error('[blockInteraction] getTargetBlock error:', e);
            return null;
        }
    }

    // --- 2. BREAK BLOCK (Xóa block an toàn, không dispose tài nguyên chung) ---
    function breakBlock() {
        try {
            const target = getTargetBlock();
            if (!target) return false;

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

    // --- 3. PLACE BLOCK (Đặt block dựa vào face normal và tọa độ lưới integer) ---
    function placeBlock(blockType) {
        try {
            const target = getTargetBlock();
            if (!target) return false;

            // Tính tọa độ ô kế bên dựa vào face normal (unit vector)
            const placePos = target.position.clone().add(target.normal);
            const x = Math.round(placePos.x);
            const y = Math.round(placePos.y);
            const z = Math.round(placePos.z);

            // Kiểm tra xem ô đó đã có block chưa
            if (world.hasBlock(x, y, z)) {
                console.log(`⚠️ Ô (${x}, ${y}, ${z}) đã có block, không đặt được!`);
                return false;
            }

            // Gọi World API thêm block mới
            const newMesh = world.addBlock(x, y, z, blockType);
            if (newMesh) {
                console.log(`🧱 Đã đặt block [${blockType}] tại (${x}, ${y}, ${z})`);
                return true;
            }
            return false;
        } catch (e) {
            console.error('[blockInteraction] placeBlock error:', e);
            return false;
        }
    }

    return {
        getTargetBlock,
        breakBlock,
        placeBlock
    };
}
