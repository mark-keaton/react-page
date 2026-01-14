import type { CellPluginList, Value } from '../../../types';
import { createValue } from '../../../utils/createValue';
import { simulateDispatch } from '../testUtils';
import { updateValue } from '../../../actions/value';
import {
  removeCells,
  resizeCell,
  updateCellData,
  updateCellIsDraft,
} from '../../../actions/cell';

const cellPlugins: CellPluginList = [
  {
    id: 'foo',
    version: 1,
    Renderer: () => null,
  },
  {
    id: 'bar',
    version: 1,
    Renderer: () => null,
  },
];

const options = {
  cellPlugins,
  lang: 'en',
};

describe('value reducer', () => {
  describe('UPDATE_VALUE action', () => {
    it('should replace the entire value', () => {
      const initialState = createValue(
        {
          id: 'editableId',
          rows: [
            {
              id: 'row0',
              cells: [
                {
                  id: 'cell1',
                  plugin: 'foo',
                },
              ],
            },
          ],
        },
        options
      );

      const newValue: Value = {
        id: 'newEditableId',
        version: 1,
        rows: [
          {
            id: 'newRow',
            cells: [
              {
                id: 'newCell',
                size: 12,
                inline: null,
                plugin: {
                  id: 'bar',
                  version: 1,
                },
                dataI18n: {
                  en: { content: 'new content' },
                },
                rows: [],
              },
            ],
          },
        ],
      };

      const actualState = simulateDispatch(initialState, updateValue(newValue));
      expect(actualState).toEqual(newValue);
    });

    it('should handle null value', () => {
      const initialState = createValue(
        {
          id: 'editableId',
          rows: [],
        },
        options
      );

      const actualState = simulateDispatch(initialState, updateValue(null));
      expect(actualState).toBeNull();
    });
  });

  describe('CELL_REMOVE action', () => {
    it('should remove a single cell by id', () => {
      const initialState = createValue(
        {
          id: 'editableId',
          rows: [
            {
              id: 'row0',
              cells: [
                {
                  id: 'cell1',
                  plugin: 'foo',
                },
              ],
            },
          ],
        },
        options
      );

      const actualState = simulateDispatch(
        initialState,
        removeCells(['cell1'])
      );
      expect(actualState.rows).toEqual([]);
    });

    it('should remove multiple cells at once', () => {
      const initialState = createValue(
        {
          id: 'editableId',
          rows: [
            {
              id: 'row0',
              cells: [
                {
                  id: 'cell1',
                  plugin: 'foo',
                  size: 4,
                },
                {
                  id: 'cell2',
                  plugin: 'foo',
                  size: 4,
                },
                {
                  id: 'cell3',
                  plugin: 'foo',
                  size: 4,
                },
              ],
            },
          ],
        },
        options
      );

      const actualState = simulateDispatch(
        initialState,
        removeCells(['cell1', 'cell2'])
      );
      expect(actualState.rows[0].cells).toHaveLength(1);
      expect(actualState.rows[0].cells[0].id).toBe('cell3');
    });

    it('should handle removing non-existent cell', () => {
      const initialState = createValue(
        {
          id: 'editableId',
          rows: [
            {
              id: 'row0',
              cells: [
                {
                  id: 'cell1',
                  plugin: 'foo',
                },
              ],
            },
          ],
        },
        options
      );

      const actualState = simulateDispatch(
        initialState,
        removeCells(['nonExistent'])
      );
      expect(actualState.rows[0].cells).toHaveLength(1);
      expect(actualState.rows[0].cells[0].id).toBe('cell1');
    });

    it('should remove empty rows after cell removal', () => {
      const initialState = createValue(
        {
          id: 'editableId',
          rows: [
            {
              id: 'row0',
              cells: [
                {
                  id: 'cell1',
                  plugin: 'foo',
                },
              ],
            },
            {
              id: 'row1',
              cells: [
                {
                  id: 'cell2',
                  plugin: 'foo',
                },
              ],
            },
          ],
        },
        options
      );

      const actualState = simulateDispatch(
        initialState,
        removeCells(['cell1'])
      );
      expect(actualState.rows).toHaveLength(1);
      expect(actualState.rows[0].id).toBe('row1');
    });
  });

  describe('CELL_RESIZE action', () => {
    it('should resize a cell and adjust siblings', () => {
      const initialState = createValue(
        {
          id: 'editableId',
          rows: [
            {
              id: 'row0',
              cells: [
                {
                  id: 'cell1',
                  plugin: 'foo',
                  size: 6,
                },
                {
                  id: 'cell2',
                  plugin: 'foo',
                  size: 6,
                },
              ],
            },
          ],
        },
        options
      );

      const actualState = simulateDispatch(
        initialState,
        resizeCell('cell1')(4)
      );
      expect(actualState.rows[0].cells[0].size).toBe(4);
      expect(actualState.rows[0].cells[1].size).toBe(8);
    });

    it('should handle minimum size constraint', () => {
      const initialState = createValue(
        {
          id: 'editableId',
          rows: [
            {
              id: 'row0',
              cells: [
                {
                  id: 'cell1',
                  plugin: 'foo',
                  size: 6,
                },
                {
                  id: 'cell2',
                  plugin: 'foo',
                  size: 6,
                },
              ],
            },
          ],
        },
        options
      );

      const actualState = simulateDispatch(
        initialState,
        resizeCell('cell1')(1)
      );
      expect(actualState.rows[0].cells[0].size).toBe(1);
      expect(actualState.rows[0].cells[1].size).toBe(11);
    });

    it('should handle maximum size constraint', () => {
      const initialState = createValue(
        {
          id: 'editableId',
          rows: [
            {
              id: 'row0',
              cells: [
                {
                  id: 'cell1',
                  plugin: 'foo',
                  size: 6,
                },
                {
                  id: 'cell2',
                  plugin: 'foo',
                  size: 6,
                },
              ],
            },
          ],
        },
        options
      );

      const actualState = simulateDispatch(
        initialState,
        resizeCell('cell1')(11)
      );
      expect(actualState.rows[0].cells[0].size).toBe(11);
      expect(actualState.rows[0].cells[1].size).toBe(1);
    });
  });

  describe('CELL_UPDATE_DATA action', () => {
    it('should update cell data for a specific language', () => {
      const initialState = createValue(
        {
          id: 'editableId',
          rows: [
            {
              id: 'row0',
              cells: [
                {
                  id: 'cell1',
                  plugin: 'foo',
                },
              ],
            },
          ],
        },
        options
      );

      const actualState = simulateDispatch(
        initialState,
        updateCellData('cell1')({ content: 'test' }, { lang: 'en' })
      );
      expect(actualState.rows[0].cells[0].dataI18n?.en).toEqual({
        content: 'test',
      });
    });

    it('should add data for a new language', () => {
      const initialState = createValue(
        {
          id: 'editableId',
          rows: [
            {
              id: 'row0',
              cells: [
                {
                  id: 'cell1',
                  plugin: 'foo',
                  dataI18n: {
                    en: { content: 'english' },
                  },
                },
              ],
            },
          ],
        },
        options
      );

      const actualState = simulateDispatch(
        initialState,
        updateCellData('cell1')({ content: 'deutsch' }, { lang: 'de' })
      );
      expect(actualState.rows[0].cells[0].dataI18n?.en).toEqual({
        content: 'english',
      });
      expect(actualState.rows[0].cells[0].dataI18n?.de).toEqual({
        content: 'deutsch',
      });
    });

    it('should remove language data when set to null', () => {
      const initialState = createValue(
        {
          id: 'editableId',
          rows: [
            {
              id: 'row0',
              cells: [
                {
                  id: 'cell1',
                  plugin: 'foo',
                  dataI18n: {
                    en: { content: 'english' },
                    de: { content: 'deutsch' },
                  },
                },
              ],
            },
          ],
        },
        options
      );

      const actualState = simulateDispatch(
        initialState,
        updateCellData('cell1')(null, { lang: 'de' })
      );
      expect(actualState.rows[0].cells[0].dataI18n?.en).toEqual({
        content: 'english',
      });
      expect(actualState.rows[0].cells[0].dataI18n?.de).toBeUndefined();
    });
  });

  describe('CELL_UPDATE_IS_DRAFT action', () => {
    it('should update isDraft flag', () => {
      const initialState = createValue(
        {
          id: 'editableId',
          rows: [
            {
              id: 'row0',
              cells: [
                {
                  id: 'cell1',
                  plugin: 'foo',
                },
              ],
            },
          ],
        },
        options
      );

      const actualState = simulateDispatch(
        initialState,
        updateCellIsDraft('cell1', true)
      );
      expect(actualState.rows[0].cells[0].isDraft).toBe(true);
    });

    it('should update isDraftI18n for specific language', () => {
      const initialState = createValue(
        {
          id: 'editableId',
          rows: [
            {
              id: 'row0',
              cells: [
                {
                  id: 'cell1',
                  plugin: 'foo',
                },
              ],
            },
          ],
        },
        options
      );

      const actualState = simulateDispatch(
        initialState,
        updateCellIsDraft('cell1', true, 'de')
      );
      expect(actualState.rows[0].cells[0].isDraftI18n?.de).toBe(true);
    });

    it('should set isDraft to false', () => {
      const initialState = createValue(
        {
          id: 'editableId',
          rows: [
            {
              id: 'row0',
              cells: [
                {
                  id: 'cell1',
                  plugin: 'foo',
                  isDraft: true,
                },
              ],
            },
          ],
        },
        options
      );

      const actualState = simulateDispatch(
        initialState,
        updateCellIsDraft('cell1', false)
      );
      expect(actualState.rows[0].cells[0].isDraft).toBe(false);
    });
  });

  describe('initial state handling', () => {
    it('should handle empty state', () => {
      const initialState = createValue(
        {
          id: 'editableId',
          rows: [],
        },
        options
      );

      const actualState = simulateDispatch(initialState);
      expect(actualState.id).toBe('editableId');
      expect(actualState.rows).toBeDefined();
    });

    it('should optimize empty nested structures', () => {
      const initialState = createValue(
        {
          id: 'editableId',
          rows: [
            {
              id: 'row0',
              cells: [
                {
                  id: 'cell1',
                  rows: [
                    {
                      id: 'nestedRow',
                      cells: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
        options
      );

      const actualState = simulateDispatch(initialState);
      // Empty nested structures should be optimized away
      expect(actualState.rows).toEqual([]);
    });
  });

  describe('nested cell operations', () => {
    it('should update data in deeply nested cells', () => {
      // Create a cell with plugin that has nested children
      const initialState = createValue(
        {
          id: 'editableId',
          rows: [
            {
              id: 'row0',
              cells: [
                {
                  id: 'cell1',
                  plugin: 'foo',
                  rows: [
                    {
                      id: 'nestedRow',
                      cells: [
                        {
                          id: 'nestedCell',
                          plugin: 'foo',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        options
      );

      const actualState = simulateDispatch(
        initialState,
        updateCellData('nestedCell')({ nested: 'data' }, { lang: 'en' })
      );
      // The parent cell has a plugin so it won't be optimized away
      const nestedCell = actualState.rows[0].cells[0].rows?.[0]?.cells?.[0];
      expect(nestedCell?.dataI18n?.en).toEqual({ nested: 'data' });
    });

    it('should remove nested cells and keep sibling', () => {
      // Create parent with plugin so it's not optimized away
      const initialState = createValue(
        {
          id: 'editableId',
          rows: [
            {
              id: 'row0',
              cells: [
                {
                  id: 'cell1',
                  plugin: 'foo',
                  rows: [
                    {
                      id: 'nestedRow',
                      cells: [
                        {
                          id: 'nestedCell1',
                          plugin: 'foo',
                          size: 6,
                        },
                        {
                          id: 'nestedCell2',
                          plugin: 'foo',
                          size: 6,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        options
      );

      const actualState = simulateDispatch(
        initialState,
        removeCells(['nestedCell1'])
      );
      const nestedCells = actualState.rows[0].cells[0].rows?.[0]?.cells;
      expect(nestedCells).toHaveLength(1);
      expect(nestedCells?.[0].id).toBe('nestedCell2');
    });
  });
});
