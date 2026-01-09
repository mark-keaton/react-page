import { render, act } from '@testing-library/react';
import React from 'react';

import { findNodeInState } from '../../../selector/editable';
import { getCellData } from '../../../utils/getCellData';
import type { Cell, CellPluginList } from '../../../types';
import createStore from '../../../store';
import { initialState } from '../../../reducer';
import { ReduxProvider } from '../../../reduxConnect';
import { createValue } from '../../../utils/createValue';
import { useCell, useCellData, useDebouncedCellData } from '../node';
import { updateCellData } from '../../../actions/cell';

const cellPlugins: CellPluginList = [
  {
    id: 'foo',
    version: 1,
    Renderer: () => null,
  },
];

const options = {
  cellPlugins,
  lang: 'en',
};

const theState = initialState(
  createValue(
    {
      id: 'editableId',
      rows: [
        {
          id: 'row0',
          cells: [
            {
              id: 'cell0',
              plugin: 'foo',
            },
          ],
        },
      ],
    },
    options
  ),
  options.lang
);

describe('useDebouncedCellData', () => {
  it("updates don't overwrite each other", (done) => {
    const store = createStore(theState);
    const Component: React.FC<unknown> = () => {
      const [, setData] = useDebouncedCellData('cell0');
      React.useEffect(() => {
        setData({ a: 1 }, {});
        setData({ b: 1 }, {});
      }, []);
      return <div />;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    setTimeout(() => {
      const data = getCellData(
        findNodeInState(store.getState(), 'cell0')?.node as Cell,
        options.lang
      );
      expect(data).toMatchObject({ a: 1, b: 1 });
      done();
    }, 300);
  });

  /*

  this test fails. We had to change the behaviour of useDebouncedCellData to not cancel pending updates
  the problem is that it was hard to get the timing right on normal cases (where no exteranl changes happen)
  
  it('handles outside changes correctly', (done) => {
    const store = createStore(theState);
    const Component: React.FC<unknown> = () => {
      const [, setData] = useDebouncedCellData('cell0');

      // some weird redux bug: we need to call    useCellData('cell0');
      // i have no idea why, but otherwise the component does not rerender, altough
      // useDebouncedCellData already calls    useCellData('cell0');
      // i assume its a redux bug
      const cellData = useCellData('cell0');

      React.useEffect(() => {
        setData({ a: 1 }, {});
        setData({ b: 1 }, {});
        store.dispatch(
          updateCellData('cell0')({ c: 1 }, { lang: options.lang })
        );
      }, []);
      return <div />;
    };
    act(() => {
      render(
        <ReduxProvider store={store}>
          <Component />
        </ReduxProvider>
      );
    });

    setTimeout(() => {
      const data = getCellData(
        findNodeInState(store.getState(), 'cell0')?.node as Cell,
        options.lang
      );
      expect(data).toMatchObject({ c: 1 });
      done();
    }, 300);
  });

  */
  it('callback can be used to update data successfully', (done) => {
    const store = createStore(theState);
    const Component: React.FC<unknown> = () => {
      const [, setData] = useDebouncedCellData('cell0');

      React.useEffect(() => {
        setData({ a: 1 }, {});
      }, [setData]);

      return <div />;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    setTimeout(() => {
      const data = getCellData(
        findNodeInState(store.getState(), 'cell0')?.node as Cell,
        options.lang
      );
      expect(data).toMatchObject({ a: 1 });
      done();
    }, 300);
  });

  it('returns current data from the first element of the tuple', (done) => {
    const storeWithData = createStore(
      initialState(
        createValue(
          {
            id: 'editableId',
            rows: [
              {
                id: 'row0',
                cells: [
                  {
                    id: 'cell0',
                    plugin: 'foo',
                    data: { existingField: 'existing value' },
                  },
                ],
              },
            ],
          },
          options
        ),
        options.lang
      )
    );

    let currentData: Record<string, unknown> = {};

    const Component: React.FC<unknown> = () => {
      const [data] = useDebouncedCellData('cell0');
      currentData = data;
      return <div />;
    };

    render(
      <ReduxProvider store={storeWithData}>
        <Component />
      </ReduxProvider>
    );

    setTimeout(() => {
      expect(currentData).toMatchObject({ existingField: 'existing value' });
      done();
    }, 50);
  });

  it('merges partial updates with existing data', (done) => {
    const storeWithData = createStore(
      initialState(
        createValue(
          {
            id: 'editableId',
            rows: [
              {
                id: 'row0',
                cells: [
                  {
                    id: 'cell0',
                    plugin: 'foo',
                    data: { existingField: 'keep me' },
                  },
                ],
              },
            ],
          },
          options
        ),
        options.lang
      )
    );

    const Component: React.FC<unknown> = () => {
      const [, setData] = useDebouncedCellData('cell0');
      React.useEffect(() => {
        setData({ newField: 'new value' }, {});
      }, []);
      return <div />;
    };

    render(
      <ReduxProvider store={storeWithData}>
        <Component />
      </ReduxProvider>
    );

    setTimeout(() => {
      const data = getCellData(
        findNodeInState(storeWithData.getState(), 'cell0')?.node as Cell,
        options.lang
      );
      expect(data).toMatchObject({
        existingField: 'keep me',
        newField: 'new value',
      });
      done();
    }, 300);
  });

  it('handles updates to different languages', (done) => {
    const store = createStore(theState);

    const Component: React.FC<unknown> = () => {
      const [, setData] = useDebouncedCellData('cell0');
      React.useEffect(() => {
        setData({ title: 'English' }, { lang: 'en' });
        setData({ title: 'German' }, { lang: 'de' });
      }, []);
      return <div />;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    setTimeout(() => {
      const cell = findNodeInState(store.getState(), 'cell0')?.node as Cell;
      expect(getCellData(cell, 'en')).toMatchObject({ title: 'English' });
      expect(getCellData(cell, 'de')).toMatchObject({ title: 'German' });
      done();
    }, 300);
  });

  it('returns empty object for non-existent cell', () => {
    const store = createStore(theState);
    let currentData: Record<string, unknown> | undefined;

    const Component: React.FC<unknown> = () => {
      const [data] = useDebouncedCellData('non-existent');
      currentData = data;
      return <div />;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    expect(currentData).toEqual({});
  });

  it('debounces rapid updates', (done) => {
    const store = createStore(theState);
    let updateCount = 0;
    const originalDispatch = store.dispatch;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.dispatch = ((action: any) => {
      if (
        typeof action === 'object' &&
        action !== null &&
        'type' in action &&
        action.type.includes('CELL_UPDATE')
      ) {
        updateCount++;
      }
      return originalDispatch(action);
    }) as typeof store.dispatch;

    const Component: React.FC<unknown> = () => {
      const [, setData] = useDebouncedCellData('cell0');
      React.useEffect(() => {
        // Rapid fire updates
        setData({ a: 1 }, {});
        setData({ a: 2 }, {});
        setData({ a: 3 }, {});
        setData({ a: 4 }, {});
        setData({ a: 5 }, {});
      }, []);
      return <div />;
    };

    render(
      <ReduxProvider store={store}>
        <Component />
      </ReduxProvider>
    );

    setTimeout(() => {
      // Should have debounced to a single update
      expect(updateCount).toBe(1);
      const data = getCellData(
        findNodeInState(store.getState(), 'cell0')?.node as Cell,
        options.lang
      );
      expect(data).toMatchObject({ a: 5 });
      done();
    }, 300);
  });
});
