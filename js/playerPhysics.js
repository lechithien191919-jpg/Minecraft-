/**
 * playerPhysics.js — Quản lý va chạm và thông số vật lý của Player (STEP 1)
 * Trạng thái: Chỉ thiết lập cấu trúc AABB và thông số, CHƯA BẬT GRAVITY.
 */

export function createPlayerPhysics(config) {
    const { camera, world } = config;

    // AABB MVP cho Player theo đúng quy chuẩn
    const playerBox = {
        width: 0.6,
        height: 1.8,
        depth: 0.6
    };

    // Hệ thống Vector và Velocity (Tái sử dụng, không tạo mới liên tục mỗi frame)
    const velocity = { x: 0, y: 0, z: 0 };
    const gravity = 0.00; // CHƯA BẬT GRAVITY Ở STEP 1
    const isJumping = false;

    // Hàm lấy giới hạn AABB hiện tại của Player dựa vào vị trí camera (đóng vai trò đầu/mắt player)
    function getPlayerAABB() {
        const pos = camera.position;
        return {
            minX: pos.x - playerBox.width / 2,
            maxX: pos.x + playerBox.width / 2,
            minY: pos.y - playerBox.height, // Camera nằm ở phía trên (mắt), trừ chiều cao ra chân
            maxY: pos.y,
            minZ: pos.z - playerBox.depth / 2,
            maxZ: pos.z + playerBox.depth / 2
        };
    }

    // Cập nhật vật lý mỗi frame (STEP 1: Chưa kích hoạt gravity/rơi tự do)
    function update(deltaTime) {
        // STEP 1 chưa làm gì ở đây để giữ nguyên toàn bộ hành vi di chuyển cũ của game
    }

    return {
        playerBox,
        velocity,
        getPlayerAABB,
        update
    };
}
