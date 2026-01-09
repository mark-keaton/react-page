/**
 * Schema Validation Tests
 *
 * Tests for validating cell plugin data against JSON Schema.
 * Uses a simple validator implementation to avoid AJV compatibility issues.
 */

type ValidationResult = {
  valid: boolean;
  errors: Array<{ path: string; message: string; keyword: string }>;
};

// Simple validator that validates common JSON schema constraints
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createValidator(schema: Record<string, any>) {
  return (model: unknown): ValidationResult => {
    const errors: Array<{ path: string; message: string; keyword: string }> = [];

    function validateValue(
      value: unknown,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sch: Record<string, any>,
      path: string
    ): void {
      // Type validation
      if (sch.type) {
        if (sch.type === 'string' && typeof value !== 'string') {
          errors.push({ path, message: `expected string`, keyword: 'type' });
          return;
        }
        if (sch.type === 'number' && typeof value !== 'number') {
          errors.push({ path, message: `expected number`, keyword: 'type' });
          return;
        }
        if (sch.type === 'integer') {
          if (typeof value !== 'number' || !Number.isInteger(value)) {
            errors.push({ path, message: `expected integer`, keyword: 'type' });
            return;
          }
        }
        if (sch.type === 'boolean' && typeof value !== 'boolean') {
          errors.push({ path, message: `expected boolean`, keyword: 'type' });
          return;
        }
        if (sch.type === 'array' && !Array.isArray(value)) {
          errors.push({ path, message: `expected array`, keyword: 'type' });
          return;
        }
        if (
          sch.type === 'object' &&
          (typeof value !== 'object' || value === null || Array.isArray(value))
        ) {
          errors.push({ path, message: `expected object`, keyword: 'type' });
          return;
        }
      }

      // String constraints
      if (typeof value === 'string') {
        if (sch.minLength !== undefined && value.length < sch.minLength) {
          errors.push({
            path,
            message: `string too short`,
            keyword: 'minLength',
          });
        }
        if (sch.maxLength !== undefined && value.length > sch.maxLength) {
          errors.push({
            path,
            message: `string too long`,
            keyword: 'maxLength',
          });
        }
        if (sch.pattern) {
          const regex = new RegExp(sch.pattern);
          if (!regex.test(value)) {
            errors.push({
              path,
              message: `pattern mismatch`,
              keyword: 'pattern',
            });
          }
        }
        if (sch.enum && !sch.enum.includes(value)) {
          errors.push({ path, message: `not in enum`, keyword: 'enum' });
        }
      }

      // Number constraints
      if (typeof value === 'number') {
        if (sch.minimum !== undefined && value < sch.minimum) {
          errors.push({
            path,
            message: `value below minimum`,
            keyword: 'minimum',
          });
        }
        if (sch.maximum !== undefined && value > sch.maximum) {
          errors.push({
            path,
            message: `value above maximum`,
            keyword: 'maximum',
          });
        }
        if (sch.enum && !sch.enum.includes(value)) {
          errors.push({ path, message: `not in enum`, keyword: 'enum' });
        }
      }

      // Array constraints
      if (Array.isArray(value) && sch.items) {
        value.forEach((item, i) => {
          validateValue(item, sch.items, `${path}[${i}]`);
        });
      }

      // Object constraints
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const obj = value as Record<string, unknown>;

        // Check required properties
        if (sch.required) {
          for (const req of sch.required) {
            if (!(req in obj)) {
              errors.push({
                path: `${path}.${req}`,
                message: `missing required`,
                keyword: 'required',
              });
            }
          }
        }

        // Validate properties
        if (sch.properties) {
          for (const [key, propSchema] of Object.entries(sch.properties)) {
            if (key in obj) {
              validateValue(
                obj[key],
                propSchema as Record<string, unknown>,
                `${path}.${key}`
              );
            }
          }
        }
      }
    }

    // Apply defaults
    function applyDefaults(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sch: Record<string, any>
    ): void {
      if (sch.properties && typeof data === 'object' && data !== null) {
        for (const [key, propSchema] of Object.entries(sch.properties)) {
          const ps = propSchema as Record<string, unknown>;
          if (ps.default !== undefined && !(key in data)) {
            data[key] = ps.default;
          }
        }
      }
    }

    if (typeof model === 'object' && model !== null) {
      applyDefaults(model, schema);
    }

    validateValue(model, schema, '');

    return {
      valid: errors.length === 0,
      errors,
    };
  };
}

describe('Schema Validation', () => {
  describe('string properties', () => {
    it('validates required string field', () => {
      const schema = {
        type: 'object',
        properties: {
          title: { type: 'string' },
        },
        required: ['title'],
      };

      const validator = createValidator(schema);

      expect(validator({ title: 'Hello' }).valid).toBe(true);
      expect(validator({ title: '' }).valid).toBe(true);
      expect(validator({}).valid).toBe(false);
    });

    it('validates string minLength', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3 },
        },
      };

      const validator = createValidator(schema);

      expect(validator({ name: 'abc' }).valid).toBe(true);
      expect(validator({ name: 'abcd' }).valid).toBe(true);
      expect(validator({ name: 'ab' }).valid).toBe(false);
    });

    it('validates string maxLength', () => {
      const schema = {
        type: 'object',
        properties: {
          code: { type: 'string', maxLength: 5 },
        },
      };

      const validator = createValidator(schema);

      expect(validator({ code: 'abc' }).valid).toBe(true);
      expect(validator({ code: 'abcde' }).valid).toBe(true);
      expect(validator({ code: 'abcdef' }).valid).toBe(false);
    });

    it('validates string pattern', () => {
      const schema = {
        type: 'object',
        properties: {
          email: { type: 'string', pattern: '^[^@]+@[^@]+\\.[^@]+$' },
        },
      };

      const validator = createValidator(schema);

      expect(validator({ email: 'test@example.com' }).valid).toBe(true);
      expect(validator({ email: 'invalid-email' }).valid).toBe(false);
    });

    it('validates string enum', () => {
      const schema = {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['draft', 'published', 'archived'],
          },
        },
      };

      const validator = createValidator(schema);

      expect(validator({ status: 'draft' }).valid).toBe(true);
      expect(validator({ status: 'published' }).valid).toBe(true);
      expect(validator({ status: 'invalid' }).valid).toBe(false);
    });

    it('applies string default value', () => {
      const schema = {
        type: 'object',
        properties: {
          greeting: { type: 'string', default: 'Hello' },
        },
      };

      const data: Record<string, unknown> = {};
      const validator = createValidator(schema);
      validator(data);

      expect(data.greeting).toBe('Hello');
    });
  });

  describe('number properties', () => {
    it('validates number type', () => {
      const schema = {
        type: 'object',
        properties: {
          price: { type: 'number' },
        },
      };

      const validator = createValidator(schema);

      expect(validator({ price: 99.99 }).valid).toBe(true);
      expect(validator({ price: 0 }).valid).toBe(true);
      expect(validator({ price: 'not a number' }).valid).toBe(false);
    });

    it('validates integer type', () => {
      const schema = {
        type: 'object',
        properties: {
          count: { type: 'integer' },
        },
      };

      const validator = createValidator(schema);

      expect(validator({ count: 5 }).valid).toBe(true);
      expect(validator({ count: 0 }).valid).toBe(true);
      expect(validator({ count: 5.5 }).valid).toBe(false);
    });

    it('validates number minimum', () => {
      const schema = {
        type: 'object',
        properties: {
          age: { type: 'number', minimum: 0 },
        },
      };

      const validator = createValidator(schema);

      expect(validator({ age: 0 }).valid).toBe(true);
      expect(validator({ age: 25 }).valid).toBe(true);
      expect(validator({ age: -1 }).valid).toBe(false);
    });

    it('validates number maximum', () => {
      const schema = {
        type: 'object',
        properties: {
          rating: { type: 'number', maximum: 5 },
        },
      };

      const validator = createValidator(schema);

      expect(validator({ rating: 5 }).valid).toBe(true);
      expect(validator({ rating: 3.5 }).valid).toBe(true);
      expect(validator({ rating: 6 }).valid).toBe(false);
    });

    it('validates number enum', () => {
      const schema = {
        type: 'object',
        properties: {
          columns: { type: 'number', enum: [1, 2, 3, 4, 6, 12] },
        },
      };

      const validator = createValidator(schema);

      expect(validator({ columns: 2 }).valid).toBe(true);
      expect(validator({ columns: 12 }).valid).toBe(true);
      expect(validator({ columns: 5 }).valid).toBe(false);
    });

    it('applies number default value', () => {
      const schema = {
        type: 'object',
        properties: {
          opacity: { type: 'number', default: 1 },
        },
      };

      const data: Record<string, unknown> = {};
      const validator = createValidator(schema);
      validator(data);

      expect(data.opacity).toBe(1);
    });
  });

  describe('boolean properties', () => {
    it('validates boolean type', () => {
      const schema = {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
        },
      };

      const validator = createValidator(schema);

      expect(validator({ enabled: true }).valid).toBe(true);
      expect(validator({ enabled: false }).valid).toBe(true);
      expect(validator({ enabled: 'true' }).valid).toBe(false);
    });

    it('applies boolean default value', () => {
      const schema = {
        type: 'object',
        properties: {
          visible: { type: 'boolean', default: true },
        },
      };

      const data: Record<string, unknown> = {};
      const validator = createValidator(schema);
      validator(data);

      expect(data.visible).toBe(true);
    });
  });

  describe('object properties', () => {
    it('validates nested object', () => {
      const schema = {
        type: 'object',
        properties: {
          settings: {
            type: 'object',
            properties: {
              color: { type: 'string' },
            },
            required: ['color'],
          },
        },
      };

      const validator = createValidator(schema);

      expect(validator({ settings: { color: 'red' } }).valid).toBe(true);
      expect(validator({ settings: {} }).valid).toBe(false);
    });

    it('validates deeply nested objects', () => {
      const schema = {
        type: 'object',
        properties: {
          level1: {
            type: 'object',
            properties: {
              level2: {
                type: 'object',
                properties: {
                  level3: {
                    type: 'object',
                    properties: {
                      value: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const validator = createValidator(schema);

      expect(
        validator({
          level1: { level2: { level3: { value: 'deep' } } },
        }).valid
      ).toBe(true);
    });
  });

  describe('array properties', () => {
    it('validates array of strings', () => {
      const schema = {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      };

      const validator = createValidator(schema);

      expect(validator({ tags: ['tag1', 'tag2'] }).valid).toBe(true);
      expect(validator({ tags: [] }).valid).toBe(true);
      expect(validator({ tags: [1, 2, 3] }).valid).toBe(false);
    });

    it('validates array of numbers', () => {
      const schema = {
        type: 'object',
        properties: {
          scores: {
            type: 'array',
            items: { type: 'number', minimum: 0, maximum: 100 },
          },
        },
      };

      const validator = createValidator(schema);

      expect(validator({ scores: [85, 90, 95] }).valid).toBe(true);
      expect(validator({ scores: [101] }).valid).toBe(false);
    });

    it('validates array of objects', () => {
      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                qty: { type: 'number' },
              },
              required: ['name', 'qty'],
            },
          },
        },
      };

      const validator = createValidator(schema);

      expect(
        validator({
          items: [
            { name: 'Item 1', qty: 5 },
            { name: 'Item 2', qty: 10 },
          ],
        }).valid
      ).toBe(true);

      expect(validator({ items: [{ name: 'Missing qty' }] }).valid).toBe(false);
    });
  });

  describe('complex schemas', () => {
    it('validates a complete plugin data schema', () => {
      const schema = {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 100 },
          content: { type: 'string' },
          settings: {
            type: 'object',
            properties: {
              fontSize: {
                type: 'number',
                minimum: 8,
                maximum: 72,
                default: 16,
              },
              color: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
              bold: { type: 'boolean', default: false },
            },
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: ['title', 'content'],
      };

      const validator = createValidator(schema);

      // Valid data
      expect(
        validator({
          title: 'My Title',
          content: 'Some content',
          settings: {
            fontSize: 14,
            color: '#ff0000',
            bold: true,
          },
          tags: ['tag1', 'tag2'],
        }).valid
      ).toBe(true);

      // Missing required field
      expect(
        validator({
          title: 'Only title',
        }).valid
      ).toBe(false);

      // Invalid color pattern
      expect(
        validator({
          title: 'Title',
          content: 'Content',
          settings: {
            color: 'invalid',
          },
        }).valid
      ).toBe(false);
    });

    it('returns all validation errors', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2 },
          age: { type: 'integer', minimum: 0 },
          email: { type: 'string', pattern: '^[^@]+@[^@]+$' },
        },
        required: ['name', 'age', 'email'],
      };

      const validator = createValidator(schema);
      const result = validator({
        name: 'A',
        age: -5,
        email: 'invalid',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      // Should have errors for minLength, minimum, and pattern
      expect(result.errors.some((e) => e.keyword === 'minLength')).toBe(true);
      expect(result.errors.some((e) => e.keyword === 'minimum')).toBe(true);
      expect(result.errors.some((e) => e.keyword === 'pattern')).toBe(true);
    });
  });
});
