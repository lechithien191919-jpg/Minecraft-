class PerfectMinecraftGame {
    constructor() {
        try {
            this.initThree();
            this.initWorld();
            this.initControls();
            this.animate();
            console.log("🟢 Khởi tạo game hoàn hảo: Xoay và di chuyển 360 độ cực mượt!");
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
        document.body.appendChild(canvas);

        const light = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(light);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    initWorld() {
        // Nền tảng mặt đất
        const groundGeo = new THREE.BoxGeometry(40, 1, 40);
        const groundMat = new THREE.MeshBasicMaterial({ color: 0x559933 });
        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.ground.position.set(0, -1, 0);
        this.scene.add(this.ground);

        // Khối block làm mốc
        for (let i = -3; i <= 3; i += 2) {
            const box = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial({ color: 0x8b5a2b })
            );
            box.position.set(i, 0.5, -5);
            this.scene.add(box);
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
        this.lat = 0;
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

        // --- 1. NÚT BẤM PHẢI ---
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
            { text: 'ĐẶT', cb: () => {} },
            { text: 'ĐẬP', cb: () => {} }
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

        // --- 3. XOAY MÀN HÌNH TOÀN MÀN HÌNH (TRỪ JOYSTICK VÀ NÚT BẤM) ---
        let lookPointerId = null;
        let lastX = 0, lastY = 0;

        window.addEventListener('pointerdown', (e) => {
            // Không nhận diện vùng joystick (khoảng góc dưới bên trái)
            if (e.clientX < 180 && e.clientY > window.innerHeight - 180) return;
            // Không nhận diện vùng nút bấm phải
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

                this.lon -= dx * 0.4;
                this.lat += dy * 0.4;
                this.lat = Math.max(-85, Math.min(85, this.lat));

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

        // Di chuyển mượt mà cả 4 hướng (tiến, lùi, trái, phải) dựa trên góc nhìn hiện tại
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
    new PerfectMinecraftGame();
});
            
