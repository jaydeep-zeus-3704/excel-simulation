import type { CellStore } from "../Store/Cellstore.js";

export class Summary {
    private count = 0;
    private sum = 0;
    private min = Number.MAX_SAFE_INTEGER;
    private max = Number.MIN_SAFE_INTEGER;
    private avg = 0;

    constructor(private store: CellStore) {}

    private computeSummary(row1: number, col1: number, row2: number, col2: number) {
        // normalize bounds
        const startRow = Math.min(row1, row2);
        const endRow   = Math.max(row1, row2);
        const startCol = Math.min(col1, col2);
        const endCol   = Math.max(col1, col2);

        this.count = 0;
        this.sum = 0;
        this.min = Number.MAX_SAFE_INTEGER;
        this.max = Number.MIN_SAFE_INTEGER;

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const raw = this.store.get(r, c);
                if (raw == null) continue;

                const value = Number(raw);
                if (isNaN(value)) continue;

                this.count++;
                this.sum += value;
                if (value < this.min) this.min = value;
                if (value > this.max) this.max = value;
            }
        }

        this.avg = this.count > 0 ? this.sum / this.count : 0;

        if (this.count === 0) {
            this.min = 0;
            this.max = 0;
        }
    }

    displaySummary(row1: number, col1: number, row2: number, col2: number) {
        console.log("Summary called");
        this.computeSummary(row1, col1, row2, col2);

        const summaryBox = document.getElementById("summary")!;
        summaryBox.innerHTML = `
            <span id="count">Count: ${this.count}</span>
            <span id="min">Minimum: ${this.count === 0 ? 'NA' : this.min}</span>
            <span id="max">Maximum: ${this.count === 0 ? 'NA' : this.max}</span>
            <span id="avg">Avg: ${this.count === 0 ? 'NA' : this.avg.toPrecision(6)}</span>
            <span id="sum">Sum: ${this.sum}</span>
        `;
    }

    getSummary(row1: number, col1: number, row2: number, col2: number) {
        this.computeSummary(row1, col1, row2, col2);
        return {
            count: this.count,
            min: this.min,
            max: this.max,
            sum: this.sum,
            avg: this.avg
        };
    }
}
