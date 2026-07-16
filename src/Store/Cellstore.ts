import { Formula } from "../Formula.js";

export class CellStore {

    private data = new Map<string, string>();

    set(row: number, col: number, value: string) {

        if (!value.startsWith("=")) {
            this.data.set(`${row},${col}`, value);
            return;
        }

        const result = Formula.evaluate(value, this);

        this.data.set(
            `${row},${col}`,
            result === "#ERROR"
                ? value
                : result
        );
    }

    get(row: number, col: number) {
        return this.data.get(`${row},${col}`) || "";
    }

    delete(row: number, col: number) {
        this.data.delete(`${row},${col}`);
    }

    entries() {
        return this.data.entries();
    }
}