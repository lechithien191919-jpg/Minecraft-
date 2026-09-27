import { EventBus } from './eventBus.js';
import { BLOCK_TYPES } from './blocks.js';

console.log('🟢 itemDrop.js đã load thành công và sẵn sàng!');

export function createItemDrop({ scene, world, inventory }) {
    const items = [];
    const MAX_ITEMS = 30;
    const DESPAWN_MS = 90000;
    const PICKUP_RADIUS = 1.5;
    const ITEM_SIZE = 0.5; // Kích thước hiển thị rõ trên mobile

    const sharedGeo = new THREE.BoxGeometry(ITEM_SIZE, ITEM_SIZE, ITEM_SIZE);

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
            }
        }

        const blockDef = BLOCK_TYPES[type];
        const material = blockDef ? blockDef.material : new THREE.MeshBasicMaterial({ color: 0x888888 });

        const mesh = new THREE.Mesh(sharedGeo, material);
        
        // Canh tọa độ spawn vào giữa tâm block và nhỉnh lên phía trên để không bị kẹt hay rớt xuyên sàn
        mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
        scene.add(mesh);

        const itemData = {
            mesh,
            type,
            createdAt: performance.now(),
            pickedUp: false,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                2.0,
                (Math.random() - 0.5) * 2
            )
        };

        items.push(itemData);

        console.log(`[CP1 SPAWN] type=${type} | pos=(${x}, ${y}, ${z}) | total=${items.length}`);
    }

    function update(dt, playerPos) {
        const now = performance.now();
        if (playerPos) {
            _playerPos.set(playerPos.x, playerPos.y, playerPos.z);
        }

        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];

            if (item.pickedUp) continue;

            if (now - item.createdAt > DESPAWN_MS) {
                item.pickedUp = true;
                scene.remove(item.mesh);
                items.splice(i, 1);
                continue;
            }

            if (item.mesh.position.y > -10) {
                item.velocity.y -= 15.0 * dt;
                item.mesh.position.y += item.velocity.y * dt;
                if (item.mesh.position.y <= -10) {
                    item.mesh.position.y = -10;
                    item.velocity.set(0, 0, 0);
                }
            }

            item.mesh.rotation.y += dt * 1.5;
            item.mesh.rotation.x += dt * 1.0;

            if (playerPos) {
                _itemPos.copy(item.mesh.position);
                const distSq = _itemPos.distanceToSquared(_playerPos);
                if (distSq <= PICKUP_RADIUS * PICKUP_RADIUS) {
                    item.pickedUp = true;
                    inventory.addItem(item.type, 1);
                    scene.remove(item.mesh);
                    items.splice(i, 1);
                }
            }
        }
    }

    // Lắng nghe sự kiện block bị đập vỡ từ blockInteraction.js
    EventBus.on('block:broken', (data) => {
        spawnItem(data.x, data.y, data.z, data.type);
    });

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

