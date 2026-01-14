# Tiptap Architecture and Extension Model Analysis

This document analyzes Tiptap's architecture, comparing it to Slate.js to evaluate its suitability as an alternative for ReactPage's rich text editing needs.

## 1. Architecture Overview

### Core Concepts

Tiptap is a **headless rich text editor framework** that wraps ProseMirror in a modern, accessible API. Unlike Slate which provides its own document model, Tiptap leverages the battle-tested ProseMirror library.

| Component | Tiptap | Slate |
|-----------|--------|-------|
| Foundation | ProseMirror | Custom implementation |
| Document Model | ProseMirror's immutable tree | Slate's mutable tree |
| State Management | ProseMirror EditorState + Transactions | Slate Editor with transforms |
| React Integration | `@tiptap/react` wrapper | `slate-react` |

### How Tiptap Wraps ProseMirror

```
Tiptap Layer
├── Extensions (simplified API)
│   ├── Nodes (block elements)
│   ├── Marks (inline formatting)
│   └── Functionality (behaviors)
├── Commands (action API)
├── Events (reactive updates)
└── Editor Instance
    └── ProseMirror Core
        ├── EditorState (document + selection + marks)
        ├── Schema (content structure)
        ├── Transactions (state changes)
        └── Plugins (behaviors)
```

Tiptap abstracts ProseMirror's complexity while exposing the underlying API through `@tiptap/pm` for advanced use cases.

### React Integration Approach

```typescript
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const MyEditor = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World!</p>',
  })

  return <EditorContent editor={editor} />
}
```

**Key differences from Slate:**
- `useEditor` hook creates the editor instance
- `EditorContent` renders the editor (vs Slate's `<Editable>`)
- Content is passed as HTML or JSON (vs Slate's value prop)
- Extensions configure available features (vs Slate plugins)

### State Management Comparison

| Aspect | Tiptap/ProseMirror | Slate |
|--------|-------------------|-------|
| Update Pattern | Transactions (immutable) | Direct mutations via Transforms |
| Controlled Input | Yes (through transactions) | Historically broken, workarounds needed |
| Undo/Redo | Built-in via history plugin | Redux-undo or custom |
| State Updates | Transaction dispatch | onChange callback |

Tiptap v3 defaults to not re-rendering on every transaction (`shouldRerenderOnTransaction: false`), improving performance.

## 2. Extension Model

### How Extensions Work

Tiptap's extension system is the core of its architecture. Everything is an extension, including basic functionality.

```typescript
import { Extension } from '@tiptap/core'

const MyExtension = Extension.create({
  name: 'myExtension',

  // Configuration options
  addOptions() {
    return {
      myOption: 'default',
    }
  },

  // Add editor commands
  addCommands() {
    return {
      myCommand: () => ({ commands }) => {
        return commands.insertContent('Hello!')
      },
    }
  },

  // Keyboard shortcuts
  addKeyboardShortcuts() {
    return {
      'Mod-j': () => this.editor.commands.myCommand(),
    }
  },
})
```

### Extension Types

| Type | Purpose | Slate Equivalent |
|------|---------|-----------------|
| **Node** | Block-level content (paragraph, heading, list) | Element plugins (pluginType: 'component') |
| **Mark** | Inline formatting (bold, italic, link) | Leaf/mark plugins |
| **Extension** | Functionality (history, collaboration) | Editor plugins, custom behaviors |

### Comparison: Plugin Creation

**Tiptap Node Extension:**
```typescript
import { Node } from '@tiptap/core'

const Paragraph = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',

  parseHTML() {
    return [{ tag: 'p' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', HTMLAttributes, 0]
  },
})
```

**Slate Plugin (ReactPage current approach):**
```typescript
const paragraph = createComponentPlugin({
  type: 'PARAGRAPH/PARAGRAPH',
  object: 'block',
  addToolbarButton: true,
  addHoverButton: false,
  deserialize: {
    tagName: 'p',
  },
  Component: ({ children, attributes }) => (
    <p {...attributes}>{children}</p>
  ),
})
```

### Built-in Extensions

Tiptap provides 100+ extensions across categories:

**Nodes (26+):**
- Paragraph, Heading (6 levels), Blockquote
- BulletList, OrderedList, ListItem, TaskList
- CodeBlock, HorizontalRule, Image, Table
- Details, YouTube, Figure, and more

**Marks (12+):**
- Bold, Italic, Underline, Strike
- Code, Link, Highlight, Subscript, Superscript
- TextStyle (for custom styles)

**Functionality (20+):**
- History, Placeholder, CharacterCount
- Collaboration, Typography, Focus
- Dropcursor, Gapcursor, FloatingMenu

### Creating Custom Extensions

Tiptap provides factory methods and configuration:

```typescript
// Extend existing extension
const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      textAlign: {
        default: 'left',
        renderHTML: attributes => ({
          style: `text-align: ${attributes.textAlign}`,
        }),
      },
    }
  },
})

// Configure extension
StarterKit.configure({
  heading: {
    levels: [1, 2, 3],
  },
  paragraph: {
    HTMLAttributes: {
      class: 'my-paragraph',
    },
  },
})
```

## 3. Data Model Comparison

### Document Structure

**ProseMirror/Tiptap:**
```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "attrs": { "textAlign": "left" },
      "content": [
        { "type": "text", "text": "Hello " },
        {
          "type": "text",
          "marks": [{ "type": "bold" }],
          "text": "world"
        },
        { "type": "text", "text": "!" }
      ]
    }
  ]
}
```

**Slate (ReactPage current):**
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
    }
  ]
}
```

### Key Differences

| Aspect | Tiptap/ProseMirror | Slate |
|--------|-------------------|-------|
| Root wrapper | `{ type: "doc", content: [...] }` | `{ slate: [...] }` |
| Type names | Simple (`paragraph`, `bold`) | Namespaced (`PARAGRAPH/PARAGRAPH`) |
| Marks | Array on text node | Properties on text node |
| Attributes | `attrs` object | `data` object |
| Inline content | Flat sequence | Flat sequence |

### Schema Definition

ProseMirror uses a declarative schema system:

```typescript
const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: {
      group: 'block',
      content: 'inline*',
      toDOM: () => ['p', 0],
    },
    text: { group: 'inline' },
  },
  marks: {
    bold: {
      toDOM: () => ['strong', 0],
    },
  },
})
```

Tiptap generates schema automatically from extensions, but the schema is strict - content must conform to defined structure.

### Marks vs Properties

| Tiptap Marks | Slate Marks |
|--------------|-------------|
| Stored as array of mark objects | Stored as boolean properties |
| `marks: [{ type: "bold" }, { type: "italic" }]` | `"EMPHASIZE/STRONG": true, "EMPHASIZE/EM": true` |
| Can have attributes | Boolean only (typically) |

## 4. Stability Assessment

### Version History

| Milestone | Date | Notes |
|-----------|------|-------|
| Tiptap 1.x | ~2018 | Initial Vue-focused release |
| Tiptap 2.0 | Early 2023 | Major rewrite, framework-agnostic |
| Tiptap 2.x | 2023-2025 | Stable releases, regular updates |
| Tiptap 3.0 | July 2025 | Current stable version |

### Breaking Change Patterns

**Tiptap 2.x to 3.x breaking changes:**
- List/table extensions moved to separate packages
- Floating UI added as peer dependency
- UMD builds discontinued (ESM/CJS only)
- `shouldRerenderOnTransaction` default changed
- `setContent`/`clearContent` emit updates by default

These are relatively manageable migrations compared to Slate's 0.4x to 0.5x changes.

### Release Frequency

- Multiple releases per week in 2025
- Consistent maintenance and bug fixes
- Active development with new features

### Commercial Backing

**Tiptap GmbH:**
- Founded: 2022 in Berlin, Germany
- Team: ~16 employees
- Funding: $2.6M Seed (led by Expa, Y Combinator)
- Business Model: Open core (MIT core, paid features)

**Notable Customers:**
- LinkedIn, GitLab, Axios, Anthropic
- 3+ million npm downloads per month

### Comparison: Corporate Support

| Aspect | Tiptap | Slate |
|--------|--------|-------|
| Company | Tiptap GmbH (VC-backed) | Open source, no company |
| Maintainers | Paid team + community | Volunteer maintainers |
| Commercial Support | Available (enterprise plans) | Community only |
| Funding Model | Paid extensions + cloud | Donations/sponsorships |

## 5. Ecosystem Evaluation

### npm Download Statistics (Jan 2026)

| Package | Weekly Downloads | GitHub Stars |
|---------|-----------------|--------------|
| @tiptap/core | ~4.2M | 34,500+ |
| slate | ~1.7M | 31,400+ |

Tiptap has 2.5x the download volume despite being younger (5 years vs 14 years).

### Official Extensions

**Core Extensions (free, MIT):**
- All basic formatting (bold, italic, underline, strike)
- Block elements (paragraph, heading, blockquote, lists)
- Tables, images, code blocks
- History, placeholder, typography

**Pro Extensions (paid):**
- Collaboration (real-time editing)
- AI integration
- Advanced tables
- Comments, version history
- Emoji picker, math equations

### Community Extensions

The [awesome-tiptap](https://github.com/ueberdosis/awesome-tiptap) repository tracks community extensions:
- Custom node types
- Framework integrations (Vue, Svelte, Angular)
- Additional formatting options
- Special content types

### Collaboration Support

Tiptap offers robust collaboration features:
- **Hocuspocus**: Open-source WebSocket backend
- **Yjs CRDT**: Conflict-free data synchronization
- **Tiptap Cloud**: Managed hosting option

Features:
- Real-time cursor positions
- User presence awareness
- Version history
- Comments and threads

### Documentation Quality

**Strengths:**
- Comprehensive API documentation
- Interactive examples
- Framework-specific guides
- Migration guides between versions
- Active Discord community

**Weaknesses:**
- Some advanced ProseMirror concepts require external docs
- Pro extension docs behind paywall

## 6. Migration Considerations for ReactPage

### Effort Comparison

| Task | Difficulty | Notes |
|------|------------|-------|
| Plugin migration | Medium | Different extension API, but 1:1 mapping possible |
| Data migration | Medium | JSON structure differs, needs transformer |
| Type system | Low | Both TypeScript-first |
| HTML import/export | Low | Tiptap has built-in support |
| Custom rendering | Medium | NodeView API differs from Slate renderElement |

### Mapping ReactPage Plugins to Tiptap

| ReactPage Plugin | Tiptap Extension |
|-----------------|------------------|
| paragraph | `@tiptap/extension-paragraph` |
| headings (h1-h6) | `@tiptap/extension-heading` |
| link | `@tiptap/extension-link` |
| lists (ol, ul, li) | `@tiptap/extension-bullet-list`, `ordered-list`, `list-item` |
| blockQuote | `@tiptap/extension-blockquote` |
| code (block, mark) | `@tiptap/extension-code-block`, `code` |
| emphasize (bold, italic, underline) | `@tiptap/extension-bold`, `italic`, `underline` |
| alignment | Custom extension or TextStyle + CSS |

### Data Migration Strategy

A migration function would transform:

```javascript
// From Slate format
{
  "type": "PARAGRAPH/PARAGRAPH",
  "data": { "align": "center" },
  "children": [
    { "text": "Hello", "EMPHASIZE/STRONG": true }
  ]
}

// To Tiptap format
{
  "type": "paragraph",
  "attrs": { "textAlign": "center" },
  "content": [
    {
      "type": "text",
      "marks": [{ "type": "bold" }],
      "text": "Hello"
    }
  ]
}
```

## 7. Summary

### Advantages of Tiptap

1. **Stability**: ProseMirror foundation is battle-tested; VC-backed company
2. **Ecosystem**: 100+ extensions, active community, 4M+ weekly downloads
3. **React Integration**: Clean hooks API, good TypeScript support
4. **Collaboration**: Built-in real-time editing via Yjs
5. **Documentation**: Comprehensive, well-maintained
6. **Performance**: Optimized re-rendering, SSR support

### Disadvantages/Risks

1. **Learning Curve**: ProseMirror concepts required for advanced customization
2. **Migration Effort**: Data format and plugin architecture differ significantly
3. **Pro Extensions**: Some features require paid subscription
4. **Schema Strictness**: Less flexible than Slate for unusual document structures

### Recommendation

Tiptap is a strong candidate for replacing Slate in ReactPage based on:
- Better stability and commercial backing
- Larger ecosystem and community
- Modern React integration patterns
- Built-in collaboration support

The migration would require:
1. Rewriting all plugins as Tiptap extensions
2. Creating data migration for existing content
3. Updating HTML import/export logic
4. Adjusting any custom rendering logic

Next steps should include prototyping a basic integration to validate feasibility.
