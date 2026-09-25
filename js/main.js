import { World } from './world.js';

class CleanGame {
    constructor() {
        this.initThree();
        this.initGameWorld();
        this.initEmbeddedUI(); // Tự tay dựng UI trực tiếp tại đây để tránh lỗi file ngoài
        this.initListeners();
        this.animate();
    }

    initThree() {
        // 1. Scene & Background xanh trời Minecraft
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        // 2. Camera đặt lùi ra để nhìn thấy world và block
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 3, 6);
        this.camera.lookAt(0, 0, 0);

        // 3. WebGL Renderer tối ưu
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const canvas = this.renderer.domElement;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '1'; // Nằm dưới UI nhưng nổi trên background
        document.body.appendChild(canvas);

        // 4. Ánh sáng
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        this.scene.add(dirLight);

        console.log("🟢 Three.js initialized successfully.");
    }

    initGameWorld() {
        // Tạo world cơ bản (Grass, Dirt, Stone)
        this.world = new World(this.scene);
        console.log("🌍 World blocks created:", this.world.blocks.size);
    }

    initEmbeddedUI() {
        // Tự tạo các nút bấm UI trực tiếp bằng code để chắc chắn không bị lỗi file ui.js
        const uiContainer = document.createElement('div');
        uiContainer.style.position = 'fixed';
        uiContainer.style.top = '0';
        uiContainer.style.left = '0';
        uiContainer.style.width = '100%';
        uiContainer.style.height = '100%';
        uiContainer.style.zIndex = '10'; // Nằm đè lên trên canvas 3D
        uiContainer.style.pointerEvents = 'none'; // Cho phép click xuyên qua vùng trống
        document.body.appendChild(uiContainer);

        // Tạo nút Đổi, Nhảy, Đặt, Đập ở góc phải
        const btnWrapper = document.createElement('div');
        btnWrapper.style.position = 'absolute';
        btnWrapper.style.right = '20px';
        btnWrapper.style.bottom = '20px';
        btnWrapper.style.display = 'grid';
        btnWrapper.style.gridTemplateColumns = 'repeat(2, 70px)';
        btnWrapper.style.gap = '10px';
        btnWrapper.style.pointerEvents = 'auto';

        const buttons = ['ĐỔI', 'NHẢY', 'ĐẶT', 'ĐẬP'];
        buttons.forEach(text => {
            const btn = document.createElement('button');
            btn.innerText = text;
            btn.style.width = '70px';
            btn.style.height = '70px';
            btn.style.borderRadius = '50%';
            btn.style.background = 'rgba(0, 0, 0, 0.6)';
            btn.style.color = '#fff';
            btn.style.border = '2px solid #fff';
            btn.style.fontSize = '14px';
            btn.style.fontWeight = 'bold';
            btn.style.cursor = 'pointer';
            
            btn.addEventListener('click', () => {
                console.log(`🔘 Button clicked: ${text}`);
            });
            btnWrapper.appendChild(btn);
        });

        uiContainer.appendChild(btnWrapper);
        console.log("🎮 Embedded UI injected successfully.");
    }

    initListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new CleanGame();
});
