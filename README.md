# Excel Clone 

## Project Objective

This project is a lightweight Excel-like spreadsheet application built using HTML Canvas and TypeScript. The goal was to handle large datasets efficiently while supporting common spreadsheet operations such as editing, formulas, selection, resizing, and undo/redo functionality.

---

## Installation & Running

### Prerequisites

- Node.js
- npm

### Steps

```bash
npm install
npm run dev
```

Open `frontend/index.html` using Live Server.

---

## Features Implemented

- Excel-style spreadsheet UI
- Canvas-based grid rendering
- Virtual rendering for large datasets
- Cell editing
- Keyboard navigation
- Row selection
- Column selection
- Multi-cell selection
- Summary calculations
  - Count
  - Sum
  - Average
  - Minimum
  - Maximum
- Formula support
  - SUM()
  - AVG()
  - MIN()
  - MAX()
  - Arithmetic expressions (+, -, *, /)
- Row resizing
- Column resizing
- Undo / Redo
- JSON data loading

---

## Folder Structure

```text
src
├── Events
│   ├── KeyBoardEvents.ts
│   └── MouseEvents.ts
│
├── Helpers
│   ├── CanvasHelpers.ts
│   ├── getClosest.ts
│   └── getVisibleRowsAndColumns.ts
│
├── Managers
│   ├── CanvasRenderer.ts
│   ├── CommandManager.ts
│   ├── EditManager.ts
│   ├── SelectionManager.ts
│   └── SummaryManager.ts
│
├── Store
│   └── CellStore.ts
│
├── Formula.ts
├── Grid.ts
└── app.ts
```

### Important Classes

| Class | Responsibility |
|---------|---------------|
| Grid | Main application controller |
| CanvasRenderer | Grid rendering |
| CellStore | Cell data storage |
| SelectionManager | Selection logic |
| CellSelector | Cell editing |
| Formula | Formula evaluation |
| CommandManager | Undo/Redo management |

---

## OOP Concepts Applied

### Encapsulation

Data and behavior are grouped inside classes such as:

- CellStore
- Grid
- Formula
- SelectionManager

### Abstraction

Complex operations such as rendering, formula evaluation, and selection handling are hidden behind dedicated classes.

### Composition

Grid is composed of multiple managers:

- CanvasRenderer
- CommandManager
- SelectionManager
- CellSelector

---

## SOLID Principles Applied

### Single Responsibility Principle

Each class focuses on one responsibility.

Examples:

- Formula → formula processing
- CanvasRenderer → rendering
- CellStore → data management

### Open Closed Principle

New commands and formulas can be added without changing existing implementations.

### Dependency Separation

Application logic is separated into managers and helpers, reducing coupling.

---

## Command Pattern

The application uses the Command Pattern to support undo and redo operations.

### Commands

- EditCellCommand
- ResizeCommand

### Benefits

- Undo support
- Redo support
- Action history management

### Shortcuts

```text
Ctrl + Z → Undo
Ctrl + Y → Redo
```

---

## Virtual Rendering

The application supports:

- 100,000 rows
- 500 columns

Instead of rendering every cell, only the visible rows and columns are drawn on the canvas.

### Process

1. Current scroll position is tracked.
2. Visible range is calculated.
3. Only visible cells are rendered.
4. Hidden cells are skipped.

This significantly improves performance and memory usage.

---

## Data Generation & Loading

A mock dataset containing 50,000 employee records is generated using `script.js`.

Fields include:

- id
- firstName
- lastName
- age
- salary

When the application starts:

1. JSON file is loaded.
2. Headers are created automatically.
3. Data is populated into the grid.

---

## Formula Support

Supported formulas:

```excel
=SUM(A1:A10)

=AVG(A1:A10)

=MIN(A1:A10)

=MAX(A1:A10)

=A1+B1

=A1-B1

=A1*B1

=A1/B1
```

Invalid formulas return:

```text
#ERROR
```

---

## Undo / Redo

Supported actions:

- Cell edits
- Column resizing
- Row resizing

History is managed through CommandManager.

---

## Test Cases Covered

### Editing

- Edit single cell
- Edit empty cell
- Edit populated cell

### Formula Handling

- SUM range
- AVG range
- MIN range
- MAX range
- Addition
- Subtraction
- Multiplication
- Division
- Invalid formulas

### Selection

- Single cell selection
- Multi-cell selection
- Row selection
- Column selection

### Navigation

- Arrow key navigation
- Boundary navigation

### Resizing

- Column resize
- Row resize
- Minimum resize limits

### Performance

- Load 50,000 records
- Horizontal scrolling
- Vertical scrolling
- Large dataset rendering

### Undo / Redo

- Undo edit
- Redo edit
- Undo resize
- Redo resize

---

## Performance Observations

- Smooth scrolling with large datasets.
- Virtual rendering prevents unnecessary drawing.
- Cell data stored efficiently using JavaScript Map.
- Binary search is used for locating visible cells quickly.

---

## Accessibility Considerations

- Keyboard navigation support.
- Visible selection highlighting.
- Clear active cell indication.
- Keyboard shortcuts for undo and redo.

---

## Known Limitations

- No copy/paste support.
- No CSV/XLSX export.
- No cell formatting.
- No formula dependency tracking.
- No sorting or filtering.
- Formula results are stored after evaluation.

---

## Future Improvements

- Copy and paste
- CSV import/export
- XLSX support
- Formula dependency graph
- Search functionality
- Sorting and filtering
- Frozen rows and columns
- Better accessibility support

---

## Conclusion

The project successfully implements an Excel-like spreadsheet using HTML Canvas while maintaining good performance through virtual rendering. The application demonstrates OOP principles, SOLID design practices, the Command Pattern, and efficient handling of large datasets.