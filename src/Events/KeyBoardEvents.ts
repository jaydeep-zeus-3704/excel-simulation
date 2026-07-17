import { TOTAL_ROWS, TOTAL_COLS, HEADER_ROW_HEIGHT, HEADER_COLUMN_WIDTH } from "../Constants.js";
import { EditCellCommand } from "../Managers/CommandManager.js";
import type { Grid } from "../Grid.js";

export class KeyboardEventListener {
    constructor(private grid: Grid) {}

    attach() {
        document.addEventListener("keydown", this.onKeyDown);
    }

    detach() {
        document.removeEventListener("keydown", this.onKeyDown);
    }

    private arrowKeyPressed(row: number, col: number) {
        const g = this.grid;
        const cellLeft = g.columnPos[col]!;
        const cellRight = g.columnPos[col + 1]!;
        const cellTop = g.rowPos[row]!;
        const cellBottom = g.rowPos[row + 1]!;
        const viewportWidth = g.canvas.clientWidth;
        const viewportHeight = g.canvas.clientHeight;
        // Right
        if (cellRight - g.scrollX > viewportWidth) {
            g.scrollX = cellRight - viewportWidth;
        }
        // Left
        if (cellLeft < g.scrollX + HEADER_COLUMN_WIDTH) {
            g.scrollX = Math.max(0, cellLeft - HEADER_COLUMN_WIDTH);
        }
        // Down
        if (cellBottom - g.scrollY > viewportHeight) {
            g.scrollY = cellBottom - viewportHeight;
        }
        // Up
        if (cellTop < g.scrollY + HEADER_ROW_HEIGHT) {
            g.scrollY = Math.max(0, cellTop - HEADER_ROW_HEIGHT);
        }

        g.currentClick = { row, col };

        g.selectionManager.selectedState = {
            row1: row,
            col1: col,
            row2: row,
            col2: col,
        };

        g.render();
    }

    onKeyDown = (e: KeyboardEvent) => {
        const g = this.grid;
        const { row, col } = g.currentClick;
        const controlPressed: boolean = e.ctrlKey;

        switch (e.key) {
            case "Enter":
                g.commandManager.executeCommand(
                    new EditCellCommand(row, col, g.editManager.inputValue, g.store)
                );
                g.editManager.showInputBox(-1, -1, g.scrollX, g.scrollY);
                g.render();
                break;
            case "ArrowUp":
                if (row > 0) this.arrowKeyPressed(row - 1, col);
                break;
            case "ArrowDown":
                if (row != TOTAL_ROWS) this.arrowKeyPressed(row + 1, col);
                break;
            case "ArrowLeft":
                if (col > 0) this.arrowKeyPressed(row, col - 1);
                break;
            case "ArrowRight":
                if (col < TOTAL_COLS) this.arrowKeyPressed(row, col + 1);
                break;
            case "z":
                if (controlPressed) {
                    g.commandManager.undo();
                    g.render();
                }
                break;
            case "y":
                if (controlPressed) {
                    g.commandManager.redo();
                    g.render();
                }
                break;
            default:
                break;
        }
    };
}