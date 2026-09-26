/**
 * playerPhysics.js — Quản lý va chạm và thông số vật lý của Player
 */

export function createPlayerPhysics(config) {
    const { camera, world } = config;

    // AABB MVP cho Player
    const playerBox = {
        width: 0.6,
        height: 2.0,
        depth: 0.6
    };

    const eyeHeight = 1.7; // Tầm mắt chuẩn 2 block
    const velocity = { x: 0, y: 0, z: 0 };
    const gravity = 0.00; // Có thể bật nhẹ hoặc giữ 0 tùy ý, hiện tại giữ 0 để test va chạm ngang trước

    // Lấy hộp AABB của player tại một vị trí giả định (x, y, z)
    function getBoxAt(x, y, z) {
        return {
            minX: x - playerBox.width / 2,
            maxX: x + playerBox.width / 2,
            minY: y - eyeHeight,
            maxY: y + (playerBox.height - eyeHeight),
            minZ: z - playerBox.depth / 2,
            maxZ: z + playerBox.depth / 2
        };
    }

    function getPlayerAABB() {
        return getBoxAt(camera.position.x, camera.position.y, camera.position.z);
    }

    // Kiểm tra xem hộp AABB có chạm block nào đang tồn tại trong thế giới không
    function checkCollision(targetPos) {
        const box = getBoxAt(targetPos.x, targetPos.y, targetPos.z);

        // Quét các ô block xung quanh vị trí player để tối ưu hiệu năng va chạm
        const startX = Math.floor(box.minX);
        const endX = Math.floor(box.maxX);
        const startY = Math.floor(box.minY);
        const endY = Math.floor(box.maxY);
        const startZ = Math.floor(box.minZ);
        const endZ = Math.floor(box.maxZ);

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                for (let z = startZ; z <= endZ; z++) {
                    if (world.has(x, y, z)) {
                        // Định nghĩa AABB của block (1x1x1)
                        const blockBox = {
                            minX: x - 0.5, maxX: x + 0.5,
                            minY: y - 0.5, maxY: y + 0.5,
                            minZ: z - 0.5, maxZ: z + 0.5
                        };

                        // Kiểm tra giao nhau giữa 2 hình hộp (AABB collision)
                        if (
                            box.minX < blockBox.maxX && box.maxX > blockBox.minX &&
                            box.minY < blockBox.maxY && box.maxY > blockBox.minY &&
                            box.minZ < blockBox.maxZ && box.maxZ > blockBox.minZ
                        ) {
                            return true; // Có va chạm!
                        }
                    }
                }
            }
        }
        return false; // Không va chạm, đi thoải mái
    }

    return {
        playerBox,
        eyeHeight,
        velocity,
        getPlayerAABB,
        checkCollision
    };
}

