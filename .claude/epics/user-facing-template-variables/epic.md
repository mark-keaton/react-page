---
name: user-facing-template-variables
status: backlog
created: 2026-01-10T20:45:37Z
updated: 2026-01-10T21:05:34Z
progress: 0%
prd: .claude/prds/user-facing-template-variables.md
github: https://github.com/mark-keaton/react-page-prisma/issues/8
---

# Epic: User-Facing Template Variables

## Overview

Implement template variable support for react-page-prisma data plugins, enabling content editors to insert dynamic field references into card titles, subtitles, and body text. Variables resolve per-row at render time, allowing data-driven content without code changes.

**Key simplification**: Rather than building a complex rich-text variable system, we'll use a simple string interpolation approach where text fields can contain `{{fieldKey}}` syntax, with a picker UI to insert these. The existing plugin renderers will resolve variables against each row's data.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Variable syntax | `{{fieldKey}}` | Simple, widely understood, easy to parse with regex |
| Storage format | Plain strings with embedded variables | No schema changes needed, backwards compatible |
| Variable picker | MUI Autocomplete dropdown | Consistent with existing plugin UIs, accessible |
| Resolution location | In renderer components | Per-row context already available, no new data flow needed |
| Field exposure | Opt-in via `exposeAsVariable` | Secure by default, developers control what's visible |

## Technical Approach

### Core Package Changes (`@react-page-data/core`)

1. **Extend FieldDefinition type** - Add `exposeAsVariable?: boolean` and `variableLabel?: string`
2. **Add utility functions**:
   - `getExposedVariables(template)` - Returns fields marked for variable use
   - `resolveVariables(text, row)` - Replaces `{{key}}` with row values
   - `extractVariables(text)` - Returns list of variable keys in a string

### Plugin Changes

3. **Variable Picker Component** - Shared component in `@react-page-data/core`:
   - MUI Autocomplete with field list
   - Inserts `{{fieldKey}}` at cursor position
   - Shows field label and type

4. **Cards Plugin Updates** - Modify `fieldMapping` to support variable strings:
   - Title, subtitle, body fields accept variable syntax
   - Renderer calls `resolveVariables()` for each row
   - Controls show picker button next to text inputs

5. **Table Plugin Updates** - Similar pattern for custom column labels

### No New Plugins Needed

The existing cards plugin can handle templated text by allowing the `fieldMapping.body` to contain variables like `"Price: {{price}} - {{category}}"`. No separate "templated text" plugin required.

## Implementation Strategy

**Phase 1: Core infrastructure** (Tasks 1-3)
- Type extensions, utility functions, basic tests

**Phase 2: UI components** (Tasks 4-5)
- Variable picker, integration with controls

**Phase 3: Renderer updates** (Tasks 6-7)
- Variable resolution in cards and table renderers

**Phase 4: Polish** (Tasks 8-9)
- Documentation, example updates, edge case handling

## Task Breakdown Preview

- [ ] Task 1: Extend FieldDefinition types with variable exposure fields
- [ ] Task 2: Implement variable utility functions (resolve, extract, getExposed)
- [ ] Task 3: Add unit tests for variable utilities
- [ ] Task 4: Create VariablePicker shared component
- [ ] Task 5: Update Cards plugin controls with variable picker integration
- [ ] Task 6: Update Cards renderer to resolve variables per-row
- [ ] Task 7: Update Table plugin with variable support for column labels
- [ ] Task 8: Update example app to demonstrate variable usage
- [ ] Task 9: Add documentation for variable feature

## Dependencies

### Internal
- `@react-page-data/core` - Must be updated first (types, utilities)
- `@react-page-data/plugin-cards` - Primary integration point
- `@react-page-data/plugin-table` - Secondary integration point

### External
- MUI Autocomplete (already a dependency)
- No new external dependencies required

## Success Criteria (Technical)

| Criteria | Measurement |
|----------|-------------|
| Variable resolution works per-row | Unit tests pass for cards with 100+ rows |
| Picker shows only exposed fields | Integration test verifies filtering |
| No performance regression | Render time <5ms overhead per variable |
| Backwards compatible | Existing configs without variables still work |
| Type-safe | Full TypeScript coverage, no `any` types |

## Estimated Effort

| Phase | Tasks | Estimate |
|-------|-------|----------|
| Core infrastructure | 1-3 | Small |
| UI components | 4-5 | Medium |
| Renderer updates | 6-7 | Medium |
| Polish | 8-9 | Small |
| **Total** | **9 tasks** | **Medium overall** |

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing plugin configs | Ensure all new fields are optional with sensible defaults |
| Performance with many variables | Use memoization, single-pass regex replacement |
| Complex nested variable scenarios | Explicitly out of scope - keep it simple |

## Open Questions Resolution

1. **Variables in chart axis labels?** → Defer to v2, keep scope tight
2. **Null/undefined handling** → Show empty string, add `variableFallback` option later if needed
3. **Preview mode?** → Nice to have, defer to follow-up enhancement

## Tasks Created

| # | Task | Status | Dependencies | Parallel |
|---|------|--------|--------------|----------|
| [#9](https://github.com/mark-keaton/react-page-prisma/issues/9) | Extend FieldDefinition types with variable exposure fields | open | - | Yes |
| [#10](https://github.com/mark-keaton/react-page-prisma/issues/10) | Implement variable utility functions | open | #9 | Yes |
| [#11](https://github.com/mark-keaton/react-page-prisma/issues/11) | Add unit tests for variable utilities | open | #10 | Yes |
| [#12](https://github.com/mark-keaton/react-page-prisma/issues/12) | Create VariablePicker shared component | open | #9 | Yes |
| [#13](https://github.com/mark-keaton/react-page-prisma/issues/13) | Update Cards plugin controls with variable picker | open | #12 | No |
| [#14](https://github.com/mark-keaton/react-page-prisma/issues/14) | Update Cards renderer to resolve variables per-row | open | #10, #13 | No |
| [#15](https://github.com/mark-keaton/react-page-prisma/issues/15) | Update Table plugin with variable support | open | #10, #12 | Yes |
| [#16](https://github.com/mark-keaton/react-page-prisma/issues/16) | Update example app to demonstrate variable usage | open | #14 | Yes |
| [#17](https://github.com/mark-keaton/react-page-prisma/issues/17) | Add documentation for variable feature | open | #14, #15 | Yes |

### Dependency Graph

```
#9 (Types) ──────┬──→ #10 (Utils) ──→ #11 (Tests)
                 │         │
                 │         ├──────────→ #14 (Cards Renderer) ──→ #16 (Example)
                 │         │                      │
                 │         └──────────────────────┼──→ #15 (Table)
                 │                                │              │
                 └──→ #12 (Picker) ──→ #13 (Cards Controls) ────┘
                                                                 │
                                                                 └──→ #17 (Docs)
```

### Execution Phases

**Phase 1 - Foundation (parallel):** #9, then #10 + #12 in parallel
**Phase 2 - Tests (parallel with phase 3):** #11
**Phase 3 - Plugin UI:** #13 (depends on #12)
**Phase 4 - Renderers (parallel):** #14, #15
**Phase 5 - Polish (parallel):** #16, #17
