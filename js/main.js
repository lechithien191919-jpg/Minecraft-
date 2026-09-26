class Checkpoint5InteractionGame {
    constructor() {
        try {
            this.initThree();
            this.initWorld();
            this.initHotbarUI();
            this.initControls();
            this.animate();
            console.log("🟢 Checkpoint 5 Block Interaction System đã khởi chạy thành công!");
        } catch (error) {
            this.showError(error);
        }
    }

    initThree() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 3, 5);

        this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const canvas = this.renderer.domElement;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '1';
        canvas.style.touchAction = 'none';
        document.body.appendChild(canvas);

        const light = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(light);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        this.scene.add(dirLight);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    createBlockMaterials() {
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
            for(let i=0; i<20; i++) ctx.fillRect(Math.random()*16, Math.random()*16, 1, 1);
        });

        const grassTopTex = createPixelTexture(ctx => {
            ctx.fillStyle = '#559933';
            ctx.fillRect(0, 0, 16, 16);
            ctx.fillStyle = '#448822';
            for(let i=0; i<15; i++) ctx.fillRect(Math.random()*16, Math.random()*16, 1, 1);
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

        const stoneTex = createPixelTexture(ctx => {
            ctx.fillStyle = '#808080';
            ctx.fillRect(0, 0, 16, 16);
            ctx.fillStyle = '#606060';
            for(let i=0; i<25; i++) ctx.fillRect(Math.random()*16, Math.random()*16, 1, 1);
        });

        return {
            dirt: new THREE.MeshLambertMaterial({ map: dirtTex }),
            stone: new THREE.MeshLambertMaterial({ map: stoneTex }),
            grass: [
                grassSideTex, grassSideTex, grassTopTex, dirtTex, grassSideTex, grassSideTex
            ].map(tex => new THREE.MeshLambertMaterial({ map: tex }))
        };
    }

    initWorld() {
        this.blockMaterials = this.createBlockMaterials();

        const groundGeo = new THREE.BoxGeometry(40, 1, 40);
        this.ground = new THREE.Mesh(groundGeo, this.blockMaterials.grass);
        this.ground.position.set(0, -1, 0);
        this.scene.add(this.ground);

        this.worldBlocks = [];
        this.blockMeshMap = new Map(); // Dùng để tra cứu nhanh mesh -> object block

        const blockTypes = ['grass', 'dirt', 'stone'];
        const blockMats = [this.blockMaterials.grass, this.blockMaterials.dirt, this.blockMaterials.stone];

        let idCounter = 1;
        for (let i = -3; i <= 3; i += 2) {
            const typeIndex = (Math.abs(i) % 3);
            this.spawnBlock(i, 0.5, -5, blockTypes[typeIndex], blockMats[typeIndex], idCounter++);
        }
    }

    spawnBlock(x, y, z, type, material, id) {
        const blockGeo = new THREE.BoxGeometry(1, 1, 1);
        const blockMesh = new THREE.Mesh(blockGeo, material);
        blockMesh.position.set(x, y, z);
        this.scene.add(blockMesh);

        const blockData = {
            id: id || Date.now(),
            type: type,
            position: { x, y, z },
            mesh: blockMesh
        };

        this.worldBlocks.push(blockData);
        this.blockMeshMap.set(blockMesh.uuid, blockData);
        return blockData;
    }

    // --- 1. HOTBAR UI & SELECTION ---
    initHotbarUI() {
        this.selectedBlockType = 'grass';

        const hotbarContainer = document.createElement('div');
        hotbarContainer.style.position = 'fixed';
        hotbarContainer.style.bottom = '15px';
        hotbarContainer.style.left = '50%';
        hotbarContainer.style.transform = 'translateX(-50%)';
        hotbarContainer.style.display = 'flex';
        hotbarContainer.style.gap = '10px';
        hotbarContainer.style.background = 'rgba(0, 0, 0, 0.7)';
        hotbarContainer.style.padding = '10px 15px';
        hotbarContainer.style.borderRadius = '12px';
        hotbarContainer.style.zIndex = '9999';
        hotbarContainer.style.pointerEvents = 'auto';

        // Chặn hoàn toàn sự kiện lọt ra ngoài camera
        ['pointerdown', 'pointermove', 'pointerup', 'click', 'touchstart', 'touchend'].forEach(eventType => {
            hotbarContainer.addEventListener(eventType, (e) => e.stopPropagation());
        });

        const items = [
            { type: 'grass', label: '🌱 GRASS' },
            { type: 'dirt', label: '🟫 DIRT' },
            { type: 'stone', label: '🪨 STONE' }
        ];

        this.hotbarSlots = [];

        items.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.innerText = item.label;
            slot.style.width = '80px';
            slot.style.height = '45px';
            slot.style.background = index === 0 ? '#448822' : '#333333';
            slot.style.border = index === 0 ? '3px solid #ffff00' : '2px solid #ffffff';
            slot.style.borderRadius = '6px';
            slot.style.display = 'flex';
            slot.style.alignItems = 'center';
            slot.style.justifyContent = 'center';
            slot.style.fontSize = '11px';
            slot.style.color = '#ffffff';
            slot.style.fontWeight = 'bold';
            slot.style.cursor = 'pointer';
            slot.style.userSelect = 'none';

            slot.addEventListener('pointerdown', (e) => {
                e.stopPropagation();
                this.selectSlot(index, item.type);
            });

            hotbarContainer.appendChild(slot);
            this.hotbarSlots.push(slot);
        });

        document.body.appendChild(hotbarContainer);
    }

    selectSlot(index, type) {
        this.selectedBlockType = type;
        this.hotbarSlots.forEach((slot, i) => {
            if (i === index) {
                slot.style.border = '3px solid #ffff00';
                slot.style.background = type === 'grass' ? '#448822' : (type === 'dirt' ? '#8B5A2B' : '#707070');
            } else {
                slot.style.border = '2px solid #ffffff';
                slot.style.background = '#333333';
            }
        });
        console.log(`🎒 Đã chọn block từ Hotbar: ${type}`);
    }

    // --- 2. RAYCAST BREAK & PLACE ---
    breakBlock() {
        const raycaster = new THREE.Raycaster();
        const centerScreen = new THREE.Vector2(0, 0); // Tâm màn hình
        raycaster.setFromCamera(centerScreen, this.camera);

        const meshes = this.worldBlocks.map(b => b.mesh);
        const intersects = raycaster.intersectObjects(meshes, false);

        if (intersects.length > 0) {
            const hitMesh = intersects[0].object;
            const blockData = this.blockMeshMap.get(hitMesh.uuid);

            if (blockData) {
                // Xóa khỏi Scene
                this.scene.remove(hitMesh);
                hitMesh.geometry.dispose();
                // Nếu material là mảng (grass), dispose từng material
                if (Array.isArray(hitMesh.material)) {
                    hitMesh.material.forEach(m => m.dispose());
                } else {
                    hitMesh.material.dispose();
                }

                // Xóa khỏi danh sách quản lý
                this.blockMeshMap.delete(hitMesh.uuid);
                this.worldBlocks = this.worldBlocks.filter(b => b.id !== blockData.id);

                console.log(`⛏️ Đã đập block ID: ${blockData.id} tại vị trọng tâm!`);
            }
        } else {
            console.log("⛏️ Không có block nào trong tầm ngắm để đập!");
        }
    }

    placeBlock() {
        const raycaster = new THREE.Raycaster();
        const centerScreen = new THREE.Vector2(0, 0);
        raycaster.setFromCamera(centerScreen, this.camera);

        const meshes = this.worldBlocks.map(b => b.mesh);
        const intersects = raycaster.intersectObjects(meshes, false);

        if (intersects.length > 0) {
            const intersect = intersects[0];
            // Tính toán vị trí block mới dựa vào mặt chạm (face normal)
            const position = intersect.point.clone().add(intersect.face.normal.clone().multiplyScalar(0.5));
            
            // Làm tròn tọa độ về lưới ô vuông (grid 1x1)
            const posX = Math.round(position.x);
            const posY = Math.round(position.y);
            const posZ = Math.round(position.z);

            // Kiểm tra xem vị trí đó đã có block nào chưa
            const existing = this.worldBlocks.some(b => 
                Math.abs(b.position.x - posX) < 0.1 &&
                Math.abs(b.position.y - posY) < 0.1 &&
                Math.abs(b.position.z - posZ) < 0.1
            );

            if (existing) {
                console.log("⚠️ Vị trí này đã có block, không thể đặt đè!");
                return;
            }

            // Lấy material tương ứng với block đang chọn ở Hotbar
            let mat = this.blockMaterials.grass;
            if (this.selectedBlockType === 'dirt') mat = this.blockMaterials.dirt;
            if (this.selectedBlockType === 'stone') mat = this.blockMaterials.stone;

            this.spawnBlock(posX, posY, posZ, this.selectedBlockType, mat);
            console.log(`🧱 Đã đặt block ${this.selectedBlockType} tại (${posX}, ${posY}, ${posZ})`);
        } else {
            console.log("🧱 Quá xa hoặc không nhắm vào block nào để đặt!");
        }
    }

    // --- 3. CONTROLS & MULTITOUCH ĐỘC LẬP ---
    initControls() {
        this.player = {
            position: this.camera.position,
            velocity: new THREE.Vector3(),
            speed: 0.08,
            isJumping: false
        };

        this.lon = 0;
        this.lat = 0;
        this.targetLon = 0;
        this.targetLat = 0;
        this.moveVector = new THREE.Vector2(0, 0);

        const ui = document.createElement('div');
        ui.style.position = 'fixed';
        ui.style.top = '0';
        ui.style.left = '0';
        ui.style.width = '100%';
        ui.style.height = '100%';
        ui.style.zIndex = '999';
        ui.style.pointerEvents = 'none';
        document.body.appendChild(ui);

        // --- NÚT BẤM PHẢI (NHẢY, ĐẶT, ĐẬP) ---
        const btnBox = document.createElement('div');
        btnBox.style.position = 'absolute';
        btnBox.style.right = '20px';
        btnBox.style.bottom = '80px';
        btnBox.style.display = 'grid';
        btnBox.style.gridTemplateColumns = 'repeat(2, 60px)';
        btnBox.style.gap = '8px';
        btnBox.style.pointerEvents = 'auto';

        ['pointerdown', 'pointermove', 'pointerup', 'click'].forEach(eventType => {
            btnBox.addEventListener(eventType, (e) => e.stopPropagation());
        });

        const actions = [
            { text: 'ĐỔI', cb: () => {} },
            { text: 'NHẢY', cb: () => this.jump() },
            { text: 'ĐẶT', cb: () => this.placeBlock() },
            { text: 'ĐẬP', cb: () => this.breakBlock() }
        ];

        actions.forEach(item => {
            const b = document.createElement('button');
            b.innerText = item.text;
            b.style.width = '60px';
            b.style.height = '60px';
            b.style.borderRadius = '50%';
            b.style.background = 'rgba(0, 0, 0, 0.6)';
            b.style.color = '#fff';
            b.style.border = '2px solid #fff';
            b.style.fontWeight = 'bold';
            b.style.pointerEvents = 'auto';

            b.addEventListener('pointerdown', (e) => {
                e.stopPropagation();
                item.cb();
            });

            btnBox.appendChild(b);
        });
        ui.appendChild(btnBox);

        // --- JOYSTICK TRÁI ---
        const outerSize = 120;
        const innerSize = 50;

        const joyOuter = document.createElement('div');
        joyOuter.style.position = 'absolute';
        joyOuter.style.left = '30px';
        joyOuter.style.bottom = '80px';
        joyOuter.style.width = `${outerSize}px`;
        joyOuter.style.height = `${outerSize}px`;
        joyOuter.style.borderRadius = '50%';
        joyOuter.style.background = 'rgba(255, 255, 255, 0.2)';
        joyOuter.style.border = '2px solid rgba(255, 255, 255, 0.5)';
        joyOuter.style.pointerEvents = 'auto';
        joyOuter.style.touchAction = 'none';

        const joyInner = document.createElement('div');
        joyInner.style.position = 'absolute';
        joyInner.style.left = `${(outerSize - innerSize) / 2}px`;
        joyInner.style.top = `${(outerSize - innerSize) / 2}px`;
        joyInner.style.width = `${innerSize}px`;
        joyInner.style.height = `${innerSize}px`;
        joyInner.style.borderRadius = '50%';
        joyInner.style.background = 'rgba(255, 255, 255, 0.8)';
        joyInner.style.pointerEvents = 'none';

        joyOuter.appendChild(joyInner);
        ui.appendChild(joyOuter);

        let joyActive = false;
        let joyPointerId = null;
        let center = { x: 0, y: 0 };
        const maxDist = 35;

        joyOuter.addEventListener('pointerdown', (e) => {
            if (!joyActive) {
                joyActive = true;
                joyPointerId = e.pointerId;
                const r = joyOuter.getBoundingClientRect();
                center.x = r.left + r.width / 2;
                center.y = r.top + r.height / 2;
                e.stopPropagation();
            }
        });

        // --- XOAY CAMERA ĐỘC LẬP MULTITOUCH ---
        let activeLookPointers = new Map();

        window.addEventListener('pointerdown', (e) => {
            if (e.clientX < 180 && e.clientY > window.innerHeight - 220) return;
            if (e.clientX > window.innerWidth - 160 && e.clientY > window.innerHeight - 220) return;
            if (e.clientY > window.innerHeight - 70) return;

            if (e.pointerId !== joyPointerId) {
                activeLookPointers.set(e.pointerId, { lastX: e.clientX, lastY: e.clientY });
            }
        });

        window.addEventListener('pointermove', (e) => {
            if (joyActive && e.pointerId === joyPointerId) {
                const dx = e.clientX - center.x;
                const dy = e.clientY - center.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                const d = Math.min(dist, maxDist);

                const mx = Math.cos(angle) * d;
                const my = Math.sin(angle) * d;

                joyInner.style.transform = `translate(${mx}px, ${my}px)`;
                this.moveVector.set(mx / maxDist, my / maxDist);
            }

            if (activeLookPointers.has(e.pointerId)) {
                const pData = activeLookPointers.get(e.pointerId);
                const deltaX = e.clientX - pData.lastX;
                const deltaY = e.clientY - pData.lastY;

                this.targetLon -= deltaX * 0.4;
                this.targetLat += deltaY * 0.4;
                this.targetLat = Math.max(-85, Math.min(85, this.targetLat));

                pData.lastX = e.clientX;
                pData.lastY = e.clientY;
            }
        });

        const releasePointer = (e) => {
            if (e.pointerId === joyPointerId) {
                joyActive = false;
                joyPointerId = null;
                joyInner.style.transform = `translate(0px, 0px)`;
                this.moveVector.set(0, 0);
            }
            if (activeLookPointers.has(e.pointerId)) {
                activeLookPointers.delete(e.pointerId);
            }
        };

        window.addEventListener('pointerup', releasePointer);
        window.addEventListener('pointercancel', releasePointer);
    }

    jump() {
        if (!this.player.isJumping) {
            this.player.isJumping = true;
            this.player.velocity.y = 0.15;
            console.log("🦘 Jump triggered!");
        }
    }

    update() {
        this.lon += (this.targetLon - this.lon) * 0.4;
        this.lat += (this.targetLat - this.lat) * 0.4;

        if (this.player.isJumping) {
            this.player.position.y += this.player.velocity.y;
            this.player.velocity.y -= 0.01;
            if (this.player.position.y <= 2.5) {
                this.player.position.y = 2.5;
                this.player.isJumping = false;
                this.player.velocity.y = 0;
            }
        }

        const phi = THREE.MathUtils.degToRad(90 - this.lat);
        const theta = THREE.MathUtils.degToRad(this.lon);

        this.forwardDir = new THREE.Vector3(
            Math.sin(phi) * Math.sin(theta),
            0,
            Math.sin(phi) * Math.cos(theta)
        ).normalize();

        const sideDir = new THREE.Vector3(-this.forwardDir.z, 0, this.forwardDir.x);

        if (this.moveVector.lengthSq() > 0) {
            this.player.position.addScaledVector(this.forwardDir, -this.moveVector.y * this.player.speed);
            this.player.position.addScaledVector(sideDir, this.moveVector.x * this.player.speed);
        }

        const target = new THREE.Vector3(
            this.camera.position.x + 10 * Math.sin(phi) * Math.sin(theta),
            this.camera.position.y + 10 * Math.cos(phi),
            this.camera.position.z + 10 * Math.sin(phi) * Math.cos(theta)
        );
        this.camera.lookAt(target);
    }

    showError(err) {
        console.error("Lỗi:", err);
        document.body.innerHTML = `<h3 style="color:red">Lỗi: ${err.message}</h3>`;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Checkpoint5InteractionGame();
});
            
