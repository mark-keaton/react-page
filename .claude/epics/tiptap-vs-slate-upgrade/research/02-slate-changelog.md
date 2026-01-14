# Slate Changelog Analysis: Breaking Changes from 0.78 to 0.120

**Created:** 2026-01-14T20:10:15Z
**Current Version:** slate 0.78.0 / slate-react 0.79.0
**Latest Version:** slate 0.120.0 / slate-react 0.120.0
**Version Gap:** ~42 minor versions

## Executive Summary

Upgrading from Slate 0.78/0.79 to the latest version involves navigating approximately 42 minor releases with **5 significant breaking changes** and numerous behavioral modifications. The most impactful changes are:

1. **React 18/Node 20/TypeScript 5 requirement** (0.100.0)
2. **`value` to `initialValue` prop rename** (0.95.0)
3. **New `slate-dom` package extraction** (0.111.0)
4. **Decoration recomputation behavior change** (0.116.0)
5. **`ignoreNonSelectable` option removal** (0.117.0)

**Estimated Migration Complexity:** MODERATE to HIGH

---

## Breaking Changes by Version

### Version 0.80.0 (May 2022)
**Package:** slate

**Changes:**
- Updated `insertText` logic when selection is not collapsed
- Reverted position behavior around inline voids

**Impact on ReactPage:** LOW
- The `insertText` usage in `hotkeyHooks.ts` and `useAddPlugin.ts` may behave differently
- File: `packages/plugins/content/slate/src/components/hotkeyHooks.ts:50`
- File: `packages/plugins/content/slate/src/hooks/useAddPlugin.ts:26`

---

### Version 0.81.0 (June 2022)
**Package:** slate, slate-react

**Changes:**
- Added `Slate.Scrubber` interface for scrubbing end user data from exception text

**Impact on ReactPage:** NONE
- New opt-in feature, non-breaking

---

### Version 0.82.0 (July 2022)
**Package:** slate, slate-react

**Changes:**
- **Android input handling rewrite** - replaced composition insert prefixes with decoration-based mark placeholders
- Added `useSlateSelection` hook
- Added `useSlateWithV` hook for version tracking

**Impact on ReactPage:** LOW to MODERATE
- Android editing behavior significantly improved but may have edge cases
- New hooks available but not required

---

### Version 0.85.0 (November 2022)
**Package:** slate

**Changes:**
- Added `markableVoid()` method to allow void elements to receive marks

**Impact on ReactPage:** LOW
- New opt-in feature for void elements
- Relevant file: `packages/plugins/content/slate/src/slateEnhancer/withInline.ts`

---

### Version 0.86.0 (November 2022)
**Package:** slate, slate-react

**Changes:**
- Added `hanging` option to `unsetNodes` matching `setNodes` functionality
- Fixed `Editor.unhangRange()` range adjustment behavior
- Enabled copy/paste for void elements

**Impact on ReactPage:** LOW
- Void element handling improvements, non-breaking

---

### Version 0.87.0 (December 2022)
**Package:** slate, slate-react

**Changes:**
- **Adopted stylesheet for default Editable styles** instead of inline styles
- (Later reverted in 0.90.0)

**Impact on ReactPage:** NONE (reverted)

---

### Version 0.90.0 (February 2023)
**Package:** slate, slate-react

**Changes:**
- **Reverted to inline styles** for default editor styling (from 0.87.0)

**Impact on ReactPage:** NONE
- Stylesheets reverted to inline styles

---

### Version 0.93.0 (April 2023)
**Package:** slate, slate-react

**Changes:**
- Added `isSelectable` method to editor (default true)
- Added `isElementReadOnly` method to editor
- Added `ignoreNonSelectable` option to `Editor.nodes`, `Editor.positions`, `Editor.after`, `Editor.before`

**Impact on ReactPage:** LOW
- New opt-in features for controlling element selectability
- Potentially useful for void/inline elements

---

### Version 0.94.0 (April 2023)
**Package:** slate

**Changes:**
- **All Editor and Transforms methods now call corresponding editor methods**
- Editor object expanded with 50+ new overrideable methods
- `setNodes` exported as overrideable function
- **Separate `insertSoftBreak` method** added

**Impact on ReactPage:** MODERATE
- If ReactPage overrides `editor.insertBreak` for soft break behavior, must now override `editor.insertSoftBreak` instead
- Transforms API usage unchanged but underlying implementation differs
- Files affected: All files using `Transforms.*` methods

**Migration Required:**
```typescript
// Before: Overriding insertBreak for both hard and soft breaks
editor.insertBreak = () => { /* custom */ }

// After: Separate methods for each
editor.insertBreak = () => { /* for Enter key */ }
editor.insertSoftBreak = () => { /* for Shift+Enter */ }
```

---

### Version 0.95.0 (May 2023) - **BREAKING**
**Package:** slate-react

**Changes:**
- **Renamed `<Slate>` prop from `value` to `initialValue`** to emphasize uncontrolled nature

**Impact on ReactPage:** HIGH
- **Direct code change required** in `SlateProvider.tsx`
- ReactPage already has a comment acknowledging this issue (line 71)
- Current code uses `value` prop but comments indicate awareness

**Migration Required:**
```tsx
// Before (current ReactPage code)
<Slate editor={editor} value={initialValue} onChange={onChange}>

// After
<Slate editor={editor} initialValue={initialValue} onChange={onChange}>
```

**File:** `packages/plugins/content/slate/src/components/SlateProvider.tsx:67-73`

---

### Version 0.100.0 (October 2023) - **BREAKING**
**Package:** slate, slate-react, slate-hyperscript, slate-history

**Changes:**
- **Updated dependencies to React 18, Node 20, TypeScript 5.2**
- Added `onSelectionChange` and `onValueChange` callbacks to `<Slate>`

**Impact on ReactPage:** HIGH
- **React 18 is now required**
- ReactPage currently supports React >= 16.14
- TypeScript types may have breaking changes
- New callbacks available for more granular change handling

**Migration Required:**
1. Update `peerDependencies` to require React 18+
2. Update TypeScript to 5.x
3. Review all TypeScript types for compatibility

**File:** `packages/plugins/content/slate/package.json:26-27`

---

### Version 0.107.0 (July 2024)
**Package:** slate-react

**Changes:**
- Changed behavior of `ReactEditor.findDocumentOrShadowRoot`

**Impact on ReactPage:** LOW
- Shadow DOM related, unlikely to affect ReactPage

---

### Version 0.108.0 (August 2024)
**Package:** slate-react

**Changes:**
- `Editable` component now forwards ref

**Impact on ReactPage:** LOW
- New capability, non-breaking

---

### Version 0.111.0 (November 2024) - **BREAKING**
**Package:** slate-react, slate-dom (NEW)

**Changes:**
- **Split out `slate-dom` package from `slate-react`**
- DOM-related utilities moved to separate package
- Created for non-React web libraries to use

**Impact on ReactPage:** LOW to MODERATE
- If using any DOM utilities directly from slate-react, imports may need updating
- ReactEditor methods should still work from slate-react
- May need to add `slate-dom` as dependency if using specific utilities

**Migration Required (if applicable):**
```typescript
// Before
import { someUtility } from 'slate-react';

// After (for DOM utilities)
import { someUtility } from 'slate-dom';
```

---

### Version 0.112.0 (December 2024)
**Package:** slate

**Changes:**
- Added optional `merge` function to decorations for custom overlap handling

**Impact on ReactPage:** NONE
- New opt-in feature

---

### Version 0.114.0 (April 2025)
**Package:** slate, slate-react

**Changes:**
- Updated `Text.decorations` return type to include position metadata
- Added `leafPosition` property to `RenderLeafProps`
- Added optional `renderText` prop

**Impact on ReactPage:** LOW
- New properties in render props, non-breaking
- Files: `packages/plugins/content/slate/src/components/renderHooks.tsx`

---

### Version 0.116.0 (June 2025) - **BREAKING**
**Package:** slate-react

**Changes:**
- **Decorations no longer recomputed when parent re-renders, only when node itself re-renders**
- Experimental chunking optimization
- Added `useElement` and `useElementIf` hooks

**Impact on ReactPage:** MODERATE
- **Decoration behavior change** may affect how decorations are applied
- If ReactPage relies on parent re-renders to update child decorations, this needs review
- Performance improvement but behavioral change

---

### Version 0.117.0 (June 2025) - **BREAKING**
**Package:** slate

**Changes:**
- **Removed `ignoreNonSelectable` option** from `positions`, `before`, `after`, and `nodes`
- Fixed move behavior with non-selectable inline voids

**Impact on ReactPage:** LOW
- If using `ignoreNonSelectable` option, code must be updated
- Quick grep shows no current usage in ReactPage

---

### Version 0.118.0 (July 2025)
**Package:** slate

**Changes:**
- Preferred sibling text node placement when removing text nodes containing cursor

**Impact on ReactPage:** LOW
- Behavioral refinement, unlikely to cause issues

---

### Version 0.120.0 (December 2025)
**Package:** slate, slate-react

**Changes:**
- Latest release with various patches and improvements

**Impact on ReactPage:** Cumulative of all above

---

## Summary Tables

### Breaking Changes Summary

| Version | Package | Change | Impact | Migration Effort |
|---------|---------|--------|--------|------------------|
| 0.94.0 | slate | `insertSoftBreak` split from `insertBreak` | Moderate | Low |
| 0.95.0 | slate-react | `value` -> `initialValue` prop | High | Low |
| 0.100.0 | all | React 18/Node 20/TS 5.2 required | High | Moderate |
| 0.111.0 | slate-react | `slate-dom` package split | Low | Low |
| 0.116.0 | slate-react | Decoration recomputation change | Moderate | Review Required |
| 0.117.0 | slate | `ignoreNonSelectable` removed | Low | None (not used) |

### Changes by Category

#### Node/Element Structure Changes
- 0.80.0: `insertText` behavior with non-collapsed selection
- 0.85.0: `markableVoid()` for void element marks
- 0.118.0: Text node cursor placement preference

#### Plugin/Editor API Changes
- 0.93.0: `isSelectable`, `isElementReadOnly` methods added
- 0.94.0: All Transforms call editor methods, `insertSoftBreak` split
- 0.117.0: `ignoreNonSelectable` option removed

#### React Integration Changes (slate-react)
- 0.82.0: Android input rewrite, new hooks (`useSlateSelection`, `useSlateWithV`)
- 0.95.0: **`value` -> `initialValue` prop rename**
- 0.100.0: **React 18 required**, new callbacks
- 0.108.0: Editable ref forwarding
- 0.111.0: **slate-dom package extraction**
- 0.116.0: **Decoration recomputation behavior change**

#### TypeScript Type Changes
- 0.100.0: TypeScript 5.2 required, breaking type changes possible
- 0.114.0: New properties in `RenderLeafProps`

#### Serialization Changes
- None significant in this version range

---

## Risk Areas for ReactPage

Based on the current state inventory from Task 001, here are the highest-risk areas:

### 1. SlateProvider.tsx (HIGH RISK)
**File:** `packages/plugins/content/slate/src/components/SlateProvider.tsx`

**Issues:**
- Uses `value` prop which should be `initialValue` (0.95.0)
- Already has workaround comment for controlled component issue
- Will need React 18 compatibility check (0.100.0)

### 2. Android/Mobile Editing (MEDIUM RISK)
The 0.82.0 Android input rewrite is significant. While it improves Android support, any existing workarounds may conflict.

### 3. Transforms Usage (LOW-MEDIUM RISK)
**Files:** Multiple files using `Transforms.*` methods

The 0.94.0 change where all Transforms call editor methods could affect behavior if ReactPage has custom editor overrides that don't account for this.

### 4. slate-react-presentation (MEDIUM RISK)
**File:** `packages/plugins/content/slate/src/components/ReadOnlySlate.tsx`

This third-party package (`slate-react-presentation`) version 0.1.1 may not be compatible with Slate 0.120.0. Need to verify compatibility or find alternative.

### 5. slate-hyperscript (LOW RISK)
**File:** `packages/plugins/content/slate/src/htmlToSlate/HtmlToSlate.tsx`

Current version 0.77.0 should upgrade alongside slate to match versions.

---

## Cumulative Assessment

### Total Breaking Changes: 5-6
1. `value` -> `initialValue` (definite code change)
2. React 18 requirement (infrastructure change)
3. TypeScript 5.x requirement (tooling change)
4. `insertSoftBreak` split (review needed)
5. `slate-dom` extraction (import review needed)
6. Decoration recomputation (behavioral review needed)

### High-Impact Changes for ReactPage
1. **React 18 requirement** - Major as ReactPage supports React 16.14+
2. **`value` to `initialValue`** - Simple rename but must be done
3. **TypeScript 5** - Build system update required

### Estimated Migration Complexity: MODERATE to HIGH

**Reasons:**
- React 18 requirement may conflict with ReactPage's broad React support
- Multiple behavioral changes require testing
- Third-party dependency (`slate-react-presentation`) compatibility unknown
- ~42 minor versions of accumulated changes to validate

### Recommended Upgrade Strategy
If choosing to upgrade Slate:

1. **Phase 1:** Update to 0.95.0 (fix `value` -> `initialValue`)
2. **Phase 2:** Update to 0.100.0 (requires React 18, TypeScript 5)
3. **Phase 3:** Update to 0.111.0+ (check slate-dom extraction)
4. **Phase 4:** Update to latest (0.120.0)

Each phase should include comprehensive testing of:
- Basic text editing
- Mark application (bold, italic, etc.)
- Block transformations (headings, lists)
- Inline elements (links)
- HTML paste handling
- Mobile/Android editing
- Read-only rendering

---

## Sources

- [Slate GitHub Releases](https://github.com/ianstormtaylor/slate/releases)
- [Slate Changelog Documentation](https://docs.slatejs.org/general/changelog)
- [Slate Migration Guide](https://docs.slatejs.org/concepts/xx-migrating)
- [slate CHANGELOG.md](https://github.com/ianstormtaylor/slate/blob/main/packages/slate/CHANGELOG.md)
- [slate-react CHANGELOG.md](https://github.com/ianstormtaylor/slate/blob/main/packages/slate-react/CHANGELOG.md)
- [Issue #4992: value rename](https://github.com/ianstormtaylor/slate/issues/4992)
- [Issue #5731: slate-dom split](https://github.com/ianstormtaylor/slate/issues/5731)
