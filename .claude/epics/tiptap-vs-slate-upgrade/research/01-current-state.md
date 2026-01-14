# Current Slate.js Integration Inventory

This document provides a comprehensive inventory of ReactPage's current Slate.js integration, serving as a baseline for comparison when evaluating alternatives like Tiptap.

## 1. Sub-Plugin Inventory

### Location
`packages/plugins/content/slate/src/plugins/`

### Plugin Groups and Their Components

| Group | Sub-Plugin | Type | File | Purpose |
|-------|------------|------|------|---------|
| **paragraphs** | paragraph | block | `paragraphs/index.tsx` | Default paragraph element with alignment support |
| | pre | block | `paragraphs/index.tsx` | Preformatted text block |
| **headings** | h1-h6 | block | `headings/index.tsx` | Six levels of headings |
| **link** | link | inline | `links/link.tsx` | Hyperlinks with href and target attributes |
| | anchor | block | `links/anchor.tsx` | ID anchors for in-page navigation |
| **lists** | ol | block | `lists/index.tsx` | Ordered list container |
| | ul | block | `lists/index.tsx` | Unordered list container |
| | li | block | `lists/index.tsx` | List item |
| | indention | custom | `lists/index.tsx` | Increase/decrease indentation controls |
| **quotes** | blockQuote | block | `quotes.tsx` | Block quote element |
| **code** | block | block | `code/index.tsx` | Code block (display: block) |
| | mark | mark | `code/index.tsx` | Inline code (whiteSpace: pre-wrap) |
| **emphasize** | strong | mark | `emphasize/strong.tsx` | Bold text (mod+b) |
| | em | mark | `emphasize/em.tsx` | Italic text (mod+i) |
| | underline | mark | `emphasize/underline.tsx` | Underlined text (mod+u) |
| **alignment** | left | data | `alignment.tsx` | Left text alignment |
| | center | data | `alignment.tsx` | Center text alignment |
| | right | data | `alignment.tsx` | Right text alignment |
| | justify | data | `alignment.tsx` | Justified text alignment |

### Plugin Types

ReactPage uses three plugin types:

1. **Component Plugins** (`pluginType: 'component'`): Render actual DOM elements
2. **Data Plugins** (`pluginType: 'data'`): Modify data on existing elements (like alignment)
3. **Custom Plugins** (`pluginType: 'custom'`): Special behavior without direct rendering

### Key Exports

```typescript
// packages/plugins/content/slate/src/plugins/index.ts
export default {
  paragraphs,  // paragraph, pre
  headings,    // h1, h2, h3, h4, h5, h6
  link,        // link, anchor
  lists,       // ol, ul, li, indention
  quotes,      // blockQuote
  code,        // mark, block
  emphasize,   // em, strong, underline
  alignment,   // left, center, right, justify
};
```

## 2. Data Format

### Current Slate State Structure

```typescript
// packages/plugins/content/slate/src/types/state.ts
import type { Node, Range } from 'slate';

export type SlateState = {
  slate: Node[];
  selection?: Range | null;
};
```

### Slate Node Types

The current data format follows Slate 0.78.x conventions:

#### Element Node (Block/Inline)
```typescript
interface Element {
  type: string;           // e.g., "PARAGRAPH/PARAGRAPH", "HEADINGS/HEADING-ONE"
  data?: {                // Plugin-specific data
    align?: 'left' | 'center' | 'right' | 'justify';
    href?: string;
    openInNewWindow?: boolean;
    id?: string;
    [key: string]: unknown;
  };
  children: Node[];       // Child nodes (text or elements)
}
```

#### Text Node (Leaf)
```typescript
interface Text {
  text: string;
  // Marks are stored as properties directly on the text node
  'EMPHASIZE/STRONG'?: true;
  'EMPHASIZE/EM'?: true;
  'EMPHASIZE/U'?: true;
  'CODE/CODE'?: true;
  [markType: string]: boolean | object | undefined;
}
```

### Example Data Structure

```json
{
  "slate": [
    {
      "type": "PARAGRAPH/PARAGRAPH",
      "data": { "align": "left" },
      "children": [
        { "text": "Hello " },
        { "text": "world", "EMPHASIZE/STRONG": true },
        { "text": "!" }
      ]
    },
    {
      "type": "HEADINGS/HEADING-TWO",
      "data": {},
      "children": [
        { "text": "A Heading" }
      ]
    },
    {
      "type": "UNORDERED-LIST",
      "data": {},
      "children": [
        {
          "type": "LISTS/LIST-ITEM",
          "data": {},
          "children": [
            { "text": "First item" }
          ]
        },
        {
          "type": "LISTS/LIST-ITEM",
          "data": {},
          "children": [
            { "text": "Second item" }
          ]
        }
      ]
    }
  ],
  "selection": null
}
```

### Type Identifiers

| Plugin | Type String |
|--------|-------------|
| Paragraph | `PARAGRAPH/PARAGRAPH` |
| Pre | `PARAGRAPH/PRE` |
| Heading 1 | `HEADINGS/HEADING-ONE` |
| Heading 2 | `HEADINGS/HEADING-TWO` |
| Heading 3 | `HEADINGS/HEADING-THREE` |
| Heading 4 | `HEADINGS/HEADING-FOUR` |
| Heading 5 | `HEADINGS/HEADING-FIVE` |
| Heading 6 | `HEADINGS/HEADING-SIX` |
| Ordered List | `ORDERED-LIST` |
| Unordered List | `UNORDERED-LIST` |
| List Item | `LISTS/LIST-ITEM` |
| Block Quote | `BLOCKQUOTE/BLOCKQUOTE` |
| Code Block | `CODE/CODE` |
| Link | `LINK/LINK` |
| Bold Mark | `EMPHASIZE/STRONG` |
| Italic Mark | `EMPHASIZE/EM` |
| Underline Mark | `EMPHASIZE/U` |
| Code Mark | `CODE/CODE` |

## 3. Migration System

### Location
`packages/plugins/content/slate/src/migrations/`

### Migration History

| Version | File | From | Purpose |
|---------|------|------|---------|
| 0.0.2 | `v002.ts` | ^0.0.1 | Slate 0.33 to 0.47 format changes |
| 0.0.3 | `v003.ts` | ^0.0.2 | Leaf structure normalization |
| 0.0.4 | `v004.ts` | ^0.0.3 | Slate 0.47 to 0.50+ (modern Slate) |

### Migration Details

#### v002 (Slate 0.33 -> 0.47)
**Changes:**
- Wrapped state with `{ document: ... }` structure
- Renamed `kind` property to `object`
- Renamed `ranges` property to `leaves`

```typescript
// Key transformations:
'kind' -> 'object'
'ranges' -> 'leaves'
state.serialized -> { serialized: { document: state.serialized } }
```

#### v003 (Leaf structure normalization)
**Changes:**
- Flattened nested `leaves` arrays into direct text nodes
- Converted leaf nodes to proper text objects with `object: 'text'`

```typescript
// Before: node with leaves array
{ leaves: [{ text: "hello", marks: [...] }] }

// After: direct text nodes
[{ text: "hello", object: "text", marks: [...] }]
```

#### v004 (Slate 0.47 -> 0.50+)
**Changes:**
- Complete restructure for modern Slate API
- Removed `object` property from elements
- Marks moved from array to direct properties on text nodes
- Changed from `nodes` to `children`
- Removed `document` wrapper

```typescript
// Before (v003):
{
  serialized: {
    document: {
      nodes: [
        {
          object: 'block',
          type: 'PARAGRAPH/PARAGRAPH',
          data: {},
          nodes: [
            { object: 'text', text: 'hello', marks: [{ type: 'EMPHASIZE/STRONG', data: {} }] }
          ]
        }
      ]
    }
  }
}

// After (v004):
{
  slate: [
    {
      type: 'PARAGRAPH/PARAGRAPH',
      data: {},
      children: [
        { text: 'hello', 'EMPHASIZE/STRONG': true }
      ]
    }
  ]
}
```

## 4. Integration Points with ReactPage Core

### Main Plugin Definition
`packages/plugins/content/slate/src/index.tsx`

### CellPlugin Interface Implementation

The Slate plugin implements ReactPage's `CellPlugin<SlateState>` interface:

```typescript
export type SlateCellPlugin<TPlugins> = CellPlugin<SlateState, Omit<SlateState, 'selection'>> & {
  createData: CreateSlateData<TPlugins>;
  createDataFromHtml: (html: string) => Promise<SlateState>;
  createInitialSlateState: CreateSlateData<TPlugins>; // deprecated
};
```

### Key Integration Points

| Interface Method | Implementation |
|-----------------|----------------|
| `id` | `'ory/editor/core/content/slate'` |
| `version` | `1` |
| `Renderer` | Conditional: `SlateEditor` (edit) / `ReadOnlySlate` (read-only) |
| `Provider` | `SlateProvider` wrapping Slate context |
| `controls` | Custom controls component |
| `migrations` | Array of v002, v003, v004 |
| `serialize` | Removes `selection` from state |
| `unserialize` | Validates/initializes slate state |
| `createInitialData` | Creates empty paragraph |
| `createDataFromHtml` | `HtmlToSlate` converter |
| `getTextContents` | Extracts plain text for search indexing |

### Component Architecture

```
SlateCellPlugin
├── SlateProvider (Edit Mode)
│   ├── Slate (slate-react context)
│   ├── DialogVisibleProvider
│   └── SlateEditor
│       ├── HoverButtons
│       └── Editable (slate-react)
│           ├── renderElement (useRenderElement hook)
│           └── renderLeaf (useRenderLeave hook)
└── ReadOnlySlate (Read-Only Mode)
    └── SlateReactPresentation (slate-react-presentation)
        ├── renderElement
        └── renderLeaf
```

### Editor Enhancers

Located in `packages/plugins/content/slate/src/slateEnhancer/`:

1. **withInline**: Configures which elements are inline and void
2. **withPaste**: Handles HTML, plain text, and Slate fragment pasting

### HTML Import/Export

Located in `packages/plugins/content/slate/src/htmlToSlate/`:

- `HtmlToSlate`: Converts HTML string to Slate state
- Uses `slate-hyperscript` for JSX-like node creation
- Parses HTML using browser DOMParser or xmldom (Node.js)

### Plugin Factory Functions

Located in `packages/plugins/content/slate/src/pluginFactories/`:

| Factory | Purpose |
|---------|---------|
| `createComponentPlugin` | Creates block/inline/mark plugins with Component |
| `createMarkPlugin` | Simplified mark creation (bold, italic, etc.) |
| `createDataPlugin` | Creates data-modifying plugins (alignment) |
| `createHeadingsPlugin` | Specialized heading factory |
| `createListPlugin` | List container factory |
| `createListItemPlugin` | List item factory |
| `createListIndentionPlugin` | Indentation controls |
| `createSimpleHtmlBlockPlugin` | Simple HTML element blocks |

## 5. Dependencies

### From `packages/plugins/content/slate/package.json`

#### Slate Core Packages
| Package | Version | Purpose |
|---------|---------|---------|
| `slate` | `^0.78.0` | Core Slate framework |
| `slate-react` | `^0.79.0` | React bindings for Slate |
| `slate-hyperscript` | `^0.77.0` | JSX-like API for creating Slate values |
| `slate-react-presentation` | `^0.1.1` | Read-only Slate renderer |

#### Supporting Packages
| Package | Version | Purpose |
|---------|---------|---------|
| `@xmldom/xmldom` | `^0.8.1` | Server-side HTML parsing |
| `cssstyle` | `^2.3.0` | CSS style parsing for HTML import |
| `is-hotkey` | `^0.2.0` | Keyboard shortcut detection |
| `deep-rename-keys` | `^0.2.1` | Object key transformation (migrations) |
| `redux-undo` | `^1.0.0` | Undo/redo state management |
| Various lodash | ^4.x | Utility functions |

#### Peer Dependencies
| Package | Version |
|---------|---------|
| `react` | `>= 16.14` |
| `react-dom` | `>= 16.14` |
| `@mui/material` | `*` |

## Summary

### Strengths of Current Implementation
1. Well-organized plugin architecture with factory functions
2. Comprehensive migration system for version upgrades
3. Separate read-only renderer for performance
4. HTML import/export capabilities
5. Customizable through plugin composition

### Technical Debt / Considerations
1. Three migrations indicate significant Slate API churn
2. Complex data structure with namespaced type strings
3. `slate-react-presentation` is a small package (may need maintenance)
4. Comment in code notes: "slate broke the controlled input pattern"
5. Some workarounds for Slate quirks (void element handling, selection management)

### Files Referenced
- Main plugin: `packages/plugins/content/slate/src/index.tsx`
- Types: `packages/plugins/content/slate/src/types/`
- Plugins: `packages/plugins/content/slate/src/plugins/`
- Migrations: `packages/plugins/content/slate/src/migrations/`
- Components: `packages/plugins/content/slate/src/components/`
- Factories: `packages/plugins/content/slate/src/pluginFactories/`
- HTML conversion: `packages/plugins/content/slate/src/htmlToSlate/`
- Enhancers: `packages/plugins/content/slate/src/slateEnhancer/`
