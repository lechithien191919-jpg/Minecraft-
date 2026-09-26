// js/itemDrop.js
import * as THREE from 'three';
import { EventBus } from './eventBus.js';
import { BLOCK_TYPES } from './blocks.js';

export function createItemDrop({ scene, world }) {
    const items = [];
    const MAX_ITEMS = 30;
    const DESPAWN_MS = 90000;
    const PICKUP_RADIUS = 1.5;
    const ITEM_SIZE = 0.3;
    const GRAVITY_ITEM = 15.0;
    const STOP_Y = -10;

    // Share geometry — tạo 1 lần
    const sharedGeo = new THREE.BoxGeometry(ITEM_SIZE, ITEM_SIZE, ITEM_SIZE);

    function spawnItem(x, y, z, type) {
        // Chỉ spawn cho WOOD và LEAVES
        if (type !== BLOCK_TYPES.WOOD && type !== BLOCK_TYPES.LEAVES) return;

        // Max items — xóa cái cũ nhất
        if (items.length >= MAX_ITEMS) {
            const oldest = items.shift();
            scene.remove(oldest.mesh);
            console.log(`[CASE ITEM] despawn: type=${oldest.type} | reason=max_items | total=${items.length}`);
        }

        // Material — SHARE reference trực tiếp từ BLOCK_TYPES, không clone
        const material = BLOCK_TYPES[type]?.material || BLOCK_TYPES.WOOD.material;

        const mesh = new THREE.Mesh(sharedGeo, material);
        mesh.position.set(x, y + 0.5, z);
        scene.add(mesh);

        items.push({
            mesh,
            type,
            velocityY: 0,
            spawnTime: performance.now()
        });

        console.log(`[CASE ITEM] spawn: type=${type} | pos=(${x}, ${y}, ${z}) | total=${items.length}`);
    }

    function update(dt, playerPos) {
        const now = performance.now();

        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];

            // 1. Despawn timer
            if (now - item.spawnTime > DESPAWN_MS) {
                scene.remove(item.mesh);
                items.splice(i, 1);
                console.log(`[CASE ITEM] despawn: type=${item.type} | reason=timeout | total=${items.length}`);
                continue;
            }

            // 2. Rơi nhẹ
            item.velocityY -= GRAVITY_ITEM * dt;
            item.mesh.position.y += item.velocityY * dt;

            // 3. Dừng khi chạm mặt đất hoặc STOP_Y
            if (item.mesh.position.y <= STOP_Y) {
                item.mesh.position.y = STOP_Y;
                item.velocityY = 0;
            } else {
                const checkPos = { x: item.mesh.position.x, y: item.mesh.position.y - ITEM_SIZE, z: item.mesh.position.z };
                if (world.has(Math.floor(checkPos.x), Math.floor(checkPos.y), Math.floor(checkPos.z))) {
                    item.mesh.position.y = Math.floor(checkPos.y) + 0.5 + ITEM_SIZE / 2;
                    item.velocityY = 0;
                }
            }

            // 4. Xoay nhẹ cho đẹp
            item.mesh.rotation.y += dt * 1.5;

            // 5. Pickup check
            if (playerPos) {
                const dx = playerPos.x - item.mesh.position.x;
                const dy = playerPos.y - item.mesh.position.y;
                const dz = playerPos.z - item.mesh.position.z;
                if (dx * dx + dy * dy + dz * dz < PICKUP_RADIUS * PICKUP_RADIUS) {
                    scene.remove(item.mesh);
                    items.splice(i, 1);
                    console.log(`[CASE ITEM] pickup: type=${item.type} | pos=(${item.mesh.position.x.toFixed(1)}, ${item.mesh.position.y.toFixed(1)}, ${item.mesh.position.z.toFixed(1)}) | total=${items.length}`);
                    EventBus.emit('item:picked', { type: item.type });
                }
            }
        }
    }

    // Nghe event block broken
    EventBus.on('block:broken', (data) => {
        spawnItem(data.x, data.y, data.z, data.type);
    });

    return { spawnItem, update };
}
