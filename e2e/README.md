# ReactPage E2E Tests

End-to-end tests for the ReactPage editor using Playwright.

## Prerequisites

- Node.js 16+
- Chromium browser (installed via Playwright)

## Quick Start

```bash
# Install dependencies (from project root)
yarn install

# Install Playwright browsers (if not already installed)
npx playwright install chromium

# Run all E2E tests
yarn test:e2e

# Run tests with UI mode (interactive)
yarn test:e2e:ui

# Run tests in headed mode (visible browser)
yarn test:e2e:headed
```

## Directory Structure

```
e2e/
├── fixtures/           # Test fixtures and custom test functions
│   └── editor.fixture.ts
├── page-objects/       # Page Object Model classes
│   ├── index.ts        # Exports all page objects
│   ├── editor.page.ts  # Main editor page interactions
│   ├── cell.component.ts
│   ├── row.component.ts
│   ├── plugin-drawer.component.ts
│   └── slate.component.ts
├── tests/              # Test specifications
│   └── smoke.spec.ts   # Basic smoke tests
├── test-results/       # Test output (gitignored)
└── README.md           # This file
```

## Writing Tests

### Using Fixtures

The recommended way to write tests is using the custom fixtures:

```typescript
import { test, expect } from '../fixtures/editor.fixture';

test('my test', async ({ emptyEditor }) => {
  // emptyEditor is pre-navigated to /empty
  await expect(emptyEditor.editorContainer).toBeVisible();
});
```

Available fixtures:
- `editorPage` - Basic page object, does not navigate
- `emptyEditor` - Navigates to `/empty` (blank editor)
- `demoEditor` - Navigates to `/` (pre-populated demo)
- `simpleEditor` - Navigates to `/examples/simple`

### Page Objects

Page objects provide a clean API for interacting with the editor:

```typescript
// Navigate and wait for editor
await editorPage.goto('/empty');

// Enter different modes
await editorPage.enterEditMode();
await editorPage.enterInsertMode();
await editorPage.enterLayoutMode();
await editorPage.enterPreviewMode();

// Work with plugins
await editorPage.pluginDrawer.search('Text');
await editorPage.pluginDrawer.selectPlugin('slate');

// Work with cells
const cell = editorPage.getCell(0);
await cell.click();
await cell.hover();
const isFocused = await cell.isFocused();
```

## Configuration

The Playwright configuration is in `playwright.config.ts` at the project root:

- **Base URL**: `http://localhost:3000`
- **Web Server**: Automatically starts `yarn dev` before tests
- **Browser**: Chromium (primary)
- **Retries**: 0 locally, 2 on CI
- **Output**: `e2e/test-results/`

## Running Specific Tests

```bash
# Run a specific test file
yarn test:e2e e2e/tests/smoke.spec.ts

# Run tests matching a pattern
yarn test:e2e --grep "should load"

# Run tests in a specific browser
yarn test:e2e --project=chromium
```

## Debugging Tests

```bash
# Run with Playwright Inspector
PWDEBUG=1 yarn test:e2e

# Run with UI mode for interactive debugging
yarn test:e2e:ui

# Run with trace viewer on failure
yarn test:e2e --trace on
```

## CI/CD

Tests are configured to run differently in CI:
- Single worker (sequential execution)
- 2 retries for flaky tests
- Trace collection on failure

Set `CI=true` environment variable to enable CI mode.

## Best Practices

1. **Use Page Objects**: Always interact with the editor through page objects
2. **Use Fixtures**: Prefer fixtures over manual setup/teardown
3. **Wait for Visibility**: Use `waitFor` and `waitForVisible` methods
4. **Avoid Sleep**: Use Playwright's built-in waiting mechanisms
5. **Test Independence**: Each test should be independent and not rely on others
6. **Descriptive Names**: Use clear, descriptive test names

## Troubleshooting

### Tests timing out

- Increase the webServer timeout in `playwright.config.ts`
- Check if the dev server starts correctly with `yarn dev`
- Ensure port 3000 is available

### Elements not found

- Check if CSS class names have changed
- Use Playwright's locator debugging: `await page.pause()`
- Verify the page is fully loaded before interacting

### Flaky tests

- Add explicit waits for elements
- Check for race conditions in async operations
- Consider using `test.retry()` for known flaky scenarios

## Contributing

1. Add new page objects in `e2e/page-objects/`
2. Export new page objects from `e2e/page-objects/index.ts`
3. Add new test files in `e2e/tests/`
4. Follow the existing patterns for consistency
