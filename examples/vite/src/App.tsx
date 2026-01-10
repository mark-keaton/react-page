import { useState, useCallback } from 'react';
import type { Value } from '@react-page/editor';
import Editor from '@react-page/editor';

// Content plugins
import slate from '@react-page/plugins-slate';
import { imagePlugin, ImageUploadType } from '@react-page/plugins-image';
import video from '@react-page/plugins-video';
import html5video from '@react-page/plugins-html5-video';
import spacer from '@react-page/plugins-spacer';
import divider from '@react-page/plugins-divider';

// Layout plugins
import background, { ModeEnum } from '@react-page/plugins-background';

// localStorage key for persisting editor state
const STORAGE_KEY = 'react-page-vite-demo';

// Fake image upload service for demo purposes
const fakeImageUploadService: (defaultUrl: string) => ImageUploadType =
  (_defaultUrl) => (file, reportProgress) => {
    return new Promise((resolve) => {
      let counter = 0;
      const interval = setInterval(() => {
        counter++;
        reportProgress(counter * 10);
        if (counter > 9) {
          clearInterval(interval);
          // In a real app, you would upload to a server here
          resolve({ url: URL.createObjectURL(file) });
        }
      }, 50);
    });
  };

// Configure slate plugin with all features
const slatePlugin = slate();

// Configure image plugin with upload handler
const imagePluginWithUpload = imagePlugin({
  imageUpload: fakeImageUploadService('/placeholder.jpg'),
});

// Configure background plugin with all modes
const backgroundPlugin = background({
  imageUpload: fakeImageUploadService('/placeholder.jpg'),
  enabledModes:
    ModeEnum.COLOR_MODE_FLAG |
    ModeEnum.IMAGE_MODE_FLAG |
    ModeEnum.GRADIENT_MODE_FLAG,
});

// All available plugins
const cellPlugins = [
  slatePlugin,
  imagePluginWithUpload,
  video,
  html5video,
  spacer,
  divider,
  backgroundPlugin,
];

// Default content showcasing all plugins
const DEFAULT_CONTENT: Value = {
  id: 'demo-root',
  version: 1,
  rows: [
    {
      id: 'header-row',
      cells: [
        {
          id: 'header-cell',
          plugin: {
            id: 'ory/editor/core/content/slate',
            version: 1,
          },
          dataI18n: {
            default: {
              slate: [
                {
                  type: 'HEADINGS/HEADING-ONE',
                  children: [
                    {
                      text: 'Welcome to ReactPage',
                    },
                  ],
                },
                {
                  type: 'PARAGRAPH/PARAGRAPH',
                  children: [
                    {
                      text: 'This is a comprehensive demo showcasing all ReactPage plugins with Vite. Edit any content below, then use the Save button to persist your changes to localStorage.',
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'divider-row-1',
      cells: [
        {
          id: 'divider-cell-1',
          plugin: {
            id: 'ory/editor/core/content/divider',
            version: 1,
          },
        },
      ],
    },
    {
      id: 'features-row',
      cells: [
        {
          id: 'features-cell',
          plugin: {
            id: 'ory/editor/core/content/slate',
            version: 1,
          },
          dataI18n: {
            default: {
              slate: [
                {
                  type: 'HEADINGS/HEADING-TWO',
                  children: [
                    {
                      text: 'Rich Text Editing',
                    },
                  ],
                },
                {
                  type: 'PARAGRAPH/PARAGRAPH',
                  children: [
                    {
                      text: 'The ',
                    },
                    {
                      text: 'Slate plugin',
                      'EMPHASIZE/STRONG': true,
                    },
                    {
                      text: ' provides full rich text editing capabilities including ',
                    },
                    {
                      text: 'bold',
                      'EMPHASIZE/STRONG': true,
                    },
                    {
                      text: ', ',
                    },
                    {
                      text: 'italic',
                      'EMPHASIZE/EM': true,
                    },
                    {
                      text: ', ',
                    },
                    {
                      text: 'underline',
                      'EMPHASIZE/U': true,
                    },
                    {
                      text: ', and more.',
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'spacer-row-1',
      cells: [
        {
          id: 'spacer-cell-1',
          plugin: {
            id: 'ory/editor/core/content/spacer',
            version: 1,
          },
          dataI18n: {
            default: {
              height: 24,
            },
          },
        },
      ],
    },
    {
      id: 'video-row',
      cells: [
        {
          id: 'video-text-cell',
          size: 6,
          plugin: {
            id: 'ory/editor/core/content/slate',
            version: 1,
          },
          dataI18n: {
            default: {
              slate: [
                {
                  type: 'HEADINGS/HEADING-TWO',
                  children: [
                    {
                      text: 'Video Embedding',
                    },
                  ],
                },
                {
                  type: 'PARAGRAPH/PARAGRAPH',
                  children: [
                    {
                      text: 'Embed videos from YouTube or Vimeo using the Video plugin. Simply paste a URL and the editor handles the rest.',
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          id: 'video-embed-cell',
          size: 6,
          plugin: {
            id: 'ory/editor/core/content/video',
            version: 1,
          },
          dataI18n: {
            default: {
              src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            },
          },
        },
      ],
    },
    {
      id: 'spacer-row-2',
      cells: [
        {
          id: 'spacer-cell-2',
          plugin: {
            id: 'ory/editor/core/content/spacer',
            version: 1,
          },
          dataI18n: {
            default: {
              height: 24,
            },
          },
        },
      ],
    },
    {
      id: 'image-row',
      cells: [
        {
          id: 'image-cell',
          size: 6,
          plugin: {
            id: 'ory/editor/core/content/image',
            version: 1,
          },
          dataI18n: {
            default: {
              src: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
              alt: 'React logo on dark background',
            },
          },
        },
        {
          id: 'image-text-cell',
          size: 6,
          plugin: {
            id: 'ory/editor/core/content/slate',
            version: 1,
          },
          dataI18n: {
            default: {
              slate: [
                {
                  type: 'HEADINGS/HEADING-TWO',
                  children: [
                    {
                      text: 'Image Plugin',
                    },
                  ],
                },
                {
                  type: 'PARAGRAPH/PARAGRAPH',
                  children: [
                    {
                      text: 'Upload images or provide URLs. The image plugin supports custom upload handlers for server integration.',
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'divider-row-2',
      cells: [
        {
          id: 'divider-cell-2',
          plugin: {
            id: 'ory/editor/core/content/divider',
            version: 1,
          },
        },
      ],
    },
    {
      id: 'plugins-list-row',
      cells: [
        {
          id: 'plugins-list-cell',
          plugin: {
            id: 'ory/editor/core/content/slate',
            version: 1,
          },
          dataI18n: {
            default: {
              slate: [
                {
                  type: 'HEADINGS/HEADING-TWO',
                  children: [
                    {
                      text: 'Available Plugins',
                    },
                  ],
                },
                {
                  type: 'LISTS/UNORDERED-LIST',
                  children: [
                    {
                      type: 'LISTS/LIST-ITEM',
                      children: [
                        {
                          text: 'Slate',
                          'EMPHASIZE/STRONG': true,
                        },
                        {
                          text: ' - Rich text editing with formatting',
                        },
                      ],
                    },
                    {
                      type: 'LISTS/LIST-ITEM',
                      children: [
                        {
                          text: 'Image',
                          'EMPHASIZE/STRONG': true,
                        },
                        {
                          text: ' - Image upload and display',
                        },
                      ],
                    },
                    {
                      type: 'LISTS/LIST-ITEM',
                      children: [
                        {
                          text: 'Video',
                          'EMPHASIZE/STRONG': true,
                        },
                        {
                          text: ' - YouTube/Vimeo embedding',
                        },
                      ],
                    },
                    {
                      type: 'LISTS/LIST-ITEM',
                      children: [
                        {
                          text: 'HTML5 Video',
                          'EMPHASIZE/STRONG': true,
                        },
                        {
                          text: ' - Native video player',
                        },
                      ],
                    },
                    {
                      type: 'LISTS/LIST-ITEM',
                      children: [
                        {
                          text: 'Spacer',
                          'EMPHASIZE/STRONG': true,
                        },
                        {
                          text: ' - Adjustable vertical spacing',
                        },
                      ],
                    },
                    {
                      type: 'LISTS/LIST-ITEM',
                      children: [
                        {
                          text: 'Divider',
                          'EMPHASIZE/STRONG': true,
                        },
                        {
                          text: ' - Horizontal line separator',
                        },
                      ],
                    },
                    {
                      type: 'LISTS/LIST-ITEM',
                      children: [
                        {
                          text: 'Background',
                          'EMPHASIZE/STRONG': true,
                        },
                        {
                          text: ' - Layout container with color/image/gradient backgrounds',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'spacer-row-3',
      cells: [
        {
          id: 'spacer-cell-3',
          plugin: {
            id: 'ory/editor/core/content/spacer',
            version: 1,
          },
          dataI18n: {
            default: {
              height: 32,
            },
          },
        },
      ],
    },
    {
      id: 'footer-row',
      cells: [
        {
          id: 'footer-cell',
          plugin: {
            id: 'ory/editor/core/content/slate',
            version: 1,
          },
          dataI18n: {
            default: {
              slate: [
                {
                  type: 'PARAGRAPH/PARAGRAPH',
                  children: [
                    {
                      text: 'Try adding new blocks using the + button, drag to reorder, and use the sidebar to configure each element. Your changes will persist after clicking Save.',
                      'EMPHASIZE/EM': true,
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    },
  ],
};

function App() {
  // Load saved state from localStorage or use default
  const [value, setValue] = useState<Value>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_CONTENT;
      }
    }
    return DEFAULT_CONTENT;
  });

  const [showSaved, setShowSaved] = useState(false);

  // Save handler with visual feedback
  const handleSave = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  }, [value]);

  // Clear handler - resets to default content
  const handleClear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setValue(DEFAULT_CONTENT);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>ReactPage + Vite</h1>
        <div className="header-actions">
          <button onClick={handleSave} className="btn btn-primary">
            Save
          </button>
          <button onClick={handleClear} className="btn btn-secondary">
            Clear
          </button>
        </div>
        {showSaved && <div className="save-notification">Saved!</div>}
      </header>
      <main className="editor-container">
        <Editor cellPlugins={cellPlugins} value={value} onChange={setValue} />
      </main>
    </div>
  );
}

export default App;
