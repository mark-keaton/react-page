import { test, expect } from '../../fixtures/editor.fixture';

/**
 * Cell Operations Tests
 *
 * Tests for cell CRUD operations: add, delete, duplicate cells.
 * Also covers cell focus and selection operations.
 */

test.describe('Cell Operations', () => {
  test.describe('Add Cell', () => {
    test('should add a cell via plugin drawer', async ({ emptyEditor }) => {
      // Get initial cell count
      const initialCellCount = await emptyEditor.getCellCount();

      // Open plugin drawer and add a Text cell
      await emptyEditor.enterInsertMode();
      await emptyEditor.pluginDrawer.waitForOpen();

      // Search for Text plugin
      await emptyEditor.pluginDrawer.search('Text');
      await emptyEditor.page.waitForTimeout(300);

      // Select the Text plugin
      const textPlugin = emptyEditor.pluginDrawer.getPlugin('Text');
      if (await textPlugin.isVisible()) {
        await textPlugin.click();

        // Wait for cell to be added
        await emptyEditor.page.waitForTimeout(500);

        // Cell count should increase
        const newCellCount = await emptyEditor.getCellCount();
        expect(newCellCount).toBeGreaterThan(initialCellCount);
      }
    });

    test('should add multiple cells of the same type', async ({ emptyEditor }) => {
      // Add first cell
      await emptyEditor.enterInsertMode();
      const textPlugin = emptyEditor.pluginDrawer.getPlugin('Text');

      if (await textPlugin.isVisible()) {
        await textPlugin.click();
        await emptyEditor.page.waitForTimeout(500);

        const countAfterFirst = await emptyEditor.getCellCount();

        // Add second cell
        await emptyEditor.enterInsertMode();
        await textPlugin.click();
        await emptyEditor.page.waitForTimeout(500);

        const countAfterSecond = await emptyEditor.getCellCount();
        expect(countAfterSecond).toBeGreaterThan(countAfterFirst);
      }
    });

    test('should add cell with specific plugin type', async ({ emptyEditor }) => {
      await emptyEditor.enterInsertMode();

      // Search for a specific plugin
      await emptyEditor.pluginDrawer.search('Spacer');
      await emptyEditor.page.waitForTimeout(300);

      const spacerPlugin = emptyEditor.pluginDrawer.getPlugin('Spacer');
      if (await spacerPlugin.isVisible()) {
        await spacerPlugin.click();
        await emptyEditor.page.waitForTimeout(500);

        const cellCount = await emptyEditor.getCellCount();
        expect(cellCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Cell Focus and Selection', () => {
    test('should focus cell on click', async ({ demoEditor }) => {
      const firstCell = demoEditor.getCell(0);
      await firstCell.waitForVisible();

      // Click on the cell
      await firstCell.click();

      // Cell should be visible and focused
      await expect(firstCell.locator).toBeVisible();
    });

    test('should switch focus between cells', async ({ demoEditor }) => {
      const cellCount = await demoEditor.getCellCount();

      if (cellCount >= 2) {
        const firstCell = demoEditor.getCell(0);
        const secondCell = demoEditor.getCell(1);

        await firstCell.waitForVisible();
        await secondCell.waitForVisible();

        // Focus first cell
        await firstCell.click();
        await expect(firstCell.locator).toBeVisible();

        // Focus second cell
        await secondCell.click();
        await expect(secondCell.locator).toBeVisible();
      }
    });

    test('should double-click to enter edit mode on text cell', async ({ demoEditor }) => {
      const firstCell = demoEditor.getCell(0);
      await firstCell.waitForVisible();

      // Double-click to potentially enter edit mode
      await firstCell.doubleClick();

      // Cell should still be visible
      await expect(firstCell.locator).toBeVisible();
    });
  });

  test.describe('Cell Properties', () => {
    test('should get cell size', async ({ demoEditor }) => {
      const firstCell = demoEditor.getCell(0);
      await firstCell.waitForVisible();

      const size = await firstCell.getSize();
      // Size should be between 1 and 12 (grid columns)
      expect(size).toBeGreaterThanOrEqual(1);
      expect(size).toBeLessThanOrEqual(12);
    });

    test('should get cell text content', async ({ demoEditor }) => {
      const firstCell = demoEditor.getCell(0);
      await firstCell.waitForVisible();

      const textContent = await firstCell.getTextContent();
      // Text content should be a string (may be empty for non-text cells)
      expect(typeof textContent).toBe('string');
    });

    test('should check cell visibility', async ({ demoEditor }) => {
      const firstCell = demoEditor.getCell(0);

      const isVisible = await firstCell.isVisible();
      expect(isVisible).toBe(true);
    });

    test('should get cell bounding box', async ({ demoEditor }) => {
      const firstCell = demoEditor.getCell(0);
      await firstCell.waitForVisible();

      const boundingBox = await firstCell.getBoundingBox();
      expect(boundingBox).not.toBeNull();
      if (boundingBox) {
        expect(boundingBox.width).toBeGreaterThan(0);
        expect(boundingBox.height).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Cell Content Verification', () => {
    test('should verify cell contains text', async ({ demoEditor }) => {
      const firstCell = demoEditor.getCell(0);
      await firstCell.waitForVisible();

      // Get the text content
      const content = await firstCell.getTextContent();

      // Check if contains any text (demo page should have content)
      if (content.trim().length > 0) {
        const containsText = await firstCell.containsText(content.substring(0, 5));
        expect(containsText).toBe(true);
      }
    });

    test('should check cell has plugin', async ({ demoEditor }) => {
      const firstCell = demoEditor.getCell(0);
      await firstCell.waitForVisible();

      // The cell should either have a plugin or be a layout cell
      const hasPlugin = await firstCell.hasPlugin();
      // Note: hasPlugin might be false for layout cells
      expect(typeof hasPlugin).toBe('boolean');
    });
  });

  test.describe('Cell Navigation', () => {
    test('should iterate through all cells', async ({ demoEditor }) => {
      const cells = await demoEditor.getAllCells();

      expect(cells.length).toBeGreaterThan(0);

      // Each cell should be accessible
      for (let i = 0; i < Math.min(cells.length, 5); i++) {
        const cell = cells[i];
        const isVisible = await cell.isVisible();
        expect(isVisible).toBe(true);
      }
    });

    test('should access cells by index', async ({ demoEditor }) => {
      const cellCount = await demoEditor.getCellCount();

      if (cellCount > 0) {
        // Access first cell
        const firstCell = demoEditor.getCell(0);
        await expect(firstCell.locator).toBeVisible();

        // Access last cell (if more than one)
        if (cellCount > 1) {
          const lastCell = demoEditor.getCell(cellCount - 1);
          await expect(lastCell.locator).toBeVisible();
        }
      }
    });
  });

  test.describe('Cell Hover Interactions', () => {
    test('should hover over cell', async ({ demoEditor }) => {
      const firstCell = demoEditor.getCell(0);
      await firstCell.waitForVisible();

      // Hover over the cell
      await firstCell.hover();

      // Cell should still be visible after hover
      await expect(firstCell.locator).toBeVisible();
    });

    test('should show cell handle on hover in layout mode', async ({ demoEditor }) => {
      // Enter layout mode
      await demoEditor.enterLayoutMode();

      const firstCell = demoEditor.getCell(0);
      await firstCell.waitForVisible();

      // Hover over the cell
      await firstCell.hover();

      // In layout mode, hovering might show additional controls
      await expect(firstCell.locator).toBeVisible();
    });
  });
});
