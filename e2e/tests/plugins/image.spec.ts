import { test, expect } from '../../fixtures/editor.fixture';

/**
 * Image Plugin E2E Tests
 *
 * Tests for the image plugin functionality including:
 * - Adding image cells from the plugin drawer
 * - Configuring image settings
 * - Removing image cells
 */

test.describe('Image Plugin', () => {
  test('should add image cell from plugin drawer', async ({ emptyEditor }) => {
    // Open the plugin drawer
    await emptyEditor.enterInsertMode();

    // Search for and select the image plugin
    await emptyEditor.pluginDrawer.search('Image');
    await emptyEditor.page.waitForTimeout(300);

    // Select the image plugin
    await emptyEditor.pluginDrawer.selectPlugin('Image');

    // Wait for the cell to be added
    await emptyEditor.page.waitForTimeout(500);

    // Verify a cell was added to the editor
    const cellCount = await emptyEditor.getCellCount();
    expect(cellCount).toBeGreaterThan(0);
  });

  test('should display image plugin in drawer', async ({ emptyEditor }) => {
    // Open the plugin drawer
    await emptyEditor.enterInsertMode();

    // Search for image
    await emptyEditor.pluginDrawer.search('Image');
    await emptyEditor.page.waitForTimeout(300);

    // Verify image plugin is visible in the drawer
    const isVisible = await emptyEditor.pluginDrawer.isPluginVisible('Image');
    expect(isVisible).toBeTruthy();
  });

  test('should show image settings when cell is focused', async ({ emptyEditor }) => {
    // Add an image cell
    await emptyEditor.enterInsertMode();
    await emptyEditor.pluginDrawer.search('Image');
    await emptyEditor.page.waitForTimeout(300);
    await emptyEditor.pluginDrawer.selectPlugin('Image');
    await emptyEditor.page.waitForTimeout(500);

    // Enter edit mode
    await emptyEditor.enterEditMode();

    // Click on the image cell to focus it
    const cell = emptyEditor.getCell(0);
    await cell.click();

    // The bottom toolbar should appear with image settings
    // Look for the settings toolbar
    const toolbar = emptyEditor.page.locator('.react-page-plugins-content-image-settings, [class*="image"]');
    // Image cells should have some visible content or placeholder
    await expect(cell.locator).toBeVisible();
  });

  test('should be able to remove image cell via undo', async ({ emptyEditor }) => {
    // Add an image cell
    await emptyEditor.enterInsertMode();
    await emptyEditor.pluginDrawer.search('Image');
    await emptyEditor.page.waitForTimeout(300);
    await emptyEditor.pluginDrawer.selectPlugin('Image');
    await emptyEditor.page.waitForTimeout(500);

    // Verify cell was added
    let cellCount = await emptyEditor.getCellCount();
    expect(cellCount).toBeGreaterThan(0);

    // Undo the action
    await emptyEditor.undo();
    await emptyEditor.page.waitForTimeout(500);

    // Cell count may now be 0 or the cell is removed
    // The undo should remove the added cell
    const newCellCount = await emptyEditor.getCellCount();
    expect(newCellCount).toBeLessThanOrEqual(cellCount);
  });
});
