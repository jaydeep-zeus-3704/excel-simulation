import {
    HEADER_COLUMN_WIDTH,
    HEADER_ROW_HEIGHT
} from "./Constants.js";
import { CellStore } from "./Cellstore.js";
import { Formula } from "./Formula.js";

export class CellSelector {
    private _input: HTMLInputElement;
    private _cellStore: CellStore;
    private columnPositions: number[];
    private rowPositions: number[];
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(input: HTMLInputElement, store: CellStore, rowPos: number[], colPos: number[], canvas: HTMLCanvasElement) {
        this._input = input;
        this._cellStore = store;
        this.rowPositions = rowPos;
        this.columnPositions = colPos;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;        
        this.setupInputStyle();
    }

    private setupInputStyle() {
        // Essential styles to ensure it overlays cleanly over the canvas cell
        this._input.style.position = "absolute";
        this._input.style.border = "2px solid #284314";
        this._input.style.outline = "none";
        this._input.style.padding = "0 4px";
        this._input.style.boxSizing = "border-box";
        this._input.style.font = "14px Arial"; // Match your canvas font style here
    }

    showSelectedCell(scrollX: number, scrollY: number, row: number, col: number) {
        if (row === -1 || col === -1) return;

        const x = this.columnPositions[col]! - scrollX;
        const y = this.rowPositions[row]! - scrollY;
        const data = this._cellStore.get(row, col) || "";
        const width = this.columnPositions[col + 1]! - this.columnPositions[col]!;
        const height = this.rowPositions[row + 1]! - this.rowPositions[row]!;

        this.ctx.beginPath();
        this.ctx.fillStyle = "#b6d3c3";
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeStyle = "#284314";
        this.ctx.strokeRect(x, y, width, height);
        
        // Only draw cell text on canvas if the interactive DOM input element isn't currently sitting on top of it
        if (this._input.style.display !== "block" || this._input.style.left !== `${this.canvas.getBoundingClientRect().left + x}px`) {
            this.ctx.fillStyle = "#000000";
            this.ctx.textAlign = "left";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(data, x + 5, y + height / 2);
        }
    }

    showInputBox(row: number, col: number, scrollX: number, scrollY: number) {
        if (row === -1 || col === -1) {
            this.hideInputBox();
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const localX = (this.columnPositions[col] as number) - scrollX;
        const localY = (this.rowPositions[row] as number) - scrollY;
        const width = this.columnPositions[col + 1]! - this.columnPositions[col]!;
        const height = this.rowPositions[row + 1]! - this.rowPositions[row]!;

        const isOutsideViewport =
            localX < HEADER_COLUMN_WIDTH ||
            localX > rect.width ||
            localY < HEADER_ROW_HEIGHT ||
            localY > rect.height;

        if (isOutsideViewport) {
            this.hideInputBox();
            return;
        }

        this._input.style.display = "block";
        this._input.style.left = `${rect.left + localX}px`;
        this._input.style.top = `${rect.top + localY}px`;
        this._input.style.width = `${width}px`;
        this._input.style.height = `${height}px`;

        // Load value from store when opening
        const cellValue = this._cellStore.get(row, col);
        this._input.value = cellValue || "";
        this._input.focus();
    }

    hideInputBox() {
        this._input.style.display = "none";
    }

    getInputValue(): string {
        return this._input.value.trim();
    }

    getParsedValue(): string {
        const rawValue = this.getInputValue();
        if (rawValue === "") return "";
        
        const parsedValue = Formula.evaluate(rawValue);
        return parsedValue === "#ERRROR" ? rawValue : parsedValue;
    }

    clearInput() {
        this._input.value = "";
    }
}