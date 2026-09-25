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
        this.speed = 5.0; // Tốc độ di chuyển chuẩn Minecraft
        
        // Kích thước hộp va chạm của nhân vật (AABB)
        this.radius = 0.3;     // Bán kính bề ngang nhân vật
        this.height = 1.6;     // Chiều cao nhân vật
        this.eyeHeight = 1.4;  // Khoảng cách từ chân đến mắt

        // Biến vật lý trọng lực & nhảy
        this.gravity = 25.0;
        this.verticalVelocity = 0;
        this.isGrounded = false;
        this.jumpForce = 8.5;

        // Xoay camera cảm ứng
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

        // Xoay camera cảm ứng (tránh vùng hotbar và các nút)
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
                
                // Kiểm tra không đặt block đè lên vị trí nhân vật đang đứng
                const playerMinX = this.camera.position.x - this.radius;
                const playerMaxX = this.camera.position.x + this.radius;
                const playerMinZ = this.camera.position.z - this.radius;
                const playerMaxZ = this.camera.position.z + this.radius;
                const playerMinY = this.camera.position.y - this.eyeHeight;
                const playerMaxY = this.camera.position.y + (this.height - this.eyeHeight);

                if (!(position.x + 0.5 < playerMinX || position.x - 0.5 > playerMaxX ||
                      position.y + 0.5 < playerMinY || position.y - 0.5 > playerMaxY ||
                      position.z + 0.5 < playerMinZ || position.z - 0.5 > playerMaxZ)) {
                    return; // Đang vướng thân người chơi, không cho đặt
                }

                const selectedType = this.ui.getSelectedBlock();
                this.world.addBlock(position.x, position.y, position.z, selectedType);
            }
        }
    }

    // Kiểm tra xem vị trí (x, y, z) có chạm block nào không
    checkCollision(x, y, z) {
        const minX = x - this.radius;
        const maxX = x + this.radius;
        const minZ = z - this.radius;
        const maxZ = z + this.radius;
        const minY = y - this.eyeHeight;
        const maxY = y + (this.height - this.eyeHeight);

        // Quét các ô xung quanh vị trí nhân vật
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
                        // Kiểm tra va chạm hộp AABB
                        const bMinX = bx - 0.5, bMaxX = bx + 0.5;
                        const bMinY = by - 0.5, bMaxY = by + 0.5;
                        const bMinZ = bz - 0.5, bMaxZ = bz + 0.5;

                        if (maxX > bMinX && minX < bMaxX &&
                            maxY > bMinY && minY < bMaxY &&
                            maxZ > bMinZ && minZ < bMaxZ) {
                            return true; // Có va chạm
                        }
                    }
                }
            }
        }
        return false;
    }

    update(delta) {
        if (delta > 0.1) delta = 0.1; // Chống giật lag khung hình

        // 1. Tính toán vector hướng di chuyển ngang
        let moveVector = new THREE.Vector3();
        if (this.moveDir.x !== 0 || this.moveDir.z !== 0) {
            const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);
            const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);

            moveVector.addScaledVector(forward, -this.moveDir.z);
            moveVector.addScaledVector(right, this.moveDir.x);
            moveVector.normalize();
        }

        const horizontalStep = moveVector.clone().multiplyScalar(this.speed * delta);

        // 2. Xử lý va chạm và di chuyển theo trục X
        if (horizontalStep.x !== 0) {
            this.camera.position.x += horizontalStep.x;
            if (this.checkCollision(this.camera.position.x, this.camera.position.y, this.camera.position.z)) {
                // Thử hỗ trợ bước lên bậc block cao 1 đơn vị
                if (this.isGrounded && !this.checkCollision(this.camera.position.x, this.camera.position.y + 1.0, this.camera.position.z)) {
                    this.camera.position.y += 1.0; // Bước lên bậc
                } else {
                    this.camera.position.x -= horizontalStep.x; // Lùi lại nếu vướng tường
                }
            }
        }

        // 3. Xử lý va chạm và di chuyển theo trục Z
        if (horizontalStep.z !== 0) {
            this.camera.position.z += horizontalStep.z;
            if (this.checkCollision(this.camera.position.x, this.camera.position.y, this.camera.position.z)) {
                // Thử hỗ trợ bước lên bậc block cao 1 đơn vị
                if (this.isGrounded && !this.checkCollision(this.camera.position.x, this.camera.position.y + 1.0, this.camera.position.z)) {
                    this.camera.position.y += 1.0; // Bước lên bậc
                } else {
                    this.camera.position.z -= horizontalStep.z; // Lùi lại nếu vướng tường
                }
            }
        }

        // 4. Trọng lực & Xử lý va chạm theo trục Y (Rơi / Nhảy)
        this.verticalVelocity -= this.gravity * delta;
        const verticalStep = this.verticalVelocity * delta;

        if (verticalStep !== 0) {
            this.camera.position.y += verticalStep;
            if (this.checkCollision(this.camera.position.x, this.camera.position.y, this.camera.position.z)) {
                if (this.verticalVelocity < 0) {
                    // Rơi chạm đất: ép sát bề mặt block phía dưới
                    this.camera.position.y -= verticalStep;
                    // Tìm đúng vị trí mặt block phía dưới chân để đứng khớp
                    const currentFootY = this.camera.position.y - this.eyeHeight;
                    const blockY = Math.floor(currentFootY);
                    this.camera.position.y = blockY + 0.5 + this.eyeHeight;
                    this.isGrounded = true;
                } else {
                    // Nhảy chạm trần nhà: khựng lại không đi xuyên qua
                    this.camera.position.y -= verticalStep;
                }
                this.verticalVelocity = 0;
            } else {
                // Kiểm tra nếu lơ lửng trên không
                this.isGrounded = false;
            }
        }
    }
                        }

