import { HEADER_ROW_HEIGHT, TOTAL_ROWS } from "../Constants.js";
import type { Grid } from "../Grid.js";
import { getClosest } from "../Helpers/getClosest.js";
import type { IMouseHandler } from "../Interface/IMouseHandler.js";

export class ColumnSelectionHandler implements IMouseHandler {

    constructor(private grid: Grid) {}

    private get selectionManager() {
        return this.grid.selectionManager;
    }

    private get viewPortManager() {
        return this.grid.viewPortManager;
    }

    checkIfValid = () => {
        const localY = this.viewPortManager.localY;
        return localY <= HEADER_ROW_HEIGHT;
    };

    pointerdown = () => {
        this.selectionManager.selecting = true;
        this.selectionManager.selectedState = { row1: -1, col1: -1, row2: -1, col2: -1 };
        const x = this.viewPortManager.x;
        const col = getClosest(x, this.grid.columnPos);
        this.selectionManager.selectedState = { row1: -1, col1: col, row2: -1, col2: -1 };
        this.grid.summaryManager.displaySummary(0,col,TOTAL_ROWS,col)
    };

    pointermove = () => {
        
    };

    pointerup = () => {
        this.selectionManager.selecting=false;
    };
}