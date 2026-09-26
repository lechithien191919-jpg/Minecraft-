export function createBlockInteraction({ scene, camera, world, getBlockMeshes, raycaster, isPlayerIntersecting }) {

    function breakBlock() {
        try {
            const screenCenter = new THREE.Vector2(0, 0);
            raycaster.setFromCamera(screenCenter, camera);
            
            const meshes = getBlockMeshes();
            const intersects = raycaster.intersectObjects(meshes, false);
            
            if (intersects.length > 0) {
                const hit = intersects[0];
                const targetMesh = hit.object;
                const ud = targetMesh.userData;
                
                let bx, by, bz;
                if (ud && typeof ud.x === 'number' && typeof ud.y === 'number' && typeof ud.z === 'number') {
                    bx = ud.x;
                    by = ud.y;
                    bz = ud.z;
                } else {
                    bx = Math.round(targetMesh.position.x);
                    by = Math.round(targetMesh.position.y);
                    bz = Math.round(targetMesh.position.z);
                }
                
                const success = world.removeBlock(bx, by, bz);
                if (success) {
                    console.log(`🗑️ Đã đập block tại (${bx}, ${by}, ${bz})`);
                    return true;
                }
            }
            return false;
        } catch (e) {
            console.error('[breakBlock] error:', e);
            return false;
        }
    }

    function placeBlock(selectedType) {
        try {
            const screenCenter = new THREE.Vector2(0, 0);
            raycaster.setFromCamera(screenCenter, camera);
            
            const meshes = getBlockMeshes();
            const intersects = raycaster.intersectObjects(meshes, false);
            
            if (!intersects || intersects.length === 0) return false;
            
            const hit = intersects[0];
            if (!hit || !hit.object || !hit.object.userData) return false;
            if (!hit.face) return false;
            
            const targetMesh = hit.object;
            const ud = targetMesh.userData;
            
            // Transform normal sang world space (an toàn cho tương lai khi có block xoay)
            const worldNormal = hit.face.normal.clone()
                .applyQuaternion(targetMesh.quaternion);
            
            // Chỉ chấp nhận normal axis-aligned chuẩn xác
            const nx = Math.abs(worldNormal.x) > 0.5 ? Math.sign(worldNormal.x) : 0;
            const ny = Math.abs(worldNormal.y) > 0.5 ? Math.sign(worldNormal.y) : 0;
            const nz = Math.abs(worldNormal.z) > 0.5 ? Math.sign(worldNormal.z) : 0;
            
            // Ưu tiên lấy từ userData — fallback an toàn nếu thiếu
            let bx, by, bz;
            if (typeof ud.x === 'number' && typeof ud.y === 'number' && typeof ud.z === 'number') {
                bx = ud.x + nx;
                by = ud.y + ny;
                bz = ud.z + nz;
            } else {
                const pos = targetMesh.position.clone().add(worldNormal);
                bx = Math.round(pos.x);
                by = Math.round(pos.y);
                bz = Math.round(pos.z);
            }
            
            // Check nhanh: Ô đích đã có block chưa (Fail fast)
            if (world.has(bx, by, bz)) {
                console.warn(`⚠️ Ô (${bx}, ${by}, ${bz}) đã có block!`);
                return false;
            }
            
            // Check player AABB xem có bị đè người không
            if (typeof isPlayerIntersecting === 'function' 
                && isPlayerIntersecting(bx, by, bz)) {
                console.warn(`⚠️ Block đè lên player tại (${bx}, ${by}, ${bz})!`);
                return false;
            }
            
            const newMesh = world.addBlock(bx, by, bz, selectedType);
            if (newMesh) {
                console.log(`✅ Đặt ${selectedType} thành công tại (${bx}, ${by}, ${bz})`);
                return true;
            }
            return false;
        } catch (e) {
            console.error('[placeBlock] error:', e);
            return false;
        }
    }

    return {
        breakBlock,
        placeBlock
    };
}
