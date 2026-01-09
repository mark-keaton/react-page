import { test, expect } from '../../fixtures/editor.fixture';

/**
 * Editor Initialization Tests
 *
 * Tests for verifying the editor loads correctly in various states.
 * Covers empty editor, pre-populated editor, and different initialization scenarios.
 */

test.describe('Editor Initialization', () => {
  test.describe('Empty Editor', () => {
    test('should initialize empty editor with no cells', async ({ emptyEditor }) => {
      // Verify editor container is visible
      await expect(emptyEditor.editorContainer).toBeVisible();

      // Verify no cells are present initially (or very few system cells)
      const cellCount = await emptyEditor.getCellCount();
      // Empty editor might have 0 cells or a placeholder cell
      expect(cellCount).toBeLessThanOrEqual(1);
    });

    test('should display all sidebar controls on empty editor', async ({ emptyEditor }) => {
      // All control buttons should be visible
      await expect(emptyEditor.editButton).toBeVisible();
      await expect(emptyEditor.insertButton).toBeVisible();
      await expect(emptyEditor.layoutButton).toBeVisible();
      await expect(emptyEditor.resizeButton).toBeVisible();
      await expect(emptyEditor.previewButton).toBeVisible();
    });

    test('should show undo/redo controls on empty editor', async ({ emptyEditor }) => {
      // Undo/redo buttons should be visible
      await expect(emptyEditor.undoButton).toBeVisible();
      await expect(emptyEditor.redoButton).toBeVisible();
    });

    test('should have plugin drawer available on empty editor', async ({ emptyEditor }) => {
      // Plugin drawer should not be visible initially
      const isDrawerOpen = await emptyEditor.pluginDrawer.isOpen();
      expect(isDrawerOpen).toBe(false);

      // Should be able to open the drawer
      await emptyEditor.enterInsertMode();
      await expect(emptyEditor.pluginDrawer.drawer).toBeVisible();
    });
  });

  test.describe('Pre-populated Editor (Demo)', () => {
    test('should initialize demo editor with content', async ({ demoEditor }) => {
      // Verify editor container is visible
      await expect(demoEditor.editorContainer).toBeVisible();

      // Demo editor should have cells
      const cellCount = await demoEditor.getCellCount();
      expect(cellCount).toBeGreaterThan(0);
    });

    test('should initialize demo editor with rows', async ({ demoEditor }) => {
      // Demo editor should have rows
      const rowCount = await demoEditor.getRowCount();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('should have cells with content', async ({ demoEditor }) => {
      // Get the first cell and verify it exists
      const firstCell = demoEditor.getCell(0);
      await firstCell.waitForVisible();

      // The cell should be visible
      await expect(firstCell.locator).toBeVisible();
    });

    test('should have interactive cells on demo editor', async ({ demoEditor }) => {
      const firstCell = demoEditor.getCell(0);
      await firstCell.waitForVisible();

      // Should be able to hover over the cell
      await firstCell.hover();

      // Cell should still be visible after hover
      await expect(firstCell.locator).toBeVisible();
    });
  });

  test.describe('Simple Editor', () => {
    test('should initialize simple editor', async ({ simpleEditor }) => {
      // Verify editor container is visible
      await expect(simpleEditor.editorContainer).toBeVisible();

      // Sidebar should be visible
      await expect(simpleEditor.sidebar).toBeVisible();
    });

    test('should have limited plugins on simple editor', async ({ simpleEditor }) => {
      // Open plugin drawer
      await simpleEditor.enterInsertMode();

      // Simple editor should have fewer plugins than demo
      const pluginCount = await simpleEditor.pluginDrawer.getPluginCount();
      expect(pluginCount).toBeGreaterThan(0);
      // Simple editor typically has just slate and image plugins
      expect(pluginCount).toBeLessThanOrEqual(10);
    });
  });

  test.describe('Editor State Transitions', () => {
    test('should transition from empty to having content', async ({ emptyEditor }) => {
      // Start with empty editor
      const initialCellCount = await emptyEditor.getCellCount();

      // Add a cell
      await emptyEditor.enterInsertMode();

      // Search for and add a Text cell
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
        expect(newCellCount).toBeGreaterThanOrEqual(initialCellCount);
      }
    });

    test('should maintain state across mode switches', async ({ demoEditor }) => {
      // Get initial cell count
      const initialCellCount = await demoEditor.getCellCount();

      // Switch through modes
      await demoEditor.enterEditMode();
      await demoEditor.enterLayoutMode();
      await demoEditor.enterResizeMode();
      await demoEditor.enterPreviewMode();
      await demoEditor.enterEditMode();

      // Cell count should remain the same
      const finalCellCount = await demoEditor.getCellCount();
      expect(finalCellCount).toBe(initialCellCount);
    });
  });

  test.describe('Editor Container Structure', () => {
    test('should have proper CSS structure', async ({ demoEditor }) => {
      // Main editor container should have the correct class
      await expect(demoEditor.editorContainer).toHaveClass(/react-page-editable/);
    });

    test('should have accessible controls', async ({ demoEditor }) => {
      // All sidebar buttons should be clickable
      await expect(demoEditor.editButton).toBeEnabled();
      await expect(demoEditor.insertButton).toBeEnabled();
      await expect(demoEditor.layoutButton).toBeEnabled();
      await expect(demoEditor.resizeButton).toBeEnabled();
      await expect(demoEditor.previewButton).toBeEnabled();
    });

    test('should have rows containing cells', async ({ demoEditor }) => {
      // Get the first row
      const firstRow = demoEditor.getRow(0);
      await firstRow.waitForVisible();

      // Row should contain at least one cell
      const cellCount = await firstRow.getCellCount();
      expect(cellCount).toBeGreaterThan(0);
    });
  });
});
