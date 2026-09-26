/**
 * blocks.js — Định nghĩa các loại block và tạo texture pixel trực tiếp
 */

export const BLOCK_TYPES = {
    GRASS: 'grass',
    DIRT: 'dirt',
    STONE: 'stone',
    WOOD: 'wood',
    LEAVES: 'leaves'
};

export function createBlockMaterials() {
    const createPixelTexture = (drawCallback) => {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        drawCallback(ctx);
        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    };

    // 1. Texture Đất (Dirt)
    const dirtTex = createPixelTexture(ctx => {
        ctx.fillStyle = '#8B5A2B';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#6F441F';
        for(let i = 0; i < 20; i++) ctx.fillRect(Math.random() * 16, Math.random() * 16, 1, 1);
    });

    // 2. Texture Cỏ (Grass Top & Side)
    const grassTopTex = createPixelTexture(ctx => {
        ctx.fillStyle = '#559933';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#448822';
        for(let i = 0; i < 15; i++) ctx.fillRect(Math.random() * 16, Math.random() * 16, 1, 1);
    });

    const grassSideTex = createPixelTexture(ctx => {
        ctx.fillStyle = '#8B5A2B';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#559933';
        ctx.fillRect(0, 0, 16, 5);
        ctx.fillRect(2, 5, 1, 2);
        ctx.fillRect(5, 5, 2, 3);
        ctx.fillRect(10, 5, 1, 2);
        ctx.fillRect(13, 5, 2, 1);
    });

    // 3. Texture Đá (Stone)
    const stoneTex = createPixelTexture(ctx => {
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#606060';
        for(let i = 0; i < 25; i++) ctx.fillRect(Math.random() * 16, Math.random() * 16, 1, 1);
    });

    // 4. Texture Gỗ (Wood) — Thân cây có vân sọc
    const woodTex = createPixelTexture(ctx => {
        ctx.fillStyle = '#5c4033';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#3d2817';
        for(let i = 0; i < 5; i++) {
            ctx.fillRect(i * 3 + 1, 0, 1, 16);
        }
    });

    // 5. Texture Lá (Leaves) — Xanh đậm có đốm lá
    const leavesTex = createPixelTexture(ctx => {
        ctx.fillStyle = '#2e8b57';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#1e5f3b';
        for(let i = 0; i < 35; i++) ctx.fillRect(Math.random() * 16, Math.random() * 16, 1, 1);
    });

    return {
        dirt: new THREE.MeshLambertMaterial({ map: dirtTex }),
        stone: new THREE.MeshLambertMaterial({ map: stoneTex }),
        wood: new THREE.MeshLambertMaterial({ map: woodTex }),
        leaves: new THREE.MeshLambertMaterial({ map: leavesTex }),
        grass: [
            grassSideTex, grassSideTex, grassTopTex, dirtTex, grassSideTex, grassSideTex
        ].map(tex => new THREE.MeshLambertMaterial({ map: tex }))
    };
}
