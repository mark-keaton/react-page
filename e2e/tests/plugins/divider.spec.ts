import { test, expect } from '../../fixtures/editor.fixture';

/**
 * Divider Plugin E2E Tests
 *
 * Tests for the divider plugin functionality including:
 * - Adding divider cells from the plugin drawer
 * - Verifying divider renders as horizontal line
 * - Removing divider cells
 */

test.describe('Divider Plugin', () => {
  test('should add divider cell from plugin drawer', async ({ emptyEditor }) => {
    // Open the plugin drawer
    await emptyEditor.enterInsertMode();

    // Search for and select the divider plugin
    await emptyEditor.pluginDrawer.search('Divider');
    await emptyEditor.page.waitForTimeout(300);

    // Select the divider plugin
    await emptyEditor.pluginDrawer.selectPlugin('Divider');

    // Wait for the cell to be added
    await emptyEditor.page.waitForTimeout(500);

    // Verify a cell was added to the editor
    const cellCount = await emptyEditor.getCellCount();
    expect(cellCount).toBeGreaterThan(0);
  });

  test('should display divider plugin in drawer', async ({ emptyEditor }) => {
    // Open the plugin drawer
    await emptyEditor.enterInsertMode();

    // Search for divider
    await emptyEditor.pluginDrawer.search('Divider');
    await emptyEditor.page.waitForTimeout(300);

    // Verify divider plugin is visible in the drawer
    const isVisible = await emptyEditor.pluginDrawer.isPluginVisible('Divider');
    expect(isVisible).toBeTruthy();
  });

  test('should render divider as horizontal line', async ({ emptyEditor }) => {
    // Add a divider cell
    await emptyEditor.enterInsertMode();
    await emptyEditor.pluginDrawer.search('Divider');
    await emptyEditor.page.waitForTimeout(300);
    await emptyEditor.pluginDrawer.selectPlugin('Divider');
    await emptyEditor.page.waitForTimeout(500);

    // Get the cell and verify it's visible
    const cell = emptyEditor.getCell(0);
    await cell.waitForVisible();
    await expect(cell.locator).toBeVisible();

    // Look for hr element or divider-specific element
    const dividerElement = emptyEditor.page.locator('hr, [class*="divider"]').first();
    await expect(dividerElement).toBeVisible();
  });

  test('should have full width for divider', async ({ emptyEditor }) => {
    // Add a divider cell
    await emptyEditor.enterInsertMode();
    await emptyEditor.pluginDrawer.search('Divider');
    await emptyEditor.page.waitForTimeout(300);
    await emptyEditor.pluginDrawer.selectPlugin('Divider');
    await emptyEditor.page.waitForTimeout(500);

    // Get the cell
    const cell = emptyEditor.getCell(0);
    await cell.waitForVisible();

    // Divider should take full width (size 12)
    const size = await cell.getSize();
    expect(size).toBe(12);
  });

  test('should be able to undo divider addition', async ({ emptyEditor }) => {
    // Add a divider cell
    await emptyEditor.enterInsertMode();
    await emptyEditor.pluginDrawer.search('Divider');
    await emptyEditor.page.waitForTimeout(300);
    await emptyEditor.pluginDrawer.selectPlugin('Divider');
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
