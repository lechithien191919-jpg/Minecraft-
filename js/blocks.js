export const BLOCK_TYPES = {
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    WOOD: 4,
    LEAVES: 5,
    SAND: 6,
    GLASS: 7,
    WATER: 8,
    DIAMOND_ORE: 9
};

export const BLOCK_DATA = {
    [BLOCK_TYPES.GRASS]: {
        name: "Cỏ",
        material: [
            new THREE.MeshLambertMaterial({ color: 0x8B5A2B }), // phải
            new THREE.MeshLambertMaterial({ color: 0x8B5A2B }), // trái
            new THREE.MeshLambertMaterial({ color: 0x559933 }), // trên
            new THREE.MeshLambertMaterial({ color: 0x8B5A2B }), // dưới
            new THREE.MeshLambertMaterial({ color: 0x8B5A2B }), // trước
            new THREE.MeshLambertMaterial({ color: 0x8B5A2B })  // sau
        ]
    },
    [BLOCK_TYPES.DIRT]: {
        name: "Đất",
        material: new THREE.MeshLambertMaterial({ color: 0x8B5A2B })
    },
    [BLOCK_TYPES.STONE]: {
        name: "Đá",
        material: new THREE.MeshLambertMaterial({ color: 0x808080 })
    },
    [BLOCK_TYPES.WOOD]: {
        name: "Gỗ",
        material: new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    },
    [BLOCK_TYPES.LEAVES]: {
        name: "Lá cây",
        material: new THREE.MeshLambertMaterial({ color: 0x228B22, transparent: true, opacity: 0.9 })
    },
    [BLOCK_TYPES.SAND]: {
        name: "Cát",
        material: new THREE.MeshLambertMaterial({ color: 0xF4A460 })
    },
    [BLOCK_TYPES.GLASS]: {
        name: "Kính",
        material: new THREE.MeshLambertMaterial({ color: 0xADD8E6, transparent: true, opacity: 0.5 })
    },
    [BLOCK_TYPES.WATER]: {
        name: "Nước",
        material: new THREE.MeshLambertMaterial({ color: 0x1E90FF, transparent: true, opacity: 0.6 })
    },
    [BLOCK_TYPES.DIAMOND_ORE]: {
        name: "Quặng Kim Cương",
        material: new THREE.MeshLambertMaterial({ color: 0x00CED1 })
    }
};

export function getBlockMaterial(type) {
    const block = BLOCK_DATA[type];
    return block ? block.material : new THREE.MeshLambertMaterial({ color: 0xffffff });
}
