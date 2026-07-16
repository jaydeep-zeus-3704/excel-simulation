import { TOTAL_ROWS, TOTAL_COLS, HEADER_ROW_HEIGHT, HEADER_COLUMN_WIDTH } from "../Constants.js";
import { getClosest } from "../Helpers/getClosest.js";
import { EditCellCommand, ResizeCommand } from "../Managers/CommandManager.js";
import type { Grid } from "../Grid.js";


export class MouseEventListeners {
    constructor(private grid: Grid) {}
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
        window.removeEventListener("pointermove", this.onMouseMove);
        canvas.removeEventListener("dblclick", this.onDblClick);
        window.removeEventListener("pointerup", this.onMouseUp);
    }

    onDblClick = (e: MouseEvent) => {
        const g = this.grid;
        g.cellSelector.showInputBox(g.currentClick.row, g.currentClick.col, g.scrollX, g.scrollY);
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

        const x = e.offsetX + g.scrollX;
        const y = e.offsetY + g.scrollY;
        const closestColumn = getClosest(x, g.columnPos);
        const closestRow = getClosest(y, g.rowPos);
        const tolerance = 6;

        g.cellSelector.clearInput();
        g.cellSelector.showInputBox(-1, -1, g.scrollX, g.scrollY);
        g.cellSelector.showSelectedCell(g.scrollX, g.scrollY, closestRow, closestColumn);
        g.currentClick = { row: closestRow, col: closestColumn };

        if (closestColumn < TOTAL_COLS && Math.abs(g.columnPos[closestColumn + 1]! - x) <= tolerance) {
            // check if distance between the mouse click and closestColumn to it is lesser than or equal to tolerance
            // resize column and dont resize row
            g.resizingColumn = closestColumn;
            g.resizingRow = -1;
            g.resizeState.startX = e.clientX;
            g.resizeState.initialSize = g.columnPos[closestColumn + 1]! - g.columnPos[closestColumn]!;
            return;
        } else if (closestRow < TOTAL_ROWS && Math.abs(g.rowPos[closestRow + 1]! - y) <= tolerance) {
            // check if distance between the mouse click and closestRow to it is lesser than or equal to tolerance
            // resize row and dont resize column
            g.resizingColumn = -1;
            g.resizingRow = closestRow;
            g.resizeState.startY = e.clientY;
            g.resizeState.initialSize = g.rowPos[closestRow + 1]! - g.rowPos[closestRow]!;
        }

        // check if y of mouse click is lesser than header height, identify if the mouse clicks inside the header
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
        const x = e.clientX + g.scrollX;
        const y = e.clientY + g.scrollY;

        if (g.resizingColumn !== -1) {
            g.canvas.style.cursor = "col-resize";
            const totalMovedX = e.clientX - g.resizeState.startX;
            let newWidth = g.resizeState.initialSize + totalMovedX;
            g.resizeState.newWidth = newWidth;
            if (newWidth < 40) newWidth = 40;
            g.resizeCol(g.resizingColumn, newWidth);
            g.resizingRow = -1;
            g.render();
            return;
        }

        if (g.resizingRow !== -1) {
            g.canvas.style.cursor = "row-resize";
            const totalMovedY = e.clientY - g.resizeState.startY;
            let newHeight = g.resizeState.initialSize + totalMovedY;
            g.resizeState.newHeight = newHeight;
            if (newHeight < 20) newHeight = 20;
            g.resizeRow(g.resizingRow, newHeight);
            g.resizingColumn = -1;
            g.render();
            return;
        } else if (g.selectionManager.selecting) {
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
    };

    onMouseUp = (e: MouseEvent) => {
        const g = this.grid;
        g.selectionManager.selecting = false;
        if (g.resizingColumn != -1 && g.resizingRow == -1) {
            const command = new ResizeCommand(g.columnPos, g.resizingColumn, g.resizeState.initialSize, g.resizeState.newWidth);
            g.commandManager.executeCommand(command);
        } else if (g.resizingRow != -1 && g.resizingColumn == -1) {
            const command = new ResizeCommand(g.rowPos, g.resizingRow, g.resizeState.initialSize, g.resizeState.newHeight);
            g.commandManager.executeCommand(command);
        }
        g.resizingRow = -1;
        g.resizingColumn = -1;
        g.canvas.style.cursor = "cell";
        g.render();
    };
}