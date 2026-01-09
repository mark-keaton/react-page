import { render } from '@testing-library/react';
import React from 'react';

import type { CellPluginList } from '../../../types';
import createStore from '../../../store';
import { initialState } from '../../../reducer';
import { ReduxProvider } from '../../../reduxConnect';
import { createValue } from '../../../utils/createValue';
import { useCell, useCellProps, useCellData, useNodeProps } from '../node';

const cellPlugins: CellPluginList = [
  {
    id: 'test-plugin',
    version: 1,
    Renderer: () => null,
  },
  {
    id: 'another-plugin',
    version: 2,
    Renderer: () => null,
  },
];

const options = {
  cellPlugins,
  lang: 'en',
};

const createTestState = (valueConfig = {}) => {
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
                data: { title: 'Hello World' },
              },
              {
                id: 'cell1',
                plugin: 'another-plugin',
                data: { content: 'Test content' },
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
                data: { title: 'Nested cell' },
                rows: [
                  {
                    id: 'nested-row',
                    cells: [
                      {
                        id: 'nested-cell',
                        plugin: 'test-plugin',
                        data: { title: 'Deeply nested' },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        ...valueConfig,
      },
      options
    ),
    options.lang
  );
};

describe('useCell', () => {
  describe('returns cell data for valid ID', () => {
    it('returns cell object for existing cell', () => {
      const store = createStore(createTestState());
      let result: ReturnType<typeof useCell> = null;

      const Component: React.FC = () => {
        result = useCell('cell0');
        return null;
      };

      render(
        <ReduxProvider store={store}>
          <Component />
        </ReduxProvider>
      );

      expect(result).not.toBeNull();
      expect(result?.id).toBe('cell0');
      expect(result?.plugin?.id).toBe('test-plugin');
    });

    it('returns cell with correct plugin information', () => {
      const store = createStore(createTestState());
      let result: ReturnType<typeof useCell> = null;

      const Component: React.FC = () => {
        result = useCell('cell1');
        return null;
      };

      render(
        <ReduxProvider store={store}>
          <Component />
        </ReduxProvider>
      );

      expect(result?.plugin?.id).toBe('another-plugin');
      expect(result?.plugin?.version).toBe(2);
    });

    it('returns cell with size property', () => {
      const store = createStore(createTestState());
      let result: ReturnType<typeof useCell> = null;

      const Component: React.FC = () => {
        result = useCell('cell1');
        return null;
      };

      render(
        <ReduxProvider store={store}>
          <Component />
        </ReduxProvider>
      );

      expect(result?.size).toBe(6);
    });
  });

  describe('returns null for invalid ID', () => {
    it('returns null for non-existent cell ID', () => {
      const store = createStore(createTestState());
      let result: ReturnType<typeof useCell> = null;

      const Component: React.FC = () => {
        result = useCell('non-existent-id');
        return null;
      };

      render(
        <ReduxProvider store={store}>
          <Component />
        </ReduxProvider>
      );

      expect(result).toBeNull();
    });

    it('returns null when trying to get a row as cell', () => {
      const store = createStore(createTestState());
      let result: ReturnType<typeof useCell> = null;

      const Component: React.FC = () => {
        result = useCell('row0');
        return null;
      };

      render(
        <ReduxProvider store={store}>
          <Component />
        </ReduxProvider>
      );

      expect(result).toBeNull();
    });
  });

  describe('handles nested cells', () => {
    it('returns nested cell data', () => {
      const store = createStore(createTestState());
      let result: ReturnType<typeof useCell> = null;

      const Component: React.FC = () => {
        result = useCell('nested-cell');
        return null;
      };

      render(
        <ReduxProvider store={store}>
          <Component />
        </ReduxProvider>
      );

      expect(result).not.toBeNull();
      expect(result?.id).toBe('nested-cell');
    });

    it('returns cell with rows property for parent cells', () => {
      const store = createStore(createTestState());
      let result: ReturnType<typeof useCell> = null;

      const Component: React.FC = () => {
        result = useCell('cell2');
        return null;
      };

      render(
        <ReduxProvider store={store}>
          <Component />
        </ReduxProvider>
      );

      expect(result?.rows).toBeDefined();
      expect(result?.rows?.length).toBe(1);
      expect(result?.rows?.[0].id).toBe('nested-row');
    });
  });
});

describe('useCellProps', () => {
  it('allows selecting specific cell properties', () => {
    const store = createStore(createTestState());
    let pluginId: string | undefined;

    const Component: React.FC = () => {
      pluginId = useCellProps('cell0', (cell) => cell?.plugin?.id);
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(pluginId).toBe('test-plugin');
  });

  it('returns null from selector when cell not found', () => {
    const store = createStore(createTestState());
    let result: string | undefined | null;

    const Component: React.FC = () => {
      result = useCellProps('invalid-id', (cell) => cell?.plugin?.id ?? null);
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(result).toBeNull();
  });

  it('can access ancestors from selector', () => {
    const store = createStore(createTestState());
    let ancestorIds: string[] = [];

    const Component: React.FC = () => {
      ancestorIds = useCellProps('nested-cell', (cell, ancestors) =>
        ancestors.map((a) => a.id)
      );
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(ancestorIds.length).toBeGreaterThan(0);
    expect(ancestorIds).toContain('nested-row');
    expect(ancestorIds).toContain('cell2');
  });
});

describe('useCellData', () => {
  it('returns cell data object', () => {
    const store = createStore(createTestState());
    let data: Record<string, unknown> = {};

    const Component: React.FC = () => {
      data = useCellData('cell0');
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(data).toMatchObject({ title: 'Hello World' });
  });

  it('returns empty object for non-existent cell', () => {
    const store = createStore(createTestState());
    let data: Record<string, unknown> = { initial: true };

    const Component: React.FC = () => {
      data = useCellData('invalid-id');
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(data).toEqual({});
  });
});

describe('useNodeProps', () => {
  it('works with both cells and rows', () => {
    const store = createStore(createTestState());
    let cellId: string | undefined;
    let rowId: string | undefined;

    const CellComponent: React.FC = () => {
      cellId = useNodeProps('cell0', (node) => node?.id);
      return null;
    };

    const RowComponent: React.FC = () => {
      rowId = useNodeProps('row0', (node) => node?.id);
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <CellComponent />
        <RowComponent />
      </ReduxProvider>
    );

    expect(cellId).toBe('cell0');
    expect(rowId).toBe('row0');
  });

  it('handles null nodeId gracefully', () => {
    const store = createStore(createTestState());
    let result: string | null = 'initial';

    const Component: React.FC = () => {
      result = useNodeProps(null, (node) => node?.id ?? null);
      return null;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(result).toBeNull();
  });
});
