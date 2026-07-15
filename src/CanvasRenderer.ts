import { DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT} from "./Constants.js";
import { CellStore } from "./Cellstore.js";
import { CanvasHelpers } from "./Helpers/CanvasHelpers.js";
import { getVisibleRowsAndColumns } from "./Helpers/getVisibleRowsAndColumns.js";
import type { SelectionManager } from "./SelectionManager.js";





export class CanvasRenderer {
    private store: CellStore;    
    constructor(
        private ctx: CanvasRenderingContext2D,
        private selectionManager:SelectionManager,
        store: CellStore
    ) {
        this.store = store;
    }

    drawGrid(
        rowPos: number[],
        columnPos: number[],
        scrollX: number,
        scrollY: number,
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
                CanvasHelpers.drawAndStrokeRect(this.ctx,"#ffffff",x, y,"#bcbcbc",1 ,width, height);
            }
        }
        this.selectionManager.drawCellSelection(columnPos,rowPos,startRow,endRow,endCol,scrollX,scrollY)
    }

    drawCellData(scrollX: number, scrollY: number, rowPos: number[], colPos: number[]) {
        const { startRow, startCol, endRow, endCol } = getVisibleRowsAndColumns(
            scrollX,
            scrollY,
            rowPos,
            colPos
        );

        for (let r = startRow; r < endRow; r++) {
            const rowHeight = rowPos[r + 1]! - rowPos[r]!;
            const y = rowPos[r]! - scrollY + rowHeight / 2;
            for (let c = startCol; c < endCol; c++) {
                const value = this.store.get(r, c);
                if (value === undefined || value === "") continue;
                const x = colPos[c]! - scrollX + 5;
                this.drawText("#000000",value,x,y,"left")
            }
        }
    }

    drawHeaders(scrollX: number, scrollY: number, rowPos: number[], colPos: number[]) {
        const { startRow, startCol, endRow, endCol } = getVisibleRowsAndColumns(
            scrollX,
            scrollY,
            rowPos,
            colPos
        );
        this.drawColumnHeader(startCol,endCol,colPos,scrollX)
        this.drawRowHeader(startRow,endRow,rowPos,scrollY)
        CanvasHelpers.drawAndStrokeRect(this.ctx,"#f5f5f5",0,0,"#bcbcbc",1,DEFAULT_COLUMN_WIDTH,DEFAULT_ROW_HEIGHT)
        
    }

    drawColumnHeader(startCol:number,endCol:number,colPos:number[],scrollX:number){
        for (let i = startCol; i <= endCol; i++) {
            const width = colPos[i + 1]! - colPos[i]!;
            const x = colPos[i]! -scrollX;
            CanvasHelpers.drawAndStrokeRect(this.ctx,"#f5f5f5",x,0,"#bcbcbc",1,width,DEFAULT_ROW_HEIGHT)
            this.drawText("#1f1f1f",this.getColumnHeader(i), x + width / 2, DEFAULT_ROW_HEIGHT / 2)
        }
    }

    drawRowHeader(startRow:number,endRow:number,rowPos:number[],scrollY:number){
          for (let i = startRow; i <= endRow; i++) {
            const height = rowPos[i + 1]! - rowPos[i]!;
            const y = rowPos[i]! - scrollY;
            CanvasHelpers.drawAndStrokeRect(this.ctx,"#f5f5f5",0,y,"#bcbcbc",1,DEFAULT_COLUMN_WIDTH,height)
            this.drawText("#1f1f1f",(i + 1).toString(),DEFAULT_COLUMN_WIDTH / 2, y + height / 2)
        }
    }

    getColumnHeader(col: number) {
        if (col < 26) {
            return String.fromCharCode(col + 65);
        } else {
            return String.fromCharCode(Math.floor(col / 26) + 64) + String.fromCharCode((col % 26) + 65);
        }
    }


    drawText(fillStyle:string,value:string,x:number,y:number,textAlign?:CanvasTextAlign){
         this.ctx.beginPath()
         this.ctx.fillStyle = fillStyle;
         this.ctx.font = "400 14px sans-serif";
         this.ctx.textBaseline = "middle"; // <- important
         this.ctx.textAlign = textAlign ? textAlign : "center";
         this.ctx.fillText(value, x, y);
         this.ctx.closePath()
    }

     
}