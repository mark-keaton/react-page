# Slate Upgrade Path: 0.78 to 0.120

**Created:** 2026-01-14T20:13:09Z
**Based on:** 01-current-state.md, 02-slate-changelog.md

## Executive Summary

This document outlines a concrete upgrade path for ReactPage's Slate integration from version 0.78/0.79 to the latest 0.120. The **recommended strategy is a phased incremental upgrade** with React version decision points. Total estimated effort is **Medium to Large** depending on React 18 adoption decision.

---

## 1. Upgrade Strategy

### Recommended: Phased Incremental Upgrade

**Rationale:**
- 42 minor versions contain accumulated behavioral changes that are difficult to debug all at once
- Key breaking changes occur at specific versions (0.95, 0.100, 0.111)
- Allows testing and validation at each phase before proceeding
- Provides clear rollback points if issues arise

### Phase Overview

| Phase | Target Version | Key Change | React Requirement |
|-------|----------------|------------|-------------------|
| **Phase 1** | 0.94.x | insertSoftBreak split | React 16.14+ |
| **Phase 2** | 0.99.x | value -> initialValue rename | React 16.14+ |
| **Phase 3** | 0.110.x | React 18 requirement | **React 18+** |
| **Phase 4** | 0.120.x | slate-dom extraction, decorations | React 18+ |

### Alternative: Dual-Track Strategy (If React 16/17 Support Required)

If ReactPage must maintain React 16.14+ support:
- **Track A:** Upgrade to 0.99.x maximum (React 16/17 compatible)
- **Track B:** Full upgrade to 0.120.x (React 18+ only)
- Use peer dependency conditions to select appropriate version

---

## 2. Required Code Changes by File

### 2.1 SlateProvider.tsx (HIGH PRIORITY)

**File:** `packages/plugins/content/slate/src/components/SlateProvider.tsx`

| Change | Breaking Version | Complexity | Description |
|--------|-----------------|------------|-------------|
| `value` -> `initialValue` | 0.95.0 | S | Rename prop on `<Slate>` component |
| Add `onValueChange`/`onSelectionChange` | 0.100.0 | S | Optional: Use new callbacks for better separation |

**Code Change (Phase 2):**
```typescript
// Lines 67-74: Current code
<Slate
  editor={editor}
  value={initialValue}  // <- Change this
  onChange={onChange}
>

// Updated code
<Slate
  editor={editor}
  initialValue={initialValue}  // <- To this
  onChange={onChange}
>
```

**Notes:**
- The existing comment on line 71 already acknowledges the controlled input issue
- The variable is already named `initialValue`, only the prop name changes
- Consider using new `onValueChange` and `onSelectionChange` callbacks (0.100.0+) to simplify the `onChange` handler

---

### 2.2 hotkeyHooks.ts (MEDIUM PRIORITY)

**File:** `packages/plugins/content/slate/src/components/hotkeyHooks.ts`

| Change | Breaking Version | Complexity | Description |
|--------|-----------------|------------|-------------|
| `insertSoftBreak` usage | 0.94.0 | S | Use `insertSoftBreak` for shift+enter |

**Code Change (Phase 1):**
```typescript
// Lines 48-52: Current code
if (isHotkey('shift+enter', event)) {
  event.preventDefault();
  editor.insertText('\n');  // <- Change this
  return true;
}

// Updated code (0.94.0+)
if (isHotkey('shift+enter', event)) {
  event.preventDefault();
  editor.insertSoftBreak();  // <- To this
  return true;
}
```

**Notes:**
- The `insertSoftBreak` method was added in 0.94.0
- Maintains separation of concerns between hard and soft line breaks
- If custom soft break behavior is needed, override `editor.insertSoftBreak` instead

---

### 2.3 SlateEditor.tsx (LOW PRIORITY)

**File:** `packages/plugins/content/slate/src/components/SlateEditor.tsx`

| Change | Breaking Version | Complexity | Description |
|--------|-----------------|------------|-------------|
| Editable ref forwarding | 0.108.0 | S | Optional: Use ref if needed |
| RenderLeafProps changes | 0.114.0 | S | New `leafPosition` property available |

**No Required Changes** - These are additive, non-breaking features.

---

### 2.4 withInline.ts (LOW PRIORITY)

**File:** `packages/plugins/content/slate/src/slateEnhancer/withInline.ts`

| Change | Breaking Version | Complexity | Description |
|--------|-----------------|------------|-------------|
| `markableVoid` support | 0.85.0 | S | Optional: Add void mark support |

**Optional Enhancement:**
```typescript
// Add if void elements should support marks
editor.markableVoid = (element) => {
  return plugins.some(
    (plugin) =>
      plugin.pluginType === 'component' &&
      plugin.isVoid &&
      plugin.type === element.type &&
      plugin.markableVoid  // New plugin property
  );
};
```

---

### 2.5 withPaste.ts (REVIEW NEEDED)

**File:** `packages/plugins/content/slate/src/slateEnhancer/withPaste.ts`

| Change | Breaking Version | Complexity | Description |
|--------|-----------------|------------|-------------|
| insertText behavior | 0.80.0 | M | Review for selection changes |
| Copy/paste void elements | 0.86.0 | S | Now works - verify no conflicts |

**Review Points:**
- Line 58: `Transforms.insertText(editor, thisLineText)` - Verify behavior with non-collapsed selection
- Void element handling is now improved - test paste scenarios

---

### 2.6 ReadOnlySlate.tsx (CRITICAL DEPENDENCY)

**File:** `packages/plugins/content/slate/src/components/ReadOnlySlate.tsx`

| Change | Breaking Version | Complexity | Description |
|--------|-----------------|------------|-------------|
| slate-react-presentation compatibility | All | M-L | Third-party package may need replacement |

**Issue:**
- `slate-react-presentation` v0.1.1 is pinned and may not be compatible with Slate 0.120
- Package has limited maintenance (last update unknown)

**Options:**
1. **Test Compatibility:** Try with latest Slate, may work
2. **Find Alternative:** Look for maintained alternatives
3. **Inline Rendering:** Create custom read-only renderer
4. **Use slate-react in read mode:** Pass `readOnly={true}` to `Editable`

**Recommended:** Option 4 - Use native slate-react read-only mode:
```typescript
// Simplified approach using slate-react directly
import { Slate, Editable } from 'slate-react';

const ReadOnlySlate = (props: SlateProps) => {
  const editor = useMemo(() => withReact(createEditor()), []);

  return (
    <Slate editor={editor} initialValue={props.data.slate}>
      <Editable
        readOnly
        renderElement={renderElement}
        renderLeaf={renderLeaf}
      />
    </Slate>
  );
};
```

**Complexity:** M (if replacing slate-react-presentation)

---

### 2.7 renderHooks.tsx (LOW PRIORITY)

**File:** `packages/plugins/content/slate/src/components/renderHooks.tsx`

| Change | Breaking Version | Complexity | Description |
|--------|-----------------|------------|-------------|
| RenderLeafProps.leafPosition | 0.114.0 | S | New property available |
| Decoration recomputation | 0.116.0 | M | Review decoration usage |

**Review Points:**
- Line 143-148: `RenderLeafProps` destructuring may have new properties
- Decoration behavior changes may affect custom decorations

---

### 2.8 package.json Updates

**File:** `packages/plugins/content/slate/package.json`

#### Phase 1-2 Updates (React 16.14+ compatible):
```json
{
  "dependencies": {
    "slate": "^0.99.0",
    "slate-hyperscript": "^0.99.0",
    "slate-react": "^0.99.0"
  }
}
```

#### Phase 3-4 Updates (React 18+ required):
```json
{
  "peerDependencies": {
    "react": ">= 18.0",
    "react-dom": ">= 18.0"
  },
  "dependencies": {
    "slate": "^0.120.0",
    "slate-hyperscript": "^0.120.0",
    "slate-react": "^0.120.0",
    "slate-dom": "^0.120.0"  // May be needed
  }
}
```

---

## 3. React Version Consideration

### Current State
- ReactPage supports React >= 16.14
- Slate 0.100+ requires React 18

### Options Analysis

| Option | Pros | Cons |
|--------|------|------|
| **A: Require React 18** | Full Slate upgrade, latest features, better maintained | Breaking change for React 16/17 users |
| **B: Cap at Slate 0.99** | Maintains React 16/17 support | Missing ~21 versions of improvements |
| **C: Dual Package Versions** | Best of both worlds | Complex maintenance, potential confusion |
| **D: Fork Slate 0.99** | Full control, React 16/17 support | Heavy maintenance burden |

### Recommendation: **Option A - Require React 18**

**Rationale:**
1. React 18 released April 2022 - 3.5+ years old, mature
2. React 16/17 are increasingly legacy
3. Major libraries (MUI, etc.) are moving to React 18
4. Maintenance burden of supporting old React versions not justified
5. ReactPage is a modern editor - users likely on current React

**Migration Path:**
1. Document React 18 requirement clearly
2. Provide migration guide for React 16/17 users
3. Consider major version bump (v5.0) to signal breaking change

### Alternative: Soft Requirement

If breaking React 16/17 users is unacceptable:
- Update to Slate 0.99.x (last React 16/17 compatible)
- Document that React 18 users get full Slate updates
- Plan full upgrade in next major version

---

## 4. New Migrations Needed

### Assessment: No New Migrations Required

**Reason:** Slate 0.78 to 0.120 does not introduce serialization format changes.

The existing migrations handle:
- v002: Slate 0.33 -> 0.47
- v003: Leaf structure normalization
- v004: Slate 0.47 -> 0.50+

**Data Format:** The `SlateState` structure remains:
```typescript
type SlateState = {
  slate: Node[];
  selection?: Range | null;
};
```

### Migration System Compatibility

The current migration pattern in `packages/plugins/content/slate/src/migrations/` remains valid:

```typescript
// No changes needed - format is stable
{
  slate: [
    {
      type: 'PARAGRAPH/PARAGRAPH',
      data: { align: 'left' },
      children: [{ text: 'Hello', 'EMPHASIZE/STRONG': true }]
    }
  ]
}
```

---

## 5. Testing Approach

### Critical Test Paths

| Test Area | Priority | Risk | Files to Test |
|-----------|----------|------|---------------|
| Basic text editing | Critical | M | SlateProvider, SlateEditor |
| Mark application | Critical | L | emphasize/*, code/* plugins |
| Block transformations | High | M | headings, lists, quotes |
| Inline elements | High | M | links/link.tsx, anchor |
| HTML paste | High | M | withPaste.ts, HtmlToSlate |
| Void elements | Medium | M | withInline.ts |
| Read-only rendering | High | H | ReadOnlySlate.tsx |
| Android/mobile | Medium | M | All components |
| Keyboard shortcuts | Medium | L | hotkeyHooks.ts |
| Selection handling | High | M | SlateProvider.tsx |

### Regression Test Suite

1. **Unit Tests:**
   - Plugin registration and rendering
   - Mark toggle behavior
   - Block type switching

2. **Integration Tests:**
   - Full editor workflow
   - Content serialization/deserialization
   - Undo/redo functionality

3. **E2E Tests:**
   - Create document with all element types
   - Edit existing content
   - Paste from various sources
   - Mobile device testing

### Testing Each Phase

**Phase 1 (0.94.x):**
- [ ] Soft break behavior (shift+enter)
- [ ] Transforms operations unchanged
- [ ] All marks work correctly

**Phase 2 (0.99.x):**
- [ ] Controlled editor still works with workaround
- [ ] Selection management unchanged
- [ ] No regressions from Phase 1

**Phase 3 (0.110.x):**
- [ ] React 18 concurrent features don't break editor
- [ ] All React hooks work correctly
- [ ] slate-dom imports (if any) resolved

**Phase 4 (0.120.x):**
- [ ] Decoration behavior (if used)
- [ ] All previous tests pass
- [ ] Performance benchmarks

---

## 6. Effort Estimate

| Component | Effort | Risk | Notes |
|-----------|--------|------|-------|
| **Core Code Changes** | S | L | Mostly prop renames, simple |
| **slate-react-presentation Replacement** | M | M | May need custom solution |
| **React 18 Requirement** | M | M | Documentation, user migration |
| **Testing (Each Phase)** | M | M | 4 phases x manual testing |
| **Testing (Full Suite)** | L | M | Comprehensive coverage needed |
| **Documentation** | S | L | Update docs for changes |
| **Build/TypeScript** | S | L | If upgrading TS 5 |
| **Total** | **M-L** | - | 2-4 weeks depending on scope |

### Detailed Time Estimates

| Task | Hours | Dependencies |
|------|-------|--------------|
| Phase 1 code changes | 2-4 | None |
| Phase 1 testing | 4-8 | Phase 1 code |
| Phase 2 code changes | 1-2 | Phase 1 |
| Phase 2 testing | 4-8 | Phase 2 code |
| Phase 3 code changes | 4-8 | Phase 2 |
| Phase 3 testing | 8-16 | Phase 3 code |
| Phase 4 code changes | 2-4 | Phase 3 |
| Phase 4 testing | 4-8 | Phase 4 code |
| ReadOnly component | 8-16 | Any phase |
| Documentation | 4-8 | All phases |
| **Total** | **41-82 hrs** | (5-10 days) |

---

## 7. Risk Assessment

### High Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| slate-react-presentation incompatibility | H | H | Replace with native slate-react read-only |
| React 18 requirement breaks users | H | M | Clear documentation, migration guide, major version bump |
| Subtle behavioral changes | M | H | Comprehensive testing at each phase |

### Medium Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Android editing regressions | M | M | Test on real devices |
| TypeScript type mismatches | M | M | Upgrade TS before Slate |
| Custom plugin conflicts | M | L | Review all custom plugins |

### Low Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Build failures | L | L | Incremental dependency updates |
| Performance degradation | L | L | Benchmark before/after |

### Rollback Plan

**Per-Phase Rollback:**
1. Each phase has a clean git tag
2. package.json pinned to specific versions
3. Can revert to any previous phase

**Full Rollback:**
1. Maintain 0.78.x branch
2. Revert to pre-upgrade commit
3. Republish with previous versions

---

## 8. Implementation Checklist

### Pre-Upgrade
- [ ] Create upgrade branch
- [ ] Document current test coverage
- [ ] Set up phase tags in git
- [ ] Review TypeScript version compatibility

### Phase 1 (0.94.x)
- [ ] Update slate packages to 0.94.x
- [ ] Update `hotkeyHooks.ts` for insertSoftBreak
- [ ] Run full test suite
- [ ] Tag: `slate-upgrade-phase-1`

### Phase 2 (0.99.x)
- [ ] Update slate packages to 0.99.x
- [ ] Update `SlateProvider.tsx` (value -> initialValue)
- [ ] Run full test suite
- [ ] Tag: `slate-upgrade-phase-2`

### Phase 3 (0.110.x) - React 18 Required
- [ ] Update peerDependencies to React 18+
- [ ] Update slate packages to 0.110.x
- [ ] Address slate-dom imports if needed
- [ ] Update/replace ReadOnlySlate
- [ ] Run full test suite
- [ ] Tag: `slate-upgrade-phase-3`

### Phase 4 (0.120.x)
- [ ] Update slate packages to 0.120.x
- [ ] Review decoration behavior
- [ ] Final comprehensive testing
- [ ] Tag: `slate-upgrade-phase-4`

### Post-Upgrade
- [ ] Update documentation
- [ ] Update CHANGELOG
- [ ] Write migration guide for users
- [ ] Consider major version bump

---

## 9. Decision Points

### Must Decide Before Starting

1. **React Version Requirement**
   - [ ] Require React 18 (recommended)
   - [ ] Cap at Slate 0.99.x
   - [ ] Dual package strategy

2. **ReadOnly Rendering Strategy**
   - [ ] Test slate-react-presentation compatibility
   - [ ] Replace with native slate-react (recommended)
   - [ ] Build custom read-only renderer

3. **Version Bump Strategy**
   - [ ] Major version (v5.0) for React 18 requirement
   - [ ] Minor version with documented breaking change
   - [ ] Separate package for React 18 version

---

## Summary

The Slate upgrade from 0.78 to 0.120 is **achievable** with moderate effort. The primary challenges are:

1. **React 18 Requirement** - Most impactful decision, affects user base
2. **slate-react-presentation** - Third-party dependency may need replacement
3. **Testing Burden** - 42 versions of accumulated changes require thorough validation

**Recommended Approach:**
1. Commit to React 18 requirement (major version bump)
2. Replace slate-react-presentation with native read-only mode
3. Execute 4-phase incremental upgrade
4. Allow 2-4 weeks for implementation and testing
