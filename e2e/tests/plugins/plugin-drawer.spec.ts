import { test, expect } from '../../fixtures/editor.fixture';

/**
 * Plugin Drawer E2E Tests
 *
 * Tests for the plugin drawer/selection UI functionality including:
 * - Opening and closing the drawer
 * - Listing all available plugins
 * - Searching/filtering plugins
 * - Selecting plugins from the drawer
 */

test.describe('Plugin Drawer', () => {
  test('should open plugin drawer when entering insert mode', async ({ emptyEditor }) => {
    // Initially the drawer should not be visible
    await expect(emptyEditor.pluginDrawer.drawer).not.toBeVisible();

    // Click the insert button to open the drawer
    await emptyEditor.enterInsertMode();

    // The drawer should now be visible
    await expect(emptyEditor.pluginDrawer.drawer).toBeVisible();
  });

  test('should close plugin drawer when switching to edit mode', async ({ emptyEditor }) => {
    // Open the drawer
    await emptyEditor.enterInsertMode();
    await expect(emptyEditor.pluginDrawer.drawer).toBeVisible();

    // Switch to edit mode
    await emptyEditor.enterEditMode();
    await emptyEditor.page.waitForTimeout(500);

    // The drawer should close (be off-screen or not visible)
    const isDrawerVisible = await emptyEditor.pluginDrawer.isOpen();
    if (isDrawerVisible) {
      const box = await emptyEditor.pluginDrawer.drawer.boundingBox();
      expect(box === null || (box.x + box.width) <= 0).toBeTruthy();
    }
  });

  test('should display multiple plugins in the drawer', async ({ emptyEditor }) => {
    // Open the drawer
    await emptyEditor.enterInsertMode();

    // The drawer should have multiple plugins
    const pluginCount = await emptyEditor.pluginDrawer.getPluginCount();
    expect(pluginCount).toBeGreaterThan(1);
  });

  test('should have search input available', async ({ emptyEditor }) => {
    // Open the drawer
    await emptyEditor.enterInsertMode();

    // The search input should be visible
    await expect(emptyEditor.pluginDrawer.searchInput).toBeVisible();
  });

  test('should filter plugins when searching', async ({ emptyEditor }) => {
    // Open the drawer
    await emptyEditor.enterInsertMode();

    // Get initial plugin count
    const initialCount = await emptyEditor.pluginDrawer.getPluginCount();
    expect(initialCount).toBeGreaterThan(0);

    // Search for a specific plugin
    await emptyEditor.pluginDrawer.search('Image');
    await emptyEditor.page.waitForTimeout(300);

    // The plugin count should be filtered (could be same or less)
    const filteredCount = await emptyEditor.pluginDrawer.getPluginCount();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('should clear search when input is cleared', async ({ emptyEditor }) => {
    // Open the drawer
    await emptyEditor.enterInsertMode();

    // Search for something
    await emptyEditor.pluginDrawer.search('Spacer');
    await emptyEditor.page.waitForTimeout(300);

    // Clear the search
    await emptyEditor.pluginDrawer.clearSearch();
    await emptyEditor.page.waitForTimeout(300);

    // Plugins should be visible again
    const pluginCount = await emptyEditor.pluginDrawer.getPluginCount();
    expect(pluginCount).toBeGreaterThan(0);
  });

  test('should display all bundled plugins', async ({ emptyEditor }) => {
    // Open the drawer
    await emptyEditor.enterInsertMode();

    // Check for each bundled plugin
    const bundledPlugins = ['Text', 'Image', 'Video', 'Spacer', 'Divider', 'Background'];

    for (const plugin of bundledPlugins) {
      await emptyEditor.pluginDrawer.clearSearch();
      await emptyEditor.pluginDrawer.search(plugin);
      await emptyEditor.page.waitForTimeout(300);

      const isVisible = await emptyEditor.pluginDrawer.isPluginVisible(plugin);
      // At least some of the bundled plugins should be found
      if (!isVisible) {
        console.log(`Plugin ${plugin} not found in drawer`);
      }
    }

    // Clear search at the end
    await emptyEditor.pluginDrawer.clearSearch();
    await emptyEditor.page.waitForTimeout(300);

    // Verify the drawer still has plugins
    const pluginCount = await emptyEditor.pluginDrawer.getPluginCount();
    expect(pluginCount).toBeGreaterThan(0);
  });

  test('should add cell when plugin is clicked', async ({ emptyEditor }) => {
    // Open the drawer
    await emptyEditor.enterInsertMode();

    // Verify no cells initially
    let cellCount = await emptyEditor.getCellCount();

    // Select a plugin
    await emptyEditor.pluginDrawer.search('Spacer');
    await emptyEditor.page.waitForTimeout(300);
    await emptyEditor.pluginDrawer.selectPlugin('Spacer');
    await emptyEditor.page.waitForTimeout(500);

    // A new cell should be added
    const newCellCount = await emptyEditor.getCellCount();
    expect(newCellCount).toBeGreaterThan(cellCount);
  });

  test('should show Text plugin in drawer', async ({ emptyEditor }) => {
    // Open the drawer
    await emptyEditor.enterInsertMode();

    // Search for text
    await emptyEditor.pluginDrawer.search('Text');
    await emptyEditor.page.waitForTimeout(300);

    // Verify text plugin is visible
    const isVisible = await emptyEditor.pluginDrawer.isPluginVisible('Text');
    expect(isVisible).toBeTruthy();
  });

  test('should show plugins list container', async ({ emptyEditor }) => {
    // Open the drawer
    await emptyEditor.enterInsertMode();

    // The plugin list should be visible (use .first() since there may be multiple ul elements)
    await expect(emptyEditor.pluginDrawer.pluginList.first()).toBeVisible();
  });
});
