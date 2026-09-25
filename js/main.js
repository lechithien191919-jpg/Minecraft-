class Checkpoint4ChunkGame {
    constructor() {
        try {
            this.initThree();
            this.initChunkWorld();
            this.initControls();
            this.animate();
            console.log("🟢 Checkpoint 4: Basic Chunk 16x16 System đã khởi chạy!");
        } catch (error) {
            this.showError(error);
        }
    }

    initThree() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        // Đặt camera đứng trên chunk 16x16 (tâm chunk ở khoảng x:8, z:8)
        this.camera.position.set(8, 6, 16);

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
        document.body.appendChild(canvas);

        const light = new THREE.AmbientLight(0xffffff, 0.9);
        this.scene.add(light);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
        dirLight.position.set(20, 40, 20);
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

    initChunkWorld() {
        this.chunkSize = 16;
        this.chunkHeight = 4; // Độ cao cơ bản cho phép đập/đặt và di chuyển
        
        // Cấu trúc dữ liệu Voxel 3D cho Chunk 16x16
        // 0: Không có block, 'grass', 'dirt', 'stone'
        this.chunkData = [];
        this.blockMeshes = new Map(); // Lưu trữ mesh theo tọa độ "x,y,z" để dễ đập/đặt

        const mats = this.createBlockMaterials();
        this.blockMaterials = mats;

        const boxGeo = new THREE.BoxGeometry(1, 1, 1);

        for (let x = 0; x < this.chunkSize; x++) {
            this.chunkData[x] = [];
            for (let y = 0; y < this.chunkHeight; y++) {
                this.chunkData[x][y] = [];
                for (let z = 0; z < this.chunkSize; z++) {
                    let type = 'air';
                    let material = null;

                    // Phân tầng cấu trúc block theo yêu cầu
                    if (y === 3) {
                        type = 'grass';
                        material = mats.grass;
                    } else if (y === 2 || y === 1) {
                        type = 'dirt';
                        material = mats.dirt;
                    } else if (y === 0) {
                        type = 'stone';
                        material = mats.stone;
                    }

                    this.chunkData[x][y][z] = type;

                    if (type !== 'air') {
                        const mesh = new THREE.Mesh(boxGeo, material);
                        mesh.position.set(x, y, z);
                        this.scene.add(mesh);
                        this.blockMeshes.set(`${x},${y},${z}`, mesh);
                    }
                }
            }
        }
    }

    // Hàm đập block tại vị trí x, y, z cụ thể
    breakBlock(x, y, z) {
        const key = `${x},${y},${z}`;
        if (this.blockMeshes.has(key)) {
            const mesh = this.blockMeshes.get(key);
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            this.blockMeshes.delete(key);
            this.chunkData[x][y][z] = 'air';
            console.log(`🔨 Đã đập block tại: ${x}, ${y}, ${z}`);
        }
    }

    // Hàm đặt thêm block mới
    placeBlock(x, y, z, type = 'stone') {
        if (x >= 0 && x < this.chunkSize && y >= 0 && y < this.chunkHeight && z >= 0 && z < this.chunkSize) {
            const key = `${x},${y},${z}`;
            if (!this.blockMeshes.has(key)) {
                let mat = this.blockMaterials.stone;
                if (type === 'dirt') mat = this.blockMaterials.dirt;
                if (type === 'grass') mat = this.blockMaterials.grass;

                const boxGeo = new THREE.BoxGeometry(1, 1, 1);
                const mesh = new THREE.Mesh(boxGeo, mat);
                mesh.position.set(x, y, z);
                this.scene.add(mesh);
                this.blockMeshes.set(key, mesh);
                this.chunkData[x][y][z] = type;
                console.log(`📦 Đã đặt block ${type} tại: ${x}, ${y}, ${z}`);
            }
        }
    }

    initControls() {
        this.player = {
            position: this.camera.position,
            velocity: new THREE.Vector3(),
            speed: 0.08,
            isJumping: false
        };

        this.lon = 0;
        this.lat = -15; // Nhìn hơi chúc xuống để thấy rõ mặt đất chunk 16x16
        this.targetLon = 0;
        this.targetLat = -15;
        this.moveVector = new THREE.Vector2(0, 0);

        // UI Container
        const ui = document.createElement('div');
        ui.style.position = 'fixed';
        ui.style.top = '0';
        ui.style.left = '0';
        ui.style.width = '100%';
        ui.style.height = '100%';
        ui.style.zIndex = '10';
        ui.style.pointerEvents = 'none';
        document.body.appendChild(ui);

        // --- 1. NÚT BẤM PHẢI (ĐỔI, NHẢY, ĐẶT, ĐẬP) ---
        const btnBox = document.createElement('div');
        btnBox.style.position = 'absolute';
        btnBox.style.right = '20px';
        btnBox.style.bottom = '20px';
        btnBox.style.display = 'grid';
        btnBox.style.gridTemplateColumns = 'repeat(2, 65px)';
        btnBox.style.gap = '10px';
        btnBox.style.pointerEvents = 'auto';

        const actions = [
            { text: 'ĐỔI', cb: () => { console.log("Đổi block"); } },
            { text: 'NHẢY', cb: () => this.jump() },
            { text: 'ĐẶT', cb: () => { 
                // Test đặt block ngay trước mặt player ở tầng cỏ (y=4)
                let px = Math.floor(this.player.position.x);
                let pz = Math.floor(this.player.position.z);
                this.placeBlock(px, 4, pz, 'stone');
            } },
            { text: 'ĐẬP', cb: () => { 
                // Test đập block dưới chân hoặc trước mặt
                let px = Math.floor(this.player.position.x);
                let pz = Math.floor(this.player.position.z);
                this.breakBlock(px, 3, pz);
            } }
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

        // --- 2. JOYSTICK TRÁI ---
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

        // --- 3. XOAY MÀN HÌNH ĐỒNG THỜI (ĐA NHIỆM) ---
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
                const dx = e.clientX - lastX;
                const dy = e.clientY - lastY;

                this.targetLon -= dx * 0.4;
                this.targetLat += dy * 0.4;
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
        this.lon += (this.targetLon - this.lon) * 0.3;
        this.lat += (this.targetLat - this.lat) * 0.3;

        if (this.player.isJumping) {
            this.player.position.y += this.player.velocity.y;
            this.player.velocity.y -= 0.01;
            // Giới hạn chiều cao đứng trên bề mặt block mặt đất (y mặt đất là 3, camera cao hơn 1.5 đơn vị -> ~4.5)
            if (this.player.position.y <= 4.5) {
                this.player.position.y = 4.5;
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
        document.body.innerHTML = `<h3 style="color:red">Lỗi: ${err.message}</h3>`;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Checkpoint4ChunkGame();
});
                                    
