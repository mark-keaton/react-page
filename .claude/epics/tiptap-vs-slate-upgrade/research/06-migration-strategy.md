# Content Migration Strategy: Slate to Tiptap/ProseMirror

This document evaluates strategies for migrating existing Slate-format content to Tiptap/ProseMirror format, addressing ReactPage's non-negotiable backward compatibility constraint.

## 1. Data Format Comparison

### Simple Paragraph

**Slate Format:**
```json
{
  "slate": [
    {
      "type": "PARAGRAPH/PARAGRAPH",
      "children": [{ "text": "Hello world" }]
    }
  ]
}
```

**Tiptap/ProseMirror Format:**
```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "Hello world" }]
    }
  ]
}
```

### Formatted Text (Bold + Italic)

**Slate Format:**
```json
{
  "slate": [
    {
      "type": "PARAGRAPH/PARAGRAPH",
      "children": [
        { "text": "This is " },
        { "text": "bold", "EMPHASIZE/STRONG": true },
        { "text": " and " },
        { "text": "italic", "EMPHASIZE/EM": true },
        { "text": " text" }
      ]
    }
  ]
}
```

**Tiptap/ProseMirror Format:**
```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "This is " },
        { "type": "text", "marks": [{ "type": "bold" }], "text": "bold" },
        { "type": "text", "text": " and " },
        { "type": "text", "marks": [{ "type": "italic" }], "text": "italic" },
        { "type": "text", "text": " text" }
      ]
    }
  ]
}
```

### Headings

**Slate Format:**
```json
{
  "slate": [
    {
      "type": "HEADINGS/HEADING-TWO",
      "children": [{ "text": "My Heading" }]
    }
  ]
}
```

**Tiptap/ProseMirror Format:**
```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 2 },
      "content": [{ "type": "text", "text": "My Heading" }]
    }
  ]
}
```

### Lists

**Slate Format:**
```json
{
  "slate": [
    {
      "type": "UNORDERED-LIST",
      "data": {},
      "children": [
        {
          "type": "LISTS/LIST-ITEM",
          "data": {},
          "children": [{ "text": "First item" }]
        },
        {
          "type": "LISTS/LIST-ITEM",
          "data": {},
          "children": [{ "text": "Second item" }]
        }
      ]
    }
  ]
}
```

**Tiptap/ProseMirror Format:**
```json
{
  "type": "doc",
  "content": [
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [{ "type": "text", "text": "First item" }]
            }
          ]
        },
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [{ "type": "text", "text": "Second item" }]
            }
          ]
        }
      ]
    }
  ]
}
```

**Key difference:** ProseMirror list items require a paragraph wrapper around text content.

### Links (Inline Elements)

**Slate Format:**
```json
{
  "slate": [
    {
      "type": "PARAGRAPH/PARAGRAPH",
      "children": [
        { "text": "Click " },
        {
          "type": "LINK/LINK",
          "data": { "href": "https://example.com", "openInNewWindow": true },
          "children": [{ "text": "here" }]
        },
        { "text": " for more" }
      ]
    }
  ]
}
```

**Tiptap/ProseMirror Format:**
```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Click " },
        {
          "type": "text",
          "marks": [{ "type": "link", "attrs": { "href": "https://example.com", "target": "_blank" } }],
          "text": "here"
        },
        { "type": "text", "text": " for more" }
      ]
    }
  ]
}
```

**Key difference:** Tiptap treats links as marks on text, not inline elements with children.

### Text with Alignment

**Slate Format:**
```json
{
  "slate": [
    {
      "type": "PARAGRAPH/PARAGRAPH",
      "data": { "align": "center" },
      "children": [{ "text": "Centered text" }]
    }
  ]
}
```

**Tiptap/ProseMirror Format:**
```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "attrs": { "textAlign": "center" },
      "content": [{ "type": "text", "text": "Centered text" }]
    }
  ]
}
```

### Nested Structures (Blockquote with Formatted Text)

**Slate Format:**
```json
{
  "slate": [
    {
      "type": "BLOCKQUOTE/BLOCKQUOTE",
      "data": {},
      "children": [
        { "text": "A " },
        { "text": "profound", "EMPHASIZE/EM": true },
        { "text": " quote" }
      ]
    }
  ]
}
```

**Tiptap/ProseMirror Format:**
```json
{
  "type": "doc",
  "content": [
    {
      "type": "blockquote",
      "content": [
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "A " },
            { "type": "text", "marks": [{ "type": "italic" }], "text": "profound" },
            { "type": "text", "text": " quote" }
          ]
        }
      ]
    }
  ]
}
```

**Key difference:** ProseMirror blockquotes contain paragraphs; Slate allows direct text children.

## 2. Migration Approach Options

### Option A: Runtime Migration (Convert on Read)

**How it works:**
- Detect Slate format on content load
- Convert to Tiptap format in memory
- Store back in Tiptap format on next save
- Gradual migration as content is accessed

**Pros:**
- Zero downtime deployment
- No batch migration job needed
- Natural rollout over time
- Easy to test incrementally
- Users don't notice the transition

**Cons:**
- Runtime overhead on every read (until converted)
- Must maintain both parsers in production
- Potential version inconsistencies in database
- Harder to debug issues across formats
- Could cause subtle UI differences during transition

**Implementation complexity:** Medium

### Option B: Batch Migration

**How it works:**
- One-time script converts all stored content
- Run during planned maintenance window
- Validate all converted content
- Deploy Tiptap-only code after migration

**Pros:**
- Clean cutover - one format in production
- No runtime overhead
- Easier to reason about data
- Can validate entire dataset before going live
- Simpler code - no dual format handling

**Cons:**
- Requires downtime or read-only period
- Risk of failed migration blocking deployment
- Large databases take time to migrate
- Must handle migration failures gracefully
- No gradual rollback possible

**Implementation complexity:** Low-Medium (depending on data volume)

### Option C: Dual Format Support

**How it works:**
- Tiptap editor accepts both formats as input
- Internal state uses Tiptap format
- Output can be either format (configurable)
- Permanent support for legacy format

**Pros:**
- No migration needed
- Maximum backward compatibility
- Users can migrate at their own pace
- Safest option for existing deployments
- Supports mixed ecosystems

**Cons:**
- Permanent code complexity
- Two parsers to maintain forever
- Harder to add new features consistently
- Technical debt accumulates
- Testing matrix doubles

**Implementation complexity:** High (ongoing)

## 3. Node Type Mapping

### Direct Mappings

| Slate Type | Tiptap Type | Notes |
|------------|-------------|-------|
| `PARAGRAPH/PARAGRAPH` | `paragraph` | Direct mapping |
| `HEADINGS/HEADING-ONE` | `heading` (level: 1) | Attribute change |
| `HEADINGS/HEADING-TWO` | `heading` (level: 2) | Attribute change |
| `HEADINGS/HEADING-THREE` | `heading` (level: 3) | Attribute change |
| `HEADINGS/HEADING-FOUR` | `heading` (level: 4) | Attribute change |
| `HEADINGS/HEADING-FIVE` | `heading` (level: 5) | Attribute change |
| `HEADINGS/HEADING-SIX` | `heading` (level: 6) | Attribute change |
| `BLOCKQUOTE/BLOCKQUOTE` | `blockquote` | May need paragraph wrapper |
| `CODE/CODE` (block) | `codeBlock` | Direct mapping |
| `PARAGRAPH/PRE` | `codeBlock` | Format consolidation |

### Transformations Required

| Slate Type | Tiptap Type | Transformation |
|------------|-------------|----------------|
| `UNORDERED-LIST` | `bulletList` | Rename + list item wrapping |
| `ORDERED-LIST` | `orderedList` | Rename + list item wrapping |
| `LISTS/LIST-ITEM` | `listItem` | Add paragraph wrapper around content |
| `LINK/LINK` (inline element) | `link` (mark) | Convert from element to mark |

### Mark Transformations

| Slate Mark Property | Tiptap Mark Type |
|---------------------|------------------|
| `EMPHASIZE/STRONG` | `bold` |
| `EMPHASIZE/EM` | `italic` |
| `EMPHASIZE/U` | `underline` |
| `CODE/CODE` | `code` |

### Attribute Mapping

| Slate Attribute | Tiptap Attribute |
|-----------------|------------------|
| `data.align` | `attrs.textAlign` |
| `data.href` | `attrs.href` (on link mark) |
| `data.openInNewWindow` | `attrs.target` (`_blank` or `null`) |
| `data.id` (anchor) | `attrs.id` |

### Elements Requiring Special Handling

| Element | Challenge | Solution |
|---------|-----------|----------|
| Anchor (`LINK/ANCHOR`) | No direct Tiptap equivalent | Custom extension or convert to id attribute |
| Indentation | Custom Slate implementation | May need custom extension |
| Void elements | Different handling in ProseMirror | Schema definition required |

## 4. Edge Cases and Risks

### Complex Nested Structures

**Risk:** Deeply nested lists or quotes may not convert cleanly.

**Example problematic structure:**
```json
{
  "type": "UNORDERED-LIST",
  "children": [
    {
      "type": "LISTS/LIST-ITEM",
      "children": [
        { "text": "Item with " },
        {
          "type": "LINK/LINK",
          "data": { "href": "#" },
          "children": [
            { "text": "bold", "EMPHASIZE/STRONG": true }
          ]
        }
      ]
    }
  ]
}
```

**Challenge:** The list item has mixed text and inline elements, and the link contains marked text. ProseMirror requires more explicit structure.

**Mitigation:** Build recursive converter that normalizes structure during migration.

### Custom Plugin Data

**Risk:** User-defined plugins may store arbitrary data in the `data` object.

**Example:**
```json
{
  "type": "CUSTOM/WIDGET",
  "data": { "widgetId": "abc123", "settings": { "theme": "dark" } },
  "children": []
}
```

**Mitigation:**
- Provide plugin authors migration hooks
- Preserve unknown data in `attrs` for custom extensions
- Document breaking changes for custom plugins

### Potential Data Loss Scenarios

| Scenario | Risk Level | Mitigation |
|----------|------------|------------|
| Unknown node types | Medium | Preserve as custom node or fallback to paragraph |
| Unknown marks | Low | Preserve in attrs or strip with warning |
| Empty text nodes | Low | Filter during conversion |
| Malformed nesting | Medium | Normalize during conversion |
| Selection state | None | Selection not persisted to database |
| Custom mark data | Low | Rarely used; preserve in mark attrs |

### Malformed Content Handling

**Strategy:**
1. Validate input against expected Slate schema
2. Attempt automatic repair for common issues
3. Log warnings for non-standard structures
4. Fallback to paragraph for unrecoverable nodes
5. Never silently drop content

**Validation checks:**
- All elements have `type` property
- All elements have `children` or `text`
- No circular references
- No null/undefined in tree

## 5. Tooling Requirements

### Migration Function

```typescript
interface MigrationOptions {
  // Custom node type mappings
  nodeTypeMap?: Record<string, string>;
  // Custom mark mappings
  markTypeMap?: Record<string, string>;
  // Handler for unknown node types
  unknownNodeHandler?: (node: SlateNode) => TiptapNode | null;
  // Enable strict validation
  strict?: boolean;
}

function migrateSlateToTiptap(
  slateState: SlateState,
  options?: MigrationOptions
): TiptapDocument;
```

### Required Tools

| Tool | Purpose | Complexity |
|------|---------|------------|
| `slateToTiptap()` | Core conversion function | Medium |
| `tiptapToSlate()` | Reverse conversion (for dual support) | Medium |
| `validateSlateContent()` | Pre-migration validation | Low |
| `validateTiptapContent()` | Post-migration validation | Low |
| `migrateBatch()` | Bulk migration with progress | Low |
| `diffFormats()` | Compare before/after for testing | Low |

### Validation Approach

**Pre-migration validation:**
```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: {
    nodeCount: number;
    markCount: number;
    unknownTypes: string[];
  };
}
```

**Post-migration validation:**
- Render both formats and compare DOM output
- Verify text content extraction matches
- Check all marks preserved
- Validate against Tiptap schema

### Testing Strategy

1. **Unit tests:** Individual node type conversions
2. **Integration tests:** Full document conversions
3. **Snapshot tests:** Known content conversions
4. **Fuzz tests:** Random valid Slate content
5. **Real-world tests:** Sample production content (anonymized)

### Rollback Strategy

**For Option A (Runtime):**
- Keep Slate parser active
- Add `format: 'slate' | 'tiptap'` field to stored content
- Can revert to Slate editor if needed

**For Option B (Batch):**
- Backup database before migration
- Keep migration reversible for 30 days
- Document manual rollback procedure

**For Option C (Dual):**
- No rollback needed - both formats always supported

## 6. Recommendation

### Primary Recommendation: Option A (Runtime Migration)

**Rationale:**

1. **Safety first:** Runtime migration is the safest approach for ReactPage's diverse user base. Different deployments have different content volumes and update frequencies.

2. **Zero downtime:** Users can continue working during the transition period without interruption.

3. **Gradual validation:** Real-world content gets converted and validated incrementally, surfacing issues before they affect all users.

4. **Easy rollback:** If problems are discovered, the Slate codepath remains functional.

5. **ReactPage precedent:** The existing migration system (v002, v003, v004) uses exactly this pattern for Slate version upgrades.

### Implementation Plan

**Phase 1: Build Migration Infrastructure**
- Create `slateToTiptap()` converter function
- Add comprehensive test suite
- Implement validation utilities

**Phase 2: Dual Read Support**
- Add format detection to content loader
- Convert Slate content to Tiptap on read
- Store in Tiptap format on save

**Phase 3: Monitor and Iterate**
- Log migration statistics
- Track conversion errors
- Fix edge cases as discovered

**Phase 4: Deprecate Slate Format**
- Remove Slate editor code
- Keep converter for legacy content
- Document migration timeline

### Alternative: Option B for New Projects

For greenfield ReactPage deployments, Option B (batch migration) could be considered:
- Cleaner codebase from day one
- No legacy format support needed
- Simpler long-term maintenance

### Not Recommended: Option C (Dual Format)

Permanent dual format support creates technical debt that compounds over time. Every new feature must work with both formats, and subtle differences will cause bugs.

## Appendix: Migration Function Pseudocode

```typescript
function slateToTiptap(slateState: SlateState): TiptapDocument {
  return {
    type: 'doc',
    content: slateState.slate.map(convertNode)
  };
}

function convertNode(node: SlateNode): TiptapNode {
  // Text node
  if ('text' in node) {
    return convertTextNode(node);
  }

  // Element node
  const tiptapType = mapNodeType(node.type);
  const attrs = mapAttributes(node.data);

  // Special handling for lists
  if (isListItem(node.type)) {
    return {
      type: 'listItem',
      content: [{
        type: 'paragraph',
        content: node.children.map(convertNode)
      }]
    };
  }

  // Special handling for inline links -> marks
  if (node.type === 'LINK/LINK') {
    // Convert to marked text nodes
    return convertLinkToMarks(node);
  }

  return {
    type: tiptapType,
    attrs,
    content: node.children.map(convertNode)
  };
}

function convertTextNode(node: SlateText): TiptapTextNode {
  const marks = [];

  if (node['EMPHASIZE/STRONG']) marks.push({ type: 'bold' });
  if (node['EMPHASIZE/EM']) marks.push({ type: 'italic' });
  if (node['EMPHASIZE/U']) marks.push({ type: 'underline' });
  if (node['CODE/CODE']) marks.push({ type: 'code' });

  return {
    type: 'text',
    text: node.text,
    ...(marks.length ? { marks } : {})
  };
}
```

## Summary

| Aspect | Recommendation |
|--------|----------------|
| Migration approach | Runtime (Option A) |
| Timeline | Phased over 2-3 releases |
| Backward compat | Maintained via format detection |
| Rollback | Possible until Slate code removed |
| Testing | Extensive before Phase 2 |
| User impact | Zero downtime, gradual transition |

This strategy ensures ReactPage users can upgrade to Tiptap without losing existing content or experiencing service disruption.
