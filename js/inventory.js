import { EventBus } from './eventBus.js';

export function createInventory() {
    const items = new Map();

    return {
        addItem(type, amount = 1) {
            if (!type || amount <= 0) return;
            const current = items.get(type) || 0;
            const newCount = current + amount;
            items.set(type, newCount);
            EventBus.emit('inventory:changed', { type, newCount });
        },

        removeItem(type, amount = 1) {
            if (!type || amount <= 0) return false;
            const current = items.get(type) || 0;
            if (current < amount) return false;

            const newCount = current - amount;
            if (newCount <= 0) {
                items.delete(type);
            } else {
                items.set(type, newCount);
            }

            EventBus.emit('inventory:changed', { type, newCount: Math.max(0, newCount) });
            return true;
        },

        consume(type, amount = 1) {
            if (!this.hasItem(type, amount)) {
                return false;
            }
            return this.removeItem(type, amount);
        },

        getCount(type) {
            return items.get(type) || 0;
        },

        hasItem(type, amount = 1) {
            return this.getCount(type) >= amount;
        },

        setCount(type, count) {
            if (!type) return;
            const newCount = Math.max(0, count);
            if (newCount === 0) {
                items.delete(type);
            } else {
                items.set(type, newCount);
            }
            EventBus.emit('inventory:changed', { type, newCount });
        },

        getSnapshot() {
            return new Map(items);
        }
    };
}

// === TẠM THỜI — XÓA SAU KHI PASS CP0 ===
console.log('✅ inventory.js loaded');

// Tự chạy 10 test case
(function selfTest() {
    const inv = createInventory();
    const log = (caseNum, desc, expected, actual) => {
        const pass = expected === actual ? '✅' : '❌';
        console.log(`[CP0 CASE ${caseNum}] ${pass} ${desc} | expected=${expected} | actual=${actual}`);
    };
    
    inv.addItem('wood', 1);
    log(1, 'addItem 1', 1, inv.getCount('wood'));
    
    inv.addItem('wood', 5);
    log(2, 'addItem 5', 6, inv.getCount('wood'));
    
    inv.removeItem('wood', 2);
    log(3, 'removeItem 2', 4, inv.getCount('wood'));
    
    inv.removeItem('wood', 999);
    log(4, 'removeItem 999 (không âm)', 4, inv.getCount('wood'));
    
    log(5, 'getCount', 4, inv.getCount('wood'));
    
    log(6, 'hasItem 1', true, inv.hasItem('wood', 1));
    
    inv.setCount('wood', 1);
    log(7, 'consume khi count=1', true, inv.consume('wood', 1));
    log(7.1, 'count sau consume', 0, inv.getCount('wood'));
    
    log(8, 'consume khi count=0', false, inv.consume('wood', 1));
    log(8.1, 'count vẫn = 0', 0, inv.getCount('wood'));
    
    for (let i = 0; i < 100; i++) inv.addItem('wood', 1);
    log(9, 'addItem 100 lần', 100, inv.getCount('wood'));
    
    inv.setCount('wood', -5);
    log(10, 'setCount âm → 0', 0, inv.getCount('wood'));
    
    console.log('=== CP0 SELF-TEST DONE ===');
})();
