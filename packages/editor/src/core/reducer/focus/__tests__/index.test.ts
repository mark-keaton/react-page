import { combineReducers, legacy_createStore as createStore } from 'redux';
import type { Store } from 'redux';
import expect from 'unexpected';
import { blurAllCells, blurCell, focusCell } from '../../../actions/cell/index';
import type { RootState } from '../../../types/state';
import type { Focus } from '../index';
import { focus } from '../index';

interface TestState {
  reactPage: {
    focus: Focus;
    hover: unknown;
    display: { mode: string; zoom: number };
    values: { future: unknown[]; past: unknown[]; present: unknown };
    settings: { lang: string | null };
  };
}

const makeStore = (initialFocus: Focus): Store<TestState> => {
  const reducer = combineReducers({
    reactPage: combineReducers({
      focus,
      hover: (s: unknown = null) => s,
      display: (s: { mode: string; zoom: number } = { mode: 'edit', zoom: 1 }) =>
        s,
      settings: (s: { lang: string | null } = { lang: null }) => s,
      values: (
        s: { future: unknown[]; past: unknown[]; present: unknown } = {
          future: [],
          past: [],
          present: null,
        }
      ) => s,
    }),
  });

  return createStore(reducer, {
    reactPage: {
      hover: null,
      focus: initialFocus,
      display: {
        mode: 'edit',
        zoom: 1,
      },
      values: {
        future: [],
        past: [],
        present: null,
      },
      settings: {
        lang: null,
      },
    },
  }) as Store<TestState>;
};

describe('editor/reducer/focus', () => {
  it('focus a cell', () => {
    const store = makeStore({ nodeIds: undefined });
    store.dispatch(focusCell('1234'));
    const expected: Focus = {
      nodeIds: ['1234'],
      scrollToCell: null,
    };
    expect(store.getState().reactPage.focus, 'to equal', expected);
  });

  it('can set scrollToCell', () => {
    const store = makeStore({ nodeIds: undefined });
    store.dispatch(focusCell('1234', true));

    expect(store.getState().reactPage.focus.nodeIds, 'to equal', ['1234']);
    expect(
      store.getState().reactPage.focus.scrollToCell,
      'to be greater than',
      0
    );
  });

  it('can replace the selected cell', () => {
    const store = makeStore({ nodeIds: ['3432'] });
    store.dispatch(focusCell('4444'));
    const expected: Focus = {
      nodeIds: ['4444'],
      scrollToCell: null,
    };
    expect(store.getState().reactPage.focus, 'to equal', expected);
  });

  it('can focus / select multiple cells', () => {
    const store = makeStore({ nodeIds: ['3432'] });
    store.dispatch(focusCell('4444', false, 'add'));
    const expected: Focus = {
      nodeIds: ['3432', '4444'],
      scrollToCell: null,
    };
    expect(store.getState().reactPage.focus, 'to equal', expected);
  });

  it('can blur a cell', () => {
    const store = makeStore({ nodeIds: ['4444'] });
    store.dispatch(blurCell('4444'));
    const expected: Focus = null;
    expect(store.getState().reactPage.focus, 'to equal', expected);
  });

  it('does not blur a cell when its not targeted', () => {
    const store = makeStore({ nodeIds: ['3333'] });
    store.dispatch(blurCell('4444'));
    const expected: Focus = {
      nodeIds: ['3333'],
    };
    expect(store.getState().reactPage.focus, 'to equal', expected);
  });

  it('can blur all cells', () => {
    const store = makeStore({ nodeIds: ['3333'] });
    store.dispatch(blurAllCells());
    const expected: Focus = null;
    expect(store.getState().reactPage.focus, 'to equal', expected);
  });
});
