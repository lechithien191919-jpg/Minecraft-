/**
 * blocks.js — Định nghĩa các loại block và màu sắc/material tương ứng
 */

export const BLOCK_TYPES = {
    GRASS: 'grass',
    DIRT: 'dirt',
    STONE: 'stone',
    WOOD: 'wood',
    LEAVES: 'leaves'
};

export function getBlockMaterial(type) {
    let color = 0x559933; // Mặc định xanh cỏ
    switch (type) {
        case BLOCK_TYPES.GRASS: color = 0x559933; break; // Xanh cỏ
        case BLOCK_TYPES.DIRT: color = 0x8B5A2B; break; // Nâu đất
        case BLOCK_TYPES.STONE: color = 0x7f7f7f; break; // Xám đá
        case BLOCK_TYPES.WOOD: color = 0x5c4033; break; // Nâu gỗ
        case BLOCK_TYPES.LEAVES: color = 0x2e8b57; break; // Xanh lá cây
    }
    // Dùng MeshBasicMaterial để sáng rõ, nhẹ, không kén thiết bị di động
    return new THREE.MeshBasicMaterial({ color: color });
}
