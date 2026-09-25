import { UI } from './ui.js';

class Game {
    constructor() {
        this.initThree();
        this.initSimpleTestBlocks(); // Test 3 block cơ bản theo Bước 4
        this.initUI();
        this.animate();
    }

    initThree() {
        // BƯỚC 1: Background xanh để test Renderer / Canvas
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); 

        // Camera
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);

        // Renderer & Canvas (Kiểm tra kích thước width/height - Bước 3 & 6)
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const canvas = this.renderer.domElement;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '1'; // Nằm trên background nhưng dưới UI nếu cần
        document.body.appendChild(canvas);

        console.log("🖥️ Canvas Dimensions:", canvas.width, "x", canvas.height);
    }

    initSimpleTestBlocks() {
        // BƯỚC 4: Tạo đúng 3 block test đơn giản với MeshBasicMaterial (Không texture)
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        // Block 1: Grass (Xanh lá)
        const matGrass = new THREE.MeshBasicMaterial({ color: 0x559933 });
        const meshGrass = new THREE.Mesh(geometry, matGrass);
        meshGrass.position.set(0, 0, 0);
        this.scene.add(meshGrass);

        // Block 2: Dirt (Nâu đất)
        const matDirt = new THREE.MeshBasicMaterial({ color: 0x8b5a2b });
        const meshDirt = new THREE.Mesh(geometry, matDirt);
        meshDirt.position.set(1, 0, 0);
        this.scene.add(meshDirt);

        // Block 3: Stone (Xám)
        const matStone = new THREE.MeshBasicMaterial({ color: 0x7f7f7f });
        const meshStone = new THREE.Mesh(geometry, matStone);
        meshStone.position.set(-1, 0, 0);
        this.scene.add(meshStone);

        console.log("🧱 3 Test Blocks Added. Scene total children:", this.scene.children.length);
    }

    initUI() {
        this.ui = new UI();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // BƯỚC 2: Render loop chạy
        // console.log("Render loop running..."); // Bỏ comment nếu muốn check console
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
