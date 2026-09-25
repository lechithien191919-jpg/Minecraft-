import { World } from './world.js';
import { Player } from './player.js';
import { UI } from './ui.js';

class Game {
    constructor() {
        this.initThree();
        this.initTestBox(); // Test Box theo yêu cầu của ChatGPT
        this.initGameWorld();
        this.initListeners();
        this.animate();
    }

    initThree() {
        // 1. Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Màu trời xanh

        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Đảm bảo canvas nằm dưới cùng và phủ toàn màn hình để không bị che bởi UI đen
        this.renderer.domElement.style.position = 'fixed';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.zIndex = '0'; // Đặt dưới UI
        document.body.appendChild(this.renderer.domElement);

        // 4. Ánh sáng
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambientLight);
    }

    initTestBox() {
        // BÀI TEST BOX THEO YÊU CẦU CHATGPT: Tạo một khối hộp đơn giản ngay trước camera
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Màu đỏ chói dễ nhận biết
        this.testBox = new THREE.Mesh(geometry, material);
        this.testBox.position.set(0, 0, -5); // Đặt ngay trước mặt camera
        this.scene.add(this.testBox);
        
        console.log("🧪 TEST BOX ADDED. Scene children count:", this.scene.children.length);
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

        // Cho test box xoay nhẹ để nhận biết render loop có chạy không
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
