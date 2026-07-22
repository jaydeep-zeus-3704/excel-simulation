import type { Grid } from "../Grid.js";
import { MouseController } from "../Controllers/MouseController.js";
export class EventManger{
    private mouseController:MouseController;
    constructor(private grid:Grid){
        this.mouseController=new MouseController(grid);
        this.attachEvents()
    }

    attachEvents=()=>{
        this.grid.canvas.addEventListener("wheel",this.onWheelEvent)
    }

    onWheelEvent=(e:WheelEvent)=>{
        e.preventDefault();
        const columnPos=this.grid.columnPos;
        const rowPos=this.grid.rowPos;
        const maxScrollX = columnPos[columnPos.length - 1]! - window.innerWidth;
        const maxScrollY = rowPos[rowPos.length - 1]! - window.innerHeight;
        const viewPortManager=this.grid.viewPortManager
        viewPortManager.scrollX = Math.min(maxScrollX, Math.max(0, viewPortManager.scrollX + e.deltaX));
        viewPortManager.scrollY = Math.min(maxScrollY, Math.max(0, viewPortManager.scrollY + e.deltaY));
        this.grid.render();
    }
}