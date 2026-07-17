import { CellStore } from "../Store/Cellstore.js";
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
        this.cellStore.set(this.row,this.col,this.newValue)
    }

    undo(): void {
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
        private oldSize: number,    
        private resizedSize: number 
    ) {}

    execute(): void {
    }

    undo(): void {
        this.applySizeChange(this.oldSize);
    }

    redo(): void {
        this.applySizeChange(this.resizedSize);
        
    }

    private applySizeChange(targetSize: number): void {
        if(targetSize<=0) return;
        const currentSize = this.pos[this.k + 1]! - this.pos[this.k]!;
        const diff = targetSize - currentSize;
        if (diff === 0) return;

        for (let i = this.k + 1; i < this.pos.length; i++) {
            this.pos[i]! += diff;
        }
    }
}
