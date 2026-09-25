class MinecraftJoystickGame {
    constructor() {
        try {
            this.initThree();
            this.initWorld();
            this.initPlayerAndControls();
            this.initUI();
            this.animate();
            console.log("🟢 Khởi tạo game với Joystick chuẩn & Fix xoay màn hình thành công!");
        } catch (error) {
            this.showError(error);
        }
    }

    initThree() {
        // 1. Scene & Màu trời Minecraft
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        // 2. Camera đặt vị trí nhìn bao quát nhân vật
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
        // Tạo nền tảng mặt đất khổng lồ
        const groundGeo = new THREE.BoxGeometry(50, 1, 50);
        const groundMat = new THREE.MeshBasicMaterial({ color: 0x559933 }); 
        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.ground.position.set(0, -1, 0);
        this.scene.add(this.ground);

        // Thêm vài khối block phụ trên sàn để dễ nhận diện chuyển động
        for (let i = -4; i <= 4; i += 2) {
            const boxGeo = new THREE.BoxGeometry(1, 1, 1);
            const boxMat = new THREE.MeshBasicMaterial({ color: 0x8b5a2b }); 
            const box = new THREE.Mesh(boxGeo, boxMat);
            box.position.set(i, 0.5, -6);
            this.scene.add(box);
        }
    }

    initPlayerAndControls() {
        this.player = {
            position: this.camera.position,
            velocity: new THREE.Vector3(),
            speed: 0.08,
            isJumping: false
        };

        // Góc quay camera
        this.lon = 0;
        this.lat = 0;
        this.phi = 0;
        this.theta = 0;

        // Vector hướng di chuyển từ Joystick
        this.moveVector = new THREE.Vector2(0, 0);

        // FIX XOAY MÀN HÌNH: Cảm ứng phần nửa phải màn hình để xoay mượt mà
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        window.addEventListener('pointerdown', (e) => {
            // Chỉ cho phép xoay khi chạm ở nửa bên phải màn hình (tránh bấm nhầm UI nút bấm và Joystick)
            if (e.clientX > window.innerWidth * 0.4) {
                isDragging = true;
                previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        });

        window.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            this.lon -= deltaX * 0.3;
            this.lat += deltaY * 0.3;
            this.lat = Math.max(-85, Math.min(85, this.lat)); // Giới hạn góc nhìn lên xuống

            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('pointerup', () => {
            isDragging = false;
        });
    }

    initUI() {
        const uiContainer = document.createElement('div');
        uiContainer.style.position = 'fixed';
        uiContainer.style.top = '0';
        uiContainer.style.left = '0';
        uiContainer.style.width = '100%';
        uiContainer.style.height = '100%';
        uiContainer.style.zIndex = '10';
        uiContainer.style.pointerEvents = 'none';
        document.body.appendChild(uiContainer);

        // 1. Cụm nút bấm bên phải (ĐỔI, NHẢY, ĐẶT, ĐẬP)
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

        // 2. JOYSTICK CHUẨN: Vòng tròn to bên ngoài và vòng tròn nhỏ bên trong kéo thả
        const outerSize = 130;
        const innerSize = 55;

        const joystickOuter = document.createElement('div');
        joystickOuter.style.position = 'absolute';
        joystickOuter.style.left = '30px';
        joystickOuter.style.bottom = '30px';
        joystickOuter.style.width = `${outerSize}px`;
        joystickOuter.style.height = `${outerSize}px`;
        joystickOuter.style.borderRadius = '50%';
        joystickOuter.style.background = 'rgba(255, 255, 255, 0.15)';
        joystickOuter.style.border = '2px solid rgba(255, 255, 255, 0.4)';
        joystickOuter.style.pointerEvents = 'auto';
        joystickOuter.style.touchAction = 'none';

        const joystickInner = document.createElement('div');
        joystickInner.style.position = 'absolute';
        joystickInner.style.left = `${(outerSize - innerSize) / 2}px`;
        joystickInner.style.top = `${(outerSize - innerSize) / 2}px`;
        joystickInner.style.width = `${innerSize}px`;
        joystickInner.style.height = `${innerSize}px`;
        joystickInner.style.borderRadius = '50%';
        joystickInner.style.background = 'rgba(255, 255, 255, 0.7)';
        joystickInner.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        joystickInner.style.pointerEvents = 'none';
        joystickInner.style.transition = 'transform 0.05s linear';

        joystickOuter.appendChild(joystickInner);
        uiContainer.appendChild(joystickOuter);

        let joyActive = false;
        let joyCenter = { x: 0, y: 0 };
        const maxDist = 40; // Bán kính dịch chuyển tối đa của nút nhỏ

        joystickOuter.addEventListener('pointerdown', (e) => {
            joyActive = true;
            const rect = joystickOuter.getBoundingClientRect();
            joyCenter.x = rect.left + rect.width / 2;
            joyCenter.y = rect.top + rect.height / 2;
            e.stopPropagation();
        });

        window.addEventListener('pointermove', (e) => {
            if (!joyActive) return;
            const dx = e.clientX - joyCenter.x;
            const dy = e.clientY - joyCenter.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let angle = Math.atan2(dy, dx);
            let constrainedDist = Math.min(dist, maxDist);

            let moveX = Math.cos(angle) * constrainedDist;
            let moveY = Math.sin(angle) * constrainedDist;

            joystickInner.style.transform = `translate(${moveX}px, ${moveY}px)`;

            // Tính vector chuẩn hóa hướng đi [-1 đến 1]
            this.moveVector.set(moveX / maxDist, moveY / maxDist);
        });

        const resetJoystick = () => {
            if (!joyActive) return;
            joyActive = false;
            joystickInner.style.transform = `translate(0px, 0px)`;
            this.moveVector.set(0, 0);
        };

        window.addEventListener('pointerup', resetJoystick);
        window.addEventListener('pointercancel', resetJoystick);
    }

    jump() {
        if (!this.player.isJumping) {
            this.player.isJumping = true;
            this.player.velocity.y = 0.15; // Lực nhảy
        }
    }

    updatePhysics() {
        // Xử lý trọng lực và nhảy
        if (this.player.isJumping) {
            this.player.position.y += this.player.velocity.y;
            this.player.velocity.y -= 0.01; // Trọng lực kéo xuống

            if (this.player.position.y <= 2.5) {
                this.player.position.y = 2.5;
                this.player.isJumping = false;
                this.player.velocity.y = 0;
            }
        }

        // Hướng nhìn camera
        this.phi = THREE.MathUtils.degToRad(90 - this.lat);
        this.theta = THREE.MathUtils.degToRad(this.lon);

        const dir = new THREE.Vector3();
        dir.x = Math.sin(this.phi) * Math.sin(this.theta);
        dir.y = 0;
        dir.z = Math.sin(this.phi) * Math.cos(this.theta);
        dir.normalize();

        const sideDir = new THREE.Vector3(-dir.z, 0, dir.x);

        // Di chuyển dựa trên độ kéo của joystick (moveVector.y: tiến/lùi, moveVector.x: trái/phải)
        if (this.moveVector.lengthSq() > 0) {
            this.player.position.addScaledVector(dir, -this.moveVector.y * this.player.speed);
            this.player.position.addScaledVector(sideDir, this.moveVector.x * this.player.speed);
        }

        // Cập nhật hướng nhìn thực tế của camera
        const target = new THREE.Vector3();
        target.x = this.camera.position.x + 10 * Math.sin(this.phi) * Math.sin(this.theta);
        target.y = this.camera.position.y + 10 * Math.cos(this.phi);
        target.z = this.camera.position.z + 10 * Math.sin(this.phi) * Math.cos(this.theta);
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
    new MinecraftJoystickGame();
});
            
