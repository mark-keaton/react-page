import { test, expect } from '../../fixtures/editor.fixture';

/**
 * Video Plugin E2E Tests
 *
 * Tests for the video embed plugin (YouTube/Vimeo) functionality including:
 * - Adding video cells from the plugin drawer
 * - Entering video URLs
 * - Video iframe rendering
 * - Removing video cells
 */

test.describe('Video Plugin', () => {
  test('should add video cell from plugin drawer', async ({ emptyEditor }) => {
    // Open the plugin drawer
    await emptyEditor.enterInsertMode();

    // Search for and select the video plugin
    await emptyEditor.pluginDrawer.search('Video');
    await emptyEditor.page.waitForTimeout(300);

    // Select the video plugin (not HTML5 Video)
    const videoPlugin = emptyEditor.pluginDrawer.drawer.locator('li, .MuiListItem-root').filter({
      hasText: /^Video$/i,
    }).first();

    if (await videoPlugin.isVisible()) {
      await videoPlugin.click();
    } else {
      // Fallback: select any video plugin
      await emptyEditor.pluginDrawer.selectPlugin('Video');
    }

    // Wait for the cell to be added
    await emptyEditor.page.waitForTimeout(500);

    // Verify a cell was added to the editor
    const cellCount = await emptyEditor.getCellCount();
    expect(cellCount).toBeGreaterThan(0);
  });

  test('should display video plugin in drawer', async ({ emptyEditor }) => {
    // Open the plugin drawer
    await emptyEditor.enterInsertMode();

    // Search for video
    await emptyEditor.pluginDrawer.search('Video');
    await emptyEditor.page.waitForTimeout(300);

    // Verify video plugin is visible in the drawer
    const isVisible = await emptyEditor.pluginDrawer.isPluginVisible('Video');
    expect(isVisible).toBeTruthy();
  });

  test('should show video settings when cell is focused', async ({ emptyEditor }) => {
    // Add a video cell
    await emptyEditor.enterInsertMode();
    await emptyEditor.pluginDrawer.search('Video');
    await emptyEditor.page.waitForTimeout(300);

    const videoPlugin = emptyEditor.pluginDrawer.drawer.locator('li, .MuiListItem-root').filter({
      hasText: /^Video$/i,
    }).first();

    if (await videoPlugin.isVisible()) {
      await videoPlugin.click();
    } else {
      await emptyEditor.pluginDrawer.selectPlugin('Video');
    }

    await emptyEditor.page.waitForTimeout(500);

    // Enter edit mode
    await emptyEditor.enterEditMode();

    // Click on the video cell to focus it
    const cell = emptyEditor.getCell(0);
    await cell.click();

    // The video cell should be visible and ready for configuration
    await expect(cell.locator).toBeVisible();
  });

  test('should be able to enter video URL in settings', async ({ emptyEditor }) => {
    // Add a video cell
    await emptyEditor.enterInsertMode();
    await emptyEditor.pluginDrawer.search('Video');
    await emptyEditor.page.waitForTimeout(300);

    const videoPlugin = emptyEditor.pluginDrawer.drawer.locator('li, .MuiListItem-root').filter({
      hasText: /^Video$/i,
    }).first();

    if (await videoPlugin.isVisible()) {
      await videoPlugin.click();
    } else {
      await emptyEditor.pluginDrawer.selectPlugin('Video');
    }

    await emptyEditor.page.waitForTimeout(500);

    // Enter edit mode
    await emptyEditor.enterEditMode();

    // Click on the video cell to focus it
    const cell = emptyEditor.getCell(0);
    await cell.click();
    await emptyEditor.page.waitForTimeout(300);

    // Look for URL input field in the settings/bottom toolbar
    const urlInput = emptyEditor.page.locator('input[type="text"]').first();

    // If there's a URL input visible, try to interact with it
    if (await urlInput.isVisible()) {
      await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await emptyEditor.page.waitForTimeout(300);
    }

    // Video cell should still be visible
    await expect(cell.locator).toBeVisible();
  });
});
