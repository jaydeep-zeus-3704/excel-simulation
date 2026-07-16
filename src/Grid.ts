import {
    DEFAULT_COLUMN_WIDTH,
    DEFAULT_ROW_HEIGHT,
    TOTAL_ROWS,
    TOTAL_COLS,
} from "./Constants.js";

import { CellStore } from "./Store/Cellstore.js";
import { CanvasRenderer } from "./Managers/CanvasRenderer.js";
import { CellSelector } from "./Managers/EditManager.js";
import { SelectionManager } from "./Managers/SelectionManager.js";
import { CommandManager } from "./Managers/CommandManager.js";
import { MouseEventListeners } from "./Events/MouseEvents.js";
import { KeyboardEventListener } from "./Events/KeyBoardEvents.js";

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
    cellSelector: CellSelector;
    selectionManager: SelectionManager;
    currentClick: { row: number; col: number } = { row: -1, col: -1 };

    // Resize state
    resizingColumn: number = -1;
    resizingRow: number = -1;
    resizeState:IResizeState = {
        startX: 0,
        startY: 0,
        initialSize: 0,
        newWidth: 0,
        newHeight: 0,
    };

    // Commands
    commandManager: CommandManager;

    // Event handlers
    private mouseEventListeners: MouseEventListeners;
    private keyboardEventListener: KeyboardEventListener;

    constructor(public canvas: HTMLCanvasElement, input: HTMLInputElement) {
        this.ctx = canvas.getContext("2d")!;
        this.commandManager = new CommandManager();
        this.selectionManager = new SelectionManager(this.ctx, this.store);
        this.renderer = new CanvasRenderer(this.ctx, this.selectionManager, this.store);
        this.populateColAndRowPos();
        this.cellSelector = new CellSelector(input, this.store, this.rowPos, this.columnPos, this.canvas);
        this.writeJsonToExcel("../output.json");
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

    private setupCanvas() {
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
        this.cellSelector.showSelectedCell(this.scrollX, this.scrollY, this.currentClick.row, this.currentClick.col);
        this.cellSelector.showInputBox(-1, -1, this.scrollX, this.scrollY);
        this.renderer.drawHeaders(this.scrollX, this.scrollY, this.rowPos, this.columnPos);
        this.selectionManager.drawHeaderSelection(this.scrollX, this.scrollY, this.columnPos, this.rowPos);
    }

    private attachEvents() {
        window.addEventListener("resize", () => this.setupCanvas());
        this.mouseEventListeners.attach(this.canvas);
        this.keyboardEventListener.attach();
    }

    resizeCol = (col: number, newWidth: number) => {
        const currentWidth = this.columnPos[col + 1]! - this.columnPos[col]!;
        const diff = newWidth - currentWidth;
        if (diff === 0) return;
        for (let i = col + 1; i < this.columnPos.length; i++) {
            this.columnPos[i]! += diff;
        }
    };

    resizeRow = (row: number, newHeight: number) => {
        const currentHeight = this.rowPos[row + 1]! - this.rowPos[row]!;
        const diff = newHeight - currentHeight;
        if (diff === 0) return;
        for (let i = row + 1; i < this.rowPos.length; i++) {
            this.rowPos[i]! += diff;
        }
    };

    private async writeJsonToExcel(filePath: string) {
        try {
            const data = await fetch(filePath);
            const response = await data.json();
            if (!response || response.length === 0) return;
            const keys = Object.keys(response[0]);

            for (let i = 0; i < keys.length; i++) {
                this.store.set(0, i, keys[i]!);
            }

            response.forEach((rowData: any, rowIndex: number) => {
                keys.forEach((key, colIndex) => {
                    const cellValue = rowData[key] !== undefined ? String(rowData[key]) : "";
                    this.store.set(rowIndex + 1, colIndex, cellValue);
                });
            });

            this.render();
        } catch (error) {
            console.error("Failed to parse and write JSON data to Excel canvas:", error);
        }
    }
}