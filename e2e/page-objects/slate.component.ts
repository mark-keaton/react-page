import { Page, Locator } from '@playwright/test';

/**
 * SlateComponent - Page object for interacting with Slate text editor cells
 *
 * The Slate plugin is the rich text editor used for text content.
 * It provides formatting options like bold, italic, links, etc.
 */
export class SlateComponent {
  readonly page: Page;
  readonly locator: Locator;

  constructor(page: Page, cellLocator: Locator) {
    this.page = page;
    this.locator = cellLocator;
  }

  /**
   * Get the editable content area
   */
  get editableArea(): Locator {
    return this.locator.locator('[contenteditable="true"]');
  }

  /**
   * Get the slate editor container
   */
  get editorContainer(): Locator {
    return this.locator.locator('[data-slate-editor="true"]');
  }

  /**
   * Check if the slate editor is focused
   */
  async isFocused(): Promise<boolean> {
    const editable = this.editableArea;
    return await editable.evaluate((el) => document.activeElement === el);
  }

  /**
   * Focus the slate editor
   */
  async focus() {
    await this.editableArea.click();
  }

  /**
   * Type text into the slate editor
   * @param text - The text to type
   */
  async typeText(text: string) {
    await this.focus();
    await this.page.keyboard.type(text);
  }

  /**
   * Press a key combination
   * @param key - The key to press (e.g., 'Enter', 'Backspace', 'Control+b')
   */
  async pressKey(key: string) {
    await this.focus();
    await this.page.keyboard.press(key);
  }

  /**
   * Get the text content of the editor
   */
  async getTextContent(): Promise<string> {
    return (await this.editableArea.textContent()) ?? '';
  }

  /**
   * Select all text in the editor
   */
  async selectAll() {
    await this.focus();
    await this.page.keyboard.press('Control+a');
  }

  /**
   * Apply bold formatting to selected text
   */
  async toggleBold() {
    await this.page.keyboard.press('Control+b');
  }

  /**
   * Apply italic formatting to selected text
   */
  async toggleItalic() {
    await this.page.keyboard.press('Control+i');
  }

  /**
   * Apply underline formatting to selected text
   */
  async toggleUnderline() {
    await this.page.keyboard.press('Control+u');
  }

  /**
   * Clear all content in the editor
   */
  async clear() {
    await this.selectAll();
    await this.page.keyboard.press('Backspace');
  }

  /**
   * Replace all content with new text
   * @param text - The new text content
   */
  async setContent(text: string) {
    await this.clear();
    await this.typeText(text);
  }

  /**
   * Check if the editor contains specific text
   */
  async containsText(text: string): Promise<boolean> {
    const content = await this.getTextContent();
    return content.includes(text);
  }

  /**
   * Get the paragraph elements
   */
  getParagraphs(): Locator {
    return this.locator.locator('p');
  }

  /**
   * Get the count of paragraphs
   */
  async getParagraphCount(): Promise<number> {
    return await this.getParagraphs().count();
  }

  /**
   * Check if the editor is empty
   */
  async isEmpty(): Promise<boolean> {
    const content = await this.getTextContent();
    return content.trim() === '' || content.trim() === '\n';
  }

  /**
   * Get all heading elements
   */
  getHeadings(level?: 1 | 2 | 3 | 4 | 5 | 6): Locator {
    if (level) {
      return this.locator.locator(`h${level}`);
    }
    return this.locator.locator('h1, h2, h3, h4, h5, h6');
  }

  /**
   * Get all list items
   */
  getListItems(): Locator {
    return this.locator.locator('li');
  }

  /**
   * Get all links
   */
  getLinks(): Locator {
    return this.locator.locator('a');
  }

  /**
   * Check if text has bold formatting
   * @param text - The text to check
   */
  async hasFormattedText(format: 'strong' | 'em' | 'u' | 'a'): Promise<boolean> {
    const formattedElements = this.locator.locator(format);
    return (await formattedElements.count()) > 0;
  }
}
