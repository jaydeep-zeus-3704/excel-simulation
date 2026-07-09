export class CellStore {
    private data = new Map<string, string>();
    

    set(row: number, col: number, value: string) {
        this.data.set(`${row},${col}`, value);
    }

    get(row: number, col: number) {
        return this.data.get(`${row},${col}`) || "";
    }

    delete(row:number,col:number){
        this.data.delete(`${row},${col}`)
    }

    entries() {
        return this.data.entries();
    }
}