import { EventBus } from './eventBus.js';

export class Inventory {
    constructor() {
        this.items = new Map();
    }

    // 1. Tăng số lượng item
    addItem(type, amount = 1) {
        if (!type || amount <= 0) return;
        const current = this.items.get(type) || 0;
        const newCount = current + amount;
        this.items.set(type, newCount);
        
        EventBus.emit('inventory:changed', { type, newCount });
    }

    // 2. Trừ item (không cho âm)
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

    // 3. Tiêu thụ item (API quan trọng cho việc đặt block)
    consume(type, amount = 1) {
        if (!this.hasItem(type, amount)) {
            return false;
        }
        return this.removeItem(type, amount);
    }

    // 4. Lấy số lượng hiện tại
    getCount(type) {
        return this.items.get(type) || 0;
    }

    // 5. Kiểm tra có đủ item không
    hasItem(type, amount = 1) {
        return this.getCount(type) >= amount;
    }

    // 6. Set trực tiếp số lượng (cho Save/Load)
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

    // 7. Trả về bản copy (tránh lộ Map gốc)
    getSnapshot() {
        return new Map(this.items);
    }
}
