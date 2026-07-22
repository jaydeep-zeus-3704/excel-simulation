import { HEADER_COLUMN_WIDTH, TOTAL_COLS } from "../Constants.js";
import type { Grid } from "../Grid.js";
import { getClosest } from "../Helpers/getClosest.js";
import type { IMouseHandler } from "../Interface/IMouseHandler.js";


export class RowSelectionHandler implements IMouseHandler{

    constructor(private grid:Grid){}

    private get selectionManager() {
        return this.grid.selectionManager;
    }

    private get viewPortManager() {
        return this.grid.viewPortManager;
    }
    
    checkIfValid=()=>{
            const localX=this.viewPortManager.localX
            return (localX<=HEADER_COLUMN_WIDTH)
    }

    pointerdown=()=>{
        this.selectionManager.selecting=true;
        this.selectionManager.selectedState={row1:-1,col1:-1,row2:-1,col2:-1}
         const y=this.viewPortManager.y;
         const row=getClosest(y,this.grid.rowPos);
         this.selectionManager.selectedState={row1:row,col1:-1,row2:-1,col2:-1}
         this.grid.summaryManager.displaySummary(row,0,row,TOTAL_COLS)
    }

    pointermove=()=>{
    }
    pointerup=()=>{
        this.selectionManager.selecting=false;
    }
}