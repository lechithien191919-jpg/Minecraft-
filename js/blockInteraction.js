export function createBlockInteraction({ scene, camera, world, getBlockMeshes, raycaster }) {
    // --- 1. GET TARGET BLOCK (Raycast chuáº©n 5 trÆ°á»ng tá»« tĂ¢m camera) ---
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

    // --- 2. BREAK BLOCK (XĂ³a block an toĂ n, khĂ´ng dispose tĂ i nguyĂªn chung) ---
    function breakBlock() {
        try {
            const target = getTargetBlock();
            if (!target) return false;

            const { x, y, z } = target.position;
            const success = world.removeBlock(x, y, z);
            
            if (success) {
                console.log(`â›ï¸ ÄĂ£ Ä‘áº­p block táº¡i (${x}, ${y}, ${z})`);
            }
            return success;
        } catch (e) {
            console.error('[blockInteraction] breakBlock error:', e);
            return false;
        }
    }

    // --- 3. PLACE BLOCK (Äáº·t block dá»±a vĂ o face normal vĂ  tá»a Ä‘á»™ lÆ°á»›i integer) ---
    function placeBlock(blockType) {
        try {
            const target = getTargetBlock();
            if (!target) return false;

            // TĂ­nh tá»a Ä‘á»™ Ă´ káº¿ bĂªn dá»±a vĂ o face normal (unit vector)
            const placePos = target.position.clone().add(target.normal);
            const x = Math.round(placePos.x);
            const y = Math.round(placePos.y);
            const z = Math.round(placePos.z);

            // Kiá»ƒm tra xem Ă´ Ä‘Ă³ Ä‘Ă£ cĂ³ block chÆ°a
            if (world.hasBlock(x, y, z)) {
                console.log(`â ï¸ Ă” (${x}, ${y}, ${z}) Ä‘Ă£ cĂ³ block, khĂ´ng Ä‘áº·t Ä‘Æ°á»£c!`);
                return false;
            }

            // Gá»i World API thĂªm block má»›i
            const newMesh = world.addBlock(x, y, z, blockType);
            if (newMesh) {
                console.log(`đŸ§± ÄĂ£ Ä‘áº·t block [${blockType}] táº¡i (${x}, ${y}, ${z})`);
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
