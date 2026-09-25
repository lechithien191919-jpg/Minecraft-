import { BLOCK_TYPES, BLOCK_DATA } from './blocks.js';

export class UI {
    constructor() {
        this.slots = [
            { type: BLOCK_TYPES.GRASS, name: "Cỏ", icon: "🟩" },
            { type: BLOCK_TYPES.DIRT, name: "Đất", icon: "🟫" },
            { type: BLOCK_TYPES.STONE, name: "Đá", icon: "⬜" },
            { type: BLOCK_TYPES.WOOD, name: "Gỗ", icon: "🪵" },
            { type: BLOCK_TYPES.LEAVES, name: "Lá", icon: "🍃" }
        ];
        this.selectedIndex = 0;
        this.renderHotbar();
    }

    renderHotbar() {
        const hotbarEl = document.getElementById('hotbar');
        if (!hotbarEl) return;
        
        hotbarEl.innerHTML = '';
        this.slots.forEach((slot, index) => {
            const slotDiv = document.createElement('div');
            slotDiv.className = `hotbar-slot ${index === this.selectedIndex ? 'active' : ''}`;
            slotDiv.innerHTML = `${slot.icon}<span>${index + 1}</span>`;
            
            // Xử lý click chọn slot trực tiếp mà không gây mất tập trung camera
            slotDiv.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                this.selectSlot(index);
            });
            slotDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectSlot(index);
            });

            hotbarEl.appendChild(slotDiv);
        });

        this.updateBlockName();
    }

    selectSlot(index) {
        this.selectedIndex = index;
        const slotElements = document.querySelectorAll('.hotbar-slot');
        slotElements.forEach((el, idx) => {
            if (idx === index) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
        this.updateBlockName();
    }

    cycleBlock() {
        this.selectedIndex = (this.selectedIndex + 1) % this.slots.length;
        this.selectSlot(this.selectedIndex);
    }

    updateBlockName() {
        const nameSpan = document.getElementById('current-block-name');
        if (nameSpan) {
            nameSpan.innerText = this.slots[this.selectedIndex].name;
        }
    }

    getSelectedBlock() {
        return this.slots[this.selectedIndex].type;
    }
}
