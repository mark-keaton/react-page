---
name: react-18-upgrade
description: Upgrade ReactPage to require React 18+ and update Slate.js to latest version
status: backlog
created: 2026-01-14T21:15:56Z
---

# PRD: react-18-upgrade

## Executive Summary

This PRD defines the scope for upgrading ReactPage to require React 18 as the minimum supported version, bundled with a Slate.js upgrade from 0.78 to 0.120 (42 versions). This represents a major version bump (ReactPage 6.0) that drops React 16/17 support in exchange for access to modern React features, Slate improvements, and reduced maintenance burden.

**Value Proposition:**
- Unlocks Slate 0.100+ which requires React 18
- Aligns with modern React ecosystem (MUI 6, Next.js 14+, etc.)
- Reduces testing matrix and maintenance overhead
- Enables future adoption of React 19 features

## Problem Statement

### What problem are we solving?

ReactPage currently supports React 16.14+ while Slate.js 0.100+ requires React 18. This creates a version ceiling:

| Component | Current | Latest | Gap |
|-----------|---------|--------|-----|
| react peerDep | >= 16.14 | - | N/A |
| slate | 0.78.0 | 0.120.0 | 42 versions |
| slate-react | 0.79.0 | 0.120.0 | 41 versions |

The inability to upgrade Slate means:
- Missing 4+ years of bug fixes and improvements
- Android editing improvements (0.82.0) not available
- New APIs and hooks not accessible
- Potential unpatched issues in older versions

### Why is this important now?

1. **React 18 is mature** - Released April 2022, nearly 4 years of production use
2. **Industry has moved on** - Major libraries require or strongly prefer React 18
3. **Slate upgrade blocked** - Cannot access versions past 0.99 without React 18
4. **Maintenance burden** - Supporting React 16/17 adds testing complexity with diminishing returns
5. **Research completed** - The tiptap-vs-slate-upgrade epic confirmed Slate upgrade is viable

## User Stories

### Primary Personas

**Library Maintainers (ReactPage team)**
- Need to reduce maintenance burden from supporting legacy React versions
- Want access to latest Slate.js features and fixes
- Need clear major version boundary for breaking changes

**Library Consumers (Developers using ReactPage)**
- Most are already on React 18+ (released 4+ years ago)
- Expect rich text editor to be well-maintained
- Need clear upgrade path with migration guidance

### User Journeys

**As a ReactPage maintainer**, I want to require React 18 so that I can upgrade Slate.js and reduce the testing matrix for legacy React versions.

**As a developer on React 18+**, I want ReactPage to use the latest Slate.js so that I benefit from bug fixes, performance improvements, and new features.

**As a developer on React 17**, I want clear documentation about what version of ReactPage I can use so that I can plan my upgrade path.

### Pain Points Being Addressed

- Slate 0.78 has known issues fixed in later versions
- Android text input handling improved significantly in 0.82.0
- TypeScript types are outdated (pre-TS 5)
- Cannot use newer Slate features like `insertSoftBreak`, better hooks, etc.

## Requirements

### Functional Requirements

#### React 18 Minimum Requirement

1. **Update peerDependencies** across all packages:
   ```json
   "peerDependencies": {
     "react": ">= 18.0",
     "react-dom": ">= 18.0"
   }
   ```

2. **Remove React 16/17 compatibility workarounds** (if any exist)

3. **Update documentation** to clearly state React 18+ requirement

#### Slate.js Upgrade (0.78 → 0.120)

**Phase 1: Slate 0.94.x** (React 16.14+ compatible)
- Update `hotkeyHooks.ts`: Use `insertSoftBreak()` for soft line breaks
- Test all editor transforms work correctly

**Phase 2: Slate 0.99.x** (React 16.14+ compatible)
- Update `SlateProvider.tsx`: Rename `value` prop to `initialValue`
- Verify controlled editor behavior with workaround

**Phase 3: Slate 0.110.x** (React 18+ required)
- Update peerDependencies to React 18+
- Address any `slate-dom` import changes
- Update or replace `slate-react-presentation` dependency

**Phase 4: Slate 0.120.x** (Latest)
- Final upgrade to current version
- Review decoration behavior changes
- Comprehensive testing pass

#### Breaking Changes (Detailed)

| Change | Version | Files Affected | Complexity |
|--------|---------|----------------|------------|
| `insertSoftBreak()` method | 0.94.0 | hotkeyHooks.ts | S |
| `value` → `initialValue` | 0.95.0 | SlateProvider.tsx | S |
| React 18 required | 0.100.0 | package.json (all) | M |
| `slate-dom` extraction | 0.111.0 | Any DOM utility imports | S |
| Decoration recomputation | 0.116.0 | renderHooks.tsx (review) | M |

#### ReadOnly Rendering Update

The `slate-react-presentation` package (v0.1.1) may not be compatible with Slate 0.120.

**Options:**
1. Test compatibility with latest Slate
2. Replace with native `slate-react` read-only mode (recommended)
3. Build custom read-only renderer

**Recommended approach:**
```tsx
// Replace slate-react-presentation with native read-only mode
import { Slate, Editable } from 'slate-react';

const ReadOnlySlate = ({ data }) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  return (
    <Slate editor={editor} initialValue={data.slate}>
      <Editable readOnly renderElement={renderElement} renderLeaf={renderLeaf} />
    </Slate>
  );
};
```

### Non-Functional Requirements

#### Performance
- No regression in editor performance from Slate upgrade
- Slate 0.116+ includes performance optimizations for decorations
- Benchmark before/after upgrade

#### Backward Compatibility
- **Data format unchanged** - Existing Slate content works without migration
- **No new data migrations needed** - Slate 0.78→0.120 has no serialization changes
- ReactPage 5.x branch maintained for React 16/17 users (security fixes only)

#### TypeScript
- Upgrade to TypeScript 5.x (required by Slate 0.100+)
- Review and update types as needed
- Ensure strict mode compatibility

### Out of Scope

- Tiptap migration (separate decision, separate PRD if chosen)
- React 19 features (future consideration)
- New Slate features beyond compatibility (e.g., collaboration)
- Performance optimization beyond Slate's built-in improvements
- Adding new text formatting features

## Success Criteria

| Criteria | Measure |
|----------|---------|
| React 18 minimum | All packages require React >= 18.0 |
| Slate version | All Slate packages at 0.120.x |
| Tests passing | All existing tests pass on React 18 |
| No data migration | Existing content loads without changes |
| Documentation | Migration guide published |
| Release | ReactPage 6.0.0 published |

## Options Analysis

### Option 1: Full Upgrade (Recommended)

**Approach:** Require React 18, upgrade Slate to 0.120

**Pros:**
- Full access to latest Slate features
- Clean break with major version bump
- Reduced maintenance burden
- Industry-aligned

**Cons:**
- Breaks React 16/17 users
- Requires coordinated upgrade effort

**Effort:** M (2-4 weeks)

### Option 2: Partial Upgrade (Cap at Slate 0.99)

**Approach:** Upgrade Slate to 0.99.x, maintain React 16.14+ support

**Pros:**
- Maintains broader React support
- Gets some Slate improvements

**Cons:**
- Misses 21 versions of improvements
- Still need to upgrade eventually
- Doesn't solve root problem

**Effort:** S-M (1-2 weeks)

### Option 3: No Change

**Approach:** Stay on current versions

**Pros:**
- Zero risk, zero effort

**Cons:**
- Technical debt compounds
- Missing fixes and improvements
- Eventually forced to act

**Effort:** None now, unknown later

### Decision: Option 1 (Full Upgrade)

Rationale:
1. React 18 is mature (4+ years old)
2. Major version bump provides clean communication
3. One-time effort vs ongoing maintenance burden
4. Research epic validated Slate upgrade path

## Dependencies

### External Dependencies
- React 18.0+ (peer dependency)
- TypeScript 5.x (build dependency)
- slate 0.120.x
- slate-react 0.120.x
- slate-hyperscript 0.120.x
- slate-dom 0.120.x (may be needed)

### Internal Dependencies
- All ReactPage packages must update simultaneously
- Build system must support TypeScript 5.x
- CI must test against React 18

## Constraints & Assumptions

### Constraints
- **Major version bump required** - This is ReactPage 6.0
- **No data format changes** - Existing content must work
- **Phased Slate upgrade** - Cannot skip intermediate versions safely
- **Testing required at each phase** - 42 versions of changes

### Assumptions
- Most ReactPage users are on React 18+ (4 years since release)
- `slate-react-presentation` can be replaced with native read-only mode
- TypeScript 5 upgrade is straightforward
- No hidden breaking changes in Slate changelog

## Timeline

**Phase 1: Preparation** (Week 1)
- Create upgrade branch
- Set up React 18 test environment
- Upgrade TypeScript to 5.x
- Update build configuration

**Phase 2: Slate Upgrade** (Week 2-3)
- Incremental Slate upgrade through phases
- Testing at each checkpoint
- Fix any compatibility issues

**Phase 3: Documentation & Release** (Week 4)
- Write migration guide
- Update documentation
- Final testing
- Release ReactPage 6.0.0

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| slate-react-presentation incompatible | High | Medium | Replace with native read-only mode |
| Hidden behavioral changes | Medium | Medium | Comprehensive testing at each phase |
| React 16/17 user impact | Medium | Low | Clear documentation, maintain 5.x branch |
| TypeScript type breaks | Medium | Low | Review types carefully |
| Android editing regression | Low | Medium | Test on real devices |

## Appendix

### Current Package Versions

```json
// packages/plugins/content/slate/package.json
{
  "dependencies": {
    "slate": "^0.78.0",
    "slate-hyperscript": "^0.77.0",
    "slate-react": "^0.79.0",
    "slate-react-presentation": "^0.1.1"
  }
}
```

### Target Package Versions

```json
{
  "peerDependencies": {
    "react": ">= 18.0",
    "react-dom": ">= 18.0"
  },
  "dependencies": {
    "slate": "^0.120.0",
    "slate-hyperscript": "^0.120.0",
    "slate-react": "^0.120.0"
  }
}
```

### Reference Documents

- `.claude/epics/tiptap-vs-slate-upgrade/research/02-slate-changelog.md` - Full changelog analysis
- `.claude/epics/tiptap-vs-slate-upgrade/research/03-slate-upgrade-path.md` - Detailed upgrade steps
- `.claude/epics/tiptap-vs-slate-upgrade/research/01-current-state.md` - Current Slate integration inventory

### Key Files to Modify

| File | Change Required |
|------|-----------------|
| `packages/plugins/content/slate/package.json` | Slate versions, peerDeps |
| `packages/plugins/content/slate/src/components/SlateProvider.tsx` | value → initialValue |
| `packages/plugins/content/slate/src/components/hotkeyHooks.ts` | insertSoftBreak |
| `packages/plugins/content/slate/src/components/ReadOnlySlate.tsx` | Replace presentation lib |
| `packages/editor/package.json` | React peerDep |
| All other `package.json` files | React peerDep |
