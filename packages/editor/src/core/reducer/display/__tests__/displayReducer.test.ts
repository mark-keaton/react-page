import { display } from '../index';
import type { Display } from '../../../types/display';
import {
  setMode,
  setZoom,
  setDisplayReferenceNodeId,
  insertMode,
  editMode,
  previewMode,
  layoutMode,
  resizeMode,
  DEFAULT_DISPLAY_MODE,
} from '../../../actions/display';
import { blurAllCells } from '../../../actions/cell';

describe('display reducer', () => {
  describe('initial state', () => {
    it('should return default state when undefined', () => {
      const unknownAction = { type: 'UNKNOWN' };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = display(undefined, unknownAction as any);

      expect(state.mode).toBe(DEFAULT_DISPLAY_MODE);
      expect(state.zoom).toBe(1);
    });
  });

  describe('SET_DISPLAY_MODE action', () => {
    it('should set mode to edit', () => {
      const initialState: Display = { mode: 'preview', zoom: 1 };
      const action = setMode('edit');
      const newState = display(initialState, action);

      expect(newState.mode).toBe('edit');
    });

    it('should set mode to preview', () => {
      const initialState: Display = { mode: 'edit', zoom: 1 };
      const action = setMode('preview');
      const newState = display(initialState, action);

      expect(newState.mode).toBe('preview');
    });

    it('should set mode to layout', () => {
      const initialState: Display = { mode: 'edit', zoom: 1 };
      const action = setMode('layout');
      const newState = display(initialState, action);

      expect(newState.mode).toBe('layout');
    });

    it('should set mode to insert', () => {
      const initialState: Display = { mode: 'edit', zoom: 1 };
      const action = setMode('insert');
      const newState = display(initialState, action);

      expect(newState.mode).toBe('insert');
    });

    it('should set mode to resizing', () => {
      const initialState: Display = { mode: 'edit', zoom: 1 };
      const action = setMode('resizing');
      const newState = display(initialState, action);

      expect(newState.mode).toBe('resizing');
    });

    it('should preserve zoom when changing mode', () => {
      const initialState: Display = { mode: 'edit', zoom: 1.5 };
      const action = setMode('preview');
      const newState = display(initialState, action);

      expect(newState.zoom).toBe(1.5);
    });

    it('should set referenceNodeId when provided', () => {
      const initialState: Display = { mode: 'edit', zoom: 1 };
      const action = setMode('edit', 'node-1');
      const newState = display(initialState, action);

      expect(newState.referenceNodeId).toBe('node-1');
    });

    it('should preserve existing referenceNodeId if not provided in action', () => {
      const initialState: Display = {
        mode: 'edit',
        zoom: 1,
        referenceNodeId: 'existing-node',
      };
      const action = setMode('preview');
      const newState = display(initialState, action);

      expect(newState.referenceNodeId).toBe('existing-node');
    });
  });

  describe('DISPLAY_SET_ZOOM action', () => {
    it('should set zoom level', () => {
      const initialState: Display = { mode: 'edit', zoom: 1 };
      const action = setZoom(1.5);
      const newState = display(initialState, action);

      expect(newState.zoom).toBe(1.5);
    });

    it('should handle zoom less than 1', () => {
      const initialState: Display = { mode: 'edit', zoom: 1 };
      const action = setZoom(0.5);
      const newState = display(initialState, action);

      expect(newState.zoom).toBe(0.5);
    });

    it('should handle zoom greater than 1', () => {
      const initialState: Display = { mode: 'edit', zoom: 1 };
      const action = setZoom(2);
      const newState = display(initialState, action);

      expect(newState.zoom).toBe(2);
    });

    it('should preserve mode when changing zoom', () => {
      const initialState: Display = { mode: 'preview', zoom: 1 };
      const action = setZoom(1.5);
      const newState = display(initialState, action);

      expect(newState.mode).toBe('preview');
    });
  });

  describe('SET_DISPLAY_REFERENCE_NODE_ID action', () => {
    it('should set referenceNodeId', () => {
      const initialState: Display = { mode: 'edit', zoom: 1 };
      const action = setDisplayReferenceNodeId('node-1');
      const newState = display(initialState, action);

      expect(newState.referenceNodeId).toBe('node-1');
    });

    it('should clear referenceNodeId with null', () => {
      const initialState: Display = {
        mode: 'edit',
        zoom: 1,
        referenceNodeId: 'existing',
      };
      const action = setDisplayReferenceNodeId(null);
      const newState = display(initialState, action);

      expect(newState.referenceNodeId).toBeNull();
    });

    it('should preserve mode and zoom', () => {
      const initialState: Display = { mode: 'preview', zoom: 1.5 };
      const action = setDisplayReferenceNodeId('node-1');
      const newState = display(initialState, action);

      expect(newState.mode).toBe('preview');
      expect(newState.zoom).toBe(1.5);
    });
  });

  describe('CELL_BLUR_ALL action', () => {
    it('should clear referenceNodeId on blur all', () => {
      const initialState: Display = {
        mode: 'edit',
        zoom: 1,
        referenceNodeId: 'some-node',
      };
      const action = blurAllCells();
      const newState = display(initialState, action);

      expect(newState.referenceNodeId).toBeNull();
    });

    it('should preserve mode on blur all', () => {
      const initialState: Display = {
        mode: 'preview',
        zoom: 1,
        referenceNodeId: 'some-node',
      };
      const action = blurAllCells();
      const newState = display(initialState, action);

      expect(newState.mode).toBe('preview');
    });

    it('should preserve zoom on blur all', () => {
      const initialState: Display = {
        mode: 'edit',
        zoom: 1.5,
        referenceNodeId: 'some-node',
      };
      const action = blurAllCells();
      const newState = display(initialState, action);

      expect(newState.zoom).toBe(1.5);
    });
  });

  describe('mode helper action creators', () => {
    const initialState: Display = { mode: 'preview', zoom: 1 };

    it('insertMode should set mode to insert', () => {
      const action = insertMode();
      const newState = display(initialState, action);

      expect(newState.mode).toBe('insert');
    });

    it('editMode should set mode to edit', () => {
      const action = editMode();
      const newState = display(initialState, action);

      expect(newState.mode).toBe('edit');
    });

    it('previewMode should set mode to preview', () => {
      const editState: Display = { mode: 'edit', zoom: 1 };
      const action = previewMode();
      const newState = display(editState, action);

      expect(newState.mode).toBe('preview');
    });

    it('layoutMode should set mode to layout', () => {
      const action = layoutMode();
      const newState = display(initialState, action);

      expect(newState.mode).toBe('layout');
    });

    it('resizeMode should set mode to resizing', () => {
      const action = resizeMode();
      const newState = display(initialState, action);

      expect(newState.mode).toBe('resizing');
    });
  });

  describe('unknown actions', () => {
    it('should return current state for unknown action', () => {
      const initialState: Display = {
        mode: 'edit',
        zoom: 1.5,
        referenceNodeId: 'node-1',
      };
      const unknownAction = { type: 'UNKNOWN_ACTION' };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newState = display(initialState, unknownAction as any);

      expect(newState).toEqual(initialState);
    });
  });

  describe('state transitions', () => {
    it('should handle complex state transitions', () => {
      let state: Display = { mode: 'edit', zoom: 1 };

      // Set preview mode
      state = display(state, previewMode());
      expect(state.mode).toBe('preview');

      // Set zoom
      state = display(state, setZoom(1.5));
      expect(state.zoom).toBe(1.5);
      expect(state.mode).toBe('preview');

      // Set reference node
      state = display(state, setDisplayReferenceNodeId('node-1'));
      expect(state.referenceNodeId).toBe('node-1');

      // Back to edit mode
      state = display(state, editMode());
      expect(state.mode).toBe('edit');
      expect(state.zoom).toBe(1.5);
      expect(state.referenceNodeId).toBe('node-1');

      // Blur all
      state = display(state, blurAllCells());
      expect(state.mode).toBe('edit');
      expect(state.referenceNodeId).toBeNull();
    });
  });
});
