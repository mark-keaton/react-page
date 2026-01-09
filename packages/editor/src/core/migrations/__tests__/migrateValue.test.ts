import type { Value } from '../../types';
import { createId } from '../../utils/createId';
import { CURRENT_EDITABLE_VERSION } from '../EDITABLE_MIGRATIONS';
import { migrateValue } from '../migrate';

// Define a loose type for V0 test data that allows legacy 'content' and 'layout' properties
// in nested cells. The actual Value_v0 type has a type mismatch with nested Row definitions.
type V0TestData = {
  id: string;
  cells: Array<{
    id: string;
    content?: {
      plugin: { name: string; version: string };
      state?: Record<string, unknown>;
      stateI18n?: Record<string, Record<string, unknown>>;
    };
    layout?: {
      plugin: { name: string; version: string };
      state?: Record<string, unknown>;
      stateI18n?: Record<string, Record<string, unknown>>;
    };
    rows?: Array<{
      id: string;
      cells: Array<{
        id: string;
        content?: {
          plugin: { name: string; version: string };
          state?: Record<string, unknown>;
          stateI18n?: Record<string, Record<string, unknown>>;
        };
      }>;
    }>;
  }>;
};

jest.mock('../../utils/createId', () => {
  let index = 1;
  return {
    createId: () => 'nodeId_' + index++,
  };
});

describe('migrateValue', () => {
  it('migrates unversioned state to latest state (1)', () => {
    const oldEditable: V0TestData = {
      id: 'editableId',
      cells: [
        {
          id: 'cell1',
          rows: [
            {
              id: 'row1',
              cells: [
                {
                  id: 'cell2',
                  content: {
                    plugin: {
                      name: 'fooplugin',
                      version: '0.0.1',
                    },
                    state: {
                      fooState: 'something',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };
    const newEditable = migrateValue(oldEditable, {
      lang: 'en',
      cellPlugins: [],
    });

    const expected: Value = {
      id: 'editableId',
      version: CURRENT_EDITABLE_VERSION,
      rows: [
        {
          id: 'nodeId_1',
          cells: [
            {
              id: 'nodeId_2',
              plugin: {
                id: 'fooplugin',
                version: 0.0001,
              },
              dataI18n: {
                en: {
                  fooState: 'something',
                },
              },
            },
          ],
        },
      ],
    };

    expect(newEditable).toEqual(expected);
  });

  it('returns null for null input', () => {
    const result = migrateValue(null, {
      lang: 'en',
      cellPlugins: [],
    });

    expect(result).toBeNull();
  });

  it('migrates v0 state with layout plugin', () => {
    const oldEditable: V0TestData = {
      id: 'layout-editor',
      cells: [
        {
          id: 'layoutCell',
          layout: {
            plugin: {
              name: 'two-column-layout',
              version: '1.0.0',
            },
            state: {
              leftWidth: 6,
            },
          },
          rows: [
            {
              id: 'innerRow',
              cells: [
                {
                  id: 'innerCell',
                  content: {
                    plugin: {
                      name: 'text',
                      version: '1.0.0',
                    },
                    state: {
                      text: 'Hello',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const result = migrateValue(oldEditable, {
      lang: 'en',
      cellPlugins: [],
    });

    expect(result).not.toBeNull();
    expect(result?.id).toBe('layout-editor');
    expect(result?.version).toBe(CURRENT_EDITABLE_VERSION);
  });

  it('migrates v0 state with stateI18n', () => {
    const oldEditable: V0TestData = {
      id: 'i18n-editor',
      cells: [
        {
          id: 'cell1',
          content: {
            plugin: {
              name: 'text',
              version: '1.0.0',
            },
            stateI18n: {
              en: { text: 'English text' },
              de: { text: 'German text' },
            },
          },
        },
      ],
    };

    const result = migrateValue(oldEditable, {
      lang: 'en',
      cellPlugins: [],
    });

    expect(result).not.toBeNull();
    // The stateI18n should be converted to dataI18n
    expect(result?.rows[0].cells[0].dataI18n?.en?.text).toBe('English text');
    expect(result?.rows[0].cells[0].dataI18n?.de?.text).toBe('German text');
  });

  it('preserves id through migration', () => {
    const oldEditable: V0TestData = {
      id: 'preserve-this-id',
      cells: [],
    };

    const result = migrateValue(oldEditable, {
      lang: 'en',
      cellPlugins: [],
    });

    expect(result?.id).toBe('preserve-this-id');
  });

  it('migrates empty cells array', () => {
    const oldEditable: V0TestData = {
      id: 'empty-editor',
      cells: [],
    };

    const result = migrateValue(oldEditable, {
      lang: 'en',
      cellPlugins: [],
    });

    expect(result).not.toBeNull();
    // When migrating empty cells, a wrapper row is created
    expect(result?.rows.length).toBe(1);
    expect(result?.rows[0].cells.length).toBe(0);
  });

  it('already versioned data passes through with plugin data migration', () => {
    const versionedData: Value = {
      id: 'versioned-editor',
      version: CURRENT_EDITABLE_VERSION,
      rows: [
        {
          id: 'row1',
          cells: [
            {
              id: 'cell1',
              plugin: {
                id: 'text',
                version: 1,
              },
              dataI18n: {
                en: { content: 'Already versioned' },
              },
            },
          ],
        },
      ],
    };

    const result = migrateValue(versionedData, {
      lang: 'en',
      cellPlugins: [],
    });

    expect(result).not.toBeNull();
    expect(result?.version).toBe(CURRENT_EDITABLE_VERSION);
    expect(result?.rows[0].cells[0].dataI18n?.en?.content).toBe(
      'Already versioned'
    );
  });

  it('migrates plugin data with version mismatch', () => {
    const pluginWithMigration = {
      id: 'migratable-plugin',
      version: 2, // Current version
      Renderer: () => null,
      migrations: [
        {
          fromVersion: 1,
          toVersion: 2,
          migrate: (data: { oldField: string }) => ({
            newField: data.oldField + ' (migrated)',
          }),
        },
      ],
    };

    const data: Value = {
      id: 'plugin-migration-test',
      version: CURRENT_EDITABLE_VERSION,
      rows: [
        {
          id: 'row1',
          cells: [
            {
              id: 'cell1',
              plugin: {
                id: 'migratable-plugin',
                version: 1, // Old version
              },
              dataI18n: {
                en: { oldField: 'old data' },
              },
            },
          ],
        },
      ],
    };

    const result = migrateValue(data, {
      lang: 'en',
      cellPlugins: [pluginWithMigration],
    });

    expect(result).not.toBeNull();
    expect(result?.rows[0].cells[0].dataI18n?.en?.newField).toBe(
      'old data (migrated)'
    );
  });

  it('handles deeply nested cells', () => {
    const oldEditable: V0TestData = {
      id: 'deep-nested',
      cells: [
        {
          id: 'level1',
          rows: [
            {
              id: 'level2-row',
              cells: [
                {
                  id: 'level2',
                  content: {
                    plugin: {
                      name: 'deep-plugin',
                      version: '1.0.0',
                    },
                    state: { depth: 2 },
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const result = migrateValue(oldEditable, {
      lang: 'en',
      cellPlugins: [],
    });

    expect(result).not.toBeNull();
    expect(result?.rows.length).toBeGreaterThan(0);
    // The structure changes during migration - verify the content exists
    const findDepthInValue = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rows: any[]
    ): number | undefined => {
      for (const row of rows) {
        for (const cell of row.cells || []) {
          if (cell.dataI18n?.en?.depth) {
            return cell.dataI18n.en.depth;
          }
          if (cell.rows) {
            const found = findDepthInValue(cell.rows);
            if (found) return found;
          }
        }
      }
      return undefined;
    };
    expect(findDepthInValue(result?.rows || [])).toBe(2);
  });

  it('migrates multiple cells in a row', () => {
    const oldEditable: V0TestData = {
      id: 'multi-cell',
      cells: [
        {
          id: 'container',
          rows: [
            {
              id: 'row1',
              cells: [
                {
                  id: 'cell1',
                  content: {
                    plugin: { name: 'text', version: '1' },
                    state: { text: 'Cell 1' },
                  },
                },
                {
                  id: 'cell2',
                  content: {
                    plugin: { name: 'text', version: '1' },
                    state: { text: 'Cell 2' },
                  },
                },
                {
                  id: 'cell3',
                  content: {
                    plugin: { name: 'text', version: '1' },
                    state: { text: 'Cell 3' },
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const result = migrateValue(oldEditable, {
      lang: 'en',
      cellPlugins: [],
    });

    expect(result).not.toBeNull();
    expect(result?.rows[0].cells.length).toBe(3);
  });
});
