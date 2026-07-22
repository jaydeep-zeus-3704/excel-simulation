export interface ICommand{
    undo():void
    redo():void
    execute():void
}