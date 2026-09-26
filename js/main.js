class CheckpointHotbarGame {
    constructor() {
        try {
            this.initThree();
            this.initWorld();
            this.initHotbarUI(); // Hạng mục A: Hotbar System
            this.initControls();
            this.animate();
            console.log("🟢 Hotbar System đã được tích hợp thành công!");
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
        const materials = this.createBlockMaterials();

        const groundGeo = new THREE.BoxGeometry(40, 1, 40);
        this.ground = new THREE.Mesh(groundGeo, materials.grass);
        this.ground.position.set(0, -1, 0);
        this.scene.add(this.ground);

        const blockTypes = ['grass', 'dirt', 'stone'];
        const blockMats = [materials.grass, materials.dirt, materials.stone];
        this.worldBlocks = [];

        let idCounter = 1;
        for (let i = -3; i <= 3; i += 2) {
            const typeIndex = (Math.abs(i) % 3);
            const blockGeo = new THREE.BoxGeometry(1, 1, 1);
            const block = new THREE.Mesh(blockGeo, blockMats[typeIndex]);
            
            const posX = i;
            const posY = 0.5;
            const posZ = -5;

            block.position.set(posX, posY, posZ);
            this.scene.add(block);

            this.worldBlocks.push({
                id: idCounter++,
                type: blockTypes[typeIndex],
                position: { x: posX, y: posY, z: posZ },
                mesh: block
            });
        }
    }

    // --- HẠNG MỤC 1: HOTBAR UI SYSTEM ---
    initHotbarUI() {
        this.selectedBlockType = 'grass'; // Mặc định chọn block cỏ

        const hotbarContainer = document.createElement('div');
        hotbarContainer.style.position = 'fixed';
        hotbarContainer.style.bottom = '20px';
        hotbarContainer.style.left = '50%';
        hotbarContainer.style.transform = 'translateX(-50%)';
        hotbarContainer.style.display = 'flex';
        hotbarContainer.style.gap = '8px';
        hotbarContainer.style.background = 'rgba(0, 0, 0, 0.4)';
        hotbarContainer.style.padding = '8px';
        hotbarContainer.style.borderRadius = '12px';
        hotbarContainer.style.zIndex = '20';
        hotbarContainer.style.pointerEvents = 'auto'; // Cho phép click/touch vào hotbar riêng biệt

        // Ngăn chặn sự kiện chạm lọt ra ngoài làm xoay camera
        hotbarContainer.addEventListener('pointerdown', (e) => e.stopPropagation());
        hotbarContainer.addEventListener('pointermove', (e) => e.stopPropagation());

        const items = [
            { type: 'grass', name: '🌱', bg: '#559933' },
            { type: 'dirt', name: '🟫', bg: '#8B5A2B' },
            { type: 'stone', name: '🪨', bg: '#808080' }
        ];

        this.hotbarSlots = [];

        items.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.style.width = '50px';
            slot.style.height = '50px';
            slot.style.background = item.bg;
            slot.style.border = index === 0 ? '3px solid #fff' : '2px solid rgba(255,255,255,0.4)';
            slot.style.borderRadius = '8px';
            slot.style.display = 'flex';
            slot.style.alignItems = 'center';
            slot.style.justifyContent = 'center';
            slot.style.fontSize = '22px';
            slot.style.cursor = 'pointer';
            slot.style.userSelect = 'none';

            slot.addEventListener('click', (e) => {
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
            slot.style.border = i === index ? '3px solid #fff' : '2px solid rgba(255,255,255,0.4)';
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
        ui.style.zIndex = '10';
        ui.style.pointerEvents = 'none';
        document.body.appendChild(ui);

        // --- NÚT BẤM PHẢI (NHẢY, ĐẶT, ĐẬP) ---
        const btnBox = document.createElement('div');
        btnBox.style.position = 'absolute';
        btnBox.style.right = '20px';
        btnBox.style.bottom = '20px';
        btnBox.style.display = 'grid';
        btnBox.style.gridTemplateColumns = 'repeat(2, 65px)';
        btnBox.style.gap = '10px';
        btnBox.style.pointerEvents = 'auto';

        const actions = [
            { text: 'ĐỔI', cb: () => {} },
            { text: 'NHẢY', cb: () => this.jump() },
            { text: 'ĐẶT', cb: () => { console.log(`Đặt block loại: ${this.selectedBlockType}`); } },
            { text: 'ĐẬP', cb: () => { console.log("Đập block"); } }
        ];

        actions.forEach(item => {
            const b = document.createElement('button');
            b.innerText = item.text;
            b.style.width = '65px';
            b.style.height = '65px';
            b.style.borderRadius = '50%';
            b.style.background = 'rgba(0, 0, 0, 0.6)';
            b.style.color = '#fff';
            b.style.border = '2px solid #fff';
            b.style.fontWeight = 'bold';
            b.addEventListener('click', (e) => {
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
        joyOuter.style.bottom = '30px';
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
            if (joyActive) return;
            joyActive = true;
            joyPointerId = e.pointerId;
            const r = joyOuter.getBoundingClientRect();
            center.x = r.left + r.width / 2;
            center.y = r.top + r.height / 2;
            e.stopPropagation();
        });

        // --- XOAY MÀN HÌNH ĐÃ PASS MƯỢT MÀ ---
        let lookPointerId = null;
        let lastX = 0, lastY = 0;

        window.addEventListener('pointerdown', (e) => {
            if (e.clientX < 180 && e.clientY > window.innerHeight - 180) return;
            if (e.clientX > window.innerWidth - 160 && e.clientY > window.innerHeight - 160) return;

            if (lookPointerId === null && !joyActive) {
                lookPointerId = e.pointerId;
                lastX = e.clientX;
                lastY = e.clientY;
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

            if (lookPointerId !== null && e.pointerId === lookPointerId) {
                const deltaX = e.clientX - lastX;
                const deltaY = e.clientY - lastY;

                this.targetLon -= deltaX * 0.4;
                this.targetLat += deltaY * 0.4;
                this.targetLat = Math.max(-85, Math.min(85, this.targetLat));

                lastX = e.clientX;
                lastY = e.clientY;
            }
        });

        const releasePointer = (e) => {
            if (e.pointerId === joyPointerId) {
                joyActive = false;
                joyPointerId = null;
                joyInner.style.transform = `translate(0px, 0px)`;
                this.moveVector.set(0, 0);
            }
            if (e.pointerId === lookPointerId) {
                lookPointerId = null;
            }
        };

        window.addEventListener('pointerup', releasePointer);
        window.addEventListener('pointercancel', releasePointer);
    }

    jump() {
        if (!this.player.isJumping) {
            this.player.isJumping = true;
            this.player.velocity.y = 0.15;
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
    new CheckpointHotbarGame();
});
            
