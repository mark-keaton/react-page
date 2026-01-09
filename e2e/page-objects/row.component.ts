import { Page, Locator } from '@playwright/test';
import { CellComponent } from './cell.component';

/**
 * RowComponent - Page object for interacting with rows in the editor
 *
 * A row is a horizontal container for cells. Rows can contain multiple cells
 * arranged side by side in a grid layout.
 */
export class RowComponent {
  readonly page: Page;
  readonly locator: Locator;
  readonly index: number;

  constructor(page: Page, index: number) {
    this.page = page;
    this.index = index;
    this.locator = page.locator('.react-page-row').nth(index);
  }

  /**
   * Get the droppable container for this row
   */
  get droppableContainer(): Locator {
    return this.locator.locator('.react-page-row-droppable-container');
  }

  /**
   * Get all cells in this row
   */
  async getCells(): Promise<CellComponent[]> {
    const cells: CellComponent[] = [];
    const cellLocators = this.locator.locator('.react-page-cell');
    const count = await cellLocators.count();

    for (let i = 0; i < count; i++) {
      // Find the global index of this cell
      const allCells = this.page.locator('.react-page-cell');
      const cellElement = cellLocators.nth(i);
      const cellId = await cellElement.getAttribute('data-cell-id');

      // Find the matching cell in all cells by comparing elements
      const allCellsCount = await allCells.count();
      for (let j = 0; j < allCellsCount; j++) {
        const globalCellId = await allCells.nth(j).getAttribute('data-cell-id');
        if (cellId && cellId === globalCellId) {
          cells.push(new CellComponent(this.page, j));
          break;
        }
      }

      // Fallback: just use the local index
      if (cells.length <= i) {
        cells.push(new CellComponent(this.page, i));
      }
    }

    return cells;
  }

  /**
   * Get the number of cells in this row
   */
  async getCellCount(): Promise<number> {
    return await this.locator.locator('.react-page-cell').count();
  }

  /**
   * Get a specific cell in this row by its local index
   * @param index - Zero-based index of the cell within this row
   */
  getCell(index: number): Locator {
    return this.locator.locator('.react-page-cell').nth(index);
  }

  /**
   * Check if the row has floating/inline children
   */
  async hasFloatingChildren(): Promise<boolean> {
    return await this.locator.evaluate((el) =>
      el.classList.contains('react-page-row-has-floating-children')
    );
  }

  /**
   * Check if the row is being hovered
   */
  async isHovering(): Promise<boolean> {
    const hoverIndicator = this.locator.locator('.react-page-row-is-hovering-this');
    return (await hoverIndicator.count()) > 0;
  }

  /**
   * Check if the row is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  /**
   * Wait for the row to be visible
   */
  async waitForVisible(timeout: number = 5000) {
    await this.locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Get the bounding box of the row
   */
  async getBoundingBox() {
    return await this.locator.boundingBox();
  }

  /**
   * Hover over the row
   */
  async hover() {
    await this.locator.hover();
  }

  /**
   * Click on the row
   */
  async click() {
    await this.locator.click();
  }

  /**
   * Get the total width used by cells (should add up to 12)
   */
  async getTotalCellWidth(): Promise<number> {
    const cells = await this.getCells();
    let totalWidth = 0;

    for (const cell of cells) {
      totalWidth += await cell.getSize();
    }

    return totalWidth;
  }

  /**
   * Check if the row is empty (no cells)
   */
  async isEmpty(): Promise<boolean> {
    return (await this.getCellCount()) === 0;
  }
}
