import { HEADER_COLUMN_WIDTH, HEADER_ROW_HEIGHT } from "../Constants.js";

export function getVisibleRowsAndColumns(
    scrollX: number, 
    scrollY: number, 
    rowPos: number[], 
    colPos: number[]
) {
    const visibleStartX = scrollX + HEADER_COLUMN_WIDTH;
    const visibleStartY = scrollY + HEADER_ROW_HEIGHT;

    let startCol = 0;
    for (let i = 0; i < colPos.length - 1; i++) {
        if (visibleStartX >= colPos[i]! && visibleStartX < colPos[i + 1]!) {
            startCol = i;
            break;
        }
    }

    let startRow = 0;
    for (let i = 0; i < rowPos.length - 1; i++) {
        if (visibleStartY >= rowPos[i]! && visibleStartY < rowPos[i + 1]!) {
            startRow = i;
            break;
        }
    }

    const viewportBottom = scrollY + window.innerHeight;
    const viewportRight = scrollX + window.innerWidth;

    let endRow = startRow;
    while (endRow < rowPos.length - 1 && rowPos[endRow]! < viewportBottom) {
        endRow++;
    }
    let endCol = startCol;
    while (endCol < colPos.length - 1 && colPos[endCol]! < viewportRight) {
        endCol++;
    }
    return {
        startRow,
        startCol,
        endRow,
        endCol
    };
}
