# Slate Sub-Plugins to Tiptap Extension Mapping

This document provides a detailed mapping between ReactPage's current Slate sub-plugins and their Tiptap extension equivalents, identifying gaps and custom development requirements.

## 1. Plugin Mapping Table

### Block Elements

| Slate Plugin | Type ID | Tiptap Extension | Parity | Custom Dev | Notes |
|--------------|---------|------------------|--------|------------|-------|
| **paragraph** | `PARAGRAPH/PARAGRAPH` | `@tiptap/extension-paragraph` | Full | No | Built-in, supports HTML attributes |
| **pre** | `PARAGRAPH/PRE` | `@tiptap/extension-code-block` | Partial | Minor | Tiptap uses CodeBlock for `<pre>`, different semantics |
| **h1** | `HEADINGS/HEADING-ONE` | `@tiptap/extension-heading` (level: 1) | Full | No | Single extension handles all levels |
| **h2** | `HEADINGS/HEADING-TWO` | `@tiptap/extension-heading` (level: 2) | Full | No | Configure with `levels: [1,2,3,4,5,6]` |
| **h3** | `HEADINGS/HEADING-THREE` | `@tiptap/extension-heading` (level: 3) | Full | No | |
| **h4** | `HEADINGS/HEADING-FOUR` | `@tiptap/extension-heading` (level: 4) | Full | No | |
| **h5** | `HEADINGS/HEADING-FIVE` | `@tiptap/extension-heading` (level: 5) | Full | No | |
| **h6** | `HEADINGS/HEADING-SIX` | `@tiptap/extension-heading` (level: 6) | Full | No | |
| **blockQuote** | `BLOCKQUOTE/BLOCKQUOTE` | `@tiptap/extension-blockquote` | Full | No | Built-in |
| **code block** | `CODE/CODE` | `@tiptap/extension-code-block` | Full | No | Supports syntax highlighting via `code-block-lowlight` |

### List Elements

| Slate Plugin | Type ID | Tiptap Extension | Parity | Custom Dev | Notes |
|--------------|---------|------------------|--------|------------|-------|
| **ul** | `UNORDERED-LIST` | `@tiptap/extension-bullet-list` | Full | No | Tiptap v3 requires separate package |
| **ol** | `ORDERED-LIST` | `@tiptap/extension-ordered-list` | Full | No | Tiptap v3 requires separate package |
| **li** | `LISTS/LIST-ITEM` | `@tiptap/extension-list-item` | Full | No | Included with list packages |
| **indention** (increase) | N/A (custom) | Built-in command | Full | No | `sinkListItem('listItem')` command |
| **indention** (decrease) | N/A (custom) | Built-in command | Full | No | `liftListItem('listItem')` command |

### Inline Elements

| Slate Plugin | Type ID | Tiptap Extension | Parity | Custom Dev | Notes |
|--------------|---------|------------------|--------|------------|-------|
| **link** | `LINK/LINK` | `@tiptap/extension-link` | Full | Minor | Tiptap uses `href` + `target`, same as Slate |

### Mark Elements (Inline Formatting)

| Slate Plugin | Type ID | Tiptap Extension | Parity | Custom Dev | Notes |
|--------------|---------|------------------|--------|------------|-------|
| **strong** | `EMPHASIZE/STRONG` | `@tiptap/extension-bold` | Full | No | Hotkey: Mod+B (same) |
| **em** | `EMPHASIZE/EM` | `@tiptap/extension-italic` | Full | No | Hotkey: Mod+I (same) |
| **underline** | `EMPHASIZE/U` | `@tiptap/extension-underline` | Full | No | Hotkey: Mod+U (same) |
| **code mark** | `CODE/CODE` | `@tiptap/extension-code` | Full | No | Inline code formatting |

### Data Plugins (Modifiers)

| Slate Plugin | Type ID | Tiptap Extension | Parity | Custom Dev | Notes |
|--------------|---------|------------------|--------|------------|-------|
| **align left** | data: `{ align: 'left' }` | `@tiptap/extension-text-align` | Full | No | Works on paragraph, heading, etc. |
| **align center** | data: `{ align: 'center' }` | `@tiptap/extension-text-align` | Full | No | |
| **align right** | data: `{ align: 'right' }` | `@tiptap/extension-text-align` | Full | No | |
| **align justify** | data: `{ align: 'justify' }` | `@tiptap/extension-text-align` | Full | No | |
| **anchor** | data: `{ id: string }` | Custom extension needed | None | Medium | See "Custom Development" section |

## 2. Gap Analysis

### Plugins with No Direct Tiptap Equivalent

| Plugin | Gap Description | Solution |
|--------|-----------------|----------|
| **anchor** | Tiptap has no built-in anchor/ID attribute extension | Create custom extension that adds `id` attribute to blocks |
| **pre** (standalone) | Tiptap's CodeBlock is for code, not generic preformatted text | Could extend Paragraph with `pre` wrapper or create custom node |

### Plugins Requiring Custom Extension Development

#### Anchor Extension (Medium Effort)

The anchor plugin in ReactPage allows adding an `id` attribute to any block element for in-page navigation. Tiptap does not have a built-in equivalent.

**Required Implementation:**
```typescript
import { Extension } from '@tiptap/core'

const Anchor = Extension.create({
  name: 'anchor',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'blockquote'],
        attributes: {
          id: {
            default: null,
            renderHTML: attributes => {
              if (!attributes.id) return {}
              return { id: attributes.id }
            },
            parseHTML: element => element.getAttribute('id'),
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setAnchor: (id: string) => ({ commands }) => {
        return commands.updateAttributes('paragraph', { id })
      },
      unsetAnchor: () => ({ commands }) => {
        return commands.updateAttributes('paragraph', { id: null })
      },
    }
  },
})
```

**Effort:** Small-Medium (1-2 days)
**Risk:** Low - straightforward attribute extension

#### Pre Block Extension (Optional)

If semantic `<pre>` blocks (not code blocks) are needed:

**Effort:** Small (0.5-1 day)
**Risk:** Low

### Plugins with Partial Parity

| Plugin | Difference | Impact |
|--------|------------|--------|
| **link** | Tiptap Link has additional options (autolink, linkOnPaste, protocols) | Benefit - more features available |
| **code block** | Tiptap CodeBlock supports language attribute and syntax highlighting | Benefit - enhanced functionality |
| **heading** | Tiptap uses single extension for all levels vs. 6 separate plugins | Simplification - easier to manage |

## 3. Feature Comparison

### Paragraph Plugin

| Feature | ReactPage/Slate | Tiptap |
|---------|-----------------|--------|
| Basic rendering | `<p>` element | `<p>` element |
| Alignment support | Via data plugin | Via TextAlign extension |
| HTML attributes | Via `attributes` prop | Via `HTMLAttributes` config |
| Custom classes | Manual | Built-in `HTMLAttributes.class` |
| Deserialization | `tagName: 'p'` | `parseHTML: [{ tag: 'p' }]` |

**API Comparison:**

```typescript
// ReactPage/Slate
createComponentPlugin({
  type: 'PARAGRAPH/PARAGRAPH',
  object: 'block',
  deserialize: { tagName: 'p', getData: getAlignmentFromElement },
  getStyle: ({ align }) => ({ textAlign: align }),
  Component: 'p',
})

// Tiptap
Paragraph.configure({
  HTMLAttributes: { class: 'my-paragraph' },
})
// TextAlign extension handles alignment separately
```

### Link Plugin

| Feature | ReactPage/Slate | Tiptap |
|---------|-----------------|--------|
| href attribute | Yes | Yes |
| target="_blank" | `openInNewWindow` boolean | `target` option or HTMLAttributes |
| rel attribute | Not implemented | Built-in `rel: 'noopener noreferrer'` |
| Auto-link detection | Not implemented | Built-in `autolink: true` |
| Link on paste | Not implemented | Built-in `linkOnPaste: true` |
| Protocol validation | Not implemented | Built-in `protocols: ['http', 'https', ...]` |
| Controls UI | Autoform schema | Custom or use FloatingMenu |

**API Comparison:**

```typescript
// ReactPage/Slate
createComponentPlugin<LinkData>({
  type: 'LINK/LINK',
  object: 'inline',
  controls: {
    type: 'autoform',
    schema: {
      properties: { href: { type: 'string' }, openInNewWindow: { type: 'boolean' } },
    },
  },
  Component: ({ children, openInNewWindow, href, attributes }) => (
    <a {...attributes} target={openInNewWindow ? '_blank' : undefined} href={href}>
      {children}
    </a>
  ),
})

// Tiptap
Link.configure({
  openOnClick: false,
  autolink: true,
  HTMLAttributes: { rel: 'noopener noreferrer' },
})
```

### List Plugins

| Feature | ReactPage/Slate | Tiptap |
|---------|-----------------|--------|
| Ordered list | Separate `ol` plugin | `@tiptap/extension-ordered-list` |
| Unordered list | Separate `ul` plugin | `@tiptap/extension-bullet-list` |
| List item | Separate `li` plugin | `@tiptap/extension-list-item` |
| Nested lists | Custom indention plugin | Built-in `sinkListItem`/`liftListItem` |
| Tab to indent | Custom implementation | Built-in keyboard shortcut |
| Backspace at start | Custom implementation | Built-in behavior |

**API Comparison:**

```typescript
// ReactPage/Slate - requires custom indention plugin
createIndentionPlugin({
  iconIncrease: <IncreaseIndentIcon />,
  iconDecrease: <DecreaseIndentIcon />,
  listItemType: 'LISTS/LIST-ITEM',
})

// Tiptap - built-in commands
editor.commands.sinkListItem('listItem')  // Increase indent
editor.commands.liftListItem('listItem')  // Decrease indent
```

### Text Alignment

| Feature | ReactPage/Slate | Tiptap |
|---------|-----------------|--------|
| Implementation | 4 separate data plugins | Single TextAlign extension |
| Applies to | Blocks with align data | Configurable node types |
| Storage | `data.align` property | `attrs.textAlign` attribute |
| Default value | Not specified | `'left'` (configurable) |

**API Comparison:**

```typescript
// ReactPage/Slate - 4 data plugins
createDataPlugin<{ align: 'left' }>({
  dataMatches: (data) => data?.align === 'left',
  getInitialData: () => ({ align: 'left' }),
})
// Repeat for center, right, justify

// Tiptap - single extension
TextAlign.configure({
  types: ['heading', 'paragraph'],
  alignments: ['left', 'center', 'right', 'justify'],
  defaultAlignment: 'left',
})
```

### Marks (Bold, Italic, Underline)

| Feature | ReactPage/Slate | Tiptap |
|---------|-----------------|--------|
| Hotkeys | `mod+b`, `mod+i`, `mod+u` | Same defaults |
| Storage | Boolean on text node | Mark array on text node |
| Toggle behavior | `Editor.toggleMark()` | `editor.commands.toggleBold()` |
| HTML output | `<strong>`, `<em>`, `<u>` | Same defaults |

Both implementations are functionally equivalent with similar APIs.

## 4. Custom Development Estimates

### Required Custom Extensions

| Extension | Complexity | Effort | Risk | Priority |
|-----------|------------|--------|------|----------|
| Anchor (ID attribute) | Small | 1-2 days | Low | High |

### Optional Enhancements

| Extension | Complexity | Effort | Risk | Priority |
|-----------|------------|--------|------|----------|
| Pre block (non-code) | Small | 0.5-1 day | Low | Low |
| Custom toolbar integration | Medium | 2-3 days | Medium | High |
| MUI icon integration | Small | 1 day | Low | Medium |

### Migration Utilities

| Utility | Complexity | Effort | Risk | Priority |
|---------|------------|--------|------|----------|
| Data format transformer | Medium | 2-3 days | Medium | Critical |
| Type ID mapper | Small | 0.5 day | Low | Critical |
| Mark format converter | Small | 0.5 day | Low | Critical |

## 5. Package Dependencies Comparison

### Current Slate Dependencies

```json
{
  "slate": "^0.78.0",
  "slate-react": "^0.79.0",
  "slate-hyperscript": "^0.77.0",
  "slate-react-presentation": "^0.1.1"
}
```

### Required Tiptap Packages

```json
{
  "@tiptap/core": "^3.0.0",
  "@tiptap/react": "^3.0.0",
  "@tiptap/pm": "^3.0.0",
  "@tiptap/extension-document": "^3.0.0",
  "@tiptap/extension-paragraph": "^3.0.0",
  "@tiptap/extension-text": "^3.0.0",
  "@tiptap/extension-heading": "^3.0.0",
  "@tiptap/extension-bold": "^3.0.0",
  "@tiptap/extension-italic": "^3.0.0",
  "@tiptap/extension-underline": "^3.0.0",
  "@tiptap/extension-link": "^3.0.0",
  "@tiptap/extension-blockquote": "^3.0.0",
  "@tiptap/extension-code": "^3.0.0",
  "@tiptap/extension-code-block": "^3.0.0",
  "@tiptap/extension-bullet-list": "^3.0.0",
  "@tiptap/extension-ordered-list": "^3.0.0",
  "@tiptap/extension-list-item": "^3.0.0",
  "@tiptap/extension-text-align": "^3.0.0",
  "@tiptap/extension-history": "^3.0.0"
}
```

Or use StarterKit + additional extensions:

```json
{
  "@tiptap/core": "^3.0.0",
  "@tiptap/react": "^3.0.0",
  "@tiptap/starter-kit": "^3.0.0",
  "@tiptap/extension-underline": "^3.0.0",
  "@tiptap/extension-link": "^3.0.0",
  "@tiptap/extension-text-align": "^3.0.0"
}
```

## 6. Summary

### Coverage Assessment

| Category | Total Plugins | Direct Equivalent | Needs Custom | No Equivalent |
|----------|--------------|-------------------|--------------|---------------|
| Block Elements | 10 | 9 | 1 (pre) | 0 |
| List Elements | 4 | 4 | 0 | 0 |
| Inline Elements | 1 | 1 | 0 | 0 |
| Marks | 4 | 4 | 0 | 0 |
| Data Plugins | 5 | 4 | 1 (anchor) | 0 |
| **Total** | **24** | **22** | **2** | **0** |

### Migration Feasibility: HIGH

- **92% direct mapping** (22/24 plugins)
- Only **2 custom extensions** needed (both small effort)
- Tiptap provides **additional features** not in current implementation
- **Built-in list indentation** replaces custom plugin
- **Single alignment extension** replaces 4 data plugins

### Recommended Approach

1. **Use StarterKit** as base (includes paragraph, headings, bold, italic, code, blockquote, lists)
2. **Add individual extensions** for: underline, link, text-align
3. **Create custom anchor extension** for ID attributes
4. **Optional**: Create pre block extension if needed
5. **Build data migration utility** to transform existing content

### Risk Areas

1. **Data migration** - Need thorough testing of format transformation
2. **Toolbar integration** - Need to adapt ReactPage's toolbar system to Tiptap commands
3. **Controls UI** - ReactPage's autoform controls need equivalent in Tiptap context
4. **Read-only rendering** - Need to verify Tiptap SSR/read-only matches current behavior
