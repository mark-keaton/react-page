---
name: tiptap-vs-slate-upgrade
status: backlog
created: 2026-01-14T19:53:38Z
progress: 0%
prd: .claude/prds/tiptap-vs-slate-upgrade.md
github: [Will be updated when synced to GitHub]
---

# Epic: tiptap-vs-slate-upgrade

## Overview

Research epic to evaluate two paths for ReactPage's rich text editing future: upgrading Slate.js from 0.78 to latest (~40 versions) vs. migrating to Tiptap (ProseMirror-based). This is a research-only effort - no implementation, just analysis and recommendation.

**Key constraint:** Backward compatibility is non-negotiable. Any recommendation must include a viable path for existing user content.

## Architecture Decisions

### Decision 1: Research Methodology
- **Approach:** Document-based research using changelogs, release notes, and documentation
- **Rationale:** PRD explicitly scopes this as research-only, no prototyping
- **Output:** Markdown analysis documents with structured findings

### Decision 2: Evaluation Criteria
Priority-ordered criteria for comparison:
1. **Backward compatibility** - Can existing content be preserved?
2. **Stability** - API change frequency, breaking change history
3. **Maintenance burden** - Ongoing effort to stay current
4. **Migration effort** - One-time cost to switch/upgrade
5. **Ecosystem** - Extensions, community, commercial support

### Decision 3: Deliverable Format
- Single comprehensive analysis document per option
- Comparison matrix for side-by-side evaluation
- Final recommendation document with clear rationale

## Technical Approach

### Research Areas

**Slate Upgrade Path:**
- Review GitHub releases 0.78 → 0.118 for breaking changes
- Identify migration steps documented in Slate's guides
- Assess impact on ReactPage's existing migration system (v002, v003, v004)
- Catalog changes needed in sub-plugins

**Tiptap Migration Path:**
- Compare ProseMirror/Tiptap data model to Slate nodes
- Map current Slate sub-plugins to Tiptap extensions
- Evaluate content migration strategy (Slate JSON → ProseMirror JSON)
- Review Tiptap's release history for stability patterns

**Current State Inventory:**
- Document all Slate sub-plugins in `packages/plugins/content/slate/src/plugins/`
- Understand current data format and migration system
- Identify integration points with ReactPage core

## Implementation Strategy

### Phase 1: Current State Documentation
Inventory existing Slate integration to establish baseline.

### Phase 2: Slate Upgrade Analysis
Research what upgrading 40 versions of Slate would require.

### Phase 3: Tiptap Migration Analysis
Research what replacing Slate with Tiptap would require.

### Phase 4: Comparison & Recommendation
Synthesize findings into actionable recommendation.

## Task Breakdown Preview

High-level task categories (max 10 tasks per PRD constraint):

- [ ] **Task 1:** Inventory current Slate integration (sub-plugins, migrations, data format)
- [ ] **Task 2:** Analyze Slate changelog 0.78 → latest for breaking changes
- [ ] **Task 3:** Document Slate upgrade path and required migrations
- [ ] **Task 4:** Analyze Tiptap architecture and extension model
- [ ] **Task 5:** Map Slate sub-plugins to Tiptap equivalents
- [ ] **Task 6:** Evaluate content migration strategy (Slate → Tiptap)
- [ ] **Task 7:** Create comparison matrix (stability, effort, compatibility)
- [ ] **Task 8:** Write final recommendation with rationale

## Dependencies

### External Dependencies
- Slate.js GitHub releases and changelog
- Slate migration guides (if they exist)
- Tiptap documentation and extension API docs
- ProseMirror schema documentation

### Internal Dependencies
- Access to `packages/plugins/content/slate/` source code
- Understanding of ReactPage's plugin architecture
- Knowledge of how ReactPage handles data migrations

## Success Criteria (Technical)

| Criteria | Measure |
|----------|---------|
| Slate analysis complete | All breaking changes 0.78→latest documented |
| Tiptap analysis complete | All sub-plugins mapped to Tiptap equivalents |
| Comparison matrix | Side-by-side on all 5 evaluation criteria |
| Recommendation clarity | Clear "do X because Y" statement |
| Effort estimates | T-shirt sizes for both paths with breakdown |

## Estimated Effort

**Overall:** S-M (Small to Medium) - This is research, not implementation

| Task Category | Estimate |
|---------------|----------|
| Current state inventory | S |
| Slate upgrade analysis | M |
| Tiptap migration analysis | M |
| Comparison & recommendation | S |

**Critical path:** Slate changelog review (most time-consuming due to 40 versions)

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Slate changelog incomplete | Medium | Medium | Supplement with GitHub issues/discussions |
| Tiptap hidden complexity | Low | Medium | Focus on documented features only |
| Analysis paralysis | Medium | Low | Timebox each phase, bias toward decision |

## Notes

- This epic produces documentation, not code
- Deliverables will inform a future implementation epic
- Recommendation should be actionable regardless of which path is chosen

## Tasks Created

| Task | Name | Depends On | Parallel | Effort |
|------|------|------------|----------|--------|
| 001.md | Inventory current Slate integration | - | No | S (2-4h) |
| 002.md | Analyze Slate changelog for breaking changes | 001 | Yes | M (4-8h) |
| 003.md | Document Slate upgrade path | 001, 002 | Yes | S (2-4h) |
| 004.md | Analyze Tiptap architecture and extension model | 001 | Yes | M (4-6h) |
| 005.md | Map Slate sub-plugins to Tiptap equivalents | 001, 004 | Yes | M (3-5h) |
| 006.md | Evaluate content migration strategy | 001, 004 | Yes | M (3-5h) |
| 007.md | Create comparison matrix | 002-006 | No | S (2-3h) |
| 008.md | Write final recommendation | 007 | No | S (2-3h) |

**Summary:**
- Total tasks: 8
- Parallel tasks: 5 (002, 003, 004, 005, 006)
- Sequential tasks: 3 (001, 007, 008)
- Estimated total effort: 22-38 hours

**Execution flow:**
```
001 (baseline)
 │
 ├──► 002 ──► 003 ─────┐
 │                     │
 └──► 004 ──► 005 ─────┼──► 007 ──► 008
           └► 006 ─────┘
```
