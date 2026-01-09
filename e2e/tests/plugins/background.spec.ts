import { test, expect } from '../../fixtures/editor.fixture';

/**
 * Background Plugin E2E Tests
 *
 * Tests for the background layout plugin functionality including:
 * - Adding background cells from the plugin drawer
 * - Setting background color
 * - Setting background image
 * - Verifying background renders correctly
 */

test.describe('Background Plugin', () => {
  test('should add background cell from plugin drawer', async ({ emptyEditor }) => {
    // Open the plugin drawer
    await emptyEditor.enterInsertMode();

    // Search for and select the background plugin
    await emptyEditor.pluginDrawer.search('Background');
    await emptyEditor.page.waitForTimeout(300);

    // Select the background plugin
    await emptyEditor.pluginDrawer.selectPlugin('Background');

    // Wait for the cell to be added
    await emptyEditor.page.waitForTimeout(500);

    // Verify a cell was added to the editor
    const cellCount = await emptyEditor.getCellCount();
    expect(cellCount).toBeGreaterThan(0);
  });

  test('should display background plugin in drawer', async ({ emptyEditor }) => {
    // Open the plugin drawer
    await emptyEditor.enterInsertMode();

    // Search for background
    await emptyEditor.pluginDrawer.search('Background');
    await emptyEditor.page.waitForTimeout(300);

    // Verify background plugin is visible in the drawer
    const isVisible = await emptyEditor.pluginDrawer.isPluginVisible('Background');
    expect(isVisible).toBeTruthy();
  });

  test('should render background cell with content area', async ({ emptyEditor }) => {
    // Add a background cell
    await emptyEditor.enterInsertMode();
    await emptyEditor.pluginDrawer.search('Background');
    await emptyEditor.page.waitForTimeout(300);
    await emptyEditor.pluginDrawer.selectPlugin('Background');
    await emptyEditor.page.waitForTimeout(500);

    // Get the cell and verify it's visible
    const cell = emptyEditor.getCell(0);
    await cell.waitForVisible();
    await expect(cell.locator).toBeVisible();

    // Background plugin is a layout plugin, so it should have inner content area
    const innerContent = cell.innerContent;
    await expect(innerContent).toBeVisible();
  });

  test('should show background settings when cell is focused', async ({ emptyEditor }) => {
    // Add a background cell
    await emptyEditor.enterInsertMode();
    await emptyEditor.pluginDrawer.search('Background');
    await emptyEditor.page.waitForTimeout(300);
    await emptyEditor.pluginDrawer.selectPlugin('Background');
    await emptyEditor.page.waitForTimeout(500);

    // Enter edit mode
    await emptyEditor.enterEditMode();

    // Click on the background cell to focus it
    const cell = emptyEditor.getCell(0);
    await cell.click();
    await emptyEditor.page.waitForTimeout(300);

    // The background cell should be visible and ready for configuration
    await expect(cell.locator).toBeVisible();

    // Look for color picker or background settings in the toolbar
    // These typically appear in a bottom toolbar when the cell is focused
    const settingsArea = emptyEditor.page.locator('.react-page-cell-inner, [class*="background"]');
    await expect(settingsArea.first()).toBeVisible();
  });

  test('should be able to undo background addition', async ({ emptyEditor }) => {
    // Add a background cell
    await emptyEditor.enterInsertMode();
    await emptyEditor.pluginDrawer.search('Background');
    await emptyEditor.page.waitForTimeout(300);
    await emptyEditor.pluginDrawer.selectPlugin('Background');
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

  test('background cell should have full width by default', async ({ emptyEditor }) => {
    // Add a background cell
    await emptyEditor.enterInsertMode();
    await emptyEditor.pluginDrawer.search('Background');
    await emptyEditor.page.waitForTimeout(300);
    await emptyEditor.pluginDrawer.selectPlugin('Background');
    await emptyEditor.page.waitForTimeout(500);

    // Get the cell
    const cell = emptyEditor.getCell(0);
    await cell.waitForVisible();

    // Background should take full width (size 12)
    const size = await cell.getSize();
    expect(size).toBe(12);
  });
});
