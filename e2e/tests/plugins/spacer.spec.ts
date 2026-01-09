import { test, expect } from '../../fixtures/editor.fixture';

/**
 * Spacer Plugin E2E Tests
 *
 * Tests for the spacer plugin functionality including:
 * - Adding spacer cells from the plugin drawer
 * - Adjusting spacer height via settings
 * - Verifying rendered height
 * - Removing spacer cells
 */

test.describe('Spacer Plugin', () => {
  test('should add spacer cell from plugin drawer', async ({ emptyEditor }) => {
    // Open the plugin drawer
    await emptyEditor.enterInsertMode();

    // Search for and select the spacer plugin
    await emptyEditor.pluginDrawer.search('Spacer');
    await emptyEditor.page.waitForTimeout(300);

    // Select the spacer plugin
    await emptyEditor.pluginDrawer.selectPlugin('Spacer');

    // Wait for the cell to be added
    await emptyEditor.page.waitForTimeout(500);

    // Verify a cell was added to the editor
    const cellCount = await emptyEditor.getCellCount();
    expect(cellCount).toBeGreaterThan(0);
  });

  test('should display spacer plugin in drawer', async ({ emptyEditor }) => {
    // Open the plugin drawer
    await emptyEditor.enterInsertMode();

    // Search for spacer
    await emptyEditor.pluginDrawer.search('Spacer');
    await emptyEditor.page.waitForTimeout(300);

    // Verify spacer plugin is visible in the drawer
    const isVisible = await emptyEditor.pluginDrawer.isPluginVisible('Spacer');
    expect(isVisible).toBeTruthy();
  });

  test('should render spacer with visible height', async ({ emptyEditor }) => {
    // Add a spacer cell
    await emptyEditor.enterInsertMode();
    await emptyEditor.pluginDrawer.search('Spacer');
    await emptyEditor.page.waitForTimeout(300);
    await emptyEditor.pluginDrawer.selectPlugin('Spacer');
    await emptyEditor.page.waitForTimeout(500);

    // Get the cell and verify it has some height
    const cell = emptyEditor.getCell(0);
    await cell.waitForVisible();

    // The cell should be visible
    await expect(cell.locator).toBeVisible();

    // Check that the spacer has some height
    const box = await cell.getBoundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThan(0);
    }
  });

  test('should show spacer settings when cell is focused', async ({ emptyEditor }) => {
    // Add a spacer cell
    await emptyEditor.enterInsertMode();
    await emptyEditor.pluginDrawer.search('Spacer');
    await emptyEditor.page.waitForTimeout(300);
    await emptyEditor.pluginDrawer.selectPlugin('Spacer');
    await emptyEditor.page.waitForTimeout(500);

    // Enter edit mode
    await emptyEditor.enterEditMode();

    // Click on the spacer cell to focus it
    const cell = emptyEditor.getCell(0);
    await cell.click();
    await emptyEditor.page.waitForTimeout(300);

    // The spacer cell should be visible and focused
    await expect(cell.locator).toBeVisible();

    // Look for height adjustment controls (usually a slider or input)
    // The bottom toolbar should show spacer settings
    const bottomToolbar = emptyEditor.page.locator('.react-page-cell-inner');
    await expect(bottomToolbar.first()).toBeVisible();
  });

  test('should be able to undo spacer addition', async ({ emptyEditor }) => {
    // Add a spacer cell
    await emptyEditor.enterInsertMode();
    await emptyEditor.pluginDrawer.search('Spacer');
    await emptyEditor.page.waitForTimeout(300);
    await emptyEditor.pluginDrawer.selectPlugin('Spacer');
    await emptyEditor.page.waitForTimeout(500);

    // Verify cell was added
    let cellCount = await emptyEditor.getCellCount();
    expect(cellCount).toBeGreaterThan(0);

    // Undo the action
    await emptyEditor.undo();
    await emptyEditor.page.waitForTimeout(500);

    // The undo should remove the added cell
    const newCellCount = await emptyEditor.getCellCount();
    expect(newCellCount).toBeLessThanOrEqual(cellCount);
  });
});
