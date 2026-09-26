class Checkpoint5StepCWorldManagerGame {
    constructor() {
        try {
            this.initThree();
            this.initWorldManager(); // Khởi tạo hệ thống quản lý block theo tọa độ (Step A & B)
            this.initCrosshair();
            this.initHotbarUI();
            this.initControls();
            this.initRaycaster();    // Khởi tạo Raycast Target tối ưu (Step C)
            this.animate();
            console.log("🟢 STEP A, B, C: World Manager & Raycast Target đã sẵn sàng!");
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

    // --- NO-DISPOSE ZONE: Shared Resources ---
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

    // --- STEP A & B: WORLD BLOCK MANAGER API ---
    initWorldManager() {
        this.materials = this.createBlockMaterials();
        this.blockMeshes = []; // Danh sách mesh chuyên dụng cho Raycast
        this.worldBlocks = new Map(); // Lưu trữ theo khóa tọa độ "x,y,z"

        // Hàm helper khóa tọa độ
        this.getKey = (x, y, z) => `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;

        // API: hasBlock
        this.hasBlock = (x, y, z) => {
            return this.worldBlocks.has(this.getKey(x, y, z));
        };

        // API: getBlock
        this.getBlock = (x, y, z) => {
            return this.worldBlocks.get(this.getKey(x, y, z)) || null;
        };

        // API: addBlock
        this.addBlock = (x, y, z, type) => {
            const key = this.getKey(x, y, z);
            if (this.worldBlocks.has(key)) return null;

            const geo = new THREE.BoxGeometry(1, 1, 1);
            const mat = this.materials[type] || this.materials.grass;
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y, z);

            // Gắn userData chuẩn theo Step A
            mesh.userData = { type, x, y, z };

            this.scene.add(mesh);
            this.blockMeshes.push(mesh);
            this.worldBlocks.set(key, { type, x, y, z, mesh });
            return mesh;
        };

        // API: removeBlock
        this.removeBlock = (x, y, z) => {
            const key = this.getKey(x, y, z);
            const blockData = this.worldBlocks.get(key);
            if (!blockData) return false;

            this.scene.remove(blockData.mesh);
            
            // Xóa khỏi mảng blockMeshes
            const index = this.blockMeshes.indexOf(blockData.mesh);
            if (index !== -1) {
                this.blockMeshes.splice(index, 1);
            }

            this.worldBlocks.delete(key);
            return true;
        };

        // --- Khởi tạo dữ liệu mẫu ban đầu cho World ---
        // 1. Tạo mặt đất (Ground phẳng rộng ở y = -1)
        for (let x = -4; x <= 4; x += 1) {
            for (let z = -8; z <= -2; z += 1) {
                this.addBlock(x, -1, z, 'grass');
            }
        }

        // 2. Tạo các khối block mẫu (Grass, Dirt, Stone) lơ lửng ngay trước mặt player để test raycast
        this.addBlock(-2, 0, -5, 'grass');
        this.addBlock(0, 0, -5, 'dirt');
        this.addBlock(2, 0, -5, 'stone');
    }

    // --- STEP C: RAYCASTER & GET TARGET BLOCK API ---
    initRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.screenCenter = new THREE.Vector2(0, 0); // Tâm màn hình NDC (0,0)
    }

    getTargetBlock() {
        this.raycaster.setFromCamera(this.screenCenter, this.camera);
        const intersects = this.raycaster.intersectObjects(this.blockMeshes, false);

        if (!intersects || intersects.length === 0) {
            return null;
        }

        const hit = intersects[0];
        if (!hit || !hit.object || !hit.object.userData) {
            return null;
        }

        return {
            mesh: hit.object,
            type: hit.object.userData.type || 'unknown',
            position: new THREE.Vector3(hit.object.userData.x, hit.object.userData.y, hit.object.userData.z),
            normal: hit.face ? hit.face.normal.clone() : new THREE.Vector3(0, 1, 0),
            distance: hit.distance
        };
    }

    initCrosshair() {
        const crosshair = document.createElement('div');
        crosshair.id = 'crosshair';
        crosshair.innerText = '+';
        crosshair.style.position = 'fixed';
        crosshair.style.top = '50%';
        crosshair.style.left = '50%';
        crosshair.style.transform = 'translate(-50%, -50%)';
        crosshair.style.color = 'rgba(255, 255, 255, 0.8)';
        crosshair.style.fontSize = '24px';
        crosshair.style.fontWeight = 'bold';
        crosshair.style.zIndex = '500';
        crosshair.style.pointerEvents = 'none';
        crosshair.style.userSelect = 'none';
        document.body.appendChild(crosshair);
    }

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
        hotbarContainer.style.touchAction = 'none';

        hotbarContainer.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        const items = [
            { type: 'grass', label: 'GRASS' },
            { type: 'dirt', label: 'DIRT' },
            { type: 'stone', label: 'STONE' }
        ];

        this.hotbarSlots = [];

        items.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.innerText = item.label;
            slot.style.width = '70px';
            slot.style.height = '45px';
            slot.style.background = index === 0 ? '#448822' : '#333333';
            slot.style.border = index === 0 ? '3px solid #ffff00' : '2px solid #ffffff';
            slot.style.borderRadius = '6px';
            slot.style.display = 'flex';
            slot.style.alignItems = 'center';
            slot.style.justifyContent = 'center';
            slot.style.fontSize = '12px';
            slot.style.color = '#ffffff';
            slot.style.fontWeight = 'bold';
            slot.style.cursor = 'pointer';
            slot.style.userSelect = 'none';
            slot.style.touchAction = 'none';

            slot.addEventListener('pointerdown', (e) => {
                e.preventDefault();
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
        ui.style.touchAction = 'none';
        document.body.appendChild(ui);

        const btnBox = document.createElement('div');
        btnBox.style.position = 'absolute';
        btnBox.style.right = '20px';
        btnBox.style.bottom = '80px';
        btnBox.style.display = 'grid';
        btnBox.style.gridTemplateColumns = 'repeat(2, 60px)';
        btnBox.style.gap = '8px';
        btnBox.style.pointerEvents = 'auto';
        btnBox.style.touchAction = 'none';

        const actions = [
            { text: 'ĐỔI', cb: () => { console.log("SWITCH fired"); } },
            { text: 'NHẢY', cb: () => this.jump() },
            { text: 'ĐẶT', cb: () => { console.log("PLACE fired (Chưa kích hoạt)"); } },
            { text: 'ĐẬP', cb: () => { console.log("BREAK fired (Chưa kích hoạt)"); } }
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
            b.style.touchAction = 'none';

            b.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                item.cb();
            });

            btnBox.appendChild(b);
        });
        ui.appendChild(btnBox);

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
                e.preventDefault();
                e.stopPropagation();
                joyActive = true;
                joyPointerId = e.pointerId;
                const r = joyOuter.getBoundingClientRect();
                center.x = r.left + r.width / 2;
                center.y = r.top + r.height / 2;
            }
        });

        let activeLookPointers = new Map();

        window.addEventListener('pointerdown', (e) => {
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

    _lastLogTime = 0;

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

        const forwardDir = new THREE.Vector3(
            Math.sin(phi) * Math.sin(theta),
            0,
            Math.sin(phi) * Math.cos(theta)
        ).normalize();

        const sideDir = new THREE.Vector3(-forwardDir.z, 0, forwardDir.x);

        if (this.moveVector.lengthSq() > 0) {
            this.player.position.addScaledVector(forwardDir, -this.moveVector.y * this.player.speed);
            this.player.position.addScaledVector(sideDir, this.moveVector.x * this.player.speed);
        }

        const target = new THREE.Vector3(
            this.camera.position.x + 10 * Math.sin(phi) * Math.sin(theta),
            this.camera.position.y + 10 * Math.cos(phi),
            this.camera.position.z + 10 * Math.sin(phi) * Math.cos(theta)
        );
        this.camera.lookAt(target);

        // --- TEST RAYCAST TARGET VÀ LOG CHI TIẾT THEO YÊU CẦU ---
        const targetBlock = this.getTargetBlock();
        const now = performance.now();
        if (now - this._lastLogTime > 400) {
            this._lastLogTime = now;
            if (targetBlock) {
                console.log(`[TARGET] type: ${targetBlock.type} | pos:`, targetBlock.position, `| normal:`, targetBlock.normal, `| dist: ${targetBlock.distance.toFixed(2)}`);
            } else {
                console.log("[TARGET] none");
            }
        }
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
    new Checkpoint5StepCWorldManagerGame();
});
            
