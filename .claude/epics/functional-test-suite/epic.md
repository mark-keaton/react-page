---
name: functional-test-suite
status: in-progress
created: 2026-01-09T15:32:55Z
progress: 0%
prd: .claude/prds/functional-test-suite.md
github: https://github.com/mark-keaton/react-page/issues/1
---

# Epic: Functional Test Suite

## Overview

Implement a comprehensive functional test suite for ReactPage using Playwright (E2E) and Jest (integration) to enable safe dependency migration. The suite will cover drag-and-drop operations, Slate rich text editing, plugin system, and core state management. Tests will run in GitHub Actions CI and serve as the regression safety net.

## Architecture Decisions

### Testing Framework Choices
- **Playwright for E2E**: Modern, fast, cross-browser support, excellent TypeScript integration, built-in parallel execution
- **Jest for Integration**: Already in project, good ecosystem, works well with React Testing Library

### Test Organization
- E2E tests in `/e2e/` at project root (Playwright convention)
- Integration tests colocated with source in `__tests__/` directories (existing pattern)
- Page Object Model pattern for E2E to abstract UI interactions

### Test Target
- Use existing `examples/` Next.js app as E2E test target
- No modifications to application code required
- Tests verify current behavior as "correct"

## Technical Approach

### E2E Testing (Playwright)
- Install Playwright with TypeScript support
- Configure to start examples dev server before tests
- Create page objects for: Editor, Cell, Row, Slate, Plugin drawer
- Run against Chromium (primary), Firefox, WebKit

### Integration Testing (Jest)
- Enhance existing Jest setup with coverage reporting
- Add tests for Redux reducers, actions, selectors
- Test core hooks with React Testing Library
- Test serialization/migration logic

### CI/CD (GitHub Actions)
- Single workflow file for both test types
- Playwright runs in headless mode with failure artifacts
- Jest runs with coverage uploaded to Coveralls (existing)
- Cache node_modules and Playwright browsers

### Behavioral Baseline
- Create `docs/behavioral-baseline.md` documenting expected behaviors
- Organized by feature area (drag-drop, Slate, plugins, state)
- Updated as tests are written to capture observations

## Task Breakdown Preview

The following 8 tasks cover the full implementation:

- [ ] **Task 1: Playwright Infrastructure** - Install Playwright, configure for monorepo, create base fixtures, verify dev server integration
- [ ] **Task 2: GitHub Actions CI Workflow** - Create workflow for PR/push, run both Jest and Playwright, cache dependencies, collect artifacts
- [ ] **Task 3: E2E Core Editor Tests** - Editor initialization, cell/row CRUD, basic drag-and-drop operations
- [ ] **Task 4: E2E Slate Editor Tests** - Text input, formatting (bold/italic/lists), undo/redo, selection behavior
- [ ] **Task 5: E2E Plugin Tests** - Image, video, spacer, divider, background plugins - loading and configuration
- [ ] **Task 6: Integration Redux Tests** - Reducers, action creators, selectors for value/focus/hover state
- [ ] **Task 7: Integration Hooks & Serialization Tests** - useCell, useRow, useEditor hooks; JSON serialization; migrations
- [ ] **Task 8: Behavioral Baseline Documentation** - Document observed behaviors organized by feature area

## Dependencies

### External Dependencies
| Package | Purpose | Notes |
|---------|---------|-------|
| @playwright/test | E2E testing | Latest stable |
| jest (existing) | Integration tests | v26.6.3 in project |
| @testing-library/react (existing) | Component testing | v13.4.0 in project |

### Internal Dependencies
- Examples app must be runnable (`yarn dev`)
- All packages must build successfully
- Node.js 16+ required for Playwright

### Prerequisites
- None - this epic can start immediately

## Success Criteria (Technical)

| Metric | Target |
|--------|--------|
| E2E test cases | 50+ |
| Integration test cases | 100+ (including existing ~16) |
| Integration coverage | 70%+ of `packages/editor/src/core/` |
| CI duration | < 10 minutes |
| Flaky test rate | 0% |

## Estimated Effort

- **Total**: 8 tasks
- **Infrastructure** (Tasks 1-2): Foundation work
- **E2E Tests** (Tasks 3-5): Bulk of new test writing
- **Integration Tests** (Tasks 6-7): Enhance existing coverage
- **Documentation** (Task 8): Capture learnings

## Risk Mitigation

1. **Flaky drag-and-drop tests**: Use Playwright's built-in waiting strategies, avoid hardcoded delays
2. **Dev server startup time**: Configure adequate timeout, use Playwright's webServer option
3. **Cross-browser inconsistencies**: Focus on Chromium, run Firefox/WebKit as secondary
4. **Test isolation**: Each test resets editor state, no shared state between tests

## Notes

### Existing Test Coverage
The project already has 16 test files covering:
- Migrations (`migrate.test.ts`, `migrateValue.test.ts`)
- Reducers (`removeCell.test.ts`, `resizeCell.test.ts`, `updateCellContent.test.ts`)
- Utilities (`optimize.test.ts`, `sizing.test.ts`, `mapNode.test.ts`)
- Slate plugin (`htmlToSlate.test.ts`, `getTextContents.test.ts`)

These will be enhanced, not replaced.

### CI Status
No GitHub Actions workflow currently exists. Travis CI badge in README but no `.travis.yml` found. This epic will establish GitHub Actions as the CI platform.

## Tasks Created

- [ ] #2 - Playwright Infrastructure Setup (parallel: true)
- [ ] #3 - GitHub Actions CI Workflow (parallel: false, depends: #2)
- [ ] #4 - E2E Core Editor Tests (parallel: true, depends: #2)
- [ ] #5 - E2E Slate Editor Tests (parallel: true, depends: #2)
- [ ] #6 - E2E Plugin Tests (parallel: true, depends: #2)
- [ ] #7 - Integration Redux Tests (parallel: true)
- [ ] #8 - Integration Hooks and Serialization Tests (parallel: true)
- [ ] #9 - Behavioral Baseline Documentation (parallel: false, depends: #4-#8)

**Summary:**
- Total tasks: 8
- Parallel tasks: 6 (can run concurrently after dependencies met)
- Sequential tasks: 2 (#3 after #2, #9 after all tests)
- Estimated total effort: 62-76 hours
