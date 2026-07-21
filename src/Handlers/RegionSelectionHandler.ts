import { HEADER_COLUMN_WIDTH, HEADER_ROW_HEIGHT } from "../Constants.js";
import type { Grid } from "../Grid.js";
import { getClosest } from "../Helpers/getClosest.js";
import type { IMouseHandler } from "../Interface/IMouseHandler.js";


export class RegionSelectionHandler implements IMouseHandler{

    constructor(private grid:Grid){}

    private get selectionManager() {
        return this.grid.selectionManager;
    }

    private get viewPortManager() {
        return this.grid.viewPortManager;
    }
    
    checkIfValid=()=>{
            const localX=this.viewPortManager.localX;
            const localY=this.viewPortManager.localY
            return (localX>HEADER_COLUMN_WIDTH && localY>HEADER_ROW_HEIGHT)
    }

    pointerdown=()=>{
          const columnPos=this.grid.columnPos;
          const rowPos=this.grid.rowPos;
          const x=this.viewPortManager.x;
          const y=this.viewPortManager.y;
          const col=getClosest(x,columnPos); 
          const row=getClosest(y,rowPos);
          this.selectionManager.selecting=true;
          this.selectionManager.selectedState={col1:col,row1:row,col2:-1,row2:-1}           
    }

    pointermove=()=>{
        if(!this.selectionManager.selecting) return 
        const columnPos=this.grid.columnPos;
        const rowPos=this.grid.rowPos;
        const x=this.viewPortManager.x;
        const y=this.viewPortManager.y;
        const col=getClosest(x,columnPos); 
        const row=getClosest(y,rowPos);
        const prevRow=this.selectionManager.selectedState.row1;
        const prevCol=this.selectionManager.selectedState.col1;
        this.selectionManager.selectedState={col1:prevCol,row1:prevRow,col2:col,row2:row}
        this.grid.render()
    }
    pointerup=()=>{
        this.selectionManager.selecting=false;
    }
}