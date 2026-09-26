/**
 * blocks.js — Tối ưu hóa texture pixel nhẹ mượt cho mobile
 */

export const BLOCK_TYPES = {
    GRASS: 'grass',
    DIRT: 'dirt',
    STONE: 'stone',
    WOOD: 'wood',
    LEAVES: 'leaves'
};

let cachedMaterials = null;

export function createBlockMaterials() {
    if (cachedMaterials) return cachedMaterials;

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

    const dirtTex = createPixelTexture(ctx => {
        ctx.fillStyle = '#8B5A2B';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#6F441F';
        for(let i = 0; i < 15; i++) ctx.fillRect((i * 3) % 16, (i * 7) % 16, 1, 1);
    });

    const grassTopTex = createPixelTexture(ctx => {
        ctx.fillStyle = '#559933';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#448822';
        for(let i = 0; i < 12; i++) ctx.fillRect((i * 4) % 16, (i * 5) % 16, 1, 1);
    });

    const grassSideTex = createPixelTexture(ctx => {
        ctx.fillStyle = '#8B5A2B';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#559933';
        ctx.fillRect(0, 0, 16, 5);
    });

    const stoneTex = createPixelTexture(ctx => {
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#606060';
        for(let i = 0; i < 15; i++) ctx.fillRect((i * 5) % 16, (i * 3) % 16, 1, 1);
    });

    const woodTex = createPixelTexture(ctx => {
        ctx.fillStyle = '#5c4033';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#3d2817';
        ctx.fillRect(3, 0, 2, 16);
        ctx.fillRect(10, 0, 2, 16);
    });

    const leavesTex = createPixelTexture(ctx => {
        ctx.fillStyle = '#2e8b57';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#1e5f3b';
        for(let i = 0; i < 20; i++) ctx.fillRect((i * 3) % 16, (i * 4) % 16, 2, 2);
    });

    cachedMaterials = {
        dirt: new THREE.MeshBasicMaterial({ map: dirtTex }),
        stone: new THREE.MeshBasicMaterial({ map: stoneTex }),
        wood: new THREE.MeshBasicMaterial({ map: woodTex }),
        leaves: new THREE.MeshBasicMaterial({ map: leavesTex }),
        grass: [
            grassSideTex, grassSideTex, grassTopTex, dirtTex, grassSideTex, grassSideTex
        ].map(tex => new THREE.MeshBasicMaterial({ map: tex }))
    };

    return cachedMaterials;
}
