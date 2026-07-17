import { TOTAL_ROWS, TOTAL_COLS, HEADER_ROW_HEIGHT, HEADER_COLUMN_WIDTH } from "../Constants.js";
import { getClosest } from "../Helpers/getClosest.js";
import { ResizeCommand } from "../Managers/CommandManager.js";
import type { Grid } from "../Grid.js";
import { ResizeManager } from "../Managers/ResizeManager.js";

export class MouseEventListeners {
    private resizeManager: ResizeManager;
    
    constructor(private grid: Grid) {
        this.resizeManager = new ResizeManager(grid.columnPos, grid.rowPos);
    }

    attach(canvas: HTMLCanvasElement) {
        canvas.addEventListener("wheel", this.onWheel, { passive: false });
        canvas.addEventListener("pointerdown", this.onMouseDown);
        window.addEventListener("mousemove", this.onMouseMove);
        canvas.addEventListener("dblclick", this.onDblClick);
        window.addEventListener("pointerup", this.onMouseUp);
    }

    detach(canvas: HTMLCanvasElement) {
        canvas.removeEventListener("wheel", this.onWheel);
        canvas.removeEventListener("pointerdown", this.onMouseDown);
        window.removeEventListener("mousemove", this.onMouseMove);
        canvas.removeEventListener("dblclick", this.onDblClick);
        window.removeEventListener("pointerup", this.onMouseUp);
    }

    onDblClick = (e: MouseEvent) => {
        const g = this.grid;
        g.editManager.showInputBox(g.currentClick.row, g.currentClick.col, g.scrollX, g.scrollY);
    };

    onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const g = this.grid;
        const maxScrollX = g.columnPos[g.columnPos.length - 1]! - window.innerWidth;
        const maxScrollY = g.rowPos[g.rowPos.length - 1]! - window.innerHeight;
        g.scrollX = Math.min(maxScrollX, Math.max(0, g.scrollX + e.deltaX));
        g.scrollY = Math.min(maxScrollY, Math.max(0, g.scrollY + e.deltaY));
        g.render();
    };

    onMouseDown = (e: MouseEvent) => {
        const g = this.grid;
        g.editManager.hideInputBox();
        const x = e.offsetX + g.scrollX;
        const y = e.offsetY + g.scrollY;
        const closestColumn = getClosest(x, g.columnPos);
        const closestRow = getClosest(y, g.rowPos);
        g.currentClick = { row: closestRow, col: closestColumn };
        g.editManager.showSelectedCell(g.scrollX, g.scrollY, closestRow, closestColumn);
        
        this.resizeManager.isResizing = false;
        this.resizeManager.resize(e, g.scrollX, g.scrollY, g.canvas);

        if (e.clientY < HEADER_ROW_HEIGHT) {
            g.selectionManager.selectedState = { row1: -1, col1: closestColumn, row2: -1, col2: -1 };
        } else if (e.clientX < HEADER_COLUMN_WIDTH) {
            g.selectionManager.selectedState = { row1: closestRow, col1: -1, row2: -1, col2: -1 };
        } else {
            g.selectionManager.selectedState = { row1: closestRow, col1: closestColumn, row2: closestRow, col2: closestColumn };
        }
        g.selectionManager.selecting = true;
        
        g.render();
    };

    onMouseMove = (e: MouseEvent) => {
        const g = this.grid;
        const x = e.offsetX + g.scrollX;
        const y = e.offsetY + g.scrollY;
        
        if(e.buttons===1){
            const state = this.resizeManager.resizingState;
        if (state.resizingColumn !== -1 || state.resizingRow !== -1) {
            this.resizeManager.isResizing = true;
        }
        this.resizeManager.resize(e, g.scrollX, g.scrollY, g.canvas);
        }
        if (g.selectionManager.selecting) {
            const closestColumn = getClosest(x, g.columnPos);
            const closestRow = getClosest(y, g.rowPos);
            g.selectionManager.selectedState = {
                col2: closestColumn,
                row2: closestRow,
                col1: g.selectionManager.selectedState.col1,
                row1: g.selectionManager.selectedState.row1,
            };
            g.render();
        }
        const closestColumn = getClosest(x, g.columnPos);
        const closestRow = getClosest(y, g.rowPos);
        const tolerance = 6;
        if (closestColumn < TOTAL_COLS && Math.abs(g.columnPos[closestColumn + 1]! - x) <= tolerance) {
            g.canvas.style.cursor = "col-resize";
        } else if (closestRow < TOTAL_ROWS && Math.abs(g.rowPos[closestRow + 1]! - y) <= tolerance) {
            g.canvas.style.cursor = "row-resize";
        } else {
            g.canvas.style.cursor = "cell";
        }
        
        if (this.resizeManager.isResizing) {
            g.render();
        }
    };

    onMouseUp = (e: MouseEvent) => {
        const g = this.grid;
        g.selectionManager.selecting = false;
        this.resizeManager.isResizing = false;
        const state = this.resizeManager.resizingState;
        if (state.resizingColumn != -1 && state.resizingRow == -1) {
            const command = new ResizeCommand(g.columnPos, state.resizingColumn, state.initialSize, state.newWidth);
            g.commandManager.executeCommand(command);
        } else if (state.resizingRow != -1 && state.resizingColumn == -1) {
            const command = new ResizeCommand(g.rowPos, state.resizingRow, state.initialSize, state.newHeight);
            g.commandManager.executeCommand(command);
        }        
        state.resizingRow = -1;
        state.resizingColumn = -1;
        g.canvas.style.cursor = "cell";
        g.render();
    };
}
