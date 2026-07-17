import { TOLERANCE, TOTAL_COLS, TOTAL_ROWS } from "../Constants.js";
import { getClosest } from "../Helpers/getClosest.js";

interface IResizeState {
    startX: number,
    startY: number,
    initialSize: number,
    newWidth: number,
    newHeight: number,
    resizingColumn: number,
    resizingRow: number,
}

export class ResizeManager {
    private resizeState: IResizeState = {
        startX: 0,
        startY: 0,
        initialSize: 0,
        newWidth: 0,
        newHeight: 0,
        resizingColumn: -1,
        resizingRow: -1,
    };

    private resizing: boolean = false;

    constructor(private columnPos: number[], private rowPos: number[]) {}

    public get resizingState(): IResizeState {
        return this.resizeState;
    }

    public set isResizing(resizing: boolean) {
        this.resizing = resizing;
    }

    public get isResizing() {
        return this.resizing;
    }

    resize(e: MouseEvent, scrollX: number, scrollY: number, canvas: HTMLCanvasElement) {
        const x = e.offsetX + scrollX;
        const y = e.offsetY + scrollY;
        const columnPos = this.columnPos;
        const rowPos = this.rowPos;
        const col = getClosest(x, columnPos);
        const row = getClosest(y, rowPos);

        if (!this.isResizing && col < TOTAL_COLS && Math.abs(columnPos[col + 1]! - x) <= TOLERANCE) {
            this.resizeState.resizingColumn = col;
            this.resizeState.resizingRow = -1;
            this.resizeState.startX = e.clientX;
            this.resizeState.initialSize = columnPos[col + 1]! - columnPos[col]!;
            return;
        } else if (!this.isResizing && row < TOTAL_ROWS && Math.abs(rowPos[row + 1]! - y) <= TOLERANCE) {
            this.resizeState.resizingColumn = -1;
            this.resizeState.resizingRow = row;
            this.resizeState.startY = e.clientY;
            this.resizeState.initialSize = rowPos[row + 1]! - rowPos[row]!;
            return;
        }
        else if (this.isResizing && this.resizeState.resizingColumn != -1) {
            canvas.style.cursor = "col-resize";
            const totalMovedX = e.clientX - this.resizeState.startX;
            let calculatedWidth = this.resizeState.initialSize + totalMovedX;
            if (calculatedWidth < 40) calculatedWidth = 40;
            
            this.resizeState.newWidth = calculatedWidth;
            this.resizeCol(this.resizeState.resizingColumn, calculatedWidth);
            this.resizeState.resizingRow = -1;
            return;
        }
        else if (this.isResizing && this.resizeState.resizingRow != -1) {
            canvas.style.cursor = "row-resize";
            const totalMovedY = e.clientY - this.resizeState.startY;
            let calculatedHeight = this.resizeState.initialSize + totalMovedY;
            if (calculatedHeight < 20) calculatedHeight = 20;
            
            this.resizeState.newHeight = calculatedHeight;
            this.resizeRow(this.resizeState.resizingRow, calculatedHeight);
            this.resizeState.resizingColumn = -1;
            return;
        }
    }

    public resizeCol = (col: number, newWidth: number) => {
        const currentWidth = this.columnPos[col + 1]! - this.columnPos[col]!;
        const diff = newWidth - currentWidth;
        if (diff === 0) return;
        for (let i = col + 1; i < this.columnPos.length; i++) {
            this.columnPos[i]! += diff;
        }
    };

    public resizeRow = (row: number, newHeight: number) => {
        const currentHeight = this.rowPos[row + 1]! - this.rowPos[row]!;
        const diff = newHeight - currentHeight;
        if (diff === 0) return;
        for (let i = row + 1; i < this.rowPos.length; i++) {
            this.rowPos[i]! += diff;
        }
    };
}
