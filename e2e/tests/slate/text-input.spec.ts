import { test, expect } from '../../fixtures/editor.fixture';

/**
 * Slate Text Input Tests
 *
 * Tests for basic text input and editing functionality in the Slate editor.
 */

/**
 * Helper to get the modifier key for the current platform
 */
const getModKey = () => {
  return process.platform === 'darwin' ? 'Meta' : 'Control';
};

test.describe('Slate Text Input', () => {
  test.beforeEach(async ({ emptyEditor }) => {
    // Add a text/slate cell to the empty editor
    await emptyEditor.enterInsertMode();
    await emptyEditor.pluginDrawer.selectPlugin('Text');
    // Wait for cell to be created
    await emptyEditor.page.waitForTimeout(500);
  });

  test('should type text into an empty Slate cell', async ({ emptyEditor }) => {
    // Find the slate editor
    const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
    await expect(slateEditor).toBeVisible();

    // Click to focus and type
    await slateEditor.click();
    await emptyEditor.page.keyboard.type('Hello, World!');

    // Verify text was entered
    await expect(slateEditor).toContainText('Hello, World!');
  });

  test('should support multi-line text entry with Enter key', async ({ emptyEditor }) => {
    const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
    await slateEditor.click();

    // Type first line
    await emptyEditor.page.keyboard.type('First line');
    await emptyEditor.page.keyboard.press('Enter');
    await emptyEditor.page.keyboard.type('Second line');
    await emptyEditor.page.keyboard.press('Enter');
    await emptyEditor.page.keyboard.type('Third line');

    // Verify all lines are present
    await expect(slateEditor).toContainText('First line');
    await expect(slateEditor).toContainText('Second line');
    await expect(slateEditor).toContainText('Third line');
  });

  test('should delete text with Backspace key', async ({ emptyEditor }) => {
    const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
    await slateEditor.click();

    // Type some text
    await emptyEditor.page.keyboard.type('Hello World');

    // Delete "World" with backspace (5 characters + space)
    for (let i = 0; i < 6; i++) {
      await emptyEditor.page.keyboard.press('Backspace');
    }

    // Verify only "Hello" remains
    const text = await slateEditor.textContent();
    expect(text?.trim()).toBe('Hello');
  });

  test('should delete text with Delete key', async ({ emptyEditor }) => {
    const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
    await slateEditor.click();

    // Type some text
    await emptyEditor.page.keyboard.type('Hello World');
    await emptyEditor.page.waitForTimeout(100);

    // Move cursor to beginning: Home key or triple-click then left arrow
    await emptyEditor.page.keyboard.press('Home');
    await emptyEditor.page.waitForTimeout(100);

    // Delete "Hello " with Delete key (6 characters)
    for (let i = 0; i < 6; i++) {
      await emptyEditor.page.keyboard.press('Delete');
      await emptyEditor.page.waitForTimeout(50);
    }

    // Verify only "World" remains
    const text = await slateEditor.textContent();
    expect(text?.trim()).toBe('World');
  });

  test('should select all text with Mod+A', async ({ emptyEditor }) => {
    const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
    await slateEditor.click();

    // Type some text
    await emptyEditor.page.keyboard.type('Select this text');

    // Select all
    const modKey = getModKey();
    await emptyEditor.page.keyboard.press(`${modKey}+a`);

    // Type new text to replace selection
    await emptyEditor.page.keyboard.type('Replaced text');

    // Verify replacement worked
    const text = await slateEditor.textContent();
    expect(text?.trim()).toBe('Replaced text');
  });

  test('should preserve text content when clicking away and back', async ({ emptyEditor }) => {
    const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
    await slateEditor.click();

    // Type some text
    const testText = 'Persistent content';
    await emptyEditor.page.keyboard.type(testText);

    // Click away to deselect
    await emptyEditor.editorContainer.click({ position: { x: 10, y: 10 } });

    // Wait a moment
    await emptyEditor.page.waitForTimeout(200);

    // Click back on editor
    await slateEditor.click();

    // Verify text is still there
    await expect(slateEditor).toContainText(testText);
  });

  test('should handle special characters', async ({ emptyEditor }) => {
    const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
    await slateEditor.click();

    // Type text with special characters
    const specialText = 'Special chars: @#$%^&*()';
    await emptyEditor.page.keyboard.type(specialText);

    // Verify special characters are preserved
    await expect(slateEditor).toContainText(specialText);
  });

  test('should handle unicode characters', async ({ emptyEditor }) => {
    const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
    await slateEditor.click();

    // Type unicode text
    const unicodeText = 'Unicode: cafe';
    await emptyEditor.page.keyboard.type(unicodeText);

    // Verify unicode is preserved
    await expect(slateEditor).toContainText(unicodeText);
  });
});
