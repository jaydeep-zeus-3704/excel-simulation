import { HEADER_COLUMN_WIDTH, HEADER_ROW_HEIGHT, TOTAL_COLS, TOTAL_ROWS } from "./Constants.js";
import { getVisibleRowsAndColumns } from "./Helpers/getVisibleRowsAndColumns.js";
import { CanvasHelpers } from "./Helpers/CanvasHelpers.js";
import type { CellStore } from "./Cellstore.js";
import { Summary } from "./Summary.js";

interface ISelectedState{
    row1:number,
    col1:number,
    row2:number,
    col2:number
}

export class SelectionManager{
    private _ctx: CanvasRenderingContext2D;
    private summary:Summary;
    private _selectedState:ISelectedState={row1:-1,col1:-1,row2:-1,col2:-1}
    private _selecting:boolean=false;
    constructor(ctx:CanvasRenderingContext2D,private store:CellStore){
        this._ctx=ctx;
        this.summary=new Summary();
    }
    
    
    public set selectedState({row1,col1,row2,col2}:ISelectedState) {
        this._selectedState={row1,col1,row2,col2};
    }
    
    public get selectedState(){
        return this._selectedState;
    }

    public get selecting(){
        return this._selecting
    }

    public set selecting(selecting:boolean){
        this._selecting=selecting
    }


    drawHeaderSelection(scrollX: number, scrollY: number, colPos: number[], rowPos: number[]) {
        const {row1,col1,row2,col2}=this.selectedState;
        const { startRow, startCol, endRow, endCol } = getVisibleRowsAndColumns(scrollX, scrollY, rowPos, colPos);
        let selectStartCol = 0;
        let selectEndCol = 0;
        let selectStartRow = 0;
        let selectEndRow = 0;
        let drawColumnHeader = false;
        let drawRowHeader = false;
        if (col2 === -1 && row2 === -1) {
            if (col1 === -1 && row1 !== -1) {
                selectStartRow = row1;
                selectEndRow = row1;
                drawRowHeader = true;
                selectStartCol = startCol;
                selectEndCol = endCol - 1;
                drawColumnHeader = true;
            } 
            else if (col1 !== -1 && row1 === -1) {
                selectStartCol = col1;
                selectEndCol = col1;
                drawColumnHeader = true;
                selectStartRow = startRow;
                selectEndRow = endRow - 1;
                drawRowHeader = true;
            }
        } else if (col1!==-1 && col2!==-1 && row1!==-1 && row2!==-1) {
            selectStartCol = Math.min(col1, col2);
            selectEndCol = Math.max(col1, col2);
            selectStartRow = Math.min(row1, row2);
            selectEndRow = Math.max(row1, row2);
            drawColumnHeader = true;
            drawRowHeader = true;
        }

        this._ctx.fillStyle = "#b6d3c36c";
        this._ctx.strokeStyle = "#1e3b30";
        this._ctx.lineWidth = 1;

        if (drawColumnHeader) {
            const startColPos = colPos[selectStartCol]! - scrollX;
            const endColPos = colPos[selectEndCol + 1]! - scrollX;
            const drawX = Math.max(startColPos, HEADER_COLUMN_WIDTH);
            const drawWidth = endColPos - drawX;
            if (drawWidth > 0) {
                this._ctx.fillRect(drawX, 0, drawWidth, HEADER_ROW_HEIGHT);
                this._ctx.strokeRect(drawX, 0, drawWidth, HEADER_ROW_HEIGHT);
            }
        }

        if (drawRowHeader) {
            const startRowPos = rowPos[selectStartRow]! - scrollY;
            const endRowPos = rowPos[selectEndRow + 1]! - scrollY;
            const drawY = Math.max(startRowPos, HEADER_ROW_HEIGHT);
            const drawHeight = endRowPos - drawY;
            if (drawHeight > 0) {
                this._ctx.fillRect(0, drawY, HEADER_COLUMN_WIDTH, drawHeight);
                this._ctx.strokeRect(0, drawY, HEADER_COLUMN_WIDTH, drawHeight);
            }
        }
    }
    


    drawCellSelection(columnPos:number[],rowPos:number[],startRow:number,endRow:number,endCol:number,scrollX:number,scrollY:number)
    {   
        const {row1,col1,row2,col2}=this.selectedState; 
            if (row1!==-1 && row2!==-1 && col1!==-1 && col2!==-1) {
                const selectStartCol = Math.min(col1, col2);
                const selectStartRow = Math.min(row1, row2);
                const selectEndCol = Math.max(col1, col2);
                const selectEndRow = Math.max(row1, row2);
                const x1 = columnPos[selectStartCol]! - scrollX;
                const y1 = rowPos[selectStartRow]! - scrollY;
                const width = (columnPos[selectEndCol + 1]! - scrollX) - x1;
                const height = (rowPos[selectEndRow + 1]! - scrollY) - y1;
                CanvasHelpers.drawAndStrokeRect(this._ctx,"#b6d3c36c",x1,y1,"#1e3b30",1,width,height)
                const numbers = CanvasHelpers.parseCells(this.store,selectStartRow, selectEndRow, selectStartCol, selectEndCol);
                this.summary.displaySummary(numbers);
            }
            else if (col2 === -1 && row2 === -1) {
                if (col1 === -1 && row1 !== -1) {
                    const startColPos = columnPos[0]! - scrollX;
                    const endColPos = columnPos[endCol]! - scrollX;
                    const width = endColPos - startColPos;
                    const height = rowPos[row1 + 1]! - rowPos[row1]!;
                    CanvasHelpers.drawAndStrokeRect(this._ctx,"#b6d3c36c",HEADER_COLUMN_WIDTH,rowPos[row1]! - scrollY,"#1e3b30",1,width,height)
                    const numbers = CanvasHelpers.parseCells(this.store,row1, row1, 0, TOTAL_COLS - 1);
                    this.summary.displaySummary(numbers);
                }
                else if (col1 !== -1 && row1 === -1) {
                    const startRowPos = Math.max(rowPos[startRow]! - scrollY, HEADER_ROW_HEIGHT);
                    const endRowPos = rowPos[endRow]! - scrollY;
                    const height = endRowPos - startRowPos;
                    const width = columnPos[col1 + 1]! - columnPos[col1]!;
                    const xPos = columnPos[col1]! - scrollX;
                    CanvasHelpers.drawAndStrokeRect(this._ctx,"#b6d3c36c",xPos,startRowPos,"#1e3b30",1,width,height)
                    const numbers = CanvasHelpers.parseCells(this.store,0, TOTAL_ROWS - 1, col1, col1);
                    this.summary.displaySummary(numbers);
                }
            }
        }
    }