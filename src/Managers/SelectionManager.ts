import { HEADER_COLUMN_WIDTH, HEADER_ROW_HEIGHT } from "../Constants.js";
import { getVisibleRowsAndColumns } from "../Helpers/getVisibleRowsAndColumns.js";
import { CanvasHelpers } from "../Helpers/CanvasHelpers.js";
import type { ViewPortManager } from "./ViewportManger.js";

interface ISelectedState{
    row1:number,
    col1:number,
    row2:number,
    col2:number
}

export class SelectionManager{
    private _ctx: CanvasRenderingContext2D;
    private _selectedState:ISelectedState={row1:-1,col1:-1,row2:-1,col2:-1}
    private _selecting:boolean=false;
    constructor(ctx:CanvasRenderingContext2D,private viewPortManager:ViewPortManager){
        this._ctx=ctx;
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


drawHeaderSelection(colPos: number[], rowPos: number[]){
    const { row1, col1, row2, col2 } = this.selectedState;
    const scrollX = this.viewPortManager.scrollX;
    const scrollY = this.viewPortManager.scrollY;
    const { startRow, startCol, endRow, endCol } = getVisibleRowsAndColumns(scrollX, scrollY, rowPos, colPos);
    let selectStartCol = -1, selectEndCol = -1;
    let selectStartRow = -1, selectEndRow = -1;
    // Row-only selection
    if (col1 === -1 && row1 !== -1 && col2 === -1 && row2 === -1) {
        selectStartRow = selectEndRow = row1;
        selectStartCol = startCol;
        selectEndCol = endCol - 1;
    }
    // Column-only selection
    else if (row1 === -1 && col1 !== -1 && row2 === -1 && col2 === -1) {
        selectStartCol = selectEndCol = col1;
        selectStartRow = startRow;
        selectEndRow = endRow - 1;
    }
    // Full block selection
    else if (col1 !== -1 && col2 !== -1 && row1 !== -1 && row2 !== -1) {
        selectStartCol = Math.min(col1, col2);
        selectEndCol = Math.max(col1, col2);
        selectStartRow = Math.min(row1, row2);
        selectEndRow = Math.max(row1, row2);
    }
    this._ctx.fillStyle = "#b6d3c36c";
    this._ctx.strokeStyle = "#1e3b30";
    this._ctx.lineWidth = 1;
    if ( selectStartCol >= 0) {
        const startColPos = colPos[selectStartCol]! - scrollX;
        const endColPos = colPos[selectEndCol + 1]! - scrollX;
        const drawX = Math.max(startColPos, HEADER_COLUMN_WIDTH);
        const drawWidth = endColPos - drawX;
        if (drawWidth > 0) {
            this._ctx.fillRect(drawX, 0, drawWidth, HEADER_ROW_HEIGHT);
            this._ctx.strokeRect(drawX, 0, drawWidth, HEADER_ROW_HEIGHT);
        }
    }

    if (selectStartRow >= 0) {
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

    
    

   drawCellSelection(columnPos: number[], rowPos: number[]) {   
    const { row1, col1, row2, col2 } = this.selectedState;
    const scrollX = this.viewPortManager.scrollX;
    const scrollY = this.viewPortManager.scrollY; 
    const { startRow, startCol, endRow, endCol } = getVisibleRowsAndColumns(scrollX, scrollY, rowPos, columnPos);

    // Case 1: Region selection (all defined)
    if (row1 !== -1 && row2 !== -1 && col1 !== -1 && col2 !== -1) { 
        const selectStartCol = Math.min(col1, col2);
        const selectEndCol   = Math.max(col1, col2);
        const selectStartRow = Math.min(row1, row2);
        const selectEndRow   = Math.max(row1, row2);

        const x1 = columnPos[selectStartCol]! - scrollX;
        const y1 = rowPos[selectStartRow]! - scrollY;
        const width  = columnPos[selectEndCol + 1]! - scrollX - x1;
        const height = rowPos[selectEndRow + 1]! - scrollY - y1;

        CanvasHelpers.drawAndStrokeRect(this._ctx, "#b6d3c36c", x1, y1, "#1e3b30", 1, width, height);
    }
    // Case 2: Row-only selection
    else if (col1 === -1 && row1 !== -1 && col2 === -1 && row2 === -1) {
        const startColPos = columnPos[startCol]! - scrollX;
        const endColPos   = columnPos[endCol]! - scrollX;
        const width  = endColPos - startColPos;
        const height = rowPos[row1 + 1]! - rowPos[row1]!;
        const yPos   = rowPos[row1]! - scrollY;

        CanvasHelpers.drawAndStrokeRect(this._ctx, "#b6d3c36c", HEADER_COLUMN_WIDTH, yPos, "#1e3b30", 1, width, height);
    }
    // Case 3: Column-only selection
    else if (row1 === -1 && col1 !== -1 && row2 === -1 && col2 === -1) {
        const startRowPos = Math.max(rowPos[startRow]! - scrollY, HEADER_ROW_HEIGHT);
        const endRowPos   = rowPos[endRow]! - scrollY;
        const height = endRowPos - startRowPos;
        const width  = columnPos[col1 + 1]! - columnPos[col1]!;
        const xPos   = columnPos[col1]! - scrollX;
        CanvasHelpers.drawAndStrokeRect(this._ctx, "#b6d3c36c", xPos, startRowPos, "#1e3b30", 1, width, height);
    }
}

    }