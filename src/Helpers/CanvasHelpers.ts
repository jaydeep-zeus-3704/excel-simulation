import type { CellStore } from "../Cellstore.js";

export class CanvasHelpers{
    public static drawAndStrokeRect(ctx:CanvasRenderingContext2D,fillStyle:string,x:number,y:number,strokeStyle:string,lineWidth:number,width:number,height:number){
        ctx.beginPath()
        ctx.fillStyle = fillStyle;
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(x, y, width, height);
        ctx.closePath()
    }

    public static parseCells(store:CellStore,selectStartRow: number, selectEndRow: number, selectStartCol: number, selectEndCol: number): number[] {
        let numbers = [];
        for (let i = selectStartRow; i <= selectEndRow; i++) {
            for (let j = selectStartCol; j <= selectEndCol; j++) {
                let num = Number.parseInt(store.get(i, j));
                if (!Number.isNaN(num)) {
                    numbers.push(num);
                }
            }
        }
        return numbers;
    }    
}

 