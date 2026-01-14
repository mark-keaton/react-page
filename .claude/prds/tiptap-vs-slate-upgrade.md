---
name: tiptap-vs-slate-upgrade
description: Evaluate upgrading Slate.js vs migrating to Tiptap for rich text editing
status: backlog
created: 2026-01-14T19:42:09Z
---

# PRD: tiptap-vs-slate-upgrade

## Executive Summary

ReactPage's rich text editing is powered by Slate.js, currently pinned at version 0.78.0 (with slate-react at 0.79.0). The latest Slate versions are 0.118.1 and 0.119.0 respectively - approximately 40 versions behind. This PRD evaluates two paths forward:

1. **Upgrade Slate** - Catch up on ~40 versions of Slate.js
2. **Migrate to Tiptap** - Replace Slate with Tiptap (built on ProseMirror)

The goal is to make a well-informed recommendation that balances stability, maintenance burden, and backward compatibility.

## Problem Statement

### What problem are we solving?

ReactPage depends on an outdated version of Slate.js that:
- May contain unpatched security vulnerabilities
- Misses bug fixes and performance improvements from 40+ versions
- Creates technical debt that compounds over time
- May become harder to upgrade the longer we wait

### Why is this important now?

This is preventive maintenance. While there are no immediate production issues:
- Slate.js has a history of breaking API changes between versions
- The gap between our version and current is substantial
- Evaluating options now allows deliberate decision-making vs. crisis response
- Understanding the effort required informs future planning

## User Stories

### Primary Personas

**Library Maintainers (ReactPage team)**
- Need sustainable, maintainable codebase
- Want to minimize breaking changes for downstream users
- Need clear upgrade path when Slate issues do arise

**Library Consumers (Developers using ReactPage)**
- Expect rich text editing to "just work"
- Have existing content stored in Slate format
- Need migration tooling if data format changes

### User Journeys

**As a ReactPage maintainer**, I want to understand the effort required for each upgrade path so that I can make an informed decision about the project's future.

**As a ReactPage consumer**, I want assurance that my existing content will continue to work after any upgrade, with clear migration paths if needed.

### Pain Points Being Addressed

- Uncertainty about long-term viability of current Slate integration
- Unknown security/stability risks in outdated dependency
- Lack of documented decision rationale for future reference

## Requirements

### Functional Requirements

#### Research Deliverables

1. **Slate Upgrade Analysis**
   - Document breaking changes between 0.78 and latest
   - Identify required migration steps
   - Assess impact on ReactPage's Slate plugin architecture
   - Review Slate's changelog and migration guides

2. **Tiptap Migration Analysis**
   - Compare Tiptap's data model to Slate's
   - Identify equivalent features for all current Slate sub-plugins
   - Assess Tiptap's stability and release cadence
   - Evaluate Tiptap's extension ecosystem

3. **Comparison Matrix**
   - Side-by-side feature comparison
   - Stability/maintenance comparison
   - Community and commercial support comparison
   - Performance characteristics

4. **Recommendation**
   - Clear recommendation with rationale
   - Risk assessment for each option
   - Suggested implementation approach for chosen path

### Non-Functional Requirements

**Backward Compatibility**
- Any chosen path must preserve existing user content
- Migration tooling must be provided if data format changes
- Breaking changes to ReactPage's public API should be minimized

**Maintainability**
- Chosen solution should reduce long-term maintenance burden
- Should not introduce new unstable dependencies
- Should have clear upgrade path for future versions

### Out of Scope

- Actual implementation of either upgrade path (research only)
- Prototyping or proof-of-concept builds
- Performance benchmarking
- User testing

## Success Criteria

| Criteria | Measure |
|----------|---------|
| Decision clarity | Clear recommendation with documented rationale |
| Risk assessment | All major risks identified for each option |
| Effort estimation | T-shirt size estimates (S/M/L/XL) for each path |
| Stakeholder alignment | Recommendation reviewed and accepted |

## Options Analysis

### Option 1: Upgrade Slate to Latest

**Approach:** Incrementally upgrade Slate.js from 0.78 to 0.118+

**Pros:**
- No data format migration required (likely)
- Smaller conceptual change
- Preserves existing knowledge/investment in Slate

**Cons:**
- Slate has history of breaking changes
- May require multiple migration steps
- Slate remains "less stable" long-term
- Still React-only (no framework flexibility)

**Effort Estimate:** M-L (Medium to Large)
- Depends on breaking changes between versions
- May require updating ReactPage's migration system
- Sub-plugins may need updates

**Risks:**
- Unknown breaking changes in 40 versions
- Slate could continue unstable release patterns
- May need repeated effort for future upgrades

### Option 2: Migrate to Tiptap

**Approach:** Replace Slate with Tiptap (ProseMirror-based)

**Pros:**
- Built on battle-tested ProseMirror
- More stable API history
- Better developer experience than raw ProseMirror
- Active commercial backing (Tiptap GmbH)
- Framework-agnostic (future flexibility)
- Strong extension ecosystem

**Cons:**
- Different data model (requires content migration)
- Larger initial effort
- All sub-plugins must be rewritten
- Learning curve for contributors

**Effort Estimate:** L-XL (Large to Extra Large)
- New Tiptap integration layer
- Rewrite all Slate sub-plugins (headings, lists, bold, etc.)
- Content migration tooling
- Testing and documentation

**Risks:**
- Data migration complexity for users
- Potential subtle behavior differences
- Contributor onboarding to new stack

### Option 3: Stay on Current Slate (Baseline)

**Approach:** Do nothing, accept current state

**Pros:**
- Zero effort
- No risk of regression

**Cons:**
- Technical debt continues accumulating
- Security/bug concerns remain
- Eventually forced to act (reactive vs. proactive)

**Effort Estimate:** S (Short-term), XL (Long-term when forced)

**Risks:**
- Compounding technical debt
- Crisis-driven decision making later
- Potential security exposure

## Dependencies

### External Dependencies
- Slate.js release notes and migration guides
- Tiptap documentation and extension API
- ProseMirror schema documentation

### Internal Dependencies
- Understanding of current Slate plugin architecture
- Inventory of all Slate sub-plugins in use
- Knowledge of existing data migration system

## Constraints & Assumptions

### Constraints
- Backward compatibility is non-negotiable
- Research only - no implementation in this phase
- Minimize future maintenance burden

### Assumptions
- Slate's historical instability pattern will continue
- Tiptap/ProseMirror stability will continue
- ReactPage users have varying amounts of existing content
- Migration tooling can be provided for data format changes

## Timeline

This is a research PRD. Suggested phases:

1. **Slate Analysis** - Review changelogs, breaking changes, migration guides
2. **Tiptap Analysis** - Evaluate architecture, extensions, data model
3. **Comparison & Recommendation** - Document findings, make recommendation
4. **Review** - Stakeholder review and decision

## Appendix

### Current Slate Integration Files

Key files in `packages/plugins/content/slate/`:
- `src/index.tsx` - Main plugin definition
- `src/plugins/` - Sub-plugins (formatting, headings, lists, etc.)
- `src/migrations/` - Data migration handlers (v002, v003, v004)
- `src/components/SlateEditor.tsx` - Edit mode component
- `src/components/ReadOnlySlate.tsx` - Read-only renderer

### Reference Links

- [Slate.js GitHub](https://github.com/ianstormtaylor/slate)
- [Tiptap Documentation](https://tiptap.dev/)
- [ProseMirror Guide](https://prosemirror.net/docs/guide/)
- [Liveblocks Editor Comparison (2025)](https://liveblocks.io/blog/which-rich-text-editor-framework-should-you-choose-in-2025)
