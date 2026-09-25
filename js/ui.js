import { BLOCK_TYPES, BLOCK_DATA } from './blocks.js';

export class UI {
    constructor() {
        this.selectedBlockType = BLOCK_TYPES.GRASS;
        this.blockNames = ["Cỏ", "Đất", "Đá"];
        this.blockTypesList = [BLOCK_TYPES.GRASS, BLOCK_TYPES.DIRT, BLOCK_TYPES.STONE];
        this.currentIndex = 0;
        this.initListeners();
    }

    initListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Digit1') {
                this.setBlock(0);
            } else if (e.code === 'Digit2') {
                this.setBlock(1);
            } else if (e.code === 'Digit3') {
                this.setBlock(2);
            }
        });
    }

    setBlock(index) {
        this.currentIndex = index;
        this.selectedBlockType = this.blockTypesList[this.currentIndex];
        this.updateBlockName(this.blockNames[this.currentIndex]);
    }

    cycleBlock() {
        this.currentIndex = (this.currentIndex + 1) % this.blockTypesList.length;
        this.setBlock(this.currentIndex);
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
