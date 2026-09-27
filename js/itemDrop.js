import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { EventBus } from './eventBus.js';
import { BLOCK_TYPES } from './blocks.js';

export function createItemDrop({ scene, world, inventory }) {
    const items = [];
    const MAX_ITEMS = 30;
    const DESPAWN_MS = 90000;
    const PICKUP_RADIUS = 1.5;
    const ITEM_SIZE = 0.3;

    const sharedGeo = new THREE.BoxGeometry(ITEM_SIZE, ITEM_SIZE, ITEM_SIZE);

    // Tái sử dụng Vector3 để tránh tạo mới mỗi frame (bảo vệ GC)
    const _itemPos = new THREE.Vector3();
    const _playerPos = new THREE.Vector3();

    function spawnItem(x, y, z, type) {
        // Chỉ cho phép WOOD và LEAVES, chặn các loại khác
        if (type !== 'wood' && type !== 'leaves') return;

        // Nếu vượt quá MAX_ITEMS, xóa item cũ nhất (FIFO)
        if (items.length >= MAX_ITEMS) {
            const oldest = items.shift();
            if (oldest && oldest.mesh) {
                scene.remove(oldest.mesh);
                // Không dispose geometry/material chung vì dùng shared
            }
        }

        // Lấy material trực tiếp từ BLOCK_TYPES, KHÔNG clone, KHÔNG dispose
        const blockDef = BLOCK_TYPES[type];
        const material = blockDef ? blockDef.material : new THREE.MeshBasicMaterial({ color: 0x888888 });

        const mesh = new THREE.Mesh(sharedGeo, material);
        mesh.position.set(x, y, z);
        scene.add(mesh);

        const itemData = {
            mesh,
            type,
            createdAt: performance.now(),
            pickedUp: false,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                5.0, // lực tung nhẹ lên trên khi rơi ra
                (Math.random() - 0.5) * 2
            )
        };

        items.push(itemData);

        console.log(`[CP1 SPAWN] type=${type} | pos=(${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}) | total=${items.length}`);
    }

    function update(dt, playerPos) {
        const now = performance.now();
        if (playerPos) {
            _playerPos.set(playerPos.x, playerPos.y, playerPos.z);
        }

        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];

            // 1. Race guard bắt buộc
            if (item.pickedUp) continue;

            // 2. Despawn TRƯỚC (check timer 90s)
            if (now - item.createdAt > DESPAWN_MS) {
                item.pickedUp = true;
                scene.remove(item.mesh);
                items.splice(i, 1);
                continue;
            }

            // 3. Rơi nhẹ (gravity 15.0, dừng ở y = -10)
            if (item.mesh.position.y > -10) {
                item.velocity.y -= 15.0 * dt;
                item.mesh.position.y += item.velocity.y * dt;
                if (item.mesh.position.y <= -10) {
                    item.mesh.position.y = -10;
                    item.velocity.set(0, 0, 0);
                }
            }

            // 4. Xoay liên tục
            item.mesh.rotation.y += dt * 1.5;
            item.mesh.rotation.x += dt * 1.0;

            // 5. Pickup SAU (check khoảng cách player ≤ 1.5)
            if (playerPos) {
                _itemPos.copy(item.mesh.position);
                const distSq = _itemPos.distanceToSquared(_playerPos);
                if (distSq <= PICKUP_RADIUS * PICKUP_RADIUS) {
                    item.pickedUp = true; // Bật race guard
                    inventory.addItem(item.type, 1); // Cộng trực tiếp vào inventory
                    scene.remove(item.mesh);
                    items.splice(i, 1);
                }
            }
        }
    }

    return { 
        spawnItem, 
        update, 
        getItems: () => [...items], 
        clear: () => {
            items.forEach(item => scene.remove(item.mesh));
            items.length = 0;
        } 
    };
}
