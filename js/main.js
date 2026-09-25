import { World } from './world.js';
import { Player } from './player.js';
import { UI } from './ui.js';

class Game {
    constructor() {
        this.container = document.body;
        this.initThree();
        this.initGameWorld();
        this.initListeners();
        this.animate();
    }

    initThree() {
        // 1. Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Màu trời xanh Minecraft

        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);

        // 4. Ánh sáng cơ bản
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        this.scene.add(dirLight);
    }

    initGameWorld() {
        // Khởi tạo UI trước để Player và World dùng
        this.ui = new UI();

        // Khởi tạo World (Sàn phẳng ổn định, không lỗi mesh)
        this.world = new World(this.scene);

        // Khởi tạo Player
        this.player = new Player(this.camera, this.renderer.domElement, this.world, this.ui);
        
        console.log("🎮 Game initialized successfully. Total blocks in world:", this.world.blocks.size);
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

        const delta = 0.016; // Cố định delta mượt mà khoảng 60fps
        if (this.player && typeof this.player.update === 'function') {
            this.player.update(delta);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Khởi chạy game khi DOM đã sẵn sàng
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
