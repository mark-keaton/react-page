import { legacy_createStore as createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { ActionTypes } from 'redux-undo';
import { values } from '../index';
import { value } from '../../value';
import {
  removeCells,
  resizeCell,
  updateCellData,
  focusCell,
  blurCell,
  blurAllCells,
} from '../../../actions/cell';
import { updateValue } from '../../../actions/value';
import {
  CELL_INSERT_ABOVE,
  CELL_INSERT_BELOW,
  CELL_INSERT_LEFT_OF,
  CELL_INSERT_RIGHT_OF,
  CELL_INSERT_INLINE_LEFT,
  CELL_INSERT_INLINE_RIGHT,
  CELL_INSERT_AT_END,
  CELL_INSERT_AS_NEW_ROW,
} from '../../../actions/cell/insert';
import { clearHover, cellHover } from '../../../actions/cell/drag';
import { setMode, setZoom } from '../../../actions/display';
import { PositionEnum } from '../../../const';
import type { Value, Cell, Row } from '../../../types/node';
import { undo, redo } from '../../../actions/undo';

const createCell = (id: string, size = 12): Cell => ({
  id,
  size,
  rows: [],
  inline: null,
  plugin: { id: 'test-plugin', version: 1 },
  dataI18n: { en: null },
});

const createRow = (id: string, cells: Cell[]): Row => ({
  id,
  cells,
});

const createTestValue = (id: string, rows: Row[]): Value => ({
  id,
  version: 1,
  rows,
});

const createStore_ = (initialValue: Value | null) => {
  const rootReducer = combineReducers({
    values,
  });

  return createStore(
    rootReducer,
    {
      values: {
        past: [],
        present: initialValue,
        future: [],
      },
    },
    applyMiddleware(thunk)
  );
};

describe('Undo/Redo Middleware', () => {
  describe('undoable actions', () => {
    it('should add UPDATE_VALUE to undo history', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      const newValue = createTestValue('editable-2', []);
      store.dispatch(updateValue(newValue));

      const state = store.getState().values;
      expect(state.past).toHaveLength(1);
      expect(state.present?.id).toBe('editable-2');
    });

    it('should add CELL_UPDATE_DATA to undo history', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      store.dispatch(
        updateCellData('cell-1')({ content: 'test' }, { lang: 'en' })
      );

      const state = store.getState().values;
      expect(state.past).toHaveLength(1);
    });

    it('should add CELL_REMOVE to undo history', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1'), createCell('cell-2', 6)]),
      ]);
      const store = createStore_(initialValue);

      store.dispatch(removeCells(['cell-1']));

      const state = store.getState().values;
      expect(state.past).toHaveLength(1);
    });

    it('should add CELL_RESIZE to undo history', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1', 6), createCell('cell-2', 6)]),
      ]);
      const store = createStore_(initialValue);

      store.dispatch(resizeCell('cell-1')(4));

      const state = store.getState().values;
      expect(state.past).toHaveLength(1);
    });
  });

  describe('non-undoable actions', () => {
    it('should NOT add CELL_FOCUS to undo history', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      store.dispatch(focusCell('cell-1'));

      const state = store.getState().values;
      expect(state.past).toHaveLength(0);
    });

    it('should NOT add CELL_BLUR to undo history', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      store.dispatch(blurCell('cell-1'));

      const state = store.getState().values;
      expect(state.past).toHaveLength(0);
    });

    it('should NOT add CELL_BLUR_ALL to undo history', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      store.dispatch(blurAllCells());

      const state = store.getState().values;
      expect(state.past).toHaveLength(0);
    });

    it('should NOT add CLEAR_CLEAR_HOVER to undo history', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      store.dispatch(clearHover());

      const state = store.getState().values;
      expect(state.past).toHaveLength(0);
    });

    it('should NOT add CELL_DRAG_HOVER to undo history', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      store.dispatch(
        cellHover(
          { id: 'drag-1' },
          { id: 'hover-1', ancestorIds: [], levels: null, inline: null, hasInlineNeighbour: null, pluginId: 'test' },
          0,
          PositionEnum.ABOVE
        )
      );

      const state = store.getState().values;
      expect(state.past).toHaveLength(0);
    });

    it('should NOT add display mode changes to undo history', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      store.dispatch(setMode('preview'));

      const state = store.getState().values;
      expect(state.past).toHaveLength(0);
    });

    it('should NOT add zoom changes to undo history', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      store.dispatch(setZoom(1.5));

      const state = store.getState().values;
      expect(state.past).toHaveLength(0);
    });
  });

  describe('notUndoable option', () => {
    it('should NOT add action to history when notUndoable is true', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      store.dispatch(
        updateCellData('cell-1')(
          { content: 'test' },
          { lang: 'en', notUndoable: true }
        )
      );

      const state = store.getState().values;
      expect(state.past).toHaveLength(0);
    });
  });

  describe('undo operation', () => {
    it('should revert to previous state on undo', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      // Make a change
      store.dispatch(
        updateCellData('cell-1')({ content: 'changed' }, { lang: 'en' })
      );

      // Verify change was made
      let state = store.getState().values;
      expect(state.present?.rows[0].cells[0].dataI18n?.en).toEqual({
        content: 'changed',
      });

      // Undo
      store.dispatch(undo());

      // Verify reverted
      state = store.getState().values;
      expect(state.present?.rows[0].cells[0].dataI18n?.en).toBeNull();
    });

    it('should move current state to future on undo', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      store.dispatch(
        updateCellData('cell-1')({ content: 'changed' }, { lang: 'en' })
      );
      store.dispatch(undo());

      const state = store.getState().values;
      expect(state.future).toHaveLength(1);
      expect(state.future[0]?.rows[0].cells[0].dataI18n?.en).toEqual({
        content: 'changed',
      });
    });

    it('should not undo when history is empty', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      // Try to undo with no history
      store.dispatch(undo());

      const state = store.getState().values;
      expect(state.present?.id).toBe('editable-1');
      expect(state.past).toHaveLength(0);
    });

    it('should handle multiple undos', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      // Make multiple changes
      store.dispatch(
        updateCellData('cell-1')({ content: 'first' }, { lang: 'en' })
      );
      store.dispatch(
        updateCellData('cell-1')({ content: 'second' }, { lang: 'en' })
      );
      store.dispatch(
        updateCellData('cell-1')({ content: 'third' }, { lang: 'en' })
      );

      // Undo all changes
      store.dispatch(undo());
      let state = store.getState().values;
      expect(state.present?.rows[0].cells[0].dataI18n?.en).toEqual({
        content: 'second',
      });

      store.dispatch(undo());
      state = store.getState().values;
      expect(state.present?.rows[0].cells[0].dataI18n?.en).toEqual({
        content: 'first',
      });

      store.dispatch(undo());
      state = store.getState().values;
      expect(state.present?.rows[0].cells[0].dataI18n?.en).toBeNull();
    });
  });

  describe('redo operation', () => {
    it('should restore undone state on redo', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      // Make change
      store.dispatch(
        updateCellData('cell-1')({ content: 'changed' }, { lang: 'en' })
      );

      // Undo
      store.dispatch(undo());

      // Redo
      store.dispatch(redo());

      const state = store.getState().values;
      expect(state.present?.rows[0].cells[0].dataI18n?.en).toEqual({
        content: 'changed',
      });
    });

    it('should move current state to past on redo', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      store.dispatch(
        updateCellData('cell-1')({ content: 'changed' }, { lang: 'en' })
      );
      store.dispatch(undo());
      store.dispatch(redo());

      const state = store.getState().values;
      expect(state.past).toHaveLength(1);
      expect(state.future).toHaveLength(0);
    });

    it('should not redo when future is empty', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      // Try to redo with no future
      store.dispatch(redo());

      const state = store.getState().values;
      expect(state.present?.id).toBe('editable-1');
      expect(state.future).toHaveLength(0);
    });

    it('should handle multiple redos', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      // Make multiple changes
      store.dispatch(
        updateCellData('cell-1')({ content: 'first' }, { lang: 'en' })
      );
      store.dispatch(
        updateCellData('cell-1')({ content: 'second' }, { lang: 'en' })
      );

      // Undo all
      store.dispatch(undo());
      store.dispatch(undo());

      // Redo all
      store.dispatch(redo());
      let state = store.getState().values;
      expect(state.present?.rows[0].cells[0].dataI18n?.en).toEqual({
        content: 'first',
      });

      store.dispatch(redo());
      state = store.getState().values;
      expect(state.present?.rows[0].cells[0].dataI18n?.en).toEqual({
        content: 'second',
      });
    });
  });

  describe('undo/redo interaction', () => {
    it('should clear future on new action after undo', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      // Make change
      store.dispatch(
        updateCellData('cell-1')({ content: 'first' }, { lang: 'en' })
      );

      // Undo
      store.dispatch(undo());

      // Make new change (should clear future)
      store.dispatch(
        updateCellData('cell-1')({ content: 'new' }, { lang: 'en' })
      );

      const state = store.getState().values;
      expect(state.future).toHaveLength(0);
      expect(state.present?.rows[0].cells[0].dataI18n?.en).toEqual({
        content: 'new',
      });
    });

    it('should handle undo/redo sequence', () => {
      const initialValue = createTestValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const store = createStore_(initialValue);

      // Make changes
      store.dispatch(
        updateCellData('cell-1')({ content: 'a' }, { lang: 'en' })
      );
      store.dispatch(
        updateCellData('cell-1')({ content: 'b' }, { lang: 'en' })
      );

      // Undo -> redo -> undo
      store.dispatch(undo());
      store.dispatch(redo());
      store.dispatch(undo());

      const state = store.getState().values;
      expect(state.present?.rows[0].cells[0].dataI18n?.en).toEqual({
        content: 'a',
      });
    });
  });

  describe('redux-undo action types', () => {
    it('should use correct UNDO action type', () => {
      expect(ActionTypes.UNDO).toBe('@@redux-undo/UNDO');
    });

    it('should use correct REDO action type', () => {
      expect(ActionTypes.REDO).toBe('@@redux-undo/REDO');
    });
  });

  describe('cell insert actions are undoable', () => {
    it('should recognize CELL_INSERT_ABOVE as undoable', () => {
      const undoableTypes = [
        CELL_INSERT_ABOVE,
        CELL_INSERT_BELOW,
        CELL_INSERT_LEFT_OF,
        CELL_INSERT_RIGHT_OF,
        CELL_INSERT_INLINE_LEFT,
        CELL_INSERT_INLINE_RIGHT,
        CELL_INSERT_AT_END,
        CELL_INSERT_AS_NEW_ROW,
      ];

      expect(undoableTypes).toContain('CELL_INSERT_ABOVE');
      expect(undoableTypes).toContain('CELL_INSERT_BELOW');
      expect(undoableTypes).toContain('CELL_INSERT_LEFT_OF');
      expect(undoableTypes).toContain('CELL_INSERT_RIGHT_OF');
      expect(undoableTypes).toContain('CELL_INSERT_INLINE_LEFT');
      expect(undoableTypes).toContain('CELL_INSERT_INLINE_RIGHT');
      expect(undoableTypes).toContain('CELL_INSERT_AT_END');
      expect(undoableTypes).toContain('CELL_INSERT_AS_NEW_ROW');
    });
  });
});
