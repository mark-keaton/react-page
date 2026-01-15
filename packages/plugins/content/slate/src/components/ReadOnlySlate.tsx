import React, { useMemo } from 'react';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import type { SlateProps } from '../types/component';
import { useRenderElement, useRenderLeave } from './renderHooks';

const ReadOnlySlate = (props: SlateProps) => {
  const { plugins, defaultPluginType, data } = props;

  // Create a read-only editor instance
  const editor = useMemo(() => withReact(createEditor()), []);

  const renderElement = useRenderElement(
    {
      plugins,
      defaultPluginType,
    },
    []
  );
  const renderLeaf = useRenderLeave({ plugins, readOnly: true }, []);

  // the div around is required to be consistent in styling with the default editor
  return (
    <div
      style={{
        position: 'relative',
        outline: 'none',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
      }}
    >
      <Slate editor={editor} initialValue={data.slate}>
        <Editable
          readOnly
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />
      </Slate>
    </div>
  );
};

export default React.memo(ReadOnlySlate);
