import { HEADER_COLUMN_WIDTH, HEADER_ROW_HEIGHT } from "./Constants.js";
import { getVisibleRowsAndColumns } from "./Helpers/getVisibleRowsAndColumns.js";

export class SelectionManager{
    private _ctx: CanvasRenderingContext2D;
    constructor(ctx:CanvasRenderingContext2D){
        this._ctx=ctx;
    }
    drawHeaderSelection(scrollX: number, scrollY: number, selectedCell: number[], colPos: number[], rowPos: number[]) {
        if (!selectedCell || selectedCell.length < 4) return;

        const [c1, r1, c2, r2] = selectedCell as [number, number, number, number];
        const { startRow, startCol, endRow, endCol } = getVisibleRowsAndColumns(scrollX, scrollY, rowPos, colPos);
        let selectStartCol = 0;
        let selectEndCol = 0;
        let selectStartRow = 0;
        let selectEndRow = 0;
        let drawColumnHeader = false;
        let drawRowHeader = false;
        if (c2 === -1 && r2 === -1) {
            if (c1 === -1 && r1 !== -1) {
                selectStartRow = r1;
                selectEndRow = r1;
                drawRowHeader = true;
                selectStartCol = startCol;
                selectEndCol = endCol - 1;
                drawColumnHeader = true;
            } 
            else if (c1 !== -1 && r1 === -1) {
                selectStartCol = c1;
                selectEndCol = c1;
                drawColumnHeader = true;
                selectStartRow = startRow;
                selectEndRow = endRow - 1;
                drawRowHeader = true;
            }
        } else if (!selectedCell.includes(-1)) {
            selectStartCol = Math.min(c1, c2);
            selectEndCol = Math.max(c1, c2);
            selectStartRow = Math.min(r1, r2);
            selectEndRow = Math.max(r1, r2);
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

    

}