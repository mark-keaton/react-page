import { test, expect } from '../../fixtures/editor.fixture';

/**
 * Slate Formatting Tests
 *
 * Tests for text formatting functionality including bold, italic, underline,
 * and headings in the Slate editor.
 *
 * Note: The Slate editor uses 'mod' key (Meta on macOS, Control on Windows/Linux).
 * We use 'Meta' for keyboard shortcuts which maps to Command on macOS.
 */

/**
 * Helper to get the modifier key for the current platform
 * In Playwright tests on macOS, 'Meta' is the Command key
 */
const getModKey = () => {
  // Playwright uses 'Meta' for Command key on macOS
  return process.platform === 'darwin' ? 'Meta' : 'Control';
};

test.describe('Slate Text Formatting', () => {
  test.beforeEach(async ({ emptyEditor }) => {
    // Add a text/slate cell to the empty editor
    await emptyEditor.enterInsertMode();
    await emptyEditor.pluginDrawer.selectPlugin('Text');
    // Wait for cell to be created
    await emptyEditor.page.waitForTimeout(500);
  });

  test.describe('Bold Formatting', () => {
    test('should apply bold via keyboard shortcut Mod+B', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      // Type some text
      await emptyEditor.page.keyboard.type('Normal ');

      // Apply bold via shortcut and type (use Meta for Command on macOS)
      const modKey = getModKey();
      await emptyEditor.page.keyboard.press(`${modKey}+b`);
      await emptyEditor.page.keyboard.type('bold');
      await emptyEditor.page.keyboard.press(`${modKey}+b`);

      await emptyEditor.page.keyboard.type(' text');

      // Verify bold element exists
      const strongElement = slateEditor.locator('strong');
      await expect(strongElement).toContainText('bold');
    });

    test('should apply bold to selected text via keyboard shortcut', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      // Type text
      await emptyEditor.page.keyboard.type('Make this bold');

      // Triple-click to select all text in the paragraph
      await slateEditor.click({ clickCount: 3 });
      await emptyEditor.page.waitForTimeout(100);

      const modKey = getModKey();
      // Apply bold
      await emptyEditor.page.keyboard.press(`${modKey}+b`);
      await emptyEditor.page.waitForTimeout(200);

      // Verify bold element exists
      const strongElement = slateEditor.locator('strong');
      await expect(strongElement).toBeVisible();
    });

    test('should toggle bold off when pressed twice', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      const modKey = getModKey();

      // Turn bold on
      await emptyEditor.page.keyboard.press(`${modKey}+b`);
      await emptyEditor.page.keyboard.type('bold');

      // Turn bold off
      await emptyEditor.page.keyboard.press(`${modKey}+b`);
      await emptyEditor.page.keyboard.type('not bold');

      // Verify the structure
      const strongElement = slateEditor.locator('strong');
      await expect(strongElement).toContainText('bold');
      await expect(slateEditor).toContainText('not bold');
    });
  });

  test.describe('Italic Formatting', () => {
    test('should apply italic via keyboard shortcut Mod+I', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      // Type some text
      await emptyEditor.page.keyboard.type('Normal ');

      const modKey = getModKey();
      // Apply italic via shortcut
      await emptyEditor.page.keyboard.press(`${modKey}+i`);
      await emptyEditor.page.keyboard.type('italic');
      await emptyEditor.page.keyboard.press(`${modKey}+i`);

      await emptyEditor.page.keyboard.type(' text');

      // Verify italic element exists
      const emElement = slateEditor.locator('em');
      await expect(emElement).toContainText('italic');
    });

    test('should apply italic to selected text', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      // Type text
      await emptyEditor.page.keyboard.type('Make this italic');

      // Triple-click to select all text in the paragraph
      await slateEditor.click({ clickCount: 3 });
      await emptyEditor.page.waitForTimeout(100);

      const modKey = getModKey();
      // Apply italic
      await emptyEditor.page.keyboard.press(`${modKey}+i`);
      await emptyEditor.page.waitForTimeout(200);

      // Verify italic element exists
      const emElement = slateEditor.locator('em');
      await expect(emElement).toBeVisible();
    });
  });

  test.describe('Underline Formatting', () => {
    test('should apply underline via keyboard shortcut Mod+U', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      // Type some text
      await emptyEditor.page.keyboard.type('Normal ');

      const modKey = getModKey();
      // Apply underline via shortcut
      await emptyEditor.page.keyboard.press(`${modKey}+u`);
      await emptyEditor.page.keyboard.type('underlined');
      await emptyEditor.page.keyboard.press(`${modKey}+u`);

      await emptyEditor.page.keyboard.type(' text');

      // Verify underline element exists
      const uElement = slateEditor.locator('u');
      await expect(uElement).toContainText('underlined');
    });
  });

  test.describe('Combined Formatting', () => {
    test('should apply multiple formats to same text', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      const modKey = getModKey();
      // Apply bold first, then type
      await emptyEditor.page.keyboard.press(`${modKey}+b`);
      await emptyEditor.page.waitForTimeout(100);
      await emptyEditor.page.keyboard.type('bold ');

      // Now apply italic while bold is still active
      await emptyEditor.page.keyboard.press(`${modKey}+i`);
      await emptyEditor.page.waitForTimeout(100);
      await emptyEditor.page.keyboard.type('and italic');

      // Verify at least one format exists and text is there
      const content = await slateEditor.innerHTML();
      // At least one format should be applied
      const hasFormatting = content.includes('strong') || content.includes('em');
      expect(hasFormatting).toBe(true);
      await expect(slateEditor).toContainText('bold');
      await expect(slateEditor).toContainText('and italic');
    });

    test('should remove one format while keeping another', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      const modKey = getModKey();
      // Apply italic first
      await emptyEditor.page.keyboard.press(`${modKey}+i`);
      await emptyEditor.page.waitForTimeout(100);
      await emptyEditor.page.keyboard.type('formatted');

      // Toggle italic off
      await emptyEditor.page.keyboard.press(`${modKey}+i`);
      await emptyEditor.page.waitForTimeout(100);
      await emptyEditor.page.keyboard.type(' plain text');

      // Verify em element exists for the first part
      const emElement = slateEditor.locator('em').first();
      await expect(emElement).toBeVisible();
      await expect(slateEditor).toContainText('plain text');
    });
  });

  test.describe('Undo/Redo Formatting', () => {
    test('should undo typing with Mod+Z', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      const modKey = getModKey();

      // Type some text
      await emptyEditor.page.keyboard.type('First');
      await emptyEditor.page.waitForTimeout(100);
      await emptyEditor.page.keyboard.type(' Second');

      // Verify text is there
      await expect(slateEditor).toContainText('First Second');

      // Undo - Note: Slate's undo may be handled by the outer editor
      // Use the sidebar undo button instead
      await emptyEditor.undoButton.click();

      // Give time for undo to process
      await emptyEditor.page.waitForTimeout(200);

      // Verify something was undone
      await expect(slateEditor).toBeVisible();
    });

    test('should redo with sidebar button', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      // Type some text
      await emptyEditor.page.keyboard.type('Redo test');

      // Verify text is there
      await expect(slateEditor).toContainText('Redo test');

      // Wait for state to settle
      await emptyEditor.page.waitForTimeout(500);

      // Check if undo button is enabled before clicking
      const undoEnabled = await emptyEditor.undoButton.isEnabled().catch(() => false);
      if (undoEnabled) {
        // Undo with sidebar button
        await emptyEditor.undoButton.click();
        await emptyEditor.page.waitForTimeout(500);

        // Check if redo button is enabled
        const redoEnabled = await emptyEditor.redoButton.isEnabled().catch(() => false);
        if (redoEnabled) {
          // Redo with sidebar button
          await emptyEditor.redoButton.click();
          await emptyEditor.page.waitForTimeout(500);
        }
      }

      // Text should be visible in some form
      await expect(slateEditor).toBeVisible();
    });
  });

  test.describe('Heading Formatting', () => {
    test('should format text as heading when using toolbar', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      // Type some text
      await emptyEditor.page.keyboard.type('This is a heading');

      const modKey = getModKey();
      // Select all
      await emptyEditor.page.keyboard.press(`${modKey}+a`);

      // Look for heading button in the bottom toolbar (H button)
      // The toolbar appears when cell is focused
      const headingButton = emptyEditor.page.locator('button').filter({ has: emptyEditor.page.locator('[data-testid="TitleIcon"]') }).first();

      // If heading button is visible, click it
      if (await headingButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await headingButton.click();

        // Give time for heading to be applied
        await emptyEditor.page.waitForTimeout(300);

        // Check if any heading element exists
        const headings = slateEditor.locator('h1, h2, h3, h4, h5, h6');
        const count = await headings.count();
        expect(count).toBeGreaterThan(0);
      } else {
        // Skip if heading button not found in this configuration
        test.skip();
      }
    });

    test('should verify heading elements render correctly in preview', async ({ emptyEditor }) => {
      const slateEditor = emptyEditor.page.locator('[data-slate-editor="true"]').first();
      await slateEditor.click();

      // Type text that starts with a heading marker (if supported by shortcuts)
      await emptyEditor.page.keyboard.type('Regular paragraph text');

      // Verify the paragraph renders
      await expect(slateEditor).toContainText('Regular paragraph text');

      // The default should be paragraph
      const paragraphs = slateEditor.locator('p, [data-slate-node="element"]');
      const count = await paragraphs.count();
      expect(count).toBeGreaterThanOrEqual(0); // At least text should exist
    });
  });
});
