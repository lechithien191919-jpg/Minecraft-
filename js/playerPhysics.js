/**
 * playerPhysics.js — Xử lý va chạm chuẩn, ngăn chặn tuyệt đối việc đi xuyên block
 */
export function createPlayerPhysics({ camera, world }) {
    const playerRadius = 0.35; // Bán kính thân người chơi để không bị lún vào tường
    const playerHeight = 0.9;  // Chiều cao từ chân đến mắt camera

    return {
        checkCollision(pos) {
            // Tạo vùng hộp va chạm xung quanh người chơi
            const minX = pos.x - playerRadius;
            const maxX = pos.x + playerRadius;
            const minZ = pos.z - playerRadius;
            const maxZ = pos.z + playerRadius;
            
            // Xét từ chân đến đầu người chơi
            const minY = pos.y - playerHeight;
            const maxY = pos.y + 0.1;

            // Kiểm tra các điểm góc xung quanh thân và chiều cao nhân vật
            for (let x of [minX, maxX]) {
                for (let z of [minZ, maxZ]) {
                    for (let y of [minY, (minY + maxY) / 2, maxY]) {
                        const blockX = Math.round(x);
                        const blockY = Math.round(y);
                        const blockZ = Math.round(z);

                        if (world.has(blockX, blockY, blockZ)) {
                            return true; // Phát hiện có block cản đường -> Chặn lại ngay lập tức
                        }
                    }
                }
            }
            return false;
        }
    };
}

