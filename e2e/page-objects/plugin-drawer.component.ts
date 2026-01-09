import { Page, Locator } from '@playwright/test';

/**
 * PluginDrawerComponent - Page object for interacting with the plugin drawer
 *
 * The plugin drawer is a side panel that appears when in insert mode.
 * It allows users to search for and add new plugins/blocks to the editor.
 */
export class PluginDrawerComponent {
  readonly page: Page;
  readonly drawer: Locator;
  readonly searchInput: Locator;
  readonly pluginList: Locator;

  constructor(page: Page) {
    this.page = page;
    // The drawer is a MUI persistent drawer - look for the Paper inside it
    this.drawer = page.locator('.react-page-plugin-drawer .MuiDrawer-paper');
    this.searchInput = this.drawer.locator('input[type="text"]');
    this.pluginList = this.drawer.locator('ul');
  }

  /**
   * Check if the drawer is open
   */
  async isOpen(): Promise<boolean> {
    return await this.drawer.isVisible();
  }

  /**
   * Wait for the drawer to open
   */
  async waitForOpen(timeout: number = 5000) {
    await this.drawer.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for the drawer to close
   * Note: MUI persistent drawers slide off screen when closed
   * We check for the drawer being off-screen or not having visible content
   */
  async waitForClose(timeout: number = 5000) {
    // For persistent drawers, we need to check that it's moved off-screen
    // The drawer transforms to translateX(-100%) when closed, or the list might be empty
    await this.page.waitForFunction(
      () => {
        const drawer = document.querySelector('.react-page-plugin-drawer .MuiDrawer-paper');
        if (!drawer) return true;
        const rect = drawer.getBoundingClientRect();
        // Drawer is "closed" when it's completely off the left side of the viewport
        // or when its content is not rendered (no items in the list)
        if (rect.right <= 0) return true;
        // Also check if the drawer contents (the plugin list) is empty/hidden
        const lists = drawer.querySelectorAll('ul li');
        return lists.length === 0;
      },
      { timeout }
    );
  }

  /**
   * Search for a plugin by name
   * @param searchText - The text to search for
   */
  async search(searchText: string) {
    await this.searchInput.fill(searchText);
  }

  /**
   * Clear the search input
   */
  async clearSearch() {
    await this.searchInput.clear();
  }

  /**
   * Get all visible plugin items
   */
  getPluginItems(): Locator {
    return this.drawer.locator('li').filter({ has: this.page.locator('span, div') });
  }

  /**
   * Get the count of visible plugins
   */
  async getPluginCount(): Promise<number> {
    // Count list items that are plugins (not subheaders)
    const items = this.drawer.locator('.MuiListItem-root, li');
    return await items.count();
  }

  /**
   * Get a plugin item by its name or id
   * @param pluginName - The name or id of the plugin
   */
  getPlugin(pluginName: string): Locator {
    // Try to find by text content first
    return this.drawer.locator('li, .MuiListItem-root').filter({
      hasText: new RegExp(pluginName, 'i'),
    }).first();
  }

  /**
   * Select a plugin by clicking on it
   * @param pluginName - The name or id of the plugin
   */
  async selectPlugin(pluginName: string) {
    const plugin = this.getPlugin(pluginName);
    await plugin.waitFor({ state: 'visible' });
    await plugin.click();
  }

  /**
   * Drag a plugin to the editor
   * @param pluginName - The name of the plugin to drag
   * @param targetX - Target X coordinate in the viewport
   * @param targetY - Target Y coordinate in the viewport
   */
  async dragPluginToEditor(pluginName: string, targetX: number, targetY: number) {
    const plugin = this.getPlugin(pluginName);
    const box = await plugin.boundingBox();

    if (!box) {
      throw new Error(`Could not find plugin: ${pluginName}`);
    }

    // Start drag from the plugin
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.mouse.down();

    // Move to target location
    await this.page.mouse.move(targetX, targetY, { steps: 10 });

    // Release
    await this.page.mouse.up();
  }

  /**
   * Check if a specific plugin is visible in the drawer
   * @param pluginName - The name of the plugin to check
   */
  async isPluginVisible(pluginName: string): Promise<boolean> {
    const plugin = this.getPlugin(pluginName);
    return await plugin.isVisible();
  }

  /**
   * Get the "no plugins found" message if visible
   */
  async getNoPluginsMessage(): Promise<string | null> {
    const noPluginsElement = this.drawer.locator('text="No blocks found"');
    if (await noPluginsElement.isVisible()) {
      return await noPluginsElement.textContent();
    }
    return null;
  }
}
