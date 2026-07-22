import type { IMouseHandler } from "../Interface/IMouseHandler.js";
import type { Grid } from "../Grid.js";
import { RegionSelectionHandler } from "../Handlers/RegionSelectionHandler.js";
import { RowResizeHandler } from "../Handlers/RowResizeHandler.js";
import { ColumnResizeHandler } from "../Handlers/ColumnResizeHandler.js";
import { RowSelectionHandler } from "../Handlers/RowSelectionHandler.js";
import { ColumnSelectionHandler } from "../Handlers/ColumnSelectionManager.js";
export class MouseController{
    private handlers:IMouseHandler[]=[];
    private activeHandlerIndex:number=-1;
    constructor(private grid:Grid){
        this.registerHandlers();
        this.attachEvents()
    }

    registerHandlers(){
        this.handlers.push(new RowResizeHandler(this.grid))
        this.handlers.push(new ColumnResizeHandler(this.grid))
        this.handlers.push(new RegionSelectionHandler(this.grid))
        this.handlers.push(new RowSelectionHandler(this.grid))
        this.handlers.push(new ColumnSelectionHandler(this.grid))
    }

    runHitTest(){
        for(let i=0;i<this.handlers.length;i++){
            if(this.handlers[i]?.checkIfValid()){
                this.activeHandlerIndex=i;
                break;
            }
        }
    }

    attachEvents=()=>{
        this.grid.canvas.addEventListener("pointerdown",this.onPointerDown)
        this.grid.canvas.addEventListener("pointermove",this.onPointerMove)
        this.grid.canvas.addEventListener("pointerup",this.onPointerUp)
    }

    detachEvents=()=>{
        this.grid.canvas.removeEventListener("pointerdown",this.onPointerDown)
        this.grid.canvas.removeEventListener("pointermove",this.onPointerMove)
        this.grid.canvas.removeEventListener("pointerup",this.onPointerUp)
    }

    
    onPointerDown=(e:PointerEvent)=>{
        const viewPortManager=this.grid.viewPortManager
        viewPortManager.updateCoordinates(e)
        this.runHitTest()
        this.handlers[this.activeHandlerIndex]?.pointerdown()
    }

    onPointerMove=(e:PointerEvent)=>{
        const viewPortManager=this.grid.viewPortManager
        viewPortManager.updateCoordinates(e)
        this.handlers[this.activeHandlerIndex]?.pointermove()
    }

    onPointerUp=(e:PointerEvent)=>{
        const viewPortManager=this.grid.viewPortManager
        viewPortManager.updateCoordinates(e)
        this.handlers[this.activeHandlerIndex]?.pointerup()
        this.activeHandlerIndex=-1;
    }
}
