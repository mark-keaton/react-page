---
name: dependency-modernization
description: Modernize ReactPage dependencies to support Node 22/24 LTS, Next.js, and Vite
status: backlog
created: 2026-01-09T17:59:57Z
---

# PRD: dependency-modernization

## Executive Summary

Modernize the ReactPage WYSIWYG editor's dependencies to eliminate security vulnerabilities, enable compatibility with modern build tools (Next.js, Vite), and support current Node.js LTS versions (22/24). This is a prerequisite for adopting ReactPage in production environments and enables future feature development.

The project has been abandoned by its original maintainer who explicitly recommended "not adding new features, but updating everything first." We have completed Phase 1 (functional test suite with 541+ tests) which provides the safety net for this modernization effort.

## Problem Statement

### Current State
- **Babel**: v7.2.0 (from 2018, current is 7.28.x)
- **Lerna**: v3.22.0 (deprecated, current is 8.x)
- **Jest**: v26.6.3 (current is 30.x)
- **TypeScript**: v4.8.3 (current is 5.7.x)
- **MUI**: v5.10.x (current is 7.x, but 5.18.x is stable path)
- **React-DnD**: Known compatibility issues with Next.js and Vite
- **Node.js**: Requires updates to support Node 22/24 LTS

### Why This Matters Now
1. **Security**: Outdated dependencies contain known vulnerabilities
2. **Compatibility**: React-DnD doesn't work properly with Next.js/Vite
3. **Maintainability**: Old tooling creates developer friction and CI issues
4. **Support**: Node 14/16 are end-of-life; need Node 22/24 LTS support

## User Stories

### As a developer integrating ReactPage
- I want to use ReactPage with Next.js 14+ so I can build modern React applications
- I want to use ReactPage with Vite so I can have fast development builds
- I want to run on Node 22/24 LTS so I have long-term support and security updates

**Acceptance Criteria:**
- ReactPage builds and runs on Node 22 and Node 24
- ReactPage works with Next.js 14+ without react-dnd errors
- ReactPage works with Vite 5+ without compatibility issues
- All 541+ existing tests pass after updates

### As a maintainer of ReactPage
- I want modern build tooling so I can maintain the project efficiently
- I want current dependencies so I don't have to manage security vulnerabilities
- I want TypeScript 5.x so I can use modern language features

**Acceptance Criteria:**
- Build completes without deprecation warnings
- No high/critical security vulnerabilities in dependencies
- TypeScript strict mode compatibility

### As a security-conscious organization
- I want no known CVEs in dependencies so I can pass security audits
- I want actively maintained dependencies so vulnerabilities get patched

**Acceptance Criteria:**
- `npm audit` returns no high/critical vulnerabilities
- All major dependencies are actively maintained (commits within 6 months)

## Requirements

### Functional Requirements

#### Phase 1: Build Tooling (Foundation)
1. **Upgrade Babel** from 7.2.x to 7.28.x
   - Update all @babel/* packages
   - Remove deprecated plugins (class-properties is now standard)
   - Update babel.config.js for new preset options

2. **Upgrade TypeScript** from 4.8.x to 5.7.x
   - Update tsconfig.json for new compiler options
   - Fix any new type errors introduced
   - Enable stricter checks incrementally

3. **Migrate Lerna** from 3.x to 8.x (or consider alternatives)
   - Lerna 3 is deprecated
   - Evaluate: Lerna 8, Nx, Turborepo, or yarn workspaces alone
   - Update monorepo scripts accordingly

4. **Upgrade Jest** from 26.x to 30.x
   - Update jest.config.js
   - Update @types/jest
   - Fix any breaking test changes

#### Phase 2: React Ecosystem
5. **Update React-DnD** for Next.js/Vite compatibility
   - Current react-dnd has SSR issues
   - Evaluate: update to latest, or replace with dnd-kit
   - Ensure drag-drop tests pass

6. **Update React-Redux** to latest v8.x or v9.x
   - Maintain Redux DevTools compatibility
   - Update any deprecated patterns

7. **Update Slate.js** to latest stable
   - Check for breaking API changes
   - Update Slate plugin implementations

#### Phase 3: UI Framework
8. **Update MUI** from 5.10.x to 5.18.x (stable)
   - Minor version updates should be safe
   - Major update to v7 is out of scope (too risky)

9. **Update Emotion** packages to latest
   - Required for MUI compatibility

#### Phase 4: Validation & Cleanup
10. **Node.js LTS Validation**
    - Test on Node 20, 22, and 24
    - Update engines field in package.json
    - Update GitHub Actions to test on LTS versions

11. **Security Audit**
    - Run npm audit fix
    - Address remaining vulnerabilities manually
    - Document any accepted risks

12. **Next.js/Vite Integration Testing**
    - Create example apps with Next.js 14+
    - Create example apps with Vite 5+
    - Verify SSR works correctly

### Non-Functional Requirements

#### Performance
- Build time should not increase by more than 20%
- Bundle size should not increase by more than 10%
- Runtime performance unchanged (validated by E2E tests)

#### Security
- Zero high/critical vulnerabilities in npm audit
- All dependencies should have active maintenance

#### Compatibility
- Node.js: 20, 22, 24 (LTS versions)
- React: 18.x (maintain current compatibility)
- Browsers: Chrome, Firefox, Safari, Edge (last 2 versions)

## Success Criteria

| Metric | Target |
|--------|--------|
| npm audit high/critical issues | 0 |
| Test pass rate | 100% (all 541+ tests) |
| Node 22 compatibility | Full |
| Node 24 compatibility | Full |
| Next.js 14+ compatibility | Full |
| Vite 5+ compatibility | Full |
| Build time regression | <20% |
| Bundle size regression | <10% |

## Constraints & Assumptions

### Constraints
- **Conservative approach**: One major dependency update at a time
- **Test-driven**: Every update must pass full test suite
- **No feature changes**: Pure dependency updates, no new functionality
- **Backwards compatibility**: Maintain existing API surface

### Assumptions
- React 18 is sufficient (no need for React 19 yet)
- MUI 5.x is acceptable (v7 migration would be a separate effort)
- Existing test suite provides adequate coverage for regression detection

## Out of Scope

- **React 19 upgrade**: Stay on React 18 for stability
- **MUI v7 migration**: Would require significant component rewrites
- **New features**: Per maintainer guidance, stabilize first
- **Documentation rewrite**: Minor updates only as needed
- **Breaking API changes**: Maintain backwards compatibility

## Dependencies

### Internal
- Functional test suite (completed - 541+ tests)
- CI/CD pipeline (completed - GitHub Actions)

### External
- npm registry availability
- GitHub Actions runners
- Compatibility matrices from upstream projects

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| React-DnD replacement needed | Medium | High | Evaluate dnd-kit as alternative early |
| Slate.js breaking changes | Medium | High | Review changelog before updating |
| Lerna migration complexity | Medium | Medium | Consider simpler alternatives first |
| Hidden dependency conflicts | High | Medium | Update one package at a time, test thoroughly |

## Timeline Considerations

Recommended order based on dependency graph and risk:
1. Build tooling (Babel, TypeScript) - foundation
2. Test tooling (Jest) - validates other changes
3. React ecosystem (React-DnD, Redux, Slate)
4. UI framework (MUI, Emotion)
5. Validation and integration testing
