export const BLOCK_TYPES = {
    GRASS: 'grass',
    DIRT: 'dirt',
    STONE: 'stone'
};

// Hàm tạo vật liệu 3D cho từng loại block
export function getBlockMaterial(type) {
    let color = 0x888888;
    switch (type) {
        case BLOCK_TYPES.GRASS: 
            color = 0x559933; // Xanh lá đặc trưng của cỏ
            break; 
        case BLOCK_TYPES.DIRT:  
            color = 0x8b5a2b; // Nâu đất
            break; 
        case BLOCK_TYPES.STONE: 
            color = 0x7f7f7f; // Xám đá
            break;
    }
    // Dùng MeshLambertMaterial để bắt sáng 3D chân thực
    return new THREE.MeshLambertMaterial({ color: color });
}
