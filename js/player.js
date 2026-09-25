export class Player {
    constructor(camera, domElement, world, ui) {
        this.camera = camera;
        this.domElement = domElement;
        this.world = world;
        this.ui = ui;

        // Vị trí ban đầu
        this.camera.position.set(0, 3, 5);
        this.camera.rotation.order = 'YXZ'; // Tránh lỗi lật camera

        this.moveDir = { x: 0, z: 0 };
        this.speed = 8.0;

        // Biến xử lý xoay màn hình bằng cách vuốt cảm ứng
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

        // 1. Xử lý Joystick di chuyển
        joystickZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            activeTouchId = touch.identifier;
            const rect = joystickZone.getBoundingClientRect();
            joystickCenter.x = rect.left + rect.width / 2;
            joystickCenter.y = rect.top + rect.height / 2;
        });

        joystickZone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === activeTouchId) {
                    const dx = touch.clientX - joystickCenter.x;
                    const dy = touch.clientY - joystickCenter.y;
                    const distance = Math.min(50, Math.sqrt(dx * dx + dy * dy));
                    const angle = Math.atan2(dy, dx);

                    const limitedX = Math.cos(angle) * distance;
                    const limitedY = Math.sin(angle) * distance;

                    knob.style.transform = `translate(${limitedX}px, ${limitedY}px)`;

                    // Tính toán hướng di chuyển chuẩn
                    this.moveDir.x = limitedX / 50;
                    this.moveDir.z = limitedY / 50;
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

        // 2. Xử lý vuốt màn hình bên phải để xoay góc nhìn camera
        window.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            // Nếu chạm sang nửa phải màn hình hoặc không chạm vào joystick/nút thì cho xoay
            if (touch.clientX > window.innerWidth / 3) {
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

            // Giới hạn góc nhìn không bị lật ngược đầu
            this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));

            this.camera.quaternion.setFromEuler(this.euler);
        });

        window.addEventListener('touchend', () => {
            this.isSwiping = false;
        });

        // 3. Xử lý nút bấm Đập / Đặt / Đổi block
        document.getElementById('btn-break').addEventListener('click', () => {
            this.doAction('break');
        });

        document.getElementById('btn-place').addEventListener('click', () => {
            this.doAction('place');
        });

        document.getElementById('btn-switch').addEventListener('click', () => {
            this.ui.cycleBlock();
        });
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
        if (this.moveDir.x === 0 && this.moveDir.z === 0) return;

        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);

        const moveVector = new THREE.Vector3();
        moveVector.addScaledVector(forward, -this.moveDir.z);
        moveVector.addScaledVector(right, this.moveDir.x);
        moveVector.normalize();

        this.camera.position.addScaledVector(moveVector, this.speed * delta);
    }
                    }
