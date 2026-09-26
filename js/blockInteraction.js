// js/blockInteraction.js
import * as THREE from 'three';
import { BLOCK_TYPES } from './blocks.js';
import { EventBus } from './eventBus.js';

export function createBlockInteraction({ camera, scene, world, raycaster, hud }) {
    let selectedBlockType = BLOCK_TYPES.WOOD; // Mặc định loại block đặt là gỗ

    // Thiết lập giao diện hoặc phím bấm chọn loại block nếu cần
    window.setBlockType = (type) => {
        if (BLOCK_TYPES[type]) {
            selectedBlockType = BLOCK_TYPES[type];
            console.log(`🧱 Đã đổi block type sang: ${type}`);
        }
    };

    // Hàm đập block (Break Block)
    function breakBlock() {
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        // Lọc các đối tượng là khối voxel trong thế giới
        const validIntersects = intersects.filter(hit => {
            return hit.object && hit.object.userData && hit.object.userData.isVoxelWorld;
        });

        if (validIntersects.length > 0) {
            const hit = validIntersects[0];
            if (hit.distance < 6.0) { // Tầm với tối đa
                const normal = hit.face.normal.clone();
                normal.transformDirection(hit.object.matrixWorld);
                normal.round();

                // Tính tọa độ block cần đập
                const position = hit.point.clone().sub(normal.clone().multiplyScalar(0.5));
                const x = Math.floor(position.x);
                const y = Math.floor(position.y);
                const z = Math.floor(position.z);

                // Lấy thông tin block trước khi xóa để biết loại block (WOOD, LEAVES, v.v.)
                const targetType = world.get ? world.get(x, y, z) : null;

                // Thực hiện xóa block trong world
                const success = world.removeBlock ? world.removeBlock(x, y, z) : false;

                if (success) {
                    console.log(`⛏️ Đã đập block tại (${x}, ${y}, ${z})`);
                    // Phát sự kiện block bị đập để module itemDrop nhận và sinh vật phẩm
                    EventBus.emit('block:broken', { x, y, z, type: targetType });
                }
            }
        }
    }

    // Hàm đặt block (Place Block)
    function placeBlock() {
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        const validIntersects = intersects.filter(hit => {
            return hit.object && hit.object.userData && hit.object.userData.isVoxelWorld;
        });

        if (validIntersects.length > 0) {
            const hit = validIntersects[0];
            if (hit.distance < 6.0) {
                const normal = hit.face.normal.clone();
                normal.transformDirection(hit.object.matrixWorld);
                normal.round();

                // Tính tọa độ block mới cần đặt (cộng dồn theo hướng pháp tuyến mặt đối diện)
                const position = hit.point.clone().add(normal.clone().multiplyScalar(0.5));
                const x = Math.floor(position.x);
                const y = Math.floor(position.y);
                const z = Math.floor(position.z);

                if (world.addBlock) {
                    const success = world.addBlock(x, y, z, selectedBlockType);
                    if (success) {
                        console.log(`📦 Đã đặt block tại (${x}, ${y}, ${z})`);
                    }
                }
            }
        }
    }

    return {
        breakBlock,
        placeBlock
    };
}

