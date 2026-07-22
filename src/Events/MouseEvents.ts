import { getClosest } from "../Helpers/getClosest.js";
import type { Grid } from "../Grid.js";
import type { ViewPortManager } from "../Managers/ViewportManger.js";
import { HEADER_COLUMN_WIDTH, HEADER_ROW_HEIGHT, TOLERANCE } from "../Constants.js";

export class MouseEventListeners {
    
    constructor(private grid: Grid) {
    }

    public get viewPortManager() : ViewPortManager {
        return this.grid.viewPortManager;
    }
    

    attach(canvas: HTMLCanvasElement) {
        canvas.addEventListener("wheel", this.onWheel, { passive: false });
        canvas.addEventListener("pointerdown", this.onMouseDown);
        canvas.addEventListener("dblclick", this.onDblClick);
    }

    detach(canvas: HTMLCanvasElement) {
        canvas.removeEventListener("wheel", this.onWheel);
        canvas.removeEventListener("pointerdown", this.onMouseDown);
        canvas.removeEventListener("dblclick", this.onDblClick);
    }

    onDblClick = (e: MouseEvent) => {
        const g = this.grid;
        g.editManager.showInputBox(g.currentClick.row, g.currentClick.col, g.scrollX, g.scrollY);
    };

    onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const grid=this.grid
        grid.scrollX = grid.viewPortManager.scrollX;
        grid.scrollY = grid.viewPortManager.scrollY;
    };

    onMouseDown = (e: MouseEvent) => {
        const grid = this.grid;
        grid.editManager.hideInputBox();
        const x = grid.viewPortManager.x;
        const y = grid.viewPortManager.y;
        const closestColumn = getClosest(x, grid.columnPos);
        const closestRow = getClosest(y, grid.rowPos);
        grid.currentClick = { row: closestRow, col: closestColumn };
        grid.editManager.showSelectedCell(grid.scrollX, grid.scrollY, closestRow, closestColumn);
        grid.render();
    };

    
}
