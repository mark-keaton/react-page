# ReactPage Vite Example

A comprehensive example demonstrating ReactPage with Vite, showcasing all available plugins with localStorage persistence.

## Features

- All 7 ReactPage plugins:
  - **Slate** - Rich text editing with formatting
  - **Image** - Image upload and display
  - **Video** - YouTube/Vimeo embedding
  - **HTML5 Video** - Native video player
  - **Spacer** - Adjustable vertical spacing
  - **Divider** - Horizontal line separator
  - **Background** - Layout container with color/image/gradient backgrounds
- localStorage persistence for editor state
- Save/Clear buttons with visual feedback
- Responsive design

## Getting Started

### From the monorepo root

```bash
# Install dependencies and bootstrap packages
yarn
yarn bootstrap

# Run the Vite example
yarn --cwd examples/vite dev
```

### Standalone (after packages are built)

```bash
cd examples/vite
yarn install
yarn dev
```

## Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build

## Usage

1. Open http://localhost:5173 in your browser
2. Edit content using the WYSIWYG editor
3. Add new blocks using the + button
4. Drag blocks to reorder
5. Click **Save** to persist changes to localStorage
6. Click **Clear** to reset to default content
7. Refresh the page - your saved changes will be restored

## Customization

### Adding Custom Plugins

Edit `src/App.tsx` and add your plugins to the `cellPlugins` array:

```typescript
import myCustomPlugin from './myCustomPlugin';

const cellPlugins = [
  slatePlugin,
  imagePluginWithUpload,
  // ... other plugins
  myCustomPlugin,
];
```

### Custom Image Upload

Replace the `fakeImageUploadService` with your own upload handler:

```typescript
const myImageUploadService: ImageUploadType = async (file, reportProgress) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const { url } = await response.json();
  return { url };
};
```

## Learn More

- [ReactPage Documentation](https://react-page.github.io/react-page/)
- [Vite Documentation](https://vitejs.dev/)
