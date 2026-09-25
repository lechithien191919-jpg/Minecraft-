import { World } from './world.js';
import { Player } from './player.js';
import { UI } from './ui.js';

class Game {
    constructor() {
        this.initThree();
        this.initTestBox();
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
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // QUAN TRỌNG: Thiết lập CSS để canvas hiển thị đúng chuẩn màn hình mobile, nằm dưới các nút bấm UI nhưng hiển thị đè lên background đen
        const canvas = this.renderer.domElement;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '1'; // Đảm bảo nổi lên trên nền đen
        document.body.insertBefore(canvas, document.body.firstChild);

        // 4. Ánh sáng
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        this.scene.add(dirLight);
    }

    initTestBox() {
        // Test Box theo yêu cầu: Khối hộp màu đỏ kiểm tra render
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.testBox = new THREE.Mesh(geometry, material);
        this.testBox.position.set(0, 0, -5);
        this.scene.add(this.testBox);
    }

    initGameWorld() {
        this.ui = new UI();
        this.world = new World(this.scene);
        this.player = new Player(this.camera, this.renderer.domElement, this.world, this.ui);
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

        if (this.testBox) {
            this.testBox.rotation.x += 0.01;
            this.testBox.rotation.y += 0.01;
        }

        const delta = 0.016;
        if (this.player && typeof this.player.update === 'function') {
            this.player.update(delta);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
