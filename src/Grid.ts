import {
    DEFAULT_COLUMN_WIDTH,
    DEFAULT_ROW_HEIGHT,
    TOTAL_ROWS,
    TOTAL_COLS,
} from "./Constants.js";

import { CellStore } from "./Cellstore.js";
import { CanvasRenderer } from "./CanvasRenderer.js";
import { InputEditor } from "./InputEditor.js";
import { getClosest } from "./Helpers/getClosest.js";

export class Grid {

    private ctx: CanvasRenderingContext2D;

    private scrollX = 0;
    private scrollY = 0;
    private DEFAULT_COLUMN_OFFSET = 100;
    private DEFAULT_ROW_OFFSET = 30;
    private selectedRow = 0;
    private selectedCol = 0;

    private store = new CellStore();
    private columnPos: number[] = [];
    private rowPos: number[] = [];
    private renderer: CanvasRenderer;
    private editor: InputEditor;
    private resizingColumn: number = -1;
    private resizingRow: number = -1;
    private selectedCell:number[]=[-1,-1,-1,-1];
    private selecting:boolean=false;

    private resizeState = {
        startX: 0,
        startY: 0,
        initialSize: 0
    };

    constructor(private canvas: HTMLCanvasElement, input: HTMLInputElement) {
        this.ctx = canvas.getContext("2d")!;
        this.renderer = new CanvasRenderer(this.ctx, this.store);
        this.populateColAndRowPos();
        this.editor = new InputEditor(input, this.store, this.rowPos, this.columnPos);
        this.writeJsonToExcel("../output.json");
        this.setupCanvas();
        this.attachEvents();
    }

    private populateColAndRowPos() {
        let sum = this.DEFAULT_COLUMN_OFFSET;
        for (let i = 0; i <= TOTAL_COLS; i++) {
            this.columnPos.push(sum);
            sum += DEFAULT_COLUMN_WIDTH;
        }
        sum = this.DEFAULT_ROW_OFFSET;
        for (let i = 0; i <= TOTAL_ROWS; i++) {
            this.rowPos.push(sum);
            sum += DEFAULT_ROW_HEIGHT;
        }
    }

    private setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.ctx.resetTransform();
        this.ctx.scale(dpr, dpr);
        this.render();
    }

    private render() {
        this.renderer.drawGrid(
            this.rowPos,
            this.columnPos,
            this.scrollX,
            this.scrollY,
            this.selectedCell
        );
        this.renderer.drawCellData(
            this.scrollX,
            this.scrollY,
            this.rowPos,
            this.columnPos
        );
        this.editor.show(this.selectedRow, this.selectedCol, this.scrollX, this.scrollY, this.canvas);
        this.renderer.drawHeaders(
            this.scrollX,
            this.scrollY,
            this.rowPos,
            this.columnPos,
        );
    }

    private attachEvents() {
        this.canvas.addEventListener("click", this.onClick);
        this.canvas.addEventListener("wheel", this.onWheel, { passive: false });
        window.addEventListener("resize", () => this.setupCanvas());
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("mouseup", this.onMouseUp);
    }

    private onClick = (e: MouseEvent) => {
        if (this.resizingColumn !== -1 || this.resizingRow !== -1) return;
        this.editor.saveData(this.selectedRow, this.selectedCol);
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.selectedCol = getClosest(x + this.scrollX, this.columnPos);
        this.selectedRow = getClosest(y + this.scrollY, this.rowPos);
        this.editor.show(
            this.selectedRow,
            this.selectedCol,
            this.scrollX,
            this.scrollY,
            this.canvas
        );
        this.render();
    };

    private onWheel = (e: WheelEvent) => {
        e.preventDefault();
        this.selecting=false
        const maxScrollX = this.columnPos[this.columnPos.length - 1]! - window.innerWidth;
        const maxScrollY = this.rowPos[this.rowPos.length - 1]! - window.innerHeight;
        this.scrollX = Math.min(maxScrollX, Math.max(0, this.scrollX + e.deltaX));
        this.scrollY = Math.min(maxScrollY, Math.max(0, this.scrollY + e.deltaY));
        this.editor.show(this.selectedRow, this.selectedCol, this.scrollX, this.scrollY, this.canvas);
        this.render();
    };

    private onMouseDown = (e: MouseEvent) => {
        this.selectedCell=[-1,-1,-1,-1]

        const x = e.offsetX + this.scrollX;
        const y = e.offsetY + this.scrollY;
        const closestColumn = getClosest(x, this.columnPos);
        const closestRow = getClosest(y, this.rowPos);
        const tolerance = 6;

        

        if (closestColumn < TOTAL_COLS && Math.abs(this.columnPos[closestColumn + 1]! - x) <= tolerance) {
            this.resizingColumn = closestColumn;
            this.resizingRow = -1;
            this.resizeState.startX = e.clientX;
            this.resizeState.initialSize = this.columnPos[closestColumn + 1]! - this.columnPos[closestColumn]!;
            return;
        }
        else if (closestRow < TOTAL_ROWS && Math.abs(this.rowPos[closestRow + 1]! - y) <= tolerance) {
            this.resizingColumn = -1;
            this.resizingRow = closestRow;
            this.resizeState.startY = e.clientY;
            this.resizeState.initialSize = this.rowPos[closestRow + 1]! - this.rowPos[closestRow]!;
        }
        else{
            this.selectedCell=[closestColumn,closestRow,-1,-1]
            this.selecting=true;
        }


    };

    private onMouseMove = (e: MouseEvent) => {

        
        const x = e.offsetX + this.scrollX;
        const y = e.offsetY + this.scrollY;
        if (this.resizingColumn !== -1) {
            this.canvas.style.cursor = "col-resize";
            const totalMovedX = e.clientX - this.resizeState.startX;
            let newWidth = this.resizeState.initialSize + totalMovedX;
            if (newWidth < 40) newWidth = 40; 
            this.resizeCol(this.resizingColumn, newWidth);
            this.render();
            return;
        }

        if (this.resizingRow !== -1) {
            this.canvas.style.cursor = "row-resize";
            const totalMovedY = e.clientY - this.resizeState.startY;
            let newHeight = this.resizeState.initialSize + totalMovedY;
            if (newHeight < 20) newHeight = 20; 
            this.resizeRow(this.resizingRow, newHeight);
            this.render();
            return;
        }
        else if(this.selecting){
            const closestColumn = getClosest(x, this.columnPos);
            const closestRow = getClosest(y, this.rowPos);
            this.selectedCell[2]=closestColumn;
            this.selectedCell[3]=closestRow
            this.render()
            console.log(this.selectedCell)
        }
        const closestColumn = getClosest(x, this.columnPos);
        const closestRow = getClosest(y, this.rowPos);
        const tolerance = 6;
        if (closestColumn < TOTAL_COLS && Math.abs(this.columnPos[closestColumn + 1]! - x) <= tolerance) {
            this.canvas.style.cursor = "col-resize";
        } else if (closestRow < TOTAL_ROWS && Math.abs(this.rowPos[closestRow + 1]! - y) <= tolerance) {
            this.canvas.style.cursor = "row-resize";
            
        } else {
            this.canvas.style.cursor = "cell";
        }
    };

    private onMouseUp = (e: MouseEvent) => {
        this.selecting=false
        this.resizingRow = -1;
        this.resizingColumn = -1;
        this.canvas.style.cursor = "cell";
        
    };

    private resizeCol = (col: number, newWidth: number) => {
        const currentWidth = this.columnPos[col + 1]! - this.columnPos[col]!;
        const diff = newWidth - currentWidth;
        if (diff === 0) return;
        for (let i = col + 1; i < this.columnPos.length; i++) {
            this.columnPos[i]! += diff;
        }
    };

    private resizeRow = (row: number, newHeight: number) => {
        const currentHeight = this.rowPos[row + 1]! - this.rowPos[row]!;
        const diff = newHeight - currentHeight;
        if (diff === 0) return;
        for (let i = row + 1; i < this.rowPos.length; i++) {
            this.rowPos[i]! += diff;
        }
    };

        private async writeJsonToExcel(filePath: string) {
        try {
            const data = await fetch(filePath);
            const response = await data.json();
            if (!response || response.length === 0) return;
            const keys = Object.keys(response[0]);

            for (let i = 0; i < keys.length; i++) {
                this.store.set(0, i, keys[i]!);
            }

            response.forEach((rowData: any, rowIndex: number) => {
                keys.forEach((key, colIndex) => {
                    const cellValue = rowData[key] !== undefined ? String(rowData[key]) : "";
                    this.store.set(rowIndex + 1, colIndex, cellValue);
                });
            });

            this.render();

        } catch (error) {
            console.error("Failed to parse and write JSON data to Excel canvas:", error);
        }
    }


    
}
