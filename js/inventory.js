import { EventBus } from './eventBus.js';

export class Inventory {
    constructor() {
        this.items = new Map();
    }

    addItem(type, amount = 1) {
        if (!type || amount <= 0) return;
        const current = this.items.get(type) || 0;
        const newCount = current + amount;
        this.items.set(type, newCount);
        EventBus.emit('inventory:changed', { type, newCount });
    }

    removeItem(type, amount = 1) {
        if (!type || amount <= 0) return false;
        const current = this.items.get(type) || 0;
        if (current < amount) return false;

        const newCount = current - amount;
        if (newCount <= 0) {
            this.items.delete(type);
        } else {
            this.items.set(type, newCount);
        }

        EventBus.emit('inventory:changed', { type, newCount: Math.max(0, newCount) });
        return true;
    }

    consume(type, amount = 1) {
        if (!this.hasItem(type, amount)) {
            return false;
        }
        return this.removeItem(type, amount);
    }

    getCount(type) {
        return this.items.get(type) || 0;
    }

    hasItem(type, amount = 1) {
        return this.getCount(type) >= amount;
    }

    setCount(type, count) {
        if (!type) return;
        const newCount = Math.max(0, count);
        if (newCount === 0) {
            this.items.delete(type);
        } else {
            this.items.set(type, newCount);
        }
        EventBus.emit('inventory:changed', { type, newCount });
    }

    getSnapshot() {
        return new Map(this.items);
    }
}

// === TỰ ĐỘNG CHẠY KIỂM TRA 10 TEST CASE ĐỂ BÁO CÁO CONSOLE ===
try {
    const inv = new Inventory();
    let passed = true;

    inv.addItem('wood', 1);
    if (inv.getCount('wood') !== 1) passed = false;

    inv.addItem('wood', 5);
    if (inv.getCount('wood') !== 6) passed = false;

    inv.removeItem('wood', 2);
    if (inv.getCount('wood') !== 4) passed = false;

    inv.removeItem('wood', 999);
    if (inv.getCount('wood') !== 4) passed = false;

    if (inv.getCount('wood') !== 4) passed = false;
    if (inv.hasItem('wood', 1) !== true) passed = false;
    if (inv.hasItem('wood', 10) !== false) passed = false;

    if (!inv.consume('wood', 1) || inv.getCount('wood') !== 3) passed = false;

    inv.setCount('wood', 0);
    if (inv.consume('wood', 1) !== false || inv.getCount('wood') !== 0) passed = false;

    for(let i=0; i<100; i++) inv.addItem('wood', 1);
    if (inv.getCount('wood') !== 100) passed = false;

    inv.setCount('wood', -5);
    if (inv.getCount('wood') !== 0) passed = false;

    if (passed) {
        console.log("🟢 Inventory Core: 10/10 Test Case PASS - HOẠT ĐỘNG HOÀN HẢO");
    } else {
        console.error("🔴 Inventory Core: KHÔNG HOẠT ĐỘNG ĐÚNG (Có test case thất bại)");
    }
} catch (e) {
    console.error("🔴 Inventory Core: KHÔNG HOẠT ĐỘNG - Lỗi:", e);
}

