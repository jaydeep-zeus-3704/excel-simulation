import {
    DEFAULT_COLUMN_WIDTH,
    DEFAULT_ROW_HEIGHT,
    TOTAL_ROWS,
    TOTAL_COLS,
} from "./Constants.js";

import { CellStore } from "./Store/Cellstore.js";
import { CanvasRenderer } from "./Managers/CanvasRenderer.js";
import { EditManager } from "./Managers/EditManager.js";
import { SelectionManager } from "./Managers/SelectionManager.js";
import { CommandManager } from "./Managers/CommandManager.js";
import { MouseEventListeners } from "./Events/MouseEvents.js";
import { KeyboardEventListener } from "./Events/KeyBoardEvents.js";
import { EventManger } from "./Managers/EventManager.js";
import { ViewPortManager } from "./Managers/ViewportManger.js";
import { Summary } from "./Managers/SummaryManager.js";
import { DataLoader } from "./Managers/DataLoader.js";
interface IResizeState{
     startX: number,
     startY: number,
     initialSize: number,
     newWidth: number,
     newHeight: number,
}

export class Grid {
    // Rendering
    ctx: CanvasRenderingContext2D;
    renderer: CanvasRenderer;

    // Scroll position
    scrollX:number = 0;
    scrollY:number = 0;

    // Data
    store = new CellStore();
    columnPos: number[] = [];
    rowPos: number[] = [];

    // Input / selection
    editManager: EditManager;
    selectionManager: SelectionManager;
    summaryManager:Summary;
    currentClick: { row: number; col: number } = { row: -1, col: -1 };
    // Commands
    commandManager: CommandManager;

    // Event handlers
    private mouseEventListeners: MouseEventListeners;
    private keyboardEventListener: KeyboardEventListener;
    public eventManager:EventManger;
    public viewPortManager:ViewPortManager;
    private dataLoader:DataLoader;

    constructor(public canvas: HTMLCanvasElement, input: HTMLInputElement) {
        this.populateColAndRowPos();
        this.dataLoader=new DataLoader("../output.json",this.store);
        this.ctx = canvas.getContext("2d")!;
        this.viewPortManager=new ViewPortManager()
        this.eventManager=new EventManger(this)
        this.commandManager = new CommandManager();
        this.selectionManager = new SelectionManager(this.ctx,this.viewPortManager);
        this.summaryManager=new Summary(this.store)
        this.renderer = new CanvasRenderer(this.ctx, this.selectionManager, this.store);
        this.editManager = new EditManager(this,input, this.store, this.rowPos, this.columnPos, this.canvas);
        this.mouseEventListeners = new MouseEventListeners(this);
        this.keyboardEventListener = new KeyboardEventListener(this);
        this.setupCanvas();
        this.attachEvents();

    }

    private populateColAndRowPos():void {
        let sum = DEFAULT_COLUMN_WIDTH;
        for (let i = 0; i <= TOTAL_COLS; i++) {
            this.columnPos.push(sum);
            sum += DEFAULT_COLUMN_WIDTH;
        }
        sum = DEFAULT_ROW_HEIGHT;
        for (let i = 0; i <= TOTAL_ROWS; i++) {
            this.rowPos.push(sum);
            sum += DEFAULT_ROW_HEIGHT;
        }
    }

    
    public get rowPosition() : number[] {
        return this.rowPos;
    }

    public set rowPosition(rowPos:number[]){
        this.rowPos=rowPos;
    }

    public get columnPosition():number[]{
        return this.columnPos;
    }

    public set columnPosition(colPos:number[]){
        this.columnPos=colPos;
    }
    

    private setupCanvas=async () => {
        await this.dataLoader.loadData();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.ctx.resetTransform();
        this.ctx.scale(dpr, dpr);
        this.render();
    }

    render() {
        this.renderer.drawGrid(this.rowPos, this.columnPos, this.scrollX, this.scrollY);
        this.renderer.drawCellData(this.scrollX, this.scrollY, this.rowPos, this.columnPos);
        this.editManager.showSelectedCell(this.scrollX, this.scrollY, this.currentClick.row, this.currentClick.col);
        this.editManager.showInputBox(-1, -1, this.scrollX, this.scrollY);
        this.renderer.drawHeaders(this.scrollX, this.scrollY, this.rowPos, this.columnPos);
        this.selectionManager.drawHeaderSelection(this.columnPos,this.rowPos)
    }

    private attachEvents() {
        window.addEventListener("resize", () => this.setupCanvas());
        this.mouseEventListeners.attach(this.canvas);
        this.keyboardEventListener.attach();
    }

}