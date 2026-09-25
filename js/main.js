class StableGame {
    constructor() {
        try {
            this.initThree();
            this.initCameraControls();
            this.animate();
            console.log("🟢 Stable Game initialized successfully.");
        } catch (error) {
            this.showErrorScreen("Init Error", error);
        }
    }

    initThree() {
        // 1. Scene & Background màu trời Minecraft
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        // 2. Camera đặt ở vị trí nhìn bao quát đẹp mắt
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 3, 6);

        // 3. Renderer tối ưu
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

        // 4. Ánh sáng cơ bản để test khối 3D nếu cần
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambientLight);
    }

    initCameraControls() {
        // Hệ thống điều khiển xoay góc nhìn an toàn, không làm lệch camera ra ngoài không gian
        this.lon = 0;
        this.lat = 0;
        this.phi = 0;
        this.theta = 0;

        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        const onPointerDown = (e) => {
            isDragging = true;
            previousMousePosition = {
                x: e.clientX || (e.touches && e.touches[0].clientX),
                y: e.clientY || (e.touches && e.touches[0].clientY)
            };
        };

        const onPointerMove = (e) => {
            if (!isDragging) return;

            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);

            const deltaX = clientX - previousMousePosition.x;
            const deltaY = clientY - previousMousePosition.y;

            this.lon -= deltaX * 0.5;
            this.lat += deltaY * 0.5;

            // Giới hạn góc nhìn lên xuống không bị lật ngược đầu
            this.lat = Math.max(-85, Math.min(85, this.lat));

            this.phi = THREE.MathUtils.degToRad(90 - this.lat);
            this.theta = THREE.MathUtils.degToRad(this.lon);

            previousMousePosition = { x: clientX, y: clientY };
        };

        const onPointerUp = () => {
            isDragging = false;
        };

        window.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        // Cập nhật hướng nhìn liên tục trong render loop
        this.updateCameraLookAt = () => {
            const target = new THREE.Vector3();
            const distance = 10;
            
            target.x = this.camera.position.x + distance * Math.sin(this.phi) * Math.cos(this.theta);
            target.y = this.camera.position.y + distance * Math.cos(this.phi);
            target.z = this.camera.position.z + distance * Math.sin(this.phi) * Math.sin(this.theta);

            this.camera.lookAt(target);
        };
    }

    showErrorScreen(title, error) {
        document.body.innerHTML = `<div style="color:red; padding:20px; font-family:monospace;">
            <h3>❌ ${title}</h3>
            <p>${error.message}</p>
        </div>`;
        console.error(error);
    }

    animate() {
        try {
            requestAnimationFrame(() => this.animate());

            // Cập nhật góc nhìn camera mượt mà
            if (this.updateCameraLookAt) {
                this.updateCameraLookAt();
            }

            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            this.showErrorScreen("Render Loop Error", error);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new StableGame();
});
