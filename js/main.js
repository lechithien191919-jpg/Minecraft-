import { World } from './world.js';

class MinecraftGame {
    constructor() {
        try {
            this.initThree();
            this.initWorld();
            this.initUI();
            this.animate();
            console.log("🟢 Khởi tạo game thành công!");
        } catch (error) {
            this.showError(error);
        }
    }

    initThree() {
        // 1. Scene & Màu trời đặc trưng
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        // 2. Camera đặt ở góc nhìn bao quát đẹp mắt
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(4, 4, 6);
        this.camera.lookAt(0, 0, 0);

        // 3. WebGL Renderer tối ưu cho điện thoại
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

        // Xử lý resize màn hình tự động
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    initWorld() {
        // Gọi module World để dựng các khối block 3D
        this.world = new World(this.scene);
    }

    initUI() {
        // Tạo giao diện các nút bấm quen thuộc (ĐỔI, NHẢY, ĐẶT, ĐẬP) góc phải màn hình
        const uiContainer = document.createElement('div');
        uiContainer.style.position = 'fixed';
        uiContainer.style.top = '0';
        uiContainer.style.left = '0';
        uiContainer.style.width = '100%';
        uiContainer.style.height = '100%';
        uiContainer.style.zIndex = '10';
        uiContainer.style.pointerEvents = 'none';
        document.body.appendChild(uiContainer);

        const btnWrapper = document.createElement('div');
        btnWrapper.style.position = 'absolute';
        btnWrapper.style.right = '20px';
        btnWrapper.style.bottom = '20px';
        btnWrapper.style.display = 'grid';
        btnWrapper.style.gridTemplateColumns = 'repeat(2, 65px)';
        btnWrapper.style.gap = '10px';
        btnWrapper.style.pointerEvents = 'auto';

        ['ĐỔI', 'NHẢY', 'ĐẶT', 'ĐẬP'].forEach(text => {
            const btn = document.createElement('button');
            btn.innerText = text;
            btn.style.width = '65px';
            btn.style.height = '65px';
            btn.style.borderRadius = '50%';
            btn.style.background = 'rgba(0, 0, 0, 0.6)';
            btn.style.color = '#fff';
            btn.style.border = '2px solid #fff';
            btn.style.fontSize = '13px';
            btn.style.fontWeight = 'bold';
            btn.style.cursor = 'pointer';

            btn.addEventListener('click', () => {
                console.log(`🔘 Đã bấm nút: ${text}`);
            });

            btnWrapper.appendChild(btn);
        });

        uiContainer.appendChild(btnWrapper);
    }

    showError(error) {
        document.body.innerHTML = `<div style="color:red; padding:20px; font-family:monospace;">
            <h3>❌ Lỗi khởi động game</h3>
            <p>${error.message}</p>
        </div>`;
        console.error(error);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new MinecraftGame();
});
