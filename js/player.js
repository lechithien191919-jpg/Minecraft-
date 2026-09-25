export class Player {
    constructor(camera, domElement, world, ui) {
        this.camera = camera;
        this.domElement = domElement;
        this.world = world;
        this.ui = ui;

        // Vị trí ban đầu
        this.camera.position.set(0, 5, 5);
        this.camera.rotation.order = 'YXZ';

        this.moveDir = { x: 0, z: 0 };
        this.speed = 5.0; 
        
        // Kích thước hộp va chạm (AABB)
        this.radius = 0.3;     
        this.height = 1.6;     
        this.eyeHeight = 1.4;  

        // Vật lý trọng lực & nhảy
        this.gravity = 25.0;
        this.verticalVelocity = 0;
        this.isGrounded = false;
        this.jumpForce = 8.5;

        // Quản lý cảm ứng đa điểm (Multi-touch)
        this.lookTouchId = null;
        this.touchScreenX = 0;
        this.touchScreenY = 0;
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.sensitivity = 0.003;

        this.initMobileControls();
    }

    initMobileControls() {
        const joystickZone = document.getElementById('joystick-zone');
        const knob = document.getElementById('joystick-knob');
        let joystickCenter = { x: 0, y: 0 };
        let activeJoystickId = null;

        // 1. Điều khiển Joystick (Di chuyển)
        joystickZone.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            const touch = e.changedTouches[0];
            if (activeJoystickId === null) {
                activeJoystickId = touch.identifier;
                const rect = joystickZone.getBoundingClientRect();
                joystickCenter.x = rect.left + rect.width / 2;
                joystickCenter.y = rect.top + rect.height / 2;
            }
        });

        joystickZone.addEventListener('touchmove', (e) => {
            e.stopPropagation();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === activeJoystickId) {
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
                if (e.changedTouches[i].identifier === activeJoystickId) {
                    activeJoystickId = null;
                    knob.style.transform = `translate(0px, 0px)`;
                    this.moveDir.x = 0;
                    this.moveDir.z = 0;
                }
            }
        };
        joystickZone.addEventListener('touchend', resetJoystick);
        joystickZone.addEventListener('touchcancel', resetJoystick);

        // 2. Xoay camera mượt mà bằng phần màn hình bên phải (Hỗ trợ multi-touch độc lập)
        window.addEventListener('touchstart', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                // Nếu chạm ở nửa phải màn hình và chưa gán ngón xoay camera
                if (touch.clientX > window.innerWidth / 3 && this.lookTouchId === null) {
                    // Kiểm tra không chạm vào khu vực nút bấm hoặc hotbar
                    if (touch.clientY < window.innerHeight - 130) {
                        this.lookTouchId = touch.identifier;
                        this.touchScreenX = touch.clientX;
                        this.touchScreenY = touch.clientY;
                    }
                }
            }
        });

        window.addEventListener('touchmove', (e) => {
            if (this.lookTouchId === null) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this.lookTouchId) {
                    const deltaX = touch.clientX - this.touchScreenX;
                    const deltaY = touch.clientY - this.touchScreenY;

                    this.touchScreenX = touch.clientX;
                    this.touchScreenY = touch.clientY;

                    this.euler.setFromQuaternion(this.camera.quaternion);
                    this.euler.y -= deltaX * this.sensitivity;
                    this.euler.x -= deltaY * this.sensitivity;
                    this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));

                    this.camera.quaternion.setFromEuler(this.euler);
                }
            }
        });

        const endCameraTouch = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this.lookTouchId) {
                    this.lookTouchId = null;
                }
            }
        };
        window.addEventListener('touchend', endCameraTouch);
        window.addEventListener('touchcancel', endCameraTouch);

        // 3. Các nút bấm hành động (Đảm bảo bắt sự kiện cực nhạy và không bị cản trở)
        const bindButton = (id, action) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('touchstart', (e) => {
                    e.stopPropagation(); // Chặn lan truyền sự kiện chạm để ko ảnh hưởng xoay màn hình
                });
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    action();
                });
            }
        };

        bindButton('btn-break', () => this.doAction('break'));
        bindButton('btn-place', () => this.doAction('place'));
        bindButton('btn-jump', () => this.jump());
        bindButton('btn-switch', () => this.ui.cycleBlock());
    }

    jump() {
        if (this.isGrounded) {
            this.verticalVelocity = this.jumpForce;
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
                
                // Không cho đặt block đè lên người chơi
                const playerMinX = this.camera.position.x - this.radius;
                const playerMaxX = this.camera.position.x + this.radius;
                const playerMinZ = this.camera.position.z - this.radius;
                const playerMaxZ = this.camera.position.z + this.radius;
                const playerMinY = this.camera.position.y - this.eyeHeight;
                const playerMaxY = this.camera.position.y + (this.height - this.eyeHeight);

                if (!(position.x + 0.5 < playerMinX || position.x - 0.5 > playerMaxX ||
                      position.y + 0.5 < playerMinY || position.y - 0.5 > playerMaxY ||
                      position.z + 0.5 < playerMinZ || position.z - 0.5 > playerMaxZ)) {
                    return; 
                }

                const selectedType = this.ui.getSelectedBlock();
                this.world.addBlock(position.x, position.y, position.z, selectedType);
            }
        }
    }

    checkCollision(x, y, z) {
        const minX = x - this.radius;
        const maxX = x + this.radius;
        const minZ = z - this.radius;
        const maxZ = z + this.radius;
        const minY = y - this.eyeHeight;
        const maxY = y + (this.height - this.eyeHeight);

        const startX = Math.floor(minX);
        const endX = Math.floor(maxX);
        const startY = Math.floor(minY);
        const endY = Math.floor(maxY);
        const startZ = Math.floor(minZ);
        const endZ = Math.floor(maxZ);

        for (let bx = startX; bx <= endX; bx++) {
            for (let by = startY; by <= endY; by++) {
                for (let bz = startZ; bz <= endZ; bz++) {
                    const block = this.world.getBlockAt(bx, by, bz);
                    if (block) {
                        const bMinX = bx - 0.5, bMaxX = bx + 0.5;
                        const bMinY = by - 0.5, bMaxY = by + 0.5;
                        const bMinZ = bz - 0.5, bMaxZ = bz + 0.5;

                        if (maxX > bMinX && minX < bMaxX &&
                            maxY > bMinY && minY < bMaxY &&
                            maxZ > bMinZ && minZ < bMaxZ) {
                            return true; 
                        }
                    }
                }
            }
        }
        return false;
    }

    update(delta) {
        if (delta > 0.1) delta = 0.1; 

        let moveVector = new THREE.Vector3();
        if (this.moveDir.x !== 0 || this.moveDir.z !== 0) {
            const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);
            const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);

            moveVector.addScaledVector(forward, -this.moveDir.z);
            moveVector.addScaledVector(right, this.moveDir.x);
            moveVector.normalize();
        }

        const horizontalStep = moveVector.clone().multiplyScalar(this.speed * delta);

        // Trục X
        if (horizontalStep.x !== 0) {
            this.camera.position.x += horizontalStep.x;
            if (this.checkCollision(this.camera.position.x, this.camera.position.y, this.camera.position.z)) {
                if (this.isGrounded && !this.checkCollision(this.camera.position.x, this.camera.position.y + 1.0, this.camera.position.z)) {
                    this.camera.position.y += 1.0; 
                } else {
                    this.camera.position.x -= horizontalStep.x; 
                }
            }
        }

        // Trục Z
        if (horizontalStep.z !== 0) {
            this.camera.position.z += horizontalStep.z;
            if (this.checkCollision(this.camera.position.x, this.camera.position.y, this.camera.position.z)) {
                if (this.isGrounded && !this.checkCollision(this.camera.position.x, this.camera.position.y + 1.0, this.camera.position.z)) {
                    this.camera.position.y += 1.0; 
                } else {
                    this.camera.position.z -= horizontalStep.z; 
                }
            }
        }

        // Trọng lực & Trục Y
        this.verticalVelocity -= this.gravity * delta;
        const verticalStep = this.verticalVelocity * delta;

        if (verticalStep !== 0) {
            this.camera.position.y += verticalStep;
            if (this.checkCollision(this.camera.position.x, this.camera.position.y, this.camera.position.z)) {
                if (this.verticalVelocity < 0) {
                    this.camera.position.y -= verticalStep;
                    const currentFootY = this.camera.position.y - this.eyeHeight;
                    const blockY = Math.floor(currentFootY);
                    this.camera.position.y = blockY + 0.5 + this.eyeHeight;
                    this.isGrounded = true;
                } else {
                    this.camera.position.y -= verticalStep;
                }
                this.verticalVelocity = 0;
            } else {
                this.isGrounded = false;
            }
        }
    }
            }
