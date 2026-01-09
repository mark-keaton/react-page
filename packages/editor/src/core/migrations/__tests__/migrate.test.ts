import { migrate } from '../migrate';
import { Migration } from '../Migration';
describe('migrate', () => {
  describe('cases with 1 migration', () => {
    const dataIn = {
      foo: 123,
      bar: ['a', 'b', 'c'],
    };
    const expectedOut = {
      foonew: 123,
      barNew: ['123a', '123b', '123c'],
    };
    type DataIn = typeof dataIn;
    type DataOut = typeof expectedOut;
    const migrations = [
      new Migration<DataIn, DataOut>({
        fromVersion: 0,
        toVersion: 1,
        migrate: (d) => {
          return {
            foonew: d.foo,
            barNew: d.bar.map((s) => d.foo + '' + s),
          };
        },
      }),
    ];
    it('updates dataIn with one migration that specifies higher version', () => {
      const result = migrate(dataIn, migrations, 0, {
        lang: 'en',
        cellPlugins: [],
      });
      expect(result).toEqual(expectedOut);
    });

    it('does nothing if already up to date', () => {
      const result = migrate(
        {
          foonew: 432,
          barNew: ['432a', '432b', '432c'],
        },
        migrations,
        1,
        {
          lang: 'en',
          cellPlugins: [],
        }
      );
      expect(result).toEqual({
        foonew: 432,
        barNew: ['432a', '432b', '432c'],
      });
    });
  });

  describe('cases with 2migration', () => {
    const dataIn = {
      foo: 123,
      bar: ['a', 'b', 'c'],
    };
    const expectedOut = {
      wrapped: {
        foonew: 123,
        barNew: ['123a', '123b', '123c'],
      },
    };
    type DataIn = typeof dataIn;
    type DataOut = typeof expectedOut;
    const migrations = [
      new Migration<
        DataIn,
        {
          foonew: number;
          barNew: string[];
        }
      >({
        fromVersion: 0,
        toVersion: 1,
        migrate: (d) => {
          return {
            foonew: d.foo,
            barNew: d.bar.map((s) => d.foo + '' + s),
          };
        },
      }),
      new Migration<
        {
          foonew: number;
          barNew: string[];
        },
        DataOut
      >({
        fromVersion: 1,
        toVersion: 2,
        migrate: (d) => {
          return {
            wrapped: d,
          };
        },
      }),
    ];
    it('updates dataIn with multiple migrations that specifies higher version', () => {
      const result = migrate(dataIn, migrations, 0, {
        lang: 'en',
        cellPlugins: [],
      });
      expect(result).toEqual(expectedOut);
    });

    it('only applies migrations required', () => {
      const result = migrate(
        {
          foonew: 123,
          barNew: ['123a', '123b', '123c'],
        },
        migrations,
        1,
        {
          lang: 'en',
          cellPlugins: [],
        }
      );
      expect(result).toEqual(expectedOut);
    });
  });

  describe('legacy support for string numbers', () => {
    const dataIn = {
      foo: 123,
      bar: ['a', 'b', 'c'],
    };
    const expectedOut = {
      wrapped: {
        foonew: 123,
        barNew: ['123a', '123b', '123c'],
      },
    };
    type DataIn = typeof dataIn;
    type DataOut = typeof expectedOut;
    const migrations = [
      new Migration<
        DataIn,
        {
          foonew: number;
          barNew: string[];
        }
      >({
        fromVersionRange: '^0.3.0',
        toVersion: '0.4.0',
        migrate: (d) => {
          return {
            foonew: d.foo,
            barNew: d.bar?.map((s) => d.foo + '' + s),
          };
        },
      }),
      new Migration<
        {
          foonew: number;
          barNew: string[];
        },
        DataOut
      >({
        fromVersion: '0.4.0',
        toVersion: '1.0.0',
        migrate: (d) => {
          return {
            wrapped: d,
          };
        },
      }),
    ];

    it('supports legacy string numbers', () => {
      const result = migrate(dataIn, migrations, '0.3.0', {
        lang: 'en',
        cellPlugins: [],
      });

      expect(result).toEqual(expectedOut);
    });
  });

  describe('edge cases', () => {
    it('handles missing version field (defaults to 0)', () => {
      const dataIn = { value: 'test' };
      const migrations = [
        new Migration<{ value: string }, { data: string }>({
          fromVersion: 0,
          toVersion: 1,
          migrate: (d) => ({ data: d.value }),
        }),
      ];

      const result = migrate(dataIn, migrations, undefined, {
        lang: 'en',
        cellPlugins: [],
      });

      expect(result).toEqual({ data: 'test' });
    });

    it('handles empty migrations array', () => {
      const dataIn = { unchanged: true };

      const result = migrate(dataIn, [], 0, {
        lang: 'en',
        cellPlugins: [],
      });

      expect(result).toEqual({ unchanged: true });
    });

    it('handles undefined migrations', () => {
      const dataIn = { unchanged: true };

      const result = migrate(dataIn, undefined, 0, {
        lang: 'en',
        cellPlugins: [],
      });

      expect(result).toEqual({ unchanged: true });
    });

    it('preserves custom data through migration', () => {
      const dataIn = {
        customField: 'preserve me',
        toMigrate: 'old value',
      };
      const migrations = [
        new Migration<
          { customField: string; toMigrate: string },
          { customField: string; migrated: string }
        >({
          fromVersion: 0,
          toVersion: 1,
          migrate: (d) => ({
            customField: d.customField,
            migrated: d.toMigrate + ' (migrated)',
          }),
        }),
      ];

      const result = migrate<{ customField: string; migrated: string }>(
        dataIn,
        migrations,
        0,
        {
          lang: 'en',
          cellPlugins: [],
        }
      );

      expect(result.customField).toBe('preserve me');
      expect(result.migrated).toBe('old value (migrated)');
    });

    it('migration is idempotent when version matches', () => {
      const dataIn = { value: 'unchanged' };
      const migrations = [
        new Migration<{ value: string }, { newValue: string }>({
          fromVersion: 0,
          toVersion: 1,
          migrate: () => ({ newValue: 'changed' }),
        }),
      ];

      // First migration
      const result1 = migrate(dataIn, migrations, 0, {
        lang: 'en',
        cellPlugins: [],
      });
      expect(result1).toEqual({ newValue: 'changed' });

      // Second call with version 1 should not apply migration again
      const result2 = migrate(result1, migrations, 1, {
        lang: 'en',
        cellPlugins: [],
      });
      expect(result2).toEqual({ newValue: 'changed' });
    });

    it('handles migration context correctly', () => {
      let capturedContext: { lang: string; cellPlugins: unknown[] } | null =
        null;
      const migrations = [
        new Migration<{ input: string }, { output: string }>({
          fromVersion: 0,
          toVersion: 1,
          migrate: (d, context) => {
            capturedContext = context;
            return { output: d.input + '-' + context.lang };
          },
        }),
      ];

      const result = migrate<{ output: string }>(
        { input: 'test' },
        migrations,
        0,
        {
          lang: 'de',
          cellPlugins: [],
        }
      );

      expect(capturedContext).not.toBeNull();
      expect(capturedContext?.lang).toBe('de');
      expect(result.output).toBe('test-de');
    });

    it('skips migrations for versions ahead of data', () => {
      const dataIn = { value: 'original' };
      const migrations = [
        new Migration<{ value: string }, { v1: string }>({
          fromVersion: 5,
          toVersion: 6,
          migrate: (d) => ({ v1: d.value + '-v1' }),
        }),
      ];

      // Data is at version 0, migration starts at 5, so it should be skipped
      const result = migrate(dataIn, migrations, 0, {
        lang: 'en',
        cellPlugins: [],
      });

      expect(result).toEqual({ value: 'original' });
    });

    it('handles complex nested data migration', () => {
      type DataIn = {
        items: Array<{ id: number; name: string }>;
        metadata: { count: number; tags: string[] };
      };
      type DataOut = {
        entries: Array<{ identifier: number; label: string }>;
        info: { total: number; categories: string[] };
      };

      const dataIn: DataIn = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        metadata: {
          count: 2,
          tags: ['a', 'b'],
        },
      };

      const migrations = [
        new Migration<DataIn, DataOut>({
          fromVersion: 0,
          toVersion: 1,
          migrate: (d) => ({
            entries: d.items.map((i) => ({
              identifier: i.id,
              label: i.name,
            })),
            info: {
              total: d.metadata.count,
              categories: d.metadata.tags,
            },
          }),
        }),
      ];

      const result = migrate<DataOut>(dataIn, migrations, 0, {
        lang: 'en',
        cellPlugins: [],
      });

      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].identifier).toBe(1);
      expect(result.entries[0].label).toBe('Item 1');
      expect(result.info.total).toBe(2);
      expect(result.info.categories).toEqual(['a', 'b']);
    });

    it('handles migration chain with version gaps', () => {
      const dataIn = { a: 1 };
      const migrations = [
        new Migration<{ a: number }, { b: number }>({
          fromVersion: 0,
          toVersion: 2, // Skip version 1
          migrate: (d) => ({ b: d.a * 2 }),
        }),
        new Migration<{ b: number }, { c: number }>({
          fromVersion: 2,
          toVersion: 5, // Skip versions 3, 4
          migrate: (d) => ({ c: d.b * 3 }),
        }),
      ];

      const result = migrate(dataIn, migrations, 0, {
        lang: 'en',
        cellPlugins: [],
      });

      expect(result).toEqual({ c: 6 }); // 1 * 2 * 3
    });
  });
});
