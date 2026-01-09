import { useState } from 'react';
import type { Value } from '@react-page/editor';
import Editor from '@react-page/editor';
import slate from '@react-page/plugins-slate';
import image from '@react-page/plugins-image';

// Define which plugins we want to use
const cellPlugins = [slate(), image];

// Initial content for the editor
const initialValue: Value = {
  id: 'initial',
  version: 1,
  rows: [
    {
      id: 'row-1',
      cells: [
        {
          id: 'cell-1',
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
                      text: 'Welcome to ReactPage! This is a minimal Vite 5+ integration example.',
                    },
                  ],
                },
              ],
            },
          },
          rows: [],
        },
      ],
    },
  ],
};

function App() {
  const [value, setValue] = useState<Value>(initialValue);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>ReactPage + Vite 5 Example</h1>
      <p>This minimal example demonstrates ReactPage working with Vite 5+.</p>
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', minHeight: '400px' }}>
        <Editor cellPlugins={cellPlugins} value={value} onChange={setValue} />
      </div>
    </div>
  );
}

export default App;
