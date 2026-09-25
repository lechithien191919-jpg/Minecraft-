export const BLOCK_TYPES = {
    GRASS: 'grass',
    DIRT: 'dirt',
    STONE: 'stone',
    WOOD: 'wood'
};

export function getBlockMaterial(type) {
    // Sử dụng màu sắc tiêu chuẩn để đảm bảo an toàn tuyệt đối, không phụ thuộc vào file ảnh texture bên ngoài gây lỗi 404/màn hình đen
    let color = 0x888888;
    switch (type) {
        case BLOCK_TYPES.GRASS: color = 0x559933; break;
        case BLOCK_TYPES.DIRT:  color = 0x8b5a2b; break;
        case BLOCK_TYPES.STONE: color = 0x7f7f7f; break;
        case BLOCK_TYPES.WOOD:  color = 0xa0522d; break;
    }
    return new THREE.MeshLambertMaterial({ color: color });
}
