// Thêm đoạn code xử lý xoay camera bằng cách vuốt màn hình (Touch/Mouse Drag) vào trong class Game:
initCameraControls() {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    // Góc quay hiện tại của camera
    this.lon = 0;
    this.lat = 0;

    const onPointerDown = (e) => {
        isDragging = true;
        previousMousePosition = {
            x: e.clientX || (e.touches && e.touches[0].clientX),
            y: e.clientY || (e.touches && e.touches[0].clientY)
        };
    };

    const onPointerMove = (e) => {
        if (!isDragging) return;

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        const deltaX = clientX - previousMousePosition.x;
        const deltaY = clientY - previousMousePosition.y;

        this.lon -= deltaX * 0.5;
        this.lat += deltaY * 0.5;
        this.lat = Math.max(-85, Math.min(85, this.lat)); // Giới hạn góc nhìn lên xuống

        // Cập nhật hướng nhìn của camera theo góc quay Euler
        const phi = THREE.MathUtils.degToRad(90 - this.lat);
        const theta = THREE.MathUtils.degToRad(this.lon);

        const targetX = this.camera.position.x + 100 * Math.sin(phi) * Math.cos(theta);
        const targetY = this.camera.position.y + 100 * Math.cos(phi);
        const targetZ = this.camera.position.z + 100 * Math.sin(phi) * Math.sin(theta);

        this.camera.lookAt(targetX, targetY, targetZ);

        previousMousePosition = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
        isDragging = false;
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
}
