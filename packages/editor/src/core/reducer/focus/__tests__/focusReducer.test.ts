import { focus } from '../index';
import type { Focus } from '../index';
import {
  focusCell,
  blurCell,
  blurAllCells,
  removeCells,
} from '../../../actions/cell';

describe('focus reducer', () => {
  describe('CELL_FOCUS action', () => {
    it('should focus a cell with replace mode (default)', () => {
      const initialState: Focus = null;
      const action = focusCell('cell-1');
      const newState = focus(initialState, action);

      expect(newState?.nodeIds).toEqual(['cell-1']);
      expect(newState?.scrollToCell).toBeNull();
    });

    it('should replace existing focused cell', () => {
      const initialState: Focus = { nodeIds: ['cell-1'] };
      const action = focusCell('cell-2');
      const newState = focus(initialState, action);

      expect(newState?.nodeIds).toEqual(['cell-2']);
    });

    it('should add cell to focus with add mode', () => {
      const initialState: Focus = { nodeIds: ['cell-1'] };
      const action = focusCell('cell-2', false, 'add');
      const newState = focus(initialState, action);

      expect(newState?.nodeIds).toEqual(['cell-1', 'cell-2']);
    });

    it('should toggle cell focus when using add mode on already focused cell', () => {
      const initialState: Focus = { nodeIds: ['cell-1', 'cell-2'] };
      const action = focusCell('cell-1', false, 'add');
      const newState = focus(initialState, action);

      expect(newState?.nodeIds).toEqual(['cell-2']);
    });

    it('should set scrollToCell timestamp when scrollToCell is true', () => {
      const initialState: Focus = null;
      const action = focusCell('cell-1', true);
      const newState = focus(initialState, action);

      expect(newState?.nodeIds).toEqual(['cell-1']);
      expect(newState?.scrollToCell).toBeGreaterThan(0);
    });

    it('should not set scrollToCell timestamp when scrollToCell is false', () => {
      const initialState: Focus = null;
      const action = focusCell('cell-1', false);
      const newState = focus(initialState, action);

      expect(newState?.scrollToCell).toBeNull();
    });

    it('should focus first cell from null state with add mode', () => {
      const initialState: Focus = null;
      const action = focusCell('cell-1', false, 'add');
      const newState = focus(initialState, action);

      expect(newState?.nodeIds).toEqual(['cell-1']);
    });

    it('should handle empty nodeIds array', () => {
      const initialState: Focus = { nodeIds: [] };
      const action = focusCell('cell-1', false, 'add');
      const newState = focus(initialState, action);

      expect(newState?.nodeIds).toEqual(['cell-1']);
    });

    it('should return empty nodeIds when toggling only focused cell with add mode', () => {
      const initialState: Focus = { nodeIds: ['cell-1'] };
      const action = focusCell('cell-1', false, 'add');
      const newState = focus(initialState, action);

      // When the last cell is toggled off, nodeIds becomes empty
      expect(newState?.nodeIds).toEqual([]);
    });
  });

  describe('CELL_BLUR action', () => {
    it('should blur a focused cell', () => {
      const initialState: Focus = { nodeIds: ['cell-1'] };
      const action = blurCell('cell-1');
      const newState = focus(initialState, action);

      expect(newState).toBeNull();
    });

    it('should only blur the specified cell', () => {
      const initialState: Focus = { nodeIds: ['cell-1', 'cell-2'] };
      const action = blurCell('cell-1');
      const newState = focus(initialState, action);

      expect(newState?.nodeIds).toEqual(['cell-2']);
    });

    it('should not change state when blurring unfocused cell', () => {
      const initialState: Focus = { nodeIds: ['cell-1'] };
      const action = blurCell('cell-2');
      const newState = focus(initialState, action);

      expect(newState?.nodeIds).toEqual(['cell-1']);
    });

    it('should handle blur on null state', () => {
      const initialState: Focus = null;
      const action = blurCell('cell-1');
      const newState = focus(initialState, action);

      expect(newState).toBeNull();
    });

    it('should preserve other focus properties when blurring', () => {
      const initialState: Focus = {
        nodeIds: ['cell-1', 'cell-2'],
        scrollToCell: 12345,
      };
      const action = blurCell('cell-1');
      const newState = focus(initialState, action);

      expect(newState?.nodeIds).toEqual(['cell-2']);
      expect(newState?.scrollToCell).toBe(12345);
    });
  });

  describe('CELL_BLUR_ALL action', () => {
    it('should blur all cells', () => {
      const initialState: Focus = { nodeIds: ['cell-1', 'cell-2', 'cell-3'] };
      const action = blurAllCells();
      const newState = focus(initialState, action);

      expect(newState).toBeNull();
    });

    it('should handle blurring when already null', () => {
      const initialState: Focus = null;
      const action = blurAllCells();
      const newState = focus(initialState, action);

      expect(newState).toBeNull();
    });

    it('should handle blurring empty nodeIds', () => {
      const initialState: Focus = { nodeIds: [] };
      const action = blurAllCells();
      const newState = focus(initialState, action);

      expect(newState).toBeNull();
    });
  });

  describe('CELL_REMOVE action', () => {
    it('should remove focused cell when it is removed', () => {
      const initialState: Focus = { nodeIds: ['cell-1'] };
      const action = removeCells(['cell-1']);
      const newState = focus(initialState, action);

      expect(newState).toBeNull();
    });

    it('should only remove the deleted cells from focus', () => {
      const initialState: Focus = { nodeIds: ['cell-1', 'cell-2', 'cell-3'] };
      const action = removeCells(['cell-1', 'cell-3']);
      const newState = focus(initialState, action);

      expect(newState?.nodeIds).toEqual(['cell-2']);
    });

    it('should not change focus when removing unfocused cells', () => {
      const initialState: Focus = { nodeIds: ['cell-1'] };
      const action = removeCells(['cell-2']);
      const newState = focus(initialState, action);

      expect(newState?.nodeIds).toEqual(['cell-1']);
    });

    it('should handle removing cells from null focus state', () => {
      const initialState: Focus = null;
      const action = removeCells(['cell-1']);
      const newState = focus(initialState, action);

      expect(newState).toBeNull();
    });
  });

  describe('default behavior', () => {
    it('should return current state for unknown actions', () => {
      const initialState: Focus = { nodeIds: ['cell-1'] };
      const unknownAction = { type: 'UNKNOWN_ACTION', ts: new Date() };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newState = focus(initialState, unknownAction as any);

      expect(newState).toEqual(initialState);
    });

    it('should return null as default state', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION', ts: new Date() };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newState = focus(undefined, unknownAction as any);

      expect(newState).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle focus with undefined nodeIds', () => {
      const initialState: Focus = { nodeIds: undefined as unknown as string[] };
      const action = focusCell('cell-1', false, 'add');
      const newState = focus(initialState, action);

      expect(newState?.nodeIds).toEqual(['cell-1']);
    });

    it('should handle multiple sequential focus operations', () => {
      let state: Focus = null;

      state = focus(state, focusCell('cell-1'));
      expect(state?.nodeIds).toEqual(['cell-1']);

      state = focus(state, focusCell('cell-2', false, 'add'));
      expect(state?.nodeIds).toEqual(['cell-1', 'cell-2']);

      state = focus(state, blurCell('cell-1'));
      expect(state?.nodeIds).toEqual(['cell-2']);

      state = focus(state, blurAllCells());
      expect(state).toBeNull();
    });

    it('should handle duplicates in nodeIds when adding', () => {
      const initialState: Focus = { nodeIds: ['cell-1'] };
      // Adding the same cell should toggle it off, not add duplicate
      const action = focusCell('cell-1', false, 'add');
      const newState = focus(initialState, action);

      // Toggling off leaves empty nodeIds array
      expect(newState?.nodeIds).toEqual([]);
    });
  });
});
