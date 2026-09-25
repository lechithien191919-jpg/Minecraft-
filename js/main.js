import { UI } from './ui.js';
import { World } from './world.js';

class Game {
    constructor() {
        this.initThree();
        this.initGameWorld();
        this.initUI();
        this.initListeners();
        this.animate();
    }

    initThree() {
        // 1. Scene & Màu trời Minecraft
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        // 2. Camera góc nhìn chuẩn
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
        canvas.style.zIndex = '1';
        document.body.appendChild(canvas);

        // 4. Ánh sáng chiếu rọi world
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
        dirLight.position.set(10, 20, 10);
        this.scene.add(dirLight);
    }

    initGameWorld() {
        // Khởi tạo World cơ bản (Grass, Dirt, Stone) không lỗi lag
        this.world = new World(this.scene);
        console.log("🌍 World initialized. Total blocks:", this.world.blocks.size);
    }

    initUI() {
        // Khôi phục lại các nút chức năng cũ (Nhảy, Đập, Đặt, Đổi, Hotbar...)
        this.ui = new UI();
        console.log("🎮 UI buttons restored successfully.");
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
    new Game();
});

