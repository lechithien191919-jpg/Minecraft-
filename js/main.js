class Checkpoint1Game {
    constructor() {
        this.initThree();
        this.checkCanvasMetrics();
        this.initListeners();
        this.animate();
    }

    initThree() {
        // 1. Scene & Màu xanh da trời
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        // 2. Camera đặt tạm ở (0, 2, 5)
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 2, 5);
        this.camera.lookAt(0, 0, 0);

        // 3. WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Gắn canvas vào DOM
        document.body.appendChild(this.renderer.domElement);
    }

    checkCanvasMetrics() {
        const canvas = this.renderer.domElement;
        
        console.log("===== CHECKPOINT 1 CANVAS METRICS =====");
        console.log("canvas.width:", canvas.width);
        console.log("canvas.height:", canvas.height);
        console.log("canvas.clientWidth:", canvas.clientWidth);
        console.log("canvas.clientHeight:", canvas.clientHeight);
        console.log("window.devicePixelRatio:", window.devicePixelRatio);
        console.log("=======================================");

        if (canvas.clientWidth === 0 || canvas.clientHeight === 0) {
            console.error("⚠️ CẢNH BÁO: clientWidth hoặc clientHeight bằng 0! Canvas chưa được hiển thị đúng trên DOM.");
        }
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
    new Checkpoint1Game();
});
