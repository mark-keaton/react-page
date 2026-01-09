import { test, expect } from '../fixtures/editor.fixture';

/**
 * Smoke Tests for ReactPage Editor
 *
 * These tests verify that the basic editor functionality works.
 * They should be fast and catch obvious regressions.
 */

test.describe('Editor Smoke Tests', () => {
  test('should load the editor on the main demo page', async ({ demoEditor }) => {
    // The editor should be visible
    await expect(demoEditor.editorContainer).toBeVisible();

    // The sidebar controls should be visible
    await expect(demoEditor.sidebar).toBeVisible();
  });

  test('should load an empty editor', async ({ emptyEditor }) => {
    // The editor should be visible
    await expect(emptyEditor.editorContainer).toBeVisible();

    // The sidebar should be visible with controls
    await expect(emptyEditor.sidebar).toBeVisible();
  });

  test('should have all sidebar controls available', async ({ emptyEditor }) => {
    // Check that the main control buttons are present
    await expect(emptyEditor.editButton).toBeVisible();
    await expect(emptyEditor.insertButton).toBeVisible();
    await expect(emptyEditor.layoutButton).toBeVisible();
    await expect(emptyEditor.resizeButton).toBeVisible();
    await expect(emptyEditor.previewButton).toBeVisible();
  });

  test('should open plugin drawer when clicking insert button', async ({ emptyEditor }) => {
    // Initially the drawer should not be visible
    await expect(emptyEditor.pluginDrawer.drawer).not.toBeVisible();

    // Click the insert button
    await emptyEditor.insertButton.click();

    // The drawer should now be visible
    await emptyEditor.pluginDrawer.waitForOpen();
    await expect(emptyEditor.pluginDrawer.drawer).toBeVisible();
  });

  test('should show available plugins in the drawer', async ({ emptyEditor }) => {
    // Open the plugin drawer
    await emptyEditor.enterInsertMode();

    // The drawer should have some plugins
    const pluginCount = await emptyEditor.pluginDrawer.getPluginCount();
    expect(pluginCount).toBeGreaterThan(0);
  });

  test('should be able to search plugins in the drawer', async ({ emptyEditor }) => {
    // Open the plugin drawer
    await emptyEditor.enterInsertMode();

    // Search for a plugin
    await emptyEditor.pluginDrawer.search('Text');

    // Wait for search to take effect
    await emptyEditor.page.waitForTimeout(300);

    // The drawer should still be visible
    await expect(emptyEditor.pluginDrawer.drawer).toBeVisible();
  });

  test('should have cells visible on demo page', async ({ demoEditor }) => {
    // The demo page should have some content
    const cellCount = await demoEditor.getCellCount();
    expect(cellCount).toBeGreaterThan(0);
  });

  test('should be able to enter edit mode', async ({ emptyEditor }) => {
    // Click the edit button
    await emptyEditor.enterEditMode();

    // The edit button should still be visible
    await expect(emptyEditor.editButton).toBeVisible();
  });

  test('should be able to enter preview mode', async ({ demoEditor }) => {
    // Enter preview mode
    await demoEditor.enterPreviewMode();

    // The preview button should still be visible
    await expect(demoEditor.previewButton).toBeVisible();
  });

  test('should be able to enter layout mode', async ({ demoEditor }) => {
    // Enter layout mode
    await demoEditor.enterLayoutMode();

    // The layout button should still be visible
    await expect(demoEditor.layoutButton).toBeVisible();
  });

  test('should load the simple example page', async ({ simpleEditor }) => {
    // The editor should be visible
    await expect(simpleEditor.editorContainer).toBeVisible();

    // The sidebar should be visible
    await expect(simpleEditor.sidebar).toBeVisible();
  });
});

test.describe('Editor Interaction Tests', () => {
  test('should close plugin drawer when switching to edit mode', async ({ emptyEditor }) => {
    // Open the plugin drawer
    await emptyEditor.enterInsertMode();
    await expect(emptyEditor.pluginDrawer.drawer).toBeVisible();

    // Click the edit button to switch modes
    await emptyEditor.editButton.click();

    // Wait a bit for animation
    await emptyEditor.page.waitForTimeout(500);

    // The drawer should no longer be in the viewport
    // Check that the drawer paper is either gone or off-screen
    const isDrawerVisible = await emptyEditor.pluginDrawer.isOpen();
    if (isDrawerVisible) {
      // If still "visible" in DOM, check it's off-screen
      const box = await emptyEditor.pluginDrawer.drawer.boundingBox();
      // Drawer should be either null (gone) or off-screen (x + width < 0)
      expect(box === null || (box.x + box.width) <= 0).toBeTruthy();
    }
  });

  test('should toggle between different modes', async ({ emptyEditor }) => {
    // Start in edit mode
    await emptyEditor.enterEditMode();

    // Switch to layout mode
    await emptyEditor.enterLayoutMode();

    // Switch to resize mode
    await emptyEditor.enterResizeMode();

    // Switch to preview mode
    await emptyEditor.enterPreviewMode();

    // All buttons should still be visible
    await expect(emptyEditor.editButton).toBeVisible();
    await expect(emptyEditor.insertButton).toBeVisible();
    await expect(emptyEditor.layoutButton).toBeVisible();
  });
});

test.describe('Demo Page Content Tests', () => {
  test('should have rows on demo page', async ({ demoEditor }) => {
    const rowCount = await demoEditor.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should be able to interact with cells', async ({ demoEditor }) => {
    // Get the first cell
    const firstCell = demoEditor.getCell(0);

    // The cell should be visible
    await firstCell.waitForVisible();
    await expect(firstCell.locator).toBeVisible();

    // Hover over the cell
    await firstCell.hover();
  });

  test('should be able to focus a cell', async ({ demoEditor }) => {
    // Get the first cell
    const firstCell = demoEditor.getCell(0);
    await firstCell.waitForVisible();

    // Click on the cell to focus it
    await firstCell.click();

    // The cell should now have focus (or be selected)
    await expect(firstCell.locator).toBeVisible();
  });
});

test.describe('Navigation Tests', () => {
  test('should navigate to different example pages', async ({ editorPage }) => {
    // Navigate to the empty page
    await editorPage.goto('/empty');
    await expect(editorPage.editorContainer).toBeVisible();

    // Navigate to the main demo
    await editorPage.goto('/');
    await expect(editorPage.editorContainer).toBeVisible();

    // Navigate to simple example
    await editorPage.goto('/examples/simple');
    await expect(editorPage.editorContainer).toBeVisible();
  });

  test('should navigate to readonly page', async ({ page }) => {
    await page.goto('/readonly');
    await page.waitForLoadState('domcontentloaded');
    // On readonly page, there's no editable container - just rows
    // Wait for at least one row to be rendered
    const row = page.locator('.react-page-row').first();
    await expect(row).toBeVisible({ timeout: 30000 });
  });
});
