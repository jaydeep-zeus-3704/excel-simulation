import type { CellStore } from "./Store/Cellstore.js";

export class Formula {
  static evaluate(value: string, store: CellStore): string {
    if (!value.startsWith("=")) {
      return value;
    }

    try {
      const expression = value.slice(1).trim();
      // SUM(A1:A10)
      const sumMatch = expression.match(/^SUM\(([A-Z]+\d+):([A-Z]+\d+)\)$/i);
      console.log(sumMatch)
      if (sumMatch) {
        return this.sumRange(sumMatch[1]!, sumMatch[2]!, store).toString();
      }

      // AVG(A1:A10)
      const avgMatch = expression.match(/^AVG\(([A-Z]+\d+):([A-Z]+\d+)\)$/i);
      if (avgMatch) {
        const values = this.getRangeValues(avgMatch[1]!, avgMatch[2]!, store);
        if (values.length === 0) {
          return "0";
        }
        const total = values.reduce((sum, value) => sum + value, 0);
        return (total / values.length).toString();
      }

      // MIN(A1:A10)
      const minMatch = expression.match(/^MIN\(([A-Z]+\d+):([A-Z]+\d+)\)$/i);
      if (minMatch) {
        const values = this.getRangeValues(minMatch[1]!, minMatch[2]!, store);
        return Math.min(...values).toString();
      }

      // MAX(A1:A10)
      const maxMatch = expression.match(/^MAX\(([A-Z]+\d+):([A-Z]+\d+)\)$/i);
      if (maxMatch) {
        const values = this.getRangeValues(maxMatch[1]!, maxMatch[2]!, store);
        return Math.max(...values).toString();
      }

      const parsedExpression = expression.replace(
        /([A-Z]+[0-9]+)/gi,
        (cellRef) => this.getCellValue(cellRef, store).toString(),
      );

      const result = Function(`"use strict"; return (${parsedExpression})`)();

      return String(result);
    } catch {
      return "#ERROR";
    }
  }

  private static getCellValue(cellRef: string, store: CellStore): number {
    const parsed = this.parseCellReference(cellRef);
    if (!parsed) {
      return 0;
    }
    const value = store.get(parsed.row, parsed.col);
    return Number(value) || 0;
  }

  private static sumRange(
    startRef: string,
    endRef: string,
    store: CellStore,
  ): number {
    const values = this.getRangeValues(startRef, endRef, store);
    return values.reduce((sum, value) => sum + value, 0);
  }

  private static getRangeValues(
    startRef: string,
    endRef: string,
    store: CellStore,
  ): number[] {
    const start = this.parseCellReference(startRef);
    const end = this.parseCellReference(endRef);
    if (!start || !end) {
      return [];
    }

    const values: number[] = [];

    for (let row = start.row; row <= end.row; row++) {
      for (let col = start.col; col <= end.col; col++) {
        values.push(Number(store.get(row, col)) || 0);
      }
    }

    return values;
  }

  private static parseCellReference(ref: string) {
    const match = ref.match(/^([A-Z]+)(\d+)$/i);

    if (!match) {
      return null;
    }

    return {
      col: this.columnToIndex(match[1]!.toUpperCase()),
      row: Number(match[2]) - 1,
    };
  }

  private static columnToIndex(column: string): number {
    let result = 0;
    for (let i = 0; i < column.length; i++) {
      result = result * 26 + (column.charCodeAt(i) - 64);
    }
    return result - 1;
  }
}
