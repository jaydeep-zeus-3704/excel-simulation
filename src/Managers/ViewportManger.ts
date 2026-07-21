export class ViewPortManager{

    private _scrollX:number=0;
    private _scrollY:number=0;
    private _localX:number=0;
    private _localY:number=0;
    private _x:number=0;
    private _y:number=0;
    public set scrollX(scrollXValue:number) {
        this._scrollX=scrollXValue;
    }

    public set scrollY(scrollYValue:number){
        this._scrollY=scrollYValue;
    }

    public get scrollX(){
        return this._scrollX;
    }

    public get scrollY(){
        return this._scrollY;
    }

    public getColumnWidth(columnPos:number[],i:number){
        return columnPos[i+1]!-columnPos[i]!
    }

    public getRowHeight(rowPos:number[],i:number){
        return rowPos[i+1]!-rowPos[i]!
    }

    public set x(x:number){
        this._x=x;
    }
    public set y(y:number){
        this._y=y;
    }

    public get x(){
        return this._x;
    }
    public get y(){
        return this._y;
    }

    public set localX(localX:number){
        this._localX=localX;
    }
    public set localY(localY:number){
        this._localY=localY;
    }

    public get localX(){
        return this._localX;
    }
    public get localY(){
        return this._localY;
    }

    
    public updateCoordinates(e:PointerEvent){
        this.localX=e.offsetX;
        this.localY=e.offsetY;
        this.x=e.offsetX+this.scrollX;
        this.y=e.offsetY+this.scrollY;
    }

    
}