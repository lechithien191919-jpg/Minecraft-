class SafeDebugMinecraftGame {
    constructor() {
        try {
            this.initThree();
            this.initTestBox(); // Test Box đơn giản theo bước 3
            this.initControls();
            this.animate();
            console.log("🟢 3D Khôi phục thành công!");
        } catch (error) {
            this.showError(error);
        }
    }

    initThree() {
        this.scene = new THREE.Scene();
        // Bước 2: Background xanh để kiểm tra renderer
        this.scene.background = new THREE.Color(0x87CEEB);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 5);

        this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const canvas = this.renderer.domElement;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '1';
        canvas.style.touchAction = 'none';
        document.body.appendChild(canvas);

        const light = new THREE.AmbientLight(0xffffff, 0.9);
        this.scene.add(light);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // Bước 3: Tạo 1 BoxGeometry đơn giản không texture để test không gian 3D
    initTestBox() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.testBox = new THREE.Mesh(geometry, material);
        this.scene.add(this.testBox);
    }

    initControls() {
        this.moveVector = new THREE.Vector2(0, 0);

        // GUI đơn giản test tương tác
        const ui = document.createElement('div');
        ui.style.position = 'fixed';
        ui.style.top = '20px';
        ui.style.left = '20px';
        ui.style.zIndex = '10';
        
        const btn = document.createElement('button');
        btn.innerText = "TEST GUI";
        btn.style.padding = "10px";
        btn.style.pointerEvents = 'auto';
        btn.addEventListener('click', () => {
            console.log("GUI click hoạt động tốt!");
        });
        ui.appendChild(btn);
        document.body.appendChild(ui);

        // Xử lý sự kiện pointer an toàn, KHÔNG gọi setPointerCapture gây crash
        let lookPointerId = null;
        let lastX = 0, lastY = 0;

        window.addEventListener('pointerdown', (e) => {
            if (lookPointerId === null) {
                lookPointerId = e.pointerId;
                lastX = e.clientX;
                lastY = e.clientY;
            }
        });

        window.addEventListener('pointermove', (e) => {
            if (lookPointerId !== null && e.pointerId === lookPointerId) {
                const dx = e.clientX - lastX;
                const dy = e.clientY - lastY;
                if (this.testBox) {
                    this.testBox.rotation.y += dx * 0.01;
                    this.testBox.rotation.x += dy * 0.01;
                }
                lastX = e.clientX;
                lastY = e.clientY;
            }
        });

        const releasePointer = (e) => {
            if (e.pointerId === lookPointerId) {
                lookPointerId = null;
            }
        };

        window.addEventListener('pointerup', releasePointer);
        window.addEventListener('pointercancel', releasePointer);
    }

    showError(err) {
        console.error("Lỗi nghiêm trọng:", err);
        document.body.innerHTML += `<h3 style="color:red; position:fixed; top:50px; z-index:99">Lỗi: ${err.message}</h3>`;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Bước 4: Kiểm tra render loop thực tế
        // console.log("Render loop alive"); 

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new SafeDebugMinecraftGame();
});

