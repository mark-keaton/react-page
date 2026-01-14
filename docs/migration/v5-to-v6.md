# Migrating from ReactPage 5.x to 6.0

This guide covers the changes needed to upgrade your application from ReactPage 5.x to 6.0.

## Requirements

| Dependency | v5.x | v6.0 |
|------------|------|------|
| React | >= 16.14 | >= 18.0 |
| Node.js | 16+ | 20+ (recommended) |
| TypeScript | 4.x | 5.x |

## Breaking Changes

### React Version

ReactPage 6.0 requires React 18 or higher. This is necessary to support the latest Slate.js version which depends on React 18 features.

**If you're still on React 16 or 17:**

- **Option 1: Upgrade to React 18** (recommended)
  ```bash
  npm install react@18 react-dom@18
  # or
  yarn add react@18 react-dom@18
  ```

- **Option 2: Stay on ReactPage 5.x**
  If you cannot upgrade React, continue using ReactPage 5.x. Security fixes will still be provided.

### Slate.js Upgrade

Slate.js has been upgraded from 0.78 to 0.123. This brings many improvements but is handled internally by ReactPage. **No changes to your code are required.**

### Read-Only Mode

The `slate-react-presentation` package has been replaced with Slate's native read-only mode. This change is internal and **does not affect your code**. The `readOnly` prop on the Editor component works exactly as before.

## Data Format

**No changes required.** Existing content created with ReactPage 5.x works without modification. The Slate data format is unchanged between versions.

## Upgrade Steps

1. **Update your React version to 18+**
   ```bash
   npm install react@18 react-dom@18
   # or
   yarn add react@18 react-dom@18
   ```

2. **Update ReactPage packages to 6.0.0**
   ```bash
   npm install @react-page/editor@6 @react-page/plugins-slate@6
   # or
   yarn add @react-page/editor@6 @react-page/plugins-slate@6
   ```

3. **Update any other @react-page packages you use**
   ```bash
   npm install @react-page/plugins-image@6 @react-page/plugins-video@6
   # etc.
   ```

4. **Run your package manager's install**
   ```bash
   npm install
   # or
   yarn install
   ```

5. **Test your application**
   - Verify that editing works correctly
   - Verify that read-only mode displays correctly
   - Test any custom plugins you've created

## What's New in 6.0

### Improved Android Support

Slate 0.82+ includes significant improvements to Android text input handling. Users on Android devices will experience better text editing behavior.

### Performance Improvements

The latest Slate version includes many performance optimizations, especially for large documents.

### Better TypeScript Support

TypeScript has been upgraded to 5.x, providing better type inference and improved developer experience.

## Troubleshooting

### "Cannot find module 'react'" errors

Make sure all your @react-page packages are updated to version 6.x. Mixing v5 and v6 packages will cause issues.

### TypeScript errors after upgrade

If you're using TypeScript, you may need to update your `tsconfig.json` to target ES2020 or higher:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"]
  }
}
```

### Content not displaying correctly

Existing content should work without modification. If you experience issues, please [open an issue](https://github.com/react-page/react-page/issues) with details about your content structure.

## Getting Help

- [GitHub Issues](https://github.com/react-page/react-page/issues) - Report bugs or request features
- [GitHub Discussions](https://github.com/react-page/react-page/discussions) - Ask questions and share ideas
- [Documentation](https://react-page.github.io/docs) - Full documentation
