import {
  isPreviewMode,
  isLayoutMode,
  isEditMode,
  isInsertMode,
  isResizeMode,
} from '../display';
import type { RootState } from '../../types/state';
import type { DisplayModes } from '../../actions/display';

const createState = (mode: DisplayModes, zoom = 1): RootState => ({
  reactPage: {
    focus: null,
    hover: null,
    display: { mode, zoom },
    settings: { lang: 'en' },
    values: {
      past: [],
      present: null,
      future: [],
    },
    __nodeCache: {},
  },
});

describe('Display Selectors', () => {
  describe('isPreviewMode', () => {
    it('should return true when mode is preview', () => {
      const state = createState('preview');
      expect(isPreviewMode(state)).toBe(true);
    });

    it('should return false when mode is not preview', () => {
      expect(isPreviewMode(createState('edit'))).toBe(false);
      expect(isPreviewMode(createState('layout'))).toBe(false);
      expect(isPreviewMode(createState('insert'))).toBe(false);
      expect(isPreviewMode(createState('resizing'))).toBe(false);
    });
  });

  describe('isLayoutMode', () => {
    it('should return true when mode is layout', () => {
      const state = createState('layout');
      expect(isLayoutMode(state)).toBe(true);
    });

    it('should return false when mode is not layout', () => {
      expect(isLayoutMode(createState('edit'))).toBe(false);
      expect(isLayoutMode(createState('preview'))).toBe(false);
      expect(isLayoutMode(createState('insert'))).toBe(false);
      expect(isLayoutMode(createState('resizing'))).toBe(false);
    });
  });

  describe('isEditMode', () => {
    it('should return true when mode is edit', () => {
      const state = createState('edit');
      expect(isEditMode(state)).toBe(true);
    });

    it('should return false when mode is not edit', () => {
      expect(isEditMode(createState('preview'))).toBe(false);
      expect(isEditMode(createState('layout'))).toBe(false);
      expect(isEditMode(createState('insert'))).toBe(false);
      expect(isEditMode(createState('resizing'))).toBe(false);
    });
  });

  describe('isInsertMode', () => {
    it('should return true when mode is insert', () => {
      const state = createState('insert');
      expect(isInsertMode(state)).toBe(true);
    });

    it('should return false when mode is not insert', () => {
      expect(isInsertMode(createState('edit'))).toBe(false);
      expect(isInsertMode(createState('preview'))).toBe(false);
      expect(isInsertMode(createState('layout'))).toBe(false);
      expect(isInsertMode(createState('resizing'))).toBe(false);
    });
  });

  describe('isResizeMode', () => {
    it('should return true when mode is resizing', () => {
      const state = createState('resizing');
      expect(isResizeMode(state)).toBe(true);
    });

    it('should return false when mode is not resizing', () => {
      expect(isResizeMode(createState('edit'))).toBe(false);
      expect(isResizeMode(createState('preview'))).toBe(false);
      expect(isResizeMode(createState('layout'))).toBe(false);
      expect(isResizeMode(createState('insert'))).toBe(false);
    });
  });

  describe('mode transitions', () => {
    it('should correctly identify mode after transitions', () => {
      // Simulate mode transitions
      let state = createState('edit');
      expect(isEditMode(state)).toBe(true);

      state = createState('preview');
      expect(isEditMode(state)).toBe(false);
      expect(isPreviewMode(state)).toBe(true);

      state = createState('layout');
      expect(isPreviewMode(state)).toBe(false);
      expect(isLayoutMode(state)).toBe(true);
    });
  });

  describe('all modes are mutually exclusive', () => {
    const modes: DisplayModes[] = ['preview', 'layout', 'edit', 'insert', 'resizing'];
    const selectors = [isPreviewMode, isLayoutMode, isEditMode, isInsertMode, isResizeMode];

    modes.forEach((mode, modeIndex) => {
      it(`should have exactly one selector return true for ${mode} mode`, () => {
        const state = createState(mode);
        const results = selectors.map((selector) => selector(state));
        const trueCount = results.filter(Boolean).length;

        expect(trueCount).toBe(1);
        expect(results[modeIndex]).toBe(true);
      });
    });
  });
});
