import { render } from '@testing-library/react';
import React from 'react';

import type { CellPluginList } from '../../../types';
import createStore from '../../../store';
import { initialState } from '../../../reducer';
import { ReduxProvider } from '../../../reduxConnect';
import { createValue } from '../../../utils/createValue';
import {
  useFocusedNodeId,
  useIsFocused,
  useIsExclusivlyFocused,
  useAllFocusedNodeIds,
} from '../focus';
import { focusCell, blurCell, blurAllCells } from '../../../actions/cell';

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
              },
              {
                id: 'cell1',
                plugin: 'test-plugin',
                data: { title: 'Second cell' },
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

describe('useFocusedNodeId', () => {
  it('returns null when no cell is focused', () => {
    const store = createStore(createTestState());
    let focusedId: string | null = 'initial';

    const Component: React.FC = () => {
      focusedId = useFocusedNodeId();
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(focusedId).toBeNull();
  });

  it('returns focused cell id when a single cell is focused', () => {
    const theState = createTestState();
    const store = createStore(theState);

    // Focus a cell
    store.dispatch(focusCell('cell0'));

    let focusedId: string | null = null;

    const Component: React.FC = () => {
      focusedId = useFocusedNodeId();
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(focusedId).toBe('cell0');
  });

  it('returns null when multiple cells are focused', () => {
    const theState = createTestState();
    const store = createStore(theState);

    // Focus multiple cells by dispatching focus with additive mode
    store.dispatch(focusCell('cell0'));
    store.dispatch(focusCell('cell1', false, 'add'));

    let focusedId: string | null = 'initial';

    const Component: React.FC = () => {
      focusedId = useFocusedNodeId();
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    // Should return null when multiple cells are focused
    expect(focusedId).toBeNull();
  });
});

describe('useIsFocused', () => {
  it('returns false when cell is not focused', () => {
    const store = createStore(createTestState());
    let isFocused = true;

    const Component: React.FC = () => {
      isFocused = useIsFocused('cell0');
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(isFocused).toBe(false);
  });

  it('returns true when cell is focused', () => {
    const theState = createTestState();
    const store = createStore(theState);

    store.dispatch(focusCell('cell0'));

    let isFocused = false;

    const Component: React.FC = () => {
      isFocused = useIsFocused('cell0');
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(isFocused).toBe(true);
  });

  it('returns false for unfocused cell when another cell is focused', () => {
    const theState = createTestState();
    const store = createStore(theState);

    store.dispatch(focusCell('cell0'));

    let isFocused = true;

    const Component: React.FC = () => {
      isFocused = useIsFocused('cell1');
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(isFocused).toBe(false);
  });

  it('returns true for cell in multi-selection', () => {
    const theState = createTestState();
    const store = createStore(theState);

    store.dispatch(focusCell('cell0'));
    store.dispatch(focusCell('cell1', false, 'add'));

    let isFocused0 = false;
    let isFocused1 = false;

    const Component: React.FC = () => {
      isFocused0 = useIsFocused('cell0');
      isFocused1 = useIsFocused('cell1');
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(isFocused0).toBe(true);
    expect(isFocused1).toBe(true);
  });
});

describe('useIsExclusivlyFocused', () => {
  it('returns false when cell is not focused', () => {
    const store = createStore(createTestState());
    let isExclusivelyFocused = true;

    const Component: React.FC = () => {
      isExclusivelyFocused = useIsExclusivlyFocused('cell0');
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(isExclusivelyFocused).toBe(false);
  });

  it('returns true when cell is the only focused cell', () => {
    const theState = createTestState();
    const store = createStore(theState);

    store.dispatch(focusCell('cell0'));

    let isExclusivelyFocused = false;

    const Component: React.FC = () => {
      isExclusivelyFocused = useIsExclusivlyFocused('cell0');
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(isExclusivelyFocused).toBe(true);
  });

  it('returns false when cell is part of multi-selection', () => {
    const theState = createTestState();
    const store = createStore(theState);

    store.dispatch(focusCell('cell0'));
    store.dispatch(focusCell('cell1', false, 'add'));

    let isExclusivelyFocused = true;

    const Component: React.FC = () => {
      isExclusivelyFocused = useIsExclusivlyFocused('cell0');
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(isExclusivelyFocused).toBe(false);
  });
});

describe('useAllFocusedNodeIds', () => {
  it('returns empty array when no cells are focused', () => {
    const store = createStore(createTestState());
    let focusedIds: string[] = ['initial'];

    const Component: React.FC = () => {
      focusedIds = useAllFocusedNodeIds();
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(focusedIds).toEqual([]);
  });

  it('returns array with single id when one cell is focused', () => {
    const theState = createTestState();
    const store = createStore(theState);

    store.dispatch(focusCell('cell0'));

    let focusedIds: string[] = [];

    const Component: React.FC = () => {
      focusedIds = useAllFocusedNodeIds();
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(focusedIds).toEqual(['cell0']);
  });

  it('returns array with multiple ids when multiple cells are focused', () => {
    const theState = createTestState();
    const store = createStore(theState);

    store.dispatch(focusCell('cell0'));
    store.dispatch(focusCell('cell1', false, 'add'));

    let focusedIds: string[] = [];

    const Component: React.FC = () => {
      focusedIds = useAllFocusedNodeIds();
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(focusedIds).toContain('cell0');
    expect(focusedIds).toContain('cell1');
    expect(focusedIds.length).toBe(2);
  });
});

describe('focus actions', () => {
  it('blurCell removes focus from a specific cell', () => {
    const theState = createTestState();
    const store = createStore(theState);

    store.dispatch(focusCell('cell0'));
    expect(store.getState().reactPage.focus?.nodeIds).toContain('cell0');

    store.dispatch(blurCell('cell0'));

    let focusedIds: string[] = ['initial'];

    const Component: React.FC = () => {
      focusedIds = useAllFocusedNodeIds();
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(focusedIds).not.toContain('cell0');
  });

  it('blurAllCells removes focus from all cells', () => {
    const theState = createTestState();
    const store = createStore(theState);

    store.dispatch(focusCell('cell0'));
    store.dispatch(focusCell('cell1', false, 'add'));

    store.dispatch(blurAllCells());

    let focusedIds: string[] = ['initial'];

    const Component: React.FC = () => {
      focusedIds = useAllFocusedNodeIds();
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(focusedIds).toEqual([]);
  });
});
