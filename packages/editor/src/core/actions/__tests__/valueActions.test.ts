import { UPDATE_VALUE, updateValue } from '../value';
import type { Value } from '../../types/node';

describe('Value Actions', () => {
  describe('updateValue', () => {
    it('should create UPDATE_VALUE action with correct shape', () => {
      const value: Value = {
        id: 'test-value',
        version: 1,
        rows: [],
      };
      const action = updateValue(value);

      expect(action.type).toBe(UPDATE_VALUE);
      expect(action.value).toEqual(value);
      expect(action.ts).toBeInstanceOf(Date);
      expect(action.ids).toBeDefined();
    });

    it('should handle null value', () => {
      const action = updateValue(null);

      expect(action.type).toBe(UPDATE_VALUE);
      expect(action.value).toBeNull();
    });

    it('should generate unique ids for each call', () => {
      const action1 = updateValue(null);
      const action2 = updateValue(null);

      expect(action1.ids).not.toEqual(action2.ids);
    });

    it('should include ids with all required fields', () => {
      const action = updateValue(null);

      expect(action.ids).toHaveProperty('cell');
      expect(action.ids).toHaveProperty('item');
      expect(action.ids).toHaveProperty('others');
    });

    it('should preserve complex value structure', () => {
      const value: Value = {
        id: 'test-value',
        version: 1,
        rows: [
          {
            id: 'row-1',
            cells: [
              {
                id: 'cell-1',
                size: 12,
                plugin: { id: 'test-plugin', version: 1 },
                dataI18n: {
                  en: { content: 'test' },
                },
                rows: [],
              },
            ],
          },
        ],
      };
      const action = updateValue(value);

      expect(action.value).toEqual(value);
      expect(action.value?.rows[0].cells[0].dataI18n?.en).toEqual({
        content: 'test',
      });
    });
  });

  describe('UPDATE_VALUE constant', () => {
    it('should have correct value', () => {
      expect(UPDATE_VALUE).toBe('UPDATE_VALUE');
    });
  });
});
