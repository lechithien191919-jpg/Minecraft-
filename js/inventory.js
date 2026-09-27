import { Inventory } from './js/inventory.js';

const inv = new Inventory();

// 1. addItem('wood', 1) → count = 1
inv.addItem('wood', 1);
console.log("Test 1 (1):", inv.getCount('wood') === 1); // true

// 2. addItem('wood', 5) → count = 6
inv.addItem('wood', 5);
console.log("Test 2 (6):", inv.getCount('wood') === 6); // true

// 3. removeItem('wood', 2) → count = 4
inv.removeItem('wood', 2);
console.log("Test 3 (4):", inv.getCount('wood') === 4); // true

// 4. removeItem('wood', 999) → không được âm
inv.removeItem('wood', 999);
console.log("Test 4 (không âm):", inv.getCount('wood') === 4); // true (vẫn giữ nguyên 4 vì không đủ để trừ)

// 5. getCount('wood') trả đúng số lượng
console.log("Test 5 (getCount):", inv.getCount('wood') === 4); // true

// 6. hasItem('wood', 1) phản ánh đúng trạng thái
console.log("Test 6 (hasItem true):", inv.hasItem('wood', 1) === true); // true
console.log("Test 7 (hasItem false):", inv.hasItem('wood', 10) === false); // true

// 7. consume('wood', 1) khi count = 4 → true, count = 3
console.log("Test 8 (consume true):", inv.consume('wood', 1) === true && inv.getCount('wood') === 3); // true

// 8. consume khi count = 0 → false, count vẫn = 0
inv.setCount('wood', 0);
console.log("Test 9 (consume false khi = 0):", inv.consume('wood', 1) === false && inv.getCount('wood') === 0); // true

// 9. addItem('wood', 1) 100 lần → count = 100, không crash
for(let i=0; i<100; i++) inv.addItem('wood', 1);
console.log("Test 10 (100 lần lặp):", inv.getCount('wood') === 100); // true

// 10. setCount('wood', -5) → count = 0
inv.setCount('wood', -5);
console.log("Test 11 (setCount chặn số âm):", inv.getCount('wood') === 0); // true
