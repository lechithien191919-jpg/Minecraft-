export function createBlockInteraction({ scene, camera, world, getBlockMeshes, raycaster, isPlayerIntersecting }) {
    // ... các hàm cũ giữ nguyên ...

    function placeBlock(selectedType) {
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const meshes = getBlockMeshes();
        const intersects = raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const intersect = intersects[0];
            const normal = intersect.face.normal;
            const pos = intersect.object.position.clone().add(normal);

            const bx = Math.round(pos.x);
            const by = Math.round(pos.y);
            const bz = Math.round(pos.z);

            if (world.has(bx, by, bz)) return false;

            // Kiểm tra xem vị trí đặt block có đang bị người chơi chiếm chỗ hay không
            if (isPlayerIntersecting && isPlayerIntersecting(bx, by, bz)) {
                console.warn("⚠️ Không thể đặt block đè lên người chơi!");
                return false;
            }

            world.addBlock(bx, by, bz, selectedType);
            return true;
        }
        return false;
    }

    return { placeBlock, breakBlock: ... }; // Giữ nguyên các phần khác
}
