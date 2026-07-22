import {
    HEADER_COLUMN_WIDTH,
    HEADER_ROW_HEIGHT
} from "../Constants.js";
import { CellStore } from "../Store/Cellstore.js";
import { Grid } from "../Grid.js";
import { EditCellCommand } from "./CommandManager.js";
interface IInputState{
    row:number,
    col:number,
    newValue:string
}

export class EditManager {
    private _input: HTMLInputElement;
    private _cellStore: CellStore;
    private columnPositions: number[];
    private rowPositions: number[];
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private inputState:IInputState={
        row:-1,
        col:-1,
        newValue:''
    }

    constructor(private grid:Grid,input: HTMLInputElement, store: CellStore, rowPos: number[], colPos: number[], canvas: HTMLCanvasElement) {
        this._input = input;
        this._cellStore = store;
        this.rowPositions = rowPos;
        this.columnPositions = colPos;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;   
        this.attachEvents()     
    }

    attachEvents(){
        this._input.addEventListener('blur',(e)=>{
            const {row,col,newValue}=this.inputState
            if(newValue!==this.inputValue){
                console.log(this.inputState,this.inputValue)
                const command=new EditCellCommand(row,col,this.inputValue,this._cellStore)
                this.grid.commandManager.executeCommand(command)
                this.grid.render()
            }
        })
    }


    showSelectedCell(scrollX: number, scrollY: number, row: number, col: number) {
        if (row === -1 || col === -1) return;
        const x = this.columnPositions[col]! - scrollX;
        const y = this.rowPositions[row]! - scrollY;
        const data = this._cellStore.get(row, col) || "";
        const width = this.columnPositions[col + 1]! - this.columnPositions[col]!;
        const height = this.rowPositions[row + 1]! - this.rowPositions[row]!;
        this.ctx.beginPath();
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(x, y, width, height);
        this.ctx.lineWidth=2
        this.ctx.strokeStyle = "#284314";
        this.ctx.strokeRect(x, y, width, height);
        
        if (this._input.style.display !== "block" || this._input.style.left !== `${this.canvas.getBoundingClientRect().left + x}px`) {
            this.ctx.fillStyle = "#000000";
            this.ctx.textAlign = "left";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(data, x + 5, y + height / 2);
        }
    }

    showInputBox(row: number, col: number, scrollX: number, scrollY: number) {
        if (row === -1 || col === -1) {
            this.hideInputBox();
            return;
        }
        this.inputState={row,col,newValue:this._cellStore.get(row,col)}
        const rect = this.canvas.getBoundingClientRect();
        const localX = (this.columnPositions[col] as number) - scrollX;
        const localY = (this.rowPositions[row] as number) - scrollY;
        const width = this.columnPositions[col + 1]! - this.columnPositions[col]!;
        const height = this.rowPositions[row + 1]! - this.rowPositions[row]!;
        const isOutsideViewport =
            localX < HEADER_COLUMN_WIDTH ||
            localX > rect.width ||
            localY < HEADER_ROW_HEIGHT ||
            localY > rect.height;

        if (isOutsideViewport) {
            this.hideInputBox();
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

    
    public get prevInputState() : IInputState {
        return this.inputState;
    }

    public set prevInputState(inputState:IInputState) {
        this.inputState=inputState;
    }
    
    public hideInputBox() {
        this._input.style.display = "none";
        this._input.blur()
    }

    public get inputValue() : string {
        return  this._input.value.trim();
    }

    public set inputValue(value:string){
        this._input.value=value
    }
    
    public clearInput() {
        this._input.value = "";
    }
}