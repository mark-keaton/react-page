import { Page, Locator, expect } from '@playwright/test';
import { CellComponent } from './cell.component';
import { RowComponent } from './row.component';
import { PluginDrawerComponent } from './plugin-drawer.component';

/**
 * EditorPage - Page object for interacting with the ReactPage editor
 *
 * This is the main entry point for E2E tests interacting with the editor.
 */
export class EditorPage {
  readonly page: Page;
  readonly editorContainer: Locator;
  readonly sidebar: Locator;
  readonly pluginDrawer: PluginDrawerComponent;

  // Sidebar buttons
  readonly editButton: Locator;
  readonly insertButton: Locator;
  readonly layoutButton: Locator;
  readonly resizeButton: Locator;
  readonly previewButton: Locator;
  readonly undoButton: Locator;
  readonly redoButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // The main editor container - react-page-editable is the main editable area
    this.editorContainer = page.locator('.react-page-editable');
    this.sidebar = page.locator('.react-page-controls-mode-toggle-control-group');
    this.pluginDrawer = new PluginDrawerComponent(page);

    // Sidebar buttons - these are MUI Fab buttons with description text
    // Each button is in a div.react-page-controls-mode-toggle-button with a description sibling
    this.editButton = this.sidebar.locator('.react-page-controls-mode-toggle-button').filter({ hasText: 'Edit blocks' }).locator('button');
    this.insertButton = this.sidebar.locator('.react-page-controls-mode-toggle-button').filter({ hasText: 'Add blocks' }).locator('button');
    this.layoutButton = this.sidebar.locator('.react-page-controls-mode-toggle-button').filter({ hasText: 'Move blocks' }).locator('button');
    this.resizeButton = this.sidebar.locator('.react-page-controls-mode-toggle-button').filter({ hasText: 'Resize blocks' }).locator('button');
    this.previewButton = this.sidebar.locator('.react-page-controls-mode-toggle-button').filter({ hasText: 'Preview page' }).locator('button');
    this.undoButton = this.sidebar.locator('.react-page-controls-mode-toggle-button').filter({ hasText: 'undo' }).locator('button');
    this.redoButton = this.sidebar.locator('.react-page-controls-mode-toggle-button').filter({ hasText: 'redo' }).locator('button');
  }

  /**
   * Navigate to the editor page
   * @param path - The path to navigate to (default: '/empty')
   */
  async goto(path: string = '/empty') {
    await this.page.goto(path);
    await this.waitForEditorReady();
  }

  /**
   * Wait for the editor to be fully loaded and interactive
   */
  async waitForEditorReady() {
    // Wait for the main editor container to be visible
    await this.editorContainer.waitFor({ state: 'visible', timeout: 30000 });
    // Wait for sidebar controls to be visible (indicates editor is interactive)
    await this.sidebar.waitFor({ state: 'visible', timeout: 30000 });
  }

  /**
   * Check if the editor is in a specific mode
   */
  async isInEditMode(): Promise<boolean> {
    // When in edit mode, cells are editable
    const editableCell = this.page.locator('.react-page-cell[contenteditable="true"]');
    return (await editableCell.count()) > 0 || (await this.page.locator('.react-page-cell-focused').count()) > 0;
  }

  /**
   * Enter edit mode
   */
  async enterEditMode() {
    await this.editButton.click();
  }

  /**
   * Enter insert mode (opens plugin drawer)
   */
  async enterInsertMode() {
    await this.insertButton.click();
    await this.pluginDrawer.waitForOpen();
  }

  /**
   * Enter layout mode (for moving blocks)
   */
  async enterLayoutMode() {
    await this.layoutButton.click();
  }

  /**
   * Enter resize mode
   */
  async enterResizeMode() {
    await this.resizeButton.click();
  }

  /**
   * Enter preview mode
   */
  async enterPreviewMode() {
    await this.previewButton.click();
  }

  /**
   * Undo the last action
   */
  async undo() {
    await this.undoButton.click();
  }

  /**
   * Redo the last undone action
   */
  async redo() {
    await this.redoButton.click();
  }

  /**
   * Add a cell with a specific plugin
   * @param pluginName - The name or ID of the plugin to add
   */
  async addCell(pluginName: string) {
    await this.enterInsertMode();
    await this.pluginDrawer.selectPlugin(pluginName);
  }

  /**
   * Get a cell by its index
   * @param index - Zero-based index of the cell
   */
  getCell(index: number): CellComponent {
    return new CellComponent(this.page, index);
  }

  /**
   * Get all cells in the editor
   */
  async getAllCells(): Promise<CellComponent[]> {
    const cellLocators = this.page.locator('.react-page-cell');
    const count = await cellLocators.count();
    const cells: CellComponent[] = [];
    for (let i = 0; i < count; i++) {
      cells.push(new CellComponent(this.page, i));
    }
    return cells;
  }

  /**
   * Get the number of cells in the editor
   */
  async getCellCount(): Promise<number> {
    return await this.page.locator('.react-page-cell').count();
  }

  /**
   * Get a row by its index
   * @param index - Zero-based index of the row
   */
  getRow(index: number): RowComponent {
    return new RowComponent(this.page, index);
  }

  /**
   * Get the number of rows in the editor
   */
  async getRowCount(): Promise<number> {
    return await this.page.locator('.react-page-row').count();
  }

  /**
   * Get the serialized editor value (for debugging)
   * This requires the editor to expose getValue somehow
   */
  async getValue(): Promise<unknown> {
    // This would need to be implemented based on how the editor exposes its value
    // For now, we can check if there's a way to access it via the page context
    return await this.page.evaluate(() => {
      // This is a placeholder - actual implementation depends on how the app exposes editor state
      return null;
    });
  }

  /**
   * Check if the editor is empty (no content)
   */
  async isEmpty(): Promise<boolean> {
    const cells = await this.getCellCount();
    return cells === 0;
  }

  /**
   * Click on an empty area of the editor to show the "add content" button
   */
  async clickEmptyArea() {
    // Click on the insert new button if visible
    const insertNewButton = this.page.locator('[data-testid="AddIcon"]').first();
    if (await insertNewButton.isVisible()) {
      await insertNewButton.click();
    }
  }
}
