import {
    HEADER_COLUMN_WIDTH,
    HEADER_ROW_HEIGHT
} from "./Constants.js";

import { CellStore } from "./Cellstore.js";

export class CellSelector {
    private _input: HTMLInputElement;
    private _cellStore:CellStore;
    private columnPositions:number[];
    private rowPositions:number[];
    private canvas:HTMLCanvasElement;
    private ctx:CanvasRenderingContext2D;

    constructor(input: HTMLInputElement,store: CellStore,rowPos:number[],colPos:number[],canvas:HTMLCanvasElement) {
       this._input=input;
       this._cellStore=store;
       this.rowPositions=rowPos;
       this.columnPositions=colPos;
       this.canvas=canvas ;
       this.ctx=canvas.getContext("2d") as CanvasRenderingContext2D 
    }

   showSelectedCell(scrollX:number,scrollY:number,row:number,col:number){
        console.log("show selected cell",row,col)
        const x=this.columnPositions[col]!-scrollX ;
        const y=this.rowPositions[row]!-scrollY;
        const data=this._cellStore.get(row,col) || ""
        const width=this.columnPositions[col+1]!-scrollX-x;
        const height=this.rowPositions[row+1]!-scrollY-y;
        this.ctx.beginPath()
        this.ctx.fillStyle="#b6d3c3"
        this.ctx.fillRect(x,y,width,height);
        this.ctx.strokeStyle="#284314"
        this.ctx.strokeRect(x,y,width,height)
        this.ctx.fillStyle="#000000"
        this.ctx.textAlign="left"
        this.ctx.textBaseline="middle"
        this.ctx.fillText(data,x+5,y+height/2)
   }


   showInputBox(row: number, col: number, scrollX: number, scrollY: number) {
    if (row == -1 || col == -1) {
        this._input.style.display = "none";
        return;
    } 
    const rect = this.canvas.getBoundingClientRect();
    const localX = this.columnPositions[col] as number - scrollX;
    const localY = this.rowPositions[row] as number - scrollY;
    const width = this.columnPositions[col + 1]! - this.columnPositions[col]!;
    const height = this.rowPositions[row + 1]! - this.rowPositions[row]!;
    
    const isOutsideViewport =
        localX < HEADER_COLUMN_WIDTH ||
        localX > rect.width ||
        localY < HEADER_ROW_HEIGHT ||
        localY > rect.height;

    if (isOutsideViewport) {
        this._input.style.display = "none";
        return;
    }

    this._input.style.display = "block";
    this._input.style.left = `${rect.left + localX}px`;
    this._input.style.top = `${rect.top + localY}px`;
    this._input.style.width = `${width}px`;
    this._input.style.height = `${height}px`;

    const cellValue = this._cellStore.get(row, col);
    this._input.value = cellValue || "";
    
    this._input.focus();
}

    getInputValue(){
        return this._input.value;
    }
  

    saveData(row:number,col:number){
        
        if(this._input.value.trim()!=""){
            this._cellStore.set(row,col,this._input.value)
            console.log(`Saved row:${row} col:${col} value ${this._input.value}`)
        }
        this._input.value=""
    }


    


   
}