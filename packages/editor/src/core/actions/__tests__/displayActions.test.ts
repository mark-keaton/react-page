import {
  SET_DISPLAY_MODE,
  SET_DISPLAY_REFERENCE_NODE_ID,
  DISPLAY_SET_ZOOM,
  DISPLAY_MODE_PREVIEW,
  DISPLAY_MODE_LAYOUT,
  DISPLAY_MODE_EDIT,
  DISPLAY_MODE_INSERT,
  DISPLAY_MODE_RESIZING,
  setMode,
  setDisplayReferenceNodeId,
  insertMode,
  editMode,
  previewMode,
  layoutMode,
  resizeMode,
  setZoom,
} from '../display';

describe('Display Actions', () => {
  describe('setMode', () => {
    it('should create SET_DISPLAY_MODE action with correct shape', () => {
      const action = setMode('edit');

      expect(action.type).toBe(SET_DISPLAY_MODE);
      expect(action.mode).toBe('edit');
      expect(action.ts).toBeInstanceOf(Date);
    });

    it('should support referenceNodeId', () => {
      const action = setMode('edit', 'node-1');

      expect(action.referenceNodeId).toBe('node-1');
    });

    it('should handle preview mode', () => {
      const action = setMode(DISPLAY_MODE_PREVIEW);

      expect(action.mode).toBe('preview');
    });

    it('should handle layout mode', () => {
      const action = setMode(DISPLAY_MODE_LAYOUT);

      expect(action.mode).toBe('layout');
    });

    it('should handle edit mode', () => {
      const action = setMode(DISPLAY_MODE_EDIT);

      expect(action.mode).toBe('edit');
    });

    it('should handle insert mode', () => {
      const action = setMode(DISPLAY_MODE_INSERT);

      expect(action.mode).toBe('insert');
    });

    it('should handle resizing mode', () => {
      const action = setMode(DISPLAY_MODE_RESIZING);

      expect(action.mode).toBe('resizing');
    });
  });

  describe('setDisplayReferenceNodeId', () => {
    it('should create SET_DISPLAY_REFERENCE_NODE_ID action with correct shape', () => {
      const action = setDisplayReferenceNodeId('node-1');

      expect(action.type).toBe(SET_DISPLAY_REFERENCE_NODE_ID);
      expect(action.referenceNodeId).toBe('node-1');
      expect(action.ts).toBeInstanceOf(Date);
    });

    it('should handle null referenceNodeId', () => {
      const action = setDisplayReferenceNodeId(null);

      expect(action.referenceNodeId).toBeNull();
    });

    it('should handle undefined referenceNodeId', () => {
      const action = setDisplayReferenceNodeId();

      expect(action.referenceNodeId).toBeUndefined();
    });
  });

  describe('insertMode', () => {
    it('should create action for insert mode', () => {
      const action = insertMode();

      expect(action.type).toBe(SET_DISPLAY_MODE);
      expect(action.mode).toBe(DISPLAY_MODE_INSERT);
    });
  });

  describe('editMode', () => {
    it('should create action for edit mode', () => {
      const action = editMode();

      expect(action.type).toBe(SET_DISPLAY_MODE);
      expect(action.mode).toBe(DISPLAY_MODE_EDIT);
    });
  });

  describe('previewMode', () => {
    it('should create action for preview mode', () => {
      const action = previewMode();

      expect(action.type).toBe(SET_DISPLAY_MODE);
      expect(action.mode).toBe(DISPLAY_MODE_PREVIEW);
    });
  });

  describe('layoutMode', () => {
    it('should create action for layout mode', () => {
      const action = layoutMode();

      expect(action.type).toBe(SET_DISPLAY_MODE);
      expect(action.mode).toBe(DISPLAY_MODE_LAYOUT);
    });
  });

  describe('resizeMode', () => {
    it('should create action for resize mode', () => {
      const action = resizeMode();

      expect(action.type).toBe(SET_DISPLAY_MODE);
      expect(action.mode).toBe(DISPLAY_MODE_RESIZING);
    });
  });

  describe('setZoom', () => {
    it('should create DISPLAY_SET_ZOOM action with correct shape', () => {
      const action = setZoom(1.5);

      expect(action.type).toBe(DISPLAY_SET_ZOOM);
      expect(action.zoom).toBe(1.5);
    });

    it('should handle zoom level 1', () => {
      const action = setZoom(1);

      expect(action.zoom).toBe(1);
    });

    it('should handle zoom level less than 1', () => {
      const action = setZoom(0.5);

      expect(action.zoom).toBe(0.5);
    });

    it('should handle zoom level greater than 1', () => {
      const action = setZoom(2);

      expect(action.zoom).toBe(2);
    });

    it('should handle decimal zoom values', () => {
      const action = setZoom(1.25);

      expect(action.zoom).toBe(1.25);
    });
  });

  describe('action type constants', () => {
    it('should have correct SET_DISPLAY_MODE constant', () => {
      expect(SET_DISPLAY_MODE).toBe('SET_DISPLAY_MODE');
    });

    it('should have correct SET_DISPLAY_REFERENCE_NODE_ID constant', () => {
      expect(SET_DISPLAY_REFERENCE_NODE_ID).toBe(
        'SET_DISPLAY_REFERENCE_NODE_ID'
      );
    });

    it('should have correct DISPLAY_SET_ZOOM constant', () => {
      expect(DISPLAY_SET_ZOOM).toBe('DISPLAY_SET_ZOOM');
    });
  });

  describe('display mode constants', () => {
    it('should have correct DISPLAY_MODE_PREVIEW constant', () => {
      expect(DISPLAY_MODE_PREVIEW).toBe('preview');
    });

    it('should have correct DISPLAY_MODE_LAYOUT constant', () => {
      expect(DISPLAY_MODE_LAYOUT).toBe('layout');
    });

    it('should have correct DISPLAY_MODE_EDIT constant', () => {
      expect(DISPLAY_MODE_EDIT).toBe('edit');
    });

    it('should have correct DISPLAY_MODE_INSERT constant', () => {
      expect(DISPLAY_MODE_INSERT).toBe('insert');
    });

    it('should have correct DISPLAY_MODE_RESIZING constant', () => {
      expect(DISPLAY_MODE_RESIZING).toBe('resizing');
    });
  });
});
