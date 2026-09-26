/**
 * playerPhysics.js — Quản lý va chạm và thông số vật lý của Player (STEP 1: Chỉnh chiều cao)
 */

export function createPlayerPhysics(config) {
    const { camera, world } = config;

    // Cập nhật AABB mới theo yêu cầu STEP 1
    const playerBox = {
        width: 0.6,
        height: 2.0,
        depth: 0.6
    };

    const eyeHeight = 1.7; // Chiều cao tầm mắt chuẩn xác
    const velocity = { x: 0, y: 0, z: 0 };
    const gravity = 0.00; // Giữ nguyên chưa bật gravity ở bước này

    function getPlayerAABB() {
        const pos = camera.position;
        return {
            minX: pos.x - playerBox.width / 2,
            maxX: pos.x + playerBox.width / 2,
            minY: pos.y - eyeHeight, // Chân player dựa trên eye height
            maxY: pos.y + (playerBox.height - eyeHeight),
            minZ: pos.z - playerBox.depth / 2,
            maxZ: pos.z + playerBox.depth / 2
        };
    }

    function update(deltaTime) {
        // Chưa kích hoạt hành vi va chạm/rơi tự do ở bước này
    }

    return {
        playerBox,
        eyeHeight,
        velocity,
        getPlayerAABB,
        update
    };
}

