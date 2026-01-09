import { findNodeInState, currentValue, selectNode } from '../editable';
import type { RootState } from '../../types/state';
import type { Value, Cell, Row } from '../../types/node';

const createCell = (
  id: string,
  size = 12,
  rows: Row[] = []
): Cell => ({
  id,
  size,
  rows,
  inline: null,
  plugin: { id: 'test-plugin', version: 1 },
  dataI18n: { en: null },
});

const createRow = (id: string, cells: Cell[]): Row => ({
  id,
  cells,
});

const createValue = (id: string, rows: Row[]): Value => ({
  id,
  version: 1,
  rows,
});

const createState = (value: Value | null): RootState => ({
  reactPage: {
    focus: null,
    hover: null,
    display: { mode: 'edit', zoom: 1 },
    settings: { lang: 'en' },
    values: {
      past: [],
      present: value,
      future: [],
    },
    __nodeCache: {},
  },
});

describe('Editable Selectors', () => {
  describe('currentValue', () => {
    it('should return the current value', () => {
      const value = createValue('editable-1', []);
      const state = createState(value);
      const result = currentValue(state);

      expect(result).toEqual(value);
    });

    it('should return null when no value present', () => {
      const state = createState(null);
      const result = currentValue(state);

      expect(result).toBeNull();
    });

    it('should return value with rows and cells', () => {
      const value = createValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const state = createState(value);
      const result = currentValue(state);

      expect(result?.rows).toHaveLength(1);
      expect(result?.rows[0].cells).toHaveLength(1);
    });

    it('should handle undefined state', () => {
      const result = currentValue(undefined as unknown as RootState);

      expect(result).toBeUndefined();
    });
  });

  describe('findNodeInState', () => {
    it('should find a cell by id', () => {
      const value = createValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const state = createState(value);
      const result = findNodeInState(state, 'cell-1');

      expect(result?.node.id).toBe('cell-1');
    });

    it('should find a row by id', () => {
      const value = createValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const state = createState(value);
      const result = findNodeInState(state, 'row-1');

      expect(result?.node.id).toBe('row-1');
    });

    it('should return null for non-existent node', () => {
      const value = createValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const state = createState(value);
      const result = findNodeInState(state, 'nonexistent');

      expect(result).toBeNull();
    });

    it('should return null when no value present', () => {
      const state = createState(null);
      const result = findNodeInState(state, 'cell-1');

      expect(result).toBeNull();
    });

    it('should find nested cells', () => {
      const nestedCell = createCell('nested-cell');
      const parentCell = createCell('parent-cell', 12, [
        createRow('nested-row', [nestedCell]),
      ]);
      const value = createValue('editable-1', [
        createRow('row-1', [parentCell]),
      ]);
      const state = createState(value);
      const result = findNodeInState(state, 'nested-cell');

      expect(result?.node.id).toBe('nested-cell');
    });

    it('should include ancestors for found node', () => {
      const nestedCell = createCell('nested-cell');
      const parentCell = createCell('parent-cell', 12, [
        createRow('nested-row', [nestedCell]),
      ]);
      const value = createValue('editable-1', [
        createRow('row-1', [parentCell]),
      ]);
      const state = createState(value);
      const result = findNodeInState(state, 'nested-cell');

      expect(result?.ancestors).toBeDefined();
      expect(result?.ancestors.length).toBeGreaterThan(0);
    });

    it('should cache found nodes', () => {
      const value = createValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const state = createState(value);

      // First call
      const result1 = findNodeInState(state, 'cell-1');
      // Second call should use cache
      const result2 = findNodeInState(state, 'cell-1');

      expect(result1).toBe(result2);
    });

    it('should find deeply nested cells', () => {
      const deepCell = createCell('deep-cell');
      const level3Cell = createCell('level3-cell', 12, [
        createRow('level3-row', [deepCell]),
      ]);
      const level2Cell = createCell('level2-cell', 12, [
        createRow('level2-row', [level3Cell]),
      ]);
      const level1Cell = createCell('level1-cell', 12, [
        createRow('level1-row', [level2Cell]),
      ]);
      const value = createValue('editable-1', [
        createRow('row-1', [level1Cell]),
      ]);
      const state = createState(value);
      const result = findNodeInState(state, 'deep-cell');

      expect(result?.node.id).toBe('deep-cell');
    });

    it('should find cells in multiple rows', () => {
      const value = createValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
        createRow('row-2', [createCell('cell-2')]),
        createRow('row-3', [createCell('cell-3')]),
      ]);
      const state = createState(value);

      expect(findNodeInState(state, 'cell-1')?.node.id).toBe('cell-1');
      expect(findNodeInState(state, 'cell-2')?.node.id).toBe('cell-2');
      expect(findNodeInState(state, 'cell-3')?.node.id).toBe('cell-3');
    });

    it('should find cells among siblings', () => {
      const value = createValue('editable-1', [
        createRow('row-1', [
          createCell('cell-1', 4),
          createCell('cell-2', 4),
          createCell('cell-3', 4),
        ]),
      ]);
      const state = createState(value);

      expect(findNodeInState(state, 'cell-1')?.node.id).toBe('cell-1');
      expect(findNodeInState(state, 'cell-2')?.node.id).toBe('cell-2');
      expect(findNodeInState(state, 'cell-3')?.node.id).toBe('cell-3');
    });
  });

  describe('selectNode', () => {
    it('should select a node by id', () => {
      const value = createValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const state = createState(value);
      const result = selectNode(state, 'cell-1');

      expect(result?.node.id).toBe('cell-1');
    });

    it('should return null for non-existent node', () => {
      const value = createValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const state = createState(value);
      const result = selectNode(state, 'nonexistent');

      expect(result).toBeNull();
    });

    it('should include node with ancestors', () => {
      const nestedCell = createCell('nested-cell');
      const parentCell = createCell('parent-cell', 12, [
        createRow('nested-row', [nestedCell]),
      ]);
      const value = createValue('editable-1', [
        createRow('row-1', [parentCell]),
      ]);
      const state = createState(value);
      const result = selectNode(state, 'nested-cell');

      expect(result?.node).toBeDefined();
      expect(result?.ancestors).toBeDefined();
    });
  });

  describe('node cache behavior', () => {
    it('should initialize __nodeCache if not present', () => {
      const value = createValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const state: RootState = {
        reactPage: {
          focus: null,
          hover: null,
          display: { mode: 'edit', zoom: 1 },
          settings: { lang: 'en' },
          values: {
            past: [],
            present: value,
            future: [],
          },
          // No __nodeCache property
        },
      };

      findNodeInState(state, 'cell-1');

      expect(state.reactPage.__nodeCache).toBeDefined();
    });

    it('should use cached value on subsequent calls', () => {
      const value = createValue('editable-1', [
        createRow('row-1', [createCell('cell-1')]),
      ]);
      const state = createState(value);

      const result1 = findNodeInState(state, 'cell-1');
      const result2 = findNodeInState(state, 'cell-1');

      // Should be the exact same object from cache
      expect(result1).toBe(result2);
    });
  });
});
