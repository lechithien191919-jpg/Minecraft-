class MinecraftPlatformGame {
    constructor() {
        try {
            this.initThree();
            this.initWorld();
            this.initPlayerAndControls();
            this.initUI();
            this.animate();
            console.log("🟢 Khởi tạo game nền tảng khổng lồ thành công!");
        } catch (error) {
            this.showError(error);
        }
    }

    initThree() {
        // 1. Scene & Màu trời Minecraft
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        // 2. Camera (Đóng vai trò góc nhìn nhân vật)
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 3, 5);

        // 3. Renderer tối ưu di động
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
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

        // 4. Ánh sáng
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    initWorld() {
        // Tạo một nền tảng mặt đất khổng lồ (Sân cỏ phẳng rộng lớn)
        const groundGeo = new THREE.BoxGeometry(40, 1, 40);
        const groundMat = new THREE.MeshBasicMaterial({ color: 0x559933 }); // Xanh cỏ
        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.ground.position.set(0, -1, 0);
        this.scene.add(this.ground);

        // Thêm vài khối block phụ trên sàn để tạo điểm nhấn
        for (let i = -3; i <= 3; i += 2) {
            const boxGeo = new THREE.BoxGeometry(1, 1, 1);
            const boxMat = new THREE.MeshBasicMaterial({ color: 0x8b5a2b }); // Nâu đất
            const box = new THREE.Mesh(boxGeo, boxMat);
            box.position.set(i, 0.5, -5);
            this.scene.add(box);
        }
    }

    initPlayerAndControls() {
        // Biến trạng thái nhân vật & camera
        this.player = {
            position: this.camera.position,
            velocity: new THREE.Vector3(),
            speed: 0.1,
            isJumping: false
        };

        this.lon = 0;
        this.lat = 0;
        this.phi = 0;
        this.theta = 0;

        // Trạng thái điều khiển di chuyển
        this.moveState = { forward: false, backward: false, left: false, right: false };

        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        // Xốt cảm ứng xoay màn hình (có thể xoay bất cứ lúc nào, kể cả khi đang di chuyển)
        window.addEventListener('pointerdown', (e) => {
            // Tránh vùng nút bấm UI ở góc phải
            if (e.clientX > window.innerWidth - 180 && e.clientY > window.innerHeight - 200) return;
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            this.lon -= deltaX * 0.4;
            this.lat += deltaY * 0.4;
            this.lat = Math.max(-85, Math.min(85, this.lat));

            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('pointerup', () => {
            isDragging = false;
        });
    }

    initUI() {
        // Giao diện nút bấm & Joystick giả lập
        const uiContainer = document.createElement('div');
        uiContainer.style.position = 'fixed';
        uiContainer.style.top = '0';
        uiContainer.style.left = '0';
        uiContainer.style.width = '100%';
        uiContainer.style.height = '100%';
        uiContainer.style.zIndex = '10';
        uiContainer.style.pointerEvents = 'none';
        document.body.appendChild(uiContainer);

        // Vùng nút bấm bên phải (ĐỔI, NHẢY, ĐẶT, ĐẬP)
        const btnWrapper = document.createElement('div');
        btnWrapper.style.position = 'absolute';
        btnWrapper.style.right = '20px';
        btnWrapper.style.bottom = '20px';
        btnWrapper.style.display = 'grid';
        btnWrapper.style.gridTemplateColumns = 'repeat(2, 65px)';
        btnWrapper.style.gap = '10px';
        btnWrapper.style.pointerEvents = 'auto';

        const buttons = [
            { text: 'ĐỔI', action: () => console.log('Đổi block') },
            { text: 'NHẢY', action: () => this.jump() },
            { text: 'ĐẶT', action: () => console.log('Đặt block') },
            { text: 'ĐẬP', action: () => console.log('Đập block') }
        ];

        buttons.forEach(b => {
            const btn = document.createElement('button');
            btn.innerText = b.text;
            btn.style.width = '65px';
            btn.style.height = '65px';
            btn.style.borderRadius = '50%';
            btn.style.background = 'rgba(0, 0, 0, 0.6)';
            btn.style.color = '#fff';
            btn.style.border = '2px solid #fff';
            btn.style.fontSize = '13px';
            btn.style.fontWeight = 'bold';
            btn.style.cursor = 'pointer';

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                b.action();
            });
            btnWrapper.appendChild(btn);
        });
        uiContainer.appendChild(btnWrapper);

        // Joystick đơn giản bên trái để di chuyển tiến/lùi/trái/phải
        const joystickArea = document.createElement('div');
        joystickArea.style.position = 'absolute';
        joystickArea.style.left = '30px';
        joystickArea.style.bottom = '30px';
        joystickArea.style.width = '120px';
        joystickArea.style.height = '120px';
        joystickArea.style.borderRadius = '50%';
        joystickArea.style.background = 'rgba(255, 255, 255, 0.2)';
        joystickArea.style.border = '2px solid rgba(255, 255, 255, 0.5)';
        joystickArea.style.pointerEvents = 'auto';
        joystickArea.style.display = 'flex';
        joystickArea.style.alignItems = 'center';
        joystickArea.style.justifyContent = 'center';
        joystickArea.style.color = '#fff';
        joystickArea.style.fontSize = '12px';
        joystickArea.style.fontWeight = 'bold';
        joystickArea.innerText = 'KÉO ĐỂ ĐI';

        let joyTouch = false;
        joystickArea.addEventListener('pointerdown', (e) => { joyTouch = true; });
        window.addEventListener('pointermove', (e) => {
            if (!joyTouch) return;
            const rect = joystickArea.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;

            this.moveState.forward = dy < -20;
            this.moveState.backward = dy > 20;
            this.moveState.left = dx < -20;
            this.moveState.right = dx > 20;
        });
        window.addEventListener('pointerup', () => {
            joyTouch = false;
            this.moveState = { forward: false, backward: false, left: false, right: false };
        });

        uiContainer.appendChild(joystickArea);
    }

    jump() {
        if (!this.player.isJumping) {
            this.player.isJumping = true;
            this.player.velocity.y = 0.15; // Lực nhảy lên
        }
    }

    updatePhysics() {
        // Xử lý trọng lực và nhảy
        if (this.player.isJumping) {
            this.player.position.y += this.player.velocity.y;
            this.player.velocity.y -= 0.01; // Trọng lực kéo xuống

            // Chạm đất (độ cao y = 2.5 tương ứng sàn phẳng)
            if (this.player.position.y <= 2.5) {
                this.player.position.y = 2.5;
                this.player.isJumping = false;
                this.player.velocity.y = 0;
            }
        }

        // Xử lý di chuyển theo hướng camera
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        dir.y = 0; // Giữ mặt phẳng ngang
        dir.normalize();

        const sideDir = new THREE.Vector3(-dir.z, 0, dir.x);

        if (this.moveState.forward) this.player.position.addScaledVector(dir, this.player.speed);
        if (this.moveState.backward) this.player.position.addScaledVector(dir, -this.player.speed);
        if (this.moveState.left) this.player.position.addScaledVector(sideDir, this.player.speed);
        if (this.moveState.right) this.player.position.addScaledVector(sideDir, -this.player.speed);

        // Cập nhật góc nhìn camera từ độ xoay lon/lat
        this.phi = THREE.MathUtils.degToRad(90 - this.lat);
        this.theta = THREE.MathUtils.degToRad(this.lon);

        const target = new THREE.Vector3();
        target.x = this.camera.position.x + 10 * Math.sin(this.phi) * Math.cos(this.theta);
        target.y = this.camera.position.y + 10 * Math.cos(this.phi);
        target.z = this.camera.position.z + 10 * Math.sin(this.phi) * Math.sin(this.theta);
        this.camera.lookAt(target);
    }

    showError(error) {
        document.body.innerHTML = `<div style="color:red; padding:20px; font-family:monospace;">
            <h3>❌ Lỗi Game</h3>
            <p>${error.message}</p>
        </div>`;
        console.error(error);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.updatePhysics();
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new MinecraftPlatformGame();
});
    
