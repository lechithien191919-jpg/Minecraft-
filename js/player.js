export class Player {
    constructor(camera, domElement) {
        this.camera = camera;
        this.controls = new THREE.PointerLockControls(camera, domElement);
        
        // Vị trí ban đầu của người chơi trên mặt đất
        this.camera.position.set(0, 3, 5);
        
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.speed = 10.0;
        
        this.initListeners();
    }

    initListeners() {
        const instructions = document.getElementById('instructions');

        instructions.addEventListener('click', () => {
            this.controls.lock();
        });

        this.controls.addEventListener('lock', () => {
            instructions.style.display = 'none';
        });

        this.controls.addEventListener('unlock', () => {
            instructions.style.display = 'flex';
        });

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW': this.moveForward = true; break;
            case 'KeyS': this.moveBackward = true; break;
            case 'KeyA': this.moveLeft = true; break;
            case 'KeyD': this.moveRight = true; break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW': this.moveForward = false; break;
            case 'KeyS': this.moveBackward = false; break;
            case 'KeyA': this.moveLeft = false; break;
            case 'KeyD': this.moveRight = false; break;
        }
    }

    update(delta) {
        if (!this.controls.isLocked) return;

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize(); // Đảm bảo tốc độ di chuyển đều mọi hướng

        if (this.moveForward || this.moveBackward) {
            this.controls.moveForward(this.direction.z * this.speed * delta);
        }
        if (this.moveLeft || this.moveRight) {
            this.controls.moveRight(this.direction.x * this.speed * delta);
        }
    }
}
