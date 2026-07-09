import { Grid } from "./Grid.js";

const canvas =document.getElementById("grid-canvas") as HTMLCanvasElement;

const input =document.getElementById("cell-input") as HTMLInputElement;

new Grid(canvas, input);