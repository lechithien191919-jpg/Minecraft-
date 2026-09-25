export const BLOCK_TYPES = {
    GRASS: 'grass',
    DIRT: 'dirt',
    STONE: 'stone'
};

export function getBlockMaterial(type) {
    let color = 0x559933; // Mặc định xanh cỏ
    switch (type) {
        case BLOCK_TYPES.GRASS: color = 0x559933; break;
        case BLOCK_TYPES.DIRT:  color = 0x8b5a2b; break; // Nâu đất
        case BLOCK_TYPES.STONE: color = 0x7f7f7f; break; // Xám đá
    }
    // Dùng MeshBasicMaterial để sáng rõ, nhẹ, không kén thiết bị di động
    return new THREE.MeshBasicMaterial({ color: color });
}

