import { World } from './world.js';
import { Player } from './player.js';
import { UI } from './ui.js';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Màu trời xanh Minecraft

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

        this.player = new Player(this.camera, this.renderer.domElement);
        this.ui = new UI();

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(0, 0); // Tâm màn hình

        this.initMouseInteractions();

        window.addEventListener('resize', () => this.onWindowResize());

        this.clock = new THREE.Clock();
        this.animate();
    }

    initMouseInteractions() {
        window.addEventListener('mousedown', (e) => {
            if (!this.player.controls.isLocked) return;

            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.scene.children);

            if (intersects.length > 0) {
                const intersect = intersects[0];

                // Giới hạn tầm với của nhân vật (ví dụ trong bán kính 6 đơn vị)
                if (intersect.distance > 6) return;

                if (e.button === 0) {
                    // Click trái: Đập block
                    if (intersect.object !== this.skyMesh) {
                        this.world.removeBlock(intersect.object);
                    }
                } else if (e.button === 2) {
                    // Click phải: Đặt block dựa vào mặt phẳng tiếp xúc (normal)
                    const position = intersect.object.position.clone().add(intersect.face.normal);
                    const selectedType = this.ui.getSelectedBlock();
                    this.world.addBlock(position.x, position.y, position.z, selectedType);
                }
            }
        });

        // Chặn menu chuột phải mặc định để dùng cho việc đặt block
        window.addEventListener('contextmenu', (e) => e.preventDefault());
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

// Chạy game khi load xong
new Game();
