---
name: functional-test-suite
description: Comprehensive functional test suite to enable safe dependency migration for ReactPage
status: backlog
created: 2026-01-09T15:31:12Z
---

# PRD: Functional Test Suite

## Executive Summary

ReactPage is an abandoned but capable WYSIWYG editor that requires modernization before it can be extended with new features (data layer plugins for CRM/DB integration). Before any dependency migration can safely proceed, we need a comprehensive functional test suite that documents current behavior and catches regressions.

This PRD defines a test suite using Playwright (E2E) and Jest (integration) that covers all critical editor functionality: drag-and-drop, Slate rich text editing, plugin system, and core rendering. The suite will run in GitHub Actions CI and serve as the safety net for subsequent modernization work.

## Problem Statement

### What problem are we solving?

ReactPage has outdated dependencies that need updating before the project can be extended. However, the existing test coverage is insufficient to safely refactor or upgrade dependencies without risking regressions. Key concerns include:

1. **No E2E test coverage** - User workflows like drag-and-drop, content editing, and plugin interactions are untested at the browser level
2. **Incomplete integration tests** - Critical paths through Redux state management and component interactions lack coverage
3. **Undocumented behavior** - Current functionality is not formally documented, making it unclear what "correct" behavior looks like
4. **High regression risk** - Upgrading React, MUI, React DnD, or Slate without comprehensive tests could silently break functionality

### Why is this important now?

The project is being adopted for internal tooling with plans to add a data layer plugin system. Dependency modernization is a prerequisite, and safe modernization requires comprehensive test coverage. Building tests now creates a behavioral baseline before any changes are made.

## User Stories

### Primary Personas

1. **Developer maintaining ReactPage** - Needs confidence that dependency upgrades don't break existing functionality
2. **Developer extending ReactPage** - Needs to understand expected behavior through executable specifications
3. **CI/CD pipeline** - Needs automated verification that PRs don't introduce regressions

### User Stories

#### US-1: Dependency Upgrade Confidence
**As a** developer upgrading dependencies
**I want** comprehensive tests that verify all editor functionality
**So that** I can upgrade packages with confidence and catch regressions immediately

**Acceptance Criteria:**
- [ ] Tests cover all drag-and-drop operations (add, move, delete cells/rows)
- [ ] Tests verify Slate editor functionality (typing, formatting, selection)
- [ ] Tests confirm plugin loading and rendering
- [ ] Tests validate serialization/deserialization of editor state
- [ ] All tests pass on current codebase before any upgrades begin

#### US-2: Behavioral Documentation
**As a** developer new to the codebase
**I want** tests that document expected behavior
**So that** I understand how the editor should work without reading all source code

**Acceptance Criteria:**
- [ ] Test descriptions clearly explain what behavior is being verified
- [ ] Edge cases are explicitly tested and documented
- [ ] Test file organization mirrors feature organization
- [ ] Baseline behavior document exists alongside tests

#### US-3: CI Integration
**As a** contributor submitting a PR
**I want** automated tests to run on my changes
**So that** I know immediately if I've broken something

**Acceptance Criteria:**
- [ ] GitHub Actions workflow runs all tests on PR
- [ ] Tests complete in under 10 minutes
- [ ] Clear failure messages identify what broke
- [ ] PR cannot merge if tests fail

#### US-4: Reliable Test Execution
**As a** developer running tests locally
**I want** tests that are deterministic and fast
**So that** I can iterate quickly without flaky failures

**Acceptance Criteria:**
- [ ] No flaky tests (same input always produces same result)
- [ ] Tests can run in parallel where possible
- [ ] Test setup/teardown is isolated (no shared state between tests)
- [ ] Local test run matches CI behavior

## Requirements

### Functional Requirements

#### FR-1: E2E Test Coverage (Playwright)

**FR-1.1: Editor Initialization**
- Verify editor renders with default configuration
- Verify editor renders with custom plugins
- Verify editor handles empty initial value
- Verify editor handles pre-populated content

**FR-1.2: Drag-and-Drop Operations**
- Add new cell from plugin drawer
- Move cell within same row
- Move cell to different row
- Move row up/down
- Delete cell via UI
- Delete row via UI
- Resize cells within row
- Nested cell operations (if supported)

**FR-1.3: Slate Rich Text Editor**
- Basic text input and editing
- Bold, italic, underline formatting
- Heading levels (H1-H6)
- Bullet and numbered lists
- Links (add, edit, remove)
- Undo/redo operations
- Copy/paste text
- Selection and cursor behavior

**FR-1.4: Plugin System**
- Image plugin: upload, resize, alignment
- Video plugin: embed URL, playback
- Spacer plugin: height adjustment
- Divider plugin: rendering
- Background plugin: color, image settings
- Custom plugin rendering

**FR-1.5: Editor State Management**
- Save/load editor content (JSON serialization)
- Undo/redo stack behavior
- onChange callback firing
- Read-only mode
- Controlled vs uncontrolled modes

#### FR-2: Integration Test Coverage (Jest)

**FR-2.1: Redux State Management**
- Action creators produce correct actions
- Reducers handle all action types correctly
- Selectors return expected data shapes
- Undo/redo middleware behavior

**FR-2.2: Core Hooks and Utilities**
- useCell hook behavior
- useRow hook behavior
- useEditor hook behavior
- Cell/row manipulation utilities
- Plugin resolution logic

**FR-2.3: Serialization**
- Editor value to JSON
- JSON to editor value
- Migration of old data formats (if applicable)
- Schema validation

#### FR-3: Test Infrastructure

**FR-3.1: Playwright Setup**
- Configure Playwright for React/TypeScript project
- Set up test fixtures for common scenarios
- Create page object models for editor interactions
- Configure parallel test execution

**FR-3.2: Jest Enhancement**
- Organize tests by feature area
- Create test utilities for common assertions
- Mock external dependencies appropriately
- Configure coverage reporting

**FR-3.3: GitHub Actions CI**
- Workflow triggers on PR and push to main
- Playwright tests run in headed mode with artifacts on failure
- Jest tests run with coverage reporting
- Cache dependencies for faster runs

#### FR-4: Behavioral Baseline Documentation

**FR-4.1: Baseline Document**
- Document current drag-and-drop behavior
- Document Slate editor behavior
- Document plugin system behavior
- Document serialization format
- Include screenshots/recordings where helpful

### Non-Functional Requirements

#### NFR-1: Performance
- Full E2E suite completes in under 8 minutes
- Full integration suite completes in under 2 minutes
- Individual E2E tests complete in under 30 seconds
- Tests do not significantly slow down local development

#### NFR-2: Reliability
- Zero flaky tests (100% deterministic)
- Tests are isolated (can run in any order)
- Tests clean up after themselves
- Tests work on macOS, Linux (CI environments)

#### NFR-3: Maintainability
- Tests follow consistent patterns and conventions
- Page objects abstract UI interactions
- Test utilities reduce duplication
- Clear naming conventions for test files and cases

#### NFR-4: Developer Experience
- Tests can run locally with single command
- Clear error messages on failure
- Easy to add new tests following existing patterns
- Documentation for running and writing tests

## Success Criteria

### Quantitative Metrics

| Metric | Target |
|--------|--------|
| E2E test count | 50+ test cases |
| Integration test count | 100+ test cases |
| Code coverage (integration) | 70%+ of core packages |
| CI pipeline duration | < 10 minutes |
| Flaky test rate | 0% |
| Test pass rate on current code | 100% |

### Qualitative Metrics

- Developers report confidence in making changes
- New contributors can understand behavior from tests
- Dependency upgrades are attempted with test suite as safety net
- No regressions slip through to production

## Constraints & Assumptions

### Constraints

1. **Existing codebase** - Tests must work with current code without modifications
2. **Monorepo structure** - Tests must integrate with Lerna/Yarn workspaces
3. **Browser compatibility** - E2E tests should cover Chromium (primary), Firefox, WebKit
4. **CI resources** - GitHub Actions free tier limits (6 hours/month for private, unlimited for public)

### Assumptions

1. Current behavior is considered "correct" - tests codify existing behavior, not ideal behavior
2. Examples app is representative of real usage
3. Playwright and Jest are acceptable tooling choices
4. Team has familiarity with modern testing practices

## Out of Scope

The following are explicitly NOT part of this PRD:

1. **Visual regression testing** - No screenshot comparison tests
2. **Performance testing** - No load testing or performance benchmarks
3. **Accessibility testing** - No automated a11y verification (could be future work)
4. **Mobile/touch testing** - Focus on desktop browser interactions
5. **API/backend testing** - ReactPage is frontend-only
6. **Fixing existing bugs** - Tests document current behavior, bugs and all
7. **Test coverage for examples app** - Focus on library packages only
8. **Cross-browser edge cases** - Basic multi-browser, not exhaustive

## Dependencies

### External Dependencies

| Dependency | Purpose | Version |
|------------|---------|---------|
| Playwright | E2E testing framework | Latest stable |
| Jest | Integration testing (already in project) | Existing |
| @testing-library/react | Component testing utilities | Existing |
| GitHub Actions | CI/CD platform | N/A |

### Internal Dependencies

| Dependency | Required For |
|------------|--------------|
| Examples app | E2E test target (runs dev server) |
| All packages build | Tests require built packages |
| Node.js 16+ | Playwright requirement |

### Team Dependencies

- Developer time to write and maintain tests
- Code review for test quality
- Documentation review for baseline document

## Implementation Phases

### Phase 1: Infrastructure Setup
- Playwright installation and configuration
- GitHub Actions workflow creation
- Test directory structure and conventions
- Basic smoke test to verify setup

### Phase 2: Core Editor E2E Tests
- Editor initialization tests
- Basic drag-and-drop tests
- Cell/row CRUD operations

### Phase 3: Slate Editor E2E Tests
- Text input and editing
- Formatting operations
- Selection behavior

### Phase 4: Plugin E2E Tests
- Each content plugin (image, video, spacer, divider, slate)
- Layout plugin (background)
- Plugin configuration UI

### Phase 5: Integration Tests
- Redux state management
- Core hooks
- Serialization

### Phase 6: Baseline Documentation
- Document observed behaviors
- Create reference for regression detection

### Phase 7: CI Optimization
- Parallel execution tuning
- Caching optimization
- Failure artifact collection

## Appendix

### A. Existing Test Analysis

Current test coverage in the repository:
- `packages/editor/src/**/__tests__/` - Some unit tests exist
- Jest configured at root level
- @testing-library/react available

Gaps identified:
- No E2E tests
- No Playwright setup
- Limited integration test coverage
- No CI workflow for comprehensive testing

### B. Related Documentation

- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
- [ReactPage Documentation](https://react-page.github.io/docs)
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Existing test commands
