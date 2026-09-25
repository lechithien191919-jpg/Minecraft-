import { BLOCK_TYPES, BLOCK_DATA } from './blocks.js';

export class UI {
    constructor() {
        this.selectedBlockType = BLOCK_TYPES.GRASS;
        this.initListeners();
    }

    initListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Digit1') {
                this.selectedBlockType = BLOCK_TYPES.GRASS;
                this.updateBlockName("Cỏ");
            } else if (e.code === 'Digit2') {
                this.selectedBlockType = BLOCK_TYPES.DIRT;
                this.updateBlockName("Đất");
            } else if (e.code === 'Digit3') {
                this.selectedBlockType = BLOCK_TYPES.STONE;
                this.updateBlockName("Đá");
            }
        });
    }

    updateBlockName(name) {
        const nameSpan = document.getElementById('current-block-name');
        if (nameSpan) {
            nameSpan.innerText = name;
        }
    }

    getSelectedBlock() {
        return this.selectedBlockType;
    }
}
