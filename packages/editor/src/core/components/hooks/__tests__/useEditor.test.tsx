import { render, act } from '@testing-library/react';
import React from 'react';

import type { CellPluginList } from '../../../types';
import createStore from '../../../store';
import { initialState } from '../../../reducer';
import { ReduxProvider } from '../../../reduxConnect';
import { createValue } from '../../../utils/createValue';
import { findNodeInState } from '../../../selector/editable';
import { useRemoveCellById, useUpdateCellData, useFocusCellById, useBlurCell, useBlurAllCells, useResizeCellById, useSetLang } from '../nodeActions';
import { useUndo, useRedo, useCanUndo, useCanRedo } from '../actions';
import { useLang } from '../options';
import EditorStore, { EditorContext } from '../../../EditorStore';

const cellPlugins: CellPluginList = [
  {
    id: 'test-plugin',
    version: 1,
    Renderer: () => null,
  },
];

const options = {
  cellPlugins,
  lang: 'en',
};

const createTestState = () => {
  return initialState(
    createValue(
      {
        id: 'editableId',
        rows: [
          {
            id: 'row0',
            cells: [
              {
                id: 'cell0',
                plugin: 'test-plugin',
                data: { title: 'First cell' },
                size: 6,
              },
              {
                id: 'cell1',
                plugin: 'test-plugin',
                data: { title: 'Second cell' },
                size: 6,
              },
            ],
          },
          {
            id: 'row1',
            cells: [
              {
                id: 'cell2',
                plugin: 'test-plugin',
                data: { title: 'Third cell' },
              },
            ],
          },
        ],
      },
      options
    ),
    options.lang
  );
};

describe('useRemoveCellById', () => {
  it('removes a cell from the editor', () => {
    const theState = createTestState();
    const store = createStore(theState);

    // Verify cell exists before removal
    expect(findNodeInState(store.getState(), 'cell0')?.node).toBeDefined();

    const Component: React.FC = () => {
      const removeCell = useRemoveCellById();
      React.useEffect(() => {
        removeCell('cell0');
      }, [removeCell]);
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    // Cell should be removed
    expect(findNodeInState(store.getState(), 'cell0')?.node).toBeUndefined();
  });

  it('does nothing when removing non-existent cell', () => {
    const theState = createTestState();
    const store = createStore(theState);
    const initialCellCount = store.getState().reactPage.values.present?.rows.length;

    const Component: React.FC = () => {
      const removeCell = useRemoveCellById();
      React.useEffect(() => {
        removeCell('non-existent');
      }, [removeCell]);
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    // Structure should remain unchanged
    expect(store.getState().reactPage.values.present?.rows.length).toBe(initialCellCount);
  });
});

describe('useUpdateCellData', () => {
  it('updates cell data', (done) => {
    const theState = createTestState();
    const store = createStore(theState);

    const Component: React.FC = () => {
      const updateData = useUpdateCellData('cell0');
      React.useEffect(() => {
        updateData({ title: 'Updated Title', newField: 'new value' });
      }, [updateData]);
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    // Wait for update to propagate
    setTimeout(() => {
      const cell = findNodeInState(store.getState(), 'cell0')?.node;
      expect(cell).toBeDefined();
      if (cell && 'dataI18n' in cell) {
        expect(cell.dataI18n?.en?.title).toBe('Updated Title');
        expect(cell.dataI18n?.en?.newField).toBe('new value');
      }
      done();
    }, 50);
  });

  it('updates cell data with language option', (done) => {
    const theState = createTestState();
    const store = createStore(theState);

    const Component: React.FC = () => {
      const updateData = useUpdateCellData('cell0');
      React.useEffect(() => {
        updateData({ title: 'German Title' }, { lang: 'de' });
      }, [updateData]);
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    setTimeout(() => {
      const cell = findNodeInState(store.getState(), 'cell0')?.node;
      if (cell && 'dataI18n' in cell) {
        expect(cell.dataI18n?.de?.title).toBe('German Title');
        // Original English data should still exist
        expect(cell.dataI18n?.en?.title).toBe('First cell');
      }
      done();
    }, 50);
  });
});

describe('useResizeCellById', () => {
  it('resizes a cell', () => {
    const theState = createTestState();
    const store = createStore(theState);

    const Component: React.FC = () => {
      const resizeCell = useResizeCellById();
      React.useEffect(() => {
        resizeCell('cell0', 8);
      }, [resizeCell]);
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    const cell = findNodeInState(store.getState(), 'cell0')?.node;
    if (cell && 'size' in cell) {
      expect(cell.size).toBe(8);
    }
  });
});

describe('useSetLang', () => {
  it('changes the current language', () => {
    const theState = createTestState();
    const store = createStore(theState);

    expect(store.getState().reactPage.settings.lang).toBe('en');

    const Component: React.FC = () => {
      const setLang = useSetLang();
      React.useEffect(() => {
        setLang('de');
      }, [setLang]);
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(store.getState().reactPage.settings.lang).toBe('de');
  });
});

describe('useLang', () => {
  it('returns the current language', () => {
    const theState = createTestState();
    const store = createStore(theState);
    let currentLang: string | undefined;

    const Component: React.FC = () => {
      currentLang = useLang();
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(currentLang).toBe('en');
  });
});

describe('useUndo and useRedo', () => {
  it('useCanUndo returns false initially', () => {
    const theState = createTestState();
    const store = createStore(theState);
    let canUndo = true;

    const Component: React.FC = () => {
      canUndo = useCanUndo();
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(canUndo).toBe(false);
  });

  it('useCanRedo returns false initially', () => {
    const theState = createTestState();
    const store = createStore(theState);
    let canRedo = true;

    const Component: React.FC = () => {
      canRedo = useCanRedo();
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(canRedo).toBe(false);
  });

  it('useUndo returns a function', () => {
    const theState = createTestState();
    const store = createStore(theState);
    let undoFn: (() => void) | null = null;

    const Component: React.FC = () => {
      undoFn = useUndo();
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(typeof undoFn).toBe('function');
  });

  it('useRedo returns a function', () => {
    const theState = createTestState();
    const store = createStore(theState);
    let redoFn: (() => void) | null = null;

    const Component: React.FC = () => {
      redoFn = useRedo();
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(typeof redoFn).toBe('function');
  });
});

describe('useBlurCell and useBlurAllCells', () => {
  it('useBlurCell returns a function', () => {
    const theState = createTestState();
    const store = createStore(theState);
    let blurFn: ((id: string) => void) | null = null;

    const Component: React.FC = () => {
      blurFn = useBlurCell();
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(typeof blurFn).toBe('function');
  });

  it('useBlurAllCells returns a function', () => {
    const theState = createTestState();
    const store = createStore(theState);
    let blurAllFn: (() => void) | null = null;

    const Component: React.FC = () => {
      blurAllFn = useBlurAllCells();
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(typeof blurAllFn).toBe('function');
  });
});

describe('EditorStore', () => {
  it('provides getNode method', () => {
    const theState = createTestState();
    const editorStore = new EditorStore({
      initialState: theState,
    });

    const node = editorStore.getNode('cell0');
    expect(node).toBeDefined();
    expect(node?.id).toBe('cell0');
  });

  it('provides getNodeWithAncestors method', () => {
    const theState = createTestState();
    const editorStore = new EditorStore({
      initialState: theState,
    });

    const result = editorStore.getNodeWithAncestors('cell0');
    expect(result).toBeDefined();
    expect(result?.node.id).toBe('cell0');
    expect(result?.ancestors.length).toBeGreaterThan(0);
  });

  it('provides setLang method', () => {
    const theState = createTestState();
    const editorStore = new EditorStore({
      initialState: theState,
    });

    expect(editorStore.store.getState().reactPage.settings.lang).toBe('en');
    editorStore.setLang('fr');
    expect(editorStore.store.getState().reactPage.settings.lang).toBe('fr');
  });

  it('returns null for non-existent node', () => {
    const theState = createTestState();
    const editorStore = new EditorStore({
      initialState: theState,
    });

    const node = editorStore.getNode('non-existent');
    expect(node).toBeUndefined();
  });
});
