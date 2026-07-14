import type { CanvasRenderer } from "./CanvasRenderer.js";
import { CellStore } from "./Cellstore.js";
interface ICommand{
    undo():void
    redo():void
    execute():void
}


export class CommandManager {
    private undoStack:ICommand[]=[];
    private redoStack:ICommand[]=[];



    public executeCommand(command: ICommand): void {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = []; 
    }

    undo(){
        if(this.undoStack.length>0){
        const command=this.undoStack.pop() as ICommand;
        command.undo()
        this.redoStack.push(command)
        console.log(this.undoStack)
        console.log(this.redoStack)
        }
    }
    redo():void{
        if(this.redoStack.length>0){
            const command=this.redoStack.pop() as ICommand;
            command.redo()
            this.undoStack.push(command)
            console.log(this.undoStack)
        console.log(this.redoStack)
        }
    }
    
}



export class EditCellCommand implements ICommand {
   
    private prevValue:string;

 
    constructor( private row:number,private col:number,private newValue:string,private cellStore:CellStore){
        this.newValue=newValue
        this.prevValue=this.cellStore.get(row,col) 
    }
    execute():void{
        console.log(this.newValue)
        this.cellStore.set(this.row,this.col,this.newValue)
    }

    undo(): void {
        console.log(this.row,this.col,this.prevValue)
        this.cellStore.set(this.row,this.col,this.prevValue)
        
    }
    redo(): void {
        this.execute()
    }
}

export class ResizeCommand implements ICommand {
    constructor(
        private pos: number[], 
        private k: number, 
        private oldSize: number,    // Pass the cached size from before the drag started
        private resizedSize: number // Pass the final size computed on mouse up
    ) {}

    execute(): void {
        this.applySizeChange(this.resizedSize);
    }

    undo(): void {
        this.applySizeChange(this.oldSize);
    }

    redo(): void {
        this.execute();
    }

    private applySizeChange(targetSize: number): void {
        const currentSize = this.pos[this.k + 1]! - this.pos[this.k]!;
        const diff = targetSize - currentSize;
        if (diff === 0) return;

        for (let i = this.k + 1; i < this.pos.length; i++) {
            this.pos[i]! += diff;
        }
    }
}
