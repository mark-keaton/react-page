---
name: react-18-upgrade
status: backlog
created: 2026-01-14T21:21:54Z
progress: 0%
prd: .claude/prds/react-18-upgrade.md
github: https://github.com/mark-keaton/react-page/issues/24
---

# Epic: react-18-upgrade

## Overview

Upgrade ReactPage to require React 18+ as minimum and update Slate.js from 0.78 to 0.120. This is a major version bump (ReactPage 6.0) that trades React 16/17 support for access to 4 years of Slate improvements and reduced maintenance burden.

**Key constraint:** Data format is unchanged - existing content must work without migration.

## Architecture Decisions

### Decision 1: Phased Slate Upgrade
- **Approach:** Upgrade Slate incrementally through 4 phases (0.94 → 0.99 → 0.110 → 0.120)
- **Rationale:** 42 versions of changes are too risky to apply at once; phased approach allows testing at stable checkpoints
- **Rollback:** Each phase has a clean git tag for rollback

### Decision 2: Replace slate-react-presentation
- **Approach:** Use native `slate-react` read-only mode instead of third-party package
- **Rationale:** `slate-react-presentation` is unmaintained and unlikely compatible with Slate 0.120
- **Implementation:** Pass `readOnly={true}` to `<Editable>` component

### Decision 3: TypeScript 5.x Upgrade
- **Approach:** Upgrade TypeScript as part of preparation phase
- **Rationale:** Slate 0.100+ requires TypeScript 5.x
- **Risk:** Low - TypeScript 5 is backward compatible

### Decision 4: Major Version Bump
- **Approach:** Release as ReactPage 6.0.0
- **Rationale:** Breaking change (React 16/17 dropped) requires major version per semver
- **Communication:** Clear in CHANGELOG and migration guide

## Technical Approach

### Code Changes Required

| File | Change | Phase |
|------|--------|-------|
| `SlateProvider.tsx` | `value` → `initialValue` prop | Phase 2 |
| `hotkeyHooks.ts` | Use `insertSoftBreak()` | Phase 1 |
| `ReadOnlySlate.tsx` | Replace slate-react-presentation | Phase 3 |
| `renderHooks.tsx` | Review decoration behavior | Phase 4 |
| All `package.json` | Update peerDeps to React 18+ | Phase 3 |
| Slate `package.json` | Update Slate versions | All phases |

### Package Updates

**Phase 1-2 (React 16.14+ compatible):**
```json
"slate": "^0.99.0"
```

**Phase 3-4 (React 18+ required):**
```json
"peerDependencies": { "react": ">= 18.0" },
"dependencies": { "slate": "^0.120.0" }
```

### Testing Strategy

- Run full test suite at each phase checkpoint
- Manual testing of: basic editing, marks, blocks, paste, mobile
- Verify existing content loads correctly (no data migration)

## Implementation Strategy

### Simplification Decisions

1. **Single upgrade branch** - All work on one branch, not separate per phase
2. **Combined testing** - Test comprehensively at end, spot-check at phases
3. **Minimal code changes** - Only change what Slate requires, no refactoring
4. **Skip intermediate releases** - No public releases between phases

### Development Flow

```
Preparation (TS 5, React 18 env)
    ↓
Slate Phase 1-2 (0.99, still React 16.14+)
    ↓
Slate Phase 3-4 (0.120, React 18+)
    ↓
ReadOnly component update
    ↓
Documentation & Release
```

## Task Breakdown Preview

High-level tasks (max 10, minimal approach):

- [ ] **Task 1:** Preparation - TypeScript 5 upgrade and React 18 test environment
- [ ] **Task 2:** Slate upgrade phases 1-2 (0.78 → 0.99, code changes)
- [ ] **Task 3:** Slate upgrade phases 3-4 (0.99 → 0.120, React 18 peerDeps)
- [ ] **Task 4:** Replace slate-react-presentation with native read-only
- [ ] **Task 5:** Update all package.json peerDependencies to React 18+
- [ ] **Task 6:** Comprehensive testing and bug fixes
- [ ] **Task 7:** Documentation and migration guide

**Total: 7 tasks** (consolidated from PRD's 4 phases + supporting work)

## Dependencies

### External Dependencies
- React 18.0+ (peer dependency)
- TypeScript 5.x (build dependency)
- slate 0.120.x, slate-react 0.120.x, slate-hyperscript 0.120.x

### Internal Dependencies
- Task 1 (preparation) must complete before Task 2
- Tasks 2-3 are sequential (Slate phases)
- Tasks 4-5 can run in parallel after Task 3
- Task 6 depends on all code changes
- Task 7 depends on Task 6 passing

### Prerequisite Work
- None - research epic already completed

## Success Criteria (Technical)

| Criteria | Measure |
|----------|---------|
| React peerDep | All packages specify `"react": ">= 18.0"` |
| Slate version | All Slate deps at `^0.120.0` |
| Tests pass | `yarn test` exits 0 |
| Build succeeds | `yarn build` exits 0 |
| No data migration | Existing demo content loads unchanged |
| Types compile | No TypeScript errors in strict mode |

## Estimated Effort

**Overall:** M (Medium) - 2-3 weeks

| Task | Effort | Risk |
|------|--------|------|
| Preparation (TS 5, env) | S | L |
| Slate phases 1-2 | S | L |
| Slate phases 3-4 | M | M |
| ReadOnly component | S | M |
| PeerDeps update | S | L |
| Testing & fixes | M | M |
| Documentation | S | L |

**Critical path:** Slate phase 3-4 (React 18 requirement) + Testing

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| slate-react-presentation incompatible | High | Medium | Replace with native (Task 4) |
| Hidden Slate behavioral changes | Medium | Medium | Comprehensive testing (Task 6) |
| TypeScript type mismatches | Medium | Low | Review during upgrade |
| Android editing regression | Low | Medium | Manual device testing |

## Notes

- Data format is unchanged between Slate 0.78 and 0.120
- No new migrations needed in `packages/plugins/content/slate/src/migrations/`
- Existing research in `.claude/epics/tiptap-vs-slate-upgrade/research/` provides detailed guidance
- ReactPage 5.x branch should be maintained for security fixes only

## Tasks Created

| Task | Name | Depends On | Parallel | Effort |
|------|------|------------|----------|--------|
| #25 | Preparation - TypeScript 5 and React 18 environment | - | No | S (2-4h) |
| #26 | Slate upgrade phases 1-2 (0.78 → 0.99) | #25 | No | S (2-4h) |
| #27 | Slate upgrade phases 3-4 (0.99 → 0.120) | #26 | No | M (4-8h) |
| #28 | Replace slate-react-presentation with native read-only | #27 | Yes | S (2-4h) |
| #29 | Update all peerDependencies to React 18+ | #27 | Yes | S (1-2h) |
| #30 | Comprehensive testing and bug fixes | #28, #29 | No | M (8-16h) |
| #31 | Documentation and migration guide | #30 | No | S (2-4h) |

**Summary:**
- Total tasks: 7
- Parallel tasks: 2 (#28, #29)
- Sequential tasks: 5 (#25, #26, #27, #30, #31)
- Estimated total effort: 21-42 hours (3-5 days)

**Execution flow:**
```
#25 (prep)
 ↓
#26 (Slate 0.99)
 ↓
#27 (Slate 0.120)
 ├──► #28 (ReadOnly) ──┐
 │                     ├──► #30 (Testing) ──► #31 (Docs)
 └──► #29 (peerDeps) ──┘
```
