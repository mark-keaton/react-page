---
name: user-facing-template-variables
description: Enable content editors to use Prisma field variables in data plugin content via dropdown picker
status: backlog
created: 2026-01-10T20:42:44Z
---

# PRD: User-Facing Template Variables

## Executive Summary

Enable content editors using react-page-prisma data plugins to insert dynamic, per-row template variables into their content. Variables are derived from Prisma model fields defined in templates, selected via a dropdown picker in the editor UI, and resolve to actual data values at render time. This allows non-technical users to create dynamic, data-driven content without writing code.

## Problem Statement

### What problem are we solving?

Currently, react-page-prisma data plugins (table, cards, chart) display data in fixed formats. Content editors cannot:
- Customize how individual fields are displayed within content
- Create templated text that combines multiple data fields
- Build custom card layouts with dynamic field values
- Add contextual labels or formatting around data values

### Why is this important now?

With the core data plugins now functional, users need the ability to create richer, more customized data presentations. The current approach requires developers to modify plugin code for each custom layout, creating a bottleneck and limiting what content editors can accomplish independently.

## User Stories

### Primary Persona: Content Editor (Non-Technical)

**As a content editor**, I want to insert data field values into my content so that I can create dynamic, personalized displays without developer help.

#### User Journey: Creating a Product Card

1. Editor opens ReactPage and adds a Data Cards plugin
2. Editor selects "products" template from dropdown
3. Editor clicks on the card title field
4. Editor sees a "Insert Variable" button/icon
5. Editor clicks it and sees a dropdown of available fields: `name`, `price`, `category`, `description`
6. Editor selects `name` - it appears as `{{name}}` or a styled pill in the editor
7. Editor adds text: "Only {{price}}!" in the subtitle field
8. Editor selects `category` for a badge/tag display
9. At render time, each card shows its own product's values

**Acceptance Criteria:**
- Variables appear as visually distinct elements in the editor (not raw syntax)
- Dropdown only shows fields defined in the selected template
- Variables resolve correctly per-row in iterable contexts
- Invalid/missing variables show graceful fallback (empty or placeholder)

### Secondary Persona: Developer (Technical)

**As a developer**, I want to control which Prisma fields are exposed as template variables so that I can protect sensitive data and provide a curated editing experience.

#### User Journey: Configuring Template Variables

1. Developer defines a template in the data fetcher config
2. Developer marks fields as `exposedAsVariable: true` (or similar)
3. Only marked fields appear in the content editor's variable picker
4. Developer can add display labels different from field keys

**Acceptance Criteria:**
- Variable exposure is opt-in per field
- Field labels in picker can differ from database column names
- Sensitive fields (e.g., `passwordHash`) are never exposed by default

## Requirements

### Functional Requirements

#### FR1: Variable Picker UI
- Dropdown/popover component showing available template variables
- Accessible from text input fields in data plugin controls
- Shows field label and type for each variable
- Searchable/filterable for templates with many fields

#### FR2: Variable Rendering in Editor
- Variables display as styled pills/chips in edit mode
- Pills show field name and are visually distinct from static text
- Pills can be selected, deleted, and repositioned
- Raw syntax (e.g., `{{fieldName}}`) hidden from content editors

#### FR3: Per-Row Variable Resolution
- In iterable contexts (cards, table cells), variables resolve per-row
- Each card/row receives its own data context
- Variables outside iterable context show error or empty state

#### FR4: Template Field Configuration
- Extend `FieldDefinition` type with variable exposure settings
- Add optional `variableLabel` for display name in picker
- Add optional `variableFormat` for display formatting hints

#### FR5: New Text/Content Plugin (Optional Enhancement)
- Simple text plugin that supports template variables
- Can be used within cards for custom text layouts
- Renders as formatted text with resolved variables

### Non-Functional Requirements

#### NFR1: Performance
- Variable resolution must not cause visible render lag
- Picker dropdown should open in <100ms
- Support templates with up to 50 fields without degradation

#### NFR2: Accessibility
- Picker must be keyboard navigable
- Variable pills must have appropriate ARIA labels
- Screen readers should announce variable names

#### NFR3: Developer Experience
- TypeScript types for all new APIs
- Clear error messages for misconfigured variables
- Documentation with examples

## Success Criteria

| Metric | Target |
|--------|--------|
| Content editors can insert variables without developer help | 100% of exposed fields accessible |
| Variable picker loads | < 100ms |
| Variables resolve correctly in cards/tables | 100% accuracy |
| No sensitive field exposure | 0 unexposed fields shown |

## Constraints & Assumptions

### Constraints
- Must work within existing ReactPage plugin architecture
- Must not break existing data plugin functionality
- Must maintain React 17+ compatibility

### Assumptions
- Templates are defined before editor use (not created in editor)
- Field types are known at template definition time
- Data fetching is already handled by existing useDataQuery hook

## Out of Scope

- **Detail view / click-to-expand**: Not building modal or inline detail views
- **Global/page-level variables**: Only per-row context, no page-level vars
- **Variable syntax typing**: Users won't type `{{var}}` directly
- **Conditional rendering**: No if/else logic based on variable values
- **Variable transformations**: No date formatting, number formatting in v1
- **Cross-plugin variables**: Variables don't span across plugins

## Dependencies

### Internal Dependencies
- `@react-page-data/core` - Template and field type definitions
- `@react-page-data/plugin-cards` - Primary consumption point
- `@react-page-data/plugin-table` - Secondary consumption point

### External Dependencies
- ReactPage editor plugin system
- MUI components for picker UI (consistent with existing plugins)

## Technical Notes

### Proposed Type Extensions

```typescript
// In @react-page-data/core types.ts
interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  // New fields for variable support
  exposeAsVariable?: boolean;  // Default: false
  variableLabel?: string;      // Display name in picker, defaults to label
}

// New type for resolved variable context
interface VariableContext {
  row: Record<string, unknown>;
  templateId: string;
}
```

### Variable Syntax (Internal)

Variables stored in cell data as: `{{fieldKey}}`

Rendered in editor as styled pills, resolved at display time.

## Open Questions

1. Should variables be usable in chart axis labels?
2. How to handle null/undefined field values - show empty, placeholder, or hide?
3. Should there be a "preview" mode in editor showing resolved values?
