import { test as base, expect } from '@playwright/test';
import { EditorPage, CellComponent, RowComponent, PluginDrawerComponent, SlateComponent } from '../page-objects';

/**
 * Custom fixture types for ReactPage E2E tests
 */
type EditorFixtures = {
  /** EditorPage instance for interacting with the editor */
  editorPage: EditorPage;
  /** Navigate to an empty editor */
  emptyEditor: EditorPage;
  /** Navigate to the demo editor with pre-populated content */
  demoEditor: EditorPage;
  /** Navigate to a simple editor with minimal plugins */
  simpleEditor: EditorPage;
};

/**
 * Extended test with custom fixtures for ReactPage
 *
 * Usage:
 * ```typescript
 * import { test, expect } from '../fixtures/editor.fixture';
 *
 * test('my test', async ({ editorPage }) => {
 *   await editorPage.goto('/empty');
 *   // ... test code
 * });
 * ```
 */
export const test = base.extend<EditorFixtures>({
  /**
   * Basic EditorPage fixture - does not navigate automatically
   */
  editorPage: async ({ page }, use) => {
    const editorPage = new EditorPage(page);
    await use(editorPage);
  },

  /**
   * Empty editor fixture - navigates to /empty page
   * Use this when you want to start with a blank slate
   */
  emptyEditor: async ({ page }, use) => {
    const editorPage = new EditorPage(page);
    await editorPage.goto('/empty');
    await use(editorPage);
  },

  /**
   * Demo editor fixture - navigates to / (main demo page with content)
   * Use this when you need pre-populated content to test against
   */
  demoEditor: async ({ page }, use) => {
    const editorPage = new EditorPage(page);
    await editorPage.goto('/');
    await use(editorPage);
  },

  /**
   * Simple editor fixture - navigates to /examples/simple
   * Use this when you want a minimal editor with just slate and image plugins
   */
  simpleEditor: async ({ page }, use) => {
    const editorPage = new EditorPage(page);
    await editorPage.goto('/examples/simple');
    await use(editorPage);
  },
});

/**
 * Re-export expect from Playwright for convenience
 */
export { expect };

/**
 * Helper function to wait for a condition with a timeout
 */
export async function waitFor(
  condition: () => Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 5000, interval = 100 } = options;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Sample editor values for testing
 */
export const sampleValues = {
  /**
   * A simple text-only value
   */
  simpleText: {
    id: 'test-value',
    version: 1,
    rows: [
      {
        id: 'row-1',
        cells: [
          {
            id: 'cell-1',
            size: 12,
            plugin: {
              id: 'ory/editor/core/content/slate',
              version: 1,
            },
            dataI18n: {
              en: {
                slate: [
                  {
                    type: 'PARAGRAPH/PARAGRAPH',
                    children: [{ text: 'Hello, World!' }],
                  },
                ],
              },
            },
          },
        ],
      },
    ],
  },

  /**
   * A two-column layout value
   */
  twoColumn: {
    id: 'test-value',
    version: 1,
    rows: [
      {
        id: 'row-1',
        cells: [
          {
            id: 'cell-1',
            size: 6,
            plugin: {
              id: 'ory/editor/core/content/slate',
              version: 1,
            },
            dataI18n: {
              en: {
                slate: [
                  {
                    type: 'PARAGRAPH/PARAGRAPH',
                    children: [{ text: 'Left column' }],
                  },
                ],
              },
            },
          },
          {
            id: 'cell-2',
            size: 6,
            plugin: {
              id: 'ory/editor/core/content/slate',
              version: 1,
            },
            dataI18n: {
              en: {
                slate: [
                  {
                    type: 'PARAGRAPH/PARAGRAPH',
                    children: [{ text: 'Right column' }],
                  },
                ],
              },
            },
          },
        ],
      },
    ],
  },

  /**
   * An empty value
   */
  empty: {
    id: 'test-value',
    version: 1,
    rows: [],
  },
};
