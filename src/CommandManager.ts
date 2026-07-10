

class CommandManager{
    private undoStack:any[]=[];
    private redoStack:any[]=[];
    constructor(){
    
    }

}


interface ICommand{
    undo():void
    redo():void
}

class EditCellCommand implements ICommand{
    
    undo(): void {
        
    }
    
    redo(): void {
        
    }
}

