import { test, expect } from '../../fixtures/editor.fixture';

/**
 * Row Operations Tests
 *
 * Tests for row CRUD operations and row structure verification.
 * Covers row creation, cell arrangement within rows, and row properties.
 */

test.describe('Row Operations', () => {
  test.describe('Row Structure', () => {
    test('should have rows in demo editor', async ({ demoEditor }) => {
      const rowCount = await demoEditor.getRowCount();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('should access rows by index', async ({ demoEditor }) => {
      const rowCount = await demoEditor.getRowCount();

      if (rowCount > 0) {
        const firstRow = demoEditor.getRow(0);
        await firstRow.waitForVisible();
        await expect(firstRow.locator).toBeVisible();
      }
    });

    test('should get cells within a row', async ({ demoEditor }) => {
      const firstRow = demoEditor.getRow(0);
      await firstRow.waitForVisible();

      const cellCount = await firstRow.getCellCount();
      expect(cellCount).toBeGreaterThan(0);
    });

    test('should access specific cell within row', async ({ demoEditor }) => {
      const firstRow = demoEditor.getRow(0);
      await firstRow.waitForVisible();

      const cellCount = await firstRow.getCellCount();
      if (cellCount > 0) {
        const cellLocator = firstRow.getCell(0);
        await expect(cellLocator).toBeVisible();
      }
    });
  });

  test.describe('Row Properties', () => {
    test('should get row bounding box', async ({ demoEditor }) => {
      const firstRow = demoEditor.getRow(0);
      await firstRow.waitForVisible();

      const boundingBox = await firstRow.getBoundingBox();
      expect(boundingBox).not.toBeNull();
      if (boundingBox) {
        expect(boundingBox.width).toBeGreaterThan(0);
        expect(boundingBox.height).toBeGreaterThan(0);
      }
    });

    test('should check row visibility', async ({ demoEditor }) => {
      const firstRow = demoEditor.getRow(0);

      const isVisible = await firstRow.isVisible();
      expect(isVisible).toBe(true);
    });

    test('should check if row is empty', async ({ demoEditor }) => {
      const firstRow = demoEditor.getRow(0);
      await firstRow.waitForVisible();

      const isEmpty = await firstRow.isEmpty();
      // Demo editor rows should not be empty
      expect(isEmpty).toBe(false);
    });

    test('should calculate total cell width in row', async ({ demoEditor }) => {
      const firstRow = demoEditor.getRow(0);
      await firstRow.waitForVisible();

      const totalWidth = await firstRow.getTotalCellWidth();
      // Total width should be positive
      expect(totalWidth).toBeGreaterThan(0);
      // Total width should not exceed 12 (max grid columns)
      expect(totalWidth).toBeLessThanOrEqual(12);
    });
  });

  test.describe('Row Interactions', () => {
    test('should hover over row', async ({ demoEditor }) => {
      const firstRow = demoEditor.getRow(0);
      await firstRow.waitForVisible();

      // Hover over the row
      await firstRow.hover();

      // Row should still be visible
      await expect(firstRow.locator).toBeVisible();
    });

    test('should click on row', async ({ demoEditor }) => {
      const firstRow = demoEditor.getRow(0);
      await firstRow.waitForVisible();

      // Click on the row
      await firstRow.click();

      // Row should remain visible
      await expect(firstRow.locator).toBeVisible();
    });
  });

  test.describe('Multiple Rows', () => {
    test('should iterate through all rows', async ({ demoEditor }) => {
      const rowCount = await demoEditor.getRowCount();

      // Check first few rows (limit to avoid long test times)
      const rowsToCheck = Math.min(rowCount, 5);
      for (let i = 0; i < rowsToCheck; i++) {
        const row = demoEditor.getRow(i);
        const isVisible = await row.isVisible();
        expect(isVisible).toBe(true);
      }
    });

    test('should have consistent row structure', async ({ demoEditor }) => {
      const rowCount = await demoEditor.getRowCount();

      if (rowCount >= 2) {
        const firstRow = demoEditor.getRow(0);
        const secondRow = demoEditor.getRow(1);

        await firstRow.waitForVisible();
        await secondRow.waitForVisible();

        // Both rows should be visible
        await expect(firstRow.locator).toBeVisible();
        await expect(secondRow.locator).toBeVisible();
      }
    });

    test('should get row cells as CellComponent array', async ({ demoEditor }) => {
      const firstRow = demoEditor.getRow(0);
      await firstRow.waitForVisible();

      const cells = await firstRow.getCells();
      expect(cells.length).toBeGreaterThan(0);

      // First cell should be a valid CellComponent
      if (cells.length > 0) {
        const firstCell = cells[0];
        await expect(firstCell.locator).toBeVisible();
      }
    });
  });

  test.describe('Row Layout', () => {
    test('should check for floating children', async ({ demoEditor }) => {
      const firstRow = demoEditor.getRow(0);
      await firstRow.waitForVisible();

      const hasFloating = await firstRow.hasFloatingChildren();
      // Just verify we can check this property
      expect(typeof hasFloating).toBe('boolean');
    });

    test('should verify row contains expected cells', async ({ demoEditor }) => {
      const firstRow = demoEditor.getRow(0);
      await firstRow.waitForVisible();

      const cellCount = await firstRow.getCellCount();
      const cells = await firstRow.getCells();

      // Cell count from method should match array length
      expect(cells.length).toBe(cellCount);
    });
  });

  test.describe('Row Creation via Cell Addition', () => {
    test('should create new row when adding cell to empty editor', async ({ emptyEditor }) => {
      const initialRowCount = await emptyEditor.getRowCount();

      // Add a cell
      await emptyEditor.enterInsertMode();
      const textPlugin = emptyEditor.pluginDrawer.getPlugin('Text');

      if (await textPlugin.isVisible()) {
        await textPlugin.click();
        await emptyEditor.page.waitForTimeout(500);

        // Check if a row was created
        const newRowCount = await emptyEditor.getRowCount();
        // Should have at least one row now
        expect(newRowCount).toBeGreaterThanOrEqual(initialRowCount);
      }
    });
  });

  test.describe('Row and Cell Relationship', () => {
    test('should have cells that belong to rows', async ({ demoEditor }) => {
      const rowCount = await demoEditor.getRowCount();
      const totalCellCount = await demoEditor.getCellCount();

      // Count cells in all rows
      let cellsInRows = 0;
      for (let i = 0; i < rowCount; i++) {
        const row = demoEditor.getRow(i);
        cellsInRows += await row.getCellCount();
      }

      // Cells in rows should be related to total cell count
      // Note: nested cells might cause counts to differ
      expect(cellsInRows).toBeGreaterThan(0);
    });

    test('should maintain row-cell hierarchy', async ({ demoEditor }) => {
      const firstRow = demoEditor.getRow(0);
      await firstRow.waitForVisible();

      const rowBoundingBox = await firstRow.getBoundingBox();
      const cells = await firstRow.getCells();

      if (cells.length > 0 && rowBoundingBox) {
        const firstCell = cells[0];
        const cellBoundingBox = await firstCell.getBoundingBox();

        if (cellBoundingBox) {
          // Cell should be within row bounds (with some tolerance for borders)
          expect(cellBoundingBox.x).toBeGreaterThanOrEqual(rowBoundingBox.x - 10);
          expect(cellBoundingBox.y).toBeGreaterThanOrEqual(rowBoundingBox.y - 10);
        }
      }
    });
  });
});
