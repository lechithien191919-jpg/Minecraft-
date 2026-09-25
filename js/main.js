import { World } from './world.js';

class Game {
    constructor() {
        this.initThree();
        this.initWorld();
        this.initUI();
        this.initListeners();
        this.animate();
    }

    initThree() {
        // 1. Scene & Màu trời
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        // 2. Camera đặt chế độ nhìn xéo góc 3D hoàn hảo vào world
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(4, 5, 8);
        this.camera.lookAt(0, 0, 0);

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

        // 4. Ánh sáng không gian 3D
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 15);
        this.scene.add(dirLight);
    }

    initWorld() {
        // Gọi world để dựng khối 3D block (Grass, Dirt, Stone)
        this.world = new World(this.scene);
    }

    initUI() {
        // Giao diện nút bấm cơ bản hiển thị trên màn hình
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
        btnWrapper.style.gridTemplateColumns = 'repeat(2, 70px)';
        btnWrapper.style.gap = '10px';
        btnWrapper.style.pointerEvents = 'auto';

        ['ĐỔI', 'NHẢY', 'ĐẶT', 'ĐẬP'].forEach(text => {
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
            btnWrapper.appendChild(btn);
        });

        uiContainer.appendChild(btnWrapper);
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
