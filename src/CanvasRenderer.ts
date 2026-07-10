import { DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT,HEADER_COLUMN_WIDTH,HEADER_ROW_HEIGHT,TOTAL_COLS,TOTAL_ROWS } from "./Constants.js";
import { CellStore } from "./Cellstore.js";
import { Summary } from "./Summary.js";
import { getVisibleRowsAndColumns } from "./Helpers/getVisibleRowsAndColumns.js";

export class CanvasRenderer {

    private store: CellStore;
    private summary:Summary;
    constructor(
        private ctx: CanvasRenderingContext2D,
        store: CellStore
    ) {
        this.store = store;
        this.summary=new Summary()
    }

drawGrid(
    rowPos: number[],
    columnPos: number[],
    scrollX: number,
    scrollY: number,
    selectedCell: number[]
) {
    const { startRow, startCol, endRow, endCol } = getVisibleRowsAndColumns(
        scrollX,
        scrollY,
        rowPos,
        columnPos
    );
    
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.ctx.fillStyle = "#ffffff";
    for (let c = startCol; c < endCol; c++) {
        for (let r = startRow; r < endRow; r++) {
            const x = columnPos[c]! - scrollX;
            const y = rowPos[r]! - scrollY;
            const width = columnPos[c + 1]! - columnPos[c]!;
            const height = rowPos[r + 1]! - rowPos[r]!;
            this.ctx.fillRect(x, y, width, height);
        }
    }
    
    const [c1, r1, c2, r2] = selectedCell as [number, number, number, number];
    
    if (selectedCell.length >= 4 && !selectedCell.includes(-1)) {
        const selectStartCol = Math.min(c1, c2);
        const selectStartRow = Math.min(r1, r2);
        const selectEndCol = Math.max(c1, c2);
        const selectEndRow = Math.max(r1, r2);
        const x1 = columnPos[selectStartCol]! - scrollX;
        const y1 = rowPos[selectStartRow]! - scrollY;
        const width = (columnPos[selectEndCol + 1]! - scrollX) - x1;
        const height = (rowPos[selectEndRow + 1]! - scrollY) - y1;
        this.ctx.fillStyle = "#b6d3c36c";
        this.ctx.fillRect(x1, y1, width, height);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "#1e3b30";
        this.ctx.strokeRect(x1, y1, width, height);
        const numbers = this.parseCells(selectStartRow, selectEndRow, selectStartCol, selectEndCol);
        this.summary.displaySummary(numbers);    
    }
    else if (c2 == -1 && r2 == -1) {
        if (c1 == -1 && r1 != -1) {
            const endColPos = columnPos[endCol]! - scrollX;
            const startColPos = columnPos[0]! - scrollX;
            const width = endColPos - startColPos;
            const height = rowPos[r1 + 1]! - rowPos[r1]!;
            
            this.ctx.fillStyle = "#b6d3c36c";
            this.ctx.fillRect(HEADER_COLUMN_WIDTH, rowPos[r1]! - scrollY, width, height);
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "#1e3b30";
            this.ctx.strokeRect(HEADER_COLUMN_WIDTH, rowPos[r1]! - scrollY, width, height);
            
            const numbers = this.parseCells(r1, r1, 0, TOTAL_COLS);
            this.summary.displaySummary(numbers); 
        }
        else if (c1 != -1 && r1==-1) {
            const startRowPos = Math.max(rowPos[startRow]! - scrollY, HEADER_ROW_HEIGHT);
            const endRowPos = rowPos[endRow]! - scrollY;
            const height = endRowPos - startRowPos;
            const width = columnPos[c1 + 1]! - columnPos[c1]!;
            const xPos = columnPos[c1]! - scrollX;
            
            this.ctx.fillStyle = "#b6d3c36c";
            this.ctx.fillRect(xPos, startRowPos, width, height);
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "#1e3b30";
            this.ctx.strokeRect(xPos, startRowPos, width, height);
            
            const numbers = this.parseCells(0, TOTAL_ROWS, c1, c1);
            this.summary.displaySummary(numbers); 
        }
    }

    this.ctx.strokeStyle = "#a5a9b0";
    this.ctx.lineWidth = 1;

    for (let c = startCol; c < endCol; c++) {
        for (let r = startRow; r < endRow; r++) {
            const x = Math.floor(columnPos[c]! - scrollX) + 0.5;
            const y = Math.floor(rowPos[r]! - scrollY) + 0.5;
            const width = Math.floor(columnPos[c + 1]! - columnPos[c]!);
            const height = Math.floor(rowPos[r + 1]! - rowPos[r]!);
            this.ctx.strokeRect(x, y, width, height);
        }
    }
}

    

    

    drawCellData(scrollX: number, scrollY: number, rowPos: number[], colPos: number[]) {
        const { startRow, startCol, endRow, endCol } = getVisibleRowsAndColumns(
            scrollX,
            scrollY,
            rowPos,
            colPos
        );

        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "left";
        this.ctx.fillStyle = "#000000"; 
        this.ctx.font = "14px sans-serif";

        for (let r = startRow; r < endRow; r++) {
            const rowHeight = rowPos[r + 1]! - rowPos[r]!;
            const y = rowPos[r]! - scrollY + rowHeight / 2;
            for (let c = startCol; c < endCol; c++) {
                const value = this.store.get(r, c); 
                if (value === undefined || value === "") continue;
                const x = colPos[c]! - scrollX + 5;
                this.ctx.fillText(value, x, y);
            }
        }
    }

    drawHeaders(scrollX: number, scrollY: number, rowPos: number[], colPos: number[],selectedCell:number[]) {
        const { startRow, startCol, endRow, endCol } = getVisibleRowsAndColumns(
            scrollX,
            scrollY,
            rowPos,
            colPos
        );
        this.ctx.beginPath();
        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "left";

        for (let i = startCol; i <= endCol; i++) {
            const width = colPos[i + 1]! - colPos[i]!;
            const x = colPos[i]! - scrollX;
            this.ctx.fillStyle = "#f5f5f5"
            this.ctx.fillRect(x, 0, width, DEFAULT_ROW_HEIGHT);
            this.ctx.strokeStyle = "#bcbcbc";
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, 0, width, DEFAULT_ROW_HEIGHT);
            this.ctx.fillStyle = "#1f1f1f";
            this.ctx.font = "400 14px sans-serif";
            this.ctx.textAlign = "center";
            this.ctx.fillText(this.getColumnHeader(i), x + width / 2, DEFAULT_ROW_HEIGHT / 2);
        }
        for (let i = startRow; i <= endRow; i++) {
            const height = rowPos[i + 1]! - rowPos[i]!;
            const y = rowPos[i]! - scrollY;
            this.ctx.fillStyle = "#f5f5f5"
            this.ctx.fillStyle = "#f5f5f5";
            this.ctx.fillRect(0, y, DEFAULT_COLUMN_WIDTH, height);
            this.ctx.strokeStyle = "#bcbcbc";
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(0, y, DEFAULT_COLUMN_WIDTH, height);
            this.ctx.fillStyle = "#1f1f1f";
            this.ctx.font = "400 14px sans-serif";
            this.ctx.textAlign = "center";
            this.ctx.fillText((i + 1).toString(), DEFAULT_COLUMN_WIDTH / 2, y + height / 2);
        }

        this.ctx.fillStyle = "#f5f5f5";
        this.ctx.fillRect(0, 0, DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT);
        this.ctx.strokeStyle = "#bcbcbc";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(0, 0, DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT);
    }

    getColumnHeader(col: number) {
        if (col < 26) {
            return String.fromCharCode(col + 65);
        } else {
            return String.fromCharCode(Math.floor(col / 26) + 64) + String.fromCharCode((col % 26) + 65);
        }
    }

    parseCells(selectStartRow:number,selectEndRow:number,selectStartCol:number,selectEndCol:number):number[]{
        let numbers=[]
        for(let i=selectStartRow;i<=selectEndRow;i++){
                for(let j=selectStartCol;j<=selectEndCol;j++){
                    let num=Number.parseInt(this.store.get(i,j))
                    if(!Number.isNaN(num)){
                        numbers.push(num)
                    }
                }
        }
        
        return numbers;
    }


    drawHeaderSelection(scrollX:number,scrollY:number,selectedCell:number[],colPos:number[],rowPos:number[]){
        const [c1,r1,c2,r2]=selectedCell as [number,number,number,number]
        
            const selectStartCol = Math.min(c1, c2);
            const selectStartRow = Math.min(r1, r2);
            const selectEndCol = Math.max(c1, c2);
            const selectEndRow = Math.max(r1, r2);
            const startColPos=colPos[selectStartCol]!-scrollX
            const endColPos=colPos[selectEndCol+1]!-scrollX
            const startRowPos=rowPos[selectStartRow]!-scrollY
            const endRowPos=rowPos[selectEndRow+1]!-scrollY
            
            //draw selected headers for columns
            this.ctx.fillStyle = "#b6d3c36c"
            this.ctx.fillRect(startColPos, 0, endColPos-startColPos, HEADER_ROW_HEIGHT);
            this.ctx.strokeStyle = "#bcbcbc";
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(startColPos, 0, endColPos-startColPos, HEADER_ROW_HEIGHT);
            
            //draw selected headers for rows
            this.ctx.fillRect(0, startRowPos, HEADER_COLUMN_WIDTH, endRowPos-startRowPos);
            this.ctx.strokeStyle = "#bcbcbc";
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(0, startRowPos, HEADER_COLUMN_WIDTH,endRowPos-startRowPos );
        
    }   

}
