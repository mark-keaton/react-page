import { serialzeValue } from '../../migrations/serialzeValue';
import { migrateValue } from '../../migrations/migrate';
import type { Value, Cell, Row, CellPluginList } from '../../types';
import { CURRENT_EDITABLE_VERSION } from '../../migrations/EDITABLE_MIGRATIONS';

describe('JSON Serialization', () => {
  const cellPlugins: CellPluginList = [
    {
      id: 'text-plugin',
      version: 1,
      Renderer: () => null,
    },
    {
      id: 'image-plugin',
      version: 1,
      Renderer: () => null,
    },
  ];

  const context = {
    cellPlugins,
    lang: 'en',
  };

  describe('serialzeValue', () => {
    it('serializes empty editor', () => {
      const emptyValue: Value = {
        id: 'empty-editor',
        version: CURRENT_EDITABLE_VERSION,
        rows: [],
      };

      const result = serialzeValue(emptyValue, cellPlugins);

      expect(result).toEqual({
        id: 'empty-editor',
        version: CURRENT_EDITABLE_VERSION,
        rows: [],
      });
    });

    it('serializes editor with single cell', () => {
      const singleCellValue: Value = {
        id: 'single-cell-editor',
        version: CURRENT_EDITABLE_VERSION,
        rows: [
          {
            id: 'row1',
            cells: [
              {
                id: 'cell1',
                plugin: { id: 'text-plugin', version: 1 },
                dataI18n: {
                  en: { text: 'Hello World' },
                },
              },
            ],
          },
        ],
      };

      const result = serialzeValue(singleCellValue, cellPlugins);

      expect(result.id).toBe('single-cell-editor');
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].cells.length).toBe(1);
      expect(result.rows[0].cells[0].dataI18n).toEqual({
        en: { text: 'Hello World' },
      });
    });

    it('serializes editor with multiple rows', () => {
      const multiRowValue: Value = {
        id: 'multi-row-editor',
        version: CURRENT_EDITABLE_VERSION,
        rows: [
          {
            id: 'row1',
            cells: [
              {
                id: 'cell1',
                plugin: { id: 'text-plugin', version: 1 },
                dataI18n: { en: { text: 'Row 1' } },
              },
            ],
          },
          {
            id: 'row2',
            cells: [
              {
                id: 'cell2',
                plugin: { id: 'image-plugin', version: 1 },
                dataI18n: { en: { src: 'image.png' } },
              },
            ],
          },
          {
            id: 'row3',
            cells: [
              {
                id: 'cell3',
                plugin: { id: 'text-plugin', version: 1 },
                dataI18n: { en: { text: 'Row 3' } },
              },
            ],
          },
        ],
      };

      const result = serialzeValue(multiRowValue, cellPlugins);

      expect(result.rows.length).toBe(3);
      expect(result.rows[0].cells[0].dataI18n?.en?.text).toBe('Row 1');
      expect(result.rows[1].cells[0].dataI18n?.en?.src).toBe('image.png');
      expect(result.rows[2].cells[0].dataI18n?.en?.text).toBe('Row 3');
    });

    it('serializes editor with nested cells', () => {
      const nestedValue: Value = {
        id: 'nested-editor',
        version: CURRENT_EDITABLE_VERSION,
        rows: [
          {
            id: 'row1',
            cells: [
              {
                id: 'parent-cell',
                plugin: { id: 'text-plugin', version: 1 },
                dataI18n: { en: { text: 'Parent' } },
                rows: [
                  {
                    id: 'nested-row',
                    cells: [
                      {
                        id: 'nested-cell',
                        plugin: { id: 'text-plugin', version: 1 },
                        dataI18n: { en: { text: 'Nested' } },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = serialzeValue(nestedValue, cellPlugins);

      expect(result.rows[0].cells[0].id).toBe('parent-cell');
      expect(result.rows[0].cells[0].rows?.[0].cells[0].dataI18n?.en?.text).toBe(
        'Nested'
      );
    });

    it('serializes cells with multiple languages', () => {
      const multiLangValue: Value = {
        id: 'multi-lang-editor',
        version: CURRENT_EDITABLE_VERSION,
        rows: [
          {
            id: 'row1',
            cells: [
              {
                id: 'cell1',
                plugin: { id: 'text-plugin', version: 1 },
                dataI18n: {
                  en: { text: 'Hello' },
                  de: { text: 'Hallo' },
                  fr: { text: 'Bonjour' },
                },
              },
            ],
          },
        ],
      };

      const result = serialzeValue(multiLangValue, cellPlugins);

      expect(result.rows[0].cells[0].dataI18n?.en?.text).toBe('Hello');
      expect(result.rows[0].cells[0].dataI18n?.de?.text).toBe('Hallo');
      expect(result.rows[0].cells[0].dataI18n?.fr?.text).toBe('Bonjour');
    });

    it('preserves cell size during serialization', () => {
      const valuWithSizes: Value = {
        id: 'sized-editor',
        version: CURRENT_EDITABLE_VERSION,
        rows: [
          {
            id: 'row1',
            cells: [
              {
                id: 'cell1',
                plugin: { id: 'text-plugin', version: 1 },
                size: 6,
                dataI18n: { en: { text: 'Half width' } },
              },
              {
                id: 'cell2',
                plugin: { id: 'text-plugin', version: 1 },
                size: 6,
                dataI18n: { en: { text: 'Other half' } },
              },
            ],
          },
        ],
      };

      const result = serialzeValue(valuWithSizes, cellPlugins);

      expect(result.rows[0].cells[0].size).toBe(6);
      expect(result.rows[0].cells[1].size).toBe(6);
    });

    it('handles cells without plugin (layout cells)', () => {
      const layoutValue: Value = {
        id: 'layout-editor',
        version: CURRENT_EDITABLE_VERSION,
        rows: [
          {
            id: 'row1',
            cells: [
              {
                id: 'layout-cell',
                rows: [
                  {
                    id: 'inner-row',
                    cells: [
                      {
                        id: 'content-cell',
                        plugin: { id: 'text-plugin', version: 1 },
                        dataI18n: { en: { text: 'Content' } },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = serialzeValue(layoutValue, cellPlugins);

      expect(result.rows[0].cells[0].plugin).toBeUndefined();
      expect(result.rows[0].cells[0].rows?.[0].cells[0].plugin?.id).toBe(
        'text-plugin'
      );
    });

    it('uses plugin serialize function when available', () => {
      const serializePlugin = {
        id: 'serialize-plugin',
        version: 1,
        Renderer: () => null,
        serialize: (data: unknown) => ({
          ...(data as Record<string, unknown>),
          serialized: true,
        }),
      };

      const pluginsWithSerialize: CellPluginList = [serializePlugin];

      const value: Value = {
        id: 'serialize-test',
        version: CURRENT_EDITABLE_VERSION,
        rows: [
          {
            id: 'row1',
            cells: [
              {
                id: 'cell1',
                plugin: { id: 'serialize-plugin', version: 1 },
                dataI18n: { en: { original: 'data' } },
              },
            ],
          },
        ],
      };

      const result = serialzeValue(value, pluginsWithSerialize);

      expect(result.rows[0].cells[0].dataI18n?.en?.serialized).toBe(true);
      expect(result.rows[0].cells[0].dataI18n?.en?.original).toBe('data');
    });
  });

  describe('JSON Deserialization (migrateValue)', () => {
    it('loads valid JSON', () => {
      const validJson = {
        id: 'test-editor',
        version: CURRENT_EDITABLE_VERSION,
        rows: [
          {
            id: 'row1',
            cells: [
              {
                id: 'cell1',
                plugin: { id: 'text-plugin', version: 1 },
                dataI18n: { en: { text: 'Test' } },
              },
            ],
          },
        ],
      };

      const result = migrateValue(validJson, context);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('test-editor');
      expect(result?.rows[0].cells[0].dataI18n?.en?.text).toBe('Test');
    });

    it('handles null input', () => {
      const result = migrateValue(null, context);
      expect(result).toBeNull();
    });

    it('handles missing fields with defaults', () => {
      const minimalJson = {
        id: 'minimal-editor',
        version: CURRENT_EDITABLE_VERSION,
        rows: [
          {
            id: 'row1',
            cells: [
              {
                id: 'cell1',
              },
            ],
          },
        ],
      };

      const result = migrateValue(minimalJson, context);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('minimal-editor');
      expect(result?.rows.length).toBe(1);
    });

    it('handles unknown plugin types gracefully', () => {
      const unknownPluginJson = {
        id: 'unknown-plugin-editor',
        version: CURRENT_EDITABLE_VERSION,
        rows: [
          {
            id: 'row1',
            cells: [
              {
                id: 'cell1',
                plugin: { id: 'unknown-plugin', version: 1 },
                dataI18n: { en: { data: 'test' } },
              },
            ],
          },
        ],
      };

      const result = migrateValue(unknownPluginJson, context);

      expect(result).not.toBeNull();
      // Plugin info should be preserved even if plugin is unknown
      expect(result?.rows[0].cells[0].plugin?.id).toBe('unknown-plugin');
    });

    it('uses plugin unserialize function when available', () => {
      const unserializePlugin = {
        id: 'unserialize-plugin',
        version: 1,
        Renderer: () => null,
        unserialize: (data: unknown) => ({
          ...(data as Record<string, unknown>),
          unserialized: true,
        }),
      };

      const pluginsWithUnserialize: CellPluginList = [unserializePlugin];

      const value = {
        id: 'unserialize-test',
        version: CURRENT_EDITABLE_VERSION,
        rows: [
          {
            id: 'row1',
            cells: [
              {
                id: 'cell1',
                plugin: { id: 'unserialize-plugin', version: 1 },
                dataI18n: { en: { original: 'data' } },
              },
            ],
          },
        ],
      };

      const result = migrateValue(value, {
        cellPlugins: pluginsWithUnserialize,
        lang: 'en',
      });

      expect(result?.rows[0].cells[0].dataI18n?.en?.unserialized).toBe(true);
    });
  });

  describe('Round-trip serialization', () => {
    it('preserves data through serialize/deserialize cycle', () => {
      const originalValue: Value = {
        id: 'roundtrip-editor',
        version: CURRENT_EDITABLE_VERSION,
        rows: [
          {
            id: 'row1',
            cells: [
              {
                id: 'cell1',
                plugin: { id: 'text-plugin', version: 1 },
                dataI18n: {
                  en: { text: 'Hello World', bold: true },
                  de: { text: 'Hallo Welt', bold: false },
                },
                size: 8,
              },
              {
                id: 'cell2',
                plugin: { id: 'image-plugin', version: 1 },
                dataI18n: {
                  en: { src: 'image.png', alt: 'An image' },
                },
                size: 4,
              },
            ],
          },
        ],
      };

      // Serialize
      const serialized = serialzeValue(originalValue, cellPlugins);

      // Deserialize
      const deserialized = migrateValue(serialized, context);

      // Verify structure is preserved
      expect(deserialized?.id).toBe(originalValue.id);
      expect(deserialized?.rows.length).toBe(originalValue.rows.length);
      expect(deserialized?.rows[0].cells.length).toBe(
        originalValue.rows[0].cells.length
      );

      // Verify data is preserved
      expect(deserialized?.rows[0].cells[0].dataI18n?.en?.text).toBe(
        'Hello World'
      );
      expect(deserialized?.rows[0].cells[0].dataI18n?.de?.text).toBe(
        'Hallo Welt'
      );
      expect(deserialized?.rows[0].cells[1].dataI18n?.en?.src).toBe('image.png');

      // Verify sizes are preserved
      expect(deserialized?.rows[0].cells[0].size).toBe(8);
      expect(deserialized?.rows[0].cells[1].size).toBe(4);
    });

    it('preserves nested structure through round-trip', () => {
      const nestedValue: Value = {
        id: 'nested-roundtrip',
        version: CURRENT_EDITABLE_VERSION,
        rows: [
          {
            id: 'row1',
            cells: [
              {
                id: 'parent',
                plugin: { id: 'text-plugin', version: 1 },
                dataI18n: { en: { level: 1 } },
                rows: [
                  {
                    id: 'nested-row',
                    cells: [
                      {
                        id: 'child',
                        plugin: { id: 'text-plugin', version: 1 },
                        dataI18n: { en: { level: 2 } },
                        rows: [
                          {
                            id: 'deep-row',
                            cells: [
                              {
                                id: 'grandchild',
                                plugin: { id: 'text-plugin', version: 1 },
                                dataI18n: { en: { level: 3 } },
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const serialized = serialzeValue(nestedValue, cellPlugins);
      const deserialized = migrateValue(serialized, context);

      expect(deserialized?.rows[0].cells[0].dataI18n?.en?.level).toBe(1);
      expect(
        deserialized?.rows[0].cells[0].rows?.[0].cells[0].dataI18n?.en?.level
      ).toBe(2);
      expect(
        deserialized?.rows[0].cells[0].rows?.[0].cells[0].rows?.[0].cells[0]
          .dataI18n?.en?.level
      ).toBe(3);
    });
  });
});
