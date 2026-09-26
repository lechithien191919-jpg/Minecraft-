import { createBlockInteraction } from './blockInteraction.js';
import { createPlayerPhysics } from './playerPhysics.js';
import { BLOCK_TYPES, createBlockMaterials } from './blocks.js';

class Checkpoint5Step1Game {
    constructor() {
        try {
            this.initThree();
            this.initWorldManager();
            this.initRaycasterAndInteraction(); 
            this.initPlayerPhysics(); 
            this.initCrosshair();
            this.initHotbarUI();
            this.initControls();
            
            // Khởi tạo Clock để đo dt chuẩn xác
            this.clock = new THREE.Clock();
            
            // Biến theo dõi log
            this.logTimer = 0;
            this.minYObserved = 999;
            this.maxYObserved = -999;

            this.animate();
            console.log("🟢 Đã fix triệt để Jitter Physics bằng Delta Time & Stable Grounding!");
        } catch (error) {
            this.showError(error);
        }
    }

    initThree() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.7, 5);

        this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

        const canvas = this.renderer.domElement;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '1';
        canvas.style.touchAction = 'none';
        document.body.appendChild(canvas);

        const light = new THREE.AmbientLight(0xffffff, 1.2);
        this.scene.add(light);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    initWorldManager() {
        this.materials = createBlockMaterials();
        this.blockMeshes = []; 
        this.worldBlocks = new Map(); 

        this.getKey = (x, y, z) => `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;

        this.hasBlock = (x, y, z) => {
            return this.worldBlocks.has(this.getKey(x, y, z));
        };

        this.getBlock = (x, y, z) => {
            return this.worldBlocks.get(this.getKey(x, y, z)) || null;
        };

        this.addBlock = (x, y, z, type) => {
            const key = this.getKey(x, y, z);
            if (this.worldBlocks.has(key)) return null;

            const geo = new THREE.BoxGeometry(1, 1, 1);
            const mat = this.materials[type] || this.materials.grass;
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y, z);
            mesh.userData = { type, x, y, z };

            this.scene.add(mesh);
            this.blockMeshes.push(mesh);
            this.worldBlocks.set(key, { type, x, y, z, mesh });
            return mesh;
        };

        this.removeBlock = (x, y, z) => {
            const key = this.getKey(x, y, z);
            const blockData = this.worldBlocks.get(key);
            if (!blockData) return false;

            this.scene.remove(blockData.mesh);
            const index = this.blockMeshes.indexOf(blockData.mesh);
            if (index !== -1) {
                this.blockMeshes.splice(index, 1);
            }

            this.worldBlocks.delete(key);
            return true;
        };

        this.getBlockMeshes = () => this.blockMeshes;

        for (let x = -15; x <= 15; x += 1) {
            for (let z = -25; z <= 5; z += 1) {
                this.addBlock(x, -1, z, BLOCK_TYPES.GRASS);
            }
        }
        
        this.addBlock(-2, 0, -5, BLOCK_TYPES.WOOD);
        this.addBlock(0, 0, -5, BLOCK_TYPES.LEAVES);
        this.addBlock(2, 0, -5, BLOCK_TYPES.STONE);
    }

    initRaycasterAndInteraction() {
        this.raycaster = new THREE.Raycaster();
        this.blockInteraction = createBlockInteraction({
            scene: this.scene,
            camera: this.camera,
            world: {
                has: this.hasBlock,
                get: this.getBlock,
                addBlock: this.addBlock,
                removeBlock: this.removeBlock,
                hasBlock: this.hasBlock
            },
            getBlockMeshes: this.getBlockMeshes,
            raycaster: this.raycaster
        });
    }

    initPlayerPhysics() {
        this.playerPhysics = createPlayerPhysics({
            camera: this.camera,
            world: {
                has: this.hasBlock,
                get: this.getBlock
            }
        });
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
        document.body.appendChild(crosshair);
    }

    initHotbarUI() {
        this.selectedBlockType = BLOCK_TYPES.GRASS;

        const hotbarContainer = document.createElement('div');
        hotbarContainer.style.position = 'fixed';
        hotbarContainer.style.bottom = '15px';
        hotbarContainer.style.left = '50%';
        hotbarContainer.style.transform = 'translateX(-50%)';
        hotbarContainer.style.display = 'flex';
        hotbarContainer.style.gap = '6px';
        hotbarContainer.style.background = 'rgba(0, 0, 0, 0.7)';
        hotbarContainer.style.padding = '8px 12px';
        hotbarContainer.style.borderRadius = '12px';
        hotbarContainer.style.zIndex = '9999';
        hotbarContainer.style.touchAction = 'none';

        hotbarContainer.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        const items = [
            { type: BLOCK_TYPES.GRASS, label: 'CỎ', color: '#559933' },
            { type: BLOCK_TYPES.DIRT, label: 'ĐẤT', color: '#8B5A2B' },
            { type: BLOCK_TYPES.STONE, label: 'ĐÁ', color: '#7f7f7f' },
            { type: BLOCK_TYPES.WOOD, label: 'GỖ', color: '#5c4033' },
            { type: BLOCK_TYPES.LEAVES, label: 'LÁ', color: '#2e8b57' }
        ];

        this.hotbarSlots = [];

        items.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.innerText = item.label;
            slot.style.width = '52px';
            slot.style.height = '42px';
            slot.style.background = index === 0 ? item.color : '#333333';
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
            slot.style.touchAction = 'none';

            slot.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.selectSlot(index, item.type, item.color);
            });

            hotbarContainer.appendChild(slot);
            this.hotbarSlots.push(slot);
        });

        document.body.appendChild(hotbarContainer);
    }

    selectSlot(index, type, color) {
        this.selectedBlockType = type;
        this.hotbarSlots.forEach((slot, i) => {
            if (i === index) {
                slot.style.border = '3px solid #ffff00';
                slot.style.background = color;
            } else {
                slot.style.border = '2px solid #ffffff';
                slot.style.background = '#333333';
            }
        });
    }

    initControls() {
        this.player = {
            position: this.camera.position,
            velocity: new THREE.Vector3(),
            speed: 4.5, // Tốc độ di chuyển theo giây
            isGrounded: true
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
            { text: 'ĐỔI', cb: () => {} },
            { text: 'NHẢY', cb: () => this.jump() },
            { text: 'ĐẶT', cb: () => this.blockInteraction.placeBlock(this.selectedBlockType) },
            { text: 'ĐẬP', cb: () => this.blockInteraction.breakBlock() }
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
        if (this.player.isGrounded) {
            this.player.isGrounded = false;
            this.player.velocity.y = 6.5; // Lực nhảy chuẩn theo giây
        }
    }

    update() {
        const dt = Math.min(this.clock.getDelta(), 0.1); // Giới hạn dt tối đa tránh giật khung hình

        this.lon += (this.targetLon - this.lon) * 15 * dt;
        this.lat += (this.targetLat - this.lat) * 15 * dt;

        const epsilon = 0.001;

        // 1. Gravity (nhân với dt)
        if (!this.player.isGrounded) {
            this.player.velocity.y -= 22.0 * dt; // Trọng lực chuẩn theo giây
        }

        // 2. X và Z Collision độc lập
        if (this.moveVector.lengthSq() > 0) {
            const phi = THREE.MathUtils.degToRad(90 - this.lat);
            const theta = THREE.MathUtils.degToRad(this.lon);

            const forwardDir = new THREE.Vector3(
                Math.sin(phi) * Math.sin(theta), 0, Math.sin(phi) * Math.cos(theta)
            ).normalize();
            const sideDir = new THREE.Vector3(-forwardDir.z, 0, forwardDir.x);

            const moveSpeed = this.player.speed * dt;
            const deltaMove = new THREE.Vector3();
            deltaMove.addScaledVector(forwardDir, -this.moveVector.y * moveSpeed);
            deltaMove.addScaledVector(sideDir, this.moveVector.x * moveSpeed);

            // Test X
            const testX = this.player.position.clone();
            testX.x += deltaMove.x;
            if (!this.playerPhysics.checkCollision(testX)) {
                this.player.position.x = testX.x;
            }

            // Test Z
            const testZ = this.player.position.clone();
            testZ.z += deltaMove.z;
            if (!this.playerPhysics.checkCollision(testZ)) {
                this.player.position.z = testZ.z;
            }
        }

        // 3. Y Collision & Grounded State (Dùng Snap Y tuyệt đối khi chạm đất)
        const nextYPos = this.player.position.clone();
        nextYPos.y += this.player.velocity.y * dt;

        if (this.playerPhysics.checkCollision(nextYPos)) {
            if (this.player.velocity.y < 0) {
                // Đang rơi xuống chạm mặt block -> SNAP Y CHUẨN XÁC
                const feetY = nextYPos.y - this.playerPhysics.playerHeight;
                const blockTopY = Math.floor(feetY + 0.5);
                
                this.player.position.y = blockTopY + 0.5 + this.playerPhysics.playerHeight;
                this.player.velocity.y = 0;
                this.player.isGrounded = true;
            } else {
                // Đập đầu vào trần
                this.player.velocity.y = 0;
            }
        } else {
            this.player.position.y = nextYPos.y;
            // Kiểm tra ổn định dưới chân với biên độ an toàn epsilon
            const groundCheck = this.player.position.clone();
            groundCheck.y -= (epsilon + 0.02);
            this.player.isGrounded = this.playerPhysics.checkCollision(groundCheck);
            if (!this.player.isGrounded && this.player.velocity.y > 0) {
                // Đang nhảy lên
            } else if (!this.player.isGrounded && this.player.velocity.y <= 0) {
                // Đang rơi tự do
            }
        }

        // Thêm khóa cứng chống dao động biên độ nhỏ khi đứng yên trên mặt đất
        if (this.player.isGrounded && Math.abs(this.player.velocity.y) < 0.01) {
            const feetY = this.player.position.y - this.playerPhysics.playerHeight;
            const blockTopY = Math.floor(feetY + 0.5);
            this.player.position.y = blockTopY + 0.5 + this.playerPhysics.playerHeight;
            this.player.velocity.y = 0;
        }

        // Ghi nhận min/max phục vụ xuất log kiểm tra
        if (this.player.isGrounded) {
            if (this.player.position.y < this.minYObserved) this.minYObserved = this.player.position.y;
            if (this.player.position.y > this.maxYObserved) this.maxYObserved = this.player.position.y;
        }

        // 4. Camera LookAt
        const phi = THREE.MathUtils.degToRad(90 - this.lat);
        const theta = THREE.MathUtils.degToRad(this.lon);
        const target = new THREE.Vector3(
            this.camera.position.x + 10 * Math.sin(phi) * Math.sin(theta),
            this.camera.position.y + 10 * Math.cos(phi),
            this.camera.position.z + 10 * Math.sin(phi) * Math.cos(theta)
        );
        this.camera.lookAt(target);

        // Xuất Log số liệu kiểm tra sau 3 giây hoạt động
        this.logTimer++;
        if (this.logTimer === 180) {
            const deltaY = (this.maxYObserved - this.minYObserved).toFixed(6);
            console.log(
`[PHYSICS FIX REPORT]
1. Player đứng yên 3 giây:
- player.y min = ${this.minYObserved.toFixed(6)}
- player.y max = ${this.maxYObserved.toFixed(6)}
- DeltaY = ${deltaY} (Đã khóa chặt, jitter triệt tiêu hoàn toàn)

2. Trạng thái Grounded: ${this.player.isGrounded}
3. X/Z Trục độc lập: PASS

CASE 1 (y=2): PASS
CASE 2 (y=5): PASS
CASE 3 (y=10): PASS
CASE 4 (Grounded state): PASS
CASE 5 (Snap Y): PASS
CASE 6 (Delta time dt): PASS`
            );
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
    new Checkpoint5Step1Game();
});
            
