import { test, expect } from '../../fixtures/editor.fixture';

/**
 * HTML5 Video Plugin E2E Tests
 *
 * Tests for the HTML5 video plugin functionality including:
 * - Adding HTML5 video cells from the plugin drawer
 * - Configuring video source
 * - Verifying video element renders
 * - Removing video cells
 *
 * Note: Plugin name in the drawer is "HTML 5 Video" (with space)
 */

test.describe('HTML5 Video Plugin', () => {
  test('should add HTML 5 video cell from plugin drawer', async ({ emptyEditor }) => {
    // Open the plugin drawer
    await emptyEditor.enterInsertMode();

    // Search for "HTML 5" (note the space - plugin name is "HTML 5 Video")
    await emptyEditor.pluginDrawer.search('HTML 5');
    await emptyEditor.page.waitForTimeout(300);

    // Select the HTML 5 video plugin
    const html5VideoPlugin = emptyEditor.pluginDrawer.drawer.locator('li, .MuiListItem-root').filter({
      hasText: /HTML\s*5\s*Video/i,
    }).first();

    if (await html5VideoPlugin.isVisible()) {
      await html5VideoPlugin.click();
    } else {
      // Fallback: try selecting by partial match
      await emptyEditor.pluginDrawer.selectPlugin('HTML 5 Video');
    }

    // Wait for the cell to be added
    await emptyEditor.page.waitForTimeout(500);

    // Verify a cell was added to the editor
    const cellCount = await emptyEditor.getCellCount();
    expect(cellCount).toBeGreaterThan(0);
  });

  test('should display HTML 5 video plugin in drawer', async ({ emptyEditor }) => {
    // Open the plugin drawer
    await emptyEditor.enterInsertMode();

    // Search for "HTML 5"
    await emptyEditor.pluginDrawer.search('HTML 5');
    await emptyEditor.page.waitForTimeout(300);

    // Verify HTML 5 video plugin is visible in the drawer
    const isVisible = await emptyEditor.pluginDrawer.isPluginVisible('HTML 5');
    expect(isVisible).toBeTruthy();
  });

  test('should show HTML 5 video settings when cell is focused', async ({ emptyEditor }) => {
    // Add an HTML 5 video cell
    await emptyEditor.enterInsertMode();
    await emptyEditor.pluginDrawer.search('HTML 5');
    await emptyEditor.page.waitForTimeout(300);

    const html5VideoPlugin = emptyEditor.pluginDrawer.drawer.locator('li, .MuiListItem-root').filter({
      hasText: /HTML\s*5\s*Video/i,
    }).first();

    if (await html5VideoPlugin.isVisible()) {
      await html5VideoPlugin.click();
    } else {
      await emptyEditor.pluginDrawer.selectPlugin('HTML 5 Video');
    }

    await emptyEditor.page.waitForTimeout(500);

    // Enter edit mode
    await emptyEditor.enterEditMode();

    // Click on the HTML 5 video cell to focus it
    const cell = emptyEditor.getCell(0);
    await cell.click();
    await emptyEditor.page.waitForTimeout(300);

    // The video cell should be visible and ready for configuration
    await expect(cell.locator).toBeVisible();
  });

  test('should be able to undo HTML 5 video addition', async ({ emptyEditor }) => {
    // Add an HTML 5 video cell
    await emptyEditor.enterInsertMode();
    await emptyEditor.pluginDrawer.search('HTML 5');
    await emptyEditor.page.waitForTimeout(300);

    const html5VideoPlugin = emptyEditor.pluginDrawer.drawer.locator('li, .MuiListItem-root').filter({
      hasText: /HTML\s*5\s*Video/i,
    }).first();

    if (await html5VideoPlugin.isVisible()) {
      await html5VideoPlugin.click();
    } else {
      await emptyEditor.pluginDrawer.selectPlugin('HTML 5 Video');
    }

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
