import { focus, allFocusedNodeIds, singleFocusedNode } from '../focus';
import type { RootState } from '../../types/state';
import type { Focus } from '../../reducer/focus';
import type { Value } from '../../types/node';

const createState = (
  focusState: Focus,
  valueState: Value | null = null
): RootState => ({
  reactPage: {
    focus: focusState,
    hover: null,
    display: { mode: 'edit', zoom: 1 },
    settings: { lang: 'en' },
    values: {
      past: [],
      present: valueState,
      future: [],
    },
    __nodeCache: {},
  },
});

describe('Focus Selectors', () => {
  describe('focus', () => {
    it('should return the focus state', () => {
      const state = createState({ nodeIds: ['cell-1'] });
      const result = focus(state);

      expect(result).toEqual({ nodeIds: ['cell-1'] });
    });

    it('should return null when no focus', () => {
      const state = createState(null);
      const result = focus(state);

      expect(result).toBeNull();
    });

    it('should return focus with scrollToCell', () => {
      const state = createState({ nodeIds: ['cell-1'], scrollToCell: 12345 });
      const result = focus(state);

      expect(result?.scrollToCell).toBe(12345);
    });

    it('should handle undefined state', () => {
      const result = focus(undefined as unknown as RootState);

      expect(result).toBeUndefined();
    });

    it('should handle empty reactPage', () => {
      const state = { reactPage: undefined } as unknown as RootState;
      const result = focus(state);

      expect(result).toBeUndefined();
    });
  });

  describe('allFocusedNodeIds', () => {
    it('should return focused node ids that exist in state', () => {
      const value: Value = {
        id: 'editable-1',
        version: 1,
        rows: [
          {
            id: 'row-1',
            cells: [
              { id: 'cell-1', size: 6 },
              { id: 'cell-2', size: 6 },
            ],
          },
        ],
      };
      const state = createState({ nodeIds: ['cell-1', 'cell-2'] }, value);
      const result = allFocusedNodeIds(state);

      expect(result).toEqual(['cell-1', 'cell-2']);
    });

    it('should filter out node ids that do not exist in state', () => {
      const value: Value = {
        id: 'editable-1',
        version: 1,
        rows: [
          {
            id: 'row-1',
            cells: [{ id: 'cell-1', size: 12 }],
          },
        ],
      };
      const state = createState(
        { nodeIds: ['cell-1', 'cell-nonexistent'] },
        value
      );
      const result = allFocusedNodeIds(state);

      expect(result).toEqual(['cell-1']);
    });

    it('should return empty array when no focus', () => {
      const state = createState(null);
      const result = allFocusedNodeIds(state);

      expect(result).toEqual([]);
    });

    it('should return empty array when focus has no nodeIds', () => {
      const state = createState({ nodeIds: undefined as unknown as string[] });
      const result = allFocusedNodeIds(state);

      expect(result).toEqual([]);
    });

    it('should return empty array when all focused nodes are invalid', () => {
      const value: Value = {
        id: 'editable-1',
        version: 1,
        rows: [
          {
            id: 'row-1',
            cells: [{ id: 'cell-1', size: 12 }],
          },
        ],
      };
      const state = createState(
        { nodeIds: ['nonexistent-1', 'nonexistent-2'] },
        value
      );
      const result = allFocusedNodeIds(state);

      expect(result).toEqual([]);
    });

    it('should handle nested cells', () => {
      const value: Value = {
        id: 'editable-1',
        version: 1,
        rows: [
          {
            id: 'row-1',
            cells: [
              {
                id: 'cell-1',
                size: 12,
                rows: [
                  {
                    id: 'nested-row',
                    cells: [{ id: 'nested-cell', size: 12 }],
                  },
                ],
              },
            ],
          },
        ],
      };
      const state = createState({ nodeIds: ['nested-cell'] }, value);
      const result = allFocusedNodeIds(state);

      expect(result).toEqual(['nested-cell']);
    });
  });

  describe('singleFocusedNode', () => {
    it('should return the node id when exactly one node is focused', () => {
      const value: Value = {
        id: 'editable-1',
        version: 1,
        rows: [
          {
            id: 'row-1',
            cells: [{ id: 'cell-1', size: 12 }],
          },
        ],
      };
      const state = createState({ nodeIds: ['cell-1'] }, value);
      const result = singleFocusedNode(state);

      expect(result).toBe('cell-1');
    });

    it('should return null when multiple nodes are focused', () => {
      const value: Value = {
        id: 'editable-1',
        version: 1,
        rows: [
          {
            id: 'row-1',
            cells: [
              { id: 'cell-1', size: 6 },
              { id: 'cell-2', size: 6 },
            ],
          },
        ],
      };
      const state = createState({ nodeIds: ['cell-1', 'cell-2'] }, value);
      const result = singleFocusedNode(state);

      expect(result).toBeNull();
    });

    it('should return null when no nodes are focused', () => {
      const state = createState(null);
      const result = singleFocusedNode(state);

      expect(result).toBeNull();
    });

    it('should return null when focus has empty nodeIds', () => {
      const state = createState({ nodeIds: [] });
      const result = singleFocusedNode(state);

      expect(result).toBeNull();
    });

    it('should return null when single focused node does not exist', () => {
      const value: Value = {
        id: 'editable-1',
        version: 1,
        rows: [
          {
            id: 'row-1',
            cells: [{ id: 'cell-1', size: 12 }],
          },
        ],
      };
      const state = createState({ nodeIds: ['nonexistent'] }, value);
      const result = singleFocusedNode(state);

      expect(result).toBeNull();
    });

    it('should return the id when exactly one valid node is focused from multiple', () => {
      const value: Value = {
        id: 'editable-1',
        version: 1,
        rows: [
          {
            id: 'row-1',
            cells: [{ id: 'cell-1', size: 12 }],
          },
        ],
      };
      const state = createState({ nodeIds: ['nonexistent', 'cell-1'] }, value);
      const result = singleFocusedNode(state);

      // Only one valid node, so it should be returned
      expect(result).toBe('cell-1');
    });
  });
});
