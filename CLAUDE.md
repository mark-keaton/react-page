# CLAUDE.md

> Think carefully and implement the most concise solution that changes as little code as possible.

## Project Overview

ReactPage is a smart, extensible WYSIWYG editor for the web written in React. It's a monorepo using Lerna and Yarn workspaces.

## Project Structure

```
packages/
  editor/                    # Core editor package (@react-page/editor)
  plugins/
    content/                 # Content plugins (slate, image, video, etc.)
    layout/                  # Layout plugins (background)
  react-admin/              # React Admin integration
examples/                    # Next.js example application
docs/                        # Documentation (docsify)
```

## Development Commands

```bash
# Install dependencies
yarn
yarn bootstrap

# Run development server (examples at http://localhost:3000)
yarn dev

# Run tests
yarn test
yarn test:watch

# Run linting
yarn lint
yarn lint:watch

# Build all packages
yarn build

# Documentation (http://localhost:3100)
yarn docs
```

## Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Use Prettier for formatting (auto-configured)
- ESLint rules are enforced

## Commit Convention

Follow [Angular commit convention](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines):

- `feat(scope): description` - New feature (bumps minor version)
- `fix(scope): description` - Bug fix (bumps patch version)
- `BREAKING CHANGE:` in commit body - Breaking change (bumps major version)

Examples:
```
feat(ui): added button to duplicate content
fix(ie11): on ie11 an error is thrown
```

## Testing

Always run tests before committing:
```bash
yarn test
```

## Key Technologies

- React 16.14+
- Redux + Redux Thunk
- Material-UI (MUI) v5
- React DnD for drag-and-drop
- Slate.js for rich text editing
- TypeScript
- Jest for testing

## Package Publishing

All packages are published to npm with public access. Version management is handled by semantic-release.
