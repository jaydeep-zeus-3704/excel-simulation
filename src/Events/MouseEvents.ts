import { getClosest } from "../Helpers/getClosest.js";
import type { Grid } from "../Grid.js";

export class MouseEventListeners {
    
    constructor(private grid: Grid) {
    }

    attach(canvas: HTMLCanvasElement) {
        canvas.addEventListener("wheel", this.onWheel, { passive: false });
        canvas.addEventListener("pointerdown", this.onMouseDown);
        window.addEventListener("mousemove", this.onMouseMove);
        canvas.addEventListener("dblclick", this.onDblClick);
        window.addEventListener("pointerup", this.onMouseUp);
    }

    detach(canvas: HTMLCanvasElement) {
        canvas.removeEventListener("wheel", this.onWheel);
        canvas.removeEventListener("pointerdown", this.onMouseDown);
        window.removeEventListener("mousemove", this.onMouseMove);
        canvas.removeEventListener("dblclick", this.onDblClick);
        window.removeEventListener("pointerup", this.onMouseUp);
    }

    onDblClick = (e: MouseEvent) => {
        const g = this.grid;
        g.editManager.showInputBox(g.currentClick.row, g.currentClick.col, g.scrollX, g.scrollY);
    };

    onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const g = this.grid;
        const maxScrollX = g.columnPos[g.columnPos.length - 1]! - window.innerWidth;
        const maxScrollY = g.rowPos[g.rowPos.length - 1]! - window.innerHeight;
        g.scrollX = Math.min(maxScrollX, Math.max(0, g.scrollX + e.deltaX));
        g.scrollY = Math.min(maxScrollY, Math.max(0, g.scrollY + e.deltaY));
        g.render();
    };

    onMouseDown = (e: MouseEvent) => {
        const g = this.grid;
        g.editManager.hideInputBox();
        const x = e.offsetX + g.scrollX;
        const y = e.offsetY + g.scrollY;
        const closestColumn = getClosest(x, g.columnPos);
        const closestRow = getClosest(y, g.rowPos);
        g.currentClick = { row: closestRow, col: closestColumn };
        g.editManager.showSelectedCell(g.scrollX, g.scrollY, closestRow, closestColumn);
        g.render();
    };

    onMouseMove = (e: MouseEvent) => {
    };

    onMouseUp = (e: MouseEvent) => {
    };
}
