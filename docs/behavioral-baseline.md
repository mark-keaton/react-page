# ReactPage Editor Behavioral Baseline

This document captures the expected behaviors of the ReactPage editor as observed through the functional test suite. Use this reference to detect regressions during dependency migrations.

## Table of Contents

1. [Overview](#overview)
2. [Editor Core](#editor-core)
3. [Slate Editor](#slate-editor)
4. [Plugins](#plugins)
5. [State Management](#state-management)
6. [Serialization](#serialization)
7. [Known Quirks](#known-quirks)
8. [Test Coverage Summary](#test-coverage-summary)

---

## Overview

### Purpose

This document serves as the authoritative reference for ReactPage editor behaviors. During dependency migrations (especially Slate, React, Redux, and Material-UI), use these behaviors to verify that the editor continues to function correctly.

### How to Use During Migration

1. **Before Migration**: Run the full test suite to establish baseline
2. **After Migration**: Run tests and compare against documented behaviors
3. **Regression Detection**: Any deviation from documented behaviors indicates a potential regression
4. **New Behaviors**: Update this document when intentional behavior changes are made

### Test Suite Structure

- **E2E Tests (Playwright)**: Browser-based tests for user-facing behaviors
- **Integration Tests (Jest)**: Unit/integration tests for Redux state and serialization
- **Total Coverage**: ~200+ test assertions across all categories

---

## Editor Core

### Initialization Behaviors

| Behavior | Expected Result | Test File |
|----------|-----------------|-----------|
| Empty editor loads | Editor container visible, 0-1 placeholder cells | `initialization.spec.ts` |
| Demo editor loads | Editor container visible, cells > 0, rows > 0 | `initialization.spec.ts` |
| Simple editor loads | Editor container visible, limited plugins (<=10) | `initialization.spec.ts` |
| Sidebar controls visible | Edit, Insert, Layout, Resize, Preview buttons all visible | `initialization.spec.ts` |
| Undo/Redo controls visible | Undo and Redo buttons visible in sidebar | `initialization.spec.ts` |

### CSS Class Structure

| Element | CSS Class | Purpose |
|---------|-----------|---------|
| Editor container | `.react-page-editable` | Main editable area |
| Sidebar | `.react-page-controls-mode-toggle-control-group` | Mode toggle buttons |
| Rows | `.react-page-row` | Horizontal cell containers |
| Cells | `.react-page-cell` | Content block containers |
| Cell inner | `.react-page-cell-inner` | Cell content area |
| Cell handle | `.react-page-cell-handle` | Drag handle for cells |
| Plugin drawer | `.react-page-plugin-drawer .MuiDrawer-paper` | Plugin selection panel |
| Focused cell | `.react-page-cell-focused` | Currently focused cell |
| Draft cell | `.react-page-cell-is-draft` | Cell not visible in preview |
| Has plugin | `.react-page-cell-has-plugin` | Cell containing a plugin |
| Droppable | `.react-page-row-droppable-container` | Drop target area |
| Floating children | `.react-page-row-has-floating-children` | Row with inline cells |

### Editor Mode Behaviors

| Mode | Activation | Behavior |
|------|------------|----------|
| **Edit Mode** | Click "Edit blocks" button | Cells become editable, can modify content |
| **Insert Mode** | Click "Add blocks" button | Opens plugin drawer on left side |
| **Layout Mode** | Click "Move blocks" button | Shows drag handles, enables cell reordering |
| **Resize Mode** | Click "Resize blocks" button | Shows resize handles on cell edges |
| **Preview Mode** | Click "Preview page" button | Shows read-only view, hides draft cells |

**Mode Transition Behaviors:**
- Switching from Insert to Edit mode closes the plugin drawer (slides off-screen)
- State is maintained across mode switches (cell count, content preserved)
- All mode buttons remain accessible after switching

### Cell Operations

#### Adding Cells

| Operation | Behavior | Wait Time |
|-----------|----------|-----------|
| Add via plugin drawer | Click plugin item -> cell created | 500ms |
| Add multiple cells | Each click creates new cell | 500ms between |
| Cell created in new row | If no row selected, new row created | Automatic |

**Cell Addition Flow:**
1. Enter Insert mode (opens plugin drawer)
2. Search for plugin (optional, filters list)
3. Click plugin item
4. Wait ~500ms for cell creation
5. Cell count increases by 1

#### Cell Focus and Selection

| Action | Result |
|--------|--------|
| Single click on cell | Cell becomes focused |
| Double click on text cell | Enters text editing mode |
| Click another cell | Focus switches to new cell |
| Click outside cells | Cell loses focus |

#### Cell Properties

| Property | Range | Default |
|----------|-------|---------|
| Size (grid units) | 1-12 | 12 (full width) |
| Visibility | true/false | true |
| isDraft | true/false | false |

**Size CSS Classes:**
- Pattern: `react-page-cell-{breakpoint}-{size}`
- Breakpoints: xs, sm, md, lg, xl
- Example: `react-page-cell-sm-6` = 6 columns on small screens

### Row Operations

#### Row Structure

| Property | Description |
|----------|-------------|
| Contains cells | Each row has 1+ cells arranged horizontally |
| Total width | Cells should sum to <= 12 grid units |
| Nested rows | Cells can contain nested rows |
| Bounding box | Row has positive width and height |

#### Row Behaviors

| Action | Result |
|--------|--------|
| Get cells in row | Returns array of CellComponents |
| Empty row check | Returns true if cell count = 0 |
| Total width calculation | Sum of all cell sizes in row |
| Row contains cell | Cell bounding box within row bounds (10px tolerance) |

### Drag and Drop

#### Layout Mode Requirements

| Requirement | Details |
|-------------|---------|
| Must be in Layout mode | Enter via "Move blocks" button |
| Cell handles visible | Appear on cell hover in layout mode |
| Cells remain interactable | Can hover and click cells |

#### Drag Position Detection

| Position | Description |
|----------|-------------|
| `before` | Left side of target cell |
| `after` | Right side of target cell |
| `above` | Top of target cell |
| `below` | Bottom of target cell |

**Drag Operation Flow:**
1. Enter Layout mode
2. Hover over source cell
3. Mouse down on cell handle
4. Move to target position (10 steps for smooth animation)
5. Mouse up to drop

#### Drag from Plugin Drawer

| Step | Action |
|------|--------|
| 1 | Enter Insert mode (opens drawer) |
| 2 | Locate plugin in drawer |
| 3 | Mouse down on plugin item |
| 4 | Drag to editor container |
| 5 | Mouse up to drop |

**Note:** Drop zone detection may vary; cell creation is not guaranteed on all drop positions.

### Resize Operations

#### Resize Mode Behaviors

| Behavior | Details |
|----------|---------|
| Cell sizes visible | Size displayed in grid units (1-12) |
| Resize handles | Appear on cell edges when hovering |
| Adjacent cell adjustment | Sibling cells adjust to maintain total of 12 |
| Minimum size | 1 grid unit |
| Maximum size | 11 grid units (sibling needs at least 1) |

**Resize Constraints:**
- Total row width always equals 12
- When cell grows, sibling shrinks
- When cell shrinks, sibling grows
- Cannot resize single-cell rows (no sibling)

#### Resize Actions

```
Initial: Cell1=6, Cell2=6
After resizeCell('cell1')(4): Cell1=4, Cell2=8
After resizeCell('cell1')(11): Cell1=11, Cell2=1
```

---

## Slate Editor

### Text Input Behaviors

| Action | Behavior | Selector |
|--------|----------|----------|
| Find Slate editor | `[data-slate-editor="true"]` | First match |
| Click to focus | Activates editing mode | - |
| Type text | Text appears in editor | - |
| Multi-line (Enter) | Creates new paragraph/line | - |
| Delete (Backspace) | Removes character before cursor | - |
| Delete (Delete key) | Removes character after cursor | - |

**Wait Requirements:**
- After plugin selection: 500ms
- After typing: 100ms for state to settle
- After keyboard navigation: 50-100ms

### Text Selection

| Action | Keyboard Shortcut |
|--------|-------------------|
| Select all | Mod+A (Cmd on Mac, Ctrl on Windows) |
| Triple-click | Selects entire paragraph |
| Shift+Arrow | Extends selection |

**Platform Modifier Key:**
- macOS: `Meta` (Command key)
- Windows/Linux: `Control`

### Text Formatting

| Format | Shortcut | HTML Element | Toggle Behavior |
|--------|----------|--------------|-----------------|
| Bold | Mod+B | `<strong>` | Press again to toggle off |
| Italic | Mod+I | `<em>` | Press again to toggle off |
| Underline | Mod+U | `<u>` | Press again to toggle off |

**Formatting Flow:**
1. Position cursor or select text
2. Press formatting shortcut
3. Type (new text has format) or selection formatted
4. Press shortcut again to toggle off

**Combined Formatting:**
- Multiple formats can be applied simultaneously
- Formats are independent (removing bold keeps italic)

### Lists

#### List Types

| Type | Toolbar Icon | HTML Elements |
|------|--------------|---------------|
| Unordered (Bullet) | `FormatListBulletedIcon` | `<ul>`, `<li>` |
| Ordered (Numbered) | `FormatListNumberedIcon` | `<ol>`, `<li>` |

#### List Behaviors

| Action | Result |
|--------|--------|
| Click list button | Converts current line to list item |
| Enter in list | Creates new list item |
| Double Enter on empty | Exits list mode |
| Tab | Indents list item |
| Shift+Tab | Outdents list item |

**List Conversion:**
- Can convert between bullet and numbered lists
- Content preserved during conversion

### Links

#### Link Creation

| Step | Action |
|------|--------|
| 1 | Select text |
| 2 | Click link button (`LinkIcon`) |
| 3 | Enter URL in input field |
| 4 | Confirm (Enter or OK button) |

**Link Input Fields:**
- Name patterns: `input[name="href"]`, `input[placeholder*="http"]`
- Supports both absolute and relative URLs

#### Link Options

| Option | Behavior |
|--------|----------|
| URL | Standard href attribute |
| Open in new window | `target="_blank"` attribute |
| Relative URLs | Preserved as-is (e.g., `/relative/path`) |

#### Link Editing

| Action | Result |
|--------|--------|
| Click on link | Opens edit dialog/popover |
| Edit URL | Updates href attribute |
| Remove link | Preserves text, removes anchor tag |

### Headings

| Element | Access Method |
|---------|---------------|
| H1-H6 | Via toolbar (TitleIcon) |
| Verification | Check for `h1, h2, h3, h4, h5, h6` elements |

### Undo/Redo in Slate

| Action | Method |
|--------|--------|
| Undo | Sidebar undo button (not Mod+Z in Slate) |
| Redo | Sidebar redo button |

**Note:** Slate's internal undo may be handled by the outer editor. Use sidebar buttons for reliable undo/redo.

---

## Plugins

### Plugin Drawer

#### Drawer Behaviors

| Behavior | Details |
|----------|---------|
| Opening | Triggered by Insert mode button |
| Location | Left side of editor (persistent MUI drawer) |
| Closing | Switches mode or slides off-screen |
| State when closed | `translateX(-100%)` or content not rendered |

#### Search Functionality

| Feature | Behavior |
|---------|----------|
| Search input | Visible in drawer |
| Filtering | Reduces visible plugin count |
| Clear search | Restores full plugin list |
| No results | Shows "No blocks found" message |

#### Available Plugins (Bundled)

| Plugin | Search Term | Default Size |
|--------|-------------|--------------|
| Text/Slate | "Text" | Varies |
| Image | "Image" | Varies |
| Video | "Video" (not HTML5 Video) | Varies |
| HTML5 Video | "HTML 5" | Varies |
| Spacer | "Spacer" | Full width |
| Divider | "Divider" | 12 (full width) |
| Background | "Background" | 12 (full width) |

### Individual Plugin Behaviors

#### Text/Slate Plugin

| Feature | Behavior |
|---------|----------|
| Type | Content plugin |
| Rich text | Yes (formatting, lists, links) |
| Data storage | `dataI18n[lang].slate` array |

#### Image Plugin

| Feature | Behavior |
|---------|----------|
| Type | Content plugin |
| Settings | Available when cell focused |
| Placeholder | Shows when no image configured |

#### Video Plugin (Embed)

| Feature | Behavior |
|---------|----------|
| Type | Content plugin |
| Supports | YouTube, Vimeo (iframe embed) |
| URL input | Text input for video URL |

#### HTML5 Video Plugin

| Feature | Behavior |
|---------|----------|
| Search term | "HTML 5" (with space) |
| Type | Content plugin |
| Renders | Native `<video>` element |

#### Spacer Plugin

| Feature | Behavior |
|---------|----------|
| Type | Content plugin |
| Purpose | Adds vertical space |
| Settings | Height adjustment |
| Default | Has positive height |

#### Divider Plugin

| Feature | Behavior |
|---------|----------|
| Type | Content plugin |
| Default size | 12 (full width) |
| Renders | `<hr>` or `[class*="divider"]` element |

#### Background Plugin

| Feature | Behavior |
|---------|----------|
| Type | Layout plugin |
| Default size | 12 (full width) |
| Inner content | Has content area for nested cells |
| Settings | Color, image configuration |

### Plugin Cell Undo

All plugins support undo of cell addition via sidebar undo button.

---

## State Management

### Redux Store Structure

```typescript
{
  values: {
    past: Value[],    // Undo history
    present: Value,   // Current state
    future: Value[]   // Redo history
  }
}
```

### Undoable Actions

| Action | Creates Undo Entry |
|--------|-------------------|
| UPDATE_VALUE | Yes |
| CELL_UPDATE_DATA | Yes |
| CELL_REMOVE | Yes |
| CELL_RESIZE | Yes |
| CELL_INSERT_* (all variants) | Yes |

### Non-Undoable Actions

| Action | Reason |
|--------|--------|
| CELL_FOCUS | UI state only |
| CELL_BLUR | UI state only |
| CELL_BLUR_ALL | UI state only |
| CLEAR_HOVER | UI state only |
| CELL_DRAG_HOVER | UI state only |
| SET_MODE | Display preference |
| SET_ZOOM | Display preference |

### Undo/Redo Behaviors

#### Undo

| Scenario | Behavior |
|----------|----------|
| Has history | Reverts to previous state, current moves to future |
| Empty history | No change, state preserved |
| Multiple undos | Each undo reverts one action |

#### Redo

| Scenario | Behavior |
|----------|----------|
| Has future | Restores undone state, current moves to past |
| Empty future | No change |
| New action after undo | Clears future (cannot redo) |

### Cell Actions

#### Remove Cell

| Scenario | Behavior |
|----------|----------|
| Remove single cell | Cell deleted, row may be removed if empty |
| Remove multiple cells | All specified cells removed |
| Remove non-existent | No change, no error |
| Remove causes empty row | Row automatically removed |

#### Update Cell Data

| Feature | Behavior |
|---------|----------|
| Language support | Data stored by language key |
| Partial update | Merges with existing data |
| Set to null | Removes language data |
| New language | Adds new language entry |

#### Cell Draft State

| Property | Scope |
|----------|-------|
| `isDraft` | Global cell draft state |
| `isDraftI18n` | Per-language draft state |

### notUndoable Option

```typescript
updateCellData('cell-1')(data, { lang: 'en', notUndoable: true })
```

When `notUndoable: true`, the action is executed but not added to undo history.

---

## Serialization

### Value Structure (Current Version)

```typescript
interface Value {
  id: string;
  version: number;  // CURRENT_EDITABLE_VERSION
  rows: Row[];
}

interface Row {
  id: string;
  cells: Cell[];
}

interface Cell {
  id: string;
  size?: number;        // 1-12, default 12
  inline?: null;        // Inline positioning
  plugin?: {
    id: string;
    version: number;
  };
  dataI18n?: {
    [lang: string]: unknown;
  };
  rows?: Row[];         // Nested cells
  isDraft?: boolean;
  isDraftI18n?: {
    [lang: string]: boolean;
  };
}
```

### Serialization Behaviors

| Feature | Behavior |
|---------|----------|
| Empty editor | `{ id, version, rows: [] }` |
| Cell sizes | Preserved exactly |
| Nested cells | Full depth preserved |
| Multi-language | All language data preserved |
| Layout cells | No plugin property, only rows |

### Plugin Serialization Hooks

| Hook | Purpose |
|------|---------|
| `serialize(data)` | Transform data before saving |
| `unserialize(data)` | Transform data after loading |

### Migration Behaviors

#### Version Migration

| Source | Target | Behavior |
|--------|--------|----------|
| Unversioned (v0) | Current | Full structure migration |
| Current version | Current | Pass-through with plugin migration |

#### V0 to Current Migration

| V0 Property | Current Property |
|-------------|------------------|
| `cells` (top-level) | `rows[0].cells` |
| `content.plugin.name` | `plugin.id` |
| `content.plugin.version` | `plugin.version` (converted) |
| `content.state` | `dataI18n[lang]` |
| `content.stateI18n` | `dataI18n` |
| `layout.plugin` | Same as content plugin |

#### Plugin Data Migration

```typescript
migrations: [
  {
    fromVersion: 1,
    toVersion: 2,
    migrate: (data) => ({ ...data, migrated: true })
  }
]
```

### Round-Trip Preservation

The following are preserved through serialize/deserialize cycles:
- Value id
- Row count and structure
- Cell count and order
- Cell sizes
- All language data
- Plugin identification
- Nested cell structure (any depth)

---

## Known Quirks

### Browser-Specific Behaviors

| Browser | Quirk |
|---------|-------|
| Safari | May require longer waits for animations |
| Firefox | Keyboard shortcut timing may differ |
| Chrome | Standard reference behavior |

### Timing-Sensitive Operations

| Operation | Required Wait | Reason |
|-----------|---------------|--------|
| Add cell | 500ms | DOM update + React render |
| Plugin drawer open | Animation complete | MUI drawer animation |
| Plugin drawer close | Animation complete | Drawer slides off-screen |
| Search filter | 300ms | Debounced search |
| Undo/Redo | 200-500ms | State propagation |
| Mode switch | 300-500ms | UI update |

### Edge Cases

#### Empty Nested Structures

```typescript
// This structure will be optimized away:
{
  rows: [{
    cells: [{
      rows: [{
        cells: []  // Empty nested
      }]
    }]
  }]
}
// Results in: { rows: [] }
```

**Exception:** Parent cells with plugins are NOT optimized away.

#### Plugin Drawer Persistence

The MUI drawer is "persistent" - when closed, it slides off-screen rather than being removed from DOM. Check for:
- `boundingBox.x + boundingBox.width <= 0` (off-screen left)
- Plugin list empty/hidden

#### Row Width Calculation

Nested cells may cause row width > 12 when counting all descendants. Verify immediate children only for 12-column grid.

#### Cell Handle Visibility

Cell handles only appear:
1. When in Layout mode
2. After hovering over cell
3. Wait ~200ms for handle to render

### Modifier Key Platform Differences

| Platform | Modifier | Key Code |
|----------|----------|----------|
| macOS | Command | `Meta` |
| Windows | Ctrl | `Control` |
| Linux | Ctrl | `Control` |

Use `process.platform === 'darwin'` to detect macOS.

### Slate Editor Selectors

| Purpose | Selector |
|---------|----------|
| Editor element | `[data-slate-editor="true"]` |
| Editable area | `[contenteditable="true"]` |
| Inline toolbar | `.react-page-plugins-content-slate-inline-toolbar` |

---

## Test Coverage Summary

### E2E Tests (Playwright)

| Category | File | Test Count |
|----------|------|------------|
| Smoke | `smoke.spec.ts` | 17 |
| Initialization | `editor/initialization.spec.ts` | 14 |
| Cell Operations | `editor/cell-operations.spec.ts` | 17 |
| Row Operations | `editor/row-operations.spec.ts` | 15 |
| Drag and Drop | `editor/drag-drop.spec.ts` | 12 |
| Resize | `editor/resize.spec.ts` | 16 |
| Text Input | `slate/text-input.spec.ts` | 8 |
| Formatting | `slate/formatting.spec.ts` | 10 |
| Lists | `slate/lists.spec.ts` | 8 |
| Links | `slate/links.spec.ts` | 9 |
| Plugin Drawer | `plugins/plugin-drawer.spec.ts` | 11 |
| Image | `plugins/image.spec.ts` | 4 |
| Video | `plugins/video.spec.ts` | 4 |
| HTML5 Video | `plugins/html5-video.spec.ts` | 4 |
| Spacer | `plugins/spacer.spec.ts` | 5 |
| Divider | `plugins/divider.spec.ts` | 5 |
| Background | `plugins/background.spec.ts` | 6 |

### Integration Tests (Jest)

| Category | File | Test Count |
|----------|------|------------|
| Value Reducer | `valueReducer.test.ts` | 18 |
| Undo/Redo | `undoRedo.test.ts` | 25 |
| Serialization | `serialization.test.ts` | 13 |
| Migration | `migrateValue.test.ts` | 11 |

### Running Tests

```bash
# E2E tests
yarn e2e

# Integration tests
yarn test

# All tests
yarn test:all
```

### Test Fixtures

| Fixture | URL | Purpose |
|---------|-----|---------|
| `emptyEditor` | `/empty` | Blank editor for add operations |
| `demoEditor` | `/` | Pre-populated content for verification |
| `simpleEditor` | `/examples/simple` | Minimal plugin set |

---

## Document Maintenance

### When to Update

1. **New features added**: Document new behaviors
2. **Bug fixes**: Update if behavior changes
3. **Dependency updates**: Verify and update any changed behaviors
4. **Test additions**: Add new test coverage notes

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-09 | Initial baseline documentation | Claude |
