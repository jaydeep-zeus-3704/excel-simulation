import { HEADER_COLUMN_WIDTH, HEADER_ROW_HEIGHT, TOLERANCE } from "../Constants.js";
import type { Grid } from "../Grid.js";
import { getClosest } from "../Helpers/getClosest.js";
import { ResizeCommand } from "../Managers/CommandManager.js";

const MIN_ROW_HEIGHT = 20;

export class RowResizeHandler {
    private isResizing: boolean = false;
    private targetRow: number = -1;
    private resizeState: { startY: number; originalHeight: number } = {
        startY: 0,
        originalHeight: 0,
    };

    constructor(private grid: Grid) {}

    private get viewPortManager() {
        return this.grid.viewPortManager;
    }

    checkIfNearRow = (): boolean => {
        const y = this.viewPortManager.y;
        const rowPos = this.grid.rowPos;
        const closestRow = getClosest(y, rowPos);
        if (closestRow < 0 || closestRow >= rowPos.length - 1) return false;
        return Math.abs(rowPos[closestRow + 1]! - y) <= TOLERANCE;
    };

    checkIfValid = (): boolean => {
        const isNear = this.checkIfNearRow();
        const localX=this.viewPortManager.localX
        this.grid.canvas.style.cursor = (isNear && localX < HEADER_COLUMN_WIDTH) ? "row-resize" : "cell";
        return isNear && localX<HEADER_COLUMN_WIDTH;
    };

    pointerdown = () => {
        const localX=this.viewPortManager.localX
        if (!this.checkIfNearRow() || localX>HEADER_COLUMN_WIDTH) return;
        const y = this.viewPortManager.y;
        const rowPos = this.grid.rowPos;
        const rowToResize = getClosest(y, rowPos);
        if (rowToResize < 0 || rowToResize >= rowPos.length - 1) return;

        this.targetRow = rowToResize;
        this.resizeState.startY = y;
        this.resizeState.originalHeight =this.viewPortManager.getRowHeight(rowPos,this.targetRow);
        this.isResizing = true;
        this.grid.canvas.style.cursor = "row-resize";
    };

    pointermove = () => {
        this.checkIfValid()        
        if ((!this.isResizing || this.targetRow === -1) ){
                this.isResizing==false;
                return;
        }
        const currentY = this.viewPortManager.y;
        const deltaY = currentY - this.resizeState.startY;
        const newHeight = Math.max(this.resizeState.originalHeight + deltaY, MIN_ROW_HEIGHT);
        this.resizeRow(this.targetRow, newHeight);
        this.grid.render();
    };

    pointerup = () => {
        if (this.isResizing) {
            this.isResizing = false;
            this.grid.canvas.style.cursor = "cell";
            if (this.targetRow!==-1) {
                const currentY = this.viewPortManager.y;
                const deltaY = currentY - this.resizeState.startY;
                const newHeight = Math.max(this.resizeState.originalHeight + deltaY, MIN_ROW_HEIGHT);
                const command=new ResizeCommand(this.grid.rowPos,this.targetRow,this.resizeState.originalHeight,newHeight)
                this.grid.commandManager.executeCommand(command)
            }
            this.targetRow = -1;
            
            this.grid.render();
        }
    };

    public resizeRow = (row: number, newHeight: number) => {
        const rowPos = this.grid.rowPos;
        const currentHeight = rowPos[row + 1]! - rowPos[row]!;
        const diff = newHeight - currentHeight;
        if (diff === 0) return;

        for (let i = row + 1; i < rowPos.length; i++) {
            rowPos[i]! += diff;
        }
    };
}