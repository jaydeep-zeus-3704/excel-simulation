import { HEADER_COLUMN_WIDTH, HEADER_ROW_HEIGHT, TOLERANCE } from "../Constants.js";
import type { Grid } from "../Grid.js";
import { getClosest } from "../Helpers/getClosest.js";
import { ResizeCommand } from "../Managers/CommandManager.js";

const MIN_COLUMN_WIDTH = 60;

export class ColumnResizeHandler {
    private isResizing: boolean = false;
    private targetCol: number = -1;
    private resizeState: { startX: number; originalWidth: number } = {
        startX: 0,
        originalWidth: 0,
    };

    constructor(private grid: Grid) {}

    private get viewPortManager() {
        return this.grid.viewPortManager;
    }

    checkIfNearColumn = (): boolean => {
        const x = this.viewPortManager.x;
        const columnPos = this.grid.columnPos;
        const closestColumn = getClosest(x, columnPos);
        if (closestColumn < 0 || closestColumn >= columnPos.length - 1) return false;
        return Math.abs(columnPos[closestColumn + 1]! - x) <= TOLERANCE;
    };

    checkIfValid = (): boolean => {
        const isNear = this.checkIfNearColumn();
        const localY=this.viewPortManager.localY
        this.grid.canvas.style.cursor = isNear && localY<HEADER_ROW_HEIGHT ? "col-resize" : "cell";
        return isNear;
    };

    pointerdown = () => {
        const localY=this.viewPortManager.localY
        if (!this.checkIfNearColumn() || localY>HEADER_ROW_HEIGHT) return;
        const x= this.viewPortManager.x;
        const columnPos = this.grid.columnPos;
        const columnToResize = getClosest(x, columnPos);
        if (columnToResize < 0 || columnToResize >= columnPos.length - 1) return;

        this.targetCol = columnToResize;
        this.resizeState.startX = x;
        this.resizeState.originalWidth =this.viewPortManager.getColumnWidth(columnPos,this.targetCol);
        this.isResizing = true;
        this.grid.canvas.style.cursor = "col-resize";
    };

    pointermove = () => {
        this.checkIfValid()
        if (!this.isResizing || this.targetCol === -1){
                this.isResizing==false;
                this.targetCol=-1;
                return;
        }
        const currentX = this.viewPortManager.x;
        const deltaX = currentX - this.resizeState.startX;
        const newWidth = Math.max(this.resizeState.originalWidth + deltaX, MIN_COLUMN_WIDTH);
        this.resizeCol(this.targetCol, newWidth);
        this.grid.render();
    };

    pointerup = () => {
        if (this.isResizing) {
            this.isResizing = false;
            this.grid.canvas.style.cursor = "cell";
            if (this.targetCol!==-1) {
                const currentX = this.viewPortManager.x;
                const deltaX = currentX - this.resizeState.startX;
                const newWidth = Math.max(this.resizeState.originalWidth + deltaX, MIN_COLUMN_WIDTH);
                const command=new ResizeCommand(this.grid.columnPos,this.targetCol,this.resizeState.originalWidth,newWidth)
                this.grid.commandManager.executeCommand(command)
            }
            this.targetCol = -1;
            this.grid.render();
        }
    };

    public resizeCol = (col: number, newWidth: number) => {
        const columnPos=this.grid.columnPos
        const currentWidth = columnPos[col + 1]! - columnPos[col]!;
        const diff = newWidth - currentWidth;
        if (diff === 0) return;
        for (let i = col + 1; i < columnPos.length; i++) {
            columnPos[i]! += diff;
        }
    };
}