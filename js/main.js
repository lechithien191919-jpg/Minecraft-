// main.js
import * as THREE from 'three';
import { createWorldManager } from './worldManager.js';
import { createPlayerPhysics } from './playerPhysics.js';
import { createBlockInteraction } from './blockInteraction.js';
import { BLOCK_TYPES } from './blocks.js';
import { TreeGenerator } from './treeGenerator.js';
import { createItemDrop } from './itemDrop.js';
import { EventBus } from './eventBus.js';

class Checkpoint5FinalGame {
    constructor() {
        this.container = document.createElement('div');
        document.body.appendChild(this.container);

        // Scene, Camera, Renderer
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(50, 100, 50);
        this.scene.add(dirLight);

        // Raycaster cho tương tác block
        this.raycaster = new THREE.Raycaster();

        // Khởi tạo World Manager
        this.initWorldManager();

        // Khởi tạo Player Physics
        this.player = createPlayerPhysics({
            camera: this.camera,
            world: {
                has: (x, y, z) => this.worldManager.hasBlock(x, y, z)
            }
        });

        // Khởi tạo Block Interaction
        this.blockInteraction = createBlockInteraction({
            camera: this.camera,
            scene: this.scene,
            world: {
                get: (x, y, z) => this.worldManager.getBlock(x, y, z),
                removeBlock: (x, y, z) => this.worldManager.removeBlock(x, y, z),
                addBlock: (x, y, z, type) => this.worldManager.addBlock(x, y, z, type)
            },
            raycaster: this.raycaster
        });

        // Khởi tạo Item Drop System (Đợt 3)
        this.itemDrop = createItemDrop({
            scene: this.scene,
            world: {
                has: (x, y, z) => this.worldManager.hasBlock(x, y, z),
                get: (x, y, z) => this.worldManager.getBlock(x, y, z)
            }
        });

        // Xử lý sự kiện input (chuột, bàn phím, đập/đặt block)
        this.initInputEvents();

        // Clock cho delta time
        this.clock = new THREE.Clock();

        // Bind resize
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Bắt đầu vòng lặp game
        this.animate();
    }

    initWorldManager() {
        this.worldManager = createWorldManager({ scene: this.scene });
        this.worldManager.generateTerrain();

        // Sinh rừng tự động (Tree Generator - Đợt 2)
        const treeGen = new TreeGenerator({
            world: {
                has: (x, y, z) => this.worldManager.hasBlock(x, y, z),
                addBlock: (x, y, z, type) => this.worldManager.addBlock(x, y, z, type)
            }
        });
        treeGen.generateForest(15);
    }

    initInputEvents() {
        // Click để khóa con trỏ chuột nhìn xung quanh
        document.addEventListener('click', () => {
            if (document.body.requestPointerLock) {
                document.body.requestPointerLock();
            }
        });

        // Xử lý sự kiện đập block (chuột trái) và đặt block (chuột phải)
        window.addEventListener('mousedown', (event) => {
            if (document.pointerLockElement !== document.body) return;

            if (event.button === 0) {
                // Chuột trái: Đập block
                this.blockInteraction.breakBlock();
            } else if (event.button === 2) {
                // Chuột phải: Đặt block
                this.blockInteraction.placeBlock();
            }
        });

        // Chặn menu chuột phải mặc định
        window.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    update() {
        const dt = this.clock.getDelta();

        // 1. Cập nhật vật lý người chơi
        if (this.player) {
            this.player.update(dt);
        }

        // 2. Cập nhật hệ thống vật phẩm rơi (Item Drop - Đợt 3)
        if (this.itemDrop && this.player) {
            this.itemDrop.update(dt, this.player.position);
        }

        // 3. Render khung hình
        this.renderer.render(this.scene, this.camera);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
    }
}

// Khởi động game khi tải trang xong
window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Checkpoint5FinalGame();
    console.log('[GAME] Khởi chạy thành công Checkpoint Đợt 3!');
});
