import {
    HEADER_COLUMN_WIDTH,
    HEADER_ROW_HEIGHT
} from "./Constants.js";

import { CellStore } from "./Cellstore.js";

export class InputEditor {
    private _input: HTMLInputElement;
    private _cellStore:CellStore;
    private columnPositions:number[];
    private rowPositions:number[];

    constructor(
        input: HTMLInputElement,
         store: CellStore,
        rowPos:number[],
        colPos:number[]
    ) {
       this._input=input;
       this._cellStore=store;
       this.rowPositions=rowPos;
       this.columnPositions=colPos;
    }

   show(
    row: number,
    col: number,
    scrollX: number,
    scrollY: number,
    canvas: HTMLCanvasElement
) {
    if(row==-1 || col==-1) return;
    const rect = canvas.getBoundingClientRect();
    const localX =this.columnPositions[col] as number  - scrollX;
    const localY =this.rowPositions[row] as number - scrollY;
    const width=this.columnPositions[col+1]!-this.columnPositions[col]!
    const height=this.rowPositions[row+1]!-this.rowPositions[row]!

    const isOutsideViewport =
        localX  < HEADER_COLUMN_WIDTH ||
        localX > rect.width ||
        localY  < HEADER_ROW_HEIGHT ||
        localY > rect.height;

    if (isOutsideViewport) {
        this._input.style.display = "none";
        return;
    }

    this._input.style.display = "block";

    this._input.style.left =
        `${rect.left + localX}px`;

    this._input.style.top =
        `${rect.top + localY}px`;
    
    

    this._input.style.width =
        `${width}px`;

    this._input.style.height =
        `${height}px`;
    this._input.value=this._cellStore.get(row,col) || ""
    this._input.focus();
}
    getInputValue(){
        return this._input.value;
    }
  

    saveData(row:number,col:number){
        if(this._input.value.trim()==''){
            this._cellStore.delete(row,col)
        }
        else{
            this._cellStore.set(row,col,this._input.value)
            this._input.value=""
        }
    }


   
}