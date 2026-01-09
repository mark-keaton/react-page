import { ActionTypes } from 'redux-undo';
import { undo, redo } from '../undo';

describe('Undo Actions', () => {
  describe('undo', () => {
    it('should create UNDO action with correct type', () => {
      const action = undo();

      expect(action.type).toBe(ActionTypes.UNDO);
    });

    it('should return action compatible with redux-undo', () => {
      const action = undo();

      expect(action.type).toBe('@@redux-undo/UNDO');
    });
  });

  describe('redo', () => {
    it('should create REDO action with correct type', () => {
      const action = redo();

      expect(action.type).toBe(ActionTypes.REDO);
    });

    it('should return action compatible with redux-undo', () => {
      const action = redo();

      expect(action.type).toBe('@@redux-undo/REDO');
    });
  });

  describe('redux-undo integration', () => {
    it('should have distinct UNDO and REDO action types', () => {
      const undoAction = undo();
      const redoAction = redo();

      expect(undoAction.type).not.toBe(redoAction.type);
    });
  });
});
