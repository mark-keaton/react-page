---
name: dependency-modernization
status: backlog
created: 2026-01-09T18:03:41Z
progress: 0%
prd: .claude/prds/dependency-modernization.md
github: https://github.com/mark-keaton/react-page/issues/11
---

# Epic: dependency-modernization

## Overview

Systematically upgrade ReactPage's dependencies to enable Node 22/24 LTS support, Next.js/Vite compatibility, and eliminate security vulnerabilities. Using a conservative one-at-a-time approach validated by the existing 541+ test suite.

## Architecture Decisions

### 1. Monorepo Tooling: Keep Lerna, Upgrade to v8
**Rationale:** Lerna 8 is actively maintained by Nx team. Switching to alternatives (Nx, Turborepo) would be a larger migration with learning curve. Lerna 8 is a straightforward upgrade path.

### 2. React-DnD: Upgrade Before Considering Replacement
**Rationale:** Try upgrading react-dnd to latest first (v16+). Only replace with dnd-kit if the upgrade fails to resolve Next.js/Vite SSR issues. Replacement would require significant refactoring.

### 3. Batch Compatible Updates
**Rationale:** While conservative, some updates can be safely batched:
- Babel packages (all @babel/* together)
- MUI + Emotion (tightly coupled)
- Type definitions (@types/*)

### 4. CI Matrix Testing
**Rationale:** Add Node version matrix to GitHub Actions early, so every subsequent change is validated across Node 20/22/24.

## Technical Approach

### Update Strategy
Each task follows this pattern:
1. Create branch for the update
2. Update package(s)
3. Fix any immediate build errors
4. Run full test suite (Jest + Playwright)
5. Document any breaking changes
6. Merge and move to next

### Dependency Graph (Update Order)
```
Babel/TypeScript (foundation)
       ↓
    Jest (testing)
       ↓
    Lerna (monorepo)
       ↓
React-DnD/Redux (react ecosystem)
       ↓
  Slate.js (editor core)
       ↓
  MUI/Emotion (UI layer)
       ↓
Node LTS + Integration Tests (validation)
```

### Risk Mitigation
- **Checkpoint commits**: After each successful update
- **Rollback plan**: Each task on separate branch
- **Test validation**: Full suite must pass before proceeding

## Task Breakdown

Consolidated into 8 focused tasks (down from PRD's 12 items):

- [ ] **Task 1: Babel + TypeScript Upgrade** - Foundation updates (Babel 7.28, TS 5.7)
- [ ] **Task 2: Jest Upgrade** - Test framework (Jest 30, @types/jest)
- [ ] **Task 3: Lerna Migration** - Monorepo tooling (Lerna 3 → 8)
- [ ] **Task 4: React-DnD Compatibility** - Fix Next.js/Vite SSR issues
- [ ] **Task 5: Redux + Slate Updates** - React ecosystem packages
- [ ] **Task 6: MUI + Emotion Updates** - UI framework (5.10 → 5.18)
- [ ] **Task 7: Node LTS + CI Matrix** - Validate Node 20/22/24, update CI
- [ ] **Task 8: Integration Testing** - Next.js and Vite example apps

## Dependencies

### Prerequisites (Completed)
- ✅ Functional test suite (541+ tests)
- ✅ GitHub Actions CI pipeline

### External Dependencies
- npm registry
- Upstream package compatibility (react-dnd, slate, mui)

### Task Dependencies
```
Task 1 (Babel/TS) → Task 2 (Jest) → Task 3 (Lerna)
                                          ↓
                                    Task 4 (React-DnD)
                                          ↓
                                    Task 5 (Redux/Slate)
                                          ↓
                                    Task 6 (MUI/Emotion)
                                          ↓
                                    Task 7 (Node LTS)
                                          ↓
                                    Task 8 (Integration)
```

## Success Criteria (Technical)

| Check | Validation |
|-------|------------|
| All tests pass | `yarn test` + `yarn test:e2e` = 0 failures |
| No security issues | `npm audit` = 0 high/critical |
| Node 22 works | CI matrix passes on Node 22 |
| Node 24 works | CI matrix passes on Node 24 |
| Next.js works | Example app builds and runs |
| Vite works | Example app builds and runs |
| Build time OK | < 20% regression |
| Bundle size OK | < 10% regression |

## Estimated Effort

| Task | Size | Risk |
|------|------|------|
| 1. Babel + TypeScript | M | Low |
| 2. Jest Upgrade | S | Low |
| 3. Lerna Migration | M | Medium |
| 4. React-DnD | L | High |
| 5. Redux + Slate | M | Medium |
| 6. MUI + Emotion | S | Low |
| 7. Node LTS + CI | S | Low |
| 8. Integration Testing | M | Medium |

**Critical Path:** Task 4 (React-DnD) is highest risk - if upgrade fails, may need dnd-kit replacement which would significantly increase scope.

## Notes

- Each task should be a separate PR for clean rollback capability
- Run full E2E test suite after each major update
- Document any API changes in CHANGELOG.md

## Tasks Created

- [ ] #12 - Babel + TypeScript Upgrade (parallel: false)
- [ ] #13 - Jest Upgrade (parallel: false, depends: #12)
- [ ] #14 - Lerna Migration (parallel: false, depends: #13)
- [ ] #15 - React-DnD Compatibility (parallel: false, depends: #14) **HIGH RISK**
- [ ] #16 - Redux + Slate Updates (parallel: false, depends: #15)
- [ ] #17 - MUI + Emotion Updates (parallel: false, depends: #16)
- [ ] #18 - Node LTS + CI Matrix (parallel: false, depends: #17)
- [ ] #19 - Integration Testing (parallel: false, depends: #18)

**Total tasks:** 8
**Parallel tasks:** 0 (all sequential due to dependency chain)
**Sequential tasks:** 8
**Estimated total effort:** 43-57 hours
