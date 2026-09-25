export const BLOCK_TYPES = {
    GRASS: 'grass',
    DIRT: 'dirt',
    STONE: 'stone'
};

export function getBlockMaterial(type) {
    let color = 0x888888;
    switch (type) {
        case BLOCK_TYPES.GRASS: color = 0x559933; break; // Xanh lá cỏ Minecraft
        case BLOCK_TYPES.DIRT:  color = 0x8b5a2b; break; // Nâu đất
        case BLOCK_TYPES.STONE: color = 0x7f7f7f; break; // Xám đá
    }
    return new THREE.MeshLambertMaterial({ color: color });
}
