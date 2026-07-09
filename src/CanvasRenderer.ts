import { DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT } from "./Constants.js";
import { CellStore } from "./Cellstore.js";
import { getClosest } from "./Helpers/getClosest.js";
import { Summary } from "./Summary.js";

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
        const { startRow, startCol, endRow, endCol } = this.getVisibleRowsAndColumns(
            scrollX,
            scrollY,
            rowPos,
            columnPos
        );

        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (let c = startCol; c < endCol; c++) {
            for (let r = startRow; r < endRow; r++) {
                const x = columnPos[c]! - scrollX;
                const y = rowPos[r]! - scrollY;
                const width = columnPos[c + 1]! - columnPos[c]!;
                const height = rowPos[r + 1]! - rowPos[r]!;
                this.ctx.fillStyle = "#ffffff";
                this.ctx.fillRect(x, y, width, height);
            }
        }

        if (selectedCell.length >= 4 && !selectedCell.includes(-1)) {
            const [c1, r1, c2, r2] = selectedCell as [number, number, number, number];
            const selectStartCol = Math.min(c1, c2);
            const selectStartRow = Math.min(r1, r2);
            const selectEndCol = Math.max(c1, c2);
            const selectEndRow = Math.max(r1, r2);

            const x1 = columnPos[selectStartCol]! - scrollX;
            const y1 = rowPos[selectStartRow]! - scrollY;
            const width = (columnPos[selectEndCol + 1]! - scrollX) - x1;
            const height = (rowPos[selectEndRow + 1]! - scrollY) - y1;
            this.ctx.fillStyle = "#c3c8e6";
            this.ctx.fillRect(x1, y1, width, height);
            let numbers:number[]=[];
            for(let i=selectStartRow;i<=selectEndRow;i++){
                for(let j=selectStartCol;j<=selectEndCol;j++){
                    let num=Number.parseInt(this.store.get(i,j))
                    if(!Number.isNaN(num)){
                        numbers.push(num)
                    }
                }
            }
            this.summary.displaySummary(numbers)
            
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

    getVisibleRowsAndColumns(scrollX: number, scrollY: number, rowPos: number[], colPos: number[]) {
        const startCol = getClosest(scrollX, colPos);
        const startRow = getClosest(scrollY, rowPos);
        const viewportBottom = scrollY + window.innerHeight;
        const viewportRight = scrollX + window.innerWidth;
        let endRow = startRow;

        while (endRow < rowPos.length - 1 && rowPos[endRow]! < viewportBottom) {
            endRow++;
        }

        let endCol = startCol;
        while (endCol < colPos.length - 1 && colPos[endCol]! < viewportRight) {
            endCol++;
        }
        return {
            startRow,
            startCol,
            endRow,
            endCol
        };
    }

    drawCellData(scrollX: number, scrollY: number, rowPos: number[], colPos: number[]) {
        const { startRow, startCol, endRow, endCol } = this.getVisibleRowsAndColumns(
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

    drawHeaders(scrollX: number, scrollY: number, rowPos: number[], colPos: number[]) {
        const { startRow, startCol, endRow, endCol } = this.getVisibleRowsAndColumns(
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
            this.ctx.fillStyle = "#1e293b";
            this.ctx.fillRect(x, 0, width, DEFAULT_ROW_HEIGHT);
            this.ctx.strokeStyle = "#cbd5e1";
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, 0, width, DEFAULT_ROW_HEIGHT);
            this.ctx.fillStyle = "#ffffff";
            this.ctx.font = "600 14px sans-serif";
            this.ctx.textAlign = "center";
            this.ctx.fillText(this.getColumnHeader(i), x + width / 2, DEFAULT_ROW_HEIGHT / 2);
        }
        for (let i = startRow; i <= endRow; i++) {
            const height = rowPos[i + 1]! - rowPos[i]!;
            const y = rowPos[i]! - scrollY;
            this.ctx.fillStyle = "#1e293b";
            this.ctx.fillRect(0, y, DEFAULT_COLUMN_WIDTH, height);
            this.ctx.strokeStyle = "#cbd5e1";
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(0, y, DEFAULT_COLUMN_WIDTH, height);
            this.ctx.fillStyle = "#ffffff";
            this.ctx.font = "600 14px sans-serif";
            this.ctx.textAlign = "center";
            this.ctx.fillText((i + 1).toString(), DEFAULT_COLUMN_WIDTH / 2, y + height / 2);
        }

        this.ctx.fillStyle = "#1e293b";
        this.ctx.fillRect(0, 0, DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT);
        this.ctx.strokeStyle = "#cbd5e1";
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
}
