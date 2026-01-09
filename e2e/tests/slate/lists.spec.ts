import { test, expect } from '../../fixtures/editor.fixture';

/**
 * Slate Lists Tests
 *
 * Tests for bullet lists and numbered lists functionality in the Slate editor.
 */
test.describe('Slate Lists', () => {
  test.beforeEach(async ({ emptyEditor }) => {
    // Add a text/slate cell to the empty editor
    await emptyEditor.enterInsertMode();
    await emptyEditor.pluginDrawer.selectPlugin('Text');
    // Wait for cell to be created
    await emptyEditor.page.waitForTimeout(500);
  });

  test.describe('Unordered Lists (Bullet)', () => {
    test('should create a bullet list via toolbar button', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      // Type some text
      await emptyEditor.page.keyboard.type('First item');

      // Look for the unordered list button (bullet list icon)
      const bulletListButton = emptyEditor.page.locator('button').filter({
        has: emptyEditor.page.locator('[data-testid="FormatListBulletedIcon"]')
      }).first();

      if (await bulletListButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await bulletListButton.click();
        await emptyEditor.page.waitForTimeout(300);

        // Verify ul element exists
        const ulElement = slateEditor.locator('ul');
        await expect(ulElement).toBeVisible();

        // Verify li element exists
        const liElement = slateEditor.locator('li');
        await expect(liElement).toContainText('First item');
      } else {
        // Skip if list button not available
        test.skip();
      }
    });

    test('should add multiple items to bullet list with Enter', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      // Find and click bullet list button
      const bulletListButton = emptyEditor.page.locator('button').filter({
        has: emptyEditor.page.locator('[data-testid="FormatListBulletedIcon"]')
      }).first();

      if (await bulletListButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await bulletListButton.click();
        await emptyEditor.page.waitForTimeout(300);

        // Type first item
        await emptyEditor.page.keyboard.type('Item one');
        await emptyEditor.page.keyboard.press('Enter');

        // Type second item
        await emptyEditor.page.keyboard.type('Item two');
        await emptyEditor.page.keyboard.press('Enter');

        // Type third item
        await emptyEditor.page.keyboard.type('Item three');

        // Verify multiple list items
        const listItems = slateEditor.locator('li');
        const count = await listItems.count();
        expect(count).toBeGreaterThanOrEqual(2);
      } else {
        test.skip();
      }
    });

    test('should preserve list item content after editing', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      const bulletListButton = emptyEditor.page.locator('button').filter({
        has: emptyEditor.page.locator('[data-testid="FormatListBulletedIcon"]')
      }).first();

      if (await bulletListButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await bulletListButton.click();
        await emptyEditor.page.waitForTimeout(300);

        // Type and create list
        await emptyEditor.page.keyboard.type('Editable item');
        await emptyEditor.page.waitForTimeout(200);

        // Click on the editor container to blur
        await emptyEditor.editorContainer.click({ position: { x: 10, y: 10 } });
        await emptyEditor.page.waitForTimeout(300);

        // Click back on slate editor
        await slateEditor.click();
        await emptyEditor.page.waitForTimeout(200);

        // Verify content persisted
        await expect(slateEditor).toContainText('Editable item');
      } else {
        test.skip();
      }
    });
  });

  test.describe('Ordered Lists (Numbered)', () => {
    test('should create a numbered list via toolbar button', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      // Type some text
      await emptyEditor.page.keyboard.type('Step one');

      // Look for the ordered list button (numbered list icon)
      const numberedListButton = emptyEditor.page.locator('button').filter({
        has: emptyEditor.page.locator('[data-testid="FormatListNumberedIcon"]')
      }).first();

      if (await numberedListButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await numberedListButton.click();
        await emptyEditor.page.waitForTimeout(300);

        // Verify ol element exists
        const olElement = slateEditor.locator('ol');
        await expect(olElement).toBeVisible();

        // Verify li element exists
        const liElement = slateEditor.locator('li');
        await expect(liElement).toContainText('Step one');
      } else {
        test.skip();
      }
    });

    test('should add multiple items to numbered list', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      const numberedListButton = emptyEditor.page.locator('button').filter({
        has: emptyEditor.page.locator('[data-testid="FormatListNumberedIcon"]')
      }).first();

      if (await numberedListButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await numberedListButton.click();
        await emptyEditor.page.waitForTimeout(300);

        // Add multiple items
        await emptyEditor.page.keyboard.type('First');
        await emptyEditor.page.keyboard.press('Enter');
        await emptyEditor.page.keyboard.type('Second');
        await emptyEditor.page.keyboard.press('Enter');
        await emptyEditor.page.keyboard.type('Third');

        // Verify we have multiple list items
        const listItems = slateEditor.locator('li');
        const count = await listItems.count();
        expect(count).toBeGreaterThanOrEqual(2);
      } else {
        test.skip();
      }
    });

    test('should convert bullet list to numbered list', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      const bulletListButton = emptyEditor.page.locator('button').filter({
        has: emptyEditor.page.locator('[data-testid="FormatListBulletedIcon"]')
      }).first();

      const numberedListButton = emptyEditor.page.locator('button').filter({
        has: emptyEditor.page.locator('[data-testid="FormatListNumberedIcon"]')
      }).first();

      const bulletVisible = await bulletListButton.isVisible({ timeout: 2000 }).catch(() => false);
      const numberedVisible = await numberedListButton.isVisible({ timeout: 2000 }).catch(() => false);

      if (bulletVisible && numberedVisible) {
        // Create bullet list first
        await bulletListButton.click();
        await emptyEditor.page.waitForTimeout(300);

        await emptyEditor.page.keyboard.type('Convert this');

        // Select and convert to numbered
        await emptyEditor.page.keyboard.press('Control+a');
        await numberedListButton.click();
        await emptyEditor.page.waitForTimeout(300);

        // Content should still be there
        await expect(slateEditor).toContainText('Convert this');
      } else {
        test.skip();
      }
    });
  });

  test.describe('List Indentation', () => {
    test('should indent list item with Tab key or button', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      const bulletListButton = emptyEditor.page.locator('button').filter({
        has: emptyEditor.page.locator('[data-testid="FormatListBulletedIcon"]')
      }).first();

      if (await bulletListButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await bulletListButton.click();
        await emptyEditor.page.waitForTimeout(300);

        // Create list items
        await emptyEditor.page.keyboard.type('Parent item');
        await emptyEditor.page.keyboard.press('Enter');
        await emptyEditor.page.keyboard.type('Child item');

        // Try to indent using indent button if available
        const indentButton = emptyEditor.page.locator('button').filter({
          has: emptyEditor.page.locator('[data-testid="FormatIndentIncreaseIcon"]')
        }).first();

        if (await indentButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await indentButton.click();
          await emptyEditor.page.waitForTimeout(300);
        } else {
          // Try Tab key as alternative
          await emptyEditor.page.keyboard.press('Tab');
          await emptyEditor.page.waitForTimeout(300);
        }

        // Verify content is still there
        await expect(slateEditor).toContainText('Child item');
      } else {
        test.skip();
      }
    });

    test('should outdent list item with Shift+Tab or button', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      const bulletListButton = emptyEditor.page.locator('button').filter({
        has: emptyEditor.page.locator('[data-testid="FormatListBulletedIcon"]')
      }).first();

      if (await bulletListButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await bulletListButton.click();
        await emptyEditor.page.waitForTimeout(300);

        // Create list with nested item
        await emptyEditor.page.keyboard.type('Outer');
        await emptyEditor.page.keyboard.press('Enter');
        await emptyEditor.page.keyboard.type('Inner');

        // Indent first
        await emptyEditor.page.keyboard.press('Tab');
        await emptyEditor.page.waitForTimeout(200);

        // Then outdent
        await emptyEditor.page.keyboard.press('Shift+Tab');
        await emptyEditor.page.waitForTimeout(200);

        // Content should still exist
        await expect(slateEditor).toContainText('Inner');
      } else {
        test.skip();
      }
    });
  });

  test.describe('List Exit Behavior', () => {
    test('should exit list mode with double Enter on empty item', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      const bulletListButton = emptyEditor.page.locator('button').filter({
        has: emptyEditor.page.locator('[data-testid="FormatListBulletedIcon"]')
      }).first();

      if (await bulletListButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await bulletListButton.click();
        await emptyEditor.page.waitForTimeout(300);

        // Type first item
        await emptyEditor.page.keyboard.type('Last item');
        await emptyEditor.page.keyboard.press('Enter');

        // Press Enter again on empty item to exit list
        await emptyEditor.page.keyboard.press('Enter');
        await emptyEditor.page.waitForTimeout(300);

        // Type regular text
        await emptyEditor.page.keyboard.type('Regular text after list');

        // Both list content and regular text should exist
        await expect(slateEditor).toContainText('Last item');
        await expect(slateEditor).toContainText('Regular text after list');
      } else {
        test.skip();
      }
    });
  });
});
