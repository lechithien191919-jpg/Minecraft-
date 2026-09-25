class Checkpoint1Game {
    constructor() {
        this.initThree();
        this.initTestBox(); // Thêm Test Box 3D để kiểm chứng hình khối
        this.checkCanvasMetrics();
        this.initListeners();
        this.animate();
    }

    initThree() {
        // 1. Scene & Background xanh da trời
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 2, 5);
        this.camera.lookAt(0, 0, 0);

        // 3. WebGL Renderer tối ưu Mobile & PC
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 4. Append Canvas vào DOM
        const canvas = this.renderer.domElement;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '1';
        document.body.appendChild(canvas);

        // 5. Ánh sáng chiếu cơ bản
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        this.scene.add(ambientLight);
    }

    initTestBox() {
        // Tạo một Test Box 3D màu đỏ ngay trước camera để chắc chắn thấy hình khối trên điện thoại
        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.testBox = new THREE.Mesh(geometry, material);
        this.testBox.position.set(0, 0, -3);
        this.scene.add(this.testBox);
    }

    checkCanvasMetrics() {
        const canvas = this.renderer.domElement;
        
        console.log("===== CHECKPOINT 1 METRICS REPORT =====");
        console.log("renderer.domElement.width:", canvas.width);
        console.log("renderer.domElement.clientWidth:", canvas.clientWidth);
        console.log("window.innerWidth / window.innerHeight:", window.innerWidth, "/", window.innerHeight);
        console.log("renderer.getPixelRatio():", this.renderer.getPixelRatio());
        
        if (canvas.width > 0 && canvas.clientWidth > 0) {
            console.log("✅ PASS: Canvas kích thước hợp lệ.");
        } else {
            console.error("❌ FAIL: Canvas width hoặc clientWidth bằng 0!");
        }
        console.log("=======================================");
    }

    initListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.resizeCanvas();
            }, 200);
        });
    }

    resizeCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        console.log(`🔄 Resized to -> Width: ${width}, Height: ${height}, Ratio: ${this.camera.aspect.toFixed(2)}`);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Cho test box xoay nhẹ để chứng minh vật thể 3D render sống động
        if (this.testBox) {
            this.testBox.rotation.x += 0.01;
            this.testBox.rotation.y += 0.01;
        }

        // Chứng minh vòng lặp sống
        if (!this._loggedLoop) {
            console.log("🟢 Render loop running... (Live frame active)");
            this._loggedLoop = true;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Checkpoint1Game();
});
