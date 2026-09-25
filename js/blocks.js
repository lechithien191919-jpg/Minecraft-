// Định nghĩa các loại block cơ bản trong v0.1
export const BLOCK_TYPES = {
    GRASS: 1,
    DIRT: 2,
    STONE: 3
};

export const BLOCK_DATA = {
    [BLOCK_TYPES.GRASS]: {
        name: "Cỏ",
        colors: [
            0x559933, // Trên (Cỏ xanh)
            0x8B5A2B, // Xung quanh (Đất)
            0x8B5A2B  // Dưới (Đất)
        ]
    },
    [BLOCK_TYPES.DIRT]: {
        name: "Đất",
        color: 0x8B5A2B
    },
    [BLOCK_TYPES.STONE]: {
        name: "Đá",
        color: 0x808080
    }
};

// Tạo vật liệu (Materials) đơn giản cho từng loại block
export function getBlockMaterial(type) {
    if (type === BLOCK_TYPES.GRASS) {
        return [
            new THREE.MeshLambertMaterial({ color: 0x8B5A2B }), // phải
            new THREE.MeshLambertMaterial({ color: 0x8B5A2B }), // trái
            new THREE.MeshLambertMaterial({ color: 0x559933 }), // trên
            new THREE.MeshLambertMaterial({ color: 0x8B5A2B }), // dưới
            new THREE.MeshLambertMaterial({ color: 0x8B5A2B }), // trước
            new THREE.MeshLambertMaterial({ color: 0x8B5A2B })  // sau
        ];
    } else if (type === BLOCK_TYPES.DIRT) {
        return new THREE.MeshLambertMaterial({ color: 0x8B5A2B });
    } else {
        return new THREE.MeshLambertMaterial({ color: 0x808080 });
    }
}
