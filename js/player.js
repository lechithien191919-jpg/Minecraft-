export class Player {
    constructor(camera, domElement, world, ui) {
        this.camera = camera;
        this.domElement = domElement;
        this.world = world;
        this.ui = ui;

        // Vị trí ban đầu
        this.camera.position.set(0, 3, 5);
        this.camera.rotation.order = 'YXZ';

        this.moveDir = { x: 0, z: 0 };
        this.speed = 8.0;
        
        // Biến xử lý trọng lực & nhảy
        this.gravity = 20.0;
        this.verticalVelocity = 0;
        this.isGrounded = false;
        this.playerHeight = 1.6;

        this.touchScreenX = 0;
        this.touchScreenY = 0;
        this.isSwiping = false;
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.sensitivity = 0.003;

        this.initMobileControls();
    }

    initMobileControls() {
        const joystickZone = document.getElementById('joystick-zone');
        const knob = document.getElementById('joystick-knob');
        let joystickCenter = { x: 0, y: 0 };
        let activeTouchId = null;

        joystickZone.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            const touch = e.changedTouches[0];
            activeTouchId = touch.identifier;
            const rect = joystickZone.getBoundingClientRect();
            joystickCenter.x = rect.left + rect.width / 2;
            joystickCenter.y = rect.top + rect.height / 2;
        });

        joystickZone.addEventListener('touchmove', (e) => {
            e.stopPropagation();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === activeTouchId) {
                    const dx = touch.clientX - joystickCenter.x;
                    const dy = touch.clientY - joystickCenter.y;
                    const distance = Math.min(45, Math.sqrt(dx * dx + dy * dy));
                    const angle = Math.atan2(dy, dx);

                    const limitedX = Math.cos(angle) * distance;
                    const limitedY = Math.sin(angle) * distance;

                    knob.style.transform = `translate(${limitedX}px, ${limitedY}px)`;

                    this.moveDir.x = limitedX / 45;
                    this.moveDir.z = limitedY / 45;
                }
            }
        });

        const resetJoystick = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === activeTouchId) {
                    activeTouchId = null;
                    knob.style.transform = `translate(0px, 0px)`;
                    this.moveDir.x = 0;
                    this.moveDir.z = 0;
                }
            }
        };

        joystickZone.addEventListener('touchend', resetJoystick);
        joystickZone.addEventListener('touchcancel', resetJoystick);

        // Xoay camera bằng cảm ứng (tránh vùng hotbar và nút bấm)
        window.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            if (touch.clientX > window.innerWidth / 3 && touch.clientY < window.innerHeight - 120) {
                this.isSwiping = true;
                this.touchScreenX = touch.clientX;
                this.touchScreenY = touch.clientY;
            }
        });

        window.addEventListener('touchmove', (e) => {
            if (!this.isSwiping) return;
            const touch = e.touches[0];
            
            const deltaX = touch.clientX - this.touchScreenX;
            const deltaY = touch.clientY - this.touchScreenY;

            this.touchScreenX = touch.clientX;
            this.touchScreenY = touch.clientY;

            this.euler.setFromQuaternion(this.camera.quaternion);
            this.euler.y -= deltaX * this.sensitivity;
            this.euler.x -= deltaY * this.sensitivity;
            this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));

            this.camera.quaternion.setFromEuler(this.euler);
        });

        window.addEventListener('touchend', () => {
            this.isSwiping = false;
        });

        // Nút bấm hành động
        document.getElementById('btn-break').addEventListener('click', (e) => { e.stopPropagation(); this.doAction('break'); });
        document.getElementById('btn-place').addEventListener('click', (e) => { e.stopPropagation(); this.doAction('place'); });
        document.getElementById('btn-jump').addEventListener('click', (e) => { e.stopPropagation(); this.jump(); });
        document.getElementById('btn-switch').addEventListener('click', (e) => { e.stopPropagation(); this.ui.cycleBlock(); });
    }

    jump() {
        if (this.isGrounded) {
            this.verticalVelocity = 8.0; // Lực nhảy lên
            this.isGrounded = false;
        }
    }

    doAction(type) {
        const raycaster = new THREE.Raycaster();
        const center = new THREE.Vector2(0, 0);
        raycaster.setFromCamera(center, this.camera);
        
        const intersects = raycaster.intersectObjects(this.world.scene.children);

        if (intersects.length > 0) {
            const intersect = intersects[0];
            if (intersect.distance > 6) return;

            if (type === 'break') {
                this.world.removeBlock(intersect.object);
            } else if (type === 'place') {
                const position = intersect.object.position.clone().add(intersect.face.normal);
                const selectedType = this.ui.getSelectedBlock();
                this.world.addBlock(position.x, position.y, position.z, selectedType);
            }
        }
    }

    update(delta) {
        // 1. Di chuyển ngang
        if (this.moveDir.x !== 0 || this.moveDir.z !== 0) {
            const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);
            const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);

            const moveVector = new THREE.Vector3();
            moveVector.addScaledVector(forward, -this.moveDir.z);
            moveVector.addScaledVector(right, this.moveDir.x);
            moveVector.normalize();

            this.camera.position.addScaledVector(moveVector, this.speed * delta);
        }

        // 2. Trọng lực & Xử lý đứng trên mặt đất / bước lên bậc block
        this.verticalVelocity -= this.gravity * delta;
        this.camera.position.y += this.verticalVelocity * delta;

        // Kiểm tra va chạm mặt đất đơn giản (mặt đất chuẩn ở y = 0.5)
        const groundLevel = 1.5; // Chiều cao mắt nhân vật so với mặt đất block
        
        // Quét tìm block ngay dưới chân nhân vật
        const blockUnder = this.world.getBlockAt(this.camera.position.x, this.camera.position.y - this.playerHeight, this.camera.position.z);
        
        let targetGroundY = 1.5; // Mặc định mặt đất cơ bản
        if (blockUnder) {
            targetGroundY = blockUnder.position.y + 1.5; // Đứng trên bề mặt block đó
        }

        if (this.camera.position.y <= targetGroundY) {
            this.camera.position.y = targetGroundY;
            this.verticalVelocity = 0;
            this.isGrounded = true;
        }
    }
}
