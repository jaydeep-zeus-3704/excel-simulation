import type { CellStore } from "../Store/Cellstore.js";

export class DataLoader{
    constructor(private filePath:string,private store:CellStore){
    
    }

    public loadData=async ()=>{
         try {
            const data = await fetch(this.filePath);
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
        } catch (error) {
            console.error("Failed to parse and write JSON data to Excel canvas:", error);
        }
    }
}