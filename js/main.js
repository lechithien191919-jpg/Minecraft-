import { World } from './world.js';
import { Player } from './player.js';
import { UI } from './ui.js';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Màu trời Minecraft

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Ánh sáng môi trường
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);

        // Khởi tạo các thành phần
        this.world = new World(this.scene);
        this.world.generate();

        this.ui = new UI();
        this.player = new Player(this.camera, this.renderer.domElement, this.world, this.ui);

        window.addEventListener('resize', () => this.onWindowResize());

        this.clock = new THREE.Clock();
        this.animate();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        this.player.update(delta);

        this.renderer.render(this.scene, this.camera);
    }
}

// Chạy game
new Game();
