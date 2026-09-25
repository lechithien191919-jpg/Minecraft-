class TestAGame {
    constructor() {
        try {
            this.initThree();
            this.initTouchCamera();
            this.animate();
            console.log("🟢 Test A initialized successfully.");
        } catch (error) {
            this.showErrorScreen("Test A Init Error", error);
        }
    }

    initThree() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 2, 5);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const canvas = this.renderer.domElement;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '1';
        document.body.appendChild(canvas);
    }

    initTouchCamera() {
        let isPointerDown = false;
        let previousX = 0;
        let previousY = 0;

        window.addEventListener('pointerdown', (e) => {
            isPointerDown = true;
            previousX = e.clientX;
            previousY = e.clientY;
        });

        window.addEventListener('pointermove', (e) => {
            if (!isPointerDown) return;
            const deltaX = e.clientX - previousX;
            const deltaY = e.clientY - previousY;

            // Xoay camera đơn giản quanh trục Y và X
            this.camera.rotation.y -= deltaX * 0.005;
            this.camera.rotation.x -= deltaY * 0.005;

            previousX = e.clientX;
            previousY = e.clientY;
        });

        window.addEventListener('pointerup', () => {
            isPointerDown = false;
        });
    }

    showErrorScreen(title, error) {
        document.body.innerHTML = `<div style="color:red; padding:20px; font-family:monospace;">
            <h3>❌ ${title}</h3>
            <p>${error.message}</p>
            <p><small>${error.stack}</small></p>
        </div>`;
        console.error(error);
    }

    animate() {
        try {
            requestAnimationFrame(() => this.animate());
            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            this.showErrorScreen("Render Loop Error", error);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new TestAGame();
});

