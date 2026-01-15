# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [6.0.0] - 2026-01-14

### Breaking Changes

- **React 18+ required**: ReactPage now requires React 18.0 or higher
- Dropped support for React 16.x and 17.x

### Changed

- Upgraded Slate.js from 0.78 to 0.123 (45 versions of improvements)
- Replaced `slate-react-presentation` with native Slate read-only mode
- Upgraded TypeScript from 4.8 to 5.x

### Improved

- Android text input handling (Slate 0.82+ improvements)
- Performance optimizations from latest Slate
- Better TypeScript types
- Improved read-only rendering using native Slate components

### Migration Guide

See [docs/migration/v5-to-v6.md](docs/migration/v5-to-v6.md) for upgrade instructions.

---

For changes prior to version 6.0.0, see the [GitHub releases](https://github.com/react-page/react-page/releases).
