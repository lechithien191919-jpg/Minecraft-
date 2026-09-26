// itemDrop.js
export function createItemDrop(options) {
    const scene = options.scene;
    const world = options.world;
    const items = [];

    function spawnItem(position, blockType) {
        const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        
        let color = 0x8b5a2b; 
        if (blockType === 3) color = 0x5c4033; // Gỗ
        else if (blockType === 4) color = 0x2e8b57; // Lá
        else if (blockType === 1) color = 0x559933; // Cỏ
        else if (blockType === 2) color = 0x7f7f7f; // Đá

        const material = new THREE.MeshStandardMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(
            position.x + (Math.random() - 0.5) * 0.5,
            position.y + 0.5,
            position.z + (Math.random() - 0.5) * 0.5
        );

        scene.add(mesh);

        items.push({
            mesh: mesh,
            type: blockType,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 3,
                4 + Math.random() * 2,
                (Math.random() - 0.5) * 3
            ),
            age: 0,
            maxAge: 90
        });
    }

    function update(dt, playerPosition) {
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            item.age += dt;

            if (item.age > item.maxAge || items.length > 30) {
                scene.remove(item.mesh);
                item.mesh.geometry.dispose();
                item.mesh.material.dispose();
                items.splice(i, 1);
                continue;
            }

            item.velocity.y -= 15 * dt;
            item.mesh.position.addScaledVector(item.velocity, dt);

            if (item.mesh.position.y < -0.5) {
                item.mesh.position.y = -0.5;
                item.velocity.y = -item.velocity.y * 0.3;
                item.velocity.x *= 0.8;
                item.velocity.z *= 0.8;
            }

            item.mesh.rotation.x += 1.5 * dt;
            item.mesh.rotation.y += 2.0 * dt;

            const distance = item.mesh.position.distanceTo(playerPosition);
            if (distance < 1.5) {
                console.log(`[ITEM DROP] Đã nhặt item loại: ${item.type}`);
                scene.remove(item.mesh);
                item.mesh.geometry.dispose();
                item.mesh.material.dispose();
                items.splice(i, 1);
            }
        }
    }

    return {
        spawnItem,
        update
    };
}
