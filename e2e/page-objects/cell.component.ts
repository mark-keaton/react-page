import { Page, Locator, expect } from '@playwright/test';

/**
 * CellComponent - Page object for interacting with individual cells in the editor
 *
 * A cell is the basic building block of the ReactPage editor.
 * Each cell contains a plugin (like text, image, video, etc.)
 */
export class CellComponent {
  readonly page: Page;
  readonly locator: Locator;
  readonly index: number;

  constructor(page: Page, index: number) {
    this.page = page;
    this.index = index;
    this.locator = page.locator('.react-page-cell').nth(index);
  }

  /**
   * Get the cell's inner content area
   */
  get innerContent(): Locator {
    return this.locator.locator('.react-page-cell-inner');
  }

  /**
   * Get the cell's handle (for dragging)
   */
  get handle(): Locator {
    return this.locator.locator('.react-page-cell-handle');
  }

  /**
   * Check if the cell is focused
   */
  async isFocused(): Promise<boolean> {
    return await this.locator.evaluate((el) =>
      el.classList.contains('react-page-cell-focused')
    );
  }

  /**
   * Check if the cell is a draft (not visible in preview mode)
   */
  async isDraft(): Promise<boolean> {
    return await this.locator.evaluate((el) =>
      el.classList.contains('react-page-cell-is-draft')
    );
  }

  /**
   * Check if the cell has a plugin
   */
  async hasPlugin(): Promise<boolean> {
    return await this.locator.evaluate((el) =>
      el.classList.contains('react-page-cell-has-plugin')
    );
  }

  /**
   * Click on the cell to focus it
   */
  async click() {
    await this.locator.click();
  }

  /**
   * Double-click on the cell (e.g., to enter edit mode for text)
   */
  async doubleClick() {
    await this.locator.dblclick();
  }

  /**
   * Hover over the cell
   */
  async hover() {
    await this.locator.hover();
  }

  /**
   * Get the size of the cell (1-12 grid units)
   */
  async getSize(): Promise<number> {
    const classList = await this.locator.evaluate((el) =>
      Array.from(el.classList)
    );

    // Find the class that indicates size (e.g., react-page-cell-sm-6)
    for (const className of classList) {
      const match = className.match(/react-page-cell-(?:xs|sm|md|lg|xl)-(\d+)/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    // Default size is 12 (full width)
    return 12;
  }

  /**
   * Check if the cell is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  /**
   * Wait for the cell to be visible
   */
  async waitForVisible(timeout: number = 5000) {
    await this.locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Get the bounding box of the cell
   */
  async getBoundingBox() {
    return await this.locator.boundingBox();
  }

  /**
   * Drag the cell to a new position relative to another cell
   * @param targetCell - The cell to drag to
   * @param position - Where to drop relative to target ('before' | 'after' | 'above' | 'below')
   */
  async dragTo(targetCell: CellComponent, position: 'before' | 'after' | 'above' | 'below' = 'after') {
    const sourceBox = await this.getBoundingBox();
    const targetBox = await targetCell.getBoundingBox();

    if (!sourceBox || !targetBox) {
      throw new Error('Could not get bounding boxes for drag operation');
    }

    // Calculate offset based on position
    let targetX = targetBox.x + targetBox.width / 2;
    let targetY = targetBox.y + targetBox.height / 2;

    switch (position) {
      case 'before':
        targetX = targetBox.x + 10;
        break;
      case 'after':
        targetX = targetBox.x + targetBox.width - 10;
        break;
      case 'above':
        targetY = targetBox.y + 10;
        break;
      case 'below':
        targetY = targetBox.y + targetBox.height - 10;
        break;
    }

    // Perform the drag using the handle
    await this.handle.hover();
    await this.page.mouse.down();
    await this.page.mouse.move(targetX, targetY, { steps: 10 });
    await this.page.mouse.up();
  }

  /**
   * Get the text content of the cell (if it's a text-based cell)
   */
  async getTextContent(): Promise<string> {
    return await this.locator.textContent() ?? '';
  }

  /**
   * Check if the cell contains specific text
   */
  async containsText(text: string): Promise<boolean> {
    const content = await this.getTextContent();
    return content.includes(text);
  }

  /**
   * Get the plugin type/id of this cell (if available from the DOM)
   */
  async getPluginType(): Promise<string | null> {
    // The plugin type might be indicated by a data attribute or class
    const dataPlugin = await this.locator.getAttribute('data-plugin');
    if (dataPlugin) {
      return dataPlugin;
    }

    // Try to find it from inner class names
    const innerClasses = await this.innerContent.evaluate((el) =>
      Array.from(el.classList)
    );

    // Look for plugin-specific class names
    for (const className of innerClasses) {
      if (className.startsWith('react-page-plugins-')) {
        return className.replace('react-page-plugins-', '');
      }
    }

    return null;
  }
}
