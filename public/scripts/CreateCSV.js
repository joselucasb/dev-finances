class CreateCSV {
  /**
   *
   * @param {HTMLTableElement} table
   * @param {{ excludeHeadings: boolean }} options
   */
  constructor(table = null, options = {}) {
    const { excludeHeadings = false } = options;

    this.table = table;
    this.excludeHeadings = excludeHeadings;
  }

  csvString() {
    const tableCells = this.getTableCells();

    const csv = tableCells.map((cells) => {
      const strings = cells.map((cellElement) => {
        return cellElement.textContent.replace(/[,]/g, '.');
      });

      return strings.join(',');
    });

    return csv.join('\n');
  }

  getTableCells() {
    const tableRows = this.getTableRows();
    const tableCells = [];

    for (const row of tableRows) {
      const values = [];

      for (let i = 0; i < row.cells.length - 1; i++) {
        values.push(row.cells[i]);
      }

      tableCells.push(values);
    }

    return tableCells;
  }

  getTableRows() {
    const tableRows = Array.from(this.table.rows);
    this.excludeHeadings ? tableRows.shift() : null;

    return tableRows;
  }
}

globalThis.CreateCSV = new CreateCSV();
